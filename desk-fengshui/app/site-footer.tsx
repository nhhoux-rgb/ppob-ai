import Link from "next/link";
import SharePageButton from "./share-page-button";

const LINKS = [
  { href: "/", label: "홈" },
  { href: "/guide", label: "풍수 가이드" },
  { href: "/how-to-use", label: "이용 방법" },
  { href: "/faq", label: "자주 묻는 질문" },
  { href: "/privacy", label: "개인정보처리방침" },
];

export default function SiteFooter() {
  return (
    <div>
      <div className="mt-4 flex justify-center">
        <SharePageButton />
      </div>
      <nav className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="font-medium text-zinc-400 underline-offset-2 transition hover:text-emerald-600 hover:underline"
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
