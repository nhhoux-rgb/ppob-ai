import OpenAI from "openai";

export const runtime = "nodejs";

// ── 남용 방지 설정 ───────────────────────────────────────────────
const MAX_IMAGE_CHARS = 10_000_000; // base64 기준 약 7MB 이미지
const RATE_LIMIT = 10; // IP당 허용 요청 수
const RATE_WINDOW_MS = 60_000; // 위 횟수의 측정 구간(1분)

// 서버 인스턴스 메모리 기반의 보조 rate limit.
// (서버리스 특성상 인스턴스마다 별도라 완벽하진 않지만, 한 인스턴스로 쏟아지는
//  도배성 요청을 막는 1차 방어선 역할을 한다. 최종 안전장치는 OpenAI 사용 한도.)
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
    analysis: { type: "string" },
    summary: { type: "string" },
    targets: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          rank: { type: "integer" },
          name: { type: "string" },
          score: { type: "integer" },
          reason: { type: "string" },
          strategy: { type: "string" },
          x: { type: "number" },
          y: { type: "number" },
        },
        required: ["rank", "name", "score", "reason", "strategy", "x", "y"],
      },
    },
    avoid: { type: "array", items: { type: "string" } },
    tip: { type: "string" },
  },
  required: ["analysis", "summary", "targets", "avoid", "tip"],
} as const;

const PROMPT = `
너는 인형뽑기 공략 전문가야.
사진을 보고 가장 성공 가능성이 높은 인형 1~3개를 추천해줘.

먼저 "analysis" 필드에 기계 전체를 훑어보며 판단 근거를 간단히 정리해.
(어떤 인형이 출구에 가까운지, 집게가 걸릴 부분이 있는지, 끼이거나 쌓여 있는지 등)
그 분석을 바탕으로 "targets"를 골라.

score(점수) 기준은 반드시 아래를 따라:
- 80~100: 출구에 매우 가깝거나 헐겁게 떠 있고, 집게가 확실히 걸릴 부분이 보임
- 60~79: 비교적 유리하지만 약간의 운이나 추가 조작이 필요
- 40~59: 가능은 하지만 어렵다
- 0~39: 매우 어렵거나 비추천 (벽에 끼임, 더미 한가운데, 무거워 보임)

중요 규칙:
- 출구, 버튼, 조이스틱, 빈 공간, 유리벽은 절대 추천하지 마.
- 반드시 실제 인형/파우치/고리/태그가 보이는 대상만 추천해.
- x,y 좌표는 추천 대상의 "집게가 걸릴 수 있는 부분"에 찍어. 빈 공간이나 유리 아래쪽에 찍지 마.
- 좌표는 사진 기준 0~100 비율. 왼쪽 끝 x=0, 오른쪽 끝 x=100, 위 y=0, 아래 y=100.
- 확실하지 않은 대상은 추천하지 마. 3개를 억지로 채우지 말고 확실한 것만 1~3개 추천해.
- 사진상 성공 가능성이 전반적으로 낮으면 score를 낮게 주고, summary에 비추천 기계라고 적어.
- 절대로 대충 추정하지 마.

avoid에는 피해야 할 대상, tip에는 전체 공략 팁을 적어. (없으면 빈 배열/빈 문자열)
`;

export async function POST(req: Request) {
  try {
    // ── 출처(Origin) 체크: 다른 사이트/도구에서의 직접 호출 차단 ──
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
        // origin 헤더가 깨진 경우는 통과시키되 아래 단계에서 걸러진다.
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
          name: "claw_recommendation",
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
