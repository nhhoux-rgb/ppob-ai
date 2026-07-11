import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "../site-footer";
import JsonLd from "../json-ld";

export const metadata: Metadata = {
  title: "자주 묻는 질문 · 러닝화 계급도",
  description:
    "러닝화 계급도와 등급 기준, 카본화·안정화 선택, 가격·구매 링크에 관해 자주 묻는 질문을 모았습니다.",
  alternates: { canonical: "/faq" },
};

const FAQ = [
  {
    q: "러닝화 계급도는 무엇을 기준으로 하나요?",
    a: "커뮤니티에서 공유되는 러닝화 계급도(등급표)와 공개된 리뷰·스펙 정보를 참고해 브랜드별 러닝화를 용도별 등급으로 정리한 것입니다. 절대적인 순위라기보다 '어떤 용도의 신발인지'를 분류한 것에 가깝습니다.",
  },
  {
    q: "입문자인데 어떤 등급을 골라야 하나요?",
    a: "처음이라면 데일리 그룹의 '입문화'나 '맥스 쿠션화'를 추천합니다. 쿠션이 넉넉해 부담 없이 뛰기 좋고, 부상 위험도 낮습니다. 카본 레이싱화는 어느 정도 러닝에 익숙해진 뒤가 좋아요.",
  },
  {
    q: "안정화는 꼭 필요한가요?",
    a: "발이 안쪽으로 무너지는 과내전(오버프로네이션)이 심하거나 무릎·발목 통증이 잦다면 안정화가 도움이 될 수 있습니다. 중립적인 발이라면 일반 쿠션화로도 충분합니다.",
  },
  {
    q: "카본화는 훈련용으로도 신어도 되나요?",
    a: "레이싱용 카본화는 반발이 강하지만 내구성이 짧고 발에 부담이 될 수 있어 대회·포인트 훈련 위주로 쓰는 편이 좋습니다. 평소 훈련에는 '슈퍼 트레이너(논/라이트/카본 플레이트)' 등급이 더 적합합니다.",
  },
  {
    q: "표시된 가격이 실제 판매가와 다른데요?",
    a: "가격은 참고용 대략 범위입니다. 정가·할인·품절 여부는 시기와 판매처마다 달라, 신발 상세의 '쿠팡에서 최저가 확인' 버튼으로 실제 가격을 확인하도록 안내하고 있습니다.",
  },
  {
    q: "구매 링크는 어떻게 운영되나요?",
    a: "구매 링크 중 일부는 쿠팡 파트너스 활동의 일환으로, 이용자가 링크를 통해 구매하면 운영자가 일정액의 수수료를 받을 수 있습니다. 구매 가격에는 영향을 주지 않습니다.",
  },
];

export default function FaqPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900 antialiased">
      <JsonLd data={faqJsonLd} />
      <main className="mx-auto w-full max-w-[640px] px-5 py-10 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
        >
          <span aria-hidden>←</span> 홈으로
        </Link>

        <h1 className="mt-6 text-2xl font-bold tracking-tight sm:text-3xl">
          자주 묻는 질문
        </h1>

        <dl className="mt-8 space-y-6">
          {FAQ.map((f) => (
            <div key={f.q} className="border-b border-zinc-100 pb-6">
              <dt className="text-base font-bold text-zinc-900">Q. {f.q}</dt>
              <dd className="mt-2 text-[15px] leading-relaxed text-zinc-600">
                {f.a}
              </dd>
            </div>
          ))}
        </dl>

        <footer className="mt-12 border-t border-zinc-100 pt-6 pb-10 text-center text-xs text-zinc-400">
          <p>© 2026 러닝화 계급도</p>
          <SiteFooter />
        </footer>
      </main>
    </div>
  );
}
