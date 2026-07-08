import OpenAI from "openai";

export const runtime = "nodejs";

// ── 남용 방지 설정 ───────────────────────────────────────────────
const MAX_TEXT_CHARS = 16_000; // 요약에 넣을 원문 최대 길이
const RATE_LIMIT = 15; // IP당 허용 요청 수
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
    press: { type: "string" }, // 언론사명
    date: { type: "string" }, // 배포일 (YYYY.MM. 형식 권장)
    headline: { type: "string" }, // 강조할 메인 제목
    subheadlines: {
      // 부제 1~3개 (없으면 빈 배열)
      type: "array",
      items: { type: "string" },
    },
    body: {
      // 요약 본문 문단 2~4개
      type: "array",
      items: { type: "string" },
    },
  },
  required: ["press", "date", "headline", "subheadlines", "body"],
} as const;

const PROMPT = `
너는 부동산 보고서에 넣을 "기사 클리핑(요약본)"을 만드는 편집기자야.
주어진 기사 원문을 읽고, 보고서에 그대로 붙여넣을 수 있게 핵심만 깔끔하게 정리해줘.

아래 형식으로 채워:
- press: 언론사명. 힌트가 주어지면 그대로 쓰고, 없으면 원문에서 추론. 도메인만 있으면 사람이 읽는 언론사명으로 다듬어.
- date: 기사 배포일. 가능하면 "YYYY.MM." 형식으로(예: "2024.10."). 날짜를 알 수 없으면 빈 문자열로.
- headline: 기사의 핵심을 한눈에 보여주는 강조 제목. 원문 제목을 살리되 너무 길면 간결하게 다듬어. 자극적 낚시성 표현은 피하고 사실 중심으로.
- subheadlines: 제목을 보조하는 부제 1~3개. 기사의 핵심 수치·사실을 압축한 짧은 문장. 원문에 부제가 있으면 그걸 살려도 됨. 마땅치 않으면 빈 배열.
- body: 기사를 2~4개 문단으로 요약. 각 문단은 2~4문장. 보고서에 쓰기 좋게 사실·수치·주체를 정확히 담고, 원문의 건조하고 객관적인 뉴스 톤을 유지해. 추측이나 원문에 없는 내용을 지어내지 마.

규칙:
- 모든 답변은 한국어.
- 원문에 없는 사실을 만들어내지 말 것. 수치·고유명사·날짜는 원문 그대로.
- 광고/네비게이션/댓글 같은 잡음은 무시하고 기사 본문만 요약.
- 원문이 기사가 아니거나 내용이 부실하면, headline에 "기사 내용을 충분히 읽지 못했어요"라고 적고 body는 확인 가능한 내용만 짧게.
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

    const body = await req.json();
    const text: string = typeof body.text === "string" ? body.text : "";
    const pressHint: string =
      typeof body.pressHint === "string" ? body.pressHint : "";
    const dateHint: string =
      typeof body.dateHint === "string" ? body.dateHint : "";
    const titleHint: string =
      typeof body.titleHint === "string" ? body.titleHint : "";

    const combined = `${titleHint}\n\n${text}`.trim();
    if (combined.replace(/\s/g, "").length < 30) {
      return Response.json(
        { error: "요약할 기사 본문이 너무 짧습니다." },
        { status: 400 }
      );
    }

    const hintBlock =
      `언론사 힌트: ${pressHint || "(없음)"}\n` +
      `배포일 힌트: ${dateHint || "(없음)"}\n` +
      `제목 힌트: ${titleHint || "(없음)"}\n\n` +
      `--- 기사 원문 시작 ---\n${combined.slice(0, MAX_TEXT_CHARS)}\n--- 기사 원문 끝 ---`;

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: PROMPT },
            { type: "input_text", text: hintBlock },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "news_clipping",
          strict: true,
          schema: RESULT_SCHEMA,
        },
      },
    });

    const out = response.output_text;
    if (!out) {
      return Response.json(
        { error: "요약 결과를 받지 못했습니다." },
        { status: 502 }
      );
    }

    const json = JSON.parse(out);
    return Response.json(json);
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "요약 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
