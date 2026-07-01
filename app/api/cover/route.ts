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

// 건물 배치 위치 (사용자가 고르는 유일한 구도 옵션).
const PLACEMENTS: Record<string, string> = {
  "bottom-left": "Place the building rendering toward the LOWER-LEFT.",
  "bottom-center": "Place the building rendering centered in the LOWER part.",
  "bottom-right": "Place the building rendering toward the LOWER-RIGHT.",
  "bottom-wide": "Place the building rendering as a wide panorama across the LOWER part.",
};

// gpt-image-1 지원 크기 중 목표 비율에 가장 가까운 것.
const RATIO_SIZE: Record<string, "1536x1024" | "1024x1536"> = {
  "a4-landscape": "1536x1024",
  "16:9": "1536x1024",
  "a4-portrait": "1024x1536",
};

const NO_TEXT_CLAUSE =
  "ABSOLUTELY NO text of any kind: no words, no letters, no Korean characters, no English words, no gibberish text, no captions, no labels, no numbers, no dates. NO logos, NO watermarks, NO signatures, NO signage, NO UI elements, NO typography whatsoever. The image must be a pure clean background only.";

function buildPrompt(o: { colorTone: string; placement: string }): string {
  return [
    "Design a COMPLETE, fully finished COVER background for a premium Korean real-estate proposal/report — magazine/brochure-cover quality, intentionally composed edge to edge.",
    "CRITICAL: keep the provided architectural rendering SHARP, crisp, photorealistic and highly detailed; preserve its real structures and materials. Do NOT blur, fog, soften, or repaint it.",
    "IMPORTANT: remove any signage, banners, billboards, screens or text that appear on or around the buildings — all surfaces must be clean and blank.",
    `${PLACEMENTS[o.placement]} Integrate the building naturally into the scene, grounded on its base/ground line — it must NOT look like a small cut-out floating in empty space.`,
    `Refined color scheme based on ${COLOR_TONES[o.colorTone]}.`,
    "Fully design the rest of the frame like a professional graphic designer would: rich layered gradients, soft depth and lighting/glow, and tasteful modern graphic accents (flowing lines, subtle geometric patterns, delicate light particles). Do NOT leave large flat empty dead areas — the whole cover should feel deliberately designed — while still keeping one calmer, uncluttered region with open space for a title to be added later.",
    NO_TEXT_CLAUSE,
    "The result must look like a polished, premium report cover made by a professional designer — not a plain recolor and not a photo filter.",
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
      ratio,
      placement = "bottom-center",
      quality = "high",
    } = body ?? {};
    const QUALITIES = ["low", "medium", "high"] as const;
    const q = (QUALITIES as readonly string[]).includes(quality) ? quality : "high";

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
    if (!COLOR_TONES[colorTone] || !PLACEMENTS[placement]) {
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
      prompt: buildPrompt({ colorTone, placement }),
      size,
      quality: q,
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
