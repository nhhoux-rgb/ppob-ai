import { forwardRef, type CSSProperties } from "react";

export type Clip = {
  press: string;
  date: string;
  headline: string;
  subheadlines: string[];
  body: string[];
};

export type FontKey = "sans" | "serif" | "round";
export type TextureKey = "none" | "paper" | "grid" | "gradient";

export type Design = {
  bg: string; // 배경색 (hex)
  text: string; // 글자색 (hex)
  font: FontKey; // 폰트
  texture: TextureKey; // 배경 질감
};

export const DEFAULT_DESIGN: Design = {
  bg: "#ffffff",
  text: "#111827",
  font: "sans",
  texture: "none",
};

const FONT_FAMILY: Record<FontKey, string> = {
  sans: "var(--font-card-sans), system-ui, sans-serif",
  serif: "var(--font-card-serif), serif",
  round: "var(--font-card-round), system-ui, sans-serif",
};

// #rgb / #rrggbb → rgba 문자열 (질감·투명도 계산용)
function hexToRgba(hex: string, alpha: number): string {
  let h = hex.replace("#", "").trim();
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  if (Number.isNaN(n) || h.length !== 6) return `rgba(0,0,0,${alpha})`;
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

// 배경색 + 질감을 합친 표면 스타일
function surfaceStyle(design: Design): CSSProperties {
  const base: CSSProperties = { backgroundColor: design.bg };
  const line = hexToRgba(design.text, 0.06);
  switch (design.texture) {
    case "gradient":
      return {
        ...base,
        backgroundImage: `linear-gradient(160deg, ${hexToRgba(
          design.text,
          0.09
        )} 0%, ${hexToRgba(design.text, 0)} 55%)`,
      };
    case "grid":
      return {
        ...base,
        backgroundImage: `linear-gradient(${line} 1px, transparent 1px), linear-gradient(90deg, ${line} 1px, transparent 1px)`,
        backgroundSize: "22px 22px",
      };
    case "paper":
      // SVG fractal noise 그레인 — 은은한 종이 질감
      return {
        ...base,
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E\")",
      };
    default:
      return base;
  }
}

// 보고서에 그대로 붙여넣을 요약 카드. 배경/글자색/폰트/질감을 커스터마이즈.
const SummaryCard = forwardRef<
  HTMLElement,
  {
    clip: Clip;
    logoDataUrl: string | null;
    design?: Design;
    siteLabel?: string;
  }
>(function SummaryCard({ clip, logoDataUrl, design = DEFAULT_DESIGN, siteLabel }, ref) {
  const { press, date, headline, subheadlines, body } = clip;
  const { text } = design;

  return (
    <article
      ref={ref}
      className="mx-auto w-full max-w-[480px] px-7 py-7"
      style={{
        ...surfaceStyle(design),
        color: text,
        fontFamily: FONT_FAMILY[design.font],
      }}
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
          <span className="text-[17px] font-extrabold tracking-tight">
            {press}
          </span>
        </div>
        {date ? (
          <span
            className="shrink-0 pb-0.5 text-xs font-medium"
            style={{ color: text, opacity: 0.45 }}
          >
            {date}
          </span>
        ) : null}
      </header>

      {/* 헤더 구분선 (신문 제호 아래 굵은 선 느낌) */}
      <div className="mb-4 h-[3px] w-full" style={{ backgroundColor: text }} />

      {/* ── 강조 제목 ── */}
      <h2 className="text-[22px] font-extrabold leading-snug tracking-tight">
        {headline}
      </h2>

      {/* ── 부제 ── */}
      {subheadlines.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {subheadlines.map((s, i) => (
            <p
              key={i}
              className="text-[14px] font-bold leading-snug"
              style={{ color: text, opacity: 0.88 }}
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
            className="text-[13.5px] leading-relaxed"
            style={{ color: text, opacity: 0.72 }}
          >
            {p}
          </p>
        ))}
      </div>

      {/* ── 워터마크 (캡처 시 함께 담김) ── */}
      <div
        className="mt-6 pt-2.5 text-right text-[10px] font-medium"
        style={{ borderTop: `1px solid ${hexToRgba(text, 0.12)}`, color: text, opacity: 0.35 }}
      >
        {siteLabel ?? "뉴스클리핑"}
      </div>
    </article>
  );
});

export default SummaryCard;
