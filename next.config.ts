import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // 웹 공개판 정적 번들(public/dream)의 짧은 주소.
      // rewrite가 아니라 redirect인 이유: /dream 으로 그대로 서빙하면
      // 번들의 상대경로 에셋(./assets/...)이 /assets/... 로 잘못 풀린다.
      { source: "/dream", destination: "/dream/index.html", permanent: false },
    ];
  },
};

export default nextConfig;
