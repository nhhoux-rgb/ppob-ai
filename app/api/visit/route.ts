import { Redis } from "@upstash/redis";

export const runtime = "nodejs";

// 저장소가 연결돼 있을 때만 동작. (환경변수 없으면 count: null → 카운터 숨김)
function getRedis(): Redis | null {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

// 한국 시간(Asia/Seoul) 기준 오늘 날짜로 키 생성 → 자정에 자연스럽게 리셋
function todayKey(): string {
  const ymd = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Seoul",
  });
  return `visits:${ymd}`;
}

// 오늘 접속자 수 읽기 (증가 없음)
export async function GET() {
  const redis = getRedis();
  if (!redis) return Response.json({ count: null });
  try {
    const count = (await redis.get<number>(todayKey())) ?? 0;
    return Response.json({ count });
  } catch (error) {
    console.error(error);
    return Response.json({ count: null });
  }
}

// 오늘 접속자 수 +1 (하루에 브라우저당 한 번만 클라이언트가 호출)
export async function POST() {
  const redis = getRedis();
  if (!redis) return Response.json({ count: null });
  try {
    const key = todayKey();
    const count = await redis.incr(key);
    // 48시간 뒤 자동 삭제 — 지난 날짜 키가 쌓이지 않게 정리
    await redis.expire(key, 60 * 60 * 48);
    return Response.json({ count });
  } catch (error) {
    console.error(error);
    return Response.json({ count: null });
  }
}
