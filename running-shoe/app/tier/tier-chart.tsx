"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BRANDS,
  GROUPS,
  TIERS,
  SHOES,
  BADGES,
  type BadgeKey,
  type BrandKey,
  type Shoe,
} from "../shoes";
import { BADGE_DOT, ShoeThumb, ShoeModal } from "../shoe-ui";

// brand+tier → 해당 칸의 신발 목록.
const SHOES_BY_CELL = SHOES.reduce<Record<string, Shoe[]>>((acc, s) => {
  (acc[`${s.brand}-${s.tier}`] ??= []).push(s);
  return acc;
}, {});

export default function TierChart() {
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
    <>
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

      <div className="mt-6 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700"
        >
          내게 맞는 러닝화 추천받기 →
        </Link>
      </div>

      {selected && (
        <ShoeModal shoe={selected} onClose={() => setSelected(null)} />
      )}
    </>
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
