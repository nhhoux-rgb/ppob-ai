import { ImageResponse } from "next/og";
import { loadKoreanFont } from "./og-font";

export const alt = "친일파 테스트 · 1940년, 당신의 선택";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  const fonts = await loadKoreanFont();
  const korean = Boolean(fonts);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 90px",
          background: "#D8D3C2",
          color: "#1C1F26",
          fontFamily: korean ? "Pretendard" : "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 26,
            letterSpacing: 14,
            color: "#4A4F5A",
          }}
        >
          {korean ? "身元調書 第二號" : "CONFIDENTIAL"}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 26,
            fontSize: 118,
            letterSpacing: -3,
          }}
        >
          {korean ? "친일파 테스트" : "THE 1940 TEST"}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 10,
            fontSize: 62,
            color: "#8E2B1F",
          }}
        >
          {korean ? "1940년, 당신의 선택" : "What would you have chosen?"}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 40,
            fontSize: 34,
            color: "#4A4F5A",
          }}
        >
          {korean
            ? "열여섯 번의 갈림길. 당신은 몇 단계에서 꺾일까?"
            : "Sixteen crossroads, 1936–1945"}
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
