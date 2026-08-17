// OG 이미지용 한글 폰트 로더.
// 실패하면 undefined를 돌려주고 호출부가 라틴 문자로 대체하도록 한다.
// (폰트 하나 때문에 빌드가 깨지는 일이 없어야 한다.)

const FONT_URL =
  "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/public/static/Pretendard-Bold.otf";

export type OgFont = {
  name: string;
  data: ArrayBuffer;
  weight: 700;
  style: "normal";
};

export async function loadKoreanFont(): Promise<OgFont[] | undefined> {
  try {
    const res = await fetch(FONT_URL);
    if (!res.ok) return undefined;
    return [
      {
        name: "Pretendard",
        data: await res.arrayBuffer(),
        weight: 700,
        style: "normal",
      },
    ];
  } catch {
    return undefined;
  }
}
