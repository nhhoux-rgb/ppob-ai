import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "../site-footer";

export const metadata: Metadata = {
  title: "이용 방법 · 복비 계산기",
  description:
    "복비 계산기 사용법을 단계별로 안내합니다. 거래 유형과 부동산 종류를 고르고 금액을 넣으면 중개보수 상한이 바로 계산됩니다.",
};

const STEPS = [
  {
    title: "거래 유형을 고릅니다",
    body: "매매·전세·월세 중 해당하는 거래를 선택합니다. 유형에 따라 적용되는 요율표가 달라집니다.",
  },
  {
    title: "부동산 종류를 고릅니다",
    body: "주택인지 오피스텔인지 선택합니다. 오피스텔은 주거용 전용 요율(매매 0.5%·임대차 0.4%)이 적용됩니다.",
  },
  {
    title: "금액을 입력합니다",
    body: "매매가나 보증금을 만원 단위로 넣습니다. 월세라면 보증금과 월세를 각각 입력하면 거래금액이 자동으로 환산됩니다.",
  },
  {
    title: "부가세 유형과 결과 확인",
    body: "부가세 별도/일반과세 10%/간이과세 4% 중에서 고르면, 상한요율·한도액·부가세를 반영한 예상 복비가 바로 표시됩니다.",
  },
];

export default function HowToUsePage() {
  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900 antialiased">
      <main className="mx-auto w-full max-w-[640px] px-5 py-10 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 transition hover:text-emerald-700"
        >
          <span aria-hidden>←</span> 홈으로
        </Link>

        <h1 className="mt-6 text-2xl font-bold tracking-tight sm:text-3xl">
          복비 계산기 이용 방법
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-zinc-500">
          처음이신가요? 네 단계면 충분합니다.
        </p>

        <ol className="mt-8 space-y-5">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-4">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ backgroundColor: "#059669" }}
              >
                {i + 1}
              </span>
              <div className="pt-1">
                <h2 className="text-base font-bold text-zinc-900">
                  {step.title}
                </h2>
                <p className="mt-1 text-[15px] leading-relaxed text-zinc-600">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <section className="mt-10 rounded-2xl bg-emerald-50 px-5 py-4 text-[15px] leading-relaxed text-emerald-900">
          <h2 className="mb-2 font-bold">알아두면 좋은 점</h2>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>결과는 법정 &lsquo;상한&rsquo; 금액이며, 실제 보수는 협의로 정합니다.</li>
            <li>9억원 이상 매매는 구간별로 요율이 다시 올라갑니다.</li>
            <li>계약 전에 부가세 포함 여부를 반드시 확인하세요.</li>
          </ul>
        </section>

        <p className="mt-8 text-[15px] leading-relaxed text-zinc-600">
          요율의 배경이 궁금하다면{" "}
          <Link
            href="/guide"
            className="font-semibold text-emerald-600 underline underline-offset-2"
          >
            복비 가이드
          </Link>
          를 함께 읽어보세요.
        </p>

        <footer className="mt-12 border-t border-zinc-100 pt-6 pb-10 text-center text-xs text-zinc-400">
          <p>© 2026 복비 계산기</p>
          <SiteFooter />
        </footer>
      </main>
    </div>
  );
}
