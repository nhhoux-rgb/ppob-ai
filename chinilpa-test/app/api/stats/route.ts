import { Redis } from "@upstash/redis";
import { TYPES } from "@/app/types";

export const runtime = "nodejs";

// 초안은 window.storage 로 집계를 저장했는데, 그건 브라우저에 없는 API다
// (토스 미니앱 전용). 웹에서는 영원히 0이 되므로 Upstash Redis로 바꿨다.
// Redis가 연결돼 있지 않으면 빈 집계를 돌려주고, 화면은 기본 분포로 뜬다.

const TOTAL_KEY = "chinilpa:total";
const STAGE_KEY = "chinilpa:stage";
const TYPE_KEY = "chinilpa:type";

type Stats = {
  total: number;
  stage: Record<string, number>;
  type: Record<string, number>;
};

const EMPTY: Stats = { total: 0, stage: {}, type: {} };

function getRedis(): Redis | null {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

/** Redis 해시는 값이 문자열로 올 수 있어서 숫자로 정규화한다. */
function toCounts(raw: Record<string, unknown> | null): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(raw ?? {})) {
    const n = typeof v === "number" ? v : Number(v);
    if (Number.isFinite(n)) out[k] = n;
  }
  return out;
}

async function read(redis: Redis): Promise<Stats> {
  const [total, stage, type] = await Promise.all([
    redis.get<number>(TOTAL_KEY),
    redis.hgetall<Record<string, unknown>>(STAGE_KEY),
    redis.hgetall<Record<string, unknown>>(TYPE_KEY),
  ]);
  return {
    total: total ?? 0,
    stage: toCounts(stage),
    type: toCounts(type),
  };
}

export async function GET() {
  const redis = getRedis();
  if (!redis) return Response.json(EMPTY);
  try {
    return Response.json(await read(redis));
  } catch (error) {
    console.error(error);
    return Response.json(EMPTY);
  }
}

export async function POST(request: Request) {
  // 검증을 Redis 연결 여부보다 먼저 한다. 뒤에 두면 저장소가 없을 때
  // 잘못된 입력도 200으로 통과해서 검증이 도는지 확인할 방법이 없다.
  let stage: number;
  let type: string;
  try {
    const body = await request.json();
    stage = Number(body?.stage);
    type = String(body?.type ?? "");
  } catch {
    return Response.json(EMPTY, { status: 400 });
  }

  // 해시가 임의의 값으로 오염되지 않도록 화이트리스트로 검증한다.
  // hasOwnProperty 로 봐야 __proto__ 같은 상속 키가 통과하지 않는다.
  const validStage = Number.isInteger(stage) && stage >= 0 && stage <= 6;
  const validType = Object.prototype.hasOwnProperty.call(TYPES, type);
  if (!validStage || !validType) {
    return Response.json(EMPTY, { status: 400 });
  }

  const redis = getRedis();
  if (!redis) return Response.json(EMPTY);

  try {
    await Promise.all([
      redis.incr(TOTAL_KEY),
      redis.hincrby(STAGE_KEY, String(stage), 1),
      redis.hincrby(TYPE_KEY, type, 1),
    ]);
    return Response.json(await read(redis));
  } catch (error) {
    console.error(error);
    return Response.json(EMPTY);
  }
}
