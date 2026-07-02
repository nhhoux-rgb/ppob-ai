import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "../../site-footer";

export const metadata: Metadata = {
  title: "오피스텔 복비는 왜 다를까 — 주거용 요건과 요율 · 복비 계산기",
  description:
    "오피스텔 중개보수는 주택과 요율이 다릅니다. 주거용 오피스텔 요건, 매매 0.5%·임대차 0.4% 요율, 상가 취급되는 경우까지 정리했습니다.",
  alternates: { canonical: "/guide/officetel" },
};

export default function OfficetelGuidePage() {
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
            오피스텔 복비는 왜 다를까
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-500">
            오피스텔은 &lsquo;주택&rsquo;도 아니고 &lsquo;상가&rsquo;도 아닌 애매한
            위치에 있어, 중개보수 요율이 주택과 다릅니다. 어떤 요율이 적용되는지
            정리했습니다.
          </p>

          <div className="mt-8 space-y-7 text-[15px] leading-relaxed text-zinc-700">
            <section>
              <h2 className="mb-2 text-lg font-bold text-zinc-900">
                주거용 오피스텔 요율
              </h2>
              <p className="mb-2">
                다음 요건을 모두 갖춘 오피스텔은 전용 요율이 적용됩니다.
              </p>
              <ul className="list-disc space-y-1.5 pl-5">
                <li>전용면적 85㎡ 이하</li>
                <li>전용 입식 부엌, 수세식 화장실 및 목욕시설 등 구비</li>
              </ul>
              <div className="mt-3 overflow-hidden rounded-xl border border-zinc-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-zinc-50 text-zinc-500">
                      <th className="px-3 py-2.5 text-left font-semibold">
                        구분
                      </th>
                      <th className="px-3 py-2.5 text-right font-semibold">
                        상한요율
                      </th>
                      <th className="px-3 py-2.5 text-right font-semibold">
                        한도액
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    <tr>
                      <td className="px-3 py-2.5 text-zinc-700">매매·교환</td>
                      <td className="px-3 py-2.5 text-right font-semibold tabular-nums">
                        0.5%
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-zinc-500">
                        없음
                      </td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2.5 text-zinc-700">
                        임대차(전세·월세)
                      </td>
                      <td className="px-3 py-2.5 text-right font-semibold tabular-nums">
                        0.4%
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-zinc-500">
                        없음
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-bold text-zinc-900">
                요건을 벗어나면 &lsquo;그 밖의 부동산&rsquo;
              </h2>
              <p>
                면적이 85㎡를 넘거나 주거 설비 요건을 갖추지 못한 오피스텔,
                업무용으로 쓰이는 오피스텔은 상가 등과 같은{" "}
                <strong>&lsquo;그 밖의 중개대상물&rsquo;</strong>로 분류되어{" "}
                <strong>거래금액의 0.9% 이내</strong>에서 중개사와 협의해 정합니다.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-bold text-zinc-900">
                왜 주택 요율보다 불리할 수 있나요?
              </h2>
              <p>
                주택 임대차는 구간에 따라 0.3%까지 내려가지만, 주거용 오피스텔
                임대차는 금액과 무관하게 0.4% 단일 요율에 한도액도 없습니다.
                그래서 거래금액이 클수록 주택보다 복비가 더 나올 수 있으니, 계약
                전에 미리 계산해 두는 것이 좋습니다.
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
              에서 &lsquo;오피스텔&rsquo;을 선택하면 전용 요율로 바로 계산됩니다.
            </p>
          </section>
        </article>

        <footer className="mt-12 border-t border-zinc-100 pt-6 pb-10 text-center text-xs text-zinc-400">
          <p>© 2026 복비 계산기</p>
          <SiteFooter />
        </footer>
      </main>
    </div>
  );
}
