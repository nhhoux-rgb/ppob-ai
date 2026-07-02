"use client";

import { useMemo, useState } from "react";
import SiteFooter from "./site-footer";
import {
  calcFee,
  wolseBaseAmount,
  type DealType,
  type HouseType,
} from "./fee";

const DEAL_TABS: { key: DealType; label: string }[] = [
  { key: "sale", label: "매매" },
  { key: "jeonse", label: "전세" },
  { key: "wolse", label: "월세" },
];

const HOUSE_TABS: { key: HouseType; label: string }[] = [
  { key: "house", label: "주택" },
  { key: "officetel", label: "오피스텔" },
];

// 원 단위 정수를 "5억 3,000만원"처럼 사람이 읽는 한글 금액으로.
function toKoreanMoney(won: number): string {
  if (won <= 0) return "0원";
  const eok = Math.floor(won / 100_000_000);
  const man = Math.floor((won % 100_000_000) / 10_000);
  const rest = won % 10_000;
  const parts: string[] = [];
  if (eok) parts.push(`${eok.toLocaleString()}억`);
  if (man) parts.push(`${man.toLocaleString()}만`);
  if (rest) parts.push(`${rest.toLocaleString()}`);
  return parts.length ? `${parts.join(" ")}원` : "0원";
}

// 만원 단위 입력 문자열 → 원 단위 정수.
function manToWon(input: string): number {
  const n = Number(input.replace(/,/g, "").trim());
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n) * 10_000;
}

// 입력창: 만원 단위, 천단위 콤마 표시.
function MoneyInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const won = manToWon(value);
  return (
    <label className="block">
      <span className="text-sm font-semibold text-zinc-700">{label}</span>
      <div className="mt-1.5 flex items-center rounded-xl border border-zinc-300 bg-white focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100">
        <input
          inputMode="numeric"
          value={value}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^\d]/g, "");
            onChange(raw ? Number(raw).toLocaleString() : "");
          }}
          placeholder={placeholder}
          className="w-full rounded-xl bg-transparent px-3.5 py-3 text-right text-lg font-semibold tabular-nums outline-none"
        />
        <span className="pr-3.5 text-sm font-medium text-zinc-400">만원</span>
      </div>
      <span className="mt-1 block h-4 text-right text-xs text-emerald-600">
        {won > 0 ? toKoreanMoney(won) : ""}
      </span>
    </label>
  );
}

export default function Home() {
  const [deal, setDeal] = useState<DealType>("sale");
  const [house, setHouse] = useState<HouseType>("house");
  const [price, setPrice] = useState(""); // 매매가/전세보증금 (만원)
  const [deposit, setDeposit] = useState(""); // 월세 보증금 (만원)
  const [monthly, setMonthly] = useState(""); // 월세 (만원)

  const result = useMemo(() => {
    const baseAmount =
      deal === "wolse"
        ? wolseBaseAmount(manToWon(deposit), manToWon(monthly))
        : manToWon(price);
    if (baseAmount <= 0) return null;
    return calcFee(deal, house, baseAmount);
  }, [deal, house, price, deposit, monthly]);

  const priceLabel =
    deal === "sale" ? "매매가" : deal === "jeonse" ? "전세 보증금" : "";

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-8">
      <header className="text-center">
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900">
          복비 계산기
        </h1>
        <p className="mt-1.5 text-sm text-zinc-500">
          부동산 중개수수료를 법정 상한요율로 바로 계산해 드립니다.
        </p>
      </header>

      {/* 거래 유형 탭 */}
      <div className="mt-6 grid grid-cols-3 gap-1.5 rounded-2xl bg-zinc-100 p-1.5">
        {DEAL_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setDeal(t.key)}
            className={`rounded-xl py-2.5 text-sm font-bold transition ${
              deal === t.key
                ? "bg-white text-emerald-600 shadow-sm"
                : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 주택 / 오피스텔 */}
      <div className="mt-3 grid grid-cols-2 gap-1.5 rounded-2xl bg-zinc-100 p-1.5">
        {HOUSE_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setHouse(t.key)}
            className={`rounded-xl py-2 text-sm font-semibold transition ${
              house === t.key
                ? "bg-white text-emerald-600 shadow-sm"
                : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 입력 */}
      <div className="mt-5 space-y-4">
        {deal === "wolse" ? (
          <>
            <MoneyInput
              label="보증금"
              value={deposit}
              onChange={setDeposit}
              placeholder="예: 1,000"
            />
            <MoneyInput
              label="월세"
              value={monthly}
              onChange={setMonthly}
              placeholder="예: 50"
            />
          </>
        ) : (
          <MoneyInput
            label={priceLabel}
            value={price}
            onChange={setPrice}
            placeholder="예: 50,000"
          />
        )}
      </div>

      {/* 결과 */}
      {result ? (
        <section className="mt-6 overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-b from-emerald-50 to-white">
          <div className="px-6 pt-6 text-center">
            <p className="text-sm font-semibold text-emerald-700">
              상한 중개보수 (부가세 별도)
            </p>
            <p className="mt-1 text-4xl font-extrabold tracking-tight text-emerald-600">
              {result.fee.toLocaleString()}
              <span className="ml-1 text-2xl">원</span>
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              {toKoreanMoney(result.fee)}
            </p>
          </div>

          <dl className="mt-5 divide-y divide-zinc-100 border-t border-zinc-100 bg-white text-sm">
            <Row label="거래금액" value={toKoreanMoney(result.baseAmount)} />
            <Row
              label="적용 상한요율"
              value={`${(result.rate * 100).toFixed(1).replace(/\.0$/, "")}%`}
            />
            <Row
              label="한도액"
              value={
                result.cap !== null
                  ? `${result.cap.toLocaleString()}원${
                      result.capped ? " (적용됨)" : ""
                    }`
                  : "없음"
              }
            />
            <Row
              label="부가세 10% 포함"
              value={`${result.feeWithVat.toLocaleString()}원`}
              strong
            />
          </dl>

          <p className="px-6 py-4 text-xs leading-relaxed text-zinc-400">
            법정 상한 기준 금액입니다. 실제 중개보수는 상한 안에서 협의로
            정하며, 부가가치세는 중개사무소 과세 유형(일반/간이)에 따라 달라질
            수 있습니다.
          </p>
        </section>
      ) : (
        <p className="mt-8 text-center text-sm text-zinc-400">
          금액을 입력하면 예상 복비가 표시됩니다.
        </p>
      )}

      <div className="mt-auto pt-10">
        <SiteFooter />
      </div>
    </main>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-6 py-3">
      <dt className="text-zinc-500">{label}</dt>
      <dd
        className={`tabular-nums ${
          strong ? "font-bold text-zinc-900" : "font-semibold text-zinc-700"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
