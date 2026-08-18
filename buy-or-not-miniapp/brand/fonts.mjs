// 구글 폰트에서 TTF 를 받아 brand/.fonts 에 캐시한다. resvg 는 시스템 폰트를
// 쓰지 않으므로(loadSystemFonts:false) 파일을 직접 넘겨야 한다.
//
// 한글은 서브셋이 수십 개로 쪼개져 있고, 그중 어느 파일에 어떤 글자가 들었는지
// 알 수 없다. 그래서 CSS 에 적힌 URL 을 전부 받아 통째로 넘긴다. 하나만 받으면
// (보통 마지막 = 라틴 서브셋) 한글이 통째로 빠진 채 렌더된다.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CACHE = path.join(HERE, ".fonts");

export async function ensureFonts(specs) {
  fs.mkdirSync(CACHE, { recursive: true });
  const files = [];

  for (const spec of specs) {
    const slug = spec.replace(/[^A-Za-z0-9]+/g, "-").toLowerCase();
    const dir = path.join(CACHE, slug);

    if (!fs.existsSync(dir)) {
      const url = `https://fonts.googleapis.com/css2?family=${spec}`;
      const css = await (await fetch(url)).text();
      const urls = [...new Set([...css.matchAll(/https:\/\/fonts\.gstatic\.com[^)]*/g)].map((m) => m[0]))];
      if (!urls.length) throw new Error(`폰트 URL 을 못 찾았다: ${spec}`);
      fs.mkdirSync(dir, { recursive: true });
      for (const [i, u] of urls.entries()) {
        const buf = await (await fetch(u)).arrayBuffer();
        fs.writeFileSync(path.join(dir, `${String(i).padStart(3, "0")}.ttf`), Buffer.from(buf));
      }
    }

    for (const f of fs.readdirSync(dir)) files.push(path.join(dir, f));
  }

  return files;
}
