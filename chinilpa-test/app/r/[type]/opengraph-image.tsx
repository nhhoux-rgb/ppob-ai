import { ImageResponse } from "next/og";
import { loadKoreanFont } from "@/app/og-font";
import { TYPES, TYPE_KEYS } from "@/app/types";

export const alt = "친일파 테스트 결과";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return TYPE_KEYS.map((type) => ({ type }));
}

type Props = { params: Promise<{ type: string }> };

export default async function OgImage({ params }: Props) {
  const { type } = await params;
  const t = TYPES[type];
  const fonts = await loadKoreanFont();
  const korean = Boolean(fonts);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          padding: "0 84px",
          gap: 64,
          background: "#D8D3C2",
          color: "#1C1F26",
          fontFamily: korean ? "Pretendard" : "sans-serif",
        }}
      >
        {/* 인장 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 260,
            height: 260,
            flexShrink: 0,
            borderRadius: "50%",
            border: "13px solid #8E2B1F",
            color: "#8E2B1F",
            fontSize: 132,
            transform: "rotate(-11deg)",
          }}
        >
          {t?.ch ?? "秘"}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 24, letterSpacing: 12, color: "#4A4F5A" }}>
            {korean ? "所 見" : "RESULT"}
          </div>
          <div style={{ display: "flex", marginTop: 18, fontSize: 92, letterSpacing: -2 }}>
            {korean ? (t?.n ?? "친일파 테스트") : "THE 1940 TEST"}
          </div>
          {korean && t && (
            <div style={{ display: "flex", marginTop: 12, fontSize: 46, color: "#8E2B1F" }}>
              {t.q}
            </div>
          )}
          <div style={{ display: "flex", marginTop: 34, fontSize: 30, color: "#4A4F5A" }}>
            {korean ? "친일파 테스트 · 1940년, 당신의 선택" : "What would you have chosen?"}
          </div>
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
