import { ImageResponse } from "next/og";

export const alt = "등기우편 대량조회 · 등기번호 일괄 배송조회";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Static Korean font (Pretendard) so Hangul renders in the share card.
const FONT_URL =
  "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/public/static/Pretendard-Bold.otf";

const PILLS = [
  { label: "배달완료", bg: "#10b981" },
  { label: "반송", bg: "#f43f5e" },
  { label: "미수령", bg: "#f97316" },
  { label: "배송중", bg: "#0ea5e9" },
];

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
          justifyContent: "center",
          padding: "0 96px",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          color: "#ffffff",
          fontFamily: korean ? "Pretendard" : "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 32,
            letterSpacing: 2,
            color: "#7dd3fc",
          }}
        >
          {korean ? "우체국 등기우편 배송조회" : "POSTAL TRACKING"}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 108,
            fontWeight: 700,
            letterSpacing: -4,
            marginTop: 12,
          }}
        >
          {korean ? "등기우편 대량조회" : "Bulk Mail Tracking"}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 36,
            opacity: 0.85,
            marginTop: 20,
          }}
        >
          {korean
            ? "등기번호 붙여넣기 · 접수증 사진으로 한 번에"
            : "Paste numbers or scan a receipt — track them all at once"}
        </div>

        {korean && (
          <div style={{ display: "flex", gap: 16, marginTop: 44 }}>
            {PILLS.map((p) => (
              <div
                key={p.label}
                style={{
                  display: "flex",
                  background: p.bg,
                  color: "#ffffff",
                  fontSize: 30,
                  fontWeight: 700,
                  padding: "10px 28px",
                  borderRadius: 999,
                }}
              >
                {p.label}
              </div>
            ))}
          </div>
        )}
      </div>
    ),
    { ...size, fonts }
  );
}
