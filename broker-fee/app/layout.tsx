import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { siteUrl } from "./site-url";
import JsonLd from "./json-ld";
import "./globals.css";

// 검색엔진용 구조화 데이터 — 이 사이트가 "무료 부동산 중개보수 계산기"임을 명시.
const APP_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "복비 계산기",
  url: siteUrl,
  applicationCategory: "FinanceApplication",
  operatingSystem: "All",
  inLanguage: "ko-KR",
  description:
    "매매·전세·월세·상가 부동산 중개보수(복비)를 법정 상한요율로 계산하는 무료 웹 계산기.",
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
  title: "복비 계산기 · 부동산 중개수수료 계산",
  description:
    "매매·전세·월세·상가 중개보수(복비)를 법정 상한요율로 즉시 계산합니다. 주택·오피스텔·상가 모두 지원, 부가세 포함 예상 금액까지 한 번에.",
  applicationName: "복비 계산기",
  alternates: { canonical: "/" },
  keywords: [
    "복비 계산기",
    "부동산 중개수수료",
    "중개보수 계산기",
    "부동산 복비",
    "전세 복비",
    "매매 중개수수료",
    "월세 복비 계산",
    "상가 중개수수료",
    "오피스텔 복비",
  ],
  openGraph: {
    type: "website",
    siteName: "복비 계산기",
    title: "복비 계산기 · 부동산 중개수수료 계산",
    description:
      "매매·전세·월세 중개보수(복비)를 법정 상한요율로 즉시 계산. 주택·오피스텔 지원, 부가세 포함까지.",
    url: "/",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "복비 계산기 · 부동산 중개수수료 계산",
    description: "매매·전세·월세 중개보수를 법정 상한요율로 즉시 계산합니다.",
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
