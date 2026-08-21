// 랭킹(리더보드) API 클라이언트. Supabase Edge Function 호출.
const SUPABASE_FUNCTIONS = 'https://euifgvsbvqjkzxljmxnl.supabase.co/functions/v1';
const SUBMIT_ENDPOINT = `${SUPABASE_FUNCTIONS}/submit-score`;
const LEADERBOARD_ENDPOINT = `${SUPABASE_FUNCTIONS}/leaderboard`;

async function postJson(url, payload, ms = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `HTTP_${res.status}`);
    return data;
  } finally {
    clearTimeout(timer);
  }
}

// 한 판 결과 제출 → { rank, total, improved, best } 반환. 실패 시 null.
export async function submitScore({ hash, nickname, category, streak, elapsedMs }) {
  try {
    return await postJson(SUBMIT_ENDPOINT, {
      tossUserKeyHash: hash,
      nickname,
      category,
      streak,
      elapsedMs,
    });
  } catch (error) {
    console.warn('submitScore failed', error);
    return null;
  }
}

// 분야 리더보드 조회 → { top, me, total } 반환. 실패 시 null.
export async function fetchLeaderboard({ category, hash }) {
  try {
    return await postJson(LEADERBOARD_ENDPOINT, {
      category,
      tossUserKeyHash: hash || '',
    });
  } catch (error) {
    console.warn('fetchLeaderboard failed', error);
    return null;
  }
}
