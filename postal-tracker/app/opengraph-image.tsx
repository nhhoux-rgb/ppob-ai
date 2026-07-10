import { ImageResponse } from "next/og";

export const alt = "등기우편 대량조회 · 등기번호 일괄 배송조회";
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
          {korean ? "등기우편 대량조회" : "TRACKING"}
        </div>
        <div style={{ display: "flex", marginTop: 16, fontSize: 48 }}>
          {korean ? "등기번호 일괄 배송조회" : "Bulk Mail Tracking"}
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
            ? "접수증 사진 한 장으로 배송상태를 한 번에"
            : "Scan a receipt, track every item at once"}
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
