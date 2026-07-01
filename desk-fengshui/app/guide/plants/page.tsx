import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "../../site-footer";

export const metadata: Metadata = {
  title: "책상에 두면 좋은 식물 7가지 — 풍수와 실용을 함께 · 책상풍수",
  description:
    "재물운과 집중력을 돕는다고 알려진 책상 식물 7가지. 잎 모양·관리 난이도·놓는 위치까지, 풍수 의미와 실제 효과를 함께 정리했습니다.",
};

const PLANTS = [
  {
    name: "스투키 / 산세베리아",
    body: "관리가 아주 쉽고 공기 정화로 유명합니다. 위로 곧게 자라는 모양이 상승의 기운을 상징해 재물·성장운에 좋다고 봅니다. 물을 자주 안 줘도 되어 책상용으로 제격.",
  },
  {
    name: "금전수(파키라)",
    body: "이름 그대로 재물을 부른다고 알려진 대표 풍수 식물. 둥근 잎이 부드러운 기운을 상징합니다. 책상 왼쪽 앞(재물 자리)에 두길 권합니다.",
  },
  {
    name: "테이블 야자",
    body: "작고 잎이 풍성해 생기(生氣)를 더합니다. 반그늘에서도 잘 자라 실내 책상에 무난합니다.",
  },
  {
    name: "스킨답서스",
    body: "덩굴성으로 관리가 쉽고 잘 죽지 않습니다. 초록이 시야에 들어오면 눈의 피로와 스트레스를 낮춰줘 집중에 도움이 됩니다.",
  },
  {
    name: "다육식물",
    body: "작고 귀여워 자리를 적게 차지합니다. 통통한 잎이 재물을 모으는 형상으로 여겨져요. 다만 빛이 필요하니 창가 쪽에.",
  },
  {
    name: "율마",
    body: "은은한 향과 밝은 연둣빛이 기분을 환기시킵니다. 다만 물·햇빛 관리가 조금 필요한 편이라 초보라면 주의.",
  },
  {
    name: "작은 대나무(개운죽)",
    body: "이름에 '개운(開運)'이 들어갈 만큼 행운의 상징으로 쓰입니다. 물꽂이로도 키울 수 있어 관리가 편해요.",
  },
];

export default function PlantsGuidePage() {
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
            책상에 두면 좋은 식물 7가지
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-500">
            책상 위 작은 식물 하나는 풍수에서 &lsquo;생기&rsquo;를 더하는 요소이자,
            실제로도 눈의 피로를 낮추고 기분을 환기시킵니다. 관리 쉬운 것 위주로,
            풍수 의미와 함께 골라봤어요.
          </p>

          <div className="mt-8 space-y-4">
            {PLANTS.map((p, i) => (
              <section
                key={p.name}
                className="rounded-2xl border border-zinc-100 px-4 py-3.5"
              >
                <h2 className="flex items-center gap-2 text-base font-bold text-zinc-900">
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: "#059669" }}
                  >
                    {i + 1}
                  </span>
                  {p.name}
                </h2>
                <p className="mt-1.5 text-[15px] leading-relaxed text-zinc-600">
                  {p.body}
                </p>
              </section>
            ))}
          </div>

          <section className="mt-8 rounded-2xl bg-emerald-50 px-5 py-4 text-[15px] leading-relaxed text-emerald-900">
            <h2 className="mb-1.5 font-bold">놓는 위치 팁</h2>
            <p>
              재물운을 노린다면 앉은 기준 <strong>왼쪽 앞</strong>, 집중력을
              노린다면 시야 한쪽 구석에 두세요. 시든 잎·마른 화분은 오히려 탁한
              기운이 되니 늘 생기 있게 관리하는 게 핵심입니다.
            </p>
          </section>

          <section className="mt-8 rounded-2xl bg-white px-1 text-[15px] leading-relaxed text-zinc-600">
            <p>
              내 책상엔 어떤 자리에 식물을 두면 좋을지 궁금하다면,{" "}
              <Link
                href="/"
                className="font-semibold text-emerald-600 underline underline-offset-2"
              >
                책상풍수
              </Link>
              에 사진을 올려 &lsquo;이걸 놓아보세요&rsquo; 추천을 받아보세요.
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
