import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "../site-footer";

export const metadata: Metadata = {
  title: "자주 묻는 질문 · 뉴스클리핑",
  description: "기사 요약 이미지 생성기에 대해 자주 묻는 질문을 모았습니다.",
};

const QA = [
  {
    q: "링크를 넣었는데 기사를 못 불러와요.",
    a: "일부 언론사는 외부 접근을 막아 두거나 로그인·유료 구독이 필요합니다. 이때는 ‘본문 붙여넣기’ 탭에서 기사 본문을 직접 복사해 붙여넣으면 동일하게 요약할 수 있어요.",
  },
  {
    q: "언론사 로고는 어떻게 넣나요?",
    a: "링크로 만들 때 사이트에서 로고(아이콘)를 자동으로 찾아 넣습니다. 화질이 아쉽거나 다른 로고를 쓰고 싶으면 ‘로고 업로드/변경’으로 직접 이미지를 넣으세요. ‘로고 기억하기’를 켜두면 같은 언론사는 다음부터 자동 적용됩니다. (로고는 브라우저에만 저장돼요.)",
  },
  {
    q: "요약 내용이나 제목을 바꿀 수 있나요?",
    a: "네. 제목·부제·본문·언론사·날짜 모두 화면에서 바로 수정할 수 있고, 수정하면 미리보기 이미지에 즉시 반영됩니다.",
  },
  {
    q: "요약 내용이 정확한가요?",
    a: "AI 요약은 참고용입니다. 수치·고유명사·날짜 등은 보고서에 넣기 전에 원문과 대조해 확인해 주세요.",
  },
  {
    q: "만든 이미지는 어디에 저장되나요?",
    a: "이미지는 여러분의 기기로 바로 내려받아집니다. 서버에 기사 내용이나 이미지를 따로 보관하지 않습니다.",
  },
];

export default function Faq() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-zinc-900">
      <main className="mx-auto w-full max-w-[640px] px-5 py-10 sm:px-6">
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
          {QA.map((item, i) => (
            <details
              key={i}
              className="group rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm"
            >
              <summary className="cursor-pointer list-none font-bold text-zinc-900">
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
