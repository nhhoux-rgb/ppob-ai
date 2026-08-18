import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base: "./" → 웹뷰 번들이 상대경로로 에셋을 읽는다
export default defineConfig({
  plugins: [react()],
  base: "./",
  css: {
    // 빈 객체를 주지 않으면 vite 가 상위 폴더를 타고 올라가 저장소 루트의
    // postcss.config.mjs(tailwind)를 집어 온다. 이 앱은 tailwind 를 쓰지 않아
    // 빌드가 그 자리에서 죽는다.
    postcss: {},
  },
  build: {
    outDir: "dist",
  },
});
