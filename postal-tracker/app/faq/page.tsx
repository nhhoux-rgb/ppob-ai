import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "../site-footer";

export const metadata: Metadata = {
  alternates: { canonical: "/faq" },
  title: "자주 묻는 질문 · 등기조회",
  description:
    "등기번호 대량 일괄조회, 접수증 OCR 인식, 배송상태·반송 확인, CSV 저장에 관해 자주 묻는 질문을 모았습니다.",
};

const QA = [
  {
    q: "한 번에 몇 건까지 조회할 수 있나요?",
    a: "등기번호를 붙여넣는 수에 제한은 두지 않았고, 서버로는 30건씩 나눠 조회하며 진행률을 보여줍니다. 다만 공식 오픈API에는 하루 트래픽 한도가 있어, 대량으로 계속 조회하면 한도에 걸릴 수 있습니다.",
  },
  {
    q: "접수증 사진에서 등기번호를 어떻게 읽나요?",
    a: "업로드한 접수증 이미지를 AI가 분석해 13자리 등기번호만 골라냅니다. 금액·우편번호·전화번호 같은 다른 숫자는 제외합니다. 사진이 흐리면 일부를 놓칠 수 있으니, 인식된 번호를 한 번 확인한 뒤 조회하세요.",
  },
  {
    q: "배송상태는 어디서 가져오나요?",
    a: "우정사업본부(우체국)의 공식 오픈API인 ‘국내우편물 종적 조회 서비스’를 사용합니다. 우체국 홈페이지에서 조회하는 것과 동일한 정보입니다.",
  },
  {
    q: "반송된 등기만 골라 볼 수 있나요?",
    a: "네. 조회 결과 위의 필터에서 ‘반송’을 누르면 반송 건만 모아 볼 수 있습니다. ‘배달완료’, ‘배송중’, ‘조회안됨’도 같은 방식으로 필터링됩니다.",
  },
  {
    q: "결과를 엑셀로 저장할 수 있나요?",
    a: "‘CSV 저장’을 누르면 한글이 깨지지 않는 CSV 파일로 내려받아집니다. 엑셀에서 바로 열어 발송대장으로 관리하세요.",
  },
  {
    q: "입력한 등기번호나 수취인 정보가 저장되나요?",
    a: "조회를 위해 등기번호가 우체국 API로 전송되고, 접수증 이미지는 등기번호 인식을 위해 AI로 전송됩니다. 서비스는 조회 결과를 자체 데이터베이스에 보관하지 않으며, 결과는 이용자 브라우저에서 표로 표시되고 CSV로 내려받아집니다.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: QA.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export default function Faq() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-zinc-900">
      <main className="mx-auto w-full max-w-[640px] px-5 py-10 sm:px-6">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
        <Link
          href="/"
          className="text-sm font-semibold text-sky-600 hover:text-sky-700"
        >
          ← 홈으로
        </Link>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">
          자주 묻는 질문
        </h1>

        <div className="mt-6 space-y-3">
          {QA.map((item) => (
            <details
              key={item.q}
              className="group rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm"
            >
              <summary className="cursor-pointer list-none font-bold text-zinc-900 marker:hidden">
                <span className="text-sky-600">Q. </span>
                {item.q}
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                {item.a}
              </p>
            </details>
          ))}
        </div>

        <footer className="mt-10 text-center text-xs text-zinc-400">
          <SiteFooter />
        </footer>
      </main>
    </div>
  );
}
