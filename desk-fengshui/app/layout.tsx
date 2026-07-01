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
  title: "책상풍수 · 데스크 풍수 AI",
  description:
    "사진 한 장이면 끝. 내 책상 사진을 올리면 AI가 재물운·집중력·건강운 풍수를 분석하고 개운법을 알려드립니다.",
  applicationName: "책상풍수",
  keywords: ["책상풍수", "풍수지리", "책상 정리", "개운법", "AI 풍수", "재물운"],
  openGraph: {
    type: "website",
    siteName: "책상풍수",
    title: "책상풍수 · 데스크 풍수 AI",
    description:
      "책상 사진 한 장으로 AI가 풍수를 봐드립니다. 재물운·집중력·건강운 진단과 개운법까지.",
    url: "/",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "책상풍수 · 데스크 풍수 AI",
    description: "책상 사진 한 장으로 AI가 풍수를 봐드립니다.",
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
