import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "../../site-footer";

export const metadata: Metadata = {
  title: "복비는 누가, 언제 내나요? · 복비 계산기",
  description:
    "부동산 중개보수는 매수인·매도인, 임대인·임차인 중 누가 내는지, 언제 지급하는지, 계약이 깨지면 어떻게 되는지 정리했습니다.",
  alternates: { canonical: "/guide/who-pays" },
};

const QA = [
  {
    q: "복비는 누가 내나요?",
    a: "중개보수는 거래 당사자 양쪽이 각자 부담합니다. 즉 매매라면 매도인과 매수인이 각각 자기 몫을, 임대차라면 임대인과 임차인이 각각 냅니다. 한 사람이 양쪽 복비를 다 내는 것이 아닙니다.",
  },
  {
    q: "언제 지급하나요?",
    a: "특별한 약정이 없다면 거래가 완결되는 시점, 보통 잔금을 치르고 등기 이전이나 입주가 이뤄지는 날에 지급합니다. 계약금만 오간 단계에서는 아직 지급 의무가 확정되지 않습니다.",
  },
  {
    q: "양쪽 중개사가 다를 때는요?",
    a: "매도인 측과 매수인 측이 서로 다른 중개사무소를 통했다면(공동중개), 각 당사자는 자신을 중개한 사무소에 각자의 복비를 지급합니다.",
  },
  {
    q: "계약이 깨지면 복비를 내야 하나요?",
    a: "중개사의 잘못 없이 당사자 사정으로 계약이 해제된 경우, 이미 중개가 완성되었다면 보수를 지급해야 할 수 있습니다. 반대로 중개사의 고의·과실로 거래가 무효·취소되면 보수를 청구할 수 없습니다. 상황에 따라 다르므로 분쟁 시에는 한국공인중개사협회나 관할 시·군·구에 문의하는 것이 좋습니다.",
  },
  {
    q: "부가세도 내가 부담하나요?",
    a: "중개보수에 대한 부가가치세는 원칙적으로 서비스를 받은 당사자가 부담합니다. 중개사무소가 일반과세자면 10%, 간이과세자면 약 4%가 붙으며, 현금영수증·세금계산서를 요청할 수 있습니다.",
  },
];

export default function WhoPaysGuidePage() {
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
            복비는 누가, 언제 내나요?
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-500">
            중개보수는 금액만큼이나 &lsquo;누가 언제 내는가&rsquo;에서 오해가
            많습니다. 자주 묻는 것들을 정리했습니다.
          </p>

          <div className="mt-8 space-y-7">
            {QA.map((item) => (
              <section key={item.q}>
                <h2 className="mb-2 text-base font-bold text-zinc-900">
                  {item.q}
                </h2>
                <p className="text-[15px] leading-relaxed text-zinc-700">
                  {item.a}
                </p>
              </section>
            ))}
          </div>

          <section className="mt-8 rounded-2xl bg-emerald-50 px-5 py-4 text-[15px] leading-relaxed text-emerald-900">
            <p>
              내야 할 복비가 얼마인지부터 확인하고 싶다면{" "}
              <Link
                href="/"
                className="font-semibold text-emerald-700 underline underline-offset-2"
              >
                복비 계산기
              </Link>
              를 이용해 보세요.
            </p>
          </section>

          <p className="mt-6 text-xs leading-relaxed text-zinc-400">
            본 내용은 일반적인 안내이며 법률 자문이 아닙니다. 구체적인 분쟁은
            관할 기관이나 전문가와 상담하시기 바랍니다.
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
