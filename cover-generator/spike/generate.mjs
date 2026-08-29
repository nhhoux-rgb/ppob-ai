// ─────────────────────────────────────────────────────────────────────────
// 부동산 표지 배경 생성 — 품질 검증 spike
//
// 목적(go/no-go): 조감도 1장을 gpt-image-1에 넣었을 때
//   (1) 글자/로고 없는                (설계안 5번)
//   (2) 제목 안전영역이 확보된         (설계안 4번)
//   (3) 컬러톤/무드/밀도가 반영된      (설계안 4번)
// "PPT에 바로 붙일 수 있는" 표지 배경이 실제로 나오는지 눈으로 확인한다.
//
// 실행:
//   cd cover-generator/spike
//   npm install
//   export OPENAI_API_KEY=sk-...
//   node generate.mjs --input ./조감도.jpg --quality medium
//
// 옵션:
//   --input <path>     입력 조감도 (필수, jpg/png/webp)
//   --quality <q>      low | medium | high   (기본 medium)
//   --ratio <r>        a4-landscape | 16:9 | a4-portrait  (기본 a4-landscape)
//   --out <dir>        출력 폴더 (기본 ./out)
//   --dry-run          API 호출 없이 프롬프트/비용만 출력
// ─────────────────────────────────────────────────────────────────────────

import fs from "node:fs/promises";
import path from "node:path";
import OpenAI, { toFile } from "openai";
import { RATIOS, DEFAULT_MATRIX, buildPrompt } from "./prompts.mjs";

// gpt-image-1 대략적 장당 단가(USD). 정확치는 아니며 unit-economics 감을 잡기 위한 추정.
const APPROX_COST_USD = { low: 0.016, medium: 0.063, high: 0.25 };

function parseArgs(argv) {
  const args = { quality: "medium", ratio: "a4-landscape", out: "./out", dryRun: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--input") args.input = argv[++i];
    else if (a === "--quality") args.quality = argv[++i];
    else if (a === "--ratio") args.ratio = argv[++i];
    else if (a === "--out") args.out = argv[++i];
    else if (a === "--dry-run") args.dryRun = true;
    else {
      console.error(`알 수 없는 옵션: ${a}`);
      process.exit(1);
    }
  }
  return args;
}

function slug(combo) {
  return [combo.colorTone, combo.mood, combo.density, combo.safeArea]
    .join("-")
    .toLowerCase();
}

async function main() {
  const args = parseArgs(process.argv);

  if (!RATIOS[args.ratio]) {
    console.error(`--ratio 값이 잘못됨. 가능: ${Object.keys(RATIOS).join(", ")}`);
    process.exit(1);
  }
  if (!APPROX_COST_USD[args.quality]) {
    console.error(`--quality 값이 잘못됨. 가능: low, medium, high`);
    process.exit(1);
  }

  const { size, note } = RATIOS[args.ratio];
  const matrix = DEFAULT_MATRIX;
  const estCost = (APPROX_COST_USD[args.quality] * matrix.length).toFixed(2);

  console.log("── 표지 배경 spike ──────────────────────────────");
  console.log(`입력      : ${args.input ?? "(없음)"}`);
  console.log(`비율/크기 : ${args.ratio} → ${size}  (${note})`);
  console.log(`품질      : ${args.quality}`);
  console.log(`조합 수   : ${matrix.length}`);
  console.log(`추정 비용 : ~$${estCost} (장당 ~$${APPROX_COST_USD[args.quality]}, 추정치)`);
  console.log("──────────────────────────────────────────────\n");

  if (args.dryRun) {
    matrix.forEach((c, i) => {
      console.log(`[${i + 1}] ${slug(c)}`);
      console.log(buildPrompt(c) + "\n");
    });
    console.log("dry-run 종료 (API 미호출).");
    return;
  }

  if (!args.input) {
    console.error("오류: --input <조감도 이미지 경로> 가 필요합니다.");
    process.exit(1);
  }
  if (!process.env.OPENAI_API_KEY) {
    console.error("오류: OPENAI_API_KEY 환경변수가 필요합니다.");
    process.exit(1);
  }

  const inputBuf = await fs.readFile(args.input);
  const outDir = path.resolve(args.out);
  await fs.mkdir(outDir, { recursive: true });

  const client = new OpenAI();
  const results = [];

  for (let i = 0; i < matrix.length; i++) {
    const combo = matrix[i];
    const prompt = buildPrompt(combo);
    const name = `${String(i + 1).padStart(2, "0")}-${slug(combo)}`;
    process.stdout.write(`[${i + 1}/${matrix.length}] ${name} … `);

    try {
      // gpt-image-1 edits: 입력 이미지를 조건으로 새 이미지를 생성한다.
      const image = await toFile(inputBuf, path.basename(args.input));
      const res = await client.images.edit({
        model: "gpt-image-1",
        image,
        prompt,
        size,
        quality: args.quality,
        n: 1,
      });

      const b64 = res.data?.[0]?.b64_json;
      if (!b64) throw new Error("응답에 이미지 데이터 없음");
      const file = `${name}.png`;
      await fs.writeFile(path.join(outDir, file), Buffer.from(b64, "base64"));
      results.push({ combo, file, prompt, ok: true });
      console.log("완료");
    } catch (err) {
      results.push({ combo, prompt, ok: false, error: String(err?.message ?? err) });
      console.log(`실패: ${err?.message ?? err}`);
    }
  }

  await writeGallery(outDir, results, args, size);
  console.log(`\n완료. 비교 그리드: ${path.join(outDir, "index.html")}`);
  console.log("👉 각 이미지에서 확인할 것: ① 글자/로고 누출 여부 ② 안전영역 확보 ③ 톤/무드 반영");
}

async function writeGallery(outDir, results, args, size) {
  const cards = results
    .map((r) => {
      const c = r.combo;
      const label = `${c.colorTone} · ${c.mood} · ${c.density} · safe:${c.safeArea}`;
      const body = r.ok
        ? `<img src="./${r.file}" alt="${label}" loading="lazy" />`
        : `<div class="err">생성 실패<br><small>${escapeHtml(r.error)}</small></div>`;
      return `<figure><div class="frame">${body}</div><figcaption>${escapeHtml(label)}</figcaption></figure>`;
    })
    .join("\n");

  const html = `<!doctype html><meta charset="utf-8">
<title>표지 배경 spike 결과</title>
<style>
  body{font:14px/1.5 system-ui,sans-serif;margin:24px;background:#111;color:#eee}
  h1{font-size:18px} .meta{color:#aaa;margin-bottom:20px}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(360px,1fr));gap:20px}
  figure{margin:0} .frame{background:#000;border:1px solid #333;border-radius:8px;overflow:hidden}
  img{width:100%;display:block} figcaption{margin-top:8px;color:#ccc}
  .err{padding:40px;text-align:center;color:#f88}
  .check{margin:16px 0;padding:12px 16px;background:#1a1a1a;border-left:3px solid #4a9;border-radius:4px}
</style>
<h1>부동산 표지 배경 — 품질 검증 spike</h1>
<div class="meta">비율 ${args.ratio} (${size}) · 품질 ${args.quality} · 입력 ${escapeHtml(args.input)}</div>
<div class="check"><b>체크리스트:</b> ① 글자/로고/워터마크 누출 없는가? ② 선택한 제목 안전영역이 실제로 비워졌는가? ③ 컬러톤·무드·밀도가 반영됐는가? ④ 조감도 원본이 알아볼 수 있게 유지됐는가?</div>
<div class="grid">
${cards}
</div>`;
  await fs.writeFile(path.join(outDir, "index.html"), html);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
