import OpenAI from "openai";

export const runtime = "nodejs";

// ── 남용 방지 설정 ───────────────────────────────────────────────
const MAX_IMAGE_CHARS = 10_000_000; // base64 기준 약 7MB 이미지
const RATE_LIMIT = 10; // IP당 분당 허용 요청 수
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
    numbers: {
      // 이미지에서 읽어낸 등기번호(숫자만) 목록
      type: "array",
      items: { type: "string" },
    },
  },
  required: ["numbers"],
} as const;

const PROMPT = `
너는 우체국 "등기/택배 접수증(영수증) 이미지"에서 등기번호만 정확히 뽑아내는 OCR 도우미야.
이미지를 보고, 우편물마다 찍혀 있는 "등기번호(등기번호/접수번호)"를 모두 찾아서 목록으로 돌려줘.

규칙:
- 등기번호는 보통 13자리 숫자다. (앞자리가 우체국/상품 구분, 예: 1로 시작하는 13자리 등)
- 숫자만 남겨. 하이픈(-), 공백, 콤마는 제거하고 연속된 숫자열로.
- 표/영수증에 여러 건이 있으면 위에서 아래 순서대로 전부 담아. 중복은 제거.
- 금액, 우편번호(5~6자리), 날짜, 전화번호, 사업자번호처럼 등기번호가 아닌 숫자는 절대 넣지 마.
- 자신 없는(흐릿해서 일부만 읽히는) 번호는 넣지 마. 잘못된 번호를 넣는 것보다 빠뜨리는 게 낫다.
- 등기번호를 하나도 못 찾으면 빈 배열을 반환.
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
        // origin 헤더가 깨진 경우는 통과
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

    // OCR은 OpenAI 키가 있어야 동작. 미설정이면 붙여넣기로 안내.
    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        {
          error:
            "사진 인식(OCR)은 아직 준비 중입니다. 우선 등기번호를 직접 붙여넣어 조회해 주세요.",
        },
        { status: 503 }
      );
    }

    // ── OpenAI 호출 (클라이언트는 요청 시점에 생성: 빌드 안전) ──
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
          name: "postal_ocr",
          strict: true,
          schema: RESULT_SCHEMA,
        },
      },
    });

    const text = response.output_text;
    if (!text) {
      return Response.json(
        { error: "이미지에서 등기번호를 읽지 못했습니다." },
        { status: 502 }
      );
    }

    const json = JSON.parse(text) as { numbers?: unknown };
    const numbers = Array.isArray(json.numbers)
      ? Array.from(
          new Set(
            json.numbers
              .map((n) => String(n).replace(/[^0-9]/g, ""))
              .filter((n) => n.length >= 9 && n.length <= 15)
          )
        )
      : [];

    return Response.json({ numbers });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "이미지 분석 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
