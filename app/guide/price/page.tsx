import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "../../site-footer";

export const metadata: Metadata = {
  title: "인형뽑기 인형 가격은 얼마? 본전 뽑는 법 · 뽑AI",
  description:
    "인형뽑기 인형의 대략적인 소매가와 손익분기(본전) 계산법을 정리했습니다. 몇 판 안에 뽑아야 이득인지 알아보세요.",
};

export default function GuidePricePage() {
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
            인형뽑기 인형 가격은 얼마? 본전 뽑는 법
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-zinc-500">
            “이거 뽑는 게 이득일까?” 인형뽑기를 할 때 누구나 한 번쯤 하는 고민입니다.
            인형의 대략적인 가격을 알면 몇 판까지 도전하는 게 합리적인지 판단할 수
            있습니다.
          </p>

          <div className="mt-8 space-y-9 text-[15px] leading-relaxed text-zinc-700">
            <section>
              <h2 className="mb-3 text-lg font-bold text-zinc-900">
                인형뽑기 인형의 대략적인 가격대
              </h2>
              <p className="mb-2">
                인형 가격은 <strong>크기</strong>와 <strong>정품(라이선스) 여부</strong>에
                따라 크게 달라집니다. 한국 시장 기준 대략적인 소매가는 다음과
                같습니다.
              </p>
              <ul className="list-disc space-y-1.5 pl-5">
                <li>소형 무명 봉제인형: 약 2,000 ~ 4,000원</li>
                <li>중형 무명 봉제인형: 약 4,000 ~ 9,000원</li>
                <li>대형 무명 봉제인형: 약 10,000 ~ 20,000원</li>
                <li>소형 정품 캐릭터: 약 6,000 ~ 13,000원</li>
                <li>중형 정품 캐릭터: 약 13,000 ~ 28,000원</li>
                <li>대형 정품·한정판: 약 28,000원 이상</li>
              </ul>
              <p className="mt-3 text-sm text-zinc-500">
                ※ 위는 일반적인 기준이며 인기 IP나 한정판은 더 비쌀 수 있습니다.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-bold text-zinc-900">
                손익분기(본전) 계산법
              </h2>
              <p className="mb-2">계산은 아주 간단합니다.</p>
              <div className="rounded-2xl bg-violet-50 px-5 py-4 text-center font-semibold text-violet-800">
                본전 판수 = 인형 가격 ÷ 한 판 가격
              </div>
              <p className="mt-3">
                예를 들어 인형 가격이 <strong>5,000원</strong>이고 한 판이{" "}
                <strong>1,000원</strong>이라면, <strong>5판</strong> 안에 뽑으면
                이득입니다. 6판째부터는 그냥 사는 게 더 쌉니다. 인형이{" "}
                <strong>20,000원</strong>짜리 큰 정품이라면 20판까지도 해볼 만하다는
                뜻이죠.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-bold text-zinc-900">
                본전 판단이 중요한 이유
              </h2>
              <p>
                인형뽑기는 “조금만 더”의 함정에 빠지기 쉽습니다. 미리 인형 가격과 본전
                판수를 정해두면, 감정적으로 돈을 쏟아붓는 일을 막을 수 있습니다. 본전
                판수를 넘겼는데도 인형이 거의 움직이지 않는다면, 그 기계는 과감히
                포기하는 것이 이득입니다.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-bold text-zinc-900">
                사진으로 가격·본전 바로 확인하기
              </h2>
              <p>
                인형 가격을 눈대중으로 가늠하기 어렵다면,{" "}
                <Link
                  href="/value"
                  className="font-semibold text-violet-600 underline underline-offset-2"
                >
                  본전 분석
                </Link>
                에 인형 사진을 올려보세요. AI가 크기와 정품 여부를 따져 대략적인
                소매가와 “몇 판 안에 뽑으면 이득”인지 계산해 줍니다.
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
