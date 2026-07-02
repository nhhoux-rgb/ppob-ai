import { ImageResponse } from "next/og";

export const alt = "복비 계산기 · 부동산 중개수수료 계산";
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
          background: "linear-gradient(135deg, #059669 0%, #065f46 100%)",
          color: "#ffffff",
          fontFamily: korean ? "Pretendard" : "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 128, letterSpacing: -3 }}>
          {korean ? "복비 계산기" : "BROKER FEE"}
        </div>
        <div style={{ display: "flex", marginTop: 16, fontSize: 52 }}>
          {korean ? "부동산 중개수수료 계산" : "Real Estate Broker Fee"}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 24,
            fontSize: 32,
            opacity: 0.85,
          }}
        >
          {korean
            ? "매매·전세·월세 복비를 법정 상한요율로 즉시 계산"
            : "Instant statutory brokerage fee calculator"}
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
