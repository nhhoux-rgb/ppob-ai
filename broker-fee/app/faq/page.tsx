import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "../site-footer";
import JsonLd from "../json-ld";

export const metadata: Metadata = {
  title: "자주 묻는 질문 · 복비 계산기",
  description:
    "복비 계산기 이용과 부동산 중개수수료에 대해 자주 묻는 질문을 모았습니다. 무료 여부, 계산 기준, 부가세, 상한요율 신뢰도 등을 안내합니다.",
  alternates: { canonical: "/faq" },
};

const FAQ = [
  {
    q: "복비 계산기는 무료인가요?",
    a: "네, 매매·전세·월세 중개보수를 계산하는 모든 기능을 무료로 이용할 수 있습니다. 회원가입도 필요 없습니다.",
  },
  {
    q: "계산 결과는 정확한가요?",
    a: "「공인중개사법 시행규칙」과 시·도 조례가 정한 상한요율표를 그대로 반영해 계산합니다. 다만 결과는 법정 '상한' 기준이며, 실제 지급액은 그 안에서 중개사와 협의로 정해지므로 참고용으로 활용하세요.",
  },
  {
    q: "상한요율은 정가인가요?",
    a: "아닙니다. 요율표의 값은 받을 수 있는 최대치입니다. 실제 중개보수는 상한 범위 안에서 자유롭게 협의할 수 있으므로, 계약 전에 정중히 조율해 볼 수 있습니다.",
  },
  {
    q: "월세는 어떻게 계산되나요?",
    a: "월세는 '보증금 + 월세×100'으로 거래금액을 환산해 요율을 적용합니다. 이렇게 계산한 금액이 5천만원 미만이면 '보증금 + 월세×70'으로 다시 계산합니다. 계산기에서 보증금과 월세를 각각 입력하면 자동으로 처리됩니다.",
  },
  {
    q: "부가가치세는 포함된 금액인가요?",
    a: "기본 결과는 부가세 별도 금액입니다. 중개사무소가 일반과세자면 10%, 간이과세자면 약 4%가 추가되며, 계산기 상단의 부가세 유형을 선택하면 포함 금액도 확인할 수 있습니다.",
  },
  {
    q: "오피스텔도 계산되나요?",
    a: "네. '오피스텔'을 선택하면 주거용 오피스텔 전용 요율(매매 0.5%, 임대차 0.4%)로 계산합니다. 다만 면적·설비 요건을 벗어나면 0.9% 이내 협의 요율이 적용될 수 있습니다.",
  },
  {
    q: "상가·사무실 복비도 계산되나요?",
    a: "네. '상가·사무실'을 선택하면 주택 외 부동산 요율로 계산합니다. 상가·사무실 등은 매매·임대차 구분 없이 거래금액의 0.9% 이내에서 협의로 정하며 구간·한도액이 없습니다. 부가세는 대개 별도이고, 권리금은 중개보수 산정에서 제외됩니다.",
  },
];

// FAQPage 구조화 데이터 — 구글 검색결과에 FAQ가 펼쳐질 수 있게 한다.
const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900 antialiased">
      <JsonLd data={FAQ_JSON_LD} />
      <main className="mx-auto w-full max-w-[640px] px-5 py-10 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 transition hover:text-emerald-700"
        >
          <span aria-hidden>←</span> 홈으로
        </Link>

        <h1 className="mt-6 text-2xl font-bold tracking-tight sm:text-3xl">
          자주 묻는 질문
        </h1>

        <div className="mt-8 space-y-6">
          {FAQ.map((item) => (
            <section
              key={item.q}
              className="border-b border-zinc-100 pb-6 last:border-0"
            >
              <h2 className="text-base font-bold text-zinc-900">Q. {item.q}</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-zinc-600">
                {item.a}
              </p>
            </section>
          ))}
        </div>

        <footer className="mt-12 border-t border-zinc-100 pt-6 pb-10 text-center text-xs text-zinc-400">
          <p>© 2026 복비 계산기</p>
          <SiteFooter />
        </footer>
      </main>
    </div>
  );
}
