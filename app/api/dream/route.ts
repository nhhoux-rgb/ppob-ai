import OpenAI from "openai";

export const runtime = "nodejs";
export const maxDuration = 60;

// ── CORS (토스 미니앱 등 외부 출처에서 호출 허용) ────────────────
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "no-store",
};

function jsonRes(data: unknown, status = 200) {
  return Response.json(data, { status, headers: CORS_HEADERS });
}

// CORS preflight
export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

// ── 남용 방지 설정 (quiz/price/analyze와 동일 패턴) ──────────────
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

// ── 입력 검증 (미니앱 src/dream.js와 규칙 동기화) ────────────────
const MAX_DREAM_LENGTH = 240;
const MIN_DREAM_LENGTH = 5;

function normalizeDream(value: unknown): string {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

// ── 응답 형식(Structured Outputs) ────────────────────────────────
// strict 모드에서는 minItems/maxItems를 쓸 수 없어 개수는 프롬프트로
// 지시하고 sanitize에서 다시 확인한다.
const FORTUNE_KEYS = ["대운", "금전", "연애", "건강"] as const;

const RESULT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    category: { type: "string", enum: ["lucky", "caution", "mind"] },
    categoryLabel: { type: "string", enum: ["길몽", "주의몽", "마음꿈"] },
    categoryLine: { type: "string" },
    title: { type: "string" },
    summary: { type: "string" },
    mood: { type: "string" },
    fortunes: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          key: { type: "string", enum: FORTUNE_KEYS },
          emoji: { type: "string" },
          level: { type: "string" },
          score: { type: "integer" },
          note: { type: "string" },
        },
        required: ["key", "emoji", "level", "score", "note"],
      },
    },
    symbols: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          emoji: { type: "string" },
          name: { type: "string" },
          meaning: { type: "string" },
          connection: { type: "string" },
        },
        required: ["emoji", "name", "meaning", "connection"],
      },
    },
    todayFocus: { type: "string" },
    reflection: { type: "string" },
    goodThing: { type: "string" },
    goodThingEmoji: { type: "string" },
    goodThingWhy: { type: "string" },
    actionSteps: { type: "array", items: { type: "string" } },
    disclaimer: { type: "string" },
  },
  required: [
    "category",
    "categoryLabel",
    "categoryLine",
    "title",
    "summary",
    "mood",
    "fortunes",
    "symbols",
    "todayFocus",
    "reflection",
    "goodThing",
    "goodThingEmoji",
    "goodThingWhy",
    "actionSteps",
    "disclaimer",
  ],
} as const;

const INSTRUCTIONS = `너는 한국 전통 해몽에 밝으면서 현대 심리학도 아는 꿈 해설자다. 읽는 사람이 "어떻게 알았지?" 하고 놀랄 만큼 그 사람의 꿈에만 들어맞는 해석을 쓴다.

[가장 중요한 원칙]
사용자가 적은 꿈에 실제로 등장한 단어(사물·인물·장소·행동·감정)를 반드시 그대로 인용하며 해석한다. 어떤 꿈에 붙여도 말이 되는 문장은 실패다. 쓰기 전에 스스로 점검해라. "이 문장을 전혀 다른 꿈에 붙여도 자연스러운가?" 그렇다면 지우고 다시 써라.

[절대 쓰지 말 것]
"마음이 보내는 신호", "변화의 시작", "새로운 기회가 찾아와요", "작은 선택이 흐름을 만들어요", "긍정적인 마음을 가지세요", "내면을 돌아보세요" 같은 어디에나 붙는 상투어. 점술 사기처럼 들리는 단정("반드시 ~하게 됩니다").

[각 항목 작성법]
- title: 꿈의 핵심 장면을 담은 12자 내외의 제목. 사용자 꿈의 구체적 소재가 들어가야 한다.
- categoryLine: 이 꿈을 그렇게 분류한 이유를 20자 내외로. (예: "쫓기지만 붙잡히지 않은 게 핵심이에요")
- summary: 4~6문장. 이 순서로 쓴다. ①꿈의 어떤 장면이 해석의 열쇠인지 짚기 ②한국 전통 해몽에서 그 소재를 어떻게 읽어왔는지 ③그것이 지금 이 사람의 상태와 어떻게 연결되는지 ④그래서 어떻게 받아들이면 좋은지. 반드시 사용자가 쓴 표현을 한 번 이상 인용한다.
- mood: 꿈이 남긴 감정을 5자 내외로. 흔한 단어 대신 결이 살아있는 표현을 쓴다. (예: "묘한 홀가분함", "설레는 불안")
- fortunes: 정확히 4개, 대운·금전·연애·건강 순서. 각각 score(0~100 정수), level(2~4자 한글 요약), note(한 문장)를 쓴다.
  · score는 꿈 내용에 따라 실제로 벌린다. 네 개가 다 60~80에 몰리면 실패다. 낮으면 30대, 높으면 90대까지 쓴다. level은 score와 어울리게 쓴다. (85↑ 최고조/활짝, 70대 순풍, 50대 무난, 40대 주춤, 30↓ 숨고르기)
  · note는 그 점수가 나온 이유를 꿈의 구체적 요소와 묶어 쓴다. 오늘·이번 주 안에 확인 가능한 이야기로 쓴다.
- symbols: 정확히 3개. name은 사용자 꿈에 실제로 나온 소재만 쓴다(없는 걸 지어내지 않는다). meaning은 한국 전통 해몽에서 그 소재를 어떻게 풀어왔는지 한 문장, connection은 그게 지금 이 사람 상황과 어떻게 이어지는지 한 문장.
- todayFocus: 오늘 하루 딱 하나만 기억한다면 무엇인지, 25자 내외 한 문장.
- reflection: 사용자가 스스로에게 던져볼 질문 하나. 꿈의 장면에서 곧바로 나오는 질문이어야 한다. (예: "요즘 붙잡히기 싫은 게 뭘까?")
- goodThing: 오늘의 행운 미션. 5분 안에 실제로 할 수 있는 구체적 행동 하나. 꿈의 상징과 직접 이어져야 한다. 로또 한 장 사기, 작은 선행, 특정 색 음식 먹기, 산책, 오래 연락 못 한 사람에게 안부 보내기 등 유형을 매번 다르게 고른다.
- goodThingWhy: 그 미션이 이 꿈과 왜 연결되는지 한 문장.
- actionSteps: 정확히 3개. 미션을 실행하는 순서. 각각 동사로 끝나는 짧은 문장.
- disclaimer: 재미와 자기 성찰을 위한 참고용이라는 안내.

[분류 기준]
길몽(lucky) 재물·기회·회복의 상징이 뚜렷할 때. 주의몽(caution) 손실·갈등·경고의 결이 있을 때. 마음꿈(mind) 낮의 생각·감정·기억이 정리된 꿈일 때.

[안전 규칙]
- 로또·소비 제안은 소액의 오락으로만 표현하며 당첨이나 금전 이익을 보장하지 않는다.
- 건강·연애·돈의 미래를 사실처럼 단정하지 않는다. 진단이나 치료 조언을 하지 않는다.
- 불안하거나 위험한 내용(자해·사고·죽음 등)에는 공포를 키우지 말고 안전과 휴식, 주변에 이야기하기를 권한다.
- 문장은 따뜻하고 생생하되 과장된 공포를 만들지 않는다.`;

type Fortune = {
  key: string;
  emoji: string;
  level: string;
  score: number;
  note: string;
};
type DreamSymbol = {
  emoji: string;
  name: string;
  meaning: string;
  connection: string;
};

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function clampScore(value: unknown): number {
  const n = typeof value === "number" ? Math.round(value) : NaN;
  if (!Number.isFinite(n)) return 60;
  return Math.min(100, Math.max(0, n));
}

// AI 응답을 화면 스키마에 맞게 검증·정제. 개수가 어긋나면 null.
function sanitize(raw: unknown) {
  const r = raw as Record<string, unknown> | null;
  if (!r) return null;

  const category = str(r.category);
  if (!["lucky", "caution", "mind"].includes(category)) return null;

  const fortunes: Fortune[] = Array.isArray(r.fortunes)
    ? (r.fortunes as Record<string, unknown>[])
        .filter((f) => f && str(f.key) && str(f.level))
        .map((f) => ({
          key: str(f.key),
          emoji: str(f.emoji) || "✨",
          level: str(f.level),
          score: clampScore(f.score),
          note: str(f.note),
        }))
        .slice(0, 4)
    : [];
  if (fortunes.length !== 4) return null;

  const symbols: DreamSymbol[] = Array.isArray(r.symbols)
    ? (r.symbols as Record<string, unknown>[])
        .filter((s) => s && str(s.name))
        .map((s) => ({
          emoji: str(s.emoji) || "🌙",
          name: str(s.name),
          meaning: str(s.meaning),
          connection: str(s.connection),
        }))
        .slice(0, 3)
    : [];
  if (symbols.length !== 3) return null;

  const actionSteps = Array.isArray(r.actionSteps)
    ? (r.actionSteps as unknown[]).map(str).filter(Boolean).slice(0, 3)
    : [];
  if (actionSteps.length !== 3) return null;

  const label = str(r.categoryLabel);
  const categoryLabel = ["길몽", "주의몽", "마음꿈"].includes(label)
    ? label
    : category === "lucky"
      ? "길몽"
      : category === "caution"
        ? "주의몽"
        : "마음꿈";

  const title = str(r.title);
  const summary = str(r.summary);
  const goodThing = str(r.goodThing);
  if (!title || !summary || !goodThing) return null;

  return {
    category,
    categoryLabel,
    categoryLine: str(r.categoryLine),
    title,
    summary,
    mood: str(r.mood),
    fortunes,
    symbols,
    todayFocus: str(r.todayFocus),
    reflection: str(r.reflection),
    goodThing,
    goodThingEmoji: str(r.goodThingEmoji) || "🎁",
    goodThingWhy: str(r.goodThingWhy),
    actionSteps,
    disclaimer:
      str(r.disclaimer) || "꿈 해석은 재미와 자기 성찰을 위한 참고용이에요.",
  };
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
    const dream = normalizeDream(body?.dream);
    if (dream.length < MIN_DREAM_LENGTH) {
      return jsonRes({ error: "꿈 내용을 5자 이상 적어주세요." }, 400);
    }
    if (dream.length > MAX_DREAM_LENGTH) {
      return jsonRes({ error: `${MAX_DREAM_LENGTH}자 이내로 적어주세요.` }, 400);
    }

    // ── OpenAI 호출 (요청 시점 생성: 빌드 안전) ──
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1",
      // 꿈 내용은 서버에 남기지 않는다.
      store: false,
      instructions: INSTRUCTIONS,
      input: `사용자가 적은 꿈: "${dream}"

이 꿈에 등장하는 소재와 감정을 먼저 짚은 뒤, 그것에만 들어맞는 해석을 써라. 다른 꿈에도 통하는 문장은 쓰지 마라.`,
      text: {
        format: {
          type: "json_schema",
          name: "dream_interpretation",
          strict: true,
          schema: RESULT_SCHEMA,
        },
      },
      max_output_tokens: 2000,
    });

    const text = response.output_text;
    if (!text) {
      return jsonRes({ error: "AI 해몽을 잠시 불러오지 못했어요." }, 502);
    }

    const result = sanitize(JSON.parse(text));
    if (!result) {
      return jsonRes(
        { error: "해몽 결과를 만들지 못했어요. 다시 시도해 주세요." },
        502,
      );
    }

    return jsonRes(result);
  } catch (error) {
    console.error("dream-api-error", error);
    return jsonRes({ error: "AI 해몽을 잠시 불러오지 못했어요." }, 500);
  }
}
