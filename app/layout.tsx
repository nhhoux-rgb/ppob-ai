import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "뽑AI · 인형뽑기 AI 공략",
  description:
    "사진 한 장이면 끝. 인형뽑기 기계 사진을 올리면 AI가 가장 뽑기 쉬운 인형과 공략법을 찾아드립니다.",
  applicationName: "뽑AI",
  keywords: ["인형뽑기", "인형뽑기 공략", "AI 공략", "뽑기", "크레인 게임"],
  openGraph: {
    type: "website",
    siteName: "뽑AI",
    title: "뽑AI · 인형뽑기 AI 공략",
    description: "사진 한 장으로 가장 뽑기 쉬운 인형을 AI가 찾아드립니다.",
    url: "/",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "뽑AI · 인형뽑기 AI 공략",
    description: "사진 한 장으로 가장 뽑기 쉬운 인형을 AI가 찾아드립니다.",
  },
  other: {
    "google-adsense-account": "ca-pub-2652292791594458",
  },
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
