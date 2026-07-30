"use client";

import { useState, type RefObject } from "react";
import { toPng } from "html-to-image";

export default function SaveImageButton({
  targetRef,
}: {
  targetRef: RefObject<HTMLElement | null>;
}) {
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  async function save() {
    const node = targetRef.current;
    if (!node || saving) return;

    setSaving(true);
    try {
      // 결과 카드 DOM을 그대로 PNG로 렌더링 (2배 해상도)
      const dataUrl = await toPng(node, {
        pixelRatio: 2,
        backgroundColor: "#0b0713",
        cacheBust: true,
      });

      const link = document.createElement("a");
      link.download = "평행우주-나의삶.png";
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
      className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 py-3.5 text-sm font-semibold text-violet-100 transition hover:border-violet-300/40 hover:bg-white/10 active:scale-[0.98] disabled:opacity-60"
    >
      <DownloadIcon className="h-4 w-4" />
      {saving ? "이미지 만드는 중..." : done ? "저장됐어요!" : "결과 이미지 저장"}
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
