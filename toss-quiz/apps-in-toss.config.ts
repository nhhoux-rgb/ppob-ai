import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "ppob-quiz",
  brand: {
    primaryColor: "#7c3aed",
  },
  permissions: [],
  // Vite 빌드 결과물 위치
  webBundleDir: "dist",
});
