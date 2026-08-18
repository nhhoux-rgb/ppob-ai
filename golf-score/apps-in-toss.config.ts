import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  // 토스 개발자센터에 등록한 appName 과 반드시 같아야 한다. 이 값이 번들 안
  // bundle.json 에 박혀서 업로드 시 대조되므로, 파일 이름을 바꾸는 것으로는
  // 해결되지 않는다. (chinilpa-miniapp 에서 겪은 문제)
  appName: "golfscore",
  brand: {
    // 스코어카드의 잔디색. styles.css 의 --green 과 같다.
    primaryColor: "#1F7A46",
  },
  // 권한을 하나도 쓰지 않는다. 기록은 전부 기기 안에만 남는다.
  permissions: [],
  navigationBar: {
    withBackButton: true,
    withHomeButton: true,
    withTitle: true,
    theme: "light",
  },
  webBundleDir: "dist",
});
