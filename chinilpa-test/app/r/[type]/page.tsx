import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteFooter from "@/app/site-footer";
import { TYPES, TYPE_KEYS } from "@/app/types";

// 결과를 링크로 공유할 수 있게 유형마다 정적 페이지를 만든다.
// 초안은 단일 화면 SPA라 결과를 보낼 주소 자체가 없었다.
// 부수 효과로 색인 가능한 페이지가 9개 생긴다.

export function generateStaticParams() {
  return TYPE_KEYS.map((type) => ({ type }));
}

// 이 Next 버전에서 params 는 Promise 다.
type Props = { params: Promise<{ type: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type } = await params;
  const t = TYPES[type];
  if (!t) return {};

  const title = `${t.n} — 친일파 테스트 결과`;
  const description = `${t.q} ${t.d[0].replace(/<[^>]+>/g, "").slice(0, 90)}…`;

  return {
    title,
    description,
    alternates: { canonical: `/r/${t.key}` },
    openGraph: {
      type: "article",
      siteName: "친일파 테스트",
      title,
      description,
      url: `/r/${t.key}`,
      locale: "ko_KR",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ResultPage({ params }: Props) {
  const { type } = await params;
  const t = TYPES[type];
  if (!t) notFound();

  return (
    <>
      <div className="sheet">
        <div className="formhead">
          <div className="formno">身元調書 所見</div>
          <div className="secret">秘</div>
        </div>
        <div className="rule-thin" />

        <section>
          <div className="rlabel">所 見</div>
          <h1 className="rname">{t.n}</h1>
          <div className="rquote">{t.q}</div>

          <div className="seal" aria-hidden="true">
            <svg viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
              />
              <text
                x="50"
                y="50"
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="46"
              >
                {t.ch}
              </text>
            </svg>
          </div>

          <div className="rdesc">
            {t.d.map((p, i) => (
              <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
            ))}
          </div>

          <div className="hist">
            <b>기록</b> — {t.h}
          </div>

          <div className="counter">{t.c}</div>

          <h3 className="sechead">다른 유형</h3>
          <ul style={{ listStyle: "none", display: "grid", gap: 8 }}>
            {TYPE_KEYS.filter((k) => k !== t.key).map((k) => (
              <li key={k}>
                <Link href={`/r/${k}`} className="backlink">
                  {TYPES[k].n} {TYPES[k].q}
                </Link>
              </li>
            ))}
          </ul>

          <div className="actions">
            <Link href="/" className="btn" style={{ textAlign: "center" }}>
              나는 어느 쪽인지 해보기
            </Link>
          </div>
        </section>
      </div>
      <div className="sheet-tail">
        <SiteFooter />
      </div>
    </>
  );
}
