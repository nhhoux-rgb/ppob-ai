import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const nextConfig: NextConfig = {
  // 이 앱은 뽑AI 저장소 안의 서브디렉토리라 lockfile이 여러 개다.
  // Turbopack이 상위 lockfile을 루트로 잘못 잡지 않도록 이 폴더로 고정한다.
  turbopack: {
    root: dirname(fileURLToPath(import.meta.url)),
  },
};

export default nextConfig;
