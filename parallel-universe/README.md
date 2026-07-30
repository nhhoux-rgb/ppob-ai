# 평행우주 나의 삶 (Parallel Universe You)

인생의 갈림길 하나를 적으면, 그때 다른 선택을 한 **평행우주 속 또 다른 나**의 삶
3가지를 AI가 이야기로 그려주는 심심풀이 웹 서비스입니다. 기술 스택은 뽑AI와
동일합니다 (Next.js 16 App Router + React 19 + Tailwind v4 + OpenAI Structured
Outputs).

## 콘셉트

- 입력: 인생의 갈림길 한 줄(필수) + 지금의 나 한 줄(선택)
- 출력: 서로 결이 다른 평행우주 3개
  - 우주 이름 · 다른 선택 · 감성 태그라인
  - 직업 · 사는 곳 · 행복 지수 · 부 지수
  - 그 우주에서의 삶(스토리) · 최고의 순간 · 남은 아쉬움
  - 그리고 지금의 나에게 건네는 따뜻한 한마디
- 결과 이미지 저장 + 공유로 바이럴 유도

## 저장소 구조 — 뽑AI와의 관계

이 폴더(`parallel-universe/`)는 **뽑AI 저장소 안에 있지만 완전히 독립된 앱**입니다.

```
ppob-ai/                    ← 뽑AI (루트, 그대로 유지)
├── app/                    ← 뽑AI 소스
├── package.json
├── desk-fengshui/          ← 책상풍수 (독립 앱)
└── parallel-universe/      ← 평행우주 나의 삶 (이 앱, 자체 package.json/node_modules)
    ├── app/
    └── package.json
```

- 각 앱은 **의존성·빌드·배포가 서로 완전히 분리**되어 있습니다.
- 뽑AI를 비롯한 다른 앱의 코드는 전혀 건드리지 않았습니다.

## 로컬 실행

```bash
cd parallel-universe
npm install
export OPENAI_API_KEY=sk-...   # OpenAI 키 필요
npm run dev                    # http://localhost:3000
```

> 루트(뽑AI)나 다른 앱과 동시에 돌리려면 포트를 나눠 주세요.
> 예: `npm run dev -- -p 3002`

## Vercel 배포 (별도 도메인·별도 프로젝트)

같은 GitHub 저장소를 Vercel 프로젝트로 하나 더 연결합니다.

| 프로젝트 | Root Directory | 도메인 |
| --- | --- | --- |
| 뽑AI | `/` (저장소 루트) | 기존 도메인 |
| 평행우주 나의 삶 | `parallel-universe` | 새 도메인 |

1. Vercel에서 **New Project → 같은 저장소 선택**.
2. **Settings → Root Directory**를 `parallel-universe`로 지정.
3. **Environment Variables**에 `OPENAI_API_KEY` 추가.
4. Deploy. 이후 이 폴더에 푸시할 때만 이 프로젝트가 재배포됩니다.

## 환경 변수

| 이름 | 설명 |
| --- | --- |
| `OPENAI_API_KEY` | OpenAI API 키 (필수) |
| `NEXT_PUBLIC_SITE_URL` | 커스텀 도메인 (선택, OG·sitemap용) |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | 방문자 카운터용 Upstash Redis (선택) |
