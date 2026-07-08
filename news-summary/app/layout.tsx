import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { siteUrl } from "./site-url";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "뉴스클리핑 · 기사 요약 이미지 생성기",
  description:
    "기사 링크만 붙여넣으면 언론사·날짜·제목·요약이 담긴 깔끔한 요약 이미지를 만들어 드립니다. 보고서에 바로 붙여넣기 좋은 PNG로 저장하세요.",
  applicationName: "뉴스클리핑",
  keywords: [
    "기사 요약",
    "뉴스 클리핑",
    "기사 이미지",
    "보고서 자료",
    "기사 스크랩",
    "요약 이미지 생성",
  ],
  openGraph: {
    type: "website",
    siteName: "뉴스클리핑",
    title: "뉴스클리핑 · 기사 요약 이미지 생성기",
    description:
      "기사 링크로 만드는 요약 이미지. 언론사·날짜·제목·요약을 카드로 정리해 보고서에 바로 붙여넣으세요.",
    url: "/",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "뉴스클리핑 · 기사 요약 이미지 생성기",
    description: "기사 링크로 만드는 보고서용 요약 이미지.",
  },
  // AdSense 계정 메타. (뽑AI와 같은 AdSense 계정을 사용)
  other: {
    "google-adsense-account": "ca-pub-2652292791594458",
  },
  // 참고: 이 도메인용 Google Search Console / 네이버 사이트 인증 토큰은
  // 도메인마다 달라서 여기 비워 뒀습니다. 발급받으면 verification 필드에 추가하세요.
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
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
