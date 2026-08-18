import { holeStrokes, holeToPar, roundTotals, isGir, fairwayHit, scoreSpread } from "../.test-build/score.js";
import { analyze, trendOf, metricsOf } from "../.test-build/analysis.js";
import { autoShort, clubLabel, clubShort, customClubId, isCustomClub } from "../.test-build/types.js";

let pass = 0, fail = 0;
function eq(actual, expected, name) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.log(`  FAIL ${name}\n       기대 ${JSON.stringify(expected)} / 실제 ${JSON.stringify(actual)}`); }
}
function ok(cond, name) { eq(!!cond, true, name); }

const hole = (no, par, shots, putts) => ({ no, par, shots, putts });
const s = (club, result = "good") => ({ club, result });

console.log("\n[벌타 계산]");
// 파4: 티샷 OB → 세컨 → 서드 → 2퍼트
const obHole = hole(1, 4, [s("Dr", "ob_right"), s("7i"), s("PW")], 2);
eq(holeStrokes(obHole, "forward_tee"), 7, "특설티 OB: 샷3 + 벌타2 + 퍼트2 = 7");
eq(holeStrokes(obHole, "stroke_distance"), 6, "정규 OB: 샷3 + 벌타1 + 퍼트2 = 6");
eq(holeToPar(obHole, "forward_tee"), 3, "  → 트리플보기(+3)");

const hz = hole(2, 4, [s("Dr"), s("7i", "hazard_left"), s("SW")], 2);
eq(holeStrokes(hz, "forward_tee"), 6, "해저드는 로컬룰과 무관하게 벌타 1");
eq(holeStrokes(hz, "stroke_distance"), 6, "  → 규칙을 바꿔도 같다");

const duff = hole(3, 4, [s("Dr"), s("7i", "duff"), s("PW"), s("SW", "top")], 2);
eq(holeStrokes(duff, "forward_tee"), 6, "뒤땅·탑볼은 벌타 없음 (샷4 + 퍼트2)");

console.log("\n[파온·페어웨이]");
eq(isGir(hole(4, 3, [s("7i")], 2), "forward_tee"), true, "파3 원온 2퍼트 = 파온");
eq(isGir(hole(5, 4, [s("Dr"), s("7i")], 2), "forward_tee"), true, "파4 투온 = 파온");
eq(isGir(hole(6, 4, [s("Dr"), s("7i"), s("SW")], 1), "forward_tee"), false, "파4 쓰리온 = 파온 아님");
eq(isGir(hole(7, 4, [s("Dr"), s("7i")], 0), "forward_tee"), false, "퍼트 0 = 그린에 안 올린 것으로 본다");
eq(isGir(hole(8, 5, [s("Dr", "ob_left"), s("3W"), s("8i")], 2), "forward_tee"), false,
   "파5에서 OB 내고 3번 쳐서 올린 것은 파온이 아니다 (벌타 포함 5타째)");
eq(fairwayHit(hole(8, 3, [s("7i")], 2)), null, "파3은 페어웨이 개념 없음");
eq(fairwayHit(hole(9, 4, [s("Dr", "rough_left"), s("7i")], 2)), false, "티샷 러프 = 페어웨이 놓침");

console.log("\n[내가 더한 클럽]");
eq(autoShort("2번 아이언"), "2i", "2번 아이언 → 2i");
eq(autoShort("7번 우드"), "7W", "7번 우드 → 7W");
eq(autoShort("4번 유틸"), "4U", "4번 유틸 → 4U");
eq(autoShort("3 하이브리드"), "3U", "3 하이브리드 → 3U");
eq(autoShort("58도"), "58", "58도 → 58");
eq(autoShort("치퍼"), "치퍼", "규칙에 안 걸리면 이름을 그대로 줄인다");
eq(autoShort("아주 긴 이름의 클럽"), "아주긴이", "  → 네 글자까지만");

const my = customClubId("2번 아이언");
eq(isCustomClub(my), true, "더한 클럽은 id 로 구분된다");
eq(isCustomClub("7i"), false, "  → 붙박이 클럽은 아니다");
eq(clubLabel(my), "2번 아이언", "id 안에 이름이 있어 목록 없이도 읽힌다");
eq(clubShort(my, [{ label: "2번 아이언", short: "2번" }]), "2번", "줄임말을 고쳐 넣으면 그걸 쓴다");
eq(clubShort(my, []), "2i", "지운 클럽이어도 이름에서 줄임말을 뽑아 낸다");
eq(clubLabel("7i"), "7번 아이언", "붙박이 클럽은 그대로");

console.log("\n[라운드 합계]");
const holes = [
  hole(1, 4, [s("Dr"), s("7i")], 2),                                   // 4  파
  hole(2, 5, [s("Dr", "ob_left"), s("3W"), s("8i")], 2),               // 3+2+2 = 7  +2
  hole(3, 3, [s("7i")], 1),                                            // 2  버디
  hole(4, 4, [s("Dr"), s("7i", "duff"), s("SW")], 3),                  // 6  +2
  hole(5, 4, [s("Dr", "rough_right"), s("7i")], 2),                    // 4  파
  hole(6, 3, [s("8i", "hazard_right"), s("SW")], 2),                   // 2+1+2 = 5  +2
  hole(7, 5, [s("Dr"), s("3W"), s("9i")], 2),                          // 5  파
  hole(8, 4, [s("Dr", "ob_right"), s("7i"), s("PW")], 2),              // 3+2+2 = 7  +3
  hole(9, 4, [s("Dr"), s("7i", "top"), s("SW")], 2),                   // 5  +1
];
const round = {
  id: "t1", course: "테스트CC", date: "2026-08-18", teeTime: "06:30",
  holeCount: 9, obRule: "forward_tee", holes, finishedAt: 1000,
};
const t = roundTotals(round);
eq(t.par, 36, "파 합계 36");
eq(t.strokes, 4 + 7 + 2 + 6 + 4 + 5 + 5 + 7 + 5, "총 타수 45");
eq(t.toPar, 9, "파 대비 +9");
eq(t.putts, 18, "퍼트 18개");
eq(t.penalties, 2 + 1 + 2, "벌타 5타 (OB 2회 × 2 + 해저드 1)");
eq(t.out.strokes, 45, "9홀이면 전반만 잡힌다");
eq(t.in, null, "  → 후반은 null");
eq(scoreSpread(round), { eagle: 0, birdie: 1, par: 3, bogey: 1, double: 3, worse: 1 }, "스코어 구성");

console.log("\n[지표]");
const m = metricsOf(round);
eq(m.strokesPer18, 90, "9홀 45타 → 18홀 환산 90타");
eq(m.sides, { left: 1, right: 3 }, "좌 1회 · 우 3회");
eq(m.contactTotal, 2, "임팩트 미스 2회 (뒤땅·탑볼)");
eq(m.ob, 2, "OB 2회");
eq(m.hazard, 1, "해저드 1회");
eq(m.threePuttHoles, 1, "3퍼트 1홀");
eq(m.gir.hit, 4, "파온 4홀");
eq(m.fairway.of, 7, "파4·파5는 7홀");
eq(m.fairway.hit, 4, "  → 그중 페어웨이 4번 (OB 2회·러프 1회는 놓친 것)");
ok(Math.abs(m.byPar[3] - 3.5) < 1e-9, "파3 평균 3.5타");

console.log("\n[요약·진단]");
const a = analyze(round);
console.log("  한줄요약:", a.headline);
ok(a.headline.includes("45타"), "한줄요약에 타수가 들어간다");
ok(a.findings.length >= 6, `진단 카드 ${a.findings.length}개`);
for (const f of a.findings) console.log(`  · [${f.tone}] ${f.title}: ${f.detail}`);

console.log("\n[추세]");
const t1 = trendOf(round, [round]);
eq(t1.enough, false, "라운드 1개면 추세를 말하지 않는다");
console.log("  ", t1.summary);

const worse = (id, mult) => ({
  ...round, id, finishedAt: Number(id.slice(1)),
  holes: holes.map((h) => ({ ...h, putts: h.putts + mult })),
});
const past = [worse("r1", 1), worse("r2", 1), worse("r3", 1)];
const t2 = trendOf(round, [...past, round]);
eq(t2.enough, true, "지난 라운드 3개면 견준다");
eq(t2.verdict, "better", "퍼트가 9개 줄었으니 좋아진 것으로 판정");
console.log("  ", t2.summary);
eq(t2.history.length, 4, "그래프 점 4개");

// 예전 기록을 다시 열었을 때는 그 뒤에 친 라운드와 견주면 안 된다
const middle = past[1];                       // finishedAt = 2
const t3 = trendOf(middle, [...past, round]); // round 의 finishedAt = 1000
eq(t3.enough, false, "그 라운드 이전 기록이 1개뿐이면 견주지 않는다");
eq(t3.history.length, 2, "  → 그래프도 그 시점까지만 그린다");

const t4 = trendOf(past[2], [...past, round]);
eq(t4.enough, true, "이전 기록이 2개면 견준다");
eq(t4.history[t4.history.length - 1].per18, t4.current, "  → 그래프의 마지막 점이 보고 있는 라운드다");

console.log(`\n${pass}개 통과, ${fail}개 실패`);
process.exit(fail ? 1 : 0);
