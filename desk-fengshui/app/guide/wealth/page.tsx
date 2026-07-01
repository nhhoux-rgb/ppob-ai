import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "../../site-footer";

export const metadata: Metadata = {
  title: "재물운을 부르는 책상 배치 5가지 · 책상풍수",
  description:
    "책상 위 물·식물·조명 배치부터 지갑과 통장 두는 자리까지. 재물의 기운을 살리는 책상 풍수 배치법을 정리했습니다.",
};

const TIPS = [
  {
    title: "물의 기운은 왼쪽 앞에",
    body: "풍수에서 물은 재물의 흐름을 상징합니다. 앉은 기준 왼쪽 앞은 재물이 들어오는 방향으로 여겨져, 유리컵·작은 어항·유리 소품처럼 맑고 투명한 물건을 두면 좋다고 봅니다. 단, 물이 탁하거나 컵이 지저분하면 오히려 역효과이니 늘 깨끗하게 유지하세요.",
  },
  {
    title: "지갑·통장은 어둡고 안정된 자리에",
    body: "돈과 관련된 물건은 사람 눈에 계속 노출되기보다, 서랍처럼 차분하고 정돈된 공간에 두는 것이 좋다고 봅니다. 아무 데나 굴러다니는 지갑은 재물이 &lsquo;머물지 못하는&rsquo; 상태로 해석됩니다.",
  },
  {
    title: "밝은 조명으로 양의 기운 채우기",
    body: "어두운 책상은 재물운도 가라앉습니다. 스탠드 하나를 더해 손 닿는 공간을 밝히세요. 특히 저녁에 작업이 많다면 따뜻한 색온도의 간접광이 안정감을 줍니다.",
  },
  {
    title: "돈 나가는 상징은 치우기",
    body: "깨진 컵, 고장 난 물건, 마른 화분, 영수증 더미처럼 &lsquo;소모&rsquo;를 연상시키는 물건은 재물의 기운을 흩뜨린다고 봅니다. 눈에 보이는 곳에서 치우는 것만으로 책상 인상이 크게 달라집니다.",
  },
  {
    title: "정면은 비우고 시야를 트기",
    body: "앉았을 때 정면이 물건으로 꽉 막혀 있으면 기운도 시야도 답답해집니다. 정면을 살짝 비워 트인 공간을 두면 &lsquo;기회가 들어올 자리&rsquo;가 생긴다고 해석합니다.",
  },
];

export default function WealthGuidePage() {
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
            재물운을 부르는 책상 배치 5가지
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-500">
            재물운 풍수라고 하면 거창해 보이지만, 핵심은 &ldquo;돈이 머물고 싶은
            깨끗하고 밝은 자리&rdquo;를 만드는 것입니다. 오늘 바로 해볼 수 있는
            다섯 가지를 정리했습니다.
          </p>

          <div className="mt-8 space-y-8">
            {TIPS.map((tip, i) => (
              <section key={tip.title}>
                <h2 className="mb-2 flex items-center gap-2 text-lg font-bold text-zinc-900">
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: "#059669" }}
                  >
                    {i + 1}
                  </span>
                  {tip.title}
                </h2>
                <p className="text-[15px] leading-relaxed text-zinc-700">
                  {tip.body}
                </p>
              </section>
            ))}
          </div>

          <section className="mt-10 rounded-2xl bg-emerald-50 px-5 py-4 text-[15px] leading-relaxed text-emerald-900">
            <p>
              내 책상은 지금 어떤 상태일까요?{" "}
              <Link
                href="/"
                className="font-semibold text-emerald-700 underline underline-offset-2"
              >
                책상풍수
              </Link>
              에 사진을 올리면 재물운을 포함한 항목별 점수와 개운법을 재미로
              확인할 수 있습니다.
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
