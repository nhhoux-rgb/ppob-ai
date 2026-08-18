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
    // 빈 객체를 주면 PostCSS 설정 파일을 위로 찾아 올라가지 않는다. 이걸 빼면
    // 저장소 루트의 postcss.config.mjs(웹앱용 Tailwind)를 집어 들고 빌드가 깨진다.
    postcss: {},
  },
});
