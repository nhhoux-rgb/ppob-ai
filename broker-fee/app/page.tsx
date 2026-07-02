"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import SiteFooter from "./site-footer";
import VisitorCount from "./visitor-count";
import SharePageButton from "./share-page-button";
import {
  calcFee,
  wolseBaseAmount,
  VAT_RATE,
  SALE_HOUSE_TABLE,
  RENT_HOUSE_TABLE,
  type DealType,
  type HouseType,
  type VatType,
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

const VAT_TABS: { key: VatType; label: string }[] = [
  { key: "none", label: "부가세 제외" },
  { key: "general", label: "일반과세 10%" },
  { key: "simple", label: "간이과세 4%" },
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
  const [vat, setVat] = useState<VatType>("none");
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

  const vatAmount = result ? Math.floor(result.fee * VAT_RATE[vat]) : 0;
  const total = result ? result.fee + vatAmount : 0;

  const priceLabel =
    deal === "sale" ? "매매가" : deal === "jeonse" ? "전세 보증금" : "";

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-8">
      <VisitorCount />

      <header className="text-center">
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900">
          복비 계산기
        </h1>
        <p className="mt-1.5 text-sm text-zinc-500">
          부동산 중개수수료를 법정 상한요율로 바로 계산해 드립니다.
        </p>
        <div className="mt-3 flex justify-center">
          <SharePageButton />
        </div>
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

      {house === "officetel" && (
        <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-700">
          전용면적 85㎡ 이하이면서 전용 입식부엌·욕실 등 주거용 요건을 갖춘
          오피스텔 기준입니다. 요건을 벗어나면 상가와 같은 협의 요율(0.9% 이내)이
          적용될 수 있습니다.
        </p>
      )}

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

      {/* 부가세 유형 */}
      <div className="mt-5">
        <span className="text-sm font-semibold text-zinc-700">부가가치세</span>
        <div className="mt-1.5 grid grid-cols-3 gap-1.5 rounded-2xl bg-zinc-100 p-1.5">
          {VAT_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setVat(t.key)}
              className={`rounded-xl py-2 text-xs font-semibold transition ${
                vat === t.key
                  ? "bg-white text-emerald-600 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 결과 */}
      {result ? (
        <section className="mt-6 overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-b from-emerald-50 to-white">
          <div className="px-6 pt-6 text-center">
            <p className="text-sm font-semibold text-emerald-700">
              예상 중개보수 상한{vat === "none" ? " (부가세 별도)" : " (부가세 포함)"}
            </p>
            <p className="mt-1 text-4xl font-extrabold tracking-tight text-emerald-600">
              {total.toLocaleString()}
              <span className="ml-1 text-2xl">원</span>
            </p>
            <p className="mt-1 text-sm text-zinc-500">{toKoreanMoney(total)}</p>
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
              label="중개보수 (부가세 별도)"
              value={`${result.fee.toLocaleString()}원`}
            />
            {vat !== "none" && (
              <Row
                label={`부가세 (${vat === "general" ? "10" : "4"}%)`}
                value={`${vatAmount.toLocaleString()}원`}
              />
            )}
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

      {/* 과세기준표 (요율표) */}
      <section className="mt-10">
        <h2 className="text-base font-bold text-zinc-900">
          주택 중개보수 요율표
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          「공인중개사법 시행규칙」 및 시·도 조례 기준 상한요율입니다.
        </p>

        <RateTable title="매매·교환" rows={SALE_HOUSE_TABLE} />
        <RateTable title="임대차 (전세·월세)" rows={RENT_HOUSE_TABLE} />

        <div className="mt-4 rounded-xl bg-zinc-50 px-4 py-3 text-xs leading-relaxed text-zinc-500">
          <p className="font-semibold text-zinc-700">오피스텔</p>
          <p className="mt-1">
            주거용 요건 충족 시 — 매매·교환 0.5%, 임대차 0.4% (한도액 없음). 그
            외 용도는 0.9% 이내에서 협의.
          </p>
          <p className="mt-2 font-semibold text-zinc-700">월세 거래금액 환산</p>
          <p className="mt-1">
            거래금액 = 보증금 + (월세 × 100). 이 금액이 5천만원 미만이면 월세 ×
            70으로 다시 계산합니다.
          </p>
        </div>

        <p className="mt-4 text-center text-xs text-zinc-400">
          더 자세한 설명은{" "}
          <Link
            href="/guide"
            className="font-semibold text-emerald-600 underline underline-offset-2"
          >
            복비 가이드
          </Link>
          에서 확인하세요.
        </p>
      </section>

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

function RateTable({
  title,
  rows,
}: {
  title: string;
  rows: { range: string; rate: string; cap: string }[];
}) {
  return (
    <div className="mt-4">
      <h3 className="mb-1.5 text-sm font-bold text-emerald-700">{title}</h3>
      <div className="overflow-hidden rounded-xl border border-zinc-200">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-zinc-50 text-zinc-500">
              <th className="px-3 py-2 text-left font-semibold">거래금액</th>
              <th className="px-3 py-2 text-right font-semibold">상한요율</th>
              <th className="px-3 py-2 text-right font-semibold">한도액</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {rows.map((r) => (
              <tr key={r.range}>
                <td className="px-3 py-2 text-zinc-700">{r.range}</td>
                <td className="px-3 py-2 text-right font-semibold tabular-nums text-zinc-800">
                  {r.rate}
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-zinc-500">
                  {r.cap}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
