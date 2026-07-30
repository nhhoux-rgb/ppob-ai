import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "../site-footer";

export const metadata: Metadata = {
  title: "자주 묻는 질문 · 평행우주 나의 삶",
  description:
    "평행우주 나의 삶 이용에 대해 자주 묻는 질문을 모았습니다. 무료 여부, 작동 원리, 입력 정보 보관, 결과 신뢰도 등을 안내합니다.",
};

const FAQ = [
  {
    q: "평행우주 나의 삶은 무료인가요?",
    a: "네, 인생의 갈림길을 적고 평행우주 결과를 받는 기본 기능은 무료로 이용할 수 있습니다.",
  },
  {
    q: "결과를 진짜로 믿어도 되나요?",
    a: "아니요. 이 서비스는 '만약에'를 함께 상상해보는 재미용 콘텐츠입니다. 실제 미래나 과학적 사실과는 무관하니, 또 다른 나를 떠올려보는 가벼운 놀이로 즐겨 주세요.",
  },
  {
    q: "어떻게 만들어지나요?",
    a: "입력한 갈림길을 바탕으로 AI가 그 순간에서 다르게 갈라졌을 세 개의 인생을 상상해 이야기로 그려냅니다. 매번 조금씩 다른 결과가 나올 수 있어요.",
  },
  {
    q: "무엇을 적으면 좋나요?",
    a: "진학·직업·이사·관계처럼 '그때 다른 선택을 할 수도 있었던 순간' 하나를 구체적으로 적을수록 결과가 풍부해집니다. 예: '대학 전공을 바꿨다면', '그 회사를 그만두지 않았다면'.",
  },
  {
    q: "제가 입력한 내용은 저장되나요?",
    a: "결과 생성을 위해 AI 처리 업체로 전송되며, 자체 서버에 따로 저장하지 않습니다. 자세한 내용은 개인정보처리방침에서 확인할 수 있습니다.",
  },
  {
    q: "행복 지수·부 지수는 어떻게 정해지나요?",
    a: "각 평행우주의 삶의 결을 바탕으로 AI가 0~100으로 표현한 상상 속 지표입니다. 우주마다 일부러 다르게 나오도록 되어 있으며, 우열이 아니라 서로 다른 색깔을 보여주기 위한 재미 요소입니다.",
  },
];

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-[#0b0713] font-sans text-violet-50 antialiased">
      <main className="mx-auto w-full max-w-[640px] px-5 py-10 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet-300 transition hover:text-violet-200"
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
              className="border-b border-white/10 pb-6 last:border-0"
            >
              <h2 className="text-base font-bold text-violet-50">Q. {item.q}</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-violet-200/75">
                {item.a}
              </p>
            </section>
          ))}
        </div>

        <footer className="mt-12 border-t border-white/10 pt-6 pb-10 text-center text-xs text-violet-200/50">
          <p>© 2026 평행우주 나의 삶</p>
          <SiteFooter />
        </footer>
      </main>
    </div>
  );
}
