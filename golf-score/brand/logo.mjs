// 앱 로고 생성기 — 토스 개발자센터 "노출 정보" 규격.
//
//   npm run logo
//
// 규격: 앱 로고 600×600, 다크모드 앱 로고 600×600.
//
// 아이콘은 앱 목록에서 60px 안팎으로 줄어든다. 그래서 글자를 넣지 않았다.
// "골프 스코어" 다섯 글자는 그 크기에서 뭉개지고, 뭉개진 글자는 아무것도
// 알려주지 않는다. 남는 것은 실루엣이다.
//
//   app-logo  깃대 하나. 60px 로 줄여도 깃발 삼각형과 막대는 끝까지 읽힌다.
//   alt-card  스코어카드 한 칸. 버디를 뜻하는 동그라미까지 넣은 대안.
//
// 두 안을 다 뽑아 두었으니 개발자센터에 올릴 때 골라 쓰면 된다.

import { Resvg } from "@resvg/resvg-js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, "out");
const CACHE = path.join(HERE, ".fonts");

const SIZE = 600;

// 라이트 / 다크 팔레트. 앱의 --green 계열을 그대로 쓴다.
const THEME = {
  light: { bg: "#1F7A46", bgTo: "#176036", ink: "#FFFFFF", turf: "#2E9257", flag: "#F04E3E", hole: "#0E3A22" },
  // 다크모드에서는 초록을 낮춰 깔고 깃발만 살린다
  dark: { bg: "#123D26", bgTo: "#0A2416", ink: "#EAF2EC", turf: "#1B5C38", flag: "#FF6B5A", hole: "#04150C" },
};

const DIGIT = "PretendardBold";
const FONTS = [
  {
    file: "noto-sans-kr-800.ttf",
    // UA 를 안 보내면 구글 폰트가 woff2 대신 ttf 를 준다. resvg 는 ttf 만 읽는다.
    css: "https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@800",
  },
];

async function ensureFont() {
  fs.mkdirSync(CACHE, { recursive: true });
  const out = [];
  for (const f of FONTS) {
    const dest = path.join(CACHE, f.file);
    if (!fs.existsSync(dest)) {
      const css = await (await fetch(f.css)).text();
      const urls = [...css.matchAll(/https:\/\/fonts\.gstatic\.com[^)]*/g)].map((m) => m[0]);
      const buf = await (await fetch(urls[urls.length - 1])).arrayBuffer();
      fs.writeFileSync(dest, Buffer.from(buf));
    }
    out.push(dest);
  }
  return out;
}

function bg(t) {
  return `<defs><radialGradient id="g" cx="50%" cy="30%" r="82%">
    <stop offset="0%" stop-color="${t.bg}"/><stop offset="100%" stop-color="${t.bgTo}"/>
  </radialGradient></defs>
  <rect width="${SIZE}" height="${SIZE}" fill="url(#g)"/>`;
}

const CANDIDATES = {
  // 깃대. 그린 둔덕 · 홀컵 · 공까지 넣으면 60px 에서 뭉치므로 공은 작게,
  // 둔덕은 아주 옅게만 둔다. 실루엣의 주인공은 깃발 하나다.
  "app-logo": (t) => `${bg(t)}
    <ellipse cx="300" cy="486" rx="248" ry="86" fill="${t.turf}" opacity="0.55"/>
    <ellipse cx="300" cy="452" rx="38" ry="14" fill="${t.hole}"/>
    <rect x="291" y="126" width="18" height="330" rx="9" fill="${t.ink}"/>
    <path d="M309 140 L474 190 L309 240 Z" fill="${t.flag}"/>
    <circle cx="196" cy="450" r="21" fill="${t.ink}"/>`,

  // 스코어카드 한 칸. 골퍼는 동그라미가 버디라는 걸 즉시 읽는다.
  "alt-card": (t) => `${bg(t)}
    <rect x="112" y="112" width="376" height="376" rx="52" fill="${t.ink}" opacity="0.1"/>
    <circle cx="300" cy="300" r="140" fill="none" stroke="${t.ink}" stroke-width="22"/>
    <text x="300" y="306" font-family="${DIGIT}" font-size="176"
          text-anchor="middle" dominant-baseline="central" fill="${t.ink}">3</text>
    <rect x="216" y="470" width="168" height="16" rx="8" fill="${t.flag}"/>`,
};

const fontFiles = await ensureFont();
fs.mkdirSync(OUT, { recursive: true });

console.log("앱 로고 (600×600 — 토스 개발자센터 규격)\n");
for (const [name, build] of Object.entries(CANDIDATES)) {
  for (const [mode, t] of Object.entries(THEME)) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">${build(t)}</svg>`;
    const base = `${name}-600-${mode}`;
    fs.writeFileSync(path.join(OUT, `${base}.svg`), svg);
    const png = new Resvg(svg, {
      fitTo: { mode: "width", value: SIZE },
      font: { fontFiles, loadSystemFonts: false, defaultFontFamily: DIGIT },
    })
      .render()
      .asPng();
    fs.writeFileSync(path.join(OUT, `${base}.png`), png);
    console.log(`  ${base}.png`.padEnd(30), `${(png.length / 1024).toFixed(0)}KB`);
  }
}
console.log(`\n출력 위치: ${path.relative(process.cwd(), OUT)}`);
