# AI 퀴즈 완성 설정

## 1. OpenAI API 키를 Supabase Secret에 저장

Supabase → Edge Functions → **Secrets** → Add secret

- Name: `OPENAI_API_KEY`
- Value: OpenAI API 대시보드에서 발급한 서버용 API 키

키는 채팅, 앱 코드, SQL Editor에 붙이지 않습니다.

## 2. `ai-quiz` 함수 생성

Edge Functions → Deploy a new function → Via Editor

- 함수 이름: `ai-quiz`
- 코드: `supabase-edge-ai-quiz.ts` 전체
- 배포 후 Settings에서 Verify JWT with legacy secret: OFF

## 3. 테스트

- Method: POST
- Body:

```json
{"category":"current"}
```

첫 요청은 검색·생성 때문에 시간이 걸릴 수 있습니다. 성공하면 20문제와 `cached:false`가 반환됩니다. 같은 날 두 번째 요청은 저장된 세트를 반환하며 `cached:true`가 표시됩니다.

## 운영 정책

- AI 연습 세트만 자동 노출됩니다.
- `questions.status`는 `auto_verified`로 저장됩니다.
- 관리자가 승인한 문제만 `approved`로 바꿔 공식 랭킹 세트 후보로 사용합니다.
- 출처 도메인, 질문 길이, 보기 중복, 문제 수 검증 실패 시 전체 생성을 폐기합니다.
