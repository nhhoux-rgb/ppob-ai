import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "../site-footer";

export const metadata: Metadata = {
  title: "인형뽑기 공략 완전 가이드 · 뽑AI",
  description:
    "집게 종류별 공략법, 뽑기 쉬운 자리 고르는 법, 초보자가 자주 하는 실수까지. 인형뽑기 성공률을 높이는 실전 가이드입니다.",
};

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900 antialiased">
      <main className="mx-auto w-full max-w-[640px] px-5 py-10 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet-600 transition hover:text-violet-700"
        >
          <span aria-hidden>←</span> 홈으로
        </Link>

        <article className="mt-6">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            인형뽑기 공략 완전 가이드
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-500">
            인형뽑기는 운이 전부가 아닙니다. 기계의 구조와 인형의 배치를 읽을 줄
            알면 성공률을 눈에 띄게 끌어올릴 수 있습니다. 매장에서 바로 써먹을 수
            있는 핵심만 정리했습니다.
          </p>

          <div className="mt-8 space-y-9 text-[15px] leading-relaxed text-zinc-700">
            <section>
              <h2 className="mb-3 text-lg font-bold text-zinc-900">
                1. 먼저 알아야 할 기본 원리
              </h2>
              <p>
                인형뽑기 기계의 집게 힘은 매장 설정으로 조절됩니다. 많은 기계가
                평소에는 약하게 잡다가, 일정 횟수마다 한 번씩 강하게 잡도록
                설정되어 있습니다. 즉 &ldquo;한 번에 들어 올리는&rdquo; 것보다,
                인형을 조금씩 출구 쪽으로 옮기는 전략이 현실적인 경우가 많습니다.
                그래서 처음부터 무거워 보이는 인형, 깊이 파묻힌 인형을 노리는 건
                불리합니다.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-bold text-zinc-900">
                2. 집게(크레인) 종류별 공략
              </h2>
              <ul className="space-y-3">
                <li>
                  <strong>3발 집게</strong> — 가장 흔하고 안정적입니다. 인형의
                  머리나 매듭처럼 걸리는 부분을 세 발 중심에 두면 잘 끌려옵니다.
                </li>
                <li>
                  <strong>2발 집게</strong> — 힘이 약한 편이라 들어 올리기보다는
                  밀거나 끌어서 출구로 이동시키는 용도로 접근하세요.
                </li>
                <li>
                  <strong>약한 집게(슬라이드형)</strong> — 잡는 힘이 거의 없는
                  세팅입니다. 인형이 출구에 아주 가까이 걸쳐 있을 때만 노리는 게
                  좋습니다.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-bold text-zinc-900">
                3. 뽑기 쉬운 자리 고르는 법
              </h2>
              <p className="mb-2">성공률이 높은 인형에는 공통점이 있습니다.</p>
              <ul className="list-disc space-y-1.5 pl-5">
                <li>출구(구멍)에 가까이 있고, 출구 쪽으로 기울어진 인형</li>
                <li>다른 인형 위에 헐겁게 얹혀 있어 살짝만 밀어도 움직이는 인형</li>
                <li>고리·태그·매듭 등 집게가 확실히 걸릴 부분이 보이는 인형</li>
                <li>유리벽이나 모서리에 끼지 않은, 공간이 트인 인형</li>
              </ul>
              <p className="mt-3">
                반대로 빽빽하게 쌓인 더미 한가운데, 무게중심이 깊은 큰 인형,
                벽에 끼인 인형은 피하는 것이 좋습니다.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-bold text-zinc-900">
                4. 초보자가 가장 많이 하는 실수
              </h2>
              <ul className="list-disc space-y-1.5 pl-5">
                <li>제일 크고 예쁜 인형부터 노린다 (대개 가장 어렵습니다)</li>
                <li>좌표를 인형 중심이 아니라 &ldquo;집게가 걸릴 부분&rdquo;에 맞추지 않는다</li>
                <li>한 기계에 무리하게 돈을 쏟아붓는다</li>
                <li>집게가 흔들리는 걸 고려하지 않고 위치를 잡는다</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-bold text-zinc-900">
                5. 비용 관리 — 멈춰야 할 때
              </h2>
              <p>
                예산을 미리 정하고, 그 안에서 끝내는 습관이 가장 중요합니다.
                같은 기계에서 여러 번 시도했는데 인형이 거의 움직이지 않는다면,
                그 기계는 설정이 빡빡할 가능성이 큽니다. 미련 없이 다른 기계로
                옮기는 것이 오히려 이득입니다.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-bold text-zinc-900">
                6. 뽑AI 활용 팁
              </h2>
              <p>
                위 기준들을 눈으로 일일이 따지기 어렵다면,{" "}
                <Link
                  href="/"
                  className="font-semibold text-violet-600 underline underline-offset-2"
                >
                  뽑AI
                </Link>
                에 기계 사진을 올려보세요. AI가 위 원리들을 바탕으로 성공
                가능성이 높은 인형과 집게를 떨어뜨릴 위치를 추천해 줍니다. 단,
                사진으로는 집게 힘 세팅까지 알 수 없으므로, 최종 판단은 직접 보고
                내리는 것이 가장 정확합니다.
              </p>
            </section>
          </div>
        </article>

        <section className="mt-10 border-t border-zinc-100 pt-6">
          <h2 className="mb-3 text-base font-bold text-zinc-900">더 읽어보기</h2>
          <ul className="space-y-2">
            <li>
              <Link
                href="/guide/price"
                className="text-sm font-semibold text-violet-600 underline underline-offset-2"
              >
                인형뽑기 인형 가격은 얼마? 본전 뽑는 법
              </Link>
            </li>
            <li>
              <Link
                href="/guide/rigged"
                className="text-sm font-semibold text-violet-600 underline underline-offset-2"
              >
                인형뽑기 조작될까? 성공 확률 높이는 법
              </Link>
            </li>
          </ul>
        </section>

        <footer className="mt-12 border-t border-zinc-100 pt-6 pb-10 text-center text-xs text-zinc-400">
          <p>© 2026 뽑AI</p>
          <SiteFooter />
        </footer>
      </main>
    </div>
  );
}
