import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  // 앱인토스 콘솔에 등록한 앱 이름과 정확히 같아야 한다.
  appName: "ai-dream",
  brand: {
    primaryColor: "#6750c7",
  },
  permissions: [],
  // Vite 빌드 결과물 위치
  webBundleDir: "dist",
});
