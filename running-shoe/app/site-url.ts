// 사이트의 정식 주소. 커스텀 도메인을 붙이면 Vercel 환경변수
// NEXT_PUBLIC_SITE_URL 만 설정하면 자동으로 그 도메인을 사용한다.
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://running-shoe-tier.vercel.app");
