"use client";

import { useEffect, useState } from "react";

function todayInSeoul(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
}

export default function VisitorCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const flag = `visited:${todayInSeoul()}`;
    let alreadyVisited = false;
    try {
      alreadyVisited = localStorage.getItem(flag) === "1";
    } catch {
      // localStorage 차단 환경(시크릿 등)에서는 매번 신규로 처리
    }

    // 오늘 처음이면 +1(POST), 이미 왔으면 현재 수만 읽기(GET)
    fetch("/api/visit", { method: alreadyVisited ? "GET" : "POST" })
      .then((r) => r.json())
      .then((d) => {
        if (typeof d.count === "number") setCount(d.count);
        if (!alreadyVisited) {
          try {
            localStorage.setItem(flag, "1");
          } catch {
            // 무시
          }
        }
      })
      .catch(() => {});
  }, []);

  // 저장소 미연결이거나 로딩 전이면 아무것도 안 보임
  if (count === null) return null;

  return (
    <div className="mb-4 flex items-center justify-center gap-1.5 text-xs font-medium text-zinc-500">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-500" />
      </span>
      오늘{" "}
      <span className="font-bold text-sky-600">{count.toLocaleString()}</span>
      명이 함께했어요
    </div>
  );
}
