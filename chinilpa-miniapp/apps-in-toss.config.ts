import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "chinilpa-test",
  brand: {
    // 서식지의 인장 색. 웹앱 globals.css 의 --seal 과 같다.
    primaryColor: "#8E2B1F",
  },
  // 카메라·사진첩 등 어떤 권한도 쓰지 않는다. 문항을 고르는 것이 전부다.
  permissions: [],
  navigationBar: {
    withBackButton: true,
    withHomeButton: true,
    withTitle: true,
    theme: "light",
  },
  webBundleDir: "dist",
});
