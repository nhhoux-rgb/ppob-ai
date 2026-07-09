import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "../site-footer";

export const metadata: Metadata = {
  title: "이용 방법 · 등기조회",
  description:
    "접수증 사진을 올리거나 등기번호를 붙여넣어 우체국 배송상태를 한 번에 조회하고 CSV로 저장하는 방법을 안내합니다.",
};

const STEPS = [
  {
    n: 1,
    title: "등기번호 넣기 (사진 · 붙여넣기 · 파일)",
    desc: "접수증(영수증) 사진을 올리면 등기번호를 자동으로 읽어옵니다. 또는 등기번호를 한 줄에 하나씩 붙여넣거나, CSV·TXT 파일을 불러와도 됩니다.",
  },
  {
    n: 2,
    title: "인식된 번호 확인",
    desc: "사진에서 읽어온 등기번호가 입력창에 채워집니다. 잘못 읽힌 게 있으면 직접 수정한 뒤 진행하세요.",
  },
  {
    n: 3,
    title: "배송상태 조회하기",
    desc: "‘배송상태 조회하기’를 누르면 우정사업본부 공식 오픈API로 등기번호별 배달완료·반송·배송중 상태를 한 번에 조회합니다. 건수가 많아도 진행률을 보며 처리됩니다.",
  },
  {
    n: 4,
    title: "표 확인 · CSV로 저장",
    desc: "상태별로 필터링해 반송·미배달만 골라 볼 수 있습니다. ‘CSV 저장’을 누르면 엑셀에서 바로 여는 발송대장 파일로 내려받아집니다.",
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
          접수증 사진 한 장으로 대량 등기 배송상태를 확인하는 4단계입니다.
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
