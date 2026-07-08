import { forwardRef } from "react";

export type Clip = {
  press: string;
  date: string;
  headline: string;
  subheadlines: string[];
  body: string[];
};

// 보고서에 그대로 붙여넣을 요약 카드. 흑백 위주의 신문 클리핑 톤으로 중립적으로.
const SummaryCard = forwardRef<
  HTMLElement,
  { clip: Clip; logoDataUrl: string | null; siteLabel?: string }
>(function SummaryCard({ clip, logoDataUrl, siteLabel }, ref) {
  const { press, date, headline, subheadlines, body } = clip;

  return (
    <article
      ref={ref}
      className="mx-auto w-full max-w-[480px] bg-white px-7 py-7"
      style={{ color: "#111827" }}
    >
      {/* ── 헤더: 언론사 + 날짜 ── */}
      <header className="flex items-end justify-between gap-3 pb-3">
        <div className="flex items-center gap-2.5">
          {logoDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoDataUrl}
              alt={press}
              className="h-9 w-auto max-w-[160px] object-contain"
              crossOrigin="anonymous"
            />
          ) : null}
          <span className="text-[17px] font-extrabold tracking-tight text-zinc-900">
            {press}
          </span>
        </div>
        {date ? (
          <span className="shrink-0 pb-0.5 text-xs font-medium text-zinc-400">
            {date}
          </span>
        ) : null}
      </header>

      {/* 헤더 구분선 (신문 제호 아래 굵은 선 느낌) */}
      <div className="mb-4 h-[3px] w-full bg-zinc-900" />

      {/* ── 강조 제목 ── */}
      <h2 className="text-[22px] font-extrabold leading-snug tracking-tight text-zinc-900">
        {headline}
      </h2>

      {/* ── 부제 ── */}
      {subheadlines.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {subheadlines.map((s, i) => (
            <p
              key={i}
              className="text-[14px] font-bold leading-snug text-zinc-700"
            >
              {s}
            </p>
          ))}
        </div>
      )}

      {/* ── 요약 본문 ── */}
      <div className="mt-4 space-y-3">
        {body.map((p, i) => (
          <p
            key={i}
            className="text-[13.5px] leading-relaxed text-zinc-600"
          >
            {p}
          </p>
        ))}
      </div>

      {/* ── 워터마크 (캡처 시 함께 담김) ── */}
      <div className="mt-6 border-t border-zinc-100 pt-2.5 text-right text-[10px] font-medium text-zinc-300">
        {siteLabel ?? "뉴스클리핑"}
      </div>
    </article>
  );
});

export default SummaryCard;
