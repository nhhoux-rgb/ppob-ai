import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  // 토스 개발자센터에 등록한 appName 과 반드시 같아야 한다. 이 값이 번들
  // 안 bundle.json 에 박혀서 업로드 시 대조되므로, 파일 이름을 바꾸는 것으로는
  // 해결되지 않는다.
  appName: "cinilpa",
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
