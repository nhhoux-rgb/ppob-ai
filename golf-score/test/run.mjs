/* 계산 로직 검증. 화면 없이 score.ts·analysis.ts 만 확인한다.
 *
 * 이 앱에서 틀리면 안 되는 것은 타수다. 벌타를 하나 잘못 세면 그 라운드만
 * 틀리는 게 아니라 "나아지고 있는가"라는 추세까지 같이 틀어진다.
 *
 *   npm test
 *
 * tsc 로 순수 로직 세 파일만 뽑은 뒤(화면 코드는 토스 SDK 를 물고 있어서
 * 노드에서 못 돈다) 상대 import 에 확장자를 붙여 노드로 실행한다. */

import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const out = join(root, ".test-build");

rmSync(out, { recursive: true, force: true });
execFileSync(
  "npx",
  [
    "tsc",
    "src/types.ts", "src/score.ts", "src/analysis.ts",
    "--outDir", out,
    "--module", "esnext",
    "--target", "es2020",
    "--moduleResolution", "bundler",
    "--strict",
  ],
  { cwd: root, stdio: "inherit" }
);

// tsc 는 확장자 없는 상대 import 를 그대로 내보내는데 노드 ESM 은 그걸 못 읽는다
for (const name of readdirSync(out)) {
  const path = join(out, name);
  const fixed = readFileSync(path, "utf8").replace(
    /from "\.\/(types|score)"/g,
    'from "./$1.js"'
  );
  writeFileSync(path, fixed);
}
writeFileSync(join(out, "package.json"), '{ "type": "module" }\n');

await import(new URL("./logic.test.mjs", import.meta.url));
