import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "../site-footer";

export const metadata: Metadata = {
  title: "등기우편 가이드 · 등기조회",
  description:
    "등기번호 조회 방법, 반송 사유와 대처, 대량 발송 준비물, 등기·준등기·일반우편 차이, 등기번호 구조까지 — 등기우편 실무에 필요한 내용을 정리했습니다.",
};

const ARTICLES = [
  {
    href: "/guide/how-to-track",
    title: "등기번호로 배송조회 하는 법 (대량 조회 포함)",
    desc: "등기번호 하나부터 수백 건까지, 우체국 배송상태를 확인하는 방법을 정리했습니다.",
  },
  {
    href: "/guide/returned",
    title: "등기우편 반송, 왜 되고 어떻게 대처하나",
    desc: "폐문부재·수취인불명·수취거부 등 반송 사유와 재발송·주소보정 대처법.",
  },
  {
    href: "/guide/bulk-send",
    title: "대량 등기 발송 방법과 준비물",
    desc: "창구 접수부터 요금후납·계약등기까지, 대량 발송을 효율적으로 하는 법.",
  },
  {
    href: "/guide/mail-types",
    title: "등기 · 준등기 · 일반우편 차이와 선택 기준",
    desc: "추적·수령방식·비용이 어떻게 다른지, 상황별로 무엇을 골라야 하는지.",
  },
  {
    href: "/guide/tracking-number",
    title: "등기번호(13자리) 구조와 읽는 법",
    desc: "등기번호가 어떻게 구성되는지와 접수증에서 번호를 빠르게 찾는 요령.",
  },
];

export default function GuideIndex() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-zinc-900">
      <main className="mx-auto w-full max-w-[640px] px-5 py-10 sm:px-6">
        <Link
          href="/"
          className="text-sm font-semibold text-sky-600 hover:text-sky-700"
        >
          ← 홈으로
        </Link>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">등기우편 가이드</h1>
        <p className="mt-2 text-sm text-zinc-500">
          등기 조회·발송·반송 실무에 필요한 내용을 정리했습니다.
        </p>

        <div className="mt-6 space-y-3">
          {ARTICLES.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="block rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm transition hover:border-sky-200"
            >
              <p className="font-bold text-zinc-900">{a.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-zinc-600">
                {a.desc}
              </p>
            </Link>
          ))}
        </div>

        <footer className="mt-10 text-center text-xs text-zinc-400">
          <SiteFooter />
        </footer>
      </main>
    </div>
  );
}
