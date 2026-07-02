import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "개인정보처리방침 · 복비 계산기",
  description:
    "복비 계산기 서비스의 개인정보 수집·이용 및 쿠키·광고에 관한 안내입니다.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900 antialiased">
      <main className="mx-auto w-full max-w-[640px] px-5 py-10 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 transition hover:text-emerald-700"
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
              복비 계산기(이하 &ldquo;서비스&rdquo;)는 이용자의 개인정보를
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
                <strong>계산 입력값</strong> — 이용자가 입력한 거래금액·보증금·월세
                등은 브라우저 안에서만 계산에 사용되며, 서버로 전송하거나 저장하지
                않습니다.
              </li>
              <li>
                <strong>자동 수집 정보</strong> — 서비스 이용 과정에서 접속 기록,
                기기·브라우저 정보, 쿠키 등이 자동으로 수집될 수 있으며, 서비스
                운영·통계 및 광고 제공에 사용됩니다.
              </li>
              <li>
                <strong>방문자 수 집계</strong> — 일자별 방문자 수를 익명으로
                집계하기 위해, 개인을 식별하지 않는 접속 이벤트만 처리합니다.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-zinc-900">
              2. 쿠키 및 광고 (Google AdSense)
            </h2>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                본 서비스는 제3자 광고 제공업체인 <strong>Google</strong>을 통해
                광고를 게재할 수 있습니다.
              </li>
              <li>
                Google을 비롯한 제3자 광고 사업자는 쿠키를 사용하여 이용자의 이전
                방문 기록을 바탕으로 맞춤형 광고를 제공합니다.
              </li>
              <li>
                Google이 광고 쿠키(DoubleClick 쿠키 등)를 사용함에 따라, Google 및
                광고 파트너는 이용자의 방문 정보를 토대로 광고를 노출할 수
                있습니다.
              </li>
              <li>
                이용자는{" "}
                <a
                  href="https://www.google.com/settings/ads"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-emerald-600 underline underline-offset-2"
                >
                  Google 광고 설정
                </a>
                에서 맞춤 광고를 비활성화할 수 있으며,{" "}
                <a
                  href="https://www.aboutads.info"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-emerald-600 underline underline-offset-2"
                >
                  www.aboutads.info
                </a>
                에서 제3자 광고 쿠키 사용을 거부할 수 있습니다.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-zinc-900">
              3. 제3자 제공 및 위탁
            </h2>
            <p>
              서비스는 이용자의 개인정보를 판매하지 않습니다. 다만 서비스 운영을
              위해 다음의 업체를 이용합니다.
            </p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5">
              <li>Google AdSense — 광고 게재</li>
              <li>Vercel — 서비스 호스팅 및 접속 통계</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-zinc-900">
              4. 정보의 정확성에 관한 고지
            </h2>
            <p>
              본 서비스가 제공하는 중개보수 계산 결과는 법정 상한요율에 근거한
              참고용 정보이며, 실제 지급액이나 법적 효력을 보장하지 않습니다.
              계산 결과에 근거한 판단의 책임은 이용자에게 있습니다.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-zinc-900">
              5. 이용자의 권리
            </h2>
            <p>
              이용자는 브라우저 설정을 통해 쿠키 저장을 거부하거나 삭제할 수
              있습니다. 다만 쿠키를 차단할 경우 일부 기능 이용에 제한이 있을 수
              있습니다.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-zinc-900">
              6. 방침의 변경
            </h2>
            <p>
              본 방침은 법령이나 서비스 변경에 따라 수정될 수 있으며, 변경 시 본
              페이지를 통해 공지합니다.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-zinc-900">7. 문의</h2>
            <p>
              개인정보 관련 문의는{" "}
              <a
                href="mailto:pickupai2026@gmail.com"
                className="font-medium text-emerald-600 underline underline-offset-2"
              >
                pickupai2026@gmail.com
              </a>{" "}
              으로 연락해 주세요.
            </p>
          </section>
        </div>

        <footer className="mt-12 border-t border-zinc-100 pt-6 pb-10 text-center text-xs text-zinc-400">
          © 2026 복비 계산기
        </footer>
      </main>
    </div>
  );
}
