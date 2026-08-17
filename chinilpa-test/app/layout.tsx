import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { siteUrl } from "./site-url";
import "./globals.css";

const TITLE = "친일파 테스트 · 1940년, 당신의 선택";
const DESCRIPTION =
  "1936년부터 1945년까지, 열여섯 번의 갈림길. 그 시대에 태어났다면 당신은 어디쯤 서 있었을까? 실제 식민지 조선의 상황으로 구성한 역사 선택 테스트.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: "친일파 테스트",
  keywords: [
    "친일파 테스트",
    "친일파",
    "일제강점기",
    "역사 테스트",
    "심리테스트",
    "창씨개명",
    "신사참배",
    "독립운동",
    "식민지 조선",
  ],
  openGraph: {
    type: "website",
    siteName: "친일파 테스트",
    title: TITLE,
    description: DESCRIPTION,
    url: "/",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  // AdSense 계정 메타. (뽑AI와 같은 AdSense 계정을 사용)
  other: {
    "google-adsense-account": "ca-pub-2652292791594458",
  },
  // 참고: 이 도메인용 Google Search Console / 네이버 사이트 인증 토큰은
  // 도메인마다 달라서 비워 뒀습니다. 발급받으면 verification 필드에 추가하세요.
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        {/* 명조 웹폰트. 이 서비스는 서식 디자인이 곧 정체성이라 본문 서체를
            시스템 폰트로 대체할 수 없다.

            next/font 를 쓰지 않는 이유: 이 패밀리는 next/font 의 폰트
            메타데이터에 subsets 가 ["latin"] 으로만 등재돼 있어 subsets:
            ["korean"] 을 넘기면 빌드가 실패하고, ["latin"] 으로 받으면 한글
            글리프가 통째로 빠진다. 링크로 받으면 브라우저가 unicode-range 를
            보고 실제로 쓰인 글자가 든 청크만 내려받는다 (이 패밀리는
            @font-face 가 276개로 쪼개져 있어 오히려 이쪽이 가볍다).

            아래 규칙은 pages/_document 를 전제로 한 것이라 App Router 의 루트
            레이아웃에는 해당하지 않는다. 여기 둔 link 는 모든 페이지에 적용된다. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@400;700;800&display=swap"
        />
        {children}
        <Analytics />
        {/* AdSense loader — plain script tag so it renders literally in the
            served HTML head (React 19 hoists async scripts), which is what
            the AdSense verification crawler looks for. */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2652292791594458"
          crossOrigin="anonymous"
        />
      </body>
    </html>
  );
}
