import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "../../site-footer";

export const metadata: Metadata = {
  title: "책상 방향 풍수 — 어느 쪽을 보고 앉아야 할까 · 책상풍수",
  description:
    "동·서·남·북 방향별 책상 풍수의 의미와, 문·창문·벽을 기준으로 자리를 잡는 법. 집중과 재물운을 살리는 책상 방향 배치를 정리했습니다.",
};

const DIRECTIONS = [
  {
    dir: "동쪽(東)",
    tag: "성장·학업",
    body: "해가 뜨는 방향으로, 시작과 성장의 기운을 상징합니다. 공부하는 학생이나 새 일을 시작하는 사람에게 좋다고 봅니다.",
  },
  {
    dir: "남쪽(南)",
    tag: "명예·인기",
    body: "밝고 활발한 기운의 방향. 사람을 상대하거나 이름을 알려야 하는 일에 유리하다고 여겨집니다. 다만 빛이 너무 강하면 모니터 반사에 주의.",
  },
  {
    dir: "서쪽(西)",
    tag: "안정·재물 마무리",
    body: "해가 지는 방향으로 수확·안정의 기운. 하루를 정리하고 성과를 다지는 데 어울린다고 봅니다.",
  },
  {
    dir: "북쪽(北)",
    tag: "집중·차분함",
    body: "차분하고 조용한 기운의 방향. 깊은 몰입이 필요한 연구·집필에 좋다고 여겨집니다. 대신 어두워지기 쉬우니 조명을 보완하세요.",
  },
];

export default function DirectionGuidePage() {
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
            책상 방향 풍수 — 어느 쪽을 보고 앉아야 할까
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-500">
            &ldquo;책상을 어느 방향으로 두어야 하나요?&rdquo;는 책상 풍수에서 가장
            많이 나오는 질문입니다. 방위(동서남북)도 의미가 있지만, 실제로 더
            중요한 건 <strong>문·창문·벽과의 관계</strong>예요. 둘 다 짚어볼게요.
          </p>

          <section className="mt-8">
            <h2 className="mb-3 text-lg font-bold text-zinc-900">
              먼저 — 문·벽·창 기준이 방위보다 중요합니다
            </h2>
            <ul className="list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed text-zinc-700">
              <li>
                <strong>등 뒤는 벽</strong>: 든든한 배경(靠山)이 되어 심리적
                안정과 집중을 돕습니다.
              </li>
              <li>
                <strong>문은 시야 안에</strong>: 앉아서 출입문이 보이면 안정감이
                생깁니다. 등지고 앉으면 무의식적으로 긴장해요.
              </li>
              <li>
                <strong>창을 정면으로 마주 보지 않기</strong>: 시선과 기운이 밖으로
                새기 쉽습니다. 창은 옆쪽에 두는 배치가 무난합니다.
              </li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="mb-3 text-lg font-bold text-zinc-900">
              방위별 의미 (참고용)
            </h2>
            <div className="space-y-3">
              {DIRECTIONS.map((d) => (
                <div
                  key={d.dir}
                  className="rounded-2xl border border-zinc-100 px-4 py-3"
                >
                  <p className="flex items-center gap-2 text-[15px] font-bold text-zinc-900">
                    {d.dir}
                    <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                      {d.tag}
                    </span>
                  </p>
                  <p className="mt-1 text-[15px] leading-relaxed text-zinc-600">
                    {d.body}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-10 rounded-2xl bg-emerald-50 px-5 py-4 text-[15px] leading-relaxed text-emerald-900">
            <p>
              방향을 바꾸기 어려운 자리라면, 조명·정리·소품으로 부족한 기운을
              보완할 수 있어요.{" "}
              <Link
                href="/"
                className="font-semibold text-emerald-700 underline underline-offset-2"
              >
                책상풍수
              </Link>
              에 사진을 올리면 지금 배치에 맞는 개운법을 재미로 확인할 수 있습니다.
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
