import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "../site-footer";

export const metadata: Metadata = {
  title: "자주 묻는 질문 · 책상풍수",
  description:
    "책상풍수 이용에 대해 자주 묻는 질문을 모았습니다. 무료 여부, 분석 원리, 사진 보관, 풍수의 신뢰도 등을 안내합니다.",
};

const FAQ = [
  {
    q: "책상풍수는 무료인가요?",
    a: "네, 책상 사진을 올리고 풍수 분석 결과를 받는 기본 기능은 무료로 이용할 수 있습니다.",
  },
  {
    q: "풍수 분석 결과를 진짜로 믿어도 되나요?",
    a: "책상풍수는 재미로 즐기는 심심풀이 서비스입니다. 실제 운세나 과학적 사실을 보장하지 않습니다. 다만 분석에 담긴 조언 대부분은 정리정돈·채광·동선처럼 실제로 작업 환경을 쾌적하게 만드는 데 도움이 되는 내용과 자연스럽게 엮여 있어, 가볍게 참고하시기 좋습니다.",
  },
  {
    q: "올린 사진은 저장되나요?",
    a: "분석을 위해 AI 처리 업체로 전송되며, 결과 생성 후 자체 서버에 따로 저장하지 않습니다. 자세한 내용은 개인정보처리방침에서 확인할 수 있습니다.",
  },
  {
    q: "어떤 사진을 올려야 잘 분석되나요?",
    a: "앉은 자리에서 책상 위 전체가 또렷하게 보이는 사진이 가장 좋습니다. 모니터, 소품, 정리 상태가 함께 담기면 항목별 진단이 풍부해집니다.",
  },
  {
    q: "점수는 어떻게 정해지나요?",
    a: "책상의 정리 상태, 물건 배치와 방향, 채광, 식물·소품 같은 요소를 종합해 0~100점으로 표시합니다. 점수가 높을수록 사진상 기운의 흐름이 좋다는 의미로, 재미 삼아 보는 지표입니다.",
  },
  {
    q: "결과가 안 나오거나 오류가 떠요.",
    a: "사진이 너무 어둡거나 책상이 잘 보이지 않으면 분석이 어려울 수 있습니다. 더 밝고 선명한 사진으로 다시 시도해 보세요.",
  },
];

export default function FaqPage() {
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
          자주 묻는 질문
        </h1>

        <div className="mt-8 space-y-6">
          {FAQ.map((item) => (
            <section
              key={item.q}
              className="border-b border-zinc-100 pb-6 last:border-0"
            >
              <h2 className="text-base font-bold text-zinc-900">Q. {item.q}</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-zinc-600">
                {item.a}
              </p>
            </section>
          ))}
        </div>

        <footer className="mt-12 border-t border-zinc-100 pt-6 pb-10 text-center text-xs text-zinc-400">
          <p>© 2026 책상풍수</p>
          <SiteFooter />
        </footer>
      </main>
    </div>
  );
}
