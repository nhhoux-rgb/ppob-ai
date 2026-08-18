// 빌드된 앱을 파일 하나로 합친다.
//
//   npm run standalone
//
// 앱인토스 배포에는 쓰지 않는다(그건 `ait build` 가 dist 를 그대로 싸 간다).
// 이건 폰에서 눌러 보라고 링크 하나로 건네주기 위한 것이다. 그래서 바깥
// 껍데기(<!doctype>·<html>·<head>·<body>)를 빼고 알맹이만 남긴다. 그 껍데기를
// 씌우는 쪽에서 붙여 준다.
//
// 스크립트와 스타일은 전부 인라인으로 밀어 넣는다. 외부 호스트로 나가는
// 요청이 하나라도 남으면 CSP 가 막는 곳에서 화면이 비어 버린다.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");
const OUT = path.join(ROOT, "dist", "standalone.html");

if (!existsSync(path.join(DIST, "index.html"))) {
  console.error("dist 가 없다. 먼저 `npm run build:web` 을 돌릴 것.");
  process.exit(1);
}

const html = readFileSync(path.join(DIST, "index.html"), "utf8");
const asset = (file) => readFileSync(path.join(DIST, file.replace(/^\.?\//, "")), "utf8");

const css = [...html.matchAll(/<link[^>]+href="([^"]+\.css)"[^>]*>/g)].map((m) => asset(m[1]));
const js = [...html.matchAll(/<script[^>]+src="([^"]+\.js)"[^>]*><\/script>/g)].map((m) => asset(m[1]));

if (js.length === 0) {
  console.error("dist/index.html 에서 스크립트를 못 찾았다. vite 출력 형식이 바뀌었는지 볼 것.");
  process.exit(1);
}

const out = `<title>골프 스코어 계산기</title>
<style>
${css.join("\n")}
</style>
<div id="root"></div>
<script>
// 껍데기를 우리가 못 쓰므로 viewport 메타를 직접 붙인다. 이게 없으면 폰에서
// 980px 짜리 데스크톱 폭으로 그려져 글씨가 깨알만 해진다.
(function () {
  if (document.querySelector('meta[name="viewport"]')) return;
  var m = document.createElement("meta");
  m.name = "viewport";
  m.content = "width=device-width, initial-scale=1, viewport-fit=cover";
  document.head.appendChild(m);
})();
</script>
<script type="module">
${js.join("\n")}
</script>
`;

writeFileSync(OUT, out);
console.log(`${path.relative(process.cwd(), OUT)}  ${(out.length / 1024).toFixed(0)}KB`);
