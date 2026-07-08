import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "../site-footer";

export const metadata: Metadata = {
  title: "이용 방법 · 뉴스클리핑",
  description:
    "기사 링크를 붙여넣고 요약 이미지를 만들어 보고서에 붙여넣는 방법을 안내합니다.",
};

const STEPS = [
  {
    n: 1,
    title: "기사 링크를 붙여넣기",
    desc: "요약하고 싶은 기사의 주소(URL)를 입력창에 붙여넣습니다. 페이지가 막혀 링크를 못 읽는 경우 ‘본문 붙여넣기’ 탭에 기사 본문을 직접 붙여넣으면 됩니다.",
  },
  {
    n: 2,
    title: "요약 이미지 만들기",
    desc: "‘요약 이미지 만들기’를 누르면 AI가 언론사·날짜·제목·부제·요약 본문을 추려 카드로 정리합니다.",
  },
  {
    n: 3,
    title: "내용·로고 다듬기",
    desc: "제목·부제·본문은 바로 수정할 수 있습니다. 언론사 로고는 자동으로 찾아 넣고, 원하면 직접 업로드해 교체할 수 있어요. ‘로고 기억하기’를 켜두면 같은 언론사는 다음부터 자동으로 로고가 붙습니다.",
  },
  {
    n: 4,
    title: "PNG로 저장해 보고서에 붙여넣기",
    desc: "‘요약 이미지 저장(PNG)’을 누르면 고해상도 이미지로 내려받아집니다. 보고서 문서에 그대로 붙여넣으세요.",
  },
];

export default function HowToUse() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-zinc-900">
      <main className="mx-auto w-full max-w-[640px] px-5 py-10 sm:px-6">
        <Link
          href="/"
          className="text-sm font-semibold text-sky-600 hover:text-sky-700"
        >
          ← 홈으로
        </Link>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">이용 방법</h1>
        <p className="mt-2 text-sm text-zinc-500">
          기사 링크 하나로 보고서용 요약 이미지를 만드는 4단계입니다.
        </p>

        <ol className="mt-6 space-y-4">
          {STEPS.map((s) => (
            <li
              key={s.n}
              className="flex gap-4 rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-600 text-sm font-bold text-white">
                {s.n}
              </span>
              <div>
                <p className="font-bold text-zinc-900">{s.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-zinc-600">
                  {s.desc}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <footer className="mt-10 text-center text-xs text-zinc-400">
          <SiteFooter />
        </footer>
      </main>
    </div>
  );
}
