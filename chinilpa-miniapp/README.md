# 친일파 테스트 — 토스 미니앱

웹앱(`../chinilpa-test`)의 앱인토스 버전. Vite + `@apps-in-toss/web-framework`.

## 개발

```bash
npm install
npm run dev      # 브라우저에서 확인 (네이티브 API는 무시된다)
npm run build    # vite build && ait build
npm run deploy   # ait deploy
npm run brand    # 제출용 아이콘·대표 이미지 생성
```

## 문항 데이터는 웹앱 것을 그대로 쓴다

`src/data.ts`가 `../../chinilpa-test/app/`의 `questions.ts`와 `types.ts`를
그대로 재수출한다. 복사본을 두면 문항을 고칠 때 웹과 미니앱이 갈라지고,
보정으로 정한 판정 임계값도 따로 놀게 된다.

그래서 **문항을 고치면 웹앱 쪽에서 고치고, 거기서 보정을 다시 돌린다.**

```bash
cd ../chinilpa-test && npm run calibrate && npm run verify
```

## 집계

결과 분포는 웹앱과 같은 저장소를 쓴다. 미니앱에만 따로 쌓으면 "지금까지
N명이 조사받았습니다"가 두 갈래로 갈라진다.

토스의 아웃바운드 프록시가 CORS 프리플라이트를 막기 때문에(`toss-miniapp`에서
이미 겪은 문제, 커밋 `1b1818a`) `Content-Type: text/plain`으로 보내
**단순 요청**으로 만든다. 그러면 `OPTIONS`가 아예 가지 않는다. 응답을 읽으려면
서버 쪽 CORS 헤더는 여전히 필요해서 `chinilpa-test/app/api/stats/route.ts`에
넣어 두었다.

API 주소는 `VITE_API_BASE`로 바꿀 수 있다. 기본값은 배포된 웹앱이다.

## 네이티브 API

전부 `try/catch`로 감쌌다. 토스 앱 밖(브라우저 개발 중)에서는 조용히 무시되고
웹 표준 동작으로 떨어진다.

| 용도 | API |
| --- | --- |
| 결과 공유 | `Share.sendMessage` |
| 선택 시 진동 | `Device.triggerHaptic` |
| 노치·홈 인디케이터 | `SafeArea.get` / `SafeArea.subscribe` |

`share`, `generateHapticFeedback`, `getTossShareLink`는 deprecated라 쓰지
않는다.

권한은 하나도 요청하지 않는다(`permissions: []`). 문항을 고르는 것이 전부라
카메라도 사진첩도 필요 없다.

## 제출용 이미지

토스 개발자센터 "노출 정보" 규격에 맞춘 결과물이 `brand/out/`에 있다.

```bash
npm run logo                  # 앱 로고 600×600 (라이트·다크)
npm run brand                 # 대표 이미지 배너
npm run build && npm run shots # 스크린샷
```

| 파일 | 규격 | 용도 |
| --- | --- | --- |
| `app-logo-600-light.png` | 600×600 | **앱 로고** |
| `app-logo-600-dark.png` | 600×600 | **다크모드 앱 로고** |
| `alt-plain-600-*.png` | 600×600 | 연도만 있는 대안 |
| `screenshots/portrait-*.png` | 636×1048 | **세로형 스크린샷** (6장, 최소 3장) |
| `screenshots/landscape-*.png` | 1504×741 | **가로형 스크린샷** (2장, 최소 1장) |
| `banner-1280x720.png` | 1280×720 | 그 밖의 홍보용 |

### 로고를 이렇게 정한 이유

처음에는 서식지의 `秘` 도장을 그대로 썼는데, 앱 목록에서 보면 무슨 앱인지
짐작이 가지 않았다. 갈림길 기호도 만들어 봤지만 원 안에 넣든 아니든 알파벳
`Y` 로 읽혀서 버렸다.

남은 것이 연도다. 60px 로 줄여도 숫자는 끝까지 읽히고, 어느 시대 이야기인지가
그 자체로 전달된다. `brand/logo.mjs` 에 대안까지 함께 두었으니 바꾸고 싶으면
거기서 고르면 된다.

### 스크린샷은 그림이 아니라 실제 캡처다

`brand/screenshots.mjs` 가 빌드된 앱을 크로미움에 띄우고 문항을 눌러 가며
찍는다. 손으로 그린 목업은 앱이 바뀌면 조용히 거짓이 되지만, 이건 `dist` 를
그대로 찍으므로 항상 현재 화면과 일치한다. 앱을 고쳤으면 다시 돌리면 된다.

집계 API 응답은 가로채지 않는다. 없는 이용자 수를 지어내면 스토어에 거짓을
올리는 셈이라, 표본이 없을 때 실제로 보이는 화면 그대로 찍는다.

가로형만은 예외적으로 구성이 들어간다. 앱을 1504 폭으로 띄우면 본문이 가운데
560px 에만 몰리고 양옆이 텅 비기 때문에, 방금 찍은 세로 캡처를 그대로 얹어
가로로 배치한다. 새로 그리는 게 아니라 진짜 캡처를 놓는 것이다.

**폰트 주의**: 구글 폰트판 나눔명조에는 한자 글리프가 하나도 없다. 그래서
한글은 나눔명조, 한자(`秘`, `所見`, 결과 도장 아홉 자)는 Noto Serif KR이
맡는다. `index.html`의 폰트 링크와 `brand/generate.mjs`가 같은 구성이다.
폰트 파일은 `brand/.fonts`에 캐시되며 저장소에 넣지 않는다(16MB).
