import { ImageResponse } from "next/og";

export const alt = "평행우주 나의 삶 · 또 다른 나를 만나는 AI";
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
          background:
            "radial-gradient(120% 120% at 50% 0%, #4c1d95 0%, #1e1b4b 45%, #0b0713 100%)",
          color: "#ffffff",
          fontFamily: korean ? "Pretendard" : "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 72, opacity: 0.9 }}>🌌</div>
        <div
          style={{
            display: "flex",
            marginTop: 8,
            fontSize: 116,
            letterSpacing: -3,
          }}
        >
          {korean ? "평행우주 나의 삶" : "PARALLEL YOU"}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 20,
            fontSize: 40,
            opacity: 0.88,
          }}
        >
          {korean
            ? "그때 다른 선택을 했다면, 또 다른 나의 삶"
            : "The lives you could have lived"}
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
