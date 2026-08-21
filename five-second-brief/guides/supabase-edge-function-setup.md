# `get-daily-quiz` Edge Function 만들기

1. Supabase 왼쪽 메뉴에서 번개 모양 **Edge Functions**를 선택합니다.
2. **Deploy a new function** 또는 **Create function**을 누릅니다.
3. Dashboard editor 방식이 보이면 선택합니다.
4. 함수 이름에 정확히 `get-daily-quiz`를 입력합니다.
5. 기본 예제 코드를 전부 지우고 `supabase-edge-get-daily-quiz.ts` 내용을 붙여넣습니다.
6. JWT 검증 옵션이 보이면 우선 **OFF**로 설정합니다. 이 함수는 공개 문제 조회 전용이며 정답·사용자정보를 반환하지 않습니다. 이후 앱 서명과 요청 제한을 추가합니다.
7. **Deploy function**을 누릅니다.

## 테스트

배포 후 함수 상세 화면에서 **Test** 또는 **Invoke**를 선택합니다.

- Method: `GET`
- Query parameter: `category=economy`
- Body: 비워둠

정상 응답에는 `setId`, `date`, `category`, `questions`가 표시되고 `questions` 배열은 20개여야 합니다. 각 문제에는 `answer_index`가 없어야 정상입니다.

테스트 URL 형식:

`https://<PROJECT_REF>.supabase.co/functions/v1/get-daily-quiz?category=economy`

## 현재 공개 범위

이 첫 함수는 테스트를 위해 공개 조회로 둡니다. 데이터베이스 테이블은 계속 비공개이며 함수가 서비스 키로 필요한 열만 읽습니다. 출시 전에는 앱 세션 검증, 요청 횟수 제한, 정확한 CORS 도메인 제한을 추가합니다.
