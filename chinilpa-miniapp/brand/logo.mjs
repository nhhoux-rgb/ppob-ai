// 앱 로고 후보 생성기 — 토스 개발자센터 "노출 정보" 규격.
//
//   npm run logo
//
// 규격: 앱 로고 600×600, 다크모드 앱 로고 600×600.
//
// 첫 안은 서식지의 秘 도장을 그대로 썼는데, 앱 목록에서 보면 무슨 앱인지
// 짐작이 가지 않았다. 갈림길 기호도 만들어 봤지만 원 안에 넣든 아니든 알파벳
// Y 로 읽혀서 버렸다.
//
// 남은 것은 연도다. 목록에서 아이콘이 60px 안팎으로 줄어도 숫자는 끝까지
// 읽히고, 어느 시대 이야기인지가 그 자체로 전달된다.
//
//   app-logo  1940 + 붉은 괘선 + "당신의 선택". 제출용.
//   alt-plain 연도만. 더 조용한 대안.

import { Resvg } from "@resvg/resvg-js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, "out");
const CACHE = path.join(HERE, ".fonts");

const SIZE = 600;

// 라이트 / 다크 팔레트
const THEME = {
  light: { bg: "#D8D3C2", bgTo: "#C9C3AF", ink: "#1C1F26", seal: "#8E2B1F" },
  // 다크모드에서 #8E2B1F 는 배경에 묻힌다. 같은 색상각으로 밝기만 올린다.
  dark: { bg: "#171A20", bgTo: "#0F1116", ink: "#E4DFCE", seal: "#D2543F" },
};

const HANGUL = "NanumMyeongjoExtraBold";
const FONTS = [
  { file: "nanum-myeongjo-extrabold.ttf", css: "https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@800" },
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

/** 배경 + 종이/먹 질감 */
function bg(t) {
  return `<defs><radialGradient id="g" cx="50%" cy="36%" r="76%">
    <stop offset="0%" stop-color="${t.bg}"/><stop offset="100%" stop-color="${t.bgTo}"/>
  </radialGradient></defs>
  <rect width="${SIZE}" height="${SIZE}" fill="url(#g)"/>`;
}

// 후보 1안(갈림길)은 버렸다. Y 자로 읽힌다. 원 안에 넣어도 마찬가지였다.
// 남은 방향은 "연도를 크게" 다. 목록에서 아이콘이 60px 안팎으로 줄어도
// 숫자는 끝까지 읽히고, 어느 시대 이야기인지가 그 자체로 전달된다.

const CANDIDATES = {
  // 연도 + 붉은 괘선. 가장 조용하고 가장 잘 읽힌다.
  "app-logo": (t) => `${bg(t)}
    <text x="300" y="284" font-family="${HANGUL}" font-size="228"
          text-anchor="middle" dominant-baseline="central" fill="${t.ink}"
          letter-spacing="-8">1940</text>
    <rect x="132" y="396" width="336" height="16" rx="8" fill="${t.seal}"/>
    <text x="300" y="446" font-family="${HANGUL}" font-size="62"
          text-anchor="middle" dominant-baseline="hanging" fill="${t.ink}"
          letter-spacing="14">당신의 선택</text>`,

  // 연도만. 군더더기 없이 숫자 하나로 승부.
  "alt-plain": (t) => `${bg(t)}
    <text x="300" y="296" font-family="${HANGUL}" font-size="268"
          text-anchor="middle" dominant-baseline="central" fill="${t.ink}"
          letter-spacing="-12">1940</text>
    <rect x="176" y="428" width="248" height="18" rx="9" fill="${t.seal}"/>`,
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
      font: { fontFiles, loadSystemFonts: false, defaultFontFamily: HANGUL },
    })
      .render()
      .asPng();
    fs.writeFileSync(path.join(OUT, `${base}.png`), png);
    console.log(`  ${base}.png`.padEnd(30), `${(png.length / 1024).toFixed(0)}KB`);
  }
}
console.log(`\n출력 위치: ${path.relative(process.cwd(), OUT)}`);
