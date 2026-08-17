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

`npm run brand` → `brand/out/`

| 파일 | 용도 |
| --- | --- |
| `icon.svg` | 아이콘 마스터 (벡터) |
| `icon-1024/512/256/192.png` | 앱 아이콘 |
| `banner-1280x720.png` | 대표 이미지 (16:9) |
| `banner-1200x630.png` | 대표 이미지 (OG 비율) |

토스가 요구하는 정확한 규격이 확인되면 `brand/generate.mjs`의 크기 목록에
숫자만 추가해서 다시 돌리면 된다. 벡터라 어떤 크기로 뽑아도 깨지지 않는다.

**폰트 주의**: 구글 폰트판 나눔명조에는 한자 글리프가 하나도 없다. 그래서
한글은 나눔명조, 한자(`秘`, `所見`, 결과 도장 아홉 자)는 Noto Serif KR이
맡는다. `index.html`의 폰트 링크와 `brand/generate.mjs`가 같은 구성이다.
폰트 파일은 `brand/.fonts`에 캐시되며 저장소에 넣지 않는다(16MB).
