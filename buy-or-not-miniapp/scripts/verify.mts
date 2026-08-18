/**
 * 판정 엔진 성질 검사.
 *
 * 문구를 고치다 보면 계수도 같이 건드리게 되는데, 그때 조용히 깨지는 것들이
 * 있다. 승인율이 100%를 넘거나, 술을 더 마셨는데 판정이 후해지거나, 같은
 * 입력에 다른 승인번호가 나오는 식이다. 눈으로는 안 보인다. 그래서 전 조합을
 * 돌려서 확인한다.
 *
 *   node --experimental-strip-types scripts/verify.mts
 */

import {
  DRUNK_OPTIONS,
  DUPE_OPTIONS,
  FREQ_OPTIONS,
  judge,
  shareText,
  type Answers,
  type Drunk,
  type Dupe,
  type Freq,
} from "../src/verdict.ts";

const FREQS = FREQ_OPTIONS.map((o) => o.v);
const DUPES = DUPE_OPTIONS.map((o) => o.v);
const DRUNKS = DRUNK_OPTIONS.map((o) => o.v);

/** 100원짜리부터 1억짜리까지. 구간 경계값을 일부러 끼워 넣었다. */
const PRICES = [
  100, 1_000, 4_900, 9_900, 29_999, 30_000, 45_000, 99_999, 100_000, 149_000,
  239_000, 299_999, 300_000, 550_000, 999_999, 1_000_000, 2_400_000, 12_000_000,
  100_000_000,
];

let checked = 0;
const fails: string[] = [];
const fail = (msg: string) => fails.push(msg);

const at = (price: number, freq: Freq, dupe: Dupe, drunk: Drunk): Answers => ({
  price,
  item: "테스트 물건",
  freq,
  dupe,
  drunk,
});

/* ── 1. 범위와 형태 ─────────────────────────────────────────────── */

for (const price of PRICES)
  for (const freq of FREQS)
    for (const dupe of DUPES)
      for (const drunk of DRUNKS) {
        const a = at(price, freq, dupe, drunk);
        const v = judge(a);
        const where = `${price}/${freq}/${dupe}/${drunk}`;
        checked += 1;

        if (v.approval < 3 || v.approval > 97) fail(`승인율 범위 이탈 ${v.approval} @ ${where}`);
        if (v.regret < 4 || v.regret > 96) fail(`후회 확률 범위 이탈 ${v.regret} @ ${where}`);
        if (!Number.isInteger(v.approval) || !Number.isInteger(v.regret))
          fail(`백분율이 정수가 아니다 @ ${where}`);
        if (!"SABCDF".includes(v.excuse)) fail(`핑계 등급이 이상하다 ${v.excuse} @ ${where}`);
        if (v.lines.length !== 4 || v.lines.some((l) => !l.trim()))
          fail(`판정 문구가 네 줄이 아니다 @ ${where}`);
        if (!/^\d{4}-\d{3}-\d{3}$/.test(v.approvalNo))
          fail(`승인번호 형식이 깨졌다 ${v.approvalNo} @ ${where}`);

        // 도장 두 글자와 등급이 어긋나면 화면이 거짓말을 한다
        const expected =
          v.approval >= 66 ? "승인" : v.approval >= 50 ? "보류" : v.approval >= 34 ? "재고" : "반려";
        if (v.stamp !== expected) fail(`도장(${v.stamp})과 승인율(${v.approval})이 어긋난다 @ ${where}`);

        // 공유 문구에 결과 숫자가 그대로 실려야 한다
        const s = shareText(a, v);
        if (!s.includes(`${v.approval}%`) || !s.includes(`${v.regret}%`))
          fail(`공유 문구와 화면 숫자가 다르다 @ ${where}`);
      }

/* ── 2. 단조성 ──────────────────────────────────────────────────── */
// 나머지를 고정하고 한 축만 나쁜 쪽으로 옮겼을 때, 승인율은 오르면 안 되고
// 후회 확률은 내리면 안 된다. 축마다 순서는 위 배열 순서다.

function monotone(
  axis: string,
  variants: Answers[],
) {
  for (let i = 1; i < variants.length; i += 1) {
    const prev = judge(variants[i - 1]);
    const cur = judge(variants[i]);
    if (cur.approval > prev.approval)
      fail(`${axis}: 나빠졌는데 승인율이 올랐다 ${prev.approval}→${cur.approval}`);
    if (cur.regret < prev.regret)
      fail(`${axis}: 나빠졌는데 후회 확률이 내렸다 ${prev.regret}→${cur.regret}`);
  }
}

for (const price of PRICES) {
  for (const dupe of DUPES)
    for (const drunk of DRUNKS)
      monotone(
        `사용 빈도 @ ${price}/${dupe}/${drunk}`,
        FREQS.map((f) => at(price, f, dupe, drunk))
      );

  for (const freq of FREQS)
    for (const drunk of DRUNKS)
      monotone(
        `보유 개수 @ ${price}/${freq}/${drunk}`,
        DUPES.map((d) => at(price, freq, d, drunk))
      );

  for (const freq of FREQS)
    for (const dupe of DUPES)
      monotone(
        `음주 @ ${price}/${freq}/${dupe}`,
        DRUNKS.map((d) => at(price, freq, dupe, d))
      );
}

/* 값이 오르면 승인율이 내려가야 한다 — 같은 답에 가격만 올린 경우 */
for (const freq of FREQS)
  for (const dupe of DUPES)
    for (const drunk of DRUNKS) {
      let prev = judge(at(PRICES[0], freq, dupe, drunk));
      for (const price of PRICES.slice(1)) {
        const cur = judge(at(price, freq, dupe, drunk));
        if (cur.approval > prev.approval)
          fail(`가격이 올랐는데 승인율이 올랐다 ${prev.approval}→${cur.approval} @ ${price}/${freq}`);
        if (cur.regret < prev.regret)
          fail(`가격이 올랐는데 후회 확률이 내렸다 ${prev.regret}→${cur.regret} @ ${price}/${freq}`);
        prev = cur;
      }
    }

/* ── 3. 결정성 ──────────────────────────────────────────────────── */

for (const price of PRICES)
  for (const freq of FREQS) {
    const a = at(price, freq, "few", "buzzed");
    const first = JSON.stringify(judge(a));
    for (let i = 0; i < 3; i += 1)
      if (JSON.stringify(judge(a)) !== first) fail(`같은 입력에 다른 결과 @ ${price}/${freq}`);
  }

/* 물건 이름이 다르면 승인번호도 달라야 한다(같으면 공유 화면이 다 똑같아진다) */
{
  const base = { price: 239_000, freq: "daily", dupe: "none", drunk: "sober" } as const;
  const seen = new Set(
    ["운동화", "키보드", "의자", "가방", ""].map((item) => judge({ ...base, item }).approvalNo)
  );
  if (seen.size !== 5) fail("물건 이름이 달라도 승인번호가 겹친다");
}

/* ── 4. 판정이 한쪽으로 쏠리지 않는가 ───────────────────────────── */
// 계수를 올리다 보면 뭘 넣어도 승인하는 기계가 되고, 내리다 보면 판독기가
// 아니라 잔소리가 된다. 조합을 고르게 훑었을 때의 비율로 그 둘을 막는다.

{
  const tally: Record<string, number> = {};
  let n = 0;
  for (const price of PRICES)
    for (const freq of FREQS)
      for (const dupe of DUPES)
        for (const drunk of DRUNKS) {
          const s = judge(at(price, freq, dupe, drunk)).stamp;
          tally[s] = (tally[s] ?? 0) + 1;
          n += 1;
        }
  const share = (k: string) => ((tally[k] ?? 0) / n) * 100;
  if (share("승인") < 10 || share("승인") > 35)
    fail(`승인 비율이 ${share("승인").toFixed(1)}% — 10~35% 밖이다`);
  if (share("반려") < 20 || share("반려") > 55)
    fail(`반려 비율이 ${share("반려").toFixed(1)}% — 20~55% 밖이다`);
  console.log(
    "판정 분포  " +
      ["승인", "보류", "재고", "반려"].map((k) => `${k} ${share(k).toFixed(0)}%`).join(" · ")
  );
}

/* ── 5. 예시로 든 장면이 실제로 그렇게 나오는가 ──────────────────── */

{
  // 239,000원 운동화를 매일 신고, 비슷한 게 없고, 맨정신
  const v = judge({ price: 239_000, item: "운동화", freq: "daily", dupe: "none", drunk: "sober" });
  if (v.stamp !== "승인") fail(`운동화 예시가 승인이 아니다: ${v.stamp} (${v.approval}%)`);
  if (v.approval !== 87) fail(`운동화 예시의 승인율이 87%가 아니다: ${v.approval}%`);
  if (Math.round(v.perDay) !== 327) fail(`하루당 계산이 327원이 아니다: ${Math.round(v.perDay)}`);

  // 같은 물건, 집에 네 개 있고 취한 채로
  const w = judge({ price: 239_000, item: "운동화", freq: "rarely", dupe: "many", drunk: "drunk" });
  if (w.stamp !== "반려") fail(`네 개 있고 취한 경우가 반려가 아니다: ${w.stamp} (${w.approval}%)`);
  if (!w.lines[2].includes("정신 차리십시오")) fail("네 개 있을 때 문구가 바뀌었다");
}

/* ── 결과 ───────────────────────────────────────────────────────── */

console.log(`조합 ${checked.toLocaleString("ko-KR")}가지 확인`);
if (fails.length) {
  const shown = fails.slice(0, 12);
  for (const f of shown) console.error(`  ✗ ${f}`);
  if (fails.length > shown.length) console.error(`  … 외 ${fails.length - shown.length}건`);
  console.error(`\n실패 ${fails.length}건`);
  process.exit(1);
}
console.log("통과");
