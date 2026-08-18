// 토스 개발자센터 제출용 스크린샷 생성기.
//
//   npm run build && npm run shots
//
// 규격: 세로형 636×1048 최소 3장 / 가로형 1504×741 최소 1장.
//
// 목업을 그리지 않고 빌드된 앱을 크로미움에 띄워 실제로 찍는다. 손으로 그린
// 그림은 앱이 바뀌면 조용히 거짓말이 되지만, 이건 dist 를 그대로 찍기 때문에
// 언제나 현재 화면과 일치한다.

import { chromium } from "playwright";
import { preview } from "vite";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const OUT = path.join(HERE, "out", "screenshots");

const PORT = 4392;
const PORTRAIT = { width: 636, height: 1048 };
// 제출 규격(636×1048)을 CSS 픽셀 그대로 쓰면 휴대폰보다 넓고 짧은 화면이
// 되어 영수증이 가운데 400px 에만 서고 사방이 텅 빈다. 477×786 으로 띄우고
// 4/3 배로 찍으면 영수증이 화면의 84%를 차지하면서 규격도 정확히 떨어진다.
// (636 과 1048 이 둘 다 정수로 나누어지는 배율이라야 한다. 1.5 는 안 된다.)
const SCALE = 4 / 3;
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

// 이 환경에는 크로미움이 미리 깔려 있고(PLAYWRIGHT_BROWSERS_PATH) 그 빌드
// 번호가 npm 으로 받은 playwright 가 기대하는 것과 다르다. 새로 내려받지 말고
// 있는 바이너리를 직접 가리킨다.
const CHROMIUM = "/opt/pw-browsers/chromium";
const browser = await chromium.launch(
  fs.existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
);

async function settle(page) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
}

async function openApp(viewport) {
  const page = await browser.newPage({
    // 뷰포트는 정수라야 한다. 올림해서 띄우고 찍을 때 규격대로 잘라 낸다.
    viewport: {
      width: Math.ceil(viewport.width / SCALE),
      height: Math.ceil(viewport.height / SCALE),
    },
    deviceScaleFactor: SCALE,
  });
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
  await settle(page);
  return page;
}

/** 금액과 품목을 채우고 판독을 시작한다 */
async function enter(page, price, item) {
  // 입력이 통제된 상태(콤마 자동 삽입)라 값을 밀어 넣지 않고 실제로 친다
  await page.locator(".amount-in").pressSequentially(String(price), { delay: 12 });
  if (item) await page.locator(".field-in").pressSequentially(item, { delay: 12 });
  await page.waitForTimeout(120);
}

/** 문항 화면에서 n번째(1-base) 선택지를 고른다 */
async function pick(page, n) {
  await page.locator(".opt").nth(n - 1).click();
  await page.waitForTimeout(120);
}

async function shot(page, name, clip) {
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file, ...(clip ? { clip } : {}) });
  console.log(`  ${name}.png`.padEnd(34), pngSize(file));
}

/** PNG 머리 8바이트 뒤 IHDR 에서 실제 크기를 읽는다 */
function pngSize(file) {
  const b = fs.readFileSync(file).subarray(16, 24);
  return `${b.readUInt32BE(0)}×${b.readUInt32BE(4)}`;
}

/** 세로형 제출 규격(636×1048)으로 정확히 잘라 내는 클립 */
const PORTRAIT_CLIP = {
  x: 0,
  y: 0,
  width: PORTRAIT.width / SCALE,
  height: PORTRAIT.height / SCALE,
};

/** 결과 화면 특정 지점까지 스크롤 */
async function scrollTo(page, selector) {
  await page.evaluate((s) => {
    document.querySelector(s)?.scrollIntoView({ block: "start", behavior: "instant" });
  }, selector);
  await page.waitForTimeout(250);
}

// ── 세로형 ─────────────────────────────────────────────────────────
console.log(`세로형 ${PORTRAIT.width}×${PORTRAIT.height}`);
{
  const page = await openApp(PORTRAIT);

  // 1. 금액 입력 — 239,000원짜리 운동화
  await enter(page, 239000, "운동화");
  await shot(page, "portrait-1-price", PORTRAIT_CLIP);

  // 2. 첫 문항
  await page.locator(".go").click();
  await settle(page);
  await shot(page, "portrait-2-question", PORTRAIT_CLIP);

  // 3. 마지막 문항 (승인율을 가장 크게 흔드는 문항)
  await pick(page, 1); // 거의 매일
  await pick(page, 1); // 하나도 없다
  await settle(page);
  await shot(page, "portrait-3-drink", PORTRAIT_CLIP);

  // 4. 승인 영수증
  await pick(page, 1); // 맨정신
  await settle(page);
  await shot(page, "portrait-4-approved", PORTRAIT_CLIP);

  // 5. 같은 영수증의 판독 소견
  await scrollTo(page, ".reasons-label");
  await shot(page, "portrait-5-reasons", PORTRAIT_CLIP);

  // 6. 반려 영수증 — 한두 번 쓸 물건을 네 개 갖고 취해서 사려는 경우
  await page.locator(".back.wide").click();
  await settle(page);
  await enter(page, 239000, "운동화");
  await page.locator(".go").click();
  await settle(page);
  await pick(page, 4); // 솔직히 한두 번
  await pick(page, 4); // 네 개 넘게
  await pick(page, 3); // 많이 마셨다
  await settle(page);
  await shot(page, "portrait-6-denied", PORTRAIT_CLIP);

  await page.close();
}

// ── 가로형 ─────────────────────────────────────────────────────────
// 1504 폭으로 앱을 띄우면 영수증이 가운데 400px 에만 서고 양옆이 텅 빈다.
// 대신 방금 찍은 세로 캡처를 그대로 얹어 가로로 구성한다. 새로 그리는 게
// 아니라 실제 캡처를 배치하는 것이라 화면과 어긋날 일이 없다.
console.log(`\n가로형 ${LANDSCAPE.width}×${LANDSCAPE.height}`);
{
  const asDataUri = (name) =>
    "data:image/png;base64," +
    fs.readFileSync(path.join(OUT, `${name}.png`)).toString("base64");

  const compose = (heading, lead, tag, shots) => `<!doctype html>
<html lang="ko"><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nanum+Gothic+Coding:wght@400;700&family=Noto+Serif+KR:wght@900&display=swap">
<style>
  :root{--desk:#E6E4DD;--ink:#1B1B1A;--ink-soft:#6D6C66;--rule:#CFCDC5;--stamp:#C8322A;
        --mono:"Nanum Gothic Coding",monospace}
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:${LANDSCAPE.width}px;height:${LANDSCAPE.height}px;background:var(--desk);
       background-image:radial-gradient(120% 90% at 18% -10%,rgba(0,0,0,.05),rgba(0,0,0,0) 60%);
       font-family:var(--mono);display:flex;align-items:center;gap:60px;padding:0 78px;overflow:hidden}
  .copy{flex:0 0 520px}
  .eyebrow{font-size:17px;letter-spacing:.34em;color:var(--ink-soft);margin-bottom:18px}
  .rule{border-top:3px dashed var(--ink);margin-bottom:34px}
  h1{font-size:62px;font-weight:700;line-height:1.12;letter-spacing:-.02em;color:var(--ink)}
  h2{font-size:32px;font-weight:700;color:var(--stamp);margin-top:14px}
  p{font-size:20px;line-height:1.85;color:var(--ink-soft);margin-top:28px}
  .shots{flex:1;display:flex;gap:28px;align-items:center;justify-content:flex-end}
  /* 가용폭 = 1504 - 좌우여백156 - 카피520 - 간격60 - 이미지간격28 = 740
     장당 370px → 높이 = 370 * 1048/636 ≒ 610. 여유를 두고 580. */
  .shots img{height:580px;border:1px solid var(--rule);
             box-shadow:0 18px 44px rgba(27,27,26,.20);display:block}
</style></head>
<body>
  <div class="copy">
    <div class="eyebrow">소 비 합 리 화 판 독</div>
    <div class="rule"></div>
    <h1>${heading}</h1>
    <h2>${lead}</h2>
    <p>${tag}</p>
  </div>
  <div class="shots">${shots.map((s) => `<img src="${asDataUri(s)}">`).join("")}</div>
</body></html>`;

  const page = await browser.newPage({ viewport: LANDSCAPE, deviceScaleFactor: 1 });

  await page.setContent(
    compose(
      "살까 말까 판독기",
      "가격만 넣으면 판정이 나옵니다",
      "몇 번 쓸 건지, 집에 비슷한 게 있는지,<br>지금 술을 마셨는지. 세 가지만 묻고<br>구매 승인 또는 반려를 찍어 드립니다.",
      ["portrait-1-price", "portrait-3-drink"]
    ),
    { waitUntil: "networkidle" }
  );
  await settle(page);
  await shot(page, "landscape-1-hero");

  await page.setContent(
    compose(
      "이상한 논리로<br>판정합니다",
      "승인율 · 핑계 · 후회 확률",
      "하루 327원이면 붕어빵보다 쌉니다.<br>다만 한 달에 한두 번 쓰신다면<br>그 나눗셈은 반칙이라고 말해 드립니다.",
      ["portrait-4-approved", "portrait-6-denied"]
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
