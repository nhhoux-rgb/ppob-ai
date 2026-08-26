// 도전권 API 클라이언트. Supabase Edge Function(tickets) 호출.
const ENDPOINT = 'https://euifgvsbvqjkzxljmxnl.supabase.co/functions/v1/tickets';

async function call(payload, ms = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `HTTP_${res.status}`);
    return data;
  } catch (error) {
    console.warn('ticket api failed', payload?.action, error);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// 잔액 조회(+일일지급 반영). { balance, shareLeft } 반환
export const ticketStatus = (playerKey) => call({ action: 'status', playerKey });
// 랭킹전 1장 사용. { ok, balance } — ok=false면 도전권 부족
export const ticketSpend = (playerKey) => call({ action: 'spend', playerKey });
// 보상 적립. kind: 'share' | 'ad'
export const ticketReward = (playerKey, kind) =>
  call({ action: 'reward', playerKey, kind });
// 유료구매 지급(orderId 멱등)
export const ticketPurchase = (playerKey, orderId) =>
  call({ action: 'purchase', playerKey, orderId });
