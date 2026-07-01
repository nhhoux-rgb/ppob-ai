import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "../site-footer";

export const metadata: Metadata = {
  title: "이용 방법 · 책상풍수",
  description:
    "책상풍수 사용법을 단계별로 안내합니다. 책상 사진을 올리고 AI 풍수 분석 결과를 읽는 방법, 더 정확한 결과를 얻는 촬영 요령까지.",
};

const STEPS = [
  {
    title: "책상 사진을 준비합니다",
    body: "앉은 자리에서 책상 전체가 보이도록 한 장 찍습니다. 모니터·소품·정리 상태가 함께 담길수록 분석이 정확해집니다.",
  },
  {
    title: "사진을 올립니다",
    body: "홈 화면에서 카메라로 바로 찍거나, 갤러리에서 사진을 선택해 올립니다.",
  },
  {
    title: "풍수 분석하기를 누릅니다",
    body: "잠시 기다리면 AI가 사진을 살펴 종합 풍수 점수와 항목별 진단을 만들어 줍니다.",
  },
  {
    title: "결과를 확인합니다",
    body: "종합 점수·등급과 함께 재물운·집중력·건강운·정리정돈 항목별 점수, 관찰 근거, 그리고 바로 실천할 수 있는 개운법을 볼 수 있습니다.",
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
          책상풍수 이용 방법
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-zinc-500">
          처음 사용하시나요? 네 단계면 충분합니다.
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
          <h2 className="mb-2 font-bold">더 정확한 결과를 얻으려면</h2>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>앉은 눈높이에서 책상 위 전체가 담기도록 찍으세요.</li>
            <li>너무 어둡지 않게, 낮에 자연광이 들 때 찍으면 좋습니다.</li>
            <li>평소 그대로의 상태를 찍어야 진단이 의미 있습니다.</li>
          </ul>
        </section>

        <p className="mt-8 text-[15px] leading-relaxed text-zinc-600">
          더 자세한 배치 원리가 궁금하다면{" "}
          <Link
            href="/guide"
            className="font-semibold text-emerald-600 underline underline-offset-2"
          >
            책상 풍수 가이드
          </Link>
          를 함께 읽어보세요.
        </p>

        <footer className="mt-12 border-t border-zinc-100 pt-6 pb-10 text-center text-xs text-zinc-400">
          <p>© 2026 책상풍수</p>
          <SiteFooter />
        </footer>
      </main>
    </div>
  );
}
