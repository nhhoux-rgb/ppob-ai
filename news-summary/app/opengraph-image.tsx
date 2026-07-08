import { ImageResponse } from "next/og";

export const alt = "뉴스클리핑 · 기사 요약 이미지 생성기";
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
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          color: "#ffffff",
          fontFamily: korean ? "Pretendard" : "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 120, letterSpacing: -3 }}>
          {korean ? "뉴스클리핑" : "NEWS CLIP"}
        </div>
        <div style={{ display: "flex", marginTop: 16, fontSize: 48 }}>
          {korean ? "기사 요약 이미지 생성기" : "Article Summary Cards"}
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
            ? "기사 링크 → 보고서에 붙여넣는 요약 이미지"
            : "Turn any article link into a report-ready clipping"}
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
