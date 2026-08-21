import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "서비스 이용약관 · 5초 상식퀴즈",
  description:
    "5초 상식퀴즈(앱인토스 미니앱)의 서비스 이용약관입니다.",
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
              앱인토스(Apps in Toss) 미니앱으로 제공하는 상식 퀴즈 및 랭킹 기능의
              이용과 관련하여 서비스와 이용자 간의 권리·의무 및 책임사항을 정함을
              목적으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-zinc-900">
              제2조 (서비스의 내용)
            </h2>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>경제·시사·국제·역사 분야의 상식 퀴즈 출제 및 자동 채점</li>
              <li>문제당 제한시간(최대 5초)에 기반한 스피드 생존 방식 진행</li>
              <li>연속 정답 수·풀이시간에 따른 랭킹(리더보드) 표시</li>
              <li>기록 공유 기능</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-zinc-900">
              제3조 (이용자의 식별과 이름 표시)
            </h2>
            <p>
              서비스는 랭킹 제공을 위해 토스가 제공하는 이용자 고유 식별키와, 이용자가
              동의한 경우 이름을 사용합니다. 이름 제공에 동의하지 않으면 임의의
              닉네임(게스트)으로 랭킹에 참여합니다. 개인정보의 수집·이용에 관한 자세한
              내용은 개인정보 처리방침에 따릅니다.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-zinc-900">
              제4조 (이용자의 의무)
            </h2>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                부정한 방법으로 점수·랭킹을 조작하거나 서비스 운영을 방해하지 않아야
                합니다.
              </li>
              <li>
                타인에게 불쾌감을 주거나 권리를 침해하는 닉네임을 사용하지 않아야
                하며, 서비스는 부적절한 표시명을 사전 통지 없이 수정·삭제할 수
                있습니다.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-zinc-900">
              제5조 (콘텐츠의 정확성 및 면책)
            </h2>
            <p>
              퀴즈 문제와 해설의 일부는 인공지능(AI)으로 생성되며 공식 출처를 참고해
              검증하지만, 내용에 오류가 있을 수 있습니다. 서비스는 콘텐츠의 완전성·
              정확성을 보증하지 않으며 오락·학습 참고 목적으로 제공합니다. 서비스가
              통제할 수 없는 사유로 인한 손해에 대해서는 책임을 지지 않습니다.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-zinc-900">
              제6조 (약관의 변경)
            </h2>
            <p>
              본 약관은 관련 법령이나 서비스 변경에 따라 개정될 수 있으며, 변경 시 본
              페이지를 통해 공지합니다.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-zinc-900">
              제7조 (문의)
            </h2>
            <p>
              서비스 관련 문의는{" "}
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
