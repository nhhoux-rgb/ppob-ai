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

// 검색엔진 사이트 소유확인 토큰(구글 서치콘솔 / 네이버 서치어드바이저).
// 값은 Vercel 환경변수로 넣으면 되고, 없으면 관련 meta를 아예 출력하지 않는다.
const googleVerify = process.env.GOOGLE_SITE_VERIFICATION;
const naverVerify = process.env.NAVER_SITE_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "등기조회 · 등기번호 대량 일괄 배송조회",
  description:
    "등기번호를 붙여넣거나 접수증 사진을 올리면 우체국 배송상태를 한 번에 조회합니다. 배달완료·미수령·반송을 표로 정리하고 CSV로 내려받으세요. 대량 등기 발송 실무에 딱.",
  applicationName: "등기조회",
  keywords: [
    "등기 조회",
    "등기번호 조회",
    "등기 대량조회",
    "등기우편 대량조회",
    "등기 일괄조회",
    "대량 등기 조회",
    "등기 여러건 조회",
    "우체국 배송조회",
    "우체국 등기조회",
    "등기 배송조회",
    "등기 도착 조회",
    "등기 미수령 조회",
    "등기 반송 조회",
    "접수증 등기번호",
    "접수증 OCR",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "등기조회",
    title: "등기조회 · 등기번호 대량 일괄 배송조회",
    description:
      "등기번호 붙여넣기 또는 접수증 사진 한 장으로 우체국 배송상태를 한 번에. 반송·미수령을 표로 확인하고 CSV로 저장하세요.",
    url: "/",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "등기조회 · 등기번호 대량 일괄 배송조회",
    description: "등기번호 대량 일괄 배송조회 — 반송·미수령 한눈에, CSV 저장.",
  },
  verification: {
    ...(googleVerify ? { google: googleVerify } : {}),
    ...(naverVerify
      ? { other: { "naver-site-verification": naverVerify } }
      : {}),
  },
  // AdSense 계정 메타. (뽑AI와 같은 AdSense 계정을 사용)
  other: {
    "google-adsense-account": "ca-pub-2652292791594458",
  },
};

// ── 구조화 데이터(JSON-LD): 사이트·조직·웹앱 정보 ──────────────────
const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "등기조회",
    url: siteUrl,
    description: "등기번호 대량 일괄 배송조회",
    inLanguage: "ko-KR",
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "등기조회",
    url: siteUrl,
    email: "pickupai2026@gmail.com",
  },
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "등기조회 · 등기번호 대량 일괄 배송조회",
    url: siteUrl,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    inLanguage: "ko-KR",
    offers: { "@type": "Offer", price: "0", priceCurrency: "KRW" },
    description:
      "등기번호 붙여넣기·CSV·접수증 사진으로 우체국 배송상태를 한 번에 조회하고 CSV로 저장하는 도구.",
  },
];

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
        {/* 구조화 데이터 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
