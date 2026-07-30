import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "../site-footer";

export const metadata: Metadata = {
  title: "평행우주란? · 평행우주 나의 삶",
  description:
    "평행우주(다중우주) 개념과 '만약에'의 상상이 우리에게 주는 위로에 대한 가벼운 이야기. 평행우주 나의 삶 서비스가 담고 싶은 마음을 소개합니다.",
};

export default function GuidePage() {
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
          평행우주란?
        </h1>

        <div className="mt-8 space-y-8 text-[15px] leading-relaxed text-violet-200/80">
          <section>
            <h2 className="mb-2 text-base font-bold text-violet-50">
              무한한 ‘만약에’의 세계
            </h2>
            <p>
              평행우주(다중우주)는 우리 우주와 나란히 존재할지도 모르는 또 다른
              세계들을 가리키는 상상이에요. 어떤 이야기에서는, 우리가 선택의 순간을
              지날 때마다 세계가 여러 갈래로 갈라진다고 말해요. 그렇다면 그 갈래
              어딘가에는, 그때 다른 선택을 한 ‘또 다른 나’가 살고 있을지도 몰라요.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-violet-50">
              ‘그때 다른 선택을 했다면’
            </h2>
            <p>
              누구에게나 마음에 남는 갈림길이 있어요. 다른 전공을 골랐다면, 그
              회사를 그만두지 않았다면, 그 사람과 계속 만났다면. 그 상상은 후회가
              아니라, 지금의 나를 더 또렷하게 비춰주는 거울이 되기도 해요.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-violet-50">
              이 서비스가 담고 싶은 마음
            </h2>
            <p>
              ‘평행우주 나의 삶’은 당신이 적은 갈림길에서 갈라진 세 개의 우주를
              상상해, 또 다른 나의 삶을 이야기로 그려줘요. 어떤 우주는 더
              반짝이고, 어떤 우주는 더 조용하지만, 어느 우주에서도 결국 그건
              당신이에요. 우열을 가리려는 게 아니라, 지금 여기의 선택을 조금 더
              따뜻하게 바라볼 수 있도록.
            </p>
            <p className="mt-3 rounded-xl bg-white/[0.04] px-4 py-3 text-sm text-violet-200/70">
              ※ 재미로 상상해보는 콘텐츠예요. 실제 미래나 과학적 사실과는 무관하니
              가볍게 즐겨 주세요.
            </p>
          </section>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-semibold text-white transition active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)",
            }}
          >
            🌌 내 평행우주 열어보기
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
