import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "../../site-footer";
import { SALE_HOUSE_TABLE, RENT_HOUSE_TABLE, type RateRow } from "../../fee";

export const metadata: Metadata = {
  title: "2026 부동산 중개보수 요율표 총정리 · 복비 계산기",
  description:
    "매매·전세·월세 부동산 중개수수료(복비) 상한요율표를 한눈에. 거래금액 구간별 요율과 한도액, 오피스텔 요율, 월세 환산법까지 정리했습니다.",
};

function Table({ title, rows }: { title: string; rows: RateRow[] }) {
  return (
    <div className="mt-5">
      <h3 className="mb-2 text-base font-bold text-zinc-900">{title}</h3>
      <div className="overflow-hidden rounded-xl border border-zinc-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-zinc-50 text-zinc-500">
              <th className="px-3 py-2.5 text-left font-semibold">거래금액</th>
              <th className="px-3 py-2.5 text-right font-semibold">상한요율</th>
              <th className="px-3 py-2.5 text-right font-semibold">한도액</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {rows.map((r) => (
              <tr key={r.range}>
                <td className="px-3 py-2.5 text-zinc-700">{r.range}</td>
                <td className="px-3 py-2.5 text-right font-semibold tabular-nums text-zinc-800">
                  {r.rate}
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums text-zinc-500">
                  {r.cap}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function RatesGuidePage() {
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
            2026 부동산 중개보수 요율표 총정리
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-500">
            2021년 10월 개정 이후 현재까지 적용되는 주택 중개보수 상한요율입니다.
            거래금액이 어느 구간에 드는지 확인하고, 옆의 요율과 한도액을 대입하면
            상한 복비를 알 수 있습니다.
          </p>

          <Table title="매매·교환" rows={SALE_HOUSE_TABLE} />
          <Table title="임대차 (전세·월세)" rows={RENT_HOUSE_TABLE} />

          <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-zinc-700">
            <section>
              <h2 className="mb-2 text-lg font-bold text-zinc-900">
                오피스텔 요율
              </h2>
              <p>
                주거용 요건(전용면적 85㎡ 이하, 전용 입식부엌·욕실 등)을 갖춘
                오피스텔은 <strong>매매·교환 0.5%, 임대차 0.4%</strong>가
                적용되며 한도액은 없습니다. 요건을 벗어나는 오피스텔이나 상가 등
                그 밖의 부동산은 <strong>0.9% 이내</strong>에서 협의로 정합니다.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-bold text-zinc-900">
                월세 거래금액은 이렇게 환산합니다
              </h2>
              <p>
                월세는 보증금만으로 요율을 매기지 않고, 다음처럼 하나의
                거래금액으로 환산합니다.
              </p>
              <div className="mt-2 rounded-xl bg-emerald-50 px-4 py-3 text-[15px] font-semibold text-emerald-800">
                거래금액 = 보증금 + (월세 × 100)
                <br />
                <span className="text-sm font-normal text-emerald-700">
                  단, 위 금액이 5천만원 미만이면 → 보증금 + (월세 × 70)
                </span>
              </div>
              <p className="mt-2 text-sm text-zinc-500">
                예) 보증금 1,000만원 / 월세 50만원 → 1,000만 + 5,000만 =
                6,000만원이 거래금액이 됩니다.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-bold text-zinc-900">
                부가가치세는 별도입니다
              </h2>
              <p>
                위 요율로 계산한 금액은 부가세 제외 기준입니다. 중개사무소가
                일반과세자면 <strong>10%</strong>, 간이과세자면 실질{" "}
                <strong>약 4%</strong>가 더해질 수 있으니 계약 전 확인하세요.
              </p>
            </section>
          </div>

          <section className="mt-8 rounded-2xl bg-emerald-50 px-5 py-4 text-[15px] leading-relaxed text-emerald-900">
            <p>
              표를 직접 대입하기 번거롭다면{" "}
              <Link
                href="/"
                className="font-semibold text-emerald-700 underline underline-offset-2"
              >
                복비 계산기
              </Link>
              에 금액만 넣어 보세요. 구간·한도액·부가세까지 자동으로 계산됩니다.
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
