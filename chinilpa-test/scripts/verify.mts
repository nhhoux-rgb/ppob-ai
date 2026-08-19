// 데이터 무결성 + 판정 전수 검증.
//
//   npm run verify
//
// 몬테카를로(calibrate)는 표본이라 "도달 불가"를 증명하지 못한다. 여기서는
// 가능한 응답 조합 3^15 = 14,348,907 가지를 전부 돌려서
//   · 아홉 유형이 실제로 모두 나오는지
//   · 각 유형에 도달하는 실제 응답 경로가 무엇인지
//   · 균등 가중 기준 정확한 분포가 어떤지
// 를 확인한다.

import { QUESTIONS, EPILOGUE, BREAK_LABEL, STAGE_LABEL } from "../app/questions.ts";
import { TYPES, TYPE_KEYS, decide } from "../app/types.ts";

let failures = 0;
function check(ok: boolean, label: string) {
  if (!ok) {
    console.error(`  ✗ ${label}`);
    failures += 1;
  }
}

// ── 1. 데이터 무결성 ────────────────────────────────────────────────
console.log("데이터 무결성");

check(QUESTIONS.length === 15, `채점 문항 15개 (실제 ${QUESTIONS.length})`);
check(EPILOGUE.o.length === 3, "에필로그 선택지 3개");

let informOptions = 0;
QUESTIONS.forEach((q, i) => {
  const tag = `Q${i + 1}(${q.yr})`;
  check(q.o.length === 3, `${tag} 선택지 3개`);
  check(STAGE_LABEL[q.st] !== undefined, `${tag} 단계 라벨 존재 (st=${q.st})`);
  q.o.forEach((o, k) => {
    check(o.b >= 0 && o.b <= 2, `${tag}-${k + 1} 신념 0~2 (${o.b})`);
    check(o.a >= 0 && o.a <= 2, `${tag}-${k + 1} 적극성 0~2 (${o.a})`);
    check(o.d === 1 || o.d === -1, `${tag}-${k + 1} 태도 ±1 (${o.d})`);
    check(o.t.trim().length > 0, `${tag}-${k + 1} 문구 비어있지 않음`);
    if (o.inform) informOptions += 1;
  });
  // 각 문항에 "꺾이는" 선택지가 하나 이상 있어야 꺾인 지점이 의미를 갖는다
  check(q.o.some((o) => !o.r), `${tag} 꺾이는 선택지 존재`);
  check(q.o.some((o) => o.r), `${tag} 지키는 선택지 존재`);
});
check(informOptions === 2, `밀고 선택지 2개 (실제 ${informOptions})`);

// 연도는 오름차순이어야 한다 (문항 순서 = 시간 순서)
for (let i = 1; i < QUESTIONS.length; i++) {
  check(
    QUESTIONS[i].yr >= QUESTIONS[i - 1].yr,
    `Q${i + 1} 연도 역행 (${QUESTIONS[i - 1].yr} → ${QUESTIONS[i].yr})`
  );
  check(
    QUESTIONS[i].st >= QUESTIONS[i - 1].st,
    `Q${i + 1} 단계 역행 (${QUESTIONS[i - 1].st} → ${QUESTIONS[i].st})`
  );
}

// 유형 데이터
for (const k of TYPE_KEYS) {
  const t = TYPES[k];
  check(t.key === k, `${k} key 일치`);
  check(t.d.length > 0, `${k} 본문 존재`);
  check([...t.ch].length === 1, `${k} 도장 글자 1자 (${t.ch})`);
}
const pctSum = TYPE_KEYS.reduce((s, k) => s + TYPES[k].pct, 0);
check(pctSum === 100, `기본 분포 합 100 (실제 ${pctSum})`);

// ── 2. 판정 전수 검증 ───────────────────────────────────────────────
const totalPaths = 3 ** QUESTIONS.length;
console.log(`\n판정 전수 검증 — 경우의 수 ${totalPaths.toLocaleString()}`);

const counts: Record<string, number> = {};
const samplePath: Record<string, number[]> = {};
const stageCounts: Record<number, number> = {};

const path = new Array<number>(QUESTIONS.length).fill(0);
for (let n = 0; n < totalPaths; n++) {
  let rest = n;
  let belief = 0;
  let active = 0;
  let direct = 0;
  let informs = 0;
  let breakStage = -1;

  for (let i = 0; i < QUESTIONS.length; i++) {
    const k = rest % 3;
    rest = (rest - k) / 3;
    path[i] = k;
    const o = QUESTIONS[i].o[k];
    belief += o.b;
    active += o.a;
    direct += o.d;
    if (o.inform) informs += 1;
    if (!o.r && breakStage < 0) breakStage = QUESTIONS[i].st;
  }

  const type = decide({ belief, active, direct, informs });
  counts[type] = (counts[type] ?? 0) + 1;
  if (!samplePath[type]) samplePath[type] = path.slice();

  const stage = breakStage < 0 ? 6 : breakStage;
  stageCounts[stage] = (stageCounts[stage] ?? 0) + 1;
}

console.log("\n유형별 도달 가능 경로 수 (전수, 균등 가중)");
for (const k of TYPE_KEYS) {
  const c = counts[k] ?? 0;
  const pct = (c / totalPaths) * 100;
  check(c > 0, `${TYPES[k].n} 도달 불가`);
  console.log(
    `  ${TYPES[k].n.padEnd(11, " ")} ${c.toLocaleString().padStart(12)} 경로  ${pct
      .toFixed(2)
      .padStart(6)}%`
  );
}

console.log("\n꺾인 단계별 경로 수 (전수, 균등 가중)");
for (let k = 0; k <= 6; k++) {
  const c = stageCounts[k] ?? 0;
  check(c > 0, `${BREAK_LABEL[k]} 도달 불가`);
  console.log(
    `  ${BREAK_LABEL[k].padEnd(16, " ")} ${((c / totalPaths) * 100)
      .toFixed(2)
      .padStart(6)}%`
  );
}

// ── 3. 유형별 실제 응답 경로 예시 ───────────────────────────────────
console.log("\n각 유형에 도달하는 응답 예시");
for (const k of TYPE_KEYS) {
  const p = samplePath[k];
  if (!p) continue;
  console.log(`\n  [${TYPES[k].n}]  ${p.map((x) => x + 1).join(" ")}`);
  console.log(
    `    ${QUESTIONS.map((q, i) => `${q.yr} ${q.o[p[i]].t}`)
      .slice(0, 3)
      .join(" / ")} …`
  );
}

console.log(
  failures === 0
    ? "\n✓ 전부 통과"
    : `\n✗ ${failures}건 실패`
);
process.exit(failures === 0 ? 0 : 1);
