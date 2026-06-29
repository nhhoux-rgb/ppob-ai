import OpenAI from "openai";

export const runtime = "nodejs";

// ── 남용 방지 설정 (analyze와 동일 패턴) ─────────────────────────
const MAX_IMAGE_CHARS = 10_000_000; // base64 기준 약 7MB
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;

const hits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE_LIMIT;
}

// ── 응답 형식(Structured Outputs) ────────────────────────────────
const RESULT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    item: { type: "string" },
    priceMin: { type: "integer" },
    priceMax: { type: "integer" },
    priceEstimate: { type: "integer" },
    confidence: { type: "string", enum: ["high", "medium", "low"] },
    reason: { type: "string" },
    note: { type: "string" },
  },
  required: [
    "item",
    "priceMin",
    "priceMax",
    "priceEstimate",
    "confidence",
    "reason",
    "note",
  ],
} as const;

const PROMPT = `
너는 인형뽑기 인형·굿즈의 한국 소매가를 추정하는 전문가야.
사진 속 인형(또는 굿즈)을 보고 한국 시장 기준 "대략적인" 소매가를 원(KRW)으로 추정해줘.

먼저 "item"에 무엇인지 적어 (캐릭터/브랜드/종류/대략 크기 등).
"reason"에는 가격을 그렇게 본 근거를 간단히 적어.

가격은 범위로 제시해:
- priceMin: 합리적인 최저 소매가(원)
- priceMax: 합리적인 최고 소매가(원)
- priceEstimate: 대표값(원, priceMin~priceMax 사이)
- confidence: 유명 IP/브랜드라 특정이 쉬우면 "high", 일반적이면 "medium", 무명/불명확하면 "low"

규칙:
- 한국 시장 기준(다이소, 문구점, 온라인 마켓 등)의 일반 소매가로 추정해.
- 정품 캐릭터 인형이면 그 점을 반영하고, 무명 봉제인형이면 크기·품질로 추정해.
- 사진만으로는 정확한 가격을 알 수 없으니 무리하게 단정하지 마. 불확실하면 confidence를 "low"로.
- 가격은 원 단위 정수로. (예: 5000)
- "note"에는 참고 사항을 한 줄로 (예: 정품 가정 / 사이즈 추정 / 중고 시세 등). 없으면 빈 문자열.
`;

export async function POST(req: Request) {
  try {
    // ── 출처(Origin) 체크 ──
    const host = req.headers.get("host");
    const origin = req.headers.get("origin");
    if (origin && host) {
      try {
        if (new URL(origin).host !== host) {
          return Response.json(
            { error: "허용되지 않은 요청입니다." },
            { status: 403 }
          );
        }
      } catch {
        // 깨진 origin은 통과시키되 아래에서 걸러짐
      }
    }

    // ── rate limit ──
    const ip =
      (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() ||
      "unknown";
    if (isRateLimited(ip)) {
      return Response.json(
        { error: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." },
        { status: 429 }
      );
    }

    const { imageBase64 } = await req.json();

    // ── 입력 검증 ──
    if (!imageBase64 || typeof imageBase64 !== "string") {
      return Response.json({ error: "이미지가 없습니다." }, { status: 400 });
    }
    if (!imageBase64.startsWith("data:image/")) {
      return Response.json(
        { error: "이미지 형식이 올바르지 않습니다." },
        { status: 400 }
      );
    }
    if (imageBase64.length > MAX_IMAGE_CHARS) {
      return Response.json(
        { error: "이미지 용량이 너무 큽니다. 더 작은 사진을 사용해 주세요." },
        { status: 413 }
      );
    }

    // ── OpenAI 호출 (요청 시점 생성: 빌드 안전) ──
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: PROMPT },
            {
              type: "input_image",
              image_url: imageBase64,
              detail: "high",
            },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "price_estimate",
          strict: true,
          schema: RESULT_SCHEMA,
        },
      },
    });

    const text = response.output_text;
    if (!text) {
      return Response.json(
        { error: "분석 결과를 받지 못했습니다." },
        { status: 502 }
      );
    }

    const json = JSON.parse(text);
    return Response.json(json);
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "분석 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
