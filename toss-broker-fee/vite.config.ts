import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base: "./" → 웹뷰 번들에서 상대경로로 에셋을 로드하기 위함
// css.postcss: {} → 상위 디렉터리(레포 루트)의 Tailwind PostCSS 설정을
//   끌어오지 않도록 이 앱에서는 PostCSS 파이프라인을 비활성화한다.
export default defineConfig({
  plugins: [react()],
  base: "./",
  css: {
    postcss: {},
  },
  build: {
    outDir: "dist",
  },
});
