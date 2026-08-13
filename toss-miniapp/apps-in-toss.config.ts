import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "ppob",
  brand: {
    primaryColor: "#7c3aed",
  },
  permissions: [
    { name: "camera", access: "access" },
    { name: "photos", access: "read" },
  ],
  // Vite 빌드 결과물 위치
  webBundleDir: "dist",
});
