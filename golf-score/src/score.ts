/* 타수 계산. 앱에서 유일하게 "틀리면 안 되는" 부분이라 따로 뺐다.
 *
 *   홀 스코어 = 친 샷 수 + 벌타 + 퍼트 수
 *
 * 퍼트는 샷 목록에 넣지 않는다. 그린 위 스트로크를 따로 세어야 퍼트 평균과
 * 파온율(GIR)을 계산할 수 있기 때문이다. */

import {
  type Hole,
  type ObRule,
  type Par,
  type Round,
  type Shot,
  type ShotResult,
  regulationShots,
} from "./types";

/** 이 샷 결과가 몇 벌타인가. OB 는 라운드의 로컬룰에 따라 1 또는 2. */
export function penaltyOf(result: ShotResult, obRule: ObRule): number {
  switch (result) {
    case "ob_left":
    case "ob_right":
      return obRule === "forward_tee" ? 2 : 1;
    case "hazard_left":
    case "hazard_right":
      return 1;
    default:
      return 0;
  }
}

export function holePenalties(hole: Hole, obRule: ObRule): number {
  return hole.shots.reduce((sum, s) => sum + penaltyOf(s.result, obRule), 0);
}

export function holeStrokes(hole: Hole, obRule: ObRule): number {
  return hole.shots.length + holePenalties(hole, obRule) + hole.putts;
}

export function holeToPar(hole: Hole, obRule: ObRule): number {
  return holeStrokes(hole, obRule) - hole.par;
}

/** 파 대비 스코어의 이름. 트리플보기 아래로는 이름을 붙이지 않는다. */
export function scoreName(toPar: number): string {
  if (toPar <= -3) return "알바트로스";
  if (toPar === -2) return "이글";
  if (toPar === -1) return "버디";
  if (toPar === 0) return "파";
  if (toPar === 1) return "보기";
  if (toPar === 2) return "더블보기";
  if (toPar === 3) return "트리플보기";
  return `+${toPar}`;
}

/** 파 대비 스코어를 +3 / E / −1 꼴로. */
export function toParText(toPar: number): string {
  if (toPar === 0) return "E";
  return toPar > 0 ? `+${toPar}` : `${toPar}`;
}

/**
 * 규정 타수 안에 그린에 올렸는가 (파온).
 *
 * 벌타를 반드시 함께 세야 한다. 파5에서 티샷 OB 를 내고 세 번 쳐서 올렸다면
 * 샷 수는 3이지만 실제로는 5타째에 올린 것이라 파온이 아니다.
 * 퍼트를 한 번도 안 했으면 그린에 올린 것으로 보지 않는다.
 */
export function isGir(hole: Hole, obRule: ObRule): boolean {
  const toGreen = hole.shots.length + holePenalties(hole, obRule);
  return hole.putts > 0 && toGreen <= regulationShots(hole.par);
}

/** 파4·파5 의 티샷이 페어웨이를 지켰는가. 파3 은 페어웨이 개념이 없어 null. */
export function fairwayHit(hole: Hole): boolean | null {
  if (hole.par === 3) return null;
  const tee = hole.shots[0];
  if (!tee) return null;
  return tee.result === "good";
}

export type Totals = {
  /** 기록된 홀 수 */
  holes: number;
  par: number;
  strokes: number;
  toPar: number;
  putts: number;
  penalties: number;
  /** 전반 9홀 (없으면 null) */
  out: { strokes: number; par: number } | null;
  /** 후반 9홀 (없으면 null) */
  in: { strokes: number; par: number } | null;
};

function sumRange(holes: Hole[], obRule: ObRule) {
  return holes.reduce(
    (acc, h) => ({
      strokes: acc.strokes + holeStrokes(h, obRule),
      par: acc.par + h.par,
    }),
    { strokes: 0, par: 0 }
  );
}

export function roundTotals(round: Round): Totals {
  const { holes, obRule } = round;
  const all = sumRange(holes, obRule);
  const front = holes.slice(0, 9);
  const back = holes.slice(9, 18);
  return {
    holes: holes.length,
    par: all.par,
    strokes: all.strokes,
    toPar: all.strokes - all.par,
    putts: holes.reduce((s, h) => s + h.putts, 0),
    penalties: holes.reduce((s, h) => s + holePenalties(h, obRule), 0),
    out: front.length > 0 ? sumRange(front, obRule) : null,
    in: back.length > 0 ? sumRange(back, obRule) : null,
  };
}

/** 파·버디·보기가 각각 몇 홀이었는지. 결과 화면의 요약 띠에 쓴다. */
export function scoreSpread(round: Round): {
  eagle: number; birdie: number; par: number; bogey: number; double: number; worse: number;
} {
  const spread = { eagle: 0, birdie: 0, par: 0, bogey: 0, double: 0, worse: 0 };
  for (const h of round.holes) {
    const d = holeToPar(h, round.obRule);
    if (d <= -2) spread.eagle++;
    else if (d === -1) spread.birdie++;
    else if (d === 0) spread.par++;
    else if (d === 1) spread.bogey++;
    else if (d === 2) spread.double++;
    else spread.worse++;
  }
  return spread;
}

/** 파별 평균 타수. 표본이 없는 파는 키 자체가 없다. */
export function averageByPar(round: Round): Partial<Record<Par, number>> {
  const bucket: Partial<Record<Par, number[]>> = {};
  for (const h of round.holes) {
    (bucket[h.par] ??= []).push(holeStrokes(h, round.obRule));
  }
  const out: Partial<Record<Par, number>> = {};
  for (const key of [3, 4, 5] as Par[]) {
    const list = bucket[key];
    if (list && list.length > 0) {
      out[key] = list.reduce((a, b) => a + b, 0) / list.length;
    }
  }
  return out;
}

/** 라운드 안의 모든 샷을 홀 정보와 함께 평평하게 편다. 분석에서 쓴다. */
export function allShots(round: Round): { shot: Shot; hole: Hole; index: number }[] {
  const out: { shot: Shot; hole: Hole; index: number }[] = [];
  for (const hole of round.holes) {
    hole.shots.forEach((shot, index) => out.push({ shot, hole, index }));
  }
  return out;
}
