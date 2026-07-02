import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "../../site-footer";

export const metadata: Metadata = {
  title: "상가·사무실 중개수수료(복비) 완전정리 · 복비 계산기",
  description:
    "상가·사무실 임대·매매 중개보수는 0.9% 이내 협의입니다. 상가 복비 계산법, 월세 거래금액 환산, 부가세와 권리금 처리까지 예시와 함께 정리했습니다.",
  alternates: { canonical: "/guide/commercial" },
};

export default function CommercialGuidePage() {
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
            상가·사무실 중개수수료 완전정리
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-500">
            상가나 사무실을 임대·매매할 때 복비는 주택과 계산법이 다릅니다.
            헷갈리기 쉬운 상가 중개보수의 요율·환산·부가세를 예시와 함께
            정리했습니다.
          </p>

          <div className="mt-8 space-y-8 text-[15px] leading-relaxed text-zinc-700">
            <section>
              <h2 className="mb-2 text-lg font-bold text-zinc-900">
                상가 복비는 0.9% 이내 협의
              </h2>
              <p>
                상가·사무실 등 주택이 아닌 부동산은 &lsquo;그 밖의
                중개대상물&rsquo;로 분류됩니다. 이 경우 매매든 임대차든 구분 없이{" "}
                <strong>거래금액의 0.9% 이내에서 중개사와 협의</strong>해 정하며,
                주택처럼 금액 구간이나 한도액이 없습니다. 즉 0.9%는 상한이고,
                실제로는 그 아래에서 조율하는 것이 일반적입니다.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-bold text-zinc-900">
                상가 월세, 거래금액은 이렇게 환산합니다
              </h2>
              <p>
                상가 임대차도 주택과 같은 방식으로 보증금과 월세를 하나의
                거래금액으로 환산한 뒤 요율을 적용합니다.
              </p>
              <div className="mt-2 rounded-xl bg-emerald-50 px-4 py-3 text-[15px] font-semibold text-emerald-800">
                거래금액 = 보증금 + (월세 × 100)
                <br />
                <span className="text-sm font-normal text-emerald-700">
                  단, 위 금액이 5천만원 미만이면 → 보증금 + (월세 × 70)
                </span>
              </div>
              <p className="mt-3 text-sm text-zinc-500">
                예) 보증금 5,000만원 / 월세 200만원인 사무실 → 거래금액 = 5,000만
                + (200만 × 100) = 2억 5,000만원. 여기에 0.9%를 적용하면 상한
                중개보수는 <strong>225만원</strong>(부가세 별도)입니다.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-bold text-zinc-900">
                부가세와 권리금은 어떻게 되나요?
              </h2>
              <ul className="list-disc space-y-1.5 pl-5">
                <li>
                  <strong>부가가치세</strong> — 상가 거래는 대부분 사업자
                  간이라 부가세가 별도로 붙습니다. 일반과세 중개사무소는 10%,
                  간이과세는 약 4%입니다.
                </li>
                <li>
                  <strong>권리금</strong> — 권리금은 임대차 계약과 별개라{" "}
                  <strong>중개보수 산정 기준에 포함하지 않습니다.</strong> 다만
                  권리금 계약을 별도로 중개하면 그에 대한 보수는 당사자 간 협의로
                  정합니다.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-bold text-zinc-900">
                주택보다 비싸질 수 있으니 미리 계산하세요
              </h2>
              <p>
                주택 임대차는 구간에 따라 0.3%까지 내려가지만, 상가는 금액과
                무관하게 0.9%가 상한입니다. 거래금액이 클수록 복비 차이가 커지니,
                계약 전에 상한이 얼마인지 확인하고 협의에 임하는 것이 좋습니다.
              </p>
            </section>
          </div>

          <section className="mt-8 rounded-2xl bg-emerald-50 px-5 py-4 text-[15px] leading-relaxed text-emerald-900">
            <p>
              <Link
                href="/"
                className="font-semibold text-emerald-700 underline underline-offset-2"
              >
                복비 계산기
              </Link>
              에서 &lsquo;상가·사무실&rsquo;을 선택하고 금액을 넣으면 0.9% 기준
              상한이 바로 계산됩니다.
            </p>
          </section>

          <p className="mt-6 text-xs leading-relaxed text-zinc-400">
            본 내용은 일반적인 안내이며 법률 자문이 아닙니다. 구체적인 요율·분쟁은
            관할 시·군·구나 한국공인중개사협회에 확인하시기 바랍니다.
          </p>
        </article>

        <footer className="mt-12 border-t border-zinc-100 pt-6 pb-10 text-center text-xs text-zinc-400">
          <p>© 2026 복비 계산기</p>
          <SiteFooter />
        </footer>
      </main>
    </div>
  );
}
