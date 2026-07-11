import { ImageResponse } from "next/og";

export const alt = "러닝화 계급도 · 브랜드별 러닝화 등급표";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Static Korean font (Pretendard) so Hangul renders in the share card.
const FONT_URL =
  "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/public/static/Pretendard-Bold.otf";

export default async function OgImage() {
  // Try to load a Korean font; if it fails for any reason, fall back to a
  // Latin-only card so the build can never break because of this file.
  let fonts:
    | { name: string; data: ArrayBuffer; weight: 700; style: "normal" }[]
    | undefined;
  let korean = false;

  try {
    const res = await fetch(FONT_URL);
    if (res.ok) {
      const data = await res.arrayBuffer();
      fonts = [{ name: "Pretendard", data, weight: 700, style: "normal" }];
      korean = true;
    }
  } catch {
    korean = false;
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #4f46e5 0%, #1e1b4b 100%)",
          color: "#ffffff",
          fontFamily: korean ? "Pretendard" : "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 140, letterSpacing: -3 }}>
          {korean ? "러닝화 추천" : "RUNNING SHOES"}
        </div>
        <div style={{ display: "flex", marginTop: 16, fontSize: 46 }}>
          {korean ? "나에게 맞는 러닝화 찾기" : "Find your running shoes"}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 24,
            fontSize: 30,
            opacity: 0.85,
          }}
        >
          {korean
            ? "목적·예산·브랜드로 추천 · 참고가·구매 링크 · 계급도까지"
            : "Personalized picks + tier chart"}
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
