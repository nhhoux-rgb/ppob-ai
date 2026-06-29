import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "../../site-footer";

export const metadata: Metadata = {
  title: "인형뽑기 조작 논란과 성공 확률 높이는 법 · 뽑AI",
  description:
    "인형뽑기 집게 힘 조작은 사실일까? 기계의 작동 원리와 성공 확률을 현실적으로 높이는 방법을 정리했습니다.",
};

export default function GuideRiggedPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900 antialiased">
      <main className="mx-auto w-full max-w-[640px] px-5 py-10 sm:px-6">
        <Link
          href="/guide"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet-600 transition hover:text-violet-700"
        >
          <span aria-hidden>←</span> 공략 가이드
        </Link>

        <article className="mt-6">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            인형뽑기 조작될까? 성공 확률 높이는 법
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-zinc-500">
            “집게 힘이 일부러 약한 것 같다”는 의심, 한 번쯤 해보셨을 겁니다. 실제로
            기계는 어떻게 작동하고, 그 안에서 성공 확률을 높이려면 어떻게 해야 할까요?
          </p>

          <div className="mt-8 space-y-9 text-[15px] leading-relaxed text-zinc-700">
            <section>
              <h2 className="mb-3 text-lg font-bold text-zinc-900">
                집게 힘은 “조작”이 아니라 “설정”
              </h2>
              <p>
                많은 인형뽑기 기계는 집게의 잡는 힘을 매장에서 조절할 수 있습니다.
                불법적인 조작이라기보다, 기기 자체에 들어있는 정상적인 설정 기능입니다.
                대표적으로 <strong>일정 횟수마다 한 번씩 강하게 잡도록</strong> 맞춰두는
                방식이 흔합니다. 그래서 평소엔 힘이 약하게 느껴질 수 있습니다.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-bold text-zinc-900">
                그래서 어떻게 접근해야 할까
              </h2>
              <ul className="list-disc space-y-1.5 pl-5">
                <li>
                  한 번에 들어 올리려 하기보다, 인형을 <strong>조금씩 출구 쪽으로
                  이동</strong>시키는 전략이 현실적입니다.
                </li>
                <li>
                  출구에 가깝거나 헐겁게 얹힌 인형을 노리세요. 깊이 파묻힌 큰 인형은
                  설정이 강하지 않으면 거의 안 올라옵니다.
                </li>
                <li>
                  같은 기계에서 여러 번 시도해도 인형이 미동도 없다면, 설정이 빡빡한
                  기계일 가능성이 큽니다. 다른 기계로 옮기는 게 이득입니다.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-bold text-zinc-900">
                사진으로 성공 확률 높이기
              </h2>
              <p>
                어떤 인형이 성공 가능성이 높은지 눈으로 판단하기 어렵다면,{" "}
                <Link
                  href="/"
                  className="font-semibold text-violet-600 underline underline-offset-2"
                >
                  인형뽑기 AI 공략
                </Link>
                에 기계 사진을 올려보세요. AI가 출구와의 거리, 집게가 걸릴 부분 등을
                분석해 가장 뽑기 쉬운 인형과 공략 위치를 추천해 줍니다. 더 자세한 전략은{" "}
                <Link
                  href="/guide"
                  className="font-semibold text-violet-600 underline underline-offset-2"
                >
                  공략 가이드
                </Link>
                에서 확인하세요.
              </p>
            </section>
          </div>
        </article>

        <footer className="mt-12 border-t border-zinc-100 pt-6 pb-10 text-center text-xs text-zinc-400">
          <p>© 2026 뽑AI</p>
          <SiteFooter />
        </footer>
      </main>
    </div>
  );
}
