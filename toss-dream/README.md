# 꿈결 · AI 꿈해몽 (Apps in Toss)

꿈을 1~2줄 적으면 Vercel 백엔드(`/api/dream`)가 OpenAI Responses API를 호출해
구조화된 꿈 리포트를 돌려준다. OpenAI 키는 서버에만 있고 AIT 번들에는 들어가지 않는다.

## 구성

| 위치 | 역할 |
| --- | --- |
| `toss-dream/` | 앱인토스 미니앱(Vite, 바닐라 JS). Vercel 배포에서는 제외(`.vercelignore`). |
| `app/api/dream/route.ts` | 레포 루트 Next.js 앱의 해몽 API. CORS 허용, IP당 분당 20회 제한. |
| `public/dream/` | 같은 화면의 웹 공개판 정적 번들. `/dream` 또는 `/dream/index.html`. |
| `public/dream-share.png` | 공유 링크 OG 이미지. |

## 로컬 확인

```bash
npm install
npm run dev    # 개발 모드에서는 API 없이 샘플 해몽이 뜬다
npm test       # 입력 검증 / 샘플 결과 스키마 테스트
```

## 웹 공개판 갱신

```bash
npm run build:web
rm -rf ../public/dream && cp -r dist ../public/dream
```

## AIT 빌드 · 업로드

```bash
npm test
npm run build   # vite build && ait build
```

생성된 `.ait` 파일을 앱인토스 콘솔에 업로드한다. 콘솔의 앱 이름은
`apps-in-toss.config.ts`의 `appName`(`ai-dream`)과 정확히 같아야 한다.

## 보상형 광고

`src/main.js`의 `AD_GROUP_ID` 상수가 비어 있으면 광고 없이 행운 미션을 바로 공개한다.
앱인토스 콘솔에서 보상형 광고그룹을 발급받으면 그 값(`ait.v2.live.xxxx`)만 채우면
`userEarnedReward` 이벤트가 온 뒤에만 미션이 열린다.

## 프로모션 (토스 포인트 지급)

`src/main.js`의 `PROMOTION_CODE`가 비어 있으면 프로모션 카드를 그리지 않는다.
콘솔에서 발급된 코드를 넣으면 결과 화면 맨 위에 "첫 해몽 완료 축하" 카드가 뜨고,
버튼을 누르면 `Promotion.grantReward({ promotionCode, amount })`를 호출한다.

- 검수 통과 뒤 테스트는 `TEST_` 접두사가 붙은 코드로 한다. 실제 포인트가
  차감되지 않으며, 이 호출을 최소 1번 성공시켜야 프로모션을 시작할 수 있다.
- 지급은 1인 1회. 기기의 `localStorage`(`ai-dream-promo-v1`)로 중복 요청을 막고,
  콘솔의 "1인 하루 최대 지급 금액"이 서버 쪽 최종 방어선이다.
- 토스 앱 밖(웹 공개판)이나 `grantReward.isSupported()`가 false인 구버전 앱에서는
  카드를 아예 그리지 않는다. 최소 토스 버전은 Android/iOS 모두 5.232.0.
- 지급 조건·시점·제한과 "사전 고지 없이 중단될 수 있어요" 고지는 카드 안에 함께 띄운다.

## 저장과 개인정보

저장 버튼은 최근 결과 10개를 사용자 기기의 `localStorage`에만 보관한다. 서버는 OpenAI
요청에 `store: false`를 쓰고 별도 DB를 두지 않는다. 꿈 내용에 이름·연락처 등 개인정보를
적지 않도록 입력 화면에서 안내한다.
