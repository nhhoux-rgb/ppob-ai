export const runtime = "nodejs";
// 이미지 생성은 최대 몇 십 초 걸릴 수 있어 여유를 둔다.
export const maxDuration = 120;

// ── 남용 방지 ────────────────────────────────────────────────────
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

// Gemini 이미지 모델(나노 바나나). OpenAI식 조직 인증이 필요 없다.
const GEMINI_MODEL = "gemini-2.5-flash-image";

// 목표 비율 → Gemini aspectRatio.
const RATIO_ASPECT: Record<string, string> = {
  "a4-landscape": "3:2", // A4 가로(1.41:1)에 가장 가까움
  "16:9": "16:9",
  "a4-portrait": "3:4", // A4 세로(0.71:1)에 가장 가까움
};

const NO_TEXT_CLAUSE =
  "ABSOLUTELY NO text of any kind: no words, no letters, no Korean characters, no English words, no gibberish text, no captions, no labels, no numbers, no dates. NO logos, NO watermarks, NO signatures, NO signage, NO UI elements, NO typography whatsoever. The image must be a pure clean background only.";

const MAX_USER_PROMPT = 600;

// 사용자는 사진만 넣으면 되고, 원하면 자유 텍스트로 느낌을 지시한다.
function buildPrompt(userPrompt: string): string {
  const base = [
    "Using the attached architectural rendering as the reference for the building, DESIGN a premium real-estate report COVER background — a polished PowerPoint title-slide background.",
    "Keep the building from the reference recognizable and realistic, then compose a finished cover around it like a professional graphic designer: an elegant background scene or smooth gradient, depth and lighting, and tasteful modern styling.",
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
    const { imageBase64, ratio, userPrompt } = body ?? {};
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

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // 진단: OPENAI 키는 이미 설정돼 있으므로, 그건 보이는데 GEMINI만 안 보이면
      // → GEMINI 키가 ppob-ai 프로젝트의 Preview 환경에 없거나 이름이 틀린 것.
      const openaiSeen = process.env.OPENAI_API_KEY ? "present" : "absent";
      return Response.json(
        {
          error: `GEMINI_API_KEY 미설정 (진단: GEMINI=absent, OPENAI=${openaiSeen}). ppob-ai 프로젝트의 Preview 환경변수를 확인하세요.`,
        },
        { status: 500 }
      );
    }

    const aspectRatio = RATIO_ASPECT[ratio] ?? "3:2";

    // data URL → mime + base64
    const comma = imageBase64.indexOf(",");
    const meta = imageBase64.slice(5, comma); // e.g. "image/png;base64"
    const mimeType = meta.split(";")[0] || "image/png";
    const data = imageBase64.slice(comma + 1);

    // Gemini generateContent: 텍스트 프롬프트 + 참조 이미지를 주고 새 이미지를 생성한다.
    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: buildPrompt(cleanPrompt) }, { inlineData: { mimeType, data } }],
        },
      ],
      generationConfig: {
        responseModalities: ["IMAGE"],
        imageConfig: { aspectRatio },
      },
    };

    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify(payload),
      }
    );

    const json = await r.json();
    if (!r.ok) {
      throw new Error(json?.error?.message || `Gemini ${r.status}`);
    }

    const parts = json?.candidates?.[0]?.content?.parts ?? [];
    const imgPart = parts.find(
      (p: { inlineData?: { data?: string } }) => p?.inlineData?.data
    );
    const outB64: string | undefined = imgPart?.inlineData?.data;
    if (!outB64) {
      throw new Error("Gemini 응답에 이미지가 없습니다.");
    }

    return Response.json({ imageBase64: `data:image/png;base64,${outB64}` });
  } catch (error) {
    console.error(error);
    // 디버그용: 실제 오류 메시지를 노출한다(테스트 랩 한정).
    const msg =
      error instanceof Error ? error.message : typeof error === "string" ? error : "unknown";
    return Response.json({ error: `생성 오류: ${String(msg).slice(0, 300)}` }, { status: 500 });
  }
}
