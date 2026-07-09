import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "../site-footer";

export const metadata: Metadata = {
  title: "소개 및 문의 · 등기조회",
  description:
    "등기조회 서비스 소개와 문의 안내입니다. 등기번호 대량 일괄 배송조회와 접수증 인식 기능을 제공합니다.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-zinc-900">
      <main className="mx-auto w-full max-w-[640px] px-5 py-10 sm:px-6">
        <Link
          href="/"
          className="text-sm font-semibold text-sky-600 hover:text-sky-700"
        >
          ← 홈으로
        </Link>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">소개 및 문의</h1>

        <div className="mt-6 space-y-6 text-[15px] leading-relaxed text-zinc-700">
          <section>
            <h2 className="mb-2 text-base font-bold text-zinc-900">
              어떤 서비스인가요
            </h2>
            <p>
              등기조회는 <strong>등기번호를 대량으로 한 번에 조회</strong>하는
              도구입니다. 우편물을 많이 발송하는 실무에서, 등기번호를 한 건씩 입력하는
              번거로움을 줄이기 위해 만들었습니다. 접수증 사진을 올리면 등기번호를 자동
              으로 읽고, 배달완료·반송·배송중 상태를 표로 정리해 CSV로 내려받을 수
              있습니다.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-zinc-900">주요 기능</h2>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>등기번호 붙여넣기 · CSV 업로드 · 접수증 사진 인식</li>
              <li>여러 건을 한 번에 조회하고 상태별로 필터링</li>
              <li>결과를 CSV(발송대장)로 저장</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-zinc-900">데이터 출처</h2>
            <p>
              배송상태는 우정사업본부(우체국)의 공식 오픈API를 통해 조회합니다. 우체국
              홈페이지에서 확인하는 것과 동일한 정보입니다.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-zinc-900">문의</h2>
            <p>
              서비스 관련 문의나 제안은{" "}
              <a
                href="mailto:pickupai2026@gmail.com"
                className="font-semibold text-sky-600 hover:underline"
              >
                pickupai2026@gmail.com
              </a>{" "}
              으로 보내 주세요.
            </p>
          </section>
        </div>

        <footer className="mt-10 text-center text-xs text-zinc-400">
          <SiteFooter />
        </footer>
      </main>
    </div>
  );
}
