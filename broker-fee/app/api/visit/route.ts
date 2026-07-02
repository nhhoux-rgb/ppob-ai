import { Redis } from "@upstash/redis";

export const runtime = "nodejs";

// 한국 시간(Asia/Seoul) 기준 오늘 날짜 → 자정에 자연스럽게 리셋
function todaySeoul(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
}

// ── 1순위 백엔드: Upstash Redis (연결돼 있으면 이걸 사용) ──────────
function getRedis(): Redis | null {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

// ── 2순위 백엔드: 무료 카운팅 서비스 (셋업 불필요, 즉시 동작) ──────
// 날짜별 키를 써서 하루 단위로 집계된다. 실패하면 null → 카운터 자동 숨김.
// (다른 사이트들과 카운트가 섞이지 않도록 전용 네임스페이스를 사용)
const HOSTED_NS = "broker-fee-calc";

async function hostedCount(
  dateKey: string,
  increment: boolean,
): Promise<number | null> {
  const action = increment ? "hit" : "get";
  const url = `https://abacus.jasoncameron.dev/${action}/${HOSTED_NS}/visits-${dateKey}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(2500) });
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data.value === "number" ? data.value : null;
  } catch {
    return null;
  }
}

// 오늘 접속자 수 읽기 (증가 없음)
export async function GET() {
  const date = todaySeoul();
  const redis = getRedis();
  if (redis) {
    try {
      const count = (await redis.get<number>(`visits:${date}`)) ?? 0;
      return Response.json({ count });
    } catch (error) {
      console.error(error);
    }
  }
  return Response.json({ count: await hostedCount(date, false) });
}

// 오늘 접속자 수 +1 (하루에 브라우저당 한 번만 클라이언트가 호출)
export async function POST() {
  const date = todaySeoul();
  const redis = getRedis();
  if (redis) {
    try {
      const key = `visits:${date}`;
      const count = await redis.incr(key);
      await redis.expire(key, 60 * 60 * 48); // 48시간 뒤 자동 정리
      return Response.json({ count });
    } catch (error) {
      console.error(error);
    }
  }
  return Response.json({ count: await hostedCount(date, true) });
}
