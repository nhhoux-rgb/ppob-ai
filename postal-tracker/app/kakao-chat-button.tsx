"use client";

// 카카오톡 문의 플로팅 버튼.
// 링크는 Vercel 환경변수 NEXT_PUBLIC_KAKAO_CHAT_URL 로 넣는다.
// (카카오톡 오픈채팅방 또는 카카오채널 주소) — 값이 없으면 버튼을 숨긴다.
const KAKAO_URL = process.env.NEXT_PUBLIC_KAKAO_CHAT_URL;

export default function KakaoChatButton() {
  if (!KAKAO_URL) return null;

  return (
    <a
      href={KAKAO_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="카카오톡으로 문의하기"
      className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-[#FEE500] px-4 py-3 text-sm font-bold text-[#3B1E1E] shadow-lg ring-1 ring-black/5 transition hover:brightness-95 active:scale-95"
    >
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        className="h-5 w-5"
      >
        {/* 말풍선 아이콘 */}
        <path d="M12 3C6.9 3 3 6.3 3 10.3c0 2.6 1.7 4.9 4.3 6.2-.2.7-.7 2.5-.8 2.9 0 0 0 .2.1.2.1.1.2 0 .3 0 .4-.1 2.6-1.7 3.3-2.2.6.1 1.2.1 1.8.1 5.1 0 9-3.3 9-7.3S17.1 3 12 3z" />
      </svg>
      <span className="hidden sm:inline">카카오톡 문의</span>
    </a>
  );
}
