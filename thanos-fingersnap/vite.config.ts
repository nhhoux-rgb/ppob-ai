import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base: "./" → 웹뷰 번들에서 상대경로로 에셋을 로드하기 위함
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    outDir: "dist",
  },
  css: {
    // 빈 인라인 설정. 이걸 두지 않으면 vite 가 상위 폴더까지 올라가 루트
    // Next.js 앱의 postcss.config.mjs(테일윈드)를 주워 와서 빌드가 깨진다.
    // 이 앱은 순수 CSS 만 쓴다.
    postcss: {},
  },
});
