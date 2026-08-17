// 판정 임계값 보정용 몬테카를로.
//
//   npm run calibrate
//
// 문항을 고치면 반드시 다시 돌려서 app/types.ts 의 임계값 세 개와 각 유형의
// pct, 그리고 app/quiz.tsx 의 BASE 를 갱신할 것.
//
// ── 응답자 모델 ──────────────────────────────────────────────────────
// 균등 랜덤은 쓰지 않는다. 균등 랜덤은 밀고 선택지를 1/3 확률로 고르게 되어
// 밀정형이 절반 가까이 나오는데, 실제 응답자는 그렇게 답하지 않는다.
//
// 대신 응답자마다 잠재 성향 세 개(신념/적극성/정면성)를 뽑고, 성향과 선택지
// 점수의 내적을 효용으로 보아 softmax로 고르게 한다. 성향 분포를 하나로
// 가정하면 그 가정이 곧 결과가 되므로 두 모집단을 함께 돌린다.
//   neutral   성향이 고르게 퍼진 모집단
//   desirable 저항 쪽으로 쏠린 모집단 (이런 테스트에서 실제로 나타나는 편향)
//
// ── 목표 ─────────────────────────────────────────────────────────────
// 유형별 비율을 출시 전에 정확히 맞추는 건 불가능하다. 여기서는 "9개 유형이
// 모두 의미 있게 도달 가능하고, 어느 하나가 화면을 독점하지 않는가"만 본다.
// 화면에 처음 보여줄 기본 분포(pct)는 이 결과에서 역산한다.

import { QUESTIONS } from "../app/questions.ts";
import { TYPES, TYPE_KEYS } from "../app/types.ts";

const N = 120_000;
const T = 0.55;

const MAX_BELIEF = QUESTIONS.reduce(
  (s, q) => s + Math.max(...q.o.map((o) => o.b)),
  0
);
const MAX_ACTIVE = QUESTIONS.reduce(
  (s, q) => s + Math.max(...q.o.map((o) => o.a)),
  0
);

/** 0~1, 높은 쪽으로 치우친 난수 */
function skewedHigh(): number {
  return Math.max(Math.random(), (Math.random() + Math.random()) / 2);
}

function pickWeighted(weights: number[]): number {
  const total = weights.reduce((s, w) => s + w, 0);
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return i;
  }
  return weights.length - 1;
}

type Sim = {
  belief: number;
  active: number;
  direct: number;
  informs: number;
  breakStage: number;
};

function run(skewBelief: boolean): Sim {
  const tb = skewBelief ? skewedHigh() : Math.random();
  const ta = Math.random();
  const td = Math.random() * 2 - 1;

  let belief = 0;
  let active = 0;
  let direct = 0;
  let informs = 0;
  let breakStage = -1;

  for (const q of QUESTIONS) {
    const utils = q.o.map((o) => (tb * o.b + ta * o.a + td * o.d) / T);
    const max = Math.max(...utils);
    const o = q.o[pickWeighted(utils.map((u) => Math.exp(u - max)))];

    belief += o.b;
    active += o.a;
    direct += o.d;
    if (o.inform) informs += 1;
    if (!o.r && breakStage < 0) breakStage = q.st;
  }

  return {
    belief,
    active,
    direct,
    informs,
    breakStage: breakStage < 0 ? 6 : breakStage,
  };
}

// ── 히스토그램 ───────────────────────────────────────────────────────
// 판정은 (신념, 적극성, 정면부호, 밀고횟수)에만 의존하므로 응답자 하나하나가
// 아니라 이 조합별 개수만 세어두면 임계값 격자탐색이 훨씬 빨라진다.

const AW = MAX_ACTIVE + 1;
const bucketIndex = (b: number, a: number, dPos: number, inf: number) =>
  ((b * AW + a) * 2 + dPos) * 3 + inf;
const BUCKETS = (MAX_BELIEF + 1) * AW * 2 * 3;

function histogramOf(sims: Sim[]): Int32Array {
  const h = new Int32Array(BUCKETS);
  for (const s of sims) {
    h[bucketIndex(s.belief, s.active, s.direct >= 0 ? 1 : 0, Math.min(s.informs, 2))] += 1;
  }
  return h;
}

/** app/types.ts 의 decide()와 같은 규칙. 임계값만 밖에서 주입한다. */
function classify(
  b: number,
  a: number,
  dPos: number,
  inf: number,
  bt: number,
  at: number,
  ceil: number,
  floor: number
): string {
  const hasBelief = b >= bt;
  const isActive = a >= at;
  const isDirect = dPos === 1;

  if (inf >= 2 || (inf === 1 && b < ceil)) return "informant";
  if (hasBelief) {
    if (isActive) return isDirect ? "armed" : "org";
    return isDirect ? "hermit" : "inner";
  }
  if (!isActive) return "survivor";
  if (!isDirect) return "double";
  return b >= floor ? "convert" : "opportunist";
}

function distributionOf(
  h: Int32Array,
  total: number,
  bt: number,
  at: number,
  ceil: number,
  floor: number
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (let b = 0; b <= MAX_BELIEF; b++) {
    for (let a = 0; a < AW; a++) {
      for (let dPos = 0; dPos < 2; dPos++) {
        for (let inf = 0; inf < 3; inf++) {
          const n = h[bucketIndex(b, a, dPos, inf)];
          if (n === 0) continue;
          const k = classify(b, a, dPos, inf, bt, at, ceil, floor);
          counts[k] = (counts[k] ?? 0) + n;
        }
      }
    }
  }
  const dist: Record<string, number> = {};
  for (const k of TYPE_KEYS) dist[k] = ((counts[k] ?? 0) / total) * 100;
  return dist;
}

// 설계상 바라는 분포. 평범한 쪽(순응·내면저항·이중생활)이 가장 흔하고,
// 양 극단(무장투쟁·밀정)이 드문 것이 이 서비스가 말하려는 바와 맞다.
const TARGET: Record<string, number> = {
  survivor: 22,
  inner: 16,
  double: 14,
  hermit: 11,
  opportunist: 10,
  org: 9,
  convert: 7,
  armed: 6,
  informant: 5,
};

function errorOf(dist: Record<string, number>): number {
  let err = 0;
  for (const k of TYPE_KEYS) {
    const got = dist[k] ?? 0;
    if (got < 1.5) err += 50; // 사실상 도달 불가
    err += Math.abs(got - TARGET[k]);
  }
  return err;
}

// ── 실행 ─────────────────────────────────────────────────────────────

const pops = {
  neutral: Array.from({ length: N }, () => run(false)),
  desirable: Array.from({ length: N }, () => run(true)),
};
const hists = {
  neutral: histogramOf(pops.neutral),
  desirable: histogramOf(pops.desirable),
};

console.log(`문항 ${QUESTIONS.length}개 · 신념 0–${MAX_BELIEF} · 적극성 0–${MAX_ACTIVE}`);
for (const [name, sims] of Object.entries(pops)) {
  const rate = (sims.filter((s) => s.informs > 0).length / sims.length) * 100;
  const twice = (sims.filter((s) => s.informs >= 2).length / sims.length) * 100;
  console.log(
    `  [${name}] 밀고 1회 이상 ${rate.toFixed(1)}% · 2회 ${twice.toFixed(1)}%`
  );
}
console.log();

// 1단계: floor를 0(전부 기회주의)으로 고정하고 bt/at/ceil을 찾는다.
let best = { bt: 0, at: 0, ceil: 0, floor: 0, err: Infinity };
for (let bt = 8; bt <= MAX_BELIEF - 2; bt++) {
  for (let at = 8; at <= MAX_ACTIVE - 2; at++) {
    for (let ceil = 0; ceil <= MAX_BELIEF; ceil++) {
      const err =
        errorOf(distributionOf(hists.neutral, N, bt, at, ceil, 0)) +
        errorOf(distributionOf(hists.desirable, N, bt, at, ceil, 0));
      if (err < best.err) best = { bt, at, ceil, floor: 0, err };
    }
  }
}

// 2단계: floor는 "앞장서서 협력한" 사분면을 전향/기회주의로 쪼갤 뿐이므로
// 나머지를 고정한 채 따로 찾는다.
for (let floor = 0; floor <= best.bt; floor++) {
  const err =
    errorOf(distributionOf(hists.neutral, N, best.bt, best.at, best.ceil, floor)) +
    errorOf(distributionOf(hists.desirable, N, best.bt, best.at, best.ceil, floor));
  if (err < best.err) best = { ...best, floor, err };
}

console.log(
  `최적 임계값 → BELIEF_THRESHOLD=${best.bt}  ACTIVE_THRESHOLD=${best.at}  INFORM_BELIEF_CEILING=${best.ceil}  CONVERT_FLOOR=${best.floor}\n`
);

const dists = {
  neutral: distributionOf(hists.neutral, N, best.bt, best.at, best.ceil, best.floor),
  desirable: distributionOf(hists.desirable, N, best.bt, best.at, best.ceil, best.floor),
};

console.log("유형별 분포            neutral  desirable   (목표)");
const suggested: Record<string, number> = {};
for (const k of TYPE_KEYS) {
  const n = dists.neutral[k] ?? 0;
  const d = dists.desirable[k] ?? 0;
  suggested[k] = Math.round((n + d) / 2);
  console.log(
    `  ${TYPES[k].n.padEnd(11, " ")} ${n.toFixed(1).padStart(7)}% ${d
      .toFixed(1)
      .padStart(9)}%  ${String(TARGET[k]).padStart(6)}%`
  );
}

const sum = Object.values(suggested).reduce((s, v) => s + v, 0);
const biggest = TYPE_KEYS.reduce((a, b) => (suggested[a] >= suggested[b] ? a : b));
suggested[biggest] += 100 - sum;
console.log(`\napp/types.ts 의 pct 권장값 (두 모집단 평균, 합 100)`);
console.log(`  ${TYPE_KEYS.map((k) => `${k}:${suggested[k]}`).join("  ")}`);

const base: Record<number, number> = {};
const all = [...pops.neutral, ...pops.desirable];
for (let k = 0; k <= 6; k++) {
  base[k] = Math.round(
    (all.filter((s) => s.breakStage === k).length / all.length) * 100
  );
}
const baseSum = Object.values(base).reduce((s, v) => s + v, 0);
base[2] += 100 - baseSum;
console.log(`\napp/quiz.tsx 의 BASE 권장값`);
console.log(`  BASE = ${JSON.stringify(base)}`);
