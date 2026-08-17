import Link from "next/link";
import SharePageButton from "./share-page-button";

const LINKS = [
  { href: "/", label: "홈" },
  { href: "/guide", label: "해설" },
  { href: "/sources", label: "출처" },
  { href: "/how-to-use", label: "이용 방법" },
  { href: "/faq", label: "자주 묻는 질문" },
  { href: "/privacy", label: "개인정보처리방침" },
];

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <SharePageButton />
      </div>
      <nav>
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href}>
            {l.label}
          </Link>
        ))}
      </nav>
      <p className="copy">
        이 테스트는 역사 학습을 위한 콘텐츠이며, 특정 실존 인물을 평가하지
        않습니다.
        <br />
        결과는 성향을 비추어 보는 장치일 뿐 어떤 판정도 아닙니다.
      </p>
    </footer>
  );
}
