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
    nickname: { type: "string" }, // 이 책상을 규정하는 재치있는 별명 (공유 후킹)
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
    addItems: {
      // "여기에 이걸 놓아라" 형태의 구체적 추가 추천
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          item: { type: "string" }, // 추가할 사물 (예: 작은 초록 식물, 피규어, 스탠드)
          place: { type: "string" }, // 놓을 위치 (예: 왼쪽 앞, 모니터 뒤)
          reason: { type: "string" }, // 그렇게 하면 좋은 이유(효과)
        },
        required: ["item", "place", "reason"],
      },
    },
    removeItems: {
      // 사진에서 실제로 보이는, 치우면 좋은 것
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          item: { type: "string" }, // 치울 대상 (예: 엉킨 전선, 빈 컵)
          reason: { type: "string" }, // 왜 치우면 좋은지
        },
        required: ["item", "reason"],
      },
    },
    fortune: { type: "string" }, // 오늘의 책상 운세 한 줄 (재미 요소)
    tip: { type: "string" }, // 종합 개운 팁
  },
  required: [
    "nickname",
    "overallScore",
    "grade",
    "summary",
    "items",
    "addItems",
    "removeItems",
    "fortune",
    "tip",
  ],
} as const;

const PROMPT = `
너는 용하기로 소문난 "책상 풍수(風水) 도사"야. 사용자가 올린 "책상" 사진을 보고
심심풀이용 풍수 진단을 재치있고 후킹감 있게, 하지만 근거 있게 정리해줘.
결과를 보면 "오 이거 맞네" 하고 친구에게 공유하고 싶어지게 만드는 게 목표야.

먼저 사진 속 책상을 도사처럼 꼼꼼히 훑어봐:
- 책상 위 정리 상태(어질러짐/깔끔함), 물건의 배치와 방향
- 모니터·노트북·조명의 위치, 빛이 드는 방향
- 식물, 피규어, 액자, 색감 등 기운에 영향을 주는 요소
- 전선 엉킴, 빈 컵, 쓰레기, 먹다 남은 음식 등 탁한 기운 요소

그 관찰을 바탕으로 아래를 채워:
- nickname: 이 책상을 한 방에 규정하는 재치있는 별명. (예: "잠자는 금고형 책상",
  "기운이 줄줄 새는 책상", "집중력 폭발 명당") 자극적이되 사람을 비하하진 마.
- overallScore: 종합 풍수 점수(0~100). 점수 후하게 주지 말고 근거대로 냉정하게.
- grade: 점수에 맞는 한자 등급 한 단어. (90+ "대길", 75+ "길", 55+ "평", 그 미만 "주의")
- summary: 한 줄 총평. 도사 말투로 재치있게.
- items: 3~4개. 재물운 / 집중·학업운 / 건강운 / 정리정돈 같은 카테고리로.
  finding엔 사진에서 실제로 보이는 근거를, advice엔 구체적 개운법을 적어.
- addItems: 지금 없지만 "놓으면 기운이 확 살아날" 구체적 사물 1~3개. 각 항목에
  item(무엇), place(정확히 어디에), reason(효과)을 적어. 식물·피규어·스탠드·수정·
  소금 등 실제로 놓을 만한 걸 위치까지 콕 집어줘. (예: item "잎 둥근 작은 화분",
  place "책상 왼쪽 앞", reason "재물이 들어오는 자리에 생기를 더해줌")
- removeItems: 사진에서 실제로 보이는, 치우면 기운이 좋아질 것 1~3개.
  반드시 사진에 실제로 보이는 것만. (예: 엉킨 전선, 다 마신 컵, 쌓인 서류)
  안 보이면 빈 배열로 둬.
- fortune: 오늘 하루 이 책상 주인에게 건네는 운세 한 줄. 가볍고 기분 좋게.
- tip: 오늘 바로 해볼 만한 종합 개운 팁 한 가지.

규칙:
- 사진이 책상이 아니거나 판단이 어려우면 점수를 낮게 주고 summary에 "책상 사진이 잘 보이지 않아요"라고 적어.
- addItems/removeItems는 두루뭉술("정리를 하세요")하게 쓰지 말고, 사물과 위치를 콕 집어 구체적으로.
- 미신을 사실처럼 단정하지 말고, 정리·채광·동선 같은 실제로 도움되는 조언과 자연스럽게 엮어.
- 사람을 불안하게 만들거나 겁주지 마. 가볍고 즐거운 심심풀이 톤을 유지해.
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
