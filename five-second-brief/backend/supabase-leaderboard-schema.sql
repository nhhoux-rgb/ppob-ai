-- 5초 브리핑: 랭킹(리더보드) 스키마
-- 사용자·분야별 "최고 기록"을 저장한다.
-- 순위 기준: 연속 정답 수(내림차순) → 총 풀이 시간(오름차순, 빠를수록 상위).
-- 앱은 직접 접근하지 못하고 Edge Function(service role)으로만 읽고 쓴다.

create table if not exists public.leaderboard_scores (
  toss_user_key_hash text not null,
  category text not null check (category in ('economy','current','world','history')),
  nickname text not null default '게스트',
  best_streak smallint not null check (best_streak between 0 and 20),
  best_elapsed_ms integer not null check (best_elapsed_ms >= 0),
  updated_at timestamptz not null default now(),
  primary key (toss_user_key_hash, category)
);

-- 순위 산정용 인덱스 (분야별, 연속정답 desc, 시간 asc)
create index if not exists leaderboard_rank_idx
  on public.leaderboard_scores (category, best_streak desc, best_elapsed_ms asc);

alter table public.leaderboard_scores enable row level security;
revoke all on public.leaderboard_scores from anon, authenticated;

comment on table public.leaderboard_scores is '분야별 사용자 최고 기록(연속정답/총시간) 리더보드';
