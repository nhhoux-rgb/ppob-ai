import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  // 토스 개발자센터에 등록한 appName 과 반드시 같아야 한다. 이 값이 번들 안
  // bundle.json 에 박혀서 업로드할 때 대조되므로, 폴더 이름을 바꾸는 것으로는
  // 해결되지 않는다.
  appName: "buyornot",
  brand: {
    // 영수증에 찍히는 도장 색. styles.css 의 --stamp 와 같다.
    primaryColor: "#C8322A",
  },
  // 값을 입력하고 문항 세 개를 고르는 것이 전부다. 권한은 하나도 쓰지 않는다.
  permissions: [],
  navigationBar: {
    withBackButton: true,
    withHomeButton: true,
    withTitle: true,
    theme: "light",
  },
  webBundleDir: "dist",
});
