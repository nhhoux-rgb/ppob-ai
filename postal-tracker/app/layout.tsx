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
  title: "등기조회 · 등기번호 대량 일괄 배송조회",
  description:
    "등기번호를 붙여넣거나 접수증 사진을 올리면 우체국 배송상태를 한 번에 조회합니다. 배달완료·미배달·반송을 표로 정리하고 CSV로 내려받으세요. 대량 등기 발송 실무에 딱.",
  applicationName: "등기조회",
  keywords: [
    "등기 조회",
    "등기번호 조회",
    "등기 일괄조회",
    "대량 등기 조회",
    "우체국 배송조회",
    "등기 반송 확인",
    "접수증 OCR",
  ],
  openGraph: {
    type: "website",
    siteName: "등기조회",
    title: "등기조회 · 등기번호 대량 일괄 배송조회",
    description:
      "등기번호 붙여넣기 또는 접수증 사진 한 장으로 우체국 배송상태를 한 번에. 반송·미배달을 표로 확인하고 CSV로 저장하세요.",
    url: "/",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "등기조회 · 등기번호 대량 일괄 배송조회",
    description: "등기번호 대량 일괄 배송조회 — 반송·미배달 한눈에, CSV 저장.",
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
