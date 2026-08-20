import { defineConfig } from "vite";

// base: "./" → 웹뷰 번들에서 상대경로로 에셋을 로드하기 위함.
//   웹 공개판(public/dream)도 하위 경로에서 그대로 동작한다.
// css.postcss: {} → 상위 디렉터리(레포 루트)의 Tailwind PostCSS 설정을
//   끌어오지 않도록 이 앱에서는 PostCSS 파이프라인을 비활성화한다.
export default defineConfig({
  base: "./",
  css: {
    postcss: {},
  },
  build: {
    outDir: "dist",
  },
});
