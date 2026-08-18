/* 라운드 기록의 자료형과 그에 딸린 상수. 계산은 score.ts, 분석은 analysis.ts. */

export type Par = 3 | 4 | 5;

/* ── 클럽 ────────────────────────────────────────────────────────── */

export type ClubId =
  | "Dr" | "3W" | "5W"
  | "U3" | "U4" | "U5"
  | "4i" | "5i" | "6i" | "7i" | "8i" | "9i"
  | "PW" | "AW" | "SW" | "LW";

export type ClubGroup = "우드" | "유틸" | "아이언" | "웨지";

export const CLUBS: { id: ClubId; label: string; short: string; group: ClubGroup }[] = [
  { id: "Dr", label: "드라이버", short: "Dr", group: "우드" },
  { id: "3W", label: "3번 우드", short: "3W", group: "우드" },
  { id: "5W", label: "5번 우드", short: "5W", group: "우드" },
  { id: "U3", label: "3 유틸", short: "U3", group: "유틸" },
  { id: "U4", label: "4 유틸", short: "U4", group: "유틸" },
  { id: "U5", label: "5 유틸", short: "U5", group: "유틸" },
  { id: "4i", label: "4번 아이언", short: "4i", group: "아이언" },
  { id: "5i", label: "5번 아이언", short: "5i", group: "아이언" },
  { id: "6i", label: "6번 아이언", short: "6i", group: "아이언" },
  { id: "7i", label: "7번 아이언", short: "7i", group: "아이언" },
  { id: "8i", label: "8번 아이언", short: "8i", group: "아이언" },
  { id: "9i", label: "9번 아이언", short: "9i", group: "아이언" },
  { id: "PW", label: "피칭", short: "PW", group: "웨지" },
  { id: "AW", label: "52도", short: "52", group: "웨지" },
  { id: "SW", label: "56도", short: "56", group: "웨지" },
  { id: "LW", label: "60도", short: "60", group: "웨지" },
];

export const CLUB_GROUPS: ClubGroup[] = ["우드", "유틸", "아이언", "웨지"];

export function clubLabel(id: ClubId): string {
  return CLUBS.find((c) => c.id === id)?.label ?? id;
}

export function clubShort(id: ClubId): string {
  return CLUBS.find((c) => c.id === id)?.short ?? id;
}

/* ── 샷 결과 ─────────────────────────────────────────────────────── */

export type ShotResult =
  | "good"
  | "ob_left" | "ob_right"
  | "hazard_left" | "hazard_right"
  | "rough_left" | "rough_right"
  | "bunker"
  | "duff" | "top" | "sky" | "shank";

/** 결과의 성격. 분석에서 이 축으로 묶는다. */
export type ResultKind = "good" | "penalty" | "position" | "contact";

export type Side = "left" | "right" | null;

export const RESULTS: {
  id: ShotResult;
  label: string;
  kind: ResultKind;
  side: Side;
}[] = [
  { id: "good", label: "정타", kind: "good", side: null },
  { id: "ob_left", label: "좌 OB", kind: "penalty", side: "left" },
  { id: "ob_right", label: "우 OB", kind: "penalty", side: "right" },
  { id: "hazard_left", label: "좌 해저드", kind: "penalty", side: "left" },
  { id: "hazard_right", label: "우 해저드", kind: "penalty", side: "right" },
  { id: "rough_left", label: "좌 러프", kind: "position", side: "left" },
  { id: "rough_right", label: "우 러프", kind: "position", side: "right" },
  { id: "bunker", label: "벙커", kind: "position", side: null },
  { id: "duff", label: "뒤땅", kind: "contact", side: null },
  { id: "top", label: "탑볼", kind: "contact", side: null },
  { id: "sky", label: "뽕샷", kind: "contact", side: null },
  { id: "shank", label: "생크", kind: "contact", side: null },
];

export function resultLabel(id: ShotResult): string {
  return RESULTS.find((r) => r.id === id)?.label ?? id;
}

export function resultKind(id: ShotResult): ResultKind {
  return RESULTS.find((r) => r.id === id)?.kind ?? "good";
}

export function resultSide(id: ShotResult): Side {
  return RESULTS.find((r) => r.id === id)?.side ?? null;
}

/* ── OB 처리 규칙 ────────────────────────────────────────────────── */

/**
 * OB 를 어떻게 셀 것인가. 골프장 로컬룰마다 달라서 라운드마다 정한다.
 *
 * - `stroke_distance` 정규 규칙: 1벌타 후 원래 자리에서 다시 친다.
 *   앱에는 다시 친 샷이 새 샷으로 들어오므로 벌타 +1 만 더한다.
 * - `forward_tee` 특설티(전진티): 앞으로 나가는 대신 벌타를 2 먹는다.
 *   티샷이 OB 면 특설티에서 치는 공이 4타째가 되는 그 관행이다.
 */
export type ObRule = "stroke_distance" | "forward_tee";

export const OB_RULE_LABEL: Record<ObRule, string> = {
  forward_tee: "특설티 (벌타 2)",
  stroke_distance: "정규 (벌타 1)",
};

/* ── 라운드 ──────────────────────────────────────────────────────── */

export type Shot = { club: ClubId; result: ShotResult };

export type Hole = {
  no: number;
  par: Par;
  shots: Shot[];
  putts: number;
};

export type Round = {
  id: string;
  course: string;
  /** YYYY-MM-DD */
  date: string;
  /** HH:MM */
  teeTime: string;
  holeCount: 9 | 18;
  obRule: ObRule;
  holes: Hole[];
  /** 라운드를 끝내고 저장한 시각(ms). 진행 중인 기록에는 없다. */
  finishedAt?: number;
};

/** 국내 파72 코스에서 가장 흔한 파 배열. 홀 화면에서 언제든 고칠 수 있다. */
export const DEFAULT_PARS: Par[] = [
  4, 5, 3, 4, 4, 3, 5, 4, 4,
  4, 5, 3, 4, 4, 3, 5, 4, 4,
];

/** 파에 따라 그린까지 몇 번 치는 것이 규정인가 (= 파 − 2퍼트). */
export function regulationShots(par: Par): number {
  return par - 2;
}

export function emptyHole(no: number, par: Par, teeClub: ClubId, ironClub: ClubId): Hole {
  const shots: Shot[] = [];
  for (let i = 0; i < regulationShots(par); i++) {
    shots.push({ club: i === 0 && par > 3 ? teeClub : ironClub, result: "good" });
  }
  return { no, par, shots, putts: 2 };
}

export function newRound(
  input: {
    course: string;
    date: string;
    teeTime: string;
    holeCount: 9 | 18;
    obRule: ObRule;
  },
  clubs: { teeClub: ClubId; ironClub: ClubId } = { teeClub: "Dr", ironClub: "7i" }
): Round {
  const holes: Hole[] = [];
  for (let i = 0; i < input.holeCount; i++) {
    holes.push(emptyHole(i + 1, DEFAULT_PARS[i], clubs.teeClub, clubs.ironClub));
  }
  return { id: `r${Date.now()}`, ...input, holes };
}
