"use client";

import Link from "next/link";
import {
  BADGES,
  BRAND_BY_KEY,
  TIER_BY_KEY,
  coupangLink,
  shoePrice,
  shoeDesc,
  type BadgeKey,
  type Shoe,
} from "./shoes";

// 뱃지 색 → 정적 Tailwind 클래스 (동적 클래스는 v4에서 purge되므로 고정).
export const BADGE_DOT: Record<BadgeKey, string> = {
  new: "bg-amber-400",
  pick: "bg-emerald-500",
  great: "bg-sky-500",
};
export const BADGE_CHIP: Record<BadgeKey, string> = {
  new: "bg-amber-50 text-amber-700 ring-amber-200",
  pick: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  great: "bg-sky-50 text-sky-700 ring-sky-200",
};

// 러닝화 실루엣 아이콘 (저작권 없는 자체 SVG).
export function SneakerIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden>
      <path
        d="M5 31c0-3 2.2-4.8 6-6l9.5-3.2c1.9-.6 3.9.1 4.9 1.8l3.1 5.2c.8 1.3 2.2 2.1 3.8 2.2l5.2.3c1.7.1 3 1.5 3 3.2V37c0 1.7-1.4 3-3 3H8c-1.7 0-3-1.3-3-3v-6Z"
        fill="currentColor"
      />
      <path
        d="M6 36.5h36"
        stroke="rgba(0,0,0,.18)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M22 23.5l2.6 3.4M25.5 22l2.6 3.4M29 21l2.4 3.2"
        stroke="rgba(0,0,0,.16)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

// 상품 썸네일. 실제 이미지 URL(shoe.image)이 있으면 사진을, 없으면 브랜드
// 컬러 그라데이션 + 러닝화 실루엣으로 대체한다.
export function ShoeThumb({
  shoe,
  className = "",
}: {
  shoe: Shoe;
  className?: string;
}) {
  const brand = BRAND_BY_KEY[shoe.brand];
  if (shoe.image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={shoe.image}
        alt={`${brand.name} ${shoe.name}`}
        loading="lazy"
        className={`object-cover ${className}`}
      />
    );
  }
  return (
    <span
      aria-hidden
      className={`flex items-center justify-center overflow-hidden ${className}`}
      style={{
        background: `linear-gradient(135deg, ${brand.color[0]}, ${brand.color[1]})`,
      }}
    >
      <SneakerIcon className="h-[60%] w-[60%] text-white/95" />
    </span>
  );
}

export function ShoeModal({
  shoe,
  onClose,
}: {
  shoe: Shoe;
  onClose: () => void;
}) {
  const brand = BRAND_BY_KEY[shoe.brand];
  const tier = TIER_BY_KEY[shoe.tier];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <ShoeThumb
            shoe={shoe}
            className="h-16 w-16 shrink-0 rounded-2xl shadow-sm"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-indigo-600">
              {brand.name} · {tier.name}
            </p>
            <h2 className="mt-1 text-xl font-extrabold tracking-tight text-zinc-900">
              {shoe.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="-mr-1 -mt-1 rounded-full p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {shoe.badges.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {shoe.badges.map((b) => (
              <span
                key={b}
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${BADGE_CHIP[b]}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${BADGE_DOT[b]}`} />
                {BADGES[b].label}
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 rounded-2xl bg-zinc-50 px-4 py-3">
          <p className="text-xs font-semibold text-zinc-500">참고가</p>
          <p className="mt-0.5 text-lg font-bold text-zinc-900">
            {shoePrice(shoe)}
          </p>
          <p className="mt-0.5 text-[11px] text-zinc-400">
            정가·할인가는 시기·판매처마다 달라요. 실제 최저가는 아래 쿠팡
            링크에서 확인하세요.
          </p>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-zinc-600">
          {shoeDesc(shoe)}
        </p>

        <a
          href={coupangLink(shoe)}
          target="_blank"
          rel="nofollow sponsored noopener noreferrer"
          className="mt-5 flex w-full items-center justify-center gap-1.5 rounded-2xl bg-indigo-600 px-4 py-3.5 text-sm font-bold text-white transition hover:bg-indigo-700 active:scale-[0.99]"
        >
          쿠팡에서 최저가 확인
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </a>

        <p className="mt-3 text-center text-[11px] leading-relaxed text-zinc-400">
          이 링크는 쿠팡 파트너스 활동의 일환으로, 이에 따라 일정액의 수수료를
          제공받을 수 있습니다.
        </p>

        <Link
          href="/tier"
          onClick={onClose}
          className="mt-2 block text-center text-xs font-medium text-indigo-500 underline underline-offset-2"
        >
          전체 러닝화 계급도 보기 →
        </Link>
      </div>
    </div>
  );
}
