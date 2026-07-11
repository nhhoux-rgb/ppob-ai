// 러닝화 추천 엔진 (규칙 기반).
//
// 사용자 입력(나이·몸무게·목적·경력·안정성·예산·선호브랜드)을 받아
// SHOES 데이터에 점수를 매기고 상위 추천을 돌려준다. 순수 함수라 테스트·수정이
// 쉽다. 등급별 매핑·가중치는 아래 상수만 고치면 조정된다.

import {
  SHOES,
  shoePriceValue,
  type BrandKey,
  type Shoe,
  type TierKey,
} from "./shoes";

export type Purpose = "daily" | "training" | "race";
export type RaceDist = "10k" | "half" | "full";
export type Level = "beginner" | "intermediate" | "advanced";
export type Stability = "neutral" | "support";
export type BudgetKey = "any" | "u13" | "13_17" | "17_22" | "22_28" | "28p";

export type RecoInput = {
  age?: number;
  weight?: number; // kg
  purpose: Purpose;
  raceDist?: RaceDist; // purpose === "race" 일 때만
  level: Level;
  stability: Stability;
  budget: BudgetKey;
  brands: BrandKey[]; // 비어 있으면 브랜드 무관
};

export type Reco = { shoe: Shoe; score: number; reasons: string[] };

// 예산 구간 → 상한가(원). null 이면 상한 없음.
export const BUDGETS: { key: BudgetKey; label: string; max: number | null }[] = [
  { key: "any", label: "상관없음", max: null },
  { key: "u13", label: "13만원 이하", max: 140000 },
  { key: "13_17", label: "13~17만원", max: 180000 },
  { key: "17_22", label: "17~22만원", max: 235000 },
  { key: "22_28", label: "22~28만원", max: 295000 },
  { key: "28p", label: "28만원 이상", max: null },
];

// 목적(+대회 거리) → 우선/차선 등급.
const TARGETS: Record<string, { primary: TierKey[]; secondary: TierKey[] }> = {
  daily: {
    primary: ["entry", "maxCushion", "allrounder"],
    secondary: ["stability", "lightTrainer"],
  },
  training: {
    primary: ["nonPlate", "lightPlate", "allrounder"],
    secondary: ["carbonPlate", "lightTrainer", "maxCushion"],
  },
  race_10k: {
    primary: ["midRace", "carbonPlate"],
    secondary: ["lightPlate"],
  },
  race_half: {
    primary: ["longRace", "carbonPlate"],
    secondary: ["lightPlate", "midRace"],
  },
  race_full: {
    primary: ["longRace"],
    secondary: ["carbonPlate"],
  },
};

function targetKey(input: RecoInput): string {
  if (input.purpose === "race") return `race_${input.raceDist ?? "half"}`;
  return input.purpose;
}

function purposeReason(input: RecoInput): string {
  if (input.purpose === "daily") return "데일리 러닝에 맞는 등급";
  if (input.purpose === "training") return "훈련용으로 적합한 등급";
  const d = input.raceDist;
  if (d === "10k") return "10K 레이스용 스피드화";
  if (d === "full") return "풀코스 마라톤 기록용";
  return "하프 마라톤 기록용";
}

const RACER: TierKey[] = ["midRace", "longRace"];

function scoreShoe(shoe: Shoe, input: RecoInput): Reco {
  const reasons: string[] = [];
  const tier = shoe.tier;
  const t = TARGETS[targetKey(input)];
  let score = 0;

  // 1) 목적/등급 매칭 (가장 큰 비중)
  if (t.primary.includes(tier)) {
    score += 50;
    reasons.push(purposeReason(input));
  } else if (t.secondary.includes(tier)) {
    score += 25;
  } else {
    score -= 25;
  }

  // 2) 러닝 경력
  if (input.level === "beginner") {
    if (["entry", "maxCushion", "allrounder", "stability"].includes(tier)) {
      score += 15;
      reasons.push("입문자가 신기 편한 쿠션");
    }
    if (RACER.includes(tier)) score -= 18; // 입문자에겐 과한 레이싱화
  } else if (input.level === "advanced") {
    if (RACER.includes(tier) || tier === "carbonPlate") score += 12;
  } else {
    if (
      ["allrounder", "nonPlate", "lightPlate", "stability", "maxCushion"].includes(
        tier,
      )
    )
      score += 8;
  }

  // 3) 몸무게 → 쿠션/안정성
  if (input.weight && input.weight >= 80) {
    if (["maxCushion", "stability"].includes(tier)) {
      score += 15;
      reasons.push("체중을 받쳐주는 넉넉한 쿠션");
    }
    if (RACER.includes(tier)) score -= 8;
  } else if (input.weight && input.weight <= 58) {
    if (["lightTrainer", "midRace", "longRace"].includes(tier)) score += 5;
  }

  // 4) 안정성(과내전) 필요
  if (input.stability === "support") {
    if (tier === "stability") {
      score += 30;
      reasons.push("과내전을 잡아주는 안정화");
    } else {
      score -= 6;
    }
  }

  // 5) 나이 (참고 수준)
  if (input.age && input.age >= 50) {
    if (["maxCushion", "stability", "entry"].includes(tier)) score += 6;
  }

  // 6) 선호 브랜드
  if (input.brands.length) {
    if (input.brands.includes(shoe.brand)) {
      score += 20;
      reasons.push("선호 브랜드");
    } else {
      score -= 40;
    }
  }

  // 7) 예산
  const budget = BUDGETS.find((b) => b.key === input.budget);
  if (budget && budget.max != null) {
    const price = shoePriceValue(shoe);
    if (price <= budget.max) {
      score += 12;
      reasons.push("예산 범위 내");
    } else {
      const over = Math.ceil((price - budget.max) / 10000);
      score -= Math.min(30, over * 3);
    }
  }

  // 8) 뱃지 타이브레이커
  if (shoe.badges.includes("pick")) {
    score += 5;
    reasons.push("런갤러 선호 픽");
  }
  if (shoe.badges.includes("great")) score += 3;
  if (shoe.badges.includes("new")) score += 1;

  return { shoe, score, reasons: [...new Set(reasons)].slice(0, 4) };
}

// 상위 추천 반환. 기본 3개.
export function recommend(input: RecoInput, count = 3): Reco[] {
  return SHOES.map((s) => scoreShoe(s, input))
    .sort((a, b) => b.score - a.score)
    .slice(0, count);
}
