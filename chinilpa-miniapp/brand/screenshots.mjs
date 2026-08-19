// 토스 개발자센터 제출용 스크린샷 생성기.
//
//   npm run build && npm run shots
//
// 규격: 세로형 636×1048 최소 3장 / 가로형 1504×741 최소 1장.
//
// 목업을 그리지 않고 빌드된 앱을 크로미움에 띄워 실제로 캡처한다. 손으로
// 그린 그림은 앱이 바뀌면 조용히 거짓말이 되지만, 이건 dist 를 그대로 찍기
// 때문에 항상 현재 화면과 일치한다.
//
// 집계 API 응답은 가로채지 않는다. 없는 이용자 수를 지어내면 스토어에
// 거짓을 올리는 셈이 된다. 표본이 없을 때 실제로 보이는 화면 그대로 찍는다.

import { chromium } from "playwright";
import { preview } from "vite";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const OUT = path.join(HERE, "out", "screenshots");

const PORT = 4390;
const PORTRAIT = { width: 636, height: 1048 };
const LANDSCAPE = { width: 1504, height: 741 };

if (!fs.existsSync(path.join(ROOT, "dist", "index.html"))) {
  console.error("dist 가 없다. 먼저 `npm run build` 를 돌릴 것.");
  process.exit(1);
}

fs.mkdirSync(OUT, { recursive: true });

const server = await preview({
  root: ROOT,
  preview: { port: PORT, strictPort: true },
});

// 이 환경에는 크로미움이 미리 깔려 있고(PLAYWRIGHT_BROWSERS_PATH), 그 빌드
// 번호가 npm 으로 받은 playwright 가 기대하는 것과 다르다. 새로 내려받지 말고
// 있는 바이너리를 직접 가리킨다.
const CHROMIUM = "/opt/pw-browsers/chromium";
const browser = await chromium.launch(
  fs.existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
);

/** 웹폰트가 다 들어오고 도장 애니메이션이 끝날 때까지 기다린다 */
async function settle(page) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(900);
}

async function openApp(viewport) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
  await settle(page);
  return page;
}

/** 문항 화면에서 n번째(1-base) 선택지를 고른다 */
async function pick(page, n) {
  await page.locator(".opt").nth(n - 1).click();
  await page.waitForTimeout(120);
}

async function shot(page, name) {
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file });
  const { width, height } = page.viewportSize();
  console.log(`  ${name}.png`.padEnd(34), `${width}×${height}`);
}

// ── 세로형 ─────────────────────────────────────────────────────────
console.log(`세로형 ${PORTRAIT.width}×${PORTRAIT.height}`);
{
  const page = await openApp(PORTRAIT);

  // 1. 표지
  await shot(page, "portrait-1-intro");

  // 2. 첫 문항 (序 · 1936 — 아직 아무것도 걸려 있지 않은 선택)
  await page.locator(".btn").first().click();
  await settle(page);
  await shot(page, "portrait-2-question-1936");

  // 3. 무게가 실린 뒷 문항까지 진행 (1944 징용 영장)
  //    序·1937×2·1938×2·1940×2·1941×2 = 9문항을 지나면 1942 로 들어간다
  for (let i = 0; i < 12; i++) await pick(page, 2);
  await settle(page);
  await shot(page, "portrait-3-question-late");

  // 4. 에필로그 (해방 다음 날)
  for (let i = 0; i < 3; i++) await pick(page, 2);
  await settle(page);
  await shot(page, "portrait-4-epilogue");

  // 5. 결과
  await pick(page, 2);
  await settle(page);
  await shot(page, "portrait-5-result");

  // 6. 결과 하단 — 꺾인 지점 분포
  await page.evaluate(() => {
    const el = document.querySelector("h3.sechead:last-of-type");
    el?.scrollIntoView({ block: "start", behavior: "instant" });
  });
  await page.waitForTimeout(900); // 막대 채워지는 트랜지션
  await shot(page, "portrait-6-breakdown");

  await page.close();
}

// ── 가로형 ─────────────────────────────────────────────────────────
// 앱을 그냥 1504 폭으로 띄워 찍으면 본문이 가운데 560px 에만 몰리고 양옆이
// 텅 빈다. 대신 방금 찍은 세로 화면을 그대로 얹어 가로로 구성한다. 그림을
// 새로 그리는 게 아니라 실제 캡처를 배치하는 것이라 화면과 어긋날 일이 없다.
console.log(`\n가로형 ${LANDSCAPE.width}×${LANDSCAPE.height}`);
{
  const asDataUri = (name) =>
    "data:image/png;base64," +
    fs.readFileSync(path.join(OUT, `${name}.png`)).toString("base64");

  const compose = (heading, lead, tag, shots) => `<!doctype html>
<html lang="ko"><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@400;700;800&family=Noto+Serif+KR:wght@400;700;900&display=swap">
<style>
  :root{--paper:#D8D3C2;--ink:#1C1F26;--ink-soft:#4A4F5A;--rule:#B0A992;--seal:#8E2B1F;
        --serif:"Nanum Myeongjo","Noto Serif KR",Batang,serif}
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:${LANDSCAPE.width}px;height:${LANDSCAPE.height}px;background:var(--paper);
       background-image:radial-gradient(120% 90% at 20% -10%,rgba(0,0,0,.06),rgba(0,0,0,0) 60%);
       font-family:var(--serif);display:flex;align-items:center;gap:64px;padding:0 78px;overflow:hidden}
  .copy{flex:0 0 500px}
  .eyebrow{font-size:19px;letter-spacing:.34em;color:var(--ink-soft);margin-bottom:18px}
  .rule{height:4px;background:var(--ink);margin-bottom:4px}
  .rule2{height:2px;background:var(--rule);margin-bottom:40px}
  h1{font-size:70px;font-weight:800;line-height:1.08;letter-spacing:-.02em;color:var(--ink)}
  h2{font-size:38px;font-weight:800;color:var(--seal);margin-top:10px}
  p{font-size:21px;line-height:1.8;color:var(--ink-soft);margin-top:30px}
  .shots{flex:1;display:flex;gap:30px;align-items:center;justify-content:flex-end}
  /* 세로 캡처 2장이 잘리지 않게 높이를 폭에서 역산한다.
     가용폭 = 1504 - 좌우여백156 - 카피500 - 간격64 - 이미지간격30 = 754
     장당 377px → 높이 = 377 * 1048/636 ≒ 621. 여유를 두고 590. */
  .shots img{height:590px;border:1px solid var(--rule);
             box-shadow:0 18px 44px rgba(28,31,38,.22);display:block}
</style></head>
<body>
  <div class="copy">
    <div class="eyebrow">身元調書 第二號</div>
    <div class="rule"></div><div class="rule2"></div>
    <h1>${heading}</h1>
    <h2>${lead}</h2>
    <p>${tag}</p>
  </div>
  <div class="shots">${shots.map((s) => `<img src="${asDataUri(s)}">`).join("")}</div>
</body></html>`;

  const page = await browser.newPage({ viewport: LANDSCAPE, deviceScaleFactor: 1 });

  await page.setContent(
    compose(
      "친일파 테스트",
      "1940년, 당신의 선택",
      "열여섯 번의 갈림길이 있습니다.<br>처음엔 아무것도 걸려 있지 않고,<br>마지막엔 사람의 목숨이 걸립니다.",
      ["portrait-1-intro", "portrait-2-question-1936"]
    ),
    { waitUntil: "networkidle" }
  );
  await settle(page);
  await shot(page, "landscape-1-hero");

  await page.setContent(
    compose(
      "당신이 꺾인 지점",
      "아홉 가지 결과",
      "최종 유형만이 아니라<br>당신이 처음으로 물러선 시점을<br>함께 보여줍니다.",
      ["portrait-5-result", "portrait-6-breakdown"]
    ),
    { waitUntil: "networkidle" }
  );
  await settle(page);
  await shot(page, "landscape-2-result");

  await page.close();
}

await browser.close();
await server.close();

console.log(`\n출력 위치: ${path.relative(process.cwd(), OUT)}`);
