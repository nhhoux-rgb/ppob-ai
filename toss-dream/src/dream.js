export const MAX_DREAM_LENGTH = 240;
export const STORAGE_KEY = 'ai-dream-history-v1';

export function normalizeDream(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

export function validateDream(value) {
  const dream = normalizeDream(value);
  if (dream.length < 5) return { ok: false, message: '꿈 내용을 5자 이상 적어주세요.' };
  if (dream.length > MAX_DREAM_LENGTH) return { ok: false, message: `${MAX_DREAM_LENGTH}자 이내로 적어주세요.` };
  return { ok: true, dream };
}

export function fallbackResult(dream) {
  const hasWater = /물|바다|강|비|파도/.test(dream);
  const hasAnimal = /뱀|개|고양이|호랑이|새|동물/.test(dream);
  const hasLucky = /뱀|돼지|용|돈|금|보석|해|무지개|날아/.test(dream);
  const category = hasLucky ? 'lucky' : hasWater ? 'mind' : 'caution';
  return {
    category,
    categoryLabel: category === 'lucky' ? '길몽' : category === 'caution' ? '주의몽' : '마음꿈',
    categoryLine: category === 'lucky' ? '좋은 기운이 슬쩍 문을 두드리는 꿈이에요' : category === 'caution' ? '서두르지 말라는 꿈속 알림이에요' : '낮의 생각을 마음이 정리한 꿈이에요',
    title: hasWater ? '감정의 흐름이 바뀌는 꿈' : hasAnimal ? '본능과 기회를 마주한 꿈' : '마음이 보내는 변화의 신호',
    summary: '최근 마음에 남아 있던 생각이 꿈속 상징으로 나타난 것으로 보여요. 현실의 감정과 연결해 가볍게 살펴보세요.',
    fortunes: [
      { key: '대운', emoji: '🍀', level: category === 'lucky' ? '상승' : '잔잔', note: category === 'lucky' ? '새로운 제안에 귀 기울여 보세요' : '작은 선택이 흐름을 만들어요' },
      { key: '금전', emoji: '💰', level: hasLucky ? '좋음' : '보통', note: hasLucky ? '뜻밖의 작은 행운을 기대해도 좋아요' : '충동구매만 한 번 참아보세요' },
      { key: '연애', emoji: '💗', level: hasAnimal ? '두근' : '평온', note: hasAnimal ? '먼저 안부를 건네기 좋은 날이에요' : '편안한 대화가 가까움을 만들어요' },
      { key: '건강', emoji: '🌿', level: hasWater ? '회복' : '보통', note: hasWater ? '물과 휴식이 필요한 날이에요' : '가볍게 몸을 움직여 보세요' }
    ],
    symbols: [
      { emoji: '🌙', name: '밤의 장면', meaning: '아직 선명하게 정리되지 않은 마음' },
      { emoji: hasWater ? '🌊' : '🪞', name: hasWater ? '물' : '기억', meaning: hasWater ? '감정의 변화와 회복' : '스스로를 돌아보는 시간' },
      { emoji: '✨', name: '움직임', meaning: '새로운 선택을 준비하는 에너지' }
    ],
    mood: '조심스러운 기대',
    goodThing: hasLucky ? '소액으로 로또 한 장을 사고, 기대보다 재미를 챙겨보세요.' : hasWater ? '시원한 국수나 푸른빛 음료로 기분을 환기해보세요.' : '누군가에게 작은 친절 하나를 몰래 건네보세요.',
    goodThingEmoji: hasLucky ? '🎟️' : hasWater ? '🥤' : '💌',
    goodThingWhy: hasLucky ? '꿈속 행운의 상징을 오늘의 작은 설렘으로 이어가는 미션이에요.' : hasWater ? '물의 흐름처럼 답답한 기분을 가볍게 흘려보내는 미션이에요.' : '마음의 긴장을 좋은 에너지로 바꾸는 미션이에요.',
    actionSteps: hasLucky ? ['자동보다 직접 숫자 하나 골라보기', '당첨 기대는 커피 한 잔 값만큼만 하기', '남은 행운은 주변 사람에게 좋은 말로 나누기'] : hasWater ? ['오늘 마실 물 한 잔 더 챙기기', '파란색 물건을 하나 가까이 두기', '저녁에는 따뜻한 샤워로 마무리하기'] : ['고마웠던 사람에게 짧게 안부 보내기', '문을 한 번 잡아주는 작은 친절 실천하기', '나 자신에게도 맛있는 간식 하나 선물하기'],
    disclaimer: '꿈 해석은 재미와 자기 성찰을 위한 참고용이에요.'
  };
}
