import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  // 토스 개발자센터에 등록한 appName 과 반드시 같아야 한다. 이 값이 번들 안
  // bundle.json 에 박혀서 업로드 시 대조되므로, 파일 이름을 바꾸는 것으로는
  // 해결되지 않는다. (chinilpa-miniapp 에서 겪은 문제)
  appName: "thanos-fingersnap",
  brand: {
    // 건틀렛 보라. styles.css 의 --violet 과 같다.
    primaryColor: "#8B5CF6",
  },
  // 버튼 한 번 누르는 것이 전부라 카메라도 사진첩도 로그인도 필요 없다.
  permissions: [],
  navigationBar: {
    withBackButton: true,
    withHomeButton: true,
    withTitle: true,
    theme: "dark",
  },
  webBundleDir: "dist",
});
