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
    size: { type: "string", enum: ["소형", "중형", "대형"] },
    licensed: { type: "boolean" },
    priceMin: { type: "integer" },
    priceMax: { type: "integer" },
    priceEstimate: { type: "integer" },
    confidence: { type: "string", enum: ["high", "medium", "low"] },
    reason: { type: "string" },
    note: { type: "string" },
  },
  required: [
    "item",
    "size",
    "licensed",
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
사진 속 인형을 보고 한국 시장 기준 대략적인 소매가를 원(KRW)으로 추정해줘.

[가장 중요] 모든 인형을 비슷한 가격으로 뭉뚱그리지 마.
크기와 정품 여부에 따라 가격이 크게 달라져야 한다. 무난한 중간값(예: 5000원)으로 도망가지 마.

먼저 두 가지를 분류해:
- size: 인형 크기 — "소형"(손바닥~20cm), "중형"(20~40cm), "대형"(40cm 이상)
- licensed: 유명 캐릭터/정품 IP로 보이면 true, 무명 봉제인형이면 false

그다음 아래 한국 시세 기준표에 맞춰 가격을 정해:
- 소형 + 무명: 2,000 ~ 4,000원
- 중형 + 무명: 4,000 ~ 9,000원
- 대형 + 무명: 10,000 ~ 20,000원
- 소형 + 정품: 6,000 ~ 13,000원
- 중형 + 정품: 13,000 ~ 28,000원
- 대형 + 정품/한정판: 28,000 ~ 60,000원
※ 위는 가이드라인. 특별히 유명·희귀하면 더 높게, 조잡하면 더 낮게 조정해.
※ 같은 무명이라도 크기가 다르면 가격도 분명히 다르게 줘.

그리고 채워:
- item: 무엇인지 (캐릭터/종류 + 추정 크기)
- priceMin / priceMax / priceEstimate: 원 단위 정수, estimate는 min~max 사이
- confidence: 정품이라 특정 쉬우면 "high", 일반적이면 "medium", 무명/불명확하면 "low"
- reason: 크기·정품여부·품질을 근거로 왜 그 가격인지
- note: 참고 한 줄 (정품 가정/사이즈 추정 등). 없으면 빈 문자열.
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
