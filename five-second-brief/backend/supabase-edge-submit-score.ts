// Supabase Edge Function: submit-score
// 한 판 결과(연속 정답 수 · 총 풀이 시간)를 받아 분야별 "최고 기록"을 갱신하고
// 갱신 후 순위를 돌려준다. 순위 기준: best_streak desc, best_elapsed_ms asc.
//
// 배포: supabase functions deploy submit-score --no-verify-jwt
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' },
  });

const CATEGORIES = ['economy', 'current', 'world', 'history'];

function cleanNickname(raw: unknown): string {
  if (typeof raw !== 'string') return '게스트';
  const s = Array.from(raw)
    .filter((ch) => ch >= ' ')
    .join('')
    .trim()
    .slice(0, 16);
  return s.length > 0 ? s : '게스트';
}

// 분야에서 (streak, elapsedMs)보다 상위인 기록 수 → 순위 = 그 수 + 1
async function rankOf(
  admin: any,
  category: string,
  streak: number,
  elapsedMs: number,
): Promise<number> {
  const { count } = await admin
    .from('leaderboard_scores')
    .select('toss_user_key_hash', { count: 'exact', head: true })
    .eq('category', category)
    .or(
      `best_streak.gt.${streak},and(best_streak.eq.${streak},best_elapsed_ms.lt.${elapsedMs})`,
    );
  return (count ?? 0) + 1;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'METHOD_NOT_ALLOWED' }, 405);
  try {
    const body = await req.json().catch(() => ({}));
    const hash = typeof body?.tossUserKeyHash === 'string' ? body.tossUserKeyHash.trim() : '';
    const category = body?.category;
    const streak = Number(body?.streak);
    const elapsedMs = Number(body?.elapsedMs);

    if (
      !hash ||
      hash.length > 128 ||
      !CATEGORIES.includes(category) ||
      !Number.isInteger(streak) ||
      streak < 0 ||
      streak > 20 ||
      !Number.isInteger(elapsedMs) ||
      elapsedMs < 0
    ) {
      return json({ error: 'INVALID_REQUEST' }, 400);
    }
    const nickname = cleanNickname(body?.nickname);

    const url = Deno.env.get('SUPABASE_URL');
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !key) return json({ error: 'SERVER_NOT_CONFIGURED' }, 500);
    const admin = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // 기존 최고 기록 조회
    const { data: existing } = await admin
      .from('leaderboard_scores')
      .select('best_streak, best_elapsed_ms')
      .eq('toss_user_key_hash', hash)
      .eq('category', category)
      .maybeSingle();

    const isBetter =
      !existing ||
      streak > existing.best_streak ||
      (streak === existing.best_streak && elapsedMs < existing.best_elapsed_ms);

    const bestStreak = isBetter ? streak : existing.best_streak;
    const bestElapsed = isBetter ? elapsedMs : existing.best_elapsed_ms;

    // 닉네임은 항상 최신화, 기록은 더 좋을 때만 갱신
    const { error: upsertError } = await admin.from('leaderboard_scores').upsert(
      {
        toss_user_key_hash: hash,
        category,
        nickname,
        best_streak: bestStreak,
        best_elapsed_ms: bestElapsed,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'toss_user_key_hash,category' },
    );
    if (upsertError) throw upsertError;

    const rank = await rankOf(admin, category, bestStreak, bestElapsed);
    const { count: total } = await admin
      .from('leaderboard_scores')
      .select('toss_user_key_hash', { count: 'exact', head: true })
      .eq('category', category);

    return json({
      rank,
      total: total ?? 0,
      improved: isBetter,
      best: { streak: bestStreak, elapsedMs: bestElapsed },
    });
  } catch (error) {
    console.error(error);
    return json({ error: 'INTERNAL_SERVER_ERROR' }, 500);
  }
});
