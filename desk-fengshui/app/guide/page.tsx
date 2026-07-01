import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "../site-footer";

export const metadata: Metadata = {
  title: "책상 풍수 완전 가이드 · 책상풍수",
  description:
    "책상 방향, 모니터·조명 배치, 정리정돈, 식물과 소품까지. 재물운과 집중력을 끌어올리는 책상 풍수의 기본 원리를 쉽게 정리했습니다.",
};

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900 antialiased">
      <main className="mx-auto w-full max-w-[640px] px-5 py-10 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 transition hover:text-emerald-700"
        >
          <span aria-hidden>←</span> 홈으로
        </Link>

        <article className="mt-6">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            책상 풍수 완전 가이드
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-500">
            풍수는 결국 &ldquo;머무는 공간의 기운을 정돈하는 법&rdquo;입니다.
            하루 대부분을 보내는 책상은 그중에서도 나에게 가장 큰 영향을 주는
            공간이죠. 거창한 이사 없이도, 오늘 바로 손볼 수 있는 책상 풍수의
            핵심만 모았습니다.
          </p>

          <div className="mt-8 space-y-9 text-[15px] leading-relaxed text-zinc-700">
            <section>
              <h2 className="mb-3 text-lg font-bold text-zinc-900">
                1. 책상 풍수의 기본 원리
              </h2>
              <p>
                풍수의 핵심은 기운이 &ldquo;막히지 않고 부드럽게 흐르게&rdquo;
                하는 것입니다. 책상으로 옮겨 보면 의외로 단순합니다. 어수선하게
                쌓인 물건은 시선과 동선을 막고, 밝고 트인 공간은 흐름을 살립니다.
                즉 좋은 책상 풍수의 대부분은 <strong>정리·채광·배치</strong> 세
                가지로 설명됩니다. 실제로도 이 세 가지는 집중력과 기분에 직접
                영향을 주죠.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-bold text-zinc-900">
                2. 책상의 방향과 자리
              </h2>
              <ul className="space-y-3">
                <li>
                  <strong>문을 등지지 않기</strong> — 앉았을 때 출입문이 시야에
                  들어오면 심리적으로 안정감이 생깁니다. 등 뒤로 문이 열려 있으면
                  무의식적으로 긴장하게 되죠.
                </li>
                <li>
                  <strong>벽을 등지기</strong> — 등 뒤가 벽이면 &ldquo;든든한
                  배경(靠山)&rdquo;이 되어 집중이 안정된다고 봅니다.
                </li>
                <li>
                  <strong>창을 정면으로 마주 보지 않기</strong> — 시야가 트이는
                  건 좋지만, 정면 창은 시선과 기운이 밖으로 빠져나가기 쉽습니다.
                  창은 옆쪽에 두는 배치가 무난합니다.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-bold text-zinc-900">
                3. 모니터·조명 배치
              </h2>
              <p className="mb-2">
                빛은 풍수에서 &ldquo;양(陽)의 기운&rdquo;을 상징합니다. 어두운
                책상은 기운이 가라앉습니다.
              </p>
              <ul className="list-disc space-y-1.5 pl-5">
                <li>주 조명 외에 손 닿는 곳에 스탠드 하나를 더 두세요.</li>
                <li>모니터 뒤가 완전한 어둠이 되지 않도록 은은한 간접광을 두면 좋습니다.</li>
                <li>모니터는 눈높이에 맞추고, 정면 벽과 너무 가깝지 않게 둡니다.</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-bold text-zinc-900">
                4. 정리정돈 — 가장 강력한 개운법
              </h2>
              <p>
                풍수에서 가장 나쁜 것은 &ldquo;정체된 기운&rdquo;입니다. 오래
                쌓인 서류, 다 쓴 컵, 엉킨 전선은 탁한 기운의 상징이자 실제로
                집중을 방해하는 요소죠. 책상 위에는 지금 쓰는 물건만 남기고,
                하루를 마칠 때 표면을 비우는 습관이 어떤 소품보다 효과적입니다.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-bold text-zinc-900">
                5. 식물과 소품
              </h2>
              <ul className="list-disc space-y-1.5 pl-5">
                <li>
                  <strong>작은 초록 식물</strong> — 생기(生氣)를 더합니다. 잎이
                  둥근 종류가 부드러운 기운으로 여겨집니다.
                </li>
                <li>
                  <strong>왼쪽 앞의 물·유리 소품</strong> — 물은 재물의 흐름을
                  상징해, 들어오는 방향인 왼쪽 앞에 두길 권합니다.
                </li>
                <li>
                  <strong>과한 장식은 금물</strong> — 소품이 많아지면 오히려
                  어수선해집니다. 하나씩 절제해서 두세요.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-bold text-zinc-900">
                6. 책상풍수 활용 팁
              </h2>
              <p>
                위 기준을 눈으로 하나하나 따지기 번거롭다면,{" "}
                <Link
                  href="/"
                  className="font-semibold text-emerald-600 underline underline-offset-2"
                >
                  책상풍수
                </Link>
                에 책상 사진을 올려보세요. AI가 위 원리들을 바탕으로 종합 점수와
                항목별 개운법을 정리해 줍니다. 어디까지나 재미로 보는
                심심풀이이니, 결과는 가볍게 즐기고 마음에 드는 조언 하나만
                실천해도 충분합니다.
              </p>
            </section>
          </div>
        </article>

        <section className="mt-10 border-t border-zinc-100 pt-6">
          <h2 className="mb-3 text-base font-bold text-zinc-900">더 읽어보기</h2>
          <ul className="space-y-2">
            <li>
              <Link
                href="/guide/wealth"
                className="text-sm font-semibold text-emerald-600 underline underline-offset-2"
              >
                재물운을 부르는 책상 배치 5가지
              </Link>
            </li>
            <li>
              <Link
                href="/guide/focus"
                className="text-sm font-semibold text-emerald-600 underline underline-offset-2"
              >
                집중력·학업운을 높이는 책상 풍수
              </Link>
            </li>
            <li>
              <Link
                href="/guide/direction"
                className="text-sm font-semibold text-emerald-600 underline underline-offset-2"
              >
                책상 방향 풍수 — 어느 쪽을 보고 앉아야 할까
              </Link>
            </li>
            <li>
              <Link
                href="/guide/plants"
                className="text-sm font-semibold text-emerald-600 underline underline-offset-2"
              >
                책상에 두면 좋은 식물 7가지
              </Link>
            </li>
            <li>
              <Link
                href="/guide/color"
                className="text-sm font-semibold text-emerald-600 underline underline-offset-2"
              >
                책상 풍수 색깔 — 재물운·집중력 높이는 색
              </Link>
            </li>
          </ul>
        </section>

        <footer className="mt-12 border-t border-zinc-100 pt-6 pb-10 text-center text-xs text-zinc-400">
          <p>© 2026 책상풍수</p>
          <SiteFooter />
        </footer>
      </main>
    </div>
  );
}
