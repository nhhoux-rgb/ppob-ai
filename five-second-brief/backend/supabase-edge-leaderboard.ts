// Supabase Edge Function: leaderboard
// 분야별 상위 기록과(있다면) 호출자의 순위를 돌려준다.
// 순위 기준: best_streak desc, best_elapsed_ms asc.
//
// 배포: supabase functions deploy leaderboard --no-verify-jwt
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
const TOP_N = 20;

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
    const category = body?.category;
    const hash =
      typeof body?.tossUserKeyHash === 'string' ? body.tossUserKeyHash.trim() : '';
    if (!CATEGORIES.includes(category)) return json({ error: 'INVALID_REQUEST' }, 400);

    const url = Deno.env.get('SUPABASE_URL');
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !key) return json({ error: 'SERVER_NOT_CONFIGURED' }, 500);
    const admin = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: rows, error } = await admin
      .from('leaderboard_scores')
      .select('toss_user_key_hash, nickname, best_streak, best_elapsed_ms')
      .eq('category', category)
      .order('best_streak', { ascending: false })
      .order('best_elapsed_ms', { ascending: true })
      .limit(TOP_N);
    if (error) throw error;

    const top = (rows ?? []).map((r: any, i: number) => ({
      rank: i + 1,
      nickname: r.nickname,
      streak: r.best_streak,
      elapsedMs: r.best_elapsed_ms,
      me: hash !== '' && r.toss_user_key_hash === hash,
    }));

    const { count: total } = await admin
      .from('leaderboard_scores')
      .select('toss_user_key_hash', { count: 'exact', head: true })
      .eq('category', category);

    let me: { rank: number; streak: number; elapsedMs: number } | null = null;
    if (hash) {
      const { data: mine } = await admin
        .from('leaderboard_scores')
        .select('best_streak, best_elapsed_ms')
        .eq('toss_user_key_hash', hash)
        .eq('category', category)
        .maybeSingle();
      if (mine) {
        me = {
          rank: await rankOf(admin, category, mine.best_streak, mine.best_elapsed_ms),
          streak: mine.best_streak,
          elapsedMs: mine.best_elapsed_ms,
        };
      }
    }

    return json({ category, top, me, total: total ?? 0 });
  } catch (error) {
    console.error(error);
    return json({ error: 'INTERNAL_SERVER_ERROR' }, 500);
  }
});
