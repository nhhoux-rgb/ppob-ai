import { useMemo, useState } from "react";
import {
  calcFee,
  wolseBaseAmount,
  VAT_RATE,
  type DealType,
  type HouseType,
  type VatType,
} from "./fee";

const won = (n: number) => `${Math.round(n).toLocaleString()}원`;

// 원 단위 금액을 "3억 5,000만원"처럼 읽기 좋게 변환.
function koreanMoney(n: number): string {
  if (!n) return "0원";
  const eok = Math.floor(n / 100_000_000);
  const man = Math.floor((n % 100_000_000) / 10_000);
  const parts: string[] = [];
  if (eok) parts.push(`${eok.toLocaleString()}억`);
  if (man) parts.push(`${man.toLocaleString()}만`);
  if (!eok && !man) return won(n);
  return parts.join(" ") + "원";
}

const DEAL_OPTIONS: { value: DealType; label: string }[] = [
  { value: "sale", label: "매매·교환" },
  { value: "jeonse", label: "전세" },
  { value: "wolse", label: "월세" },
];

const HOUSE_OPTIONS: { value: HouseType; label: string }[] = [
  { value: "house", label: "주택" },
  { value: "officetel", label: "오피스텔" },
  { value: "commercial", label: "상가·사무실" },
];

const VAT_OPTIONS: { value: VatType; label: string; hint: string }[] = [
  { value: "none", label: "안 냄", hint: "0%" },
  { value: "general", label: "일반과세", hint: "+10%" },
  { value: "simple", label: "간이과세", hint: "+4%" },
];

// 만원 단위 입력 필드.
function ManInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const won = Number(value.replace(/[^0-9]/g, "")) * 10_000;
  return (
    <div className="field">
      <div className="label">{label}</div>
      <div className="inputbox">
        <input
          type="number"
          inputMode="numeric"
          min={0}
          step={100}
          placeholder={placeholder ?? "0"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <span>만원</span>
      </div>
      {won > 0 && <div className="hint">= {koreanMoney(won)}</div>}
    </div>
  );
}

export default function App() {
  const [deal, setDeal] = useState<DealType>("sale");
  const [house, setHouse] = useState<HouseType>("house");
  const [vat, setVat] = useState<VatType>("none");

  // 만원 단위 문자열 상태
  const [price, setPrice] = useState(""); // 매매가 / 전세보증금
  const [deposit, setDeposit] = useState(""); // 월세 보증금
  const [monthly, setMonthly] = useState(""); // 월세

  const priceWon = Number(price.replace(/[^0-9]/g, "")) * 10_000;
  const depositWon = Number(deposit.replace(/[^0-9]/g, "")) * 10_000;
  const monthlyWon = Number(monthly.replace(/[^0-9]/g, "")) * 10_000;

  const baseAmount = useMemo(() => {
    if (deal === "wolse") return wolseBaseAmount(depositWon, monthlyWon);
    return priceWon;
  }, [deal, priceWon, depositWon, monthlyWon]);

  const hasInput = baseAmount > 0;
  const result = useMemo(
    () => (hasInput ? calcFee(deal, house, baseAmount) : null),
    [deal, house, baseAmount, hasInput],
  );

  const vatRate = VAT_RATE[vat];
  const vatAmount = result ? Math.floor(result.fee * vatRate) : 0;
  const total = result ? result.fee + vatAmount : 0;

  return (
    <div className="wrap">
      <header className="header">
        <span className="brand">복비계산기</span>
        <span className="badge">부동산</span>
      </header>

      <h1 className="title">부동산 복비, 얼마 내야 할까?</h1>
      <p className="sub">
        거래 정보를 입력하면 법정 상한 기준 중개보수를 계산해 드려요.
      </p>

      {/* 거래유형 */}
      <div className="seglabel">거래 유형</div>
      <div className="seg seg-3">
        {DEAL_OPTIONS.map((o) => (
          <button
            key={o.value}
            className={deal === o.value ? "on" : ""}
            onClick={() => setDeal(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>

      {/* 대상물 */}
      <div className="seglabel">중개 대상물</div>
      <div className="seg seg-3">
        {HOUSE_OPTIONS.map((o) => (
          <button
            key={o.value}
            className={house === o.value ? "on" : ""}
            onClick={() => setHouse(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>

      {/* 금액 입력 */}
      {deal === "wolse" ? (
        <>
          <ManInput label="보증금" value={deposit} onChange={setDeposit} />
          <ManInput label="월세" value={monthly} onChange={setMonthly} />
        </>
      ) : (
        <ManInput
          label={deal === "sale" ? "매매가" : "전세 보증금"}
          value={price}
          onChange={setPrice}
        />
      )}

      {/* 부가세 */}
      <div className="seglabel">
        부가세 <span className="seglabel-sub">(중개사무소 과세 유형)</span>
      </div>
      <div className="seg seg-3">
        {VAT_OPTIONS.map((o) => (
          <button
            key={o.value}
            className={vat === o.value ? "on" : ""}
            onClick={() => setVat(o.value)}
          >
            {o.label}
            <em>{o.hint}</em>
          </button>
        ))}
      </div>

      {/* 결과 */}
      {result ? (
        <section className="card">
          <div className="card-top">
            <div className="muted">상한 중개보수 (부가세 포함)</div>
            <div className="total">{won(total)}</div>
            <div className="muted-sm">
              이 금액 <b>이내</b>에서 협의로 정해요
            </div>
          </div>

          <div className="rows">
            <Row
              k="거래금액"
              v={koreanMoney(result.baseAmount)}
              sub={deal === "wolse" ? "보증금 + 월세×100 환산" : undefined}
            />
            <Row k="적용 상한요율" v={`${(result.rate * 100).toFixed(1)}%`} />
            <Row
              k="한도액"
              v={result.cap ? won(result.cap) : "없음"}
              sub={result.capped ? "한도액 적용됨" : undefined}
            />
            <Row k="중개보수 (부가세 제외)" v={won(result.fee)} />
            <Row
              k={`부가세 ${vatRate ? `(${(vatRate * 100).toFixed(0)}%)` : ""}`}
              v={vatAmount ? won(vatAmount) : "0원"}
            />
            <Row k="합계" v={won(total)} strong />
          </div>
        </section>
      ) : (
        <div className="empty">금액을 입력하면 복비가 계산돼요</div>
      )}

      <footer className="foot">
        「공인중개사법 시행규칙」 및 시·도 조례상 <b>상한요율</b> 기준입니다.
        실제 중개보수는 상한 내에서 개업공인중개사와 협의로 정해지며, 지역·조건에
        따라 달라질 수 있어요. 참고용으로만 활용하세요.
      </footer>
    </div>
  );
}

function Row({
  k,
  v,
  sub,
  strong,
}: {
  k: string;
  v: string;
  sub?: string;
  strong?: boolean;
}) {
  return (
    <div className={`row ${strong ? "row-strong" : ""}`}>
      <div className="row-k">
        {k}
        {sub && <span className="row-sub">{sub}</span>}
      </div>
      <div className="row-v">{v}</div>
    </div>
  );
}
