-- 분야별 100문제 풀과 사용자별 노출 이력
alter table public.quiz_sets add column if not exists player_key text;
update public.quiz_sets set player_key='__shared__' where player_key is null;
alter table public.quiz_sets alter column player_key set default '__shared__';
alter table public.quiz_sets alter column player_key set not null;

alter table public.quiz_sets drop constraint if exists quiz_sets_set_date_category_mode_key;
create unique index if not exists quiz_sets_daily_player_key
  on public.quiz_sets(set_date,category,mode,player_key);

create table if not exists public.question_exposures(
  player_key text not null,
  question_id uuid not null references public.questions(id) on delete cascade,
  category text not null check(category in('economy','current','world','history')),
  shown_at timestamptz not null default now(),
  primary key(player_key,question_id)
);
create index if not exists question_exposures_player_category_idx
  on public.question_exposures(player_key,category,shown_at desc);
alter table public.question_exposures enable row level security;
revoke all on public.question_exposures from anon,authenticated;

-- 풀 조회 성능
create index if not exists questions_active_pool_idx
  on public.questions(category,difficulty,fact_checked_at desc)
  where status in('auto_verified','approved');
