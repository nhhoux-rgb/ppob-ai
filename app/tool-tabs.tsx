"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "🕹️ 뽑기 공략" },
  { href: "/value", label: "💰 본전 분석" },
];

export default function ToolTabs() {
  const pathname = usePathname();

  return (
    <nav className="mb-6 flex gap-1 rounded-full bg-zinc-100 p-1 text-sm font-semibold">
      {TABS.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`flex-1 rounded-full py-2 text-center transition ${
              active
                ? "bg-white text-violet-600 shadow-sm"
                : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
