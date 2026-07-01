"use client";

import { useState } from "react";

export default function SharePageButton({
  className = "",
}: {
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const data = {
      title: "책상풍수 · 데스크 풍수 AI",
      text: "책상 사진 한 장으로 보는 AI 풍수 분석 — 재물운·집중력·건강운",
      url,
    };

    // 모바일: 카톡/인스타 등 네이티브 공유 시트
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(data);
      } catch {
        // 사용자가 취소한 경우 등 — 무시
      }
      return;
    }

    // 데스크톱: 링크 복사로 대체
    try {
      await navigator.clipboard.writeText(url);
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
      aria-label="이 페이지 공유하기"
      className={`inline-flex items-center gap-1 rounded-full border border-zinc-200 px-2.5 py-1 text-xs font-semibold text-zinc-600 transition hover:border-emerald-200 hover:text-emerald-600 active:scale-95 ${className}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-3.5 w-3.5"
        aria-hidden="true"
      >
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <path d="m8.59 13.51 6.83 3.98" />
        <path d="m15.41 6.51-6.82 3.98" />
      </svg>
      {copied ? "복사됨!" : "공유"}
    </button>
  );
}
