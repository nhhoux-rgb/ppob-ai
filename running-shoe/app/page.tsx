"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import SiteFooter from "./site-footer";
import VisitorCount from "./visitor-count";
import SharePageButton from "./share-page-button";
import {
  BRANDS,
  GROUPS,
  TIERS,
  SHOES,
  BADGES,
  BRAND_BY_KEY,
  TIER_BY_KEY,
  coupangLink,
  shoePrice,
  shoeDesc,
  type BadgeKey,
  type BrandKey,
  type Shoe,
} from "./shoes";

// 뱃지 색 → 정적 Tailwind 클래스 (동적 클래스는 v4에서 purge되므로 고정).
const BADGE_DOT: Record<BadgeKey, string> = {
  new: "bg-amber-400",
  pick: "bg-emerald-500",
  great: "bg-sky-500",
};
const BADGE_CHIP: Record<BadgeKey, string> = {
  new: "bg-amber-50 text-amber-700 ring-amber-200",
  pick: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  great: "bg-sky-50 text-sky-700 ring-sky-200",
};

// brand+tier → 해당 칸의 신발 목록.
const SHOES_BY_CELL = SHOES.reduce<Record<string, Shoe[]>>((acc, s) => {
  (acc[`${s.brand}-${s.tier}`] ??= []).push(s);
  return acc;
}, {});

export default function Home() {
  const [brandFilter, setBrandFilter] = useState<BrandKey | "all">("all");
  const [selected, setSelected] = useState<Shoe | null>(null);

  const visibleBrands = useMemo(
    () =>
      brandFilter === "all"
        ? BRANDS
        : BRANDS.filter((b) => b.key === brandFilter),
    [brandFilter],
  );

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-3 py-8 sm:px-4">
      <VisitorCount />

      <header className="text-center">
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl">
          러닝화 계급도
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-zinc-500">
          나이키·아식스·호카 등 브랜드별 러닝화를 입문화부터 카본 레이싱까지 등급으로
          정리했어요. 신발을 누르면 참고가·특징·구매 링크를 볼 수 있습니다.
        </p>
        <div className="mt-3 flex justify-center">
          <SharePageButton />
        </div>
      </header>

      {/* 뱃지 범례 */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-zinc-600">
        {(Object.keys(BADGES) as BadgeKey[]).map((k) => (
          <span key={k} className="inline-flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-full ${BADGE_DOT[k]}`} />
            {BADGES[k].label}
          </span>
        ))}
      </div>

      {/* 브랜드 필터 */}
      <div className="mt-5 -mx-3 overflow-x-auto px-3 sm:mx-0 sm:px-0">
        <div className="flex gap-1.5 whitespace-nowrap">
          <FilterChip
            active={brandFilter === "all"}
            onClick={() => setBrandFilter("all")}
          >
            전체
          </FilterChip>
          {BRANDS.map((b) => (
            <FilterChip
              key={b.key}
              active={brandFilter === b.key}
              onClick={() => setBrandFilter(b.key)}
            >
              {b.name}
            </FilterChip>
          ))}
        </div>
      </div>

      {/* 계급도 매트릭스 */}
      <div className="mt-4 -mx-3 overflow-x-auto px-3 sm:mx-0 sm:px-0">
        <table className="w-full border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="sticky left-0 z-20 min-w-[76px] border-b border-zinc-200 bg-white p-2 text-left text-xs font-bold text-zinc-500">
                등급
              </th>
              {visibleBrands.map((b) => (
                <th
                  key={b.key}
                  className="min-w-[128px] border-b border-zinc-200 bg-white p-2 text-center text-xs font-bold text-zinc-700"
                >
                  {b.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {GROUPS.map((group) => {
              const tiers = TIERS.filter((t) => t.group === group.key);
              return (
                <FragmentRows
                  key={group.key}
                  groupName={group.name}
                  colSpan={visibleBrands.length + 1}
                >
                  {tiers.map((tier) => (
                    <tr key={tier.key} className="align-top">
                      <th className="sticky left-0 z-10 border-b border-zinc-100 bg-zinc-50 p-2 text-left text-xs font-semibold text-zinc-600">
                        {tier.name}
                      </th>
                      {visibleBrands.map((b) => {
                        const cell = SHOES_BY_CELL[`${b.key}-${tier.key}`] ?? [];
                        return (
                          <td
                            key={b.key}
                            className="border-b border-l border-zinc-100 p-1.5"
                          >
                            <div className="flex flex-col gap-1">
                              {cell.length === 0 ? (
                                <span className="block px-1 text-center text-xs text-zinc-300">
                                  –
                                </span>
                              ) : (
                                cell.map((shoe) => (
                                  <ShoeChip
                                    key={shoe.id}
                                    shoe={shoe}
                                    onClick={() => setSelected(shoe)}
                                  />
                                ))
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </FragmentRows>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-zinc-400">
        ※ 등급 분류는 커뮤니티에서 공유된 러닝화 계급도(2025.02 기준)를 참고한
        것으로, 개인 취향·발 형태·용도에 따라 최적의 신발은 달라질 수 있습니다.
        가격은 참고용 대략 범위이며, 실제 최저가는 각 상품의 쿠팡 링크에서
        확인하세요.
      </p>

      <div className="mt-auto pt-10">
        <SiteFooter />
      </div>

      {selected && (
        <ShoeModal shoe={selected} onClose={() => setSelected(null)} />
      )}
    </main>
  );
}

// 그룹 헤더 행 + 그 그룹의 등급 행들을 함께 렌더한다.
function FragmentRows({
  groupName,
  colSpan,
  children,
}: {
  groupName: string;
  colSpan: number;
  children: React.ReactNode;
}) {
  return (
    <>
      <tr>
        <td
          colSpan={colSpan}
          className="sticky left-0 bg-indigo-600 px-3 py-1.5 text-xs font-bold tracking-wide text-white"
        >
          {groupName}
        </td>
      </tr>
      {children}
    </>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
        active
          ? "bg-indigo-600 text-white shadow-sm"
          : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
      }`}
    >
      {children}
    </button>
  );
}

// 러닝화 실루엣 아이콘 (저작권 없는 자체 SVG).
function SneakerIcon({ className = "" }: { className?: string }) {
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
function ShoeThumb({ shoe, className = "" }: { shoe: Shoe; className?: string }) {
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

function ShoeChip({ shoe, onClick }: { shoe: Shoe; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-1.5 py-1.5 text-left text-xs font-medium text-zinc-700 transition hover:border-indigo-300 hover:bg-indigo-50 active:scale-[0.98]"
    >
      <span className="relative shrink-0">
        <ShoeThumb shoe={shoe} className="h-7 w-7 rounded-md" />
        {shoe.badges.length > 0 && (
          <span className="absolute -right-1 -top-1 flex gap-0.5 rounded-full bg-white/95 px-0.5 py-px shadow-sm ring-1 ring-black/5">
            {shoe.badges.map((b) => (
              <span key={b} className={`h-1.5 w-1.5 rounded-full ${BADGE_DOT[b]}`} />
            ))}
          </span>
        )}
      </span>
      <span className="min-w-0 leading-tight group-hover:text-indigo-700">
        {shoe.name}
      </span>
    </button>
  );
}

function ShoeModal({ shoe, onClose }: { shoe: Shoe; onClose: () => void }) {
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
          href="/how-to-use"
          onClick={onClose}
          className="mt-2 block text-center text-xs font-medium text-indigo-500 underline underline-offset-2"
        >
          등급 기준이 궁금하다면 →
        </Link>
      </div>
    </div>
  );
}
