import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "개인정보처리방침 · 등기조회",
  description:
    "등기조회 서비스의 등기번호·접수증 이미지 처리, 쿠키·광고에 관한 안내입니다.",
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
              등기조회(이하 &ldquo;서비스&rdquo;)는 이용자의 개인정보를 중요하게
              생각하며, 관련 법령을 준수합니다. 본 방침은 서비스가 어떤 정보를
              수집하고 어떻게 이용·보호하는지 설명합니다.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-zinc-900">
              1. 수집하는 정보와 이용 목적
            </h2>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                <strong>등기번호</strong> — 이용자가 조회를 위해 입력하거나
                접수증에서 인식한 등기번호입니다. 오직 배송상태 조회를 위해서만
                사용됩니다.
              </li>
              <li>
                <strong>접수증 이미지</strong> — 등기번호 인식을 위해 이용자가
                올린 접수증(영수증) 사진입니다. 등기번호를 읽어내는 목적으로만
                사용됩니다.
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
              2. 정보의 처리와 보관
            </h2>
            <p>
              입력한 등기번호는 배송상태 조회를 위해{" "}
              <strong>우정사업본부(우체국) 공식 오픈API</strong>로 전송됩니다.
              접수증 이미지는 등기번호 인식을 위해 AI 처리 업체인{" "}
              <strong>OpenAI</strong>의 API로 전송됩니다. 서비스는 조회 결과와
              업로드한 이미지를 자체 서버나 별도 데이터베이스에 저장하지 않으며,
              조회 결과는 이용자의 기기에서 표로 표시되고 CSV로 내려받아집니다.
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
              4. 이용자의 책임
            </h2>
            <p>
              타인의 우편물 정보를 조회·활용할 때에는 관련 법령과 정보주체의
              권리를 준수해야 하며, 조회 결과의 활용에 대한 책임은 이용자에게
              있습니다.
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
