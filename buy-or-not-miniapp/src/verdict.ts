/**
 * 살까 말까 판독기 — 판정 엔진.
 *
 * 외부 의존성이 없는 순수 함수다. 같은 입력이면 언제나 같은 결과가 나와야
 * 한다. 승인번호까지 입력에서 뽑아내는 이유가 그것이다. 결과를 공유한 사람이
 * 다시 눌렀을 때 숫자가 달라지면 판독기가 아니라 룰렛이 된다.
 *
 * 화면(App.tsx)은 이 파일이 돌려준 값을 배치만 한다. 문구를 고칠 일이 있으면
 * 여기서 고치고 `npm run verify` 로 성질(범위·단조성·결정성)을 다시 확인한다.
 */

export type Freq = "daily" | "weekly" | "monthly" | "rarely";
export type Dupe = "none" | "worn" | "few" | "many";
export type Drunk = "sober" | "buzzed" | "drunk" | "dawn";

export interface Answers {
  price: number;
  item: string;
  freq: Freq;
  dupe: Dupe;
  drunk: Drunk;
}

export type Tier = "approved_plus" | "approved" | "conditional" | "hold" | "denied";

export interface Verdict {
  /** 화면 상단 도장에 찍히는 두 글자 */
  stamp: string;
  tier: Tier;
  /** 소비 승인율 (%) — 판정 등급을 가르는 값 */
  approval: number;
  /** 핑계 수준 S~F */
  excuse: string;
  excuseScore: number;
  excuseNote: string;
  /** 내일 후회 확률 (%) */
  regret: number;
  /** 영수증 본문에 찍히는 계산 */
  days: number;
  uses: number;
  perDay: number;
  perUse: number;
  lifeLabel: string;
  /** 이상한 논리 네 줄 */
  lines: string[];
  /** 최종 선고 한 줄 */
  sentence: string;
  /** 결정론적 승인번호 */
  approvalNo: string;
}

/* ── 문항 ──────────────────────────────────────────────────────────── */

export const FREQ_Q = "몇 번 쓸 것 같아?";
export const DUPE_Q = "이미 비슷한 거 있어?";
export const DRUNK_Q = "지금 술 마셨어?";

export const FREQ_OPTIONS: { v: Freq; label: string; sub: string }[] = [
  { v: "daily", label: "거의 매일 쓴다", sub: "손에 붙어 산다" },
  { v: "weekly", label: "일주일에 두세 번", sub: "생활에는 들어온다" },
  { v: "monthly", label: "한 달에 한두 번", sub: "가끔 생각난다" },
  { v: "rarely", label: "솔직히 한두 번", sub: "사는 순간이 절정이다" },
];

export const DUPE_OPTIONS: { v: Dupe; label: string; sub: string }[] = [
  { v: "none", label: "하나도 없다", sub: "정말 없는 게 맞나" },
  { v: "worn", label: "하나 있는데 낡았다", sub: "교체할 때가 됐다" },
  { v: "few", label: "두세 개 있다", sub: "이미 모으는 중이다" },
  { v: "many", label: "네 개 넘게 있다", sub: "세어 보긴 했다" },
];

export const DRUNK_OPTIONS: { v: Drunk; label: string; sub: string }[] = [
  { v: "sober", label: "맨정신이다", sub: "판단력 정상" },
  { v: "buzzed", label: "한두 잔 했다", sub: "기분은 좋다" },
  { v: "drunk", label: "많이 마셨다", sub: "손가락이 빠르다" },
  { v: "dawn", label: "새벽 3시고 안 잤다", sub: "술보다 위험하다" },
];

/* ── 계수 ──────────────────────────────────────────────────────────── */

/** 빈도별 예상 수명과 총 사용 횟수. 하루당·1회당 계산의 분모가 된다. */
const LIFE: Record<Freq, { days: number; uses: number; label: string; keep: string }> = {
  daily: { days: 730, uses: 600, label: "2년", keep: "2년 쓰면" },
  weekly: { days: 1095, uses: 360, label: "3년", keep: "3년 쓰면" },
  monthly: { days: 1460, uses: 72, label: "4년", keep: "4년 쓰면" },
  // 두 번 쓰고 말 물건에 "1년 쓰면"이라고 하면 그 자체가 거짓말이 된다
  rarely: { days: 365, uses: 2, label: "1년", keep: "1년 갖고 있는 걸로 치면" },
};

/** 하루당 비용 구간. 아래로 갈수록 "하루 얼마" 논리가 안 먹힌다. */
const PER_DAY_BANDS = [300, 1000, 3000, 7000, 15000] as const;

/** 구간별 가중치 — 앞에서부터 300원 미만, 1000원 미만 ... 15000원 이상.
    구간 사이의 낙차(최대 9)가 사용 빈도 한 칸의 차이보다 작아야 한다.
    안 그러면 "가끔 쓴다"로 답을 바꿨을 때 하루당 금액이 낮아지는 바람에
    판정이 오히려 후해진다. scripts/verify.mts 가 그걸 잡는다. */
const W_PER_DAY_APPROVAL = [15, 10, 3, -6, -12, -19];
const W_PER_DAY_REGRET = [-9, -4, 2, 7, 13, 18];
const W_PER_DAY_EXCUSE = [32, 24, 12, 0, -10, -18];

/** 절대 금액 구간 — 하루당으로 나눠도 지워지지 않는 부담 */
const PRICE_BANDS = [30_000, 100_000, 300_000, 1_000_000] as const;
const W_PRICE_APPROVAL = [5, 2, -2, -7, -13];
const W_PRICE_REGRET = [-5, -2, 2, 4, 7];

const W_FREQ_APPROVAL: Record<Freq, number> = { daily: 18, weekly: 9, monthly: -6, rarely: -22 };
const W_FREQ_REGRET: Record<Freq, number> = { daily: -16, weekly: -7, monthly: 7, rarely: 20 };
const W_FREQ_EXCUSE: Record<Freq, number> = { daily: 14, weekly: 8, monthly: -4, rarely: -12 };

const W_DUPE_APPROVAL: Record<Dupe, number> = { none: 9, worn: 5, few: -12, many: -25 };
const W_DUPE_REGRET: Record<Dupe, number> = { none: -5, worn: 0, few: 11, many: 22 };
const W_DUPE_EXCUSE: Record<Dupe, number> = { none: 4, worn: 10, few: -10, many: -18 };

const W_DRUNK_APPROVAL: Record<Drunk, number> = { sober: 6, buzzed: 0, drunk: -12, dawn: -19 };
const W_DRUNK_REGRET: Record<Drunk, number> = { sober: 0, buzzed: 11, drunk: 26, dawn: 37 };
/** 술은 판정에는 불리하지만 핑계는 유창하게 만든다. 그게 이 앱의 농담이다. */
const W_DRUNK_EXCUSE: Record<Drunk, number> = { sober: 0, buzzed: 7, drunk: 14, dawn: 18 };

/** 기준점. 239,000원짜리를 매일 신고, 비슷한 게 없고, 맨정신이면 87%가 나온다.
    여기를 건드리면 판정 전체가 같이 움직인다. 너무 올리면 뭘 넣어도 승인하는
    기계가 되고, 너무 내리면 판독기가 아니라 잔소리가 된다. */
const APPROVAL_BASE = 46;
const REGRET_BASE = 38;
const EXCUSE_BASE = 40;

/** 0%·100% 는 쓰지 않는다. 판독기도 확신은 못 한다. */
const APPROVAL_RANGE = [3, 97] as const;
const REGRET_RANGE = [4, 96] as const;

/* ── 앵커 ──────────────────────────────────────────────────────────── */

/** 하루당 비용을 견줄 일상 물가. 값이 오르는 순서를 지켜야 한다. */
const ANCHORS: { v: number; n: string }[] = [
  { v: 500, n: "자판기 종이컵 커피" },
  { v: 1000, n: "붕어빵 한 개" },
  { v: 1500, n: "편의점 삼각김밥" },
  { v: 2500, n: "편의점 캔커피" },
  { v: 4500, n: "카페 아메리카노" },
  { v: 9000, n: "점심 한 끼" },
  { v: 14000, n: "배달비 붙은 국밥" },
  { v: 25000, n: "치킨 한 마리" },
  { v: 45000, n: "둘이 먹는 삼겹살" },
  { v: 80000, n: "심야 택시 귀가" },
  { v: 150000, n: "호텔 조식 뷔페" },
];

/* ── 도구 ──────────────────────────────────────────────────────────── */

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** 구간 배열에서 값이 속한 칸의 번호. 가중치 배열은 구간보다 하나 길다. */
function band(value: number, edges: readonly number[]): number {
  for (let i = 0; i < edges.length; i += 1) if (value < edges[i]) return i;
  return edges.length;
}

export const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;

/** 입력에서 뽑는 승인번호. 같은 입력이면 같은 번호가 나온다. */
function approvalNo(a: Answers): string {
  const seed = `${Math.round(a.price)}|${a.freq}|${a.dupe}|${a.drunk}|${a.item.trim()}`;
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const n = (h >>> 0).toString().padStart(10, "0").slice(-10);
  return `${n.slice(0, 4)}-${n.slice(4, 7)}-${n.slice(7)}`;
}

const EXCUSE_GRADES: { min: number; g: string; note: string }[] = [
  { min: 88, g: "S", note: "판사도 설득된다" },
  { min: 74, g: "A", note: "친구는 넘어간다" },
  { min: 58, g: "B", note: "본인만 납득한다" },
  { min: 40, g: "C", note: "말하다 목소리가 작아진다" },
  { min: 24, g: "D", note: "말을 꺼내지 않는 편이 낫다" },
  { min: 0, g: "F", note: "핑계가 아니라 자백이다" },
];

/* ── 판정 ──────────────────────────────────────────────────────────── */

export function judge(a: Answers): Verdict {
  const price = Math.max(0, Math.round(a.price));
  const life = LIFE[a.freq];
  const perDay = price / life.days;
  const perUse = price / life.uses;

  const pdb = band(perDay, PER_DAY_BANDS);
  const pb = band(price, PRICE_BANDS);

  const approval = clamp(
    APPROVAL_BASE +
      W_FREQ_APPROVAL[a.freq] +
      W_DUPE_APPROVAL[a.dupe] +
      W_DRUNK_APPROVAL[a.drunk] +
      W_PER_DAY_APPROVAL[pdb] +
      W_PRICE_APPROVAL[pb],
    APPROVAL_RANGE[0],
    APPROVAL_RANGE[1]
  );

  const regret = clamp(
    REGRET_BASE +
      W_FREQ_REGRET[a.freq] +
      W_DUPE_REGRET[a.dupe] +
      W_DRUNK_REGRET[a.drunk] +
      W_PER_DAY_REGRET[pdb] +
      W_PRICE_REGRET[pb],
    REGRET_RANGE[0],
    REGRET_RANGE[1]
  );

  const excuseScore = clamp(
    EXCUSE_BASE +
      W_FREQ_EXCUSE[a.freq] +
      W_DUPE_EXCUSE[a.dupe] +
      W_DRUNK_EXCUSE[a.drunk] +
      W_PER_DAY_EXCUSE[pdb],
    0,
    100
  );
  const grade = EXCUSE_GRADES.find((g) => excuseScore >= g.min)!;

  const tier: Tier =
    approval >= 82
      ? "approved_plus"
      : approval >= 66
        ? "approved"
        : approval >= 50
          ? "conditional"
          : approval >= 34
            ? "hold"
            : "denied";

  const stamp =
    tier === "approved_plus" || tier === "approved"
      ? "승인"
      : tier === "conditional"
        ? "보류"
        : tier === "hold"
          ? "재고"
          : "반려";

  return {
    stamp,
    tier,
    approval,
    excuse: grade.g,
    excuseScore,
    excuseNote: grade.note,
    regret,
    days: life.days,
    uses: life.uses,
    perDay,
    perUse,
    lifeLabel: life.label,
    lines: lines(a, { perDay, perUse, life }),
    sentence: SENTENCE[tier],
    approvalNo: approvalNo(a),
  };
}

const SENTENCE: Record<Tier, string> = {
  approved_plus:
    "사십시오. 이 정도 계산이면 안 사는 쪽이 손해입니다. 본 판독기는 책임지지 않습니다.",
  approved: "사도 됩니다. 다만 오늘 잘 산 물건이라고 남에게 세 번 이상 말하지 마십시오.",
  conditional:
    "장바구니에 담고 24시간 뒤에 다시 오십시오. 그때도 사고 싶으면 그건 진짜입니다.",
  hold: "지금은 아닙니다. 이 물건이 아니라 지금의 기분을 사려는 중입니다.",
  denied: "반려합니다. 결제창을 닫고 물을 한 잔 드십시오.",
};

function lines(
  a: Answers,
  m: { perDay: number; perUse: number; life: (typeof LIFE)[Freq] }
): string[] {
  const out: string[] = [];

  /* 1. 하루당으로 나눈 뒤 일상 물가에 견준다. 이 앱의 본체다. */
  const cheaper = ANCHORS.find((x) => x.v > m.perDay);
  const top = ANCHORS[ANCHORS.length - 1];
  out.push(
    cheaper
      ? `${m.life.keep} 하루 ${won(m.perDay)}입니다. ${cheaper.n}(${won(cheaper.v)})보다 쌉니다.`
      : `${m.life.keep} 하루 ${won(m.perDay)}입니다. 그래도 ${top.n}(${won(top.v)})를 매일 하는 것보다 비쌉니다.`
  );

  /* 2. 그 나눗셈이 정당한지 되묻는다. 가끔 쓸 물건을 하루로 나누는 건 반칙이다. */
  out.push(
    a.freq === "rarely"
      ? `그런데 한두 번 쓰신다면서요. 하루로 나누는 건 반칙입니다. 1회당 ${won(m.perUse)}입니다.`
      : a.freq === "monthly"
        ? `단, 한 달에 한두 번이면 하루로 나눌 자격이 없습니다. 1회당 ${won(m.perUse)}입니다.`
        : `${m.life.label}이면 ${m.life.uses.toLocaleString("ko-KR")}번쯤 씁니다. 1회당 ${won(m.perUse)}, 계산은 통과입니다.`
  );

  /* 3. 이미 가진 것 */
  out.push(
    {
      none: "집에 비슷한 게 없다고 하셨습니다. 그 말을 믿는 것으로 하겠습니다.",
      worn: "쓰던 게 낡았다면 이건 소비가 아니라 교체입니다. 명분 인정합니다.",
      few: "집에 두세 개 있습니다. 세 개째부터는 필요가 아니라 취미입니다.",
      many: "집에 비슷한 게 네 개 넘게 있습니다. 정신 차리십시오.",
    }[a.dupe]
  );

  /* 4. 지금 상태 */
  out.push(
    {
      sober: "맨정신입니다. 이 판정은 그대로 유효합니다.",
      buzzed: "한두 잔 하셨습니다. 판단력에 할인이 들어간 상태입니다.",
      drunk: "취하셨습니다. 지금 누르는 결제는 내일의 당신이 갚습니다.",
      dawn: "새벽 3시입니다. 이 시각의 장바구니는 아침에 효력을 잃습니다.",
    }[a.drunk]
  );

  return out;
}

/** 공유용 한 덩어리. 결과 화면과 같은 숫자를 쓴다. */
export function shareText(a: Answers, v: Verdict): string {
  const name = a.item.trim() || "이름 없는 물건";
  return [
    `살까 말까 판독기 — ${name} ${won(a.price)}`,
    `판정: 구매 ${v.stamp}`,
    `소비 승인율 ${v.approval}% / 핑계 수준 ${v.excuse}급 / 내일 후회 확률 ${v.regret}%`,
    `"${v.lines[0]}"`,
    "너도 판정받아 봐.",
  ].join("\n");
}
