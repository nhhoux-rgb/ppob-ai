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

## 저장과 개인정보

저장 버튼은 최근 결과 10개를 사용자 기기의 `localStorage`에만 보관한다. 서버는 OpenAI
요청에 `store: false`를 쓰고 별도 DB를 두지 않는다. 꿈 내용에 이름·연락처 등 개인정보를
적지 않도록 입력 화면에서 안내한다.
