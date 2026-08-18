// 토스 개발자센터 제출용 스크린샷 생성기.
//
//   npm run build:web && npm run shots
//
// 규격: 세로형 636×1048 최소 3장 / 가로형 1504×741 최소 1장.
//
// 목업을 그리지 않고 빌드된 앱을 크로미움에 띄워 실제로 캡처한다. 손으로 그린
// 그림은 앱이 바뀌면 조용히 거짓말이 되지만, 이건 dist 를 그대로 찍기 때문에
// 항상 현재 화면과 일치한다.
//
// 기록은 예시 라운드를 저장소에 심어 두고 찍는다. 이 앱은 기기 안에만 남는
// 개인 기록장이라 "몇 명이 썼다" 같은 남의 숫자가 화면에 아예 없다. 심는 것은
// 한 사람의 라운드 넉 대뿐이고, 화면에 나오는 타수·분석·추세는 그 기록으로
// 앱이 실제로 계산한 값이다.

import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const OUT = path.join(HERE, "out", "screenshots");

const PORT = 4391;
const PORTRAIT = { width: 636, height: 1048 };
const LANDSCAPE = { width: 1504, height: 741 };

if (!existsSync(path.join(ROOT, "dist", "index.html"))) {
  console.error("dist 가 없다. 먼저 `npm run build:web` 을 돌릴 것.");
  process.exit(1);
}
mkdirSync(OUT, { recursive: true });

/* ── 예시 기록 ───────────────────────────────────────────────────── */

const PARS = [4, 5, 3, 4, 4, 3, 5, 4, 4, 4, 5, 3, 4, 4, 3, 5, 4, 4];
const MISSES = ["ob_right", "hazard_left", "rough_right", "duff", "top", "bunker", "sky"];

/** 씨앗을 주면 늘 같은 그림이 나오도록 작은 LCG 를 쓴다. */
function rng(seed) {
  let s = seed;
  return () => ((s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
}

/** skill 이 낮을수록 잘 친 라운드가 된다. */
function makeRound({ id, course, date, teeTime, finishedAt, seed, skill }) {
  const rand = rng(seed);
  const holes = PARS.map((par, i) => {
    const shots = [];
    const count = par - 2 + (rand() < skill ? 1 : 0);
    for (let k = 0; k < count; k++) {
      const club = k === 0 && par > 3 ? "Dr" : par === 3 && k === 0 ? "7i" : k === count - 1 ? "SW" : "7i";
      const miss = rand() < skill * 0.7 ? MISSES[Math.floor(rand() * MISSES.length)] : "good";
      shots.push({ club, result: miss });
    }
    const putts = rand() < skill * 0.6 ? 3 : rand() < 0.18 ? 1 : 2;
    return { no: i + 1, par, shots, putts };
  });
  return { id, course, date, teeTime, holeCount: 18, obRule: "forward_tee", holes, finishedAt };
}

const ROUNDS = [
  makeRound({ id: "r4", course: "남서울CC", date: "2026-08-16", teeTime: "06:20", finishedAt: 4e12, seed: 41, skill: 0.24 }),
  makeRound({ id: "r3", course: "레이크우드CC", date: "2026-07-28", teeTime: "07:10", finishedAt: 3e12, seed: 33, skill: 0.3 }),
  makeRound({ id: "r2", course: "남서울CC", date: "2026-07-05", teeTime: "05:50", finishedAt: 2e12, seed: 27, skill: 0.34 }),
  makeRound({ id: "r1", course: "이스트밸리CC", date: "2026-06-14", teeTime: "06:40", finishedAt: 1e12, seed: 12, skill: 0.4 }),
];

/* ── 크로미움 ────────────────────────────────────────────────────── */

// 이 환경에는 크로미움이 미리 깔려 있다(PLAYWRIGHT_BROWSERS_PATH). 새로
// 내려받지 말고 있는 바이너리를 찾아 쓴다.
function chromiumPath() {
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH ?? "/opt/pw-browsers";
  if (!existsSync(base)) return undefined;
  for (const dir of readdirSync(base)) {
    const bin = path.join(base, dir, "chrome-linux", "chrome");
    if (dir.startsWith("chromium-") && existsSync(bin)) return bin;
  }
  return undefined;
}

const server = spawn("npx", ["vite", "preview", "--port", String(PORT), "--strictPort"], {
  cwd: ROOT,
  stdio: "ignore",
});
for (let i = 0; i < 60; i++) {
  try {
    if ((await fetch(`http://localhost:${PORT}/`)).ok) break;
  } catch {
    // 아직 안 떴다
  }
  await new Promise((r) => setTimeout(r, 250));
}

const browser = await chromium.launch({ executablePath: chromiumPath() });

async function shot(page, name) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(250);
  await page.screenshot({ path: path.join(OUT, `${name}.png`) });
  console.log(`  ${name}.png`);
}

/* ── 세로형 ──────────────────────────────────────────────────────── */

console.log("세로형 636×1048\n");
const page = await browser.newPage({ viewport: PORTRAIT, deviceScaleFactor: 1 });
await page.goto(`http://localhost:${PORT}/`);
await page.evaluate((rounds) => {
  localStorage.clear();
  localStorage.setItem("golf:rounds", JSON.stringify(rounds));
  localStorage.setItem(
    "golf:prefs",
    JSON.stringify({ lastCourse: "남서울CC", obRule: "forward_tee", teeClub: "Dr", ironClub: "7i" })
  );
}, ROUNDS);
await page.reload();

await page.getByText("내 기록").waitFor();
await shot(page, "portrait-1-home");

await page.getByRole("button", { name: "새 라운드 시작" }).click();
await shot(page, "portrait-2-setup");

await page.getByRole("button", { name: "1번홀부터 시작" }).click();
await page.locator(".hole-score b").waitFor();
await shot(page, "portrait-3-hole");

await page.locator(".shot-block").first().locator(".chip.res").click();
await shot(page, "portrait-4-result-picker");

// 티샷을 우 OB 로 찍어 벌타가 붙은 화면을 남긴다
await page.getByRole("button", { name: /^우 OB/ }).click();
await shot(page, "portrait-5-hole-penalty");

// 넣던 라운드는 버리고 지난 기록을 연다
await page.getByRole("button", { name: "여기서 끝내기" }).click();
await page.getByRole("button", { name: "기록 버리고 나가기" }).click();
await page.locator(".round-card").first().click();
await page.locator(".total-main b").waitFor();
await shot(page, "portrait-6-review");

await page.evaluate(() => window.scrollTo(0, 620));
await shot(page, "portrait-7-trend");

await page.evaluate(() => window.scrollTo(0, 1320));
await shot(page, "portrait-8-analysis");

/* ── 가로형 ──────────────────────────────────────────────────────── */

console.log("\n가로형 1504×741\n");

const asDataUri = (name) =>
  "data:image/png;base64," + readFileSync(path.join(OUT, `${name}.png`)).toString("base64");

// 앱을 1504 폭으로 띄우면 본문이 가운데 560px 에만 몰리고 양옆이 텅 빈다.
// 그래서 방금 찍은 세로 캡처를 그대로 얹어 가로로 배치한다. 새로 그리는 게
// 아니라 진짜 캡처를 놓는 것이다.
const compose = (heading, lead, tag, shots) => `<!doctype html>
<html lang="ko"><head><meta charset="utf-8">
<style>
  :root{--bg:#F2F5F1;--text:#16221A;--muted:#6B7C70;--green:#1F7A46;--line:#DDE4DB}
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:${LANDSCAPE.width}px;height:${LANDSCAPE.height}px;background:var(--bg);
       background-image:radial-gradient(110% 90% at 12% -20%,rgba(31,122,70,.12),rgba(0,0,0,0) 62%);
       font-family:-apple-system,Pretendard,"Apple SD Gothic Neo","Noto Sans KR",sans-serif;
       display:flex;align-items:center;gap:56px;padding:0 78px;overflow:hidden}
  .copy{flex:0 0 520px}
  .eyebrow{font-size:17px;font-weight:800;letter-spacing:.2em;color:var(--green);margin-bottom:20px}
  h1{font-size:64px;font-weight:800;line-height:1.12;letter-spacing:-.03em;color:var(--text)}
  h2{font-size:30px;font-weight:800;color:var(--green);margin-top:14px;letter-spacing:-.02em}
  p{font-size:20px;line-height:1.8;color:var(--muted);margin-top:28px}
  .shots{flex:1;display:flex;gap:28px;align-items:center;justify-content:flex-end}
  /* 가용폭 = 1504 - 좌우여백156 - 카피520 - 간격56 - 이미지간격28 = 744
     장당 372px → 높이 = 372 * 1048/636 ≒ 613. 여유를 두고 588. */
  .shots img{height:588px;border:1px solid var(--line);border-radius:18px;
             box-shadow:0 20px 46px rgba(22,34,26,.18);display:block}
</style></head>
<body>
  <div class="copy">
    <div class="eyebrow">GOLF SCORE</div>
    <h1>${heading}</h1>
    <h2>${lead}</h2>
    <p>${tag}</p>
  </div>
  <div class="shots">${shots.map((s) => `<img src="${asDataUri(s)}">`).join("")}</div>
</body></html>`;

const wide = await browser.newPage({ viewport: LANDSCAPE, deviceScaleFactor: 1 });

await wide.setContent(
  compose(
    "홀마다 세 번,<br>그걸로 끝",
    "클럽 · 미스 · 퍼트",
    "잘 친 샷은 누를 것이 없습니다.<br>기본값이 정타라, 미스만 찍으면<br>타수가 알아서 맞습니다.",
    ["portrait-3-hole", "portrait-4-result-picker"]
  ),
  { waitUntil: "networkidle" }
);
await shot(wide, "landscape-1-input");

await wide.setContent(
  compose(
    "무엇 때문에<br>잃었는지까지",
    "라운딩 분석 · 추세",
    "뒤땅 몇 회, 미스가 어느 쪽으로,<br>벌타로 몇 타를 잃었는지.<br>지난 라운드와도 견줍니다.",
    ["portrait-6-review", "portrait-8-analysis"]
  ),
  { waitUntil: "networkidle" }
);
await shot(wide, "landscape-2-analysis");

await browser.close();
server.kill();

writeFileSync(
  path.join(OUT, "README.txt"),
  "빌드된 앱을 크로미움으로 직접 캡처한 것입니다. 앱을 고쳤으면 npm run build:web && npm run shots 로 다시 뽑으세요.\n"
);
console.log(`\n출력 위치: ${path.relative(process.cwd(), OUT)}`);
