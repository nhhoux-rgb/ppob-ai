import OpenAI from "openai";

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

// gpt-image 지원 크기 중 목표 비율에 가장 가까운 것.
const RATIO_SIZE: Record<string, "1536x1024" | "1024x1536"> = {
  "a4-landscape": "1536x1024",
  "16:9": "1536x1024",
  "a4-portrait": "1024x1536",
};

const NO_TEXT_CLAUSE =
  "ABSOLUTELY NO text of any kind: no words, no letters, no Korean characters, no English words, no gibberish text, no captions, no labels, no numbers, no dates. NO logos, NO watermarks, NO signatures, NO signage, NO UI elements, NO typography whatsoever. The image must be a pure clean background only.";

const MAX_USER_PROMPT = 600;

// 사용자는 사진만 넣으면 되고, 원하면 자유 텍스트로 느낌을 지시한다.
// 고정 제약(선명·무텍스트·표지용)은 항상 유지하고, 사용자 문구는 추가 지시로 덧붙인다.
function buildPrompt(userPrompt: string): string {
  const base = [
    "Using the attached architectural rendering as the reference for the building, DESIGN a premium real-estate report COVER background — a polished PowerPoint title-slide background.",
    "Recreate the building from the reference faithfully and realistically, then compose a finished cover around it like a professional graphic designer: an elegant background scene or smooth gradient, depth and lighting, and tasteful modern styling.",
    "Place the building as part of a designed layout (typically toward one side or the lower area), and keep a clean, uncluttered area as generous open space for a title to be added later.",
    "The overall result should look like a high-end proposal/brochure cover — modern, elegant and intentionally composed edge to edge — not a plain photo and not an empty faded image.",
    "By default use a clean, bright, refined professional color scheme, unless the user's request below asks for something different.",
  ];
  if (userPrompt) {
    base.push(
      `User's requested look/feel (follow it, but never add any text, letters or logos): ${userPrompt}`
    );
  }
  base.push(NO_TEXT_CLAUSE);
  base.push(
    "Absolutely no text, letters, numbers, captions or logos anywhere in the image — it is a pure background that the user will add their own title to."
  );
  return base.join(" ");
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
    const { imageBase64, ratio, quality = "high", userPrompt } = body ?? {};
    const QUALITIES = ["low", "medium", "high"] as const;
    const q = (QUALITIES as readonly string[]).includes(quality) ? quality : "high";
    const cleanPrompt =
      typeof userPrompt === "string" ? userPrompt.trim().slice(0, MAX_USER_PROMPT) : "";

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
    const size = RATIO_SIZE[ratio] ?? "1536x1024";

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // ChatGPT와 동일한 generative 방식:
    // 업로드 이미지를 "참조"로 주고, image_generation 도구로 표지를 새로 구성해 생성한다.
    // (기존 images.edit는 원본을 페이드/리컬러만 해서 표지 레이아웃을 못 만들었다.)
    const response = await client.responses.create({
      model: "gpt-4.1",
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: buildPrompt(cleanPrompt) },
            { type: "input_image", image_url: imageBase64, detail: "high" },
          ],
        },
      ],
      tools: [
        {
          type: "image_generation",
          model: "gpt-image-1.5",
          quality: q,
          size,
          input_fidelity: "high", // 참조 건물을 알아볼 수 있게 반영
        },
      ],
      tool_choice: { type: "image_generation" },
    });

    const imgCall = response.output.find((o) => o.type === "image_generation_call");
    const b64 = imgCall && "result" in imgCall ? imgCall.result : null;
    if (!b64) {
      return Response.json({ error: "이미지를 받지 못했습니다." }, { status: 502 });
    }

    return Response.json({ imageBase64: `data:image/png;base64,${b64}` });
  } catch (error) {
    console.error(error);
    // 디버그용: 실제 오류 메시지를 노출한다(테스트 랩 한정).
    const msg =
      error instanceof Error ? error.message : typeof error === "string" ? error : "unknown";
    return Response.json(
      { error: `생성 오류: ${String(msg).slice(0, 300)}` },
      { status: 500 }
    );
  }
}
