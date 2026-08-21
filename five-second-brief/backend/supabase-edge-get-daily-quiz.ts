// Supabase Edge Function: get-daily-quiz
// 공식 문제 세트에서 정답을 제외한 문제만 반환합니다.
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // 앱인토스 도메인 확정 후 해당 도메인으로 제한
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'GET') return json({ error: 'METHOD_NOT_ALLOWED' }, 405);

  try {
    const url = new URL(req.url);
    const category = url.searchParams.get('category') ?? 'economy';
    const allowed = new Set(['economy', 'current', 'world', 'history']);
    if (!allowed.has(category)) return json({ error: 'INVALID_CATEGORY' }, 400);

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceKey) return json({ error: 'SERVER_NOT_CONFIGURED' }, 500);

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const today = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit',
    }).format(new Date());

    const { data: set, error: setError } = await admin
      .from('quiz_sets')
      .select('id, set_date, category, mode, expires_at')
      .eq('set_date', today)
      .eq('category', category)
      .eq('mode', 'ranked')
      .eq('is_active', true)
      .maybeSingle();

    if (setError) throw setError;
    if (!set) return json({ error: 'QUIZ_SET_NOT_FOUND', category, date: today }, 404);

    const { data: rows, error: questionError } = await admin
      .from('quiz_set_questions')
      .select('sequence, time_limit_ms, questions!inner(id, category, prompt, choices)')
      .eq('quiz_set_id', set.id)
      .order('sequence');

    if (questionError) throw questionError;
    if (!rows || rows.length !== 20) {
      return json({ error: 'INCOMPLETE_QUIZ_SET', count: rows?.length ?? 0 }, 503);
    }

    const questions = rows.map((row: any) => ({
      id: row.questions.id,
      sequence: row.sequence,
      category: row.questions.category,
      prompt: row.questions.prompt,
      choices: row.questions.choices,
      timeLimitMs: row.time_limit_ms,
    }));

    return json({
      setId: set.id,
      date: set.set_date,
      category: set.category,
      mode: set.mode,
      expiresAt: set.expires_at,
      questions,
    });
  } catch (error) {
    console.error(error);
    return json({ error: 'INTERNAL_SERVER_ERROR' }, 500);
  }
});
