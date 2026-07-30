import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "../site-footer";

export const metadata: Metadata = {
  title: "이용 방법 · 평행우주 나의 삶",
  description:
    "평행우주 나의 삶 사용법 3단계. 인생의 갈림길을 적고, 평행우주를 열고, 또 다른 나의 삶을 만나 친구와 공유해 보세요.",
};

const STEPS = [
  {
    icon: "🔀",
    title: "1. 인생의 갈림길을 적어요",
    body: "그때 다른 선택을 할 수도 있었던 순간 하나를 떠올려 적어 주세요. 진학, 이직, 이사, 관계 등 무엇이든 좋아요. 구체적일수록 이야기가 풍부해져요.",
  },
  {
    icon: "🌠",
    title: "2. 평행우주를 열어요",
    body: "‘평행우주 열어보기’를 누르면 AI가 그 갈림길에서 갈라진 세 개의 우주를 관측해요. 각 우주의 또 다른 나가 어떤 직업으로, 어디에서, 어떻게 살고 있는지 그려줘요.",
  },
  {
    icon: "💫",
    title: "3. 만나고, 공유해요",
    body: "행복 지수·부 지수와 함께 세 갈래의 삶을 읽어보세요. 마음에 드는 결과는 이미지로 저장하거나 친구에게 공유해 ‘너의 평행우주는?’ 하고 물어볼 수 있어요.",
  },
];

export default function HowToUsePage() {
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
          이용 방법
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-violet-200/70">
          단 세 단계면 평행우주 속 또 다른 나를 만날 수 있어요.
        </p>

        <div className="mt-8 space-y-4">
          {STEPS.map((s) => (
            <section
              key={s.title}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"
            >
              <div className="mb-2 flex items-center gap-2.5">
                <span className="text-2xl">{s.icon}</span>
                <h2 className="text-base font-bold text-violet-50">{s.title}</h2>
              </div>
              <p className="text-[15px] leading-relaxed text-violet-200/75">
                {s.body}
              </p>
            </section>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-semibold text-white transition active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)",
            }}
          >
            🌌 평행우주 열어보기
          </Link>
        </div>

        <footer className="mt-12 border-t border-white/10 pt-6 pb-10 text-center text-xs text-violet-200/50">
          <p>© 2026 평행우주 나의 삶</p>
          <SiteFooter />
        </footer>
      </main>
    </div>
  );
}
