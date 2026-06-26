import { ImageResponse } from "next/og";

export const alt = "뽑AI · 인형뽑기 AI 공략";
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
          background: "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)",
          color: "#ffffff",
          fontFamily: korean ? "Pretendard" : "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 140, letterSpacing: -3 }}>
          {korean ? "뽑AI" : "PPOB AI"}
        </div>
        <div style={{ display: "flex", marginTop: 16, fontSize: 56 }}>
          {korean ? "인형뽑기 AI 공략" : "Claw Machine AI Guide"}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 24,
            fontSize: 34,
            opacity: 0.85,
          }}
        >
          {korean
            ? "사진 한 장으로 가장 뽑기 쉬운 인형을"
            : "Find the easiest prize from one photo"}
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
