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

export const metadata: Metadata = {
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
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "책상풍수 · 데스크 풍수 AI",
    description: "책상 사진 한 장으로 AI가 풍수를 봐드립니다.",
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
      </body>
    </html>
  );
}
