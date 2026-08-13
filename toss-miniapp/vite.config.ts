import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base: "./" → 웹뷰 번들에서 상대경로로 에셋을 로드하기 위함
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    outDir: "dist",
  },
});
