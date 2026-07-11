import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { siteUrl } from "./site-url";
import JsonLd from "./json-ld";
import "./globals.css";

// 검색엔진용 구조화 데이터 — 이 사이트가 "러닝화 계급도(등급표)"임을 명시.
const APP_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "러닝화 계급도",
  url: siteUrl,
  applicationCategory: "SportsApplication",
  operatingSystem: "All",
  inLanguage: "ko-KR",
  description:
    "나이키·아디다스·아식스·뉴발란스·호카 등 브랜드별 러닝화를 입문화·안정화·카본 레이싱까지 등급으로 한눈에 정리한 러닝화 계급도.",
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
  title: "러닝화 계급도 · 브랜드별 러닝화 등급표 (최신)",
  description:
    "나이키·아디다스·아식스·뉴발란스·사코니·푸마·호카·브룩스·미즈노·온 러닝화를 입문화·맥스쿠션·안정화·카본 레이싱까지 등급으로 정리. 클릭하면 참고가·특징·구매 링크를 볼 수 있어요.",
  applicationName: "러닝화 계급도",
  alternates: { canonical: "/" },
  keywords: [
    "러닝화 계급도",
    "러닝화 추천",
    "러닝화 등급표",
    "입문 러닝화",
    "카본화 추천",
    "마라톤화 추천",
    "안정화 러닝화",
    "나이키 러닝화",
    "아식스 러닝화",
    "호카 러닝화",
  ],
  openGraph: {
    type: "website",
    siteName: "러닝화 계급도",
    title: "러닝화 계급도 · 브랜드별 러닝화 등급표 (최신)",
    description:
      "브랜드별 러닝화를 입문화·안정화·카본 레이싱까지 등급으로 한눈에. 클릭하면 참고가·특징·구매 링크까지.",
    url: "/",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "러닝화 계급도 · 브랜드별 러닝화 등급표",
    description: "브랜드별 러닝화를 등급으로 한눈에. 클릭하면 참고가·특징·구매 링크까지.",
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
