-- 5초 브리핑: 도전권(티켓) 시스템
-- 사용자별 도전권 잔액을 관리한다. 신원은 랭킹과 동일하게 player_key(toss:hash / web:...).
-- 앱은 직접 접근하지 못하고 Edge Function(service role)으로만 읽고 쓴다.

create table if not exists public.player_tickets (
  player_key text primary key,
  balance integer not null default 0 check (balance >= 0),
  daily_grant_date date,                 -- 마지막 일일지급 날짜(KST)
  share_date date,                       -- 공유 보상 카운트 기준 날짜(KST)
  share_count integer not null default 0,-- 오늘 공유로 받은 횟수
  updated_at timestamptz not null default now()
);

-- 감사/멱등용 원장. 유료 구매는 (kind='purchase', ref=orderId)로 중복 지급을 막는다.
create table if not exists public.ticket_ledger (
  id bigserial primary key,
  player_key text not null,
  kind text not null,          -- daily | share | ad | purchase | spend
  amount integer not null,
  ref text,                    -- orderId 등
  created_at timestamptz not null default now()
);
create unique index if not exists ticket_ledger_purchase_ref
  on public.ticket_ledger (kind, ref) where ref is not null;

alter table public.player_tickets enable row level security;
alter table public.ticket_ledger enable row level security;
revoke all on public.player_tickets from anon, authenticated;
revoke all on public.ticket_ledger from anon, authenticated;

comment on table public.player_tickets is '사용자별 도전권 잔액';
comment on table public.ticket_ledger is '도전권 지급/사용 원장(구매는 orderId로 멱등)';
