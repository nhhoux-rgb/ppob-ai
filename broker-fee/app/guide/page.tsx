import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "../site-footer";

export const metadata: Metadata = {
  title: "부동산 복비(중개수수료) 완전 가이드 · 복비 계산기",
  description:
    "복비(부동산 중개보수)란 무엇이고 어떻게 계산되는지, 상한요율표·부가세·누가 내는지까지. 매매·전세·월세 중개수수료의 기본을 쉽게 정리했습니다.",
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
            부동산 복비 완전 가이드
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-500">
            부동산 거래를 하면 반드시 따라오는 것이 중개보수, 흔히 말하는
            &lsquo;복비&rsquo;입니다. 금액이 작지 않은데 계산법이 헷갈려 손해
            보는 경우가 많죠. 복비가 어떻게 정해지는지, 얼마가 상한인지, 누가
            언제 내는지 핵심만 정리했습니다.
          </p>

          <div className="mt-8 space-y-9 text-[15px] leading-relaxed text-zinc-700">
            <section>
              <h2 className="mb-3 text-lg font-bold text-zinc-900">
                복비(중개보수)란?
              </h2>
              <p>
                복비는 공인중개사가 부동산 거래를 중개해 주고 받는 법정
                수수료입니다. 정식 명칭은 <strong>중개보수</strong>이며, 예전에
                쓰던 &lsquo;복비&rsquo;·&lsquo;중개수수료&rsquo;와 같은 말입니다.
                금액은 마음대로 정하는 것이 아니라{" "}
                <strong>「공인중개사법」과 시·도 조례가 정한 상한요율</strong>{" "}
                안에서만 받을 수 있습니다.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-bold text-zinc-900">
                복비는 이렇게 계산됩니다
              </h2>
              <p className="mb-2">
                기본 공식은 아주 단순합니다.
              </p>
              <div className="rounded-xl bg-emerald-50 px-4 py-3 text-center text-[15px] font-bold text-emerald-800">
                중개보수 = 거래금액 × 상한요율 <span className="text-emerald-500">(한도액 있으면 상한 적용)</span>
              </div>
              <ul className="mt-3 list-disc space-y-1.5 pl-5">
                <li>
                  <strong>거래금액</strong> — 매매는 매매가, 전세는 보증금.
                  월세는 <em>보증금 + 월세×100</em>으로 환산합니다(5천만원 미만이면
                  월세×70).
                </li>
                <li>
                  <strong>상한요율</strong> — 거래금액 구간과 거래 유형(매매/임대차)에
                  따라 0.3%~0.7%로 달라집니다.
                </li>
                <li>
                  <strong>한도액</strong> — 낮은 금액 구간에는 상한 금액이 정해져
                  있어, 요율로 계산한 값이 이를 넘으면 한도액까지만 냅니다.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-bold text-zinc-900">
                여기서 자주 실수합니다
              </h2>
              <ul className="space-y-3">
                <li>
                  <strong>상한 = 정가가 아닙니다</strong> — 요율표 값은 최대치일
                  뿐, 실제 보수는 그 안에서 협의로 정합니다. 미리 정중히 조율할
                  수 있습니다.
                </li>
                <li>
                  <strong>부가세는 별도일 수 있습니다</strong> — 중개사무소가
                  일반과세자면 10%, 간이과세자면 약 4%가 더 붙습니다.
                </li>
                <li>
                  <strong>9억 이상 구간은 요율이 다시 올라갑니다</strong> —
                  매매가가 높아질수록 구간별로 0.5%→0.6%→0.7%로 상승합니다.
                </li>
              </ul>
            </section>
          </div>
        </article>

        <section className="mt-10 border-t border-zinc-100 pt-6">
          <h2 className="mb-3 text-base font-bold text-zinc-900">더 읽어보기</h2>
          <ul className="space-y-2">
            <li>
              <Link
                href="/guide/rates"
                className="text-sm font-semibold text-emerald-600 underline underline-offset-2"
              >
                2026 부동산 중개보수 요율표 총정리 (매매·전세·월세)
              </Link>
            </li>
            <li>
              <Link
                href="/guide/who-pays"
                className="text-sm font-semibold text-emerald-600 underline underline-offset-2"
              >
                복비는 누가, 언제 내나요? — 지급 시점과 분담
              </Link>
            </li>
            <li>
              <Link
                href="/guide/officetel"
                className="text-sm font-semibold text-emerald-600 underline underline-offset-2"
              >
                오피스텔 복비는 왜 다를까 — 주거용 요건과 요율
              </Link>
            </li>
          </ul>
        </section>

        <section className="mt-8 rounded-2xl bg-emerald-50 px-5 py-4 text-[15px] leading-relaxed text-emerald-900">
          <p>
            내 거래의 복비가 궁금하다면{" "}
            <Link
              href="/"
              className="font-semibold text-emerald-700 underline underline-offset-2"
            >
              복비 계산기
            </Link>
            에 금액만 넣어 보세요. 상한요율·한도액·부가세까지 한 번에 계산됩니다.
          </p>
        </section>

        <footer className="mt-12 border-t border-zinc-100 pt-6 pb-10 text-center text-xs text-zinc-400">
          <p>© 2026 복비 계산기</p>
          <SiteFooter />
        </footer>
      </main>
    </div>
  );
}
