import OpenAI from "openai";

export const runtime = "nodejs";
export const maxDuration = 30;

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
          note: { type: "string" },
        },
        required: ["key", "emoji", "level", "note"],
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
        },
        required: ["emoji", "name", "meaning"],
      },
    },
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
    "goodThing",
    "goodThingEmoji",
    "goodThingWhy",
    "actionSteps",
    "disclaimer",
  ],
} as const;

const INSTRUCTIONS = `한국어 꿈 해석 앱의 재치 있고 따뜻한 해설자다. 꿈을 길몽(lucky), 주의몽(caution), 마음꿈(mind) 중 하나로 분류한다. 마음꿈은 일상 생각·감정·기억이 정리된 꿈을 뜻한다.

[출력 규칙]
- categoryLabel은 category에 맞춰 길몽/주의몽/마음꿈 중 하나로 정확히 맞춘다.
- fortunes는 정확히 4개, 대운·금전·연애·건강 순서로 넣는다. level은 한눈에 읽히는 두세 글자, note는 재미있는 한 문장.
- symbols는 정확히 3개, actionSteps는 정확히 3개.
- 오늘의 행운 미션(goodThing)은 꿈의 상징과 직접 연결된 구체적이고 가벼운 미션으로 만든다. 로또 한 장 사기, 작은 선행, 특정 색 음식 먹기, 산책, 연락하기 등 유형을 다양하게 쓰되 꿈 내용과의 연관성을 goodThingWhy에 설명한다.

[안전 규칙]
- 로또·소비 제안은 반드시 소액의 오락으로만 표현하며 당첨이나 금전 이익을 보장하지 않는다.
- 건강·연애·돈의 미래를 사실처럼 단정하지 않는다.
- 불안하거나 위험한 내용에는 안전과 휴식을 우선한다.
- 문장은 밝고 재미있되 과장된 공포를 만들지 않는다.
- disclaimer에는 재미와 자기 성찰을 위한 참고용이라는 안내를 넣는다.`;

type Fortune = { key: string; emoji: string; level: string; note: string };
type Symbol_ = { emoji: string; name: string; meaning: string };

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
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
          note: str(f.note),
        }))
        .slice(0, 4)
    : [];
  if (fortunes.length !== 4) return null;

  const symbols: Symbol_[] = Array.isArray(r.symbols)
    ? (r.symbols as Record<string, unknown>[])
        .filter((s) => s && str(s.name))
        .map((s) => ({
          emoji: str(s.emoji) || "🌙",
          name: str(s.name),
          meaning: str(s.meaning),
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
      return jsonRes(
        { error: `${MAX_DREAM_LENGTH}자 이내로 적어주세요.` },
        400,
      );
    }

    // ── OpenAI 호출 (요청 시점 생성: 빌드 안전) ──
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      // 꿈 내용은 서버에 남기지 않는다.
      store: false,
      instructions: INSTRUCTIONS,
      input: `사용자의 꿈: ${dream}`,
      text: {
        format: {
          type: "json_schema",
          name: "dream_interpretation",
          strict: true,
          schema: RESULT_SCHEMA,
        },
      },
      max_output_tokens: 1200,
    });

    const text = response.output_text;
    if (!text) {
      return jsonRes({ error: "AI 해몽을 잠시 불러오지 못했어요." }, 502);
    }

    const result = sanitize(JSON.parse(text));
    if (!result) {
      return jsonRes({ error: "해몽 결과를 만들지 못했어요. 다시 시도해 주세요." }, 502);
    }

    return jsonRes(result);
  } catch (error) {
    console.error("dream-api-error", error);
    return jsonRes({ error: "AI 해몽을 잠시 불러오지 못했어요." }, 500);
  }
}
