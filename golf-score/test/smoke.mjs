/* 화면 연결 확인. 빌드된 앱을 크로미움에 띄우고 실제로 눌러 본다.
 * 계산 자체는 test/logic.test.mjs 가 보고, 여기서는 "눌렀을 때 그 값이
 * 화면에 그대로 나오는가"만 확인한다.
 *
 *   npm run build:web && node test/smoke.mjs */

import { spawn } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

/* 이 환경에는 크로미움이 /opt/pw-browsers 에 미리 깔려 있다. playwright 가
   기대하는 리비전과 폴더 이름이 어긋날 때가 있어 직접 찾아서 넘긴다. */
function chromiumPath() {
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH ?? "/opt/pw-browsers";
  if (!existsSync(base)) return undefined;
  for (const dir of readdirSync(base)) {
    if (!dir.startsWith("chromium-")) continue;
    const bin = join(base, dir, "chrome-linux", "chrome");
    if (existsSync(bin)) return bin;
  }
  return undefined;
}

const root = fileURLToPath(new URL("..", import.meta.url));
const PORT = 4183;

let pass = 0;
let fail = 0;
function check(cond, name) {
  if (cond) {
    pass++;
    console.log(`  ok  ${name}`);
  } else {
    fail++;
    console.log(`  FAIL ${name}`);
  }
}

const server = spawn("npx", ["vite", "preview", "--port", String(PORT), "--strictPort"], {
  cwd: root,
  stdio: "ignore",
});

async function waitForServer() {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`http://localhost:${PORT}/`);
      if (res.ok) return;
    } catch {
      // 아직 안 떴다
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error("vite preview 가 뜨지 않았다");
}

try {
  await waitForServer();
  const browser = await chromium.launch({ executablePath: chromiumPath() });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(`http://localhost:${PORT}/`);

  // 저장소가 비어 있는 상태에서 시작한다
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await page.getByText("아직 기록이 없습니다").waitFor();
  check(true, "첫 실행 화면이 뜬다");

  await page.getByRole("button", { name: "새 라운드 시작" }).click();
  await page.getByPlaceholder("구장 이름").fill("테스트CC");
  await page.getByRole("button", { name: "9홀" }).click();
  await page.getByRole("button", { name: "1번홀부터 시작" }).click();

  const holeScore = page.locator(".hole-score b");
  await holeScore.waitFor();
  check((await holeScore.textContent()) === "4", "1번홀 파4 기본값이 4타로 잡힌다");

  // 티샷을 우 OB 로 바꾼다 → 특설티 규칙이므로 벌타 2
  await page.locator(".shot-block").first().locator(".chip.res").click();
  await page.getByRole("button", { name: /^우 OB/ }).click();
  check((await holeScore.textContent()) === "6", "티샷 우 OB 를 찍으면 6타가 된다 (벌타 2)");
  check(
    (await page.locator(".shot-block").first().locator(".chip.res").textContent())?.includes("+2"),
    "  → 샷 줄에 +2 벌타 배지가 붙는다"
  );

  // 목록에 없는 클럽을 더해 본다
  await page.locator(".shot-block").first().locator(".chip.club").click();
  await page.getByRole("button", { name: "+ 클럽 추가" }).click();
  await page.getByPlaceholder(/2번 아이언/).fill("7번 우드");
  check(
    (await page.locator(".club-form .cf-row input").nth(1).inputValue()) === "7W",
    "클럽 이름을 넣으면 줄임말이 따라 채워진다"
  );
  await page.getByRole("button", { name: "클럽 추가", exact: true }).click();
  check(
    (await page.locator(".shot-block").first().locator(".chip.club").textContent()) === "7W",
    "  → 더하자마자 그 샷의 클럽이 된다"
  );

  await page.locator(".shot-block").first().locator(".chip.club").click();
  check(
    (await page.getByRole("button", { name: "7번 우드", exact: true }).count()) === 1,
    "  → '내 클럽' 에 남아 다시 고를 수 있다"
  );
  await page.keyboard.press("Escape");
  await page.locator(".shot-block").first().locator(".chip.club").click();

  await page.getByRole("button", { name: "다음 홀 →" }).click();
  await page.getByText("2번홀").waitFor();
  check((await holeScore.textContent()) === "5", "2번홀 파5 기본값이 5타로 잡힌다");

  // 퍼트를 하나 늘려 본다
  await page.locator(".putt-row .step-btn").last().click();
  check((await holeScore.textContent()) === "6", "퍼트를 하나 늘리면 6타가 된다");

  // 2번홀까지만 저장하고 끝낸다
  await page.getByRole("button", { name: "여기서 끝내기" }).click();
  await page.getByRole("button", { name: "여기까지 저장" }).click();

  await page.locator(".total-main b").waitFor();
  check((await page.locator(".total-main b").textContent()) === "12", "결과 화면 총타수 12타 (6 + 6)");
  check((await page.locator(".total-par").textContent())?.trim() === "+3", "  → 파9 대비 +3");
  check((await page.locator(".rv-course").textContent()) === "테스트CC", "구장 이름이 그대로 나온다");
  check((await page.locator(".headline").textContent())?.includes("12타"), "한줄요약이 만들어진다");
  check((await page.locator(".finding").count()) >= 5, "진단 카드가 그려진다");
  check((await page.locator(".card").count()) === 1, "9홀이면 스코어카드가 한 장이다");

  // 저장이 실제로 됐는지 — 앱을 다시 띄워 본다
  await page.reload();
  await page.getByText("테스트CC").first().waitFor();
  check(true, "새로고침해도 기록이 남아 있다");
  check((await page.locator(".round-card .rc-right b").first().textContent()) === "12", "  → 목록에 12타로 보인다");

  // 진행 중이던 기록은 저장 후 지워져야 한다
  check((await page.locator(".resume").count()) === 0, "끝낸 라운드의 '이어서 하기'는 사라진다");

  check(errors.length === 0, `콘솔 에러 없음${errors.length ? ` — ${errors[0]}` : ""}`);

  await browser.close();
} finally {
  server.kill();
}

console.log(`\n${pass}개 통과, ${fail}개 실패`);
process.exit(fail ? 1 : 0);
