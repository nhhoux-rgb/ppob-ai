import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "서비스 이용약관 · 5초 상식퀴즈",
  description:
    "5초 상식퀴즈(앱인토스 미니앱)의 서비스 이용약관 및 개인정보 수집·이용 안내입니다.",
};

export default function QuizTermsPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900 antialiased">
      <main className="mx-auto w-full max-w-[640px] px-5 py-10 sm:px-6">
        <h1 className="text-2xl font-bold tracking-tight">서비스 이용약관</h1>
        <p className="mt-2 text-sm text-zinc-500">
          서비스명: 5초 상식퀴즈 · 시행일: 2026년 8월 21일
        </p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-zinc-700">
          <section>
            <h2 className="mb-2 text-base font-bold text-zinc-900">
              제1조 (목적)
            </h2>
            <p>
              본 약관은 &ldquo;5초 상식퀴즈&rdquo;(이하 &ldquo;서비스&rdquo;)가
              앱인토스(Apps in Toss) 미니앱 형태로 제공하는 상식 퀴즈 및 랭킹
              기능의 이용과 관련하여, 서비스와 이용자 간의 권리·의무 및 책임사항을
              규정함을 목적으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-zinc-900">
              제2조 (서비스의 내용)
            </h2>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>분야별 상식 퀴즈 출제 및 자동 채점, 해설 제공</li>
              <li>문제당 제한시간(5초) 기반의 점수 산정</li>
              <li>이용자 점수의 집계 및 랭킹(리더보드) 표시</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-zinc-900">
              제3조 (개인정보의 수집 및 이용)
            </h2>
            <p>
              서비스는 랭킹 기능 제공을 위해 필요한 최소한의 정보만을 수집·이용합니다.
            </p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5">
              <li>
                <strong>수집 항목</strong> — 이용자 식별을 위한 고유 키(익명 해시),
                랭킹에 표시할 이름(토스 로그인 동의 시 제공되는 이름).
              </li>
              <li>
                <strong>이용 목적</strong> — 랭킹 순위 산정 및 화면 표시, 동일
                이용자의 점수 갱신.
              </li>
              <li>
                <strong>보유 기간</strong> — 랭킹 운영 목적 달성 시 또는 이용자의
                삭제 요청 시까지 보관하며, 이후 지체 없이 파기합니다.
              </li>
            </ul>
            <p className="mt-2">
              이용자는 이름 제공에 동의하지 않을 수 있으며, 이 경우 임의의
              닉네임(게스트)으로 랭킹에 참여합니다.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-zinc-900">
              제4조 (이용자의 의무)
            </h2>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                이용자는 부정한 방법으로 점수·랭킹을 조작하거나 서비스 운영을
                방해해서는 안 됩니다.
              </li>
              <li>
                타인의 명예를 훼손하거나 불쾌감을 주는 닉네임을 사용해서는 안
                됩니다. 서비스는 부적절한 표시명을 사전 통지 없이 수정·삭제할 수
                있습니다.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-zinc-900">
              제5조 (콘텐츠의 정확성 및 면책)
            </h2>
            <p>
              퀴즈 문제와 해설의 일부는 인공지능(AI)으로 생성되며, 내용에 오류가
              있을 수 있습니다. 서비스는 콘텐츠의 완전성·정확성을 보증하지 않으며,
              오락·학습 참고 목적으로 제공됩니다. 천재지변, 이용자의 귀책 등
              서비스가 통제할 수 없는 사유로 인한 손해에 대해서는 책임을 지지
              않습니다.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-zinc-900">
              제6조 (약관의 변경)
            </h2>
            <p>
              본 약관은 관련 법령이나 서비스 변경에 따라 개정될 수 있으며, 변경 시
              본 페이지를 통해 공지합니다.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-zinc-900">
              제7조 (문의)
            </h2>
            <p>
              서비스 및 개인정보 관련 문의는{" "}
              <a
                href="mailto:pickupai2026@gmail.com"
                className="font-medium text-violet-600 underline underline-offset-2"
              >
                pickupai2026@gmail.com
              </a>{" "}
              으로 연락해 주세요.
            </p>
          </section>
        </div>

        <footer className="mt-12 border-t border-zinc-100 pt-6 pb-10 text-center text-xs text-zinc-400">
          © 2026 5초 상식퀴즈
        </footer>
      </main>
    </div>
  );
}
