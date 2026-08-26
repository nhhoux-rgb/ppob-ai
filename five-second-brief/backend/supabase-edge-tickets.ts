// Supabase Edge Function: tickets
// 도전권 잔액 관리. 매일(KST) 10장으로 채워주고, 공유(+1, 하루 5회)·광고(+5)·
// 유료구매(+30, orderId 멱등)로 적립하며, 랭킹전 1판당 1장을 사용한다.
//
// 배포: supabase functions deploy tickets --no-verify-jwt
import { createClient } from 'npm:@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (d: unknown, s = 200) =>
  new Response(JSON.stringify(d), {
    status: s,
    headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8' },
  });

const DAILY = 10; // 매일 최소 보장 장수
const SHARE = 1; // 공유 1회 보상
const SHARE_CAP = 5; // 하루 공유 보상 최대 횟수
const AD = 5; // 광고 1회 보상
const PURCHASE = 30; // 유료 1건 지급 장수

function kstDate(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function cleanKey(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const s = raw.trim();
  if (s.length < 1 || s.length > 128) return null;
  return s;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'METHOD_NOT_ALLOWED' }, 405);
  try {
    const body = await req.json().catch(() => ({}));
    const key = cleanKey(body?.playerKey);
    const action = body?.action;
    if (!key) return json({ error: 'INVALID_REQUEST' }, 400);

    const url = Deno.env.get('SUPABASE_URL');
    const svc = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !svc) return json({ error: 'SERVER_NOT_CONFIGURED' }, 500);
    const db = createClient(url, svc, { auth: { persistSession: false } });

    // 현재 행(없으면 초기값)
    const { data: row } = await db
      .from('player_tickets')
      .select('balance, daily_grant_date, share_date, share_count')
      .eq('player_key', key)
      .maybeSingle();

    const today = kstDate();
    let balance = row?.balance ?? 0;
    let shareDate = row?.share_date ?? null;
    let shareCount = row?.share_count ?? 0;
    let dailyDate = row?.daily_grant_date ?? null;
    const ledger: { player_key: string; kind: string; amount: number; ref?: string }[] = [];

    // 일일 지급: 오늘 아직 안 줬으면 최소 DAILY장까지 채움
    if (dailyDate !== today) {
      const add = Math.max(0, DAILY - balance);
      if (add > 0) {
        balance += add;
        ledger.push({ player_key: key, kind: 'daily', amount: add });
      }
      dailyDate = today;
    }
    // 공유 카운트 날짜 리셋
    if (shareDate !== today) {
      shareDate = today;
      shareCount = 0;
    }

    let ok = true;
    let reason: string | undefined;

    if (action === 'spend') {
      if (balance >= 1) {
        balance -= 1;
        ledger.push({ player_key: key, kind: 'spend', amount: -1 });
      } else {
        ok = false;
        reason = 'NO_TICKET';
      }
    } else if (action === 'reward') {
      const kind = body?.kind;
      if (kind === 'share') {
        if (shareCount < SHARE_CAP) {
          balance += SHARE;
          shareCount += 1;
          ledger.push({ player_key: key, kind: 'share', amount: SHARE });
        } else {
          ok = false;
          reason = 'SHARE_CAP';
        }
      } else if (kind === 'ad') {
        balance += AD;
        ledger.push({ player_key: key, kind: 'ad', amount: AD });
      } else {
        return json({ error: 'INVALID_REWARD' }, 400);
      }
    } else if (action === 'purchase') {
      const orderId = typeof body?.orderId === 'string' ? body.orderId.trim() : '';
      if (!orderId) return json({ error: 'INVALID_ORDER' }, 400);
      // 멱등: 원장에 먼저 기록 시도(중복이면 이미 지급된 것)
      const { error: dup } = await db
        .from('ticket_ledger')
        .insert({ player_key: key, kind: 'purchase', amount: PURCHASE, ref: orderId });
      if (dup) {
        // 이미 지급됨 → 잔액 그대로
      } else {
        balance += PURCHASE;
      }
    } else if (action !== 'status') {
      return json({ error: 'UNKNOWN_ACTION' }, 400);
    }

    // 잔액/카운트 저장
    const { error: upErr } = await db.from('player_tickets').upsert(
      {
        player_key: key,
        balance,
        daily_grant_date: dailyDate,
        share_date: shareDate,
        share_count: shareCount,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'player_key' },
    );
    if (upErr) throw upErr;

    // 원장 일괄 기록(구매 제외: 위에서 처리)
    if (ledger.length) await db.from('ticket_ledger').insert(ledger);

    return json({
      ok,
      reason,
      balance,
      shareLeft: Math.max(0, SHARE_CAP - shareCount),
      config: { daily: DAILY, share: SHARE, ad: AD, purchase: PURCHASE },
    });
  } catch (error) {
    console.error(error);
    return json({ error: 'INTERNAL_SERVER_ERROR' }, 500);
  }
});
