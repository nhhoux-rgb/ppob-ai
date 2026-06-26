import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "../site-footer";

export const metadata: Metadata = {
  title: "이용 방법 · 뽑AI",
  description:
    "뽑AI 사용법을 단계별로 안내합니다. 사진을 올리고 AI 분석 결과를 읽는 방법, 더 정확한 결과를 얻는 촬영 요령까지.",
};

const STEPS = [
  {
    title: "기계 사진을 준비합니다",
    body: "인형뽑기 기계 정면에서 내부가 잘 보이도록 한 장 찍습니다. 유리에 반사가 적고, 기계 전체가 담길수록 분석이 정확해집니다.",
  },
  {
    title: "사진을 올립니다",
    body: "홈 화면에서 카메라로 바로 찍거나, 갤러리에서 사진을 선택해 올립니다.",
  },
  {
    title: "AI 분석하기를 누릅니다",
    body: "잠시 기다리면 AI가 사진을 분석해 성공 가능성이 높은 인형을 1~3개 추천합니다.",
  },
  {
    title: "결과를 확인합니다",
    body: "사진 위에 추천 순위가 표시되고, 각 인형의 추천 점수·이유·공략 방법을 볼 수 있습니다. ‘자세히 보기’를 누르면 집게를 어디에 떨어뜨릴지까지 확인할 수 있습니다.",
  },
];

export default function HowToUsePage() {
  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900 antialiased">
      <main className="mx-auto w-full max-w-[640px] px-5 py-10 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet-600 transition hover:text-violet-700"
        >
          <span aria-hidden>←</span> 홈으로
        </Link>

        <h1 className="mt-6 text-2xl font-bold tracking-tight sm:text-3xl">
          뽑AI 이용 방법
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-zinc-500">
          처음 사용하시나요? 네 단계면 충분합니다.
        </p>

        <ol className="mt-8 space-y-5">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-4">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ backgroundColor: "#7c3aed" }}
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

        <section className="mt-10 rounded-2xl bg-violet-50 px-5 py-4 text-[15px] leading-relaxed text-violet-900">
          <h2 className="mb-2 font-bold">더 정확한 결과를 얻으려면</h2>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>기계 정면에서, 인형이 또렷하게 보이도록 찍으세요.</li>
            <li>유리 반사와 조명 빛 번짐을 최대한 줄이세요.</li>
            <li>특정 인형만 클로즈업하기보다 내부 전체를 담으세요.</li>
          </ul>
        </section>

        <p className="mt-8 text-[15px] leading-relaxed text-zinc-600">
          더 자세한 전략이 궁금하다면{" "}
          <Link
            href="/guide"
            className="font-semibold text-violet-600 underline underline-offset-2"
          >
            인형뽑기 공략 가이드
          </Link>
          를 함께 읽어보세요.
        </p>

        <footer className="mt-12 border-t border-zinc-100 pt-6 pb-10 text-center text-xs text-zinc-400">
          <p>© 2026 뽑AI</p>
          <SiteFooter />
        </footer>
      </main>
    </div>
  );
}
