import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base: "./" → 웹뷰 번들에서 상대경로로 에셋을 로드하기 위함
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    outDir: "dist",
  },
  server: {
    fs: {
      // 문항·판정 데이터를 ../chinilpa-test 에서 그대로 가져다 쓴다.
      // 복사본을 두면 웹과 미니앱의 문항이 갈라진다.
      allow: [".."],
    },
  },
});
