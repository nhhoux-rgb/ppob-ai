# 책상풍수 (Desk Feng Shui AI)

책상 사진 한 장을 올리면 AI가 재물운·집중력·건강운 관점의 풍수를 재미로 분석해 주는
심심풀이 웹 서비스입니다. 기술 스택은 뽑AI와 동일합니다 (Next.js 16 App Router +
React 19 + Tailwind v4 + OpenAI Structured Outputs).

## 저장소 구조 — 뽑AI와의 관계

이 폴더(`desk-fengshui/`)는 **뽑AI 저장소 안에 있지만 완전히 독립된 앱**입니다.

```
ppob-ai/                ← 뽑AI (루트, 그대로 유지)
├── app/                ← 뽑AI 소스
├── package.json
└── desk-fengshui/      ← 책상풍수 (이 앱, 자체 package.json/node_modules)
    ├── app/
    └── package.json
```

- 두 앱은 **의존성·빌드·배포가 서로 완전히 분리**되어 있습니다.
  (npm workspaces 같은 모노레포 툴을 쓰지 않는 가장 단순한 구조)
- 뽑AI 코드는 전혀 건드리지 않았습니다.

## 로컬 실행

```bash
cd desk-fengshui
npm install
export OPENAI_API_KEY=sk-...   # OpenAI 키 필요
npm run dev                    # http://localhost:3000
```

> 루트(뽑AI)와 이 앱을 동시에 돌리려면 포트를 나눠 주세요.
> 예: `npm run dev -- -p 3001`

## Vercel 배포 (별도 도메인·별도 프로젝트)

같은 GitHub 저장소를 Vercel 프로젝트 **2개**로 연결합니다.

| 프로젝트 | Root Directory | 도메인 |
| --- | --- | --- |
| 뽑AI | `/` (저장소 루트) | 기존 도메인 |
| 책상풍수 | `desk-fengshui` | 새 도메인 |

1. Vercel에서 **New Project → 같은 저장소 선택**.
2. **Settings → Root Directory**를 `desk-fengshui`로 지정.
3. **Environment Variables**에 `OPENAI_API_KEY` 추가.
4. Deploy. 이후 이 폴더에 푸시할 때만 이 프로젝트가 재배포됩니다.

## 환경 변수

| 이름 | 설명 |
| --- | --- |
| `OPENAI_API_KEY` | OpenAI API 키 (필수) |
