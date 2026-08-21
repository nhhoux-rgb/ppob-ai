export const MAX_DREAM_LENGTH = 240;
export const STORAGE_KEY = "ai-dream-history-v1";

export function normalizeDream(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

export function validateDream(value) {
  const dream = normalizeDream(value);
  if (dream.length < 5) return { ok: false, message: "꿈 내용을 5자 이상 적어주세요." };
  if (dream.length > MAX_DREAM_LENGTH)
    return { ok: false, message: `${MAX_DREAM_LENGTH}자 이내로 적어주세요.` };
  return { ok: true, dream };
}

// 로컬 개발 모드 전용 샘플. 실제 해몽은 서버(/api/dream)가 만든다.
export function fallbackResult(dream) {
  const hasWater = /물|바다|강|비|파도/.test(dream);
  const hasAnimal = /뱀|개|고양이|호랑이|새|동물/.test(dream);
  const hasLucky = /뱀|돼지|용|돈|금|보석|해|무지개|날아/.test(dream);
  const category = hasLucky ? "lucky" : hasWater ? "mind" : "caution";
  return {
    category,
    categoryLabel:
      category === "lucky" ? "길몽" : category === "caution" ? "주의몽" : "마음꿈",
    categoryLine:
      category === "lucky"
        ? "재물의 상징이 내 쪽으로 다가온 게 핵심이에요"
        : category === "caution"
          ? "서두르지 말라는 결이 읽혀요"
          : "낮의 생각이 밤에 정리된 꿈이에요",
    title: hasWater
      ? "감정의 물살이 바뀐 꿈"
      : hasAnimal
        ? "본능이 문 앞까지 온 꿈"
        : "속도를 늦추라는 꿈",
    summary:
      "이 해석은 로컬 개발용 샘플이에요. 실제 앱에서는 적어주신 꿈의 장면과 감정을 하나씩 짚어가며, 전통 해몽에서 그 소재를 어떻게 읽어왔는지와 지금 상황에 어떻게 이어지는지를 네다섯 문장으로 풀어드립니다.",
    mood: hasWater ? "묘한 홀가분함" : "조심스러운 기대",
    fortunes: [
      {
        key: "대운",
        emoji: "🍀",
        level: category === "lucky" ? "활짝" : "무난",
        score: category === "lucky" ? 88 : 55,
        note:
          category === "lucky"
            ? "이번 주 안에 들어오는 제안 하나를 흘려듣지 마세요"
            : "이번 주는 벌이기보다 정리하기 좋은 흐름이에요",
      },
      {
        key: "금전",
        emoji: "💰",
        level: hasLucky ? "순풍" : "주춤",
        score: hasLucky ? 76 : 42,
        note: hasLucky
          ? "미뤄둔 정산이나 환급을 오늘 확인해보세요"
          : "이번 주 충동구매 한 번만 참으면 손해가 없어요",
      },
      {
        key: "연애",
        emoji: "💗",
        level: hasAnimal ? "최고조" : "무난",
        score: hasAnimal ? 84 : 58,
        note: hasAnimal
          ? "먼저 연락하면 생각보다 반가운 답이 옵니다"
          : "말수를 줄이고 듣는 쪽이 가까워지는 날이에요",
      },
      {
        key: "건강",
        emoji: "🌿",
        level: hasWater ? "숨고르기" : "무난",
        score: hasWater ? 38 : 62,
        note: hasWater
          ? "오늘은 물을 자주 마시고 일찍 눕는 게 좋아요"
          : "목과 어깨만 한 번 풀어줘도 하루가 가벼워져요",
      },
    ],
    symbols: [
      {
        emoji: "🌙",
        name: "밤의 장면",
        meaning: "전통 해몽에서 밤은 아직 드러나지 않은 일을 뜻해요.",
        connection: "결론이 나지 않은 일을 하나 붙들고 있는 시기예요.",
      },
      {
        emoji: hasWater ? "🌊" : "🪞",
        name: hasWater ? "물" : "되비침",
        meaning: hasWater
          ? "물은 예로부터 재물과 감정의 흐름을 함께 나타냈어요."
          : "거울처럼 되비치는 장면은 자기 점검을 뜻해요.",
        connection: hasWater
          ? "감정의 방향이 바뀌는 중이라는 신호예요."
          : "요즘 스스로를 자주 검열하고 있다는 뜻이에요.",
      },
      {
        emoji: "🚪",
        name: "움직임",
        meaning: "드나드는 장면은 기회가 오가는 자리를 뜻해요.",
        connection: "선택을 미뤄둔 일이 곧 답을 요구할 거예요.",
      },
    ],
    todayFocus: hasWater
      ? "오늘은 결정을 미루고 몸부터 쉬게 하기"
      : "오늘 딱 한 가지만 매듭짓기",
    reflection: hasLucky
      ? "요즘 내가 놓치기 아까워하는 건 뭘까?"
      : "지금 붙잡히기 싫은 건 정확히 뭘까?",
    goodThing: hasLucky
      ? "소액으로 로또 한 장을 사고, 기대보다 재미를 챙겨보세요."
      : hasWater
        ? "시원한 국수나 푸른빛 음료로 기분을 환기해보세요."
        : "누군가에게 작은 친절 하나를 몰래 건네보세요.",
    goodThingEmoji: hasLucky ? "🎟️" : hasWater ? "🥤" : "💌",
    goodThingWhy: hasLucky
      ? "꿈속 행운의 상징을 오늘의 작은 설렘으로 이어가는 미션이에요."
      : hasWater
        ? "물의 흐름처럼 답답한 기분을 가볍게 흘려보내는 미션이에요."
        : "마음의 긴장을 좋은 에너지로 바꾸는 미션이에요.",
    actionSteps: hasLucky
      ? [
          "자동보다 직접 숫자 하나 골라보기",
          "당첨 기대는 커피 한 잔 값만큼만 하기",
          "남은 행운은 주변 사람에게 좋은 말로 나누기",
        ]
      : hasWater
        ? [
            "오늘 마실 물 한 잔 더 챙기기",
            "파란색 물건을 하나 가까이 두기",
            "저녁에는 따뜻한 샤워로 마무리하기",
          ]
        : [
            "고마웠던 사람에게 짧게 안부 보내기",
            "문을 한 번 잡아주는 작은 친절 실천하기",
            "나 자신에게도 맛있는 간식 하나 선물하기",
          ],
    disclaimer: "꿈 해석은 재미와 자기 성찰을 위한 참고용이에요.",
  };
}
