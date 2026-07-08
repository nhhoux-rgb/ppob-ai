import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "개인정보처리방침 · 뉴스클리핑",
  description:
    "뉴스클리핑 서비스의 개인정보 수집·이용 및 쿠키·광고에 관한 안내입니다.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900 antialiased">
      <main className="mx-auto w-full max-w-[640px] px-5 py-10 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-sky-600 transition hover:text-sky-700"
        >
          <span aria-hidden>←</span> 홈으로
        </Link>

        <h1 className="mt-6 text-2xl font-bold tracking-tight">
          개인정보처리방침
        </h1>
        <p className="mt-2 text-sm text-zinc-500">시행일: 2026년 7월 1일</p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-zinc-700">
          <section>
            <p>
              뉴스클리핑(이하 &ldquo;서비스&rdquo;)은 이용자의 개인정보를
              중요하게 생각하며, 관련 법령을 준수합니다. 본 방침은 서비스가 어떤
              정보를 수집하고 어떻게 이용·보호하는지 설명합니다.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-zinc-900">
              1. 수집하는 정보와 이용 목적
            </h2>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                <strong>기사 링크 및 본문</strong> — 이용자가 요약을 위해 입력한
                기사 주소와 붙여넣은 본문입니다. 오직 요약 이미지를 생성하기 위한
                목적으로만 사용됩니다.
              </li>
              <li>
                <strong>업로드 로고 이미지</strong> — 이용자가 직접 올린 언론사
                로고입니다. 이미지 생성에만 사용되며, 브라우저(localStorage)에만
                저장되어 서버로 전송·보관되지 않습니다.
              </li>
              <li>
                <strong>자동 수집 정보</strong> — 서비스 이용 과정에서 접속 기록,
                기기·브라우저 정보, 쿠키 등이 자동으로 수집될 수 있으며, 서비스
                운영 및 광고 제공에 사용됩니다.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-zinc-900">
              2. 기사 내용의 처리와 보관
            </h2>
            <p>
              입력한 기사 링크의 본문과 붙여넣은 텍스트는 요약을 위해 AI 처리
              업체인 <strong>OpenAI</strong>의 API로 전송됩니다. 서비스는 요약
              결과를 생성한 뒤 해당 내용을 자체 서버나 별도 데이터베이스에
              저장하지 않습니다. 생성된 요약 이미지는 이용자의 기기로 바로
              내려받아집니다.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-zinc-900">
              3. 쿠키 및 광고
            </h2>
            <p>
              서비스는 이용 통계와 광고 제공을 위해 쿠키를 사용할 수 있습니다.
              Google AdSense 등 제3자 광고 사업자가 쿠키를 사용해 이용자의 관심에
              맞는 광고를 표시할 수 있으며, 이용자는 브라우저 설정에서 쿠키를
              거부할 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-zinc-900">
              4. 저작권 안내
            </h2>
            <p>
              기사 원문 및 언론사 로고의 저작권은 각 언론사에 있습니다. 본
              서비스로 생성한 요약 이미지는 이용자의 책임 하에 활용하시기
              바라며, 상업적 재배포 등은 해당 언론사의 이용 정책을 따라야 합니다.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-zinc-900">5. 문의</h2>
            <p>
              개인정보 관련 문의는{" "}
              <a
                href="mailto:pickupai2026@gmail.com"
                className="font-semibold text-sky-600 hover:underline"
              >
                pickupai2026@gmail.com
              </a>{" "}
              으로 연락해 주세요.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
