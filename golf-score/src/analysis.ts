/* 라운딩 분석. 전부 입력된 기록에서 산술로 나오는 것만 만든다.
 * 없는 데이터를 그럴듯하게 지어내지 않는 것이 이 파일의 유일한 규칙이다. */

import {
  type ClubId,
  type Par,
  type Round,
  type ShotResult,
  clubLabel,
  resultLabel,
  resultSide,
} from "./types";
import {
  type Totals,
  allShots,
  averageByPar,
  fairwayHit,
  holeStrokes,
  isGir,
  roundTotals,
  scoreSpread,
  toParText,
} from "./score";

/* ── 지표 ────────────────────────────────────────────────────────── */

export type Rate = { hit: number; of: number; rate: number };

export type ClubStat = {
  club: ClubId;
  used: number;
  miss: number;
  missRate: number;
};

export type Metrics = {
  totals: Totals;
  /** 18홀로 환산한 타수. 9홀 라운드와 비교하려면 이 값을 써야 한다. */
  strokesPer18: number;
  puttsPerHole: number;
  threePuttHoles: number;
  onePuttHoles: number;
  gir: Rate;
  fairway: Rate;
  /** 미스가 좌우 중 어느 쪽으로 났는가 (OB·해저드·러프를 함께 센다) */
  sides: { left: number; right: number };
  contact: { id: ShotResult; label: string; count: number }[];
  contactTotal: number;
  ob: number;
  hazard: number;
  bunker: number;
  clubs: ClubStat[];
  byPar: Partial<Record<Par, number>>;
  /** 전·후반 타수 차이. 18홀이 아니면 null */
  halfGap: { out: number; in: number; gap: number } | null;
};

const CONTACT_IDS: ShotResult[] = ["duff", "top", "sky", "shank"];

export function metricsOf(round: Round): Metrics {
  const totals = roundTotals(round);
  const shots = allShots(round);

  const sides = { left: 0, right: 0 };
  for (const { shot } of shots) {
    const side = resultSide(shot.result);
    if (side === "left") sides.left++;
    else if (side === "right") sides.right++;
  }

  const contact = CONTACT_IDS.map((id) => ({
    id,
    label: resultLabel(id),
    count: shots.filter((s) => s.shot.result === id).length,
  }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count);

  const used = new Map<ClubId, { used: number; miss: number }>();
  for (const { shot } of shots) {
    const entry = used.get(shot.club) ?? { used: 0, miss: 0 };
    entry.used++;
    if (shot.result !== "good") entry.miss++;
    used.set(shot.club, entry);
  }
  const clubs: ClubStat[] = [...used.entries()]
    .map(([club, v]) => ({ club, used: v.used, miss: v.miss, missRate: v.miss / v.used }))
    .sort((a, b) => b.used - a.used);

  const girHoles = round.holes.filter((h) => isGir(h, round.obRule)).length;
  const fairwayHoles = round.holes.filter((h) => fairwayHit(h) !== null);
  const fairwayOk = fairwayHoles.filter((h) => fairwayHit(h) === true).length;

  return {
    totals,
    strokesPer18: totals.holes > 0 ? (totals.strokes / totals.holes) * 18 : 0,
    puttsPerHole: totals.holes > 0 ? totals.putts / totals.holes : 0,
    threePuttHoles: round.holes.filter((h) => h.putts >= 3).length,
    onePuttHoles: round.holes.filter((h) => h.putts === 1).length,
    gir: { hit: girHoles, of: totals.holes, rate: totals.holes ? girHoles / totals.holes : 0 },
    fairway: {
      hit: fairwayOk,
      of: fairwayHoles.length,
      rate: fairwayHoles.length ? fairwayOk / fairwayHoles.length : 0,
    },
    sides,
    contact,
    contactTotal: contact.reduce((s, c) => s + c.count, 0),
    ob: shots.filter((s) => s.shot.result.startsWith("ob_")).length,
    hazard: shots.filter((s) => s.shot.result.startsWith("hazard_")).length,
    bunker: shots.filter((s) => s.shot.result === "bunker").length,
    clubs,
    byPar: averageByPar(round),
    halfGap:
      totals.out && totals.in
        ? { out: totals.out.strokes, in: totals.in.strokes, gap: totals.in.strokes - totals.out.strokes }
        : null,
  };
}

/* ── 진단 ────────────────────────────────────────────────────────── */

export type Tone = "bad" | "good" | "info";
export type Finding = { title: string; detail: string; tone: Tone };

/** 손실이 큰 것부터. weight 는 "이것 때문에 잃은 타수"의 어림값이다. */
type Weighted = { weight: number; text: string };

function problems(m: Metrics): Weighted[] {
  const out: Weighted[] = [];

  if (m.totals.penalties > 0) {
    out.push({ weight: m.totals.penalties, text: `벌타로만 ${m.totals.penalties}타를 잃었습니다` });
  }

  const puttsOver = m.totals.putts - m.totals.holes * 2;
  if (puttsOver > 0) {
    out.push({
      weight: puttsOver,
      text: `퍼트가 규정보다 ${puttsOver}개 많았습니다(3퍼트 ${m.threePuttHoles}홀)`,
    });
  }

  if (m.contactTotal > 0) {
    const top = m.contact[0];
    out.push({
      weight: m.contactTotal,
      text:
        m.contact.length === 1
          ? `${top.label}이 ${top.count}회 나왔습니다`
          : `${top.label} ${top.count}회를 포함해 임팩트 미스가 ${m.contactTotal}회였습니다`,
    });
  }

  const bias = Math.abs(m.sides.left - m.sides.right);
  const sideTotal = m.sides.left + m.sides.right;
  if (sideTotal >= 4 && bias >= 3) {
    const heavy = m.sides.right > m.sides.left ? "우" : "좌";
    const shape = heavy === "우" ? "슬라이스·푸시" : "훅·풀";
    const count = Math.max(m.sides.left, m.sides.right);
    out.push({
      weight: bias,
      text: `미스가 ${heavy}측으로 ${count}회 쏠렸습니다(${shape} 경향)`,
    });
  }

  const worstClub = m.clubs.filter((c) => c.used >= 3 && c.missRate >= 0.5)[0];
  if (worstClub) {
    out.push({
      weight: worstClub.miss,
      text: `${clubLabel(worstClub.club)}가 ${worstClub.used}번 중 ${worstClub.miss}번 흔들렸습니다`,
    });
  }

  return out.sort((a, b) => b.weight - a.weight);
}

function strengths(m: Metrics): Weighted[] {
  const out: Weighted[] = [];
  if (m.totals.penalties === 0 && m.totals.holes >= 9) {
    out.push({ weight: 5, text: "벌타가 하나도 없었습니다" });
  }
  if (m.puttsPerHole > 0 && m.puttsPerHole <= 1.9) {
    out.push({ weight: 4, text: `퍼트가 홀당 ${m.puttsPerHole.toFixed(1)}개로 좋았습니다` });
  }
  if (m.gir.of > 0 && m.gir.rate >= 0.35) {
    out.push({ weight: 3, text: `파온을 ${m.gir.hit}홀 잡았습니다` });
  }
  if (m.fairway.of > 0 && m.fairway.rate >= 0.6) {
    out.push({
      weight: 3,
      text: `티샷이 ${m.fairway.of}번 중 ${m.fairway.hit}번 페어웨이를 지켰습니다`,
    });
  }
  if (m.contactTotal === 0 && m.totals.holes >= 9) {
    out.push({ weight: 2, text: "뒤땅·탑볼 같은 임팩트 미스가 없었습니다" });
  }
  return out.sort((a, b) => b.weight - a.weight);
}

/** 한줄요약. 가장 큰 손실 원인 하나와, 있으면 잘한 것 하나를 붙인다. */
export function headlineOf(round: Round, m: Metrics): string {
  const head = `${m.totals.strokes}타(${toParText(m.totals.toPar)})`;
  const p = problems(m)[0];
  const s = strengths(m)[0];

  if (!p && !s) return `${head} — 특별히 흔들린 곳 없이 무난한 라운드였습니다.`;
  if (!p) return `${head} — ${s.text}. 오늘은 흠잡을 곳이 없었습니다.`;
  if (!s) return `${head} — ${p.text}.`;
  return `${head} — ${p.text}. 다만 ${s.text}.`;
}

/** 화면에 카드로 늘어놓을 진단들. 계산 가능한 것만 들어간다. */
export function findingsOf(round: Round, m: Metrics): Finding[] {
  const out: Finding[] = [];
  const spread = scoreSpread(round);

  out.push({
    title: "스코어 구성",
    detail: [
      spread.eagle > 0 ? `이글 ${spread.eagle}` : null,
      spread.birdie > 0 ? `버디 ${spread.birdie}` : null,
      `파 ${spread.par}`,
      `보기 ${spread.bogey}`,
      `더블 ${spread.double}`,
      spread.worse > 0 ? `트리플+ ${spread.worse}` : null,
    ]
      .filter(Boolean)
      .join(" · "),
    tone: "info",
  });

  const sideTotal = m.sides.left + m.sides.right;
  if (sideTotal > 0) {
    const bias = Math.abs(m.sides.left - m.sides.right);
    const heavy = m.sides.right > m.sides.left ? "우" : "좌";
    out.push({
      title: "방향 편향",
      detail:
        bias >= 3
          ? `좌 ${m.sides.left}회 · 우 ${m.sides.right}회 — ${heavy}측으로 쏠렸습니다(오른손잡이 기준 ${heavy === "우" ? "슬라이스·푸시" : "훅·풀"}).`
          : `좌 ${m.sides.left}회 · 우 ${m.sides.right}회 — 한쪽으로 쏠리지는 않았습니다.`,
      tone: bias >= 3 ? "bad" : "info",
    });
  }

  if (m.contactTotal > 0) {
    out.push({
      title: "임팩트 미스",
      detail: m.contact.map((c) => `${c.label} ${c.count}회`).join(" · "),
      tone: m.contactTotal >= 4 ? "bad" : "info",
    });
  } else if (m.totals.holes >= 9) {
    out.push({ title: "임팩트 미스", detail: "없었습니다.", tone: "good" });
  }

  out.push({
    title: "벌타",
    detail:
      m.totals.penalties === 0
        ? "없었습니다."
        : `${m.totals.penalties}타 (OB ${m.ob}회 · 해저드 ${m.hazard}회)`,
    tone: m.totals.penalties === 0 ? "good" : m.totals.penalties >= 4 ? "bad" : "info",
  });

  out.push({
    title: "퍼트",
    detail: `총 ${m.totals.putts}개 · 홀당 ${m.puttsPerHole.toFixed(1)}개 · 3퍼트 ${m.threePuttHoles}홀 · 원퍼트 ${m.onePuttHoles}홀`,
    tone: m.puttsPerHole <= 1.9 ? "good" : m.puttsPerHole >= 2.3 ? "bad" : "info",
  });

  if (m.gir.of > 0) {
    out.push({
      title: "파온(GIR)",
      detail: `${m.gir.of}홀 중 ${m.gir.hit}홀 (${Math.round(m.gir.rate * 100)}%)`,
      tone: m.gir.rate >= 0.35 ? "good" : m.gir.rate <= 0.15 ? "bad" : "info",
    });
  }

  if (m.fairway.of > 0) {
    out.push({
      title: "페어웨이",
      detail: `${m.fairway.of}번 중 ${m.fairway.hit}번 (${Math.round(m.fairway.rate * 100)}%)`,
      tone: m.fairway.rate >= 0.6 ? "good" : m.fairway.rate <= 0.3 ? "bad" : "info",
    });
  }

  const parText = ([3, 4, 5] as Par[])
    .filter((p) => m.byPar[p] !== undefined)
    .map((p) => `파${p} 평균 ${m.byPar[p]!.toFixed(1)}타`)
    .join(" · ");
  if (parText) out.push({ title: "파별 성적", detail: parText, tone: "info" });

  if (m.halfGap) {
    const { out: front, in: back, gap } = m.halfGap;
    out.push({
      title: "전·후반",
      detail:
        gap === 0
          ? `전반 ${front}타 · 후반 ${back}타 — 흐름이 고르게 유지됐습니다.`
          : `전반 ${front}타 · 후반 ${back}타 — 후반이 ${Math.abs(gap)}타 ${gap > 0 ? "많았습니다" : "적었습니다"}.`,
      tone: gap >= 4 ? "bad" : gap <= -4 ? "good" : "info",
    });
  }

  const shown = m.clubs.filter((c) => c.used >= 2).slice(0, 6);
  if (shown.length > 0) {
    out.push({
      title: "클럽별 안정도",
      detail: shown
        .map((c) => `${clubLabel(c.club)} ${c.used - c.miss}/${c.used}`)
        .join(" · "),
      tone: "info",
    });
  }

  return out;
}

export type Analysis = { metrics: Metrics; headline: string; findings: Finding[] };

export function analyze(round: Round): Analysis {
  const metrics = metricsOf(round);
  return { metrics, headline: headlineOf(round, metrics), findings: findingsOf(round, metrics) };
}

/* ── 지난 기록과 견주기 ──────────────────────────────────────────── */

export type Trend = {
  /** 견줄 표본이 충분한가. 지난 라운드가 2개는 있어야(=총 3라운드) 본다. */
  enough: boolean;
  sampleSize: number;
  /** 18홀 환산 타수 */
  current: number;
  previousAverage: number | null;
  delta: number | null;
  puttDelta: number | null;
  penaltyDelta: number | null;
  verdict: "better" | "worse" | "flat" | "unknown";
  summary: string;
  /** 홈 화면의 미니 그래프용. 오래된 것이 앞에 온다. */
  history: { date: string; per18: number }[];
};

const MIN_SAMPLE = 2;

export function trendOf(current: Round, all: Round[]): Trend {
  // 이 라운드보다 "먼저" 친 것만 견준다. 예전 기록을 다시 열어 봤을 때 그 뒤에
  // 친 라운드와 비교하면 "그때 나아지고 있었는가"의 답이 뒤집힌다.
  const cutoff = current.finishedAt ?? Number.MAX_SAFE_INTEGER;
  const previous = all
    .filter((r) => r.id !== current.id && r.finishedAt !== undefined && r.finishedAt < cutoff)
    .sort((a, b) => (b.finishedAt ?? 0) - (a.finishedAt ?? 0));

  const history = [...previous]
    .reverse()
    .concat([current])
    .map((r) => {
      const t = roundTotals(r);
      return { date: r.date, per18: t.holes ? (t.strokes / t.holes) * 18 : 0 };
    });

  const m = metricsOf(current);
  const base: Trend = {
    enough: false,
    sampleSize: previous.length,
    current: m.strokesPer18,
    previousAverage: null,
    delta: null,
    puttDelta: null,
    penaltyDelta: null,
    verdict: "unknown",
    summary: "",
    history,
  };

  if (previous.length < MIN_SAMPLE) {
    const need = MIN_SAMPLE + 1 - (previous.length + 1);
    return {
      ...base,
      summary: `기록이 ${previous.length + 1}개입니다. ${need}라운드 더 쌓이면 나아지고 있는지 견줘 드립니다.`,
    };
  }

  const window = previous.slice(0, 5);
  const avg = (nums: number[]) => nums.reduce((a, b) => a + b, 0) / nums.length;
  const prevPer18 = avg(
    window.map((r) => {
      const t = roundTotals(r);
      return t.holes ? (t.strokes / t.holes) * 18 : 0;
    })
  );
  const prevPutts = avg(
    window.map((r) => {
      const t = roundTotals(r);
      return t.holes ? t.putts / t.holes : 0;
    })
  );
  const prevPenalties = avg(
    window.map((r) => {
      const t = roundTotals(r);
      return t.holes ? (t.penalties / t.holes) * 18 : 0;
    })
  );

  const delta = m.strokesPer18 - prevPer18;
  const puttDelta = m.puttsPerHole - prevPutts;
  const penaltyDelta =
    (m.totals.holes ? (m.totals.penalties / m.totals.holes) * 18 : 0) - prevPenalties;

  const verdict: Trend["verdict"] = delta <= -1.5 ? "better" : delta >= 1.5 ? "worse" : "flat";
  const size = window.length;
  const shift = Math.abs(delta).toFixed(1);
  const summary =
    verdict === "better"
      ? `최근 ${size}라운드 평균보다 ${shift}타 좋습니다. 나아지고 있습니다.`
      : verdict === "worse"
        ? `최근 ${size}라운드 평균보다 ${shift}타 나쁩니다. 오늘은 흐름이 좋지 않았습니다.`
        : `최근 ${size}라운드 평균과 ${shift}타 차이입니다. 기복 없이 유지되고 있습니다.`;

  return {
    ...base,
    enough: true,
    sampleSize: size,
    previousAverage: prevPer18,
    delta,
    puttDelta,
    penaltyDelta,
    verdict,
    summary,
  };
}

/** 공유 시트에 넣을 문장. 화면에 있는 것만 옮긴다. */
export function shareText(round: Round, analysis: Analysis): string {
  const t = analysis.metrics.totals;
  return [
    `${round.course || "이름 없는 구장"} · ${round.date}`,
    `${t.holes}홀 ${t.strokes}타 (${toParText(t.toPar)})`,
    `퍼트 ${t.putts} · 벌타 ${t.penalties}`,
    "",
    analysis.headline,
  ].join("\n");
}

/** 스코어카드 한 줄에 쓸 홀별 타수. */
export function holeStrokeList(round: Round): number[] {
  return round.holes.map((h) => holeStrokes(h, round.obRule));
}
