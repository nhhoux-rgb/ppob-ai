// 대표 이미지(배너) 생성기. 앱 로고는 brand/logo.mjs 가 만든다.
//
//   npm run brand
//
// SVG를 마스터로 두고 PNG를 뽑는다. 토스가 요구하는 정확한 픽셀 규격이
// 확인되면 SIZES 배열에 숫자만 추가해서 다시 돌리면 된다. 벡터라 어떤
// 크기로 뽑아도 깨지지 않는다.
//
// 폰트 주의: 구글 폰트판 나눔명조에는 한자 글리프가 하나도 없다. 그래서
// 한글은 나눔명조(NanumMyeongjoExtraBold), 한자는 Noto Serif KR Black 으로
// 나눠서 지정한다. 웹앱의 --serif 스택과 같은 구성이다.

import { Resvg } from "@resvg/resvg-js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, "out");
const CACHE = path.join(HERE, ".fonts");

// ── 색 (웹앱 globals.css 와 동일) ──────────────────────────────────
const PAPER = "#D8D3C2";
const INK = "#1C1F26";
const INK_SOFT = "#4A4F5A";
const RULE = "#B0A992";
const SEAL = "#8E2B1F";

const HANGUL = "NanumMyeongjoExtraBold";
const HANJA = "Noto Serif KR Black";

// 구글 폰트에서 받아 캐시한다. 3MB + 13MB 라 저장소에 넣지 않는다.
const FONTS = [
  {
    file: "nanum-myeongjo-extrabold.ttf",
    css: "https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@800",
    pick: (urls) => urls[urls.length - 1],
  },
  {
    file: "noto-serif-kr-black.ttf",
    css: "https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@900",
    pick: (urls) => urls[urls.length - 1],
  },
];

async function ensureFonts() {
  fs.mkdirSync(CACHE, { recursive: true });
  const paths = [];
  for (const f of FONTS) {
    const dest = path.join(CACHE, f.file);
    if (!fs.existsSync(dest)) {
      process.stdout.write(`  폰트 내려받는 중: ${f.file} … `);
      // UA 를 지정하지 않으면 woff2 대신 ttf 를 준다 (resvg 는 ttf 만 읽는다)
      const css = await (await fetch(f.css)).text();
      const urls = [...css.matchAll(/https:\/\/fonts\.gstatic\.com[^)]*/g)].map(
        (m) => m[0]
      );
      if (!urls.length) throw new Error(`폰트 URL을 찾지 못했다: ${f.css}`);
      const buf = await (await fetch(f.pick(urls))).arrayBuffer();
      fs.writeFileSync(dest, Buffer.from(buf));
      console.log(`${(buf.byteLength / 1024 / 1024).toFixed(1)}MB`);
    }
    paths.push(dest);
  }
  return paths;
}

// ── 대표 이미지 ────────────────────────────────────────────────────
function bannerSvg(W, H) {
  const pad = Math.round(W * 0.072);
  const sealR = Math.round(H * 0.185);
  const sealX = W - pad - sealR - Math.round(W * 0.012);
  const sealY = Math.round(H * 0.545);
  const titleSize = Math.round(H * 0.155);
  const subSize = Math.round(H * 0.079);
  const tagSize = Math.round(H * 0.045);
  const eyebrowSize = Math.round(H * 0.035);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="vig" cx="50%" cy="0%" r="105%">
      <stop offset="0%" stop-color="#E1DCCB"/>
      <stop offset="100%" stop-color="#C9C3AF"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="${PAPER}"/>
  <rect width="${W}" height="${H}" fill="url(#vig)"/>

  <!-- 서식 머리 -->
  <text x="${pad}" y="${Math.round(H * 0.118)}" font-family="${HANJA}"
        font-size="${eyebrowSize}" fill="${INK_SOFT}" letter-spacing="${eyebrowSize * 0.3}">身元調書 第二號</text>
  <g transform="translate(${W - pad - 66} ${Math.round(H * 0.079)}) rotate(-3)">
    <rect x="0" y="0" width="86" height="52" fill="none" stroke="${SEAL}" stroke-width="4" rx="3"/>
    <text x="43" y="27" font-family="${HANJA}" font-size="34" text-anchor="middle"
          dominant-baseline="central" fill="${SEAL}">秘</text>
  </g>
  <rect x="${pad}" y="${Math.round(H * 0.155)}" width="${W - pad * 2}" height="5" fill="${INK}"/>
  <rect x="${pad}" y="${Math.round(H * 0.155) + 13}" width="${W - pad * 2}" height="2" fill="${RULE}"/>

  <!-- 제목 -->
  <text x="${pad}" y="${Math.round(H * 0.44)}" font-family="${HANGUL}"
        font-size="${titleSize}" fill="${INK}">친일파 테스트</text>
  <text x="${pad}" y="${Math.round(H * 0.585)}" font-family="${HANGUL}"
        font-size="${subSize}" fill="${SEAL}">1940년, 당신의 선택</text>
  <text x="${pad}" y="${Math.round(H * 0.735)}" font-family="${HANGUL}"
        font-size="${tagSize}" fill="${INK_SOFT}">열여섯 번의 갈림길. 당신은 몇 단계에서 꺾일까?</text>

  <!-- 인장 -->
  <g transform="translate(${sealX} ${sealY}) rotate(-11)">
    <circle r="${sealR}" fill="none" stroke="${SEAL}" stroke-width="${Math.round(sealR * 0.115)}"/>
    <text x="0" y="0" font-family="${HANJA}" font-size="${Math.round(sealR * 1.34)}"
          text-anchor="middle" dominant-baseline="central" fill="${SEAL}">秘</text>
  </g>

  <rect x="${pad}" y="${H - Math.round(H * 0.06)}" width="${W - pad * 2}" height="2" fill="${RULE}"/>
</svg>`;
}

// ── 렌더 ───────────────────────────────────────────────────────────
function render(svg, width, dest, fontFiles) {
  const png = new Resvg(svg, {
    fitTo: { mode: "width", value: width },
    font: { fontFiles, loadSystemFonts: false, defaultFontFamily: HANGUL },
  })
    .render()
    .asPng();
  fs.writeFileSync(dest, png);
  return png.length;
}

const fontFiles = await ensureFonts();
fs.mkdirSync(OUT, { recursive: true });

console.log("\n대표 이미지 (가로형)");
for (const [w, h] of [
  [1280, 720],
  [1200, 630],
]) {
  const svg = bannerSvg(w, h);
  fs.writeFileSync(path.join(OUT, `banner-${w}x${h}.svg`), svg);
  const size = render(svg, w, path.join(OUT, `banner-${w}x${h}.png`), fontFiles);
  console.log(`  banner-${w}x${h}.png`.padEnd(22), `${(size / 1024).toFixed(0)}KB`);
}

console.log(`\n출력 위치: ${path.relative(process.cwd(), OUT)}`);
