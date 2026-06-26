import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "../site-footer";

export const metadata: Metadata = {
  title: "자주 묻는 질문 · 뽑AI",
  description:
    "뽑AI 이용에 대해 자주 묻는 질문을 모았습니다. 무료 여부, 정확도, 사진 보관, 추천 원리 등을 안내합니다.",
};

const FAQ = [
  {
    q: "뽑AI는 무료인가요?",
    a: "네, 사진을 올리고 분석 결과를 받는 기본 기능은 무료로 이용할 수 있습니다.",
  },
  {
    q: "추천이 100% 맞나요?",
    a: "아닙니다. 뽑AI는 사진에 보이는 인형의 배치와 자세를 분석해 성공 가능성이 높은 대상을 추천합니다. 하지만 집게의 잡는 힘 세팅, 인형의 실제 무게처럼 사진에 드러나지 않는 요소는 알 수 없습니다. 추천은 참고용으로 활용하시고, 최종 판단은 직접 내리시길 권합니다.",
  },
  {
    q: "올린 사진은 저장되나요?",
    a: "분석을 위해 AI 처리 업체로 전송되며, 결과 생성 후 자체 서버에 따로 저장하지 않습니다. 자세한 내용은 개인정보처리방침에서 확인할 수 있습니다.",
  },
  {
    q: "어떤 사진을 올려야 잘 분석되나요?",
    a: "기계 정면에서 내부 전체가 또렷하게 보이는 사진이 가장 좋습니다. 유리 반사와 조명 번짐이 적을수록 정확도가 올라갑니다.",
  },
  {
    q: "추천 점수는 어떻게 정해지나요?",
    a: "인형이 출구에 얼마나 가까운지, 집게가 걸릴 부분이 있는지, 주변 인형과의 배치가 유리한지 등을 종합해 0~100점으로 표시합니다. 점수가 높을수록 사진상 성공 가능성이 높다는 의미입니다.",
  },
  {
    q: "결과가 안 나오거나 오류가 떠요.",
    a: "사진이 너무 어둡거나 인형이 잘 보이지 않으면 분석이 어려울 수 있습니다. 더 밝고 선명한 사진으로 다시 시도해 보세요.",
  },
];

export default function FaqPage() {
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
          자주 묻는 질문
        </h1>

        <div className="mt-8 space-y-6">
          {FAQ.map((item) => (
            <section
              key={item.q}
              className="border-b border-zinc-100 pb-6 last:border-0"
            >
              <h2 className="text-base font-bold text-zinc-900">
                Q. {item.q}
              </h2>
              <p className="mt-2 text-[15px] leading-relaxed text-zinc-600">
                {item.a}
              </p>
            </section>
          ))}
        </div>

        <footer className="mt-12 border-t border-zinc-100 pt-6 pb-10 text-center text-xs text-zinc-400">
          <p>© 2026 뽑AI</p>
          <SiteFooter />
        </footer>
      </main>
    </div>
  );
}
