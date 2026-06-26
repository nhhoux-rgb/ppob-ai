import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "개인정보처리방침 · 뽑AI",
  description: "뽑AI 서비스의 개인정보 수집·이용 및 쿠키·광고에 관한 안내입니다.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900 antialiased">
      <main className="mx-auto w-full max-w-[640px] px-5 py-10 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet-600 transition hover:text-violet-700"
        >
          <span aria-hidden>←</span> 홈으로
        </Link>

        <h1 className="mt-6 text-2xl font-bold tracking-tight">
          개인정보처리방침
        </h1>
        <p className="mt-2 text-sm text-zinc-500">시행일: 2026년 6월 26일</p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-zinc-700">
          <section>
            <p>
              뽑AI(이하 &ldquo;서비스&rdquo;)는 이용자의 개인정보를 중요하게
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
                <strong>업로드 이미지</strong> — 이용자가 인형뽑기 공략 분석을
                위해 직접 올린 사진입니다. 오직 AI 분석 결과를 제공하기 위한
                목적으로만 사용됩니다.
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
              2. 이미지의 처리와 보관
            </h2>
            <p>
              업로드한 사진은 분석을 위해 AI 처리 업체인{" "}
              <strong>OpenAI</strong>의 API로 전송됩니다. 서비스는 분석 결과를
              생성한 뒤 해당 이미지를 자체 서버에 저장하지 않으며, 별도의
              데이터베이스에 보관하지 않습니다. OpenAI의 데이터 처리 방식은{" "}
              <a
                href="https://openai.com/policies/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-violet-600 underline underline-offset-2"
              >
                OpenAI 개인정보처리방침
              </a>
              을 따릅니다.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-zinc-900">
              3. 쿠키 및 광고 (Google AdSense)
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
                  className="font-medium text-violet-600 underline underline-offset-2"
                >
                  Google 광고 설정
                </a>
                에서 맞춤 광고를 비활성화할 수 있으며,{" "}
                <a
                  href="https://www.aboutads.info"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-violet-600 underline underline-offset-2"
                >
                  www.aboutads.info
                </a>
                에서 제3자 광고 쿠키 사용을 거부할 수 있습니다.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-zinc-900">
              4. 제3자 제공 및 위탁
            </h2>
            <p>
              서비스는 이용자의 개인정보를 판매하지 않습니다. 다만 서비스 제공을
              위해 다음의 업체를 이용합니다.
            </p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5">
              <li>OpenAI — 이미지 기반 AI 분석</li>
              <li>Google AdSense — 광고 게재</li>
            </ul>
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
                href="mailto:nhhoux@gmail.com"
                className="font-medium text-violet-600 underline underline-offset-2"
              >
                nhhoux@gmail.com
              </a>{" "}
              으로 연락해 주세요.
            </p>
          </section>
        </div>

        <footer className="mt-12 border-t border-zinc-100 pt-6 pb-10 text-center text-xs text-zinc-400">
          © 2026 뽑AI
        </footer>
      </main>
    </div>
  );
}
