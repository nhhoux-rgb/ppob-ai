# `check-answer` 함수 배포

1. Supabase → Edge Functions → **Deploy a new function** → **Via Editor**를 선택합니다.
2. 함수 이름은 반드시 `check-answer`로 입력합니다.
3. `supabase-edge-check-answer.ts` 내용을 전부 붙여넣고 배포합니다.
4. Settings에서 **Verify JWT with legacy secret**를 OFF로 바꾸고 저장합니다.
5. Test에서 Method `POST`, Body를 아래처럼 입력합니다.

```json
{
  "setId": "bright-handler 응답의 setId",
  "questionId": "첫 문제의 id",
  "sequence": 1,
  "choiceIndex": 0
}
```

응답에 `correct`, `correctIndex`, `explanation`, `sourceName`이 나오면 정상입니다.

이 함수는 MVP 테스트용입니다. 출시 전에는 `attemptId`, 서버 타이머, 사용자 세션, 요청 횟수 제한을 추가해 임의 정답 조회를 막습니다.
