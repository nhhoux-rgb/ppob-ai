"use client";

import { useState } from "react";

export default function ShareButton({
  text,
  label = "결과 공유하기",
}: {
  text: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url =
      typeof window !== "undefined"
        ? window.location.origin + window.location.pathname
        : "";

    // 모바일: 네이티브 공유 시트 (카톡/인스타 등)
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "책상풍수", text, url });
      } catch {
        // 사용자가 취소한 경우 등 — 무시
      }
      return;
    }

    // 데스크톱: 링크 복사로 대체
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 클립보드 차단 환경 — 무시
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 py-3.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 active:scale-[0.98]"
    >
      <ShareIcon className="h-4 w-4" />
      {copied ? "링크가 복사됐어요!" : label}
    </button>
  );
}

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.59 13.51 6.83 3.98" />
      <path d="m15.41 6.51-6.82 3.98" />
    </svg>
  );
}
