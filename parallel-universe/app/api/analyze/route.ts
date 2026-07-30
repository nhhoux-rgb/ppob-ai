import OpenAI from "openai";

export const runtime = "nodejs";

// ── 남용 방지 설정 ───────────────────────────────────────────────
const MAX_INPUT_CHARS = 600; // 갈림길/현재상황 등 입력 총 길이 상한
const RATE_LIMIT = 12; // IP당 허용 요청 수
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
    branch: { type: "string" }, // 사용자가 말한 갈림길을 한 줄로 정리한 문장
    universes: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          emoji: { type: "string" }, // 이 우주를 상징하는 이모지 1개
          title: { type: "string" }, // 우주 이름 (예: "화가가 된 우주")
          choice: { type: "string" }, // 이 우주에서 내가 한 다른 선택 (한 줄)
          tagline: { type: "string" }, // 감성 한 줄 요약 (공유 후킹)
          job: { type: "string" }, // 이 우주에서 나의 직업/역할
          location: { type: "string" }, // 이 우주에서 내가 사는 곳
          happiness: { type: "integer" }, // 0~100 행복 지수
          wealth: { type: "integer" }, // 0~100 부(富) 지수
          story: { type: "string" }, // 이 우주에서의 삶 (3~5문장)
          highlight: { type: "string" }, // 이 우주 최고의 순간 한 줄
          regret: { type: "string" }, // 이 우주에서 겪는 아쉬움 한 줄
        },
        required: [
          "emoji",
          "title",
          "choice",
          "tagline",
          "job",
          "location",
          "happiness",
          "wealth",
          "story",
          "highlight",
          "regret",
        ],
      },
    },
    mostDivergent: { type: "string" }, // 지금의 나와 가장 다른 우주의 title
    message: { type: "string" }, // 모든 우주를 본 뒤 지금의 나에게 건네는 따뜻한 한마디
  },
  required: ["branch", "universes", "mostDivergent", "message"],
} as const;

const PROMPT = `
너는 "평행우주 관측소"의 안내자야. 사용자가 자기 인생의 한 "갈림길"(그때 다른
선택을 했을 수도 있는 순간)을 이야기하면, 그 순간에서 갈라져 나간 평행우주 속
"또 다른 나"의 삶을 서로 다른 3개 그려줘. 사용자가 결과를 보고 "오, 그 우주의
나도 궁금하다" 하며 캡처해서 친구에게 공유하고 싶어지게 만드는 게 목표야.

먼저 사용자의 입력을 이렇게 해석해:
- 사용자가 말한 "갈림길"을 branch에 한 문장으로 깔끔하게 정리해.
- 사용자가 실제로 했던 선택은 그대로 두고, 그때 **다르게** 갈 수 있었던 길들을
  상상해서 각 우주의 choice로 삼아. (서로 확실히 다른 3갈래로)

그리고 universes에 서로 결이 다른 평행우주 3개를 채워:
- emoji: 그 우주를 한 방에 떠올리게 하는 이모지 1개.
- title: 그 우주의 이름. 짧고 감각적으로. (예: "무대 위의 나", "바다 옆 작은 카페",
  "실리콘밸리로 간 나")
- choice: 그 갈림길에서 이 우주의 내가 내린 다른 선택. 한 줄로 구체적으로.
- tagline: 그 우주의 삶을 한 줄로 압축한 감성 카피. 공유하고 싶게.
- job: 그 우주에서 나의 직업이나 역할.
- location: 그 우주에서 내가 사는 도시/장소.
- happiness: 그 우주에서의 행복 지수(0~100). 우주마다 다르게, 근거 있게.
- wealth: 그 우주에서의 부(富) 지수(0~100). 행복과 꼭 비례하지 않아도 좋아.
- story: 그 우주에서 흘러간 나의 삶을 3~5문장으로. 장면이 그려지게, 담담하면서도
  마음이 움직이게 써. 미화만 하지 말고 명암을 같이 담아.
- highlight: 그 우주에서 가장 빛났던 순간 한 줄.
- regret: 그 우주에서도 남는 아쉬움이나 그리움 한 줄. (완벽한 우주는 없으니까)

마지막으로:
- mostDivergent: 지금의 현실과 가장 많이 달라진 우주의 title을 그대로 적어.
- message: 세 우주를 다 보여준 뒤, 지금 여기 있는 사용자에게 건네는 따뜻한 한마디.
  "어느 우주든 너였다" 같은, 위로가 되는 결.

규칙:
- 세 우주는 행복·부·분위기가 서로 뚜렷이 달라야 해. 다 성공하거나 다 불행하면 안 돼.
- 실제 인물, 특정 회사·브랜드 실명은 피하고 보편적으로 써.
- 점을 치거나 미래를 예언하는 게 아니라, "만약에"를 함께 상상하는 따뜻한 놀이라는 톤.
- 사용자를 불안하게 하거나 지금의 선택을 후회하게 만들지 마. 어떤 우주도 우열이 아니라
  다른 색깔일 뿐이라는 결을 유지해.
- 입력이 갈림길과 무관하거나 너무 빈약하면, 보편적인 인생 갈림길(진학·직업·이사·관계
  등)로 상상해서라도 3개를 채우되 story에서 자연스럽게 녹여.
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

    const body = await req.json();
    const branch = typeof body.branch === "string" ? body.branch.trim() : "";
    const current =
      typeof body.current === "string" ? body.current.trim() : "";

    // ── 입력 검증 ──
    if (!branch) {
      return Response.json(
        { error: "인생의 갈림길을 한 가지 적어 주세요." },
        { status: 400 }
      );
    }
    if (branch.length + current.length > MAX_INPUT_CHARS) {
      return Response.json(
        { error: "입력이 너무 길어요. 조금만 줄여 주세요." },
        { status: 413 }
      );
    }

    const userText = [
      `[내 인생의 갈림길]\n${branch}`,
      current ? `\n\n[지금의 나]\n${current}` : "",
    ].join("");

    // ── OpenAI 호출 (클라이언트는 요청 시점에 생성: 빌드 안전) ──
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: PROMPT },
            { type: "input_text", text: userText },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "parallel_universe",
          strict: true,
          schema: RESULT_SCHEMA,
        },
      },
    });

    const text = response.output_text;
    if (!text) {
      return Response.json(
        { error: "평행우주를 관측하지 못했어요." },
        { status: 502 }
      );
    }

    const json = JSON.parse(text);
    return Response.json(json);
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "평행우주 관측 중 오류가 발생했어요." },
      { status: 500 }
    );
  }
}
