import OpenAI from "openai";

export const runtime = "nodejs";

// ── CORS (토스 미니앱 등 외부 출처에서 호출 허용) ────────────────
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function jsonRes(data: unknown, status = 200) {
  return Response.json(data, { status, headers: CORS_HEADERS });
}

// CORS preflight
export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

// ── 남용 방지 설정 (price/analyze와 동일 패턴) ───────────────────
const RATE_LIMIT = 20; // IP당 허용 요청 수
const RATE_WINDOW_MS = 60_000; // 1분

const hits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE_LIMIT;
}

// ── 허용 분야 (프론트와 동기화) ──────────────────────────────────
// key: 요청/검증용, label: 프롬프트에 전달할 사람이 읽는 이름.
const CATEGORIES: Record<string, string> = {
  random: "시사·일반 상식 전 분야(경제·국제·과학·역사·IT·사회 등을 골고루)",
  economy: "경제·금융",
  politics: "정치·법·헌법",
  world: "국제·세계 정세",
  science: "과학·환경",
  it: "IT·기술",
  koreanhistory: "한국사",
  worldhistory: "세계사",
  society: "사회·문화",
  sports: "스포츠",
  arts: "예술·문학",
};

const COUNT_DEFAULT = 10;
const COUNT_MAX = 15;

// ── 응답 형식(Structured Outputs) ────────────────────────────────
const RESULT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    questions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          q: { type: "string" },
          // 보기 4개
          options: {
            type: "array",
            items: { type: "string" },
          },
          // 정답 인덱스 (0~3)
          answer: { type: "integer" },
          explain: { type: "string" },
        },
        required: ["q", "options", "answer", "explain"],
      },
    },
  },
  required: ["questions"],
} as const;

function buildPrompt(categoryLabel: string, count: number): string {
  return `
너는 한국어 상식 퀴즈 출제자야. 아래 조건으로 4지선다 퀴즈 ${count}문제를 만들어줘.

[분야] ${categoryLabel}

[규칙]
- 각 문제는 보기(options) 정확히 4개, 정답은 그중 하나.
- answer는 정답 보기의 인덱스(0~3). 정답 위치는 문제마다 골고루 섞어.
- 반드시 사실에 근거한, 명백히 정답이 하나인 문제만. 논쟁적·주관적·모호한 문제 금지.
- 너무 시의성이 강해 금방 바뀌는 사실(현재 환율, 오늘의 순위 등)은 피하고,
  비교적 오래 유효한 사실 위주로 출제.
- 난이도는 쉬움~중간 위주로, 일반인이 풀 만한 상식 수준.
- explain(해설)은 1~2문장으로 왜 그게 정답인지 간단히.
- 오답 보기도 그럴듯하게(무작위 단어 나열 금지).
- 모든 텍스트는 한국어. q에는 물음표로 끝나는 질문 문장을 넣어.
- 같은 답이 반복되거나 문제가 서로 겹치지 않게 다양하게.
`;
}

type RawQuestion = {
  q?: unknown;
  options?: unknown;
  answer?: unknown;
  explain?: unknown;
};

// AI 응답을 검증·정제. 형식이 어긋난 문제는 버린다.
function sanitize(questions: RawQuestion[]): {
  q: string;
  options: string[];
  answer: number;
  explain: string;
}[] {
  const out = [];
  for (const item of questions) {
    if (!item || typeof item.q !== "string") continue;
    if (!Array.isArray(item.options)) continue;
    const options = item.options
      .filter((o): o is string => typeof o === "string" && o.trim().length > 0)
      .slice(0, 4);
    if (options.length !== 4) continue;
    let answer =
      typeof item.answer === "number" ? Math.trunc(item.answer) : NaN;
    if (!Number.isFinite(answer) || answer < 0 || answer > 3) continue;
    const explain = typeof item.explain === "string" ? item.explain : "";
    out.push({ q: item.q.trim(), options, answer, explain: explain.trim() });
  }
  return out;
}

export async function POST(req: Request) {
  try {
    // ── rate limit ──
    const ip =
      (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() ||
      "unknown";
    if (isRateLimited(ip)) {
      return jsonRes(
        { error: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." },
        429,
      );
    }

    const body = await req.json().catch(() => ({}));
    const categoryKey =
      typeof body?.category === "string" && body.category in CATEGORIES
        ? body.category
        : "random";
    const count = Math.min(
      COUNT_MAX,
      Math.max(3, Number(body?.count) || COUNT_DEFAULT),
    );

    // ── OpenAI 호출 (요청 시점 생성: 빌드 안전) ──
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: buildPrompt(CATEGORIES[categoryKey], count),
            },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "quiz_questions",
          strict: true,
          schema: RESULT_SCHEMA,
        },
      },
    });

    const text = response.output_text;
    if (!text) {
      return jsonRes({ error: "문제를 생성하지 못했습니다." }, 502);
    }

    const parsed = JSON.parse(text);
    const questions = sanitize(parsed?.questions ?? []);
    if (questions.length === 0) {
      return jsonRes({ error: "유효한 문제를 만들지 못했습니다." }, 502);
    }

    return jsonRes({ category: categoryKey, questions });
  } catch (error) {
    console.error(error);
    return jsonRes({ error: "문제 생성 중 오류가 발생했습니다." }, 500);
  }
}
