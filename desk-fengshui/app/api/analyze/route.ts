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
    overallScore: { type: "integer" }, // 0~100 종합 점수
    grade: { type: "string" }, // 대길 / 길 / 평 / 주의
    summary: { type: "string" }, // 한 줄 총평
    items: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          category: { type: "string" }, // 재물운, 집중·학업운, 건강운, 정리정돈 등
          score: { type: "integer" }, // 0~100
          finding: { type: "string" }, // 사진에서 관찰한 점
          advice: { type: "string" }, // 개선/개운 조언
        },
        required: ["category", "score", "finding", "advice"],
      },
    },
    lucky: { type: "array", items: { type: "string" } }, // 기운을 북돋는 요소
    caution: { type: "array", items: { type: "string" } }, // 기운을 해치는 요소
    tip: { type: "string" }, // 종합 개운 팁
  },
  required: ["overallScore", "grade", "summary", "items", "lucky", "caution", "tip"],
} as const;

const PROMPT = `
너는 책상 풍수(風水) 분석 전문가야. 사용자가 올린 "책상" 사진을 보고
심심풀이용 풍수 진단을 재미있게, 하지만 근거 있게 정리해줘.

먼저 사진 속 책상을 훑어보며 다음을 살펴:
- 책상 위 정리 상태(어질러짐/깔끔함), 물건의 배치와 방향
- 모니터·노트북·조명의 위치, 빛이 드는 방향
- 식물, 소품, 액자, 색감 등 기운에 영향을 주는 요소
- 전선 엉킴, 쓰레기, 먹다 남은 음식 등 탁한 기운 요소

그 관찰을 바탕으로 아래를 채워:
- overallScore: 책상의 종합 풍수 점수(0~100).
- grade: 점수에 맞는 한자 등급 한 단어. (예: 90+ "대길", 75+ "길", 55+ "평", 그 미만 "주의")
- summary: 한 줄 총평. 재치 있게, 하지만 과하지 않게.
- items: 3~4개. 각 항목은 재물운 / 집중·학업운 / 건강운 / 정리정돈 같은 카테고리로.
  finding에는 사진에서 실제로 보이는 근거를, advice에는 구체적이고 실천 가능한 개운법을 적어.
- lucky: 지금 책상에서 기운을 북돋는 좋은 요소들(없으면 빈 배열).
- caution: 기운을 해치니 정리하면 좋은 요소들(없으면 빈 배열).
- tip: 오늘 바로 해볼 만한 종합 개운 팁 한 가지.

규칙:
- 사진이 책상이 아니거나 판단이 어려우면 점수를 낮게 주고 summary에 "책상 사진이 잘 보이지 않아요"라고 적어.
- 미신을 사실처럼 단정하지 말고, 정리·채광·동선 같은 실제로 도움되는 조언과 자연스럽게 엮어.
- 사람을 불안하게 만들거나 겁주지 마. 어디까지나 가볍고 즐거운 심심풀이 톤을 유지해.
- 모든 답변은 한국어로.
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
          name: "desk_fengshui",
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
