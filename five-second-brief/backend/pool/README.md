# 문제 풀(pool) 운영 — 자동보충 + 기본문제 보충

문제가 반복되는 걸 막기 위한 두 축입니다.

## 1) 기본문제 보충 (시드)
- `build-seed.mjs` → 분야별 80문제(난이도 1~5 × 16) = **총 320문제** 생성.
- 실행: `node build-seed.mjs` → `seed-<분야>-80.sql` 4개 + 합본 `seed-all-320.sql`.
- 적용: Supabase **SQL Editor**에 `seed-all-320.sql`를 붙여넣고 실행(여러 번 실행해도 `content_hash` 기준 중복 없음).
- 이 시드는 만료 365일 · `status='approved'`라서 AI가 없어도 서버 출제가 항상 동작합니다.

## 2) 자동보충 (AI, 주기 실행)
- Edge Function `ai-pool-maintain` 이 호출될 때마다 **가장 부족한 난이도**를 최대 20문제 채웁니다.
  - 분야 목표: 200문제/분야 (난이도별 40). 만료: 시사(current) 30일 · 나머지 365일.
  - OpenAI 웹검색으로 공식 원문(도메인 화이트리스트) 기반 문제만 채택.
- 준비물: Supabase Secrets 에 `OPENAI_API_KEY`, `POOL_MAINTAIN_SECRET`.
- 스케줄 등록: `autofill-cron.sql` 을 SQL Editor에서 **한 번** 실행 → 30분마다 `category=auto`로 순환 호출.
- 잡 확인:  `select * from cron.job where jobname='ai-pool-refill';`
- 잡 해제:  `select cron.unschedule('ai-pool-refill');`

## 파일
| 파일 | 용도 |
|---|---|
| `build-seed.mjs` | 시드 SQL 생성기(수정 후 재생성) |
| `seed-all-320.sql` | 기본문제 320개 합본(붙여넣기용) |
| `seed-<분야>-80.sql` | 분야별 시드(개별) |
| `autofill-cron.sql` | 자동보충 pg_cron 등록(1회 실행) |
