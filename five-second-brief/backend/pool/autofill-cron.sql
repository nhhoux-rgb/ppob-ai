-- ────────────────────────────────────────────────────────────────
-- 자동보충(Auto-refill) — ai-pool-maintain을 주기적으로 호출해
-- 부족한 난이도의 문제를 계속 채워 넣습니다. (분야는 'auto'로 자동 순환)
--
-- 사전 조건
--   1) Edge Function `ai-pool-maintain` 배포 완료
--   2) Supabase Secrets 에 OPENAI_API_KEY, POOL_MAINTAIN_SECRET 등록 완료
--
-- 이 스크립트는 Supabase SQL Editor 에서 "한 번만" 실행하면 됩니다.
-- (실행 후에는 스케줄러가 알아서 돌아갑니다.)
-- ────────────────────────────────────────────────────────────────

-- 1) 확장 활성화 (이미 켜져 있으면 무시됨)
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- 2) 기존에 같은 이름의 잡이 있으면 제거(중복 방지)
select cron.unschedule('ai-pool-refill')
where exists (select 1 from cron.job where jobname = 'ai-pool-refill');

-- 3) 15분마다 ai-pool-maintain 호출 (category=auto → 경제·시사·국제·역사 순환)
--    호출당 부족한 난이도 1곳을 최대 20문제까지 보충합니다.
select cron.schedule(
  'ai-pool-refill',
  '*/15 * * * *',
  $$
  select net.http_post(
    url     := 'https://euifgvsbvqjkzxljmxnl.supabase.co/functions/v1/ai-pool-maintain',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'x-pool-secret', 'shtngnscjswotbvkqpdltmdhflwlskfrntrnt'
    ),
    body    := jsonb_build_object('category', 'auto'),
    timeout_milliseconds := 60000
  );
  $$
);

-- 확인용: 등록된 잡 조회
select jobid, jobname, schedule, active from cron.job where jobname = 'ai-pool-refill';
