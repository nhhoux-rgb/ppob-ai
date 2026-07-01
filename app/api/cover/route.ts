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
  left: "Keep the LEFT 40% of the image visually calm and slightly darkened with a smooth gradient, as empty space reserved for a title added later. Push visual interest to the right side.",
  center:
    "Keep the CENTER of the image visually calm with a soft darkened gradient/vignette, as empty space reserved for a title added later.",
  right:
    "Keep the RIGHT 40% of the image visually calm and slightly darkened with a smooth gradient, as empty space reserved for a title added later. Push visual interest to the left side.",
  bottom:
    "Keep the BOTTOM third of the image visually calm with a smooth darkened gradient, as empty space reserved for a title added later.",
  full: "Use the full frame as a balanced composition; no specific reserved title area.",
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
}): string {
  return [
    "Transform the provided aerial/bird's-eye architectural rendering into a polished, abstract background image for the COVER of a professional real-estate report.",
    "Treat the uploaded rendering as the base subject: keep its overall layout and structures recognizable, but stylize it into an elegant, atmospheric cover backdrop (not a literal photo).",
    `Color palette: ${COLOR_TONES[o.colorTone]}.`,
    `Overall mood: ${MOODS[o.mood]}.`,
    `Composition density: ${DENSITIES[o.density]}.`,
    SAFE_AREAS[o.safeArea],
    NO_TEXT_CLAUSE,
    "Output must be usable as-is behind a title that the user will add later in PowerPoint.",
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
    const { imageBase64, colorTone, mood, density, safeArea, ratio } = body ?? {};

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
    if (!COLOR_TONES[colorTone] || !MOODS[mood] || !DENSITIES[density] || !SAFE_AREAS[safeArea]) {
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
      prompt: buildPrompt({ colorTone, mood, density, safeArea }),
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
