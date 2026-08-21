# 5초 브리핑 문제 운영 절차

## 최초 1회

1. `supabase-publish-ai-to-ranked.sql`을 SQL Editor에서 실행합니다.
2. Supabase Secrets에 `OPENAI_API_KEY`를 저장합니다.
3. `ai-quiz` Edge Function을 배포하고 JWT 검증을 끕니다.

## 매일

1. `ai-quiz`에 경제/시사/국제/역사를 각각 POST 요청합니다.
2. Table Editor → questions에서 `fact_checked_at`이 오늘이고 `status=auto_verified`인 문제를 확인합니다.
3. 질문·정답·출처 URL을 검토합니다. 잘못된 문제는 `rejected`로 바꾸고 세트를 다시 생성합니다.
4. 20개가 모두 적합한 분야만 아래 승격 명령을 SQL Editor에서 실행합니다.

```sql
select public.publish_ai_set_as_ranked('economy', current_date);
select public.publish_ai_set_as_ranked('current', current_date);
select public.publish_ai_set_as_ranked('world', current_date);
select public.publish_ai_set_as_ranked('history', current_date);
```

## 자동화 시점

MVP 품질이 안정된 뒤 Supabase Cron으로 매일 오전 4시 생성 작업을 예약할 수 있습니다. 공식 랭킹 승격은 초기에 반드시 사람의 검토 후 실행합니다. 정답 오류율과 신고율이 충분히 낮아진 뒤에만 자동 승격을 검토합니다.

## 모드 구분

- AI 연습: `auto_verified`, 실시간 또는 오늘의 캐시, 랭킹 제외
- 공식 랭킹: `approved`, 관리자 검토 완료, 당일 고정 세트
