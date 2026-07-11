import Link from "next/link";
import SharePageButton from "./share-page-button";

const LINKS = [
  { href: "/", label: "홈" },
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
            className="font-medium text-zinc-400 underline-offset-2 transition hover:text-indigo-600 hover:underline"
          >
            {l.label}
          </Link>
        ))}
      </nav>
      {/* 쿠팡 파트너스 정책상 필수 고지 문구 */}
      <p className="mt-4 text-center text-[11px] leading-relaxed text-zinc-400">
        이 페이지의 일부 링크는 쿠팡 파트너스 활동의 일환으로, 이에 따라 일정액의
        수수료를 제공받을 수 있습니다.
      </p>
    </div>
  );
}
