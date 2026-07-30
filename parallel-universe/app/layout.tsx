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
  title: "평행우주 나의 삶 · 또 다른 나를 만나는 AI",
  description:
    "그때 다른 선택을 했다면? 인생의 갈림길 하나만 적으면 AI가 평행우주 속 또 다른 나의 삶 3가지를 이야기로 그려드려요.",
  applicationName: "평행우주 나의 삶",
  keywords: [
    "평행우주",
    "또 다른 나",
    "만약에",
    "인생 시뮬레이션",
    "AI 심리테스트",
    "평행세계",
    "다중우주",
  ],
  openGraph: {
    type: "website",
    siteName: "평행우주 나의 삶",
    title: "평행우주 나의 삶 · 또 다른 나를 만나는 AI",
    description:
      "그때 다른 선택을 했다면? AI가 평행우주 속 또 다른 나의 삶 3가지를 그려드려요.",
    url: "/",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "평행우주 나의 삶 · 또 다른 나를 만나는 AI",
    description: "그때 다른 선택을 했다면? AI가 또 다른 나의 삶을 그려드려요.",
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
