import OpenAI, { toFile } from "openai";

export const runtime = "nodejs";
// 이미지 생성은 최대 몇 십 초 걸릴 수 있어 여유를 둔다.
export const maxDuration = 120;

// ── 남용 방지 ────────────────────────────────────────────────────
// 이미지 생성은 장당 비용이 크므로 분석 API보다 더 타이트하게 잠근다.
const MAX_IMAGE_CHARS = 14_000_000; // base64 기준 약 10MB
const RATE_LIMIT = 4; // IP당 허용 요청 수
const RATE_WINDOW_MS = 60_000;
const hits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE_LIMIT;
}

// ── 옵션 어휘 → 프롬프트 (spike의 prompts.mjs와 동일 개념) ─────────
const COLOR_TONES: Record<string, string> = {
  Navy: "deep navy blue tones, dark professional blues",
  Blue: "clean corporate blue tones, sky-to-azure gradients",
  Black: "rich near-black tones with subtle charcoal gradients",
  White: "bright airy white and light gray tones, high-key",
  Gold: "elegant champagne gold and warm bronze accents over dark base",
  Green: "sophisticated deep emerald and forest green tones",
  Gray: "neutral graphite and silver-gray tones",
};

const MOODS: Record<string, string> = {
  Premium: "premium, high-end, refined and expensive-looking",
  Corporate: "clean corporate, trustworthy, business-report appropriate",
  Luxury: "luxurious, opulent, glossy and glamorous",
  Modern: "modern, contemporary, sleek and current",
  Minimal: "minimalist, restrained, lots of clean negative space",
  Dark: "dark, dramatic, moody with deep shadows",
};

const DENSITIES: Record<string, string> = {
  Simple: "very simple composition, generous empty space, uncluttered, calm",
  Balanced: "balanced composition suitable for a real business report cover",
  Dramatic:
    "dramatic composition with light rays, gradients, layered depth and premium lighting effects",
};

const SAFE_AREAS: Record<string, string> = {
  left: "Reserve the LEFT ~40% as clean, open gradient space free of buildings and decorations, for a title added later. Shift the building rendering toward the right/bottom.",
  center:
    "Reserve a clean, open gradient band across the CENTER, free of buildings and busy decorations, for a title added later.",
  right:
    "Reserve the RIGHT ~40% as clean, open gradient space free of buildings and decorations, for a title added later. Shift the building rendering toward the left/bottom.",
  bottom:
    "Keep the building rendering as a strip in the lower portion and reserve the space just above it as clean, open gradient area for a title added later.",
  full: "Use the full frame as a balanced composition; no specific reserved title area.",
};

// 건물 배치 위치.
const PLACEMENTS: Record<string, string> = {
  "bottom-left": "Position the building rendering anchored in the LOWER-LEFT of the frame.",
  "bottom-center": "Position the building rendering centered along the LOWER part of the frame.",
  "bottom-right": "Position the building rendering anchored in the LOWER-RIGHT of the frame.",
  "bottom-wide": "Position the building rendering as a wide panoramic strip spanning the full LOWER part of the frame.",
};

// 건물 크기(프레임에서 차지하는 비중).
const SCALES: Record<string, string> = {
  small: "Render the building relatively small, occupying roughly the lower quarter of the frame, leaving lots of open sky.",
  medium: "Render the building at a moderate size, occupying roughly the lower third of the frame.",
  large: "Render the building large and prominent, occupying up to the lower half of the frame.",
};

// 그라데이션 방향/스타일.
const GRADIENTS: Record<string, string> = {
  "top-dark": "Make the gradient darkest at the TOP and gradually lighter toward the building.",
  "bottom-dark": "Make the gradient lightest at the TOP and gradually deeper toward the BOTTOM.",
  diagonal: "Make the gradient sweep diagonally from a deeper upper corner to a lighter opposite corner.",
  radial: "Use a soft radial gradient with a gentle bright glow behind the building, deepening toward the edges.",
};

// gpt-image-1 지원 크기 중 목표 비율에 가장 가까운 것.
const RATIO_SIZE: Record<string, "1536x1024" | "1024x1536"> = {
  "a4-landscape": "1536x1024",
  "16:9": "1536x1024",
  "a4-portrait": "1024x1536",
};

const NO_TEXT_CLAUSE =
  "ABSOLUTELY NO text of any kind: no words, no letters, no Korean characters, no English words, no gibberish text, no captions, no labels, no numbers, no dates. NO logos, NO watermarks, NO signatures, NO signage, NO UI elements, NO typography whatsoever. The image must be a pure clean background only.";

function buildPrompt(o: {
  colorTone: string;
  mood: string;
  density: string;
  safeArea: string;
  placement: string;
  scale: string;
  gradient: string;
}): string {
  return [
    "Create a clean, modern background for the COVER of a Korean real-estate proposal/report, in a polished corporate brochure style.",
    "CRITICAL: keep the provided architectural rendering SHARP, crisp, photorealistic and highly detailed. Do NOT blur, fog, haze, soften, repaint, or turn it into an abstract/painterly image. Preserve its real structures and materials exactly.",
    `Composition: ${PLACEMENTS[o.placement]} ${SCALES[o.scale]} Keep it sharp and sitting naturally on its ground/water line.`,
    `Fill the remaining open space with a smooth clean gradient in ${COLOR_TONES[o.colorTone]}, as generous negative space. ${GRADIENTS[o.gradient]}`,
    "Add refined, minimal corporate design accents: a few thin elegant curved arc/ribbon lines sweeping through one upper corner, a faint halftone dot pattern in one corner, and delicate flowing wave/mesh lines near a lower corner. Keep these decorations subtle, tasteful and clearly secondary to the building.",
    `Overall mood: ${MOODS[o.mood]}.`,
    `Composition density: ${DENSITIES[o.density]}.`,
    SAFE_AREAS[o.safeArea],
    NO_TEXT_CLAUSE,
    "The result must look like a professionally designed report cover (like a corporate brochure), NOT a photo filter or a foggy dream. Usable as-is behind a title added later in PowerPoint.",
  ].join(" ");
}

export async function POST(req: Request) {
  try {
    // ── 출처 체크 ──
    const host = req.headers.get("host");
    const origin = req.headers.get("origin");
    if (origin && host) {
      try {
        if (new URL(origin).host !== host) {
          return Response.json({ error: "허용되지 않은 요청입니다." }, { status: 403 });
        }
      } catch {
        /* origin 헤더가 깨진 경우는 통과시키되 아래에서 걸러진다. */
      }
    }

    // ── rate limit ──
    const ip =
      (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
    if (isRateLimited(ip)) {
      return Response.json(
        { error: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const {
      imageBase64,
      colorTone,
      mood,
      density,
      safeArea,
      ratio,
      // 배치 조절 옵션(없으면 기본값).
      placement = "bottom-center",
      scale = "medium",
      gradient = "top-dark",
    } = body ?? {};

    // ── 입력 검증 ──
    if (!imageBase64 || typeof imageBase64 !== "string" || !imageBase64.startsWith("data:image/")) {
      return Response.json({ error: "이미지가 없거나 형식이 올바르지 않습니다." }, { status: 400 });
    }
    if (imageBase64.length > MAX_IMAGE_CHARS) {
      return Response.json(
        { error: "이미지 용량이 너무 큽니다. 더 작은 사진을 사용해 주세요." },
        { status: 413 }
      );
    }
    if (
      !COLOR_TONES[colorTone] ||
      !MOODS[mood] ||
      !DENSITIES[density] ||
      !SAFE_AREAS[safeArea] ||
      !PLACEMENTS[placement] ||
      !SCALES[scale] ||
      !GRADIENTS[gradient]
    ) {
      return Response.json({ error: "선택 옵션이 올바르지 않습니다." }, { status: 400 });
    }
    const size = RATIO_SIZE[ratio] ?? "1536x1024";

    // ── data URL → 파일 ──
    const comma = imageBase64.indexOf(",");
    const meta = imageBase64.slice(5, comma); // e.g. "image/png;base64"
    const mime = meta.split(";")[0] || "image/png";
    const ext = mime.split("/")[1] || "png";
    const buf = Buffer.from(imageBase64.slice(comma + 1), "base64");
    const file = await toFile(buf, `upload.${ext}`, { type: mime });

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // gpt-image-1 edits: 업로드 이미지를 조건으로 새 배경을 생성한다.
    const res = await client.images.edit({
      model: "gpt-image-1",
      image: file,
      prompt: buildPrompt({ colorTone, mood, density, safeArea, placement, scale, gradient }),
      size,
      quality: "medium",
      n: 1,
    });

    const b64 = res.data?.[0]?.b64_json;
    if (!b64) {
      return Response.json({ error: "이미지를 받지 못했습니다." }, { status: 502 });
    }

    return Response.json({ imageBase64: `data:image/png;base64,${b64}` });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "생성 중 오류가 발생했습니다." }, { status: 500 });
  }
}
