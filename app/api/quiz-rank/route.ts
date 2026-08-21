import { Redis } from "@upstash/redis";

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

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

// ── 남용 방지 ────────────────────────────────────────────────────
const RATE_LIMIT = 40;
const RATE_WINDOW_MS = 60_000;
const hits = new Map<string, number[]>();
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE_LIMIT;
}

// ── Redis (KV_* 또는 UPSTASH_* 환경변수 필요) ────────────────────
function getRedis(): Redis | null {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

const ZKEY = "quizrank:total"; // ZSET member=userId score=누적점수
const HKEY = "quizrank:names"; // HASH userId -> 표시 이름
const TOP_N = 20;
const MAX_POINTS_PER_SUBMIT = 5000; // 한 라운드 최대 점수 상한(치팅 방지)

function cleanName(raw: unknown): string {
  if (typeof raw !== "string") return "게스트";
  // 제어문자 제거, 공백 정리, 길이 제한
  const s = Array.from(raw)
    .filter((ch) => ch >= " ")
    .join("")
    .trim()
    .slice(0, 16);
  return s.length > 0 ? s : "게스트";
}

function cleanId(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const s = raw.trim();
  if (s.length < 1 || s.length > 128) return null;
  return s;
}

type Entry = { rank: number; name: string; points: number; me?: boolean };

async function buildTop(redis: Redis, meId: string | null): Promise<Entry[]> {
  // 상위 N명 (점수 내림차순)
  const rows = (await redis.zrange(ZKEY, 0, TOP_N - 1, {
    rev: true,
    withScores: true,
  })) as (string | number)[];
  const ids: string[] = [];
  const scores: number[] = [];
  for (let i = 0; i < rows.length; i += 2) {
    ids.push(String(rows[i]));
    scores.push(Number(rows[i + 1]));
  }
  const names =
    ids.length > 0 ? await redis.hmget<Record<string, string>>(HKEY, ...ids) : {};
  return ids.map((id, i) => ({
    rank: i + 1,
    name: (names && names[id]) || "게스트",
    points: scores[i],
    me: meId != null && id === meId,
  }));
}

async function myStanding(
  redis: Redis,
  id: string,
): Promise<{ rank: number | null; points: number }> {
  const [rank, score] = await Promise.all([
    redis.zrevrank(ZKEY, id),
    redis.zscore(ZKEY, id),
  ]);
  return {
    rank: rank == null ? null : Number(rank) + 1,
    points: score == null ? 0 : Number(score),
  };
}

export async function POST(req: Request) {
  try {
    const ip =
      (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() ||
      "unknown";
    if (isRateLimited(ip)) {
      return jsonRes({ error: "요청이 너무 많습니다." }, 429);
    }

    const redis = getRedis();
    if (!redis) {
      // Redis 미설정 → 랭킹 비활성(프론트가 안내 처리)
      return jsonRes({ disabled: true });
    }

    const body = await req.json().catch(() => ({}));
    const action = body?.action;
    const id = cleanId(body?.id);

    if (action === "submit") {
      if (!id) return jsonRes({ error: "잘못된 요청입니다." }, 400);
      const name = cleanName(body?.name);
      let points = Math.trunc(Number(body?.points));
      if (!Number.isFinite(points) || points < 0) points = 0;
      points = Math.min(points, MAX_POINTS_PER_SUBMIT);

      await redis.hset(HKEY, { [id]: name });
      const total = await redis.zincrby(ZKEY, points, id);
      const standing = await myStanding(redis, id);
      const top = await buildTop(redis, id);
      const size = await redis.zcard(ZKEY);
      return jsonRes({
        added: points,
        total: Number(total),
        rank: standing.rank,
        size,
        top,
      });
    }

    if (action === "top") {
      const top = await buildTop(redis, id);
      const size = await redis.zcard(ZKEY);
      const me = id ? await myStanding(redis, id) : { rank: null, points: 0 };
      return jsonRes({ top, size, me });
    }

    return jsonRes({ error: "알 수 없는 요청입니다." }, 400);
  } catch (error) {
    console.error(error);
    return jsonRes({ error: "랭킹 처리 중 오류가 발생했습니다." }, 500);
  }
}
