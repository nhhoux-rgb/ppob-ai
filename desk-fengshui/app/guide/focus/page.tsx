import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "../../site-footer";

export const metadata: Metadata = {
  title: "집중력·학업운을 높이는 책상 풍수 · 책상풍수",
  description:
    "공부와 업무 집중이 잘 되는 책상은 따로 있습니다. 방향, 조명, 정리, 색과 소품까지 집중력과 학업운을 끌어올리는 책상 풍수를 정리했습니다.",
};

const SECTIONS = [
  {
    h: "1. 등 뒤는 벽, 시야는 트이게",
    p: "집중은 안정감에서 나옵니다. 등 뒤가 벽이면 심리적으로 보호받는 느낌이 들어 몰입이 쉬워집니다. 반대로 등 뒤로 문이나 통로가 있으면 자꾸 신경이 분산됩니다. 자리를 바꾸기 어렵다면 등받이가 높은 의자로 &lsquo;배경&rsquo;을 만들어 주는 것도 방법입니다.",
  },
  {
    h: "2. 빛은 왼쪽 위에서",
    p: "오른손잡이는 왼쪽 위에서 빛이 오면 글씨에 그림자가 지지 않아 눈이 덜 피로합니다. 풍수에서도 밝은 빛은 정신을 맑게 하는 양의 기운으로 봅니다. 자연광이 가장 좋고, 부족하면 스탠드로 보완하세요.",
  },
  {
    h: "3. 책상 위는 '지금 할 일'만",
    p: "시야에 물건이 많을수록 뇌는 계속 산만해집니다. 지금 하는 일에 필요한 것만 남기고 나머지는 서랍이나 정리함으로 보내세요. 풍수에서 말하는 &lsquo;막힌 기운 걷어내기&rsquo;가 곧 집중 환경 만들기입니다.",
  },
  {
    h: "4. 학업운엔 나무의 기운",
    p: "동양 풍수에서 동쪽과 초록색(나무 기운)은 성장·학업과 연결됩니다. 책상을 동쪽에 두기 어렵다면 작은 초록 식물이나 초록 소품으로 그 기운을 더할 수 있습니다. 성장하는 식물은 &lsquo;나도 자란다&rsquo;는 상징이 되기도 하죠.",
  },
  {
    h: "5. 시간을 보이게",
    p: "작은 아날로그 시계를 시야에 두면 시간 감각이 또렷해져 집중 리듬을 잡기 좋습니다. 알림이 계속 뜨는 스마트폰은 오히려 시야 밖으로 치우는 편이 몰입에 유리합니다.",
  },
];

export default function FocusGuidePage() {
  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900 antialiased">
      <main className="mx-auto w-full max-w-[640px] px-5 py-10 sm:px-6">
        <Link
          href="/guide"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 transition hover:text-emerald-700"
        >
          <span aria-hidden>←</span> 가이드로
        </Link>

        <article className="mt-6">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            집중력·학업운을 높이는 책상 풍수
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-500">
            집중이 잘 되는 책상에는 공통점이 있습니다. 풍수의 지혜와 실제
            작업환경 상식이 만나는 지점을, 오늘 바로 적용할 수 있게 정리했습니다.
          </p>

          <div className="mt-8 space-y-8 text-[15px] leading-relaxed text-zinc-700">
            {SECTIONS.map((s) => (
              <section key={s.h}>
                <h2 className="mb-2 text-lg font-bold text-zinc-900">{s.h}</h2>
                <p>{s.p}</p>
              </section>
            ))}
          </div>

          <section className="mt-10 rounded-2xl bg-emerald-50 px-5 py-4 text-[15px] leading-relaxed text-emerald-900">
            <p>
              내 책상은 집중에 얼마나 좋은 환경일까요?{" "}
              <Link
                href="/"
                className="font-semibold text-emerald-700 underline underline-offset-2"
              >
                책상풍수
              </Link>
              에 사진을 올려 집중력·학업운 항목 점수를 재미로 확인해 보세요.
            </p>
          </section>
        </article>

        <footer className="mt-12 border-t border-zinc-100 pt-6 pb-10 text-center text-xs text-zinc-400">
          <p>© 2026 책상풍수</p>
          <SiteFooter />
        </footer>
      </main>
    </div>
  );
}
