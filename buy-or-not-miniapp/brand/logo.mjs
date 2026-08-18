// 앱 로고 생성기 — 토스 개발자센터 "노출 정보" 규격.
//
//   npm run logo
//
// 규격: 앱 로고 600×600, 다크모드 앱 로고 600×600.
//
// 목록에서 아이콘은 60px 안팎으로 줄어든다. 그 크기에서 살아남는 건 글자
// 두어 개뿐이라, 영수증 그림이나 도장 무늬 대신 앱 이름 네 글자를 두 줄로
// 넣고 붉은 도장 테두리를 둘렀다. 앱이 무엇을 하는지가 이름에 다 들어 있다.
//
//   app-logo  살까 / 말까 를 도장 테두리 안에. 제출용.
//   alt-won   ₩ 와 물음표. 더 조용한 대안.

import { Resvg } from "@resvg/resvg-js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ensureFonts } from "./fonts.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, "out");
const SIZE = 600;

const SERIF = "Noto Serif KR";

// 라이트 / 다크 팔레트. styles.css 와 같은 값이다.
const THEME = {
  light: { bg: "#FDFDFB", ink: "#1B1B1A", stamp: "#C8322A" },
  // 어두운 바닥에서 #C8322A 는 묻힌다. 색상각은 두고 밝기만 올린다.
  dark: { bg: "#1B1B1A", ink: "#EFEEE9", stamp: "#E4574C" },
};

/** 고무도장 테두리 — 모서리가 살짝 둥근 사각 이중선 */
const frame = (t) => `
  <rect x="58" y="58" width="484" height="484" rx="30"
        fill="none" stroke="${t.stamp}" stroke-width="20"/>
  <rect x="88" y="88" width="424" height="424" rx="14"
        fill="none" stroke="${t.stamp}" stroke-width="5"/>`;

const CANDIDATES = {
  // 이름 네 글자를 두 줄로. 60px 로 줄여도 "살까 말까" 가 읽힌다.
  "app-logo": (t) => `
    <rect width="${SIZE}" height="${SIZE}" fill="${t.bg}"/>
    ${frame(t)}
    <text x="307" y="222" font-family="${SERIF}" font-size="144" font-weight="900"
          text-anchor="middle" dominant-baseline="central" fill="${t.stamp}"
          letter-spacing="14">살까</text>
    <text x="307" y="382" font-family="${SERIF}" font-size="144" font-weight="900"
          text-anchor="middle" dominant-baseline="central" fill="${t.stamp}"
          letter-spacing="14">말까</text>`,

  // 금액과 망설임만 남긴 대안. 글자가 둘뿐이라 가장 작게 줄여도 버틴다.
  "alt-won": (t) => `
    <rect width="${SIZE}" height="${SIZE}" fill="${t.bg}"/>
    ${frame(t)}
    <text x="300" y="300" font-family="${SERIF}" font-size="250" font-weight="900"
          text-anchor="middle" dominant-baseline="central" fill="${t.ink}"
          letter-spacing="6">₩?</text>`,
};

const fontFiles = await ensureFonts(["Noto+Serif+KR:wght@900"]);
fs.mkdirSync(OUT, { recursive: true });

console.log("앱 로고 (600×600 — 토스 개발자센터 규격)\n");
for (const [name, build] of Object.entries(CANDIDATES)) {
  for (const [mode, t] of Object.entries(THEME)) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">${build(t)}</svg>`;
    const base = `${name}-600-${mode}`;
    fs.writeFileSync(path.join(OUT, `${base}.svg`), svg);
    const png = new Resvg(svg, {
      fitTo: { mode: "width", value: SIZE },
      font: { fontFiles, loadSystemFonts: false, defaultFontFamily: SERIF },
    })
      .render()
      .asPng();
    fs.writeFileSync(path.join(OUT, `${base}.png`), png);
    console.log(`  ${base}.png`.padEnd(30), `${(png.length / 1024).toFixed(0)}KB`);
  }
}
console.log(`\n출력 위치: ${path.relative(process.cwd(), OUT)}`);
