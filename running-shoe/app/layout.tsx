import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { siteUrl } from "./site-url";
import JsonLd from "./json-ld";
import "./globals.css";

// 검색엔진용 구조화 데이터 — 이 사이트가 "러닝화 추천 도구"임을 명시.
const APP_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "러닝화 추천",
  url: siteUrl,
  applicationCategory: "SportsApplication",
  operatingSystem: "All",
  inLanguage: "ko-KR",
  description:
    "나이·몸무게·목적·예산·선호 브랜드를 입력하면 나에게 맞는 러닝화를 추천하고, 브랜드별 러닝화 계급도까지 제공하는 무료 러닝화 추천 서비스.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "KRW" },
};

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
  title: "러닝화 추천 · 나에게 맞는 러닝화 찾기 (계급도 포함)",
  description:
    "나이·몸무게·목적(데일리·트레이닝·대회)·예산·선호 브랜드를 입력하면 나에게 맞는 러닝화를 추천해 드려요. 참고가·구매 링크와 브랜드별 러닝화 계급도까지 한 번에.",
  applicationName: "러닝화 추천",
  alternates: { canonical: "/" },
  keywords: [
    "러닝화 추천",
    "러닝화 계급도",
    "입문 러닝화 추천",
    "마라톤화 추천",
    "카본화 추천",
    "10k 러닝화",
    "안정화 러닝화",
    "러닝화 등급표",
    "체중별 러닝화",
    "러닝화 고르는 법",
  ],
  openGraph: {
    type: "website",
    siteName: "러닝화 추천",
    title: "러닝화 추천 · 나에게 맞는 러닝화 찾기",
    description:
      "몇 가지만 고르면 나에게 맞는 러닝화를 추천. 참고가·구매 링크와 브랜드별 계급도까지.",
    url: "/",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "러닝화 추천 · 나에게 맞는 러닝화 찾기",
    description: "몇 가지만 고르면 나에게 맞는 러닝화를 추천해 드려요.",
  },
  // AdSense 계정 메타. (같은 AdSense 계정을 사용)
  other: {
    "google-adsense-account": "ca-pub-2652292791594458",
  },
  // 참고: 이 도메인용 Search Console / 네이버 사이트 인증 토큰은 도메인마다
  // 달라서 비워 뒀습니다. 발급받으면 verification 필드에 추가하세요.
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
        <JsonLd data={APP_JSON_LD} />
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
