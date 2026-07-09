import Link from "next/link";
import type { ReactNode } from "react";
import SiteFooter from "../site-footer";

// 가이드 문서 공용 껍데기. 제목/도입부/본문을 받아 일관된 레이아웃으로 감싼다.
export default function Article({
  title,
  lead,
  children,
}: {
  title: string;
  lead: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-zinc-900">
      <main className="mx-auto w-full max-w-[640px] px-5 py-10 sm:px-6">
        <Link
          href="/guide"
          className="text-sm font-semibold text-sky-600 hover:text-sky-700"
        >
          ← 가이드 목록
        </Link>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-500">{lead}</p>

        <article className="mt-6 space-y-6 text-[15px] leading-relaxed text-zinc-700 [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-zinc-900 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:pl-5">
          {children}
        </article>

        <div className="mt-8 rounded-2xl border border-sky-100 bg-sky-50 p-4 text-center">
          <p className="text-sm font-semibold text-sky-900">
            등기번호가 여러 건이라면?
          </p>
          <p className="mt-1 text-sm text-sky-700">
            접수증 사진을 올리거나 번호를 붙여넣어 한 번에 조회하세요.
          </p>
          <Link
            href="/"
            className="mt-3 inline-flex items-center justify-center rounded-xl bg-sky-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-sky-500"
          >
            대량 배송조회 하러 가기 →
          </Link>
        </div>

        <footer className="mt-10 text-center text-xs text-zinc-400">
          <SiteFooter />
        </footer>
      </main>
    </div>
  );
}
