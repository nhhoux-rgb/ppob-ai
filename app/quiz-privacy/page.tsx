import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보 처리방침 · 5초 상식퀴즈",
  description:
    "5초 상식퀴즈(앱인토스 미니앱)의 개인정보 수집·이용에 관한 안내입니다.",
};

export default function QuizPrivacyPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900 antialiased">
      <main className="mx-auto w-full max-w-[640px] px-5 py-10 sm:px-6">
        <h1 className="text-2xl font-bold tracking-tight">
          개인정보 처리방침
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          서비스명: 5초 상식퀴즈 · 시행일: 2026년 8월 21일
        </p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-zinc-700">
          <section>
            <p>
              &ldquo;5초 상식퀴즈&rdquo;(이하 &ldquo;서비스&rdquo;)는 랭킹 기능
              제공을 위해 필요한 최소한의 정보만을 수집·이용하며, 관련 법령을
              준수합니다.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-zinc-900">
              1. 수집하는 정보와 이용 목적
            </h2>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                <strong>이용자 고유 식별키</strong> — 토스가 제공하는 익명 식별키.
                동일 이용자의 랭킹 기록을 식별·갱신하기 위해 사용합니다.
              </li>
              <li>
                <strong>이름</strong> — 이용자가 토스 로그인에서 이름 제공에 동의한
                경우에 한해 수집하며, 랭킹에 표시할 목적으로만 사용합니다. 동의하지
                않으면 임의의 닉네임(게스트)으로 대체합니다.
              </li>
              <li>
                <strong>게임 기록</strong> — 연속 정답 수, 총 풀이시간 등 랭킹 산정에
                필요한 플레이 결과.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-zinc-900">
              2. 보관 및 처리 위탁
            </h2>
            <p>
              수집한 정보는 클라우드 백엔드 서비스인 <strong>Supabase</strong>의{" "}
              <strong>국내(서울, ap-northeast-2) 리전</strong>에 저장·처리되며,
              서비스는 랭킹 운영 목적을 위해서만 이를 이용합니다.
            </p>
            <p className="mt-2">
              퀴즈 문제 생성 과정에서 <strong>OpenAI</strong>의 API를 이용하나, 이는
              문제·해설 콘텐츠 생성을 위한 것으로 이용자의 개인정보를 전송하지
              않습니다.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-zinc-900">
              3. 보유 기간
            </h2>
            <p>
              수집한 정보는 랭킹 운영 목적 달성 시 또는 이용자의 삭제 요청 시까지
              보관하며, 목적 달성 후 지체 없이 파기합니다.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-zinc-900">
              4. 제3자 제공
            </h2>
            <p>
              서비스는 법령에 따른 경우를 제외하고 이용자의 개인정보를 제3자에게
              제공하거나 판매하지 않습니다.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-zinc-900">
              5. 이용자의 권리
            </h2>
            <p>
              이용자는 자신의 랭킹 기록 및 표시 이름의 삭제를 요청할 수 있습니다.
              요청은 아래 문의처로 접수해 주세요.
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
