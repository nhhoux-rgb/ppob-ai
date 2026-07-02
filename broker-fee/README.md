# 복비 계산기 (Broker Fee Calculator)

매매·전세·월세 부동산 중개보수(복비)를 법정 상한요율로 즉시 계산해 주는 웹
서비스입니다. 순수 클라이언트 수식 계산이라 AI/서버 비용이 없습니다. 기술
스택은 다른 사이트와 동일합니다 (Next.js 16 App Router + React 19 + Tailwind v4).

## 저장소 구조 — 다른 앱과의 관계

이 폴더(`broker-fee/`)는 **뽑AI 저장소 안에 있지만 완전히 독립된 앱**입니다.

```
ppob-ai/                ← 뽑AI (루트, 그대로 유지)
├── app/                ← 뽑AI 소스
├── desk-fengshui/      ← 책상풍수 (독립 앱)
└── broker-fee/         ← 복비 계산기 (이 앱, 자체 package.json/node_modules)
    ├── app/
    └── package.json
```

- 각 앱은 **의존성·빌드·배포가 서로 완전히 분리**되어 있습니다.
- 다른 앱 코드는 전혀 건드리지 않았습니다.

## 로컬 실행

```bash
cd broker-fee
npm install
npm run dev                    # http://localhost:3000
```

> 다른 앱과 동시에 돌리려면 포트를 나눠 주세요. 예: `npm run dev -- -p 3002`

## Vercel 배포 (별도 도메인·별도 프로젝트)

같은 GitHub 저장소를 Vercel 프로젝트로 **하나 더** 연결합니다.

| 프로젝트 | Root Directory | 도메인 |
| --- | --- | --- |
| 뽑AI | `/` (저장소 루트) | 기존 도메인 |
| 책상풍수 | `desk-fengshui` | 기존 도메인 |
| 복비 계산기 | `broker-fee` | 새 도메인 |

1. Vercel에서 **New Project → 같은 저장소 선택**.
2. **Settings → Root Directory**를 `broker-fee`로 지정.
3. (선택) 아래 환경변수 추가.
4. Deploy. 이후 이 폴더에 푸시할 때만 이 프로젝트가 재배포됩니다.
5. 새 도메인 연결 후, 그 도메인용 Google Search Console / 네이버 사이트 인증
   토큰을 발급받아 `app/layout.tsx`의 `verification` 필드에 추가하세요.

## 환경 변수 (모두 선택 사항)

이 앱은 필수 환경변수가 없습니다. 아래는 있으면 좋은 것들입니다.

| 이름 | 설명 |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | 커스텀 도메인 정식 주소 (미설정 시 Vercel 기본 URL 사용) |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | 방문자 카운터용 Upstash Redis (미설정 시 무료 카운터로 자동 폴백, 그마저 실패하면 카운터 숨김) |
