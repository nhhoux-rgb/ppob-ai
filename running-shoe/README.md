# 러닝화 계급도 (running-shoe-tier)

브랜드별 러닝화를 입문화부터 카본 레이싱까지 등급으로 정리해 보여주는 웹 서비스.
신발을 누르면 참고가·특징·쿠팡 구매 링크가 열립니다. 뽑AI 저장소 안의 독립
Next.js 앱입니다.

## 개발

```bash
cd running-shoe
npm install
npm run dev   # http://localhost:3000
```

## 구조

- `app/shoes.ts` — 브랜드·등급·신발 데이터. 계급도 이미지를 1차 전사한 초안이니
  오픈 전 검수하세요. 신발 추가/수정은 이 파일의 `RAW` 객체만 고치면 됩니다.
- `app/page.tsx` — 계급도 매트릭스 + 신발 상세 모달.
- `app/{how-to-use,faq,privacy}` — 안내·정책 페이지.

## 쿠팡 파트너스 연동

- 각 신발 상세의 "쿠팡에서 최저가 확인" 버튼은 `shoes.ts`의 `coupangLink()`를
  사용합니다.
- 개별 `coupangUrl`(파트너스 딥링크)이 있으면 그걸, 없으면 상품명 검색 링크로
  대체합니다.
- 파트너스 승인 후:
  1. 각 신발에 파트너스 딥링크를 `coupangUrl`로 넣거나,
  2. 채널 추적용 subId를 환경변수 `NEXT_PUBLIC_COUPANG_SUBID`로 설정하세요.
- 파트너스 정책상 필수 고지 문구는 푸터와 상세 모달에 이미 포함돼 있습니다.

## 환경변수 (선택)

- `NEXT_PUBLIC_SITE_URL` — 커스텀 도메인.
- `NEXT_PUBLIC_COUPANG_SUBID` — 쿠팡 파트너스 채널/추적 ID.
- `KV_REST_API_URL` / `KV_REST_API_TOKEN` — 방문자 수 집계용 Upstash Redis(없어도 동작).
