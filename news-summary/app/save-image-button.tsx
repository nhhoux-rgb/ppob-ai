"use client";

import { useState, type RefObject } from "react";
import { toPng } from "html-to-image";

export default function SaveImageButton({
  targetRef,
  filename = "기사요약",
  backgroundColor = "#ffffff",
}: {
  targetRef: RefObject<HTMLElement | null>;
  filename?: string;
  backgroundColor?: string;
}) {
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  async function save() {
    const node = targetRef.current;
    if (!node || saving) return;

    setSaving(true);
    try {
      // 요약 카드 DOM을 그대로 PNG로 렌더링 (3배 해상도 → 보고서 인쇄에도 선명)
      const dataUrl = await toPng(node, {
        pixelRatio: 3,
        backgroundColor,
        cacheBust: true,
      });

      const link = document.createElement("a");
      link.download = `${filename}.png`;
      link.href = dataUrl;
      link.click();

      setDone(true);
      setTimeout(() => setDone(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <button
      type="button"
      onClick={save}
      disabled={saving}
      className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-semibold text-white shadow-lg transition enabled:active:scale-[0.98] disabled:opacity-60"
      style={{ backgroundColor: "#0284c7", boxShadow: "0 8px 24px rgba(2,132,199,0.25)" }}
    >
      <DownloadIcon className="h-5 w-5" />
      {saving ? "이미지 만드는 중..." : done ? "저장됐어요!" : "요약 이미지 저장 (PNG)"}
    </button>
  );
}

function DownloadIcon({ className }: { className?: string }) {
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
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M7 10l5 5 5-5" />
      <path d="M12 15V3" />
    </svg>
  );
}
