import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return Response.json({ error: "이미지가 없습니다." }, { status: 400 });
    }

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `
너는 인형뽑기 공략 전문가야.
사진을 보고 가장 성공 가능성이 높은 인형 1~3개를 추천해줘.

반드시 JSON만 반환해.
마크다운, 설명문, 코드블록 금지.

JSON 형식:
{
  "summary": "전체 판단 요약",
  "targets": [
    {
      "rank": 1,
      "name": "대상 이름",
      "score": 82,
      "reason": "추천 이유",
      "strategy": "집게를 어디에 떨어뜨리고 어떻게 움직이면 좋을지",
      "x": 50,
      "y": 50
    }
  ],
  "avoid": ["피해야 할 대상"],
  "tip": "전체 공략 팁"
}

좌표 x, y는 사진 기준 0~100 비율로 줘.
score는 0~100 사이 정수.
좌표는 반드시 추천 인형의 중심점에 찍어줘.

중요 규칙:
- 출구, 버튼, 조이스틱, 빈 공간, 유리벽은 절대 추천하지 마.
- 반드시 실제 인형/파우치/고리/태그가 보이는 대상만 추천해.
- x,y 좌표는 추천 대상의 중심이 아니라 "집게가 걸릴 수 있는 부분"에 찍어.
- 빈 공간이나 유리 아래쪽에 좌표를 찍으면 안 돼.
- 확실하지 않은 대상은 추천하지 마.
- 3개를 억지로 채우지 말고, 확실한 것만 1~3개 추천해.
- 사진상 성공 가능성이 낮으면 score를 낮게 주거나, 아에 비추천 기계라고 해줘.

이미지 기준이다.

왼쪽 끝 x=0

오른쪽 끝 x=100

위 y=0

아래 y=100

추천 인형이 정확히 있는 위치만 좌표를 반환해.

절대로 대충 추정하지 마.
`,
            },
            {
              type: "input_image",
              image_url: imageBase64,
              detail: "auto",
            },
          ],
        },
      ],
    });

    const text = response.output_text;
    const json = JSON.parse(text);

    return Response.json(json);
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "분석 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}