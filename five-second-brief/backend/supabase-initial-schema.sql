-- 5초 브리핑: Supabase 초기 스키마
create extension if not exists pgcrypto;

create type public.quiz_mode as enum ('ranked', 'ai_practice');
create type public.question_status as enum ('draft', 'auto_verified', 'approved', 'rejected', 'expired');
create type public.attempt_status as enum ('playing', 'finished', 'abandoned', 'invalid');
create type public.attempt_tx_type as enum ('daily_grant', 'ad_reward', 'purchase', 'use', 'refund', 'admin');

create table public.app_users (
  id uuid primary key default gen_random_uuid(),
  toss_user_key_hash text unique not null,
  nickname text,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('economy','current','world','history')),
  prompt text not null,
  choices jsonb not null check (jsonb_array_length(choices) = 4),
  answer_index smallint not null check (answer_index between 0 and 3),
  explanation text not null,
  difficulty smallint not null check (difficulty between 1 and 5),
  source_name text not null,
  source_url text not null,
  source_published_at timestamptz,
  fact_checked_at timestamptz not null,
  expires_at timestamptz,
  status public.question_status not null default 'draft',
  ai_generated boolean not null default false,
  model_version text,
  content_hash text unique not null,
  reviewed_by text,
  created_at timestamptz not null default now()
);

create table public.quiz_sets (
  id uuid primary key default gen_random_uuid(),
  set_date date not null,
  category text not null check (category in ('economy','current','world','history')),
  mode public.quiz_mode not null,
  published_at timestamptz,
  expires_at timestamptz not null,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  unique (set_date, category, mode)
);

create table public.quiz_set_questions (
  quiz_set_id uuid not null references public.quiz_sets(id) on delete cascade,
  question_id uuid not null references public.questions(id),
  sequence smallint not null check (sequence between 1 and 20),
  time_limit_ms integer not null check (time_limit_ms between 3000 and 5000),
  primary key (quiz_set_id, sequence),
  unique (quiz_set_id, question_id)
);

create table public.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id),
  quiz_set_id uuid not null references public.quiz_sets(id),
  mode public.quiz_mode not null,
  status public.attempt_status not null default 'playing',
  correct_streak smallint not null default 0 check (correct_streak between 0 and 20),
  total_elapsed_ms integer not null default 0 check (total_elapsed_ms >= 0),
  end_reason text,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  idempotency_key uuid unique not null default gen_random_uuid()
);

create table public.attempt_answers (
  attempt_id uuid not null references public.attempts(id) on delete cascade,
  sequence smallint not null check (sequence between 1 and 20),
  question_id uuid not null references public.questions(id),
  choice_index smallint check (choice_index between 0 and 3),
  is_correct boolean not null,
  elapsed_ms integer not null check (elapsed_ms >= 0),
  answered_at timestamptz not null default now(),
  primary key (attempt_id, sequence)
);

create table public.attempt_balances (
  user_id uuid primary key references public.app_users(id) on delete cascade,
  balance integer not null default 0 check (balance >= 0),
  updated_at timestamptz not null default now()
);

create table public.attempt_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id),
  type public.attempt_tx_type not null,
  amount integer not null check (amount <> 0),
  external_ref text,
  idempotency_key text unique not null,
  created_at timestamptz not null default now()
);

create table public.ai_generation_jobs (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  status text not null default 'queued',
  requested_count integer not null default 20,
  accepted_count integer not null default 0,
  provider text,
  model_version text,
  error_message text,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now()
);

create index attempts_rank_idx on public.attempts (quiz_set_id, correct_streak desc, total_elapsed_ms asc)
  where status = 'finished' and mode = 'ranked';
create index questions_pool_idx on public.questions (category, status, difficulty, expires_at);

-- 앱에서 테이블을 직접 수정하지 못하게 하고 Edge Function을 통해서만 접근합니다.
alter table public.app_users enable row level security;
alter table public.questions enable row level security;
alter table public.quiz_sets enable row level security;
alter table public.quiz_set_questions enable row level security;
alter table public.attempts enable row level security;
alter table public.attempt_answers enable row level security;
alter table public.attempt_balances enable row level security;
alter table public.attempt_transactions enable row level security;
alter table public.ai_generation_jobs enable row level security;

revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;

comment on table public.questions is '검수 문제은행 및 출처/유효기간';
comment on table public.quiz_sets is '공식 일일 세트와 AI 연습 세트';
comment on table public.attempt_transactions is '광고·구매·사용 도전권 원장';
