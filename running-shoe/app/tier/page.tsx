import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "../site-footer";
import SharePageButton from "../share-page-button";
import TierChart from "./tier-chart";

export const metadata: Metadata = {
  title: "러닝화 계급도 · 브랜드별 러닝화 등급표 (최신)",
  description:
    "나이키·아디다스·아식스·뉴발란스·사코니·푸마·호카·브룩스·미즈노·온 러닝화를 입문화·맥스쿠션·안정화·카본 레이싱까지 등급으로 정리한 러닝화 계급도. 신발을 누르면 참고가·특징·구매 링크를 볼 수 있어요.",
  alternates: { canonical: "/tier" },
};

export default function TierPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-3 py-8 sm:px-4">
      <header className="text-center">
        <Link
          href="/"
          className="text-xs font-semibold text-indigo-500 underline underline-offset-2"
        >
          ← 러닝화 추천받기
        </Link>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl">
          러닝화 계급도
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-zinc-500">
          나이키·아식스·호카 등 브랜드별 러닝화를 입문화부터 카본 레이싱까지 등급으로
          정리했어요. 신발을 누르면 참고가·특징·구매 링크를 볼 수 있습니다.
        </p>
        <div className="mt-3 flex justify-center">
          <SharePageButton />
        </div>
      </header>

      <TierChart />

      <div className="mt-auto pt-10">
        <SiteFooter />
      </div>
    </main>
  );
}
