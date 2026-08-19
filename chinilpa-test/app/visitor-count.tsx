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
    <p className="visitor-count">
      오늘 <b>{count.toLocaleString()}</b>명이 조사받았습니다
    </p>
  );
}
