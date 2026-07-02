// 부동산 중개보수(복비) 계산 로직.
//
// 근거: 「공인중개사법 시행규칙」 별표(주택 중개보수 상한요율) 및
// 각 시·도 조례의 표준 요율(2021.10 개정 이후 현재까지 유지).
// 여기 값은 "상한요율"이며 실제 보수는 상한 안에서 협의로 정한다.

export type DealType = "sale" | "jeonse" | "wolse";
export type HouseType = "house" | "officetel";

type Bracket = {
  // 이 구간의 상한 금액(원, "미만" 기준). Infinity면 그 이상 전부.
  upTo: number;
  rate: number;
  // 한도액(원). null이면 한도 없음.
  cap: number | null;
};

// 주택 — 매매·교환
const SALE_HOUSE: Bracket[] = [
  { upTo: 50_000_000, rate: 0.006, cap: 250_000 },
  { upTo: 200_000_000, rate: 0.005, cap: 800_000 },
  { upTo: 900_000_000, rate: 0.004, cap: null },
  { upTo: 1_200_000_000, rate: 0.005, cap: null },
  { upTo: 1_500_000_000, rate: 0.006, cap: null },
  { upTo: Infinity, rate: 0.007, cap: null },
];

// 주택 — 임대차(전세·월세)
const RENT_HOUSE: Bracket[] = [
  { upTo: 50_000_000, rate: 0.005, cap: 200_000 },
  { upTo: 100_000_000, rate: 0.004, cap: 300_000 },
  { upTo: 600_000_000, rate: 0.003, cap: null },
  { upTo: 1_200_000_000, rate: 0.004, cap: null },
  { upTo: 1_500_000_000, rate: 0.005, cap: null },
  { upTo: Infinity, rate: 0.006, cap: null },
];

// 오피스텔(85㎡ 이하·전용 입식부엌 등 주거 요건 충족) — 구간 없이 단일 요율, 한도액 없음.
const OFFICETEL_SALE_RATE = 0.005;
const OFFICETEL_RENT_RATE = 0.004;

/**
 * 월세 거래금액 환산.
 * 거래금액 = 보증금 + (월세 × 100).
 * 단, 이렇게 산정한 금액이 5천만원 미만이면 월세 × 70으로 다시 계산한다.
 */
export function wolseBaseAmount(deposit: number, monthly: number): number {
  const base = deposit + monthly * 100;
  if (base < 50_000_000) return deposit + monthly * 70;
  return base;
}

export type FeeResult = {
  // 요율이 적용되는 거래금액(원)
  baseAmount: number;
  // 적용 상한요율 (예: 0.004)
  rate: number;
  // 적용 한도액(원) 또는 null
  cap: number | null;
  // 한도액에 걸려 깎였는지 여부
  capped: boolean;
  // 부가세 제외 상한 중개보수(원)
  fee: number;
  // 부가세(10%) 포함 예상액(원) — 일반과세 중개사무소 기준
  feeWithVat: number;
};

export function calcFee(
  dealType: DealType,
  houseType: HouseType,
  baseAmount: number,
): FeeResult {
  let rate: number;
  let cap: number | null = null;

  if (houseType === "officetel") {
    rate = dealType === "sale" ? OFFICETEL_SALE_RATE : OFFICETEL_RENT_RATE;
  } else {
    const table = dealType === "sale" ? SALE_HOUSE : RENT_HOUSE;
    const bracket = table.find((b) => baseAmount < b.upTo) ?? table[table.length - 1]!;
    rate = bracket.rate;
    cap = bracket.cap;
  }

  const raw = Math.floor(baseAmount * rate);
  const capped = cap !== null && raw > cap;
  const fee = capped ? cap! : raw;

  return {
    baseAmount,
    rate,
    cap,
    capped,
    fee,
    feeWithVat: Math.floor(fee * 1.1),
  };
}
