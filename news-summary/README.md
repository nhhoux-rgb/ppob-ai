# 뉴스클리핑 (News Summary Image)

기사 링크를 붙여넣으면 **언론사·배포일·강조 제목·부제·요약 본문**이 담긴 깔끔한
요약 이미지를 만들어 주는 웹 서비스입니다. 부동산 보고서 등에 바로 붙여넣을 수 있게
고해상도 PNG로 내려받을 수 있습니다. 기술 스택은 뽑AI·책상풍수와 동일합니다
(Next.js 16 App Router + React 19 + Tailwind v4 + OpenAI Structured Outputs).

## 핵심 동작

```
[기사 링크] ──▶ /api/extract  (서버에서 페이지 fetch → OG메타·JSON-LD·본문·로고 추출)
                      │  (페이지가 막히면 실패 응답 → 붙여넣기 모드로 자동 전환)
[본문 붙여넣기]─┘
        ▼
   /api/summarize  (OpenAI gpt-4.1-mini · Structured Outputs)
        ▼
   요약 카드 렌더(수정 가능) ──▶ html-to-image 로 PNG 저장
```

- **입력 두 갈래**: URL 우선, 접근이 막히면 본문 직접 붙여넣기로 폴백.
- **언론사 로고**: 사이트에서 자동 감지(apple-touch-icon → favicon) 후 data URL로
  임베드. 직접 업로드도 가능하며, `localStorage`에 도메인/언론사명 기준으로 기억해
  같은 언론사는 다음부터 자동 적용됩니다. (로고는 브라우저에만 저장)
- **편집**: 언론사·날짜·제목·부제·본문을 화면에서 바로 수정, 미리보기 즉시 반영.

## 저장소 구조 — 다른 앱과의 관계

이 폴더(`news-summary/`)는 **뽑AI 저장소 안에 있지만 완전히 독립된 앱**입니다.
(`desk-fengshui/`, `broker-fee/`와 동일한 방식 — 자체 package.json/node_modules,
빌드·배포 완전 분리. 루트 뽑AI 코드는 건드리지 않습니다.)

## 로컬 실행

```bash
cd news-summary
npm install
export OPENAI_API_KEY=sk-...   # OpenAI 키 필요
npm run dev                    # http://localhost:3000
```

> 다른 앱과 동시에 돌리려면 포트를 나눠 주세요. 예: `npm run dev -- -p 3002`

## Vercel 배포 (별도 도메인·별도 프로젝트)

같은 GitHub 저장소를 Vercel 프로젝트로 하나 더 연결합니다.

1. Vercel에서 **New Project → 같은 저장소 선택**.
2. **Settings → Root Directory**를 `news-summary`로 지정.
3. **Environment Variables**에 `OPENAI_API_KEY` 추가.
4. Deploy. 이후 이 폴더에 푸시할 때만 이 프로젝트가 재배포됩니다.

## 환경 변수

| 이름 | 설명 |
| --- | --- |
| `OPENAI_API_KEY` | OpenAI API 키 (필수) |
| `NEXT_PUBLIC_SITE_URL` | 커스텀 도메인 (선택) |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | 방문자 카운터용 Upstash Redis (선택) |

## 참고 / 한계

- 로그인·유료 구독이 필요한 기사나 봇을 차단하는 언론사는 링크로 못 읽을 수 있어요.
  이때는 본문 붙여넣기를 사용하세요.
- AI 요약은 참고용입니다. 수치·고유명사는 원문과 대조 후 사용하세요.
- 기사 원문·로고의 저작권은 각 언론사에 있습니다.
