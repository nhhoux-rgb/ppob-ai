import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "../../site-footer";

export const metadata: Metadata = {
  title: "책상 풍수 색깔 — 재물운·집중력 높이는 색 · 책상풍수",
  description:
    "책상 소품·마우스패드·조명 색으로 기운을 바꾸는 법. 재물운의 노랑·금색, 집중의 초록·파랑 등 오행 색깔의 의미를 쉽게 정리했습니다.",
};

const COLORS = [
  {
    name: "초록 (나무 木)",
    for: "집중·성장·학업",
    dot: "#16a34a",
    body: "눈이 가장 편안한 색이자 성장의 기운. 식물·소품·마우스패드로 초록을 더하면 오래 앉아 있어도 덜 지칩니다. 학생·수험생 책상에 특히 추천.",
  },
  {
    name: "파랑 (물 水)",
    for: "차분함·집중",
    dot: "#2563eb",
    body: "마음을 가라앉히고 몰입을 돕는 색. 산만해지기 쉬운 사람에게 좋아요. 다만 너무 짙으면 우울해질 수 있으니 밝은 톤으로.",
  },
  {
    name: "노랑·금색 (흙·금 土金)",
    for: "재물운",
    dot: "#d97706",
    body: "풍수에서 재물을 상징하는 대표 색. 작은 금색 소품이나 노란 포인트를 왼쪽 앞(재물 자리)에 두면 좋다고 봅니다. 과하면 산만하니 포인트로만.",
  },
  {
    name: "흰색·베이지",
    for: "정돈·깔끔함",
    dot: "#a1a1aa",
    body: "기본이 되는 색으로, 공간을 넓고 깔끔해 보이게 합니다. 바탕을 밝게 하고 위 색들을 포인트로 얹는 조합이 무난해요.",
  },
  {
    name: "빨강 (불 火)",
    for: "활력·주의",
    dot: "#dc2626",
    body: "에너지와 열정의 색이지만 강해서 집중을 방해할 수 있습니다. 넓게 쓰기보단 아주 작은 포인트로만 쓰는 걸 권합니다.",
  },
];

export default function ColorGuidePage() {
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
            책상 풍수 색깔 — 재물운·집중력 높이는 색
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-500">
            책상을 통째로 바꾸긴 어려워도, 마우스패드·소품·조명 색 하나는 오늘
            바로 바꿀 수 있죠. 풍수의 오행(五行) 색깔 의미를 실제 책상에 쓰기 좋게
            정리했습니다.
          </p>

          <div className="mt-8 space-y-3">
            {COLORS.map((c) => (
              <section
                key={c.name}
                className="flex gap-3 rounded-2xl border border-zinc-100 px-4 py-3.5"
              >
                <span
                  className="mt-1 h-5 w-5 shrink-0 rounded-full"
                  style={{ backgroundColor: c.dot }}
                  aria-hidden
                />
                <div>
                  <p className="flex flex-wrap items-center gap-2 text-[15px] font-bold text-zinc-900">
                    {c.name}
                    <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                      {c.for}
                    </span>
                  </p>
                  <p className="mt-1 text-[15px] leading-relaxed text-zinc-600">
                    {c.body}
                  </p>
                </div>
              </section>
            ))}
          </div>

          <section className="mt-8 rounded-2xl bg-emerald-50 px-5 py-4 text-[15px] leading-relaxed text-emerald-900">
            <h2 className="mb-1.5 font-bold">한 줄 요약</h2>
            <p>
              바탕은 밝게(흰·베이지) → 집중은 초록·파랑 → 재물 포인트는 노랑·금색을
              왼쪽 앞에. 빨강은 아주 조금만. 색은 &lsquo;포인트&rsquo;로 쓸 때 가장
              효과적입니다.
            </p>
          </section>

          <p className="mt-6 text-[15px] leading-relaxed text-zinc-600">
            내 책상 색 조합이 지금 어떤지 궁금하다면{" "}
            <Link
              href="/"
              className="font-semibold text-emerald-600 underline underline-offset-2"
            >
              책상풍수
            </Link>
            로 사진을 올려 점수와 개운법을 재미로 확인해 보세요.
          </p>
        </article>

        <footer className="mt-12 border-t border-zinc-100 pt-6 pb-10 text-center text-xs text-zinc-400">
          <p>© 2026 책상풍수</p>
          <SiteFooter />
        </footer>
      </main>
    </div>
  );
}
