// Prompt builder for the cover-background quality spike.
//
// 이 파일은 설계안의 옵션 어휘(비율/컬러톤/무드/안전영역/밀도)를 gpt-image-1이
// 알아듣는 영어 프롬프트로 변환한다. 핵심 목표 두 가지를 프롬프트로 강제한다:
//   1) 결과물에 어떤 글자/로고/워터마크도 넣지 않는다 (설계안 5번의 금지 목록)
//   2) 선택한 제목 안전영역을 시각적으로 비워 둔다 (후처리 전 1차 방어선)
//
// 안전영역은 최종 서비스에서는 sharp 후처리로 결정론적으로 합성할 계획이지만,
// 이 spike의 목적은 "AI가 애초에 텍스트 없는 쓸만한 배경을 뽑는가"를 보는 것이므로
// 프롬프트만으로 어디까지 되는지도 함께 관찰한다.

export const RATIOS = {
  // gpt-image-1 지원 크기 중 각 목표 비율에 가장 가까운 것으로 생성한 뒤,
  // 실제 서비스에서는 목표 비율로 크롭/확장한다. spike는 생성 크기만 사용.
  "a4-landscape": { size: "1536x1024", note: "A4 가로(1.414:1) → 1536x1024로 근사" },
  "16:9": { size: "1536x1024", note: "16:9 → 1536x1024로 근사 후 크롭" },
  "a4-portrait": { size: "1024x1536", note: "A4 세로(0.707:1) → 1024x1536로 근사" },
};

export const COLOR_TONES = {
  Navy: "deep navy blue tones, dark professional blues",
  Blue: "clean corporate blue tones, sky-to-azure gradients",
  Black: "rich near-black tones with subtle charcoal gradients",
  White: "bright airy white and light gray tones, high-key",
  Gold: "elegant champagne gold and warm bronze accents over dark base",
  Green: "sophisticated deep emerald and forest green tones",
  Gray: "neutral graphite and silver-gray tones",
};

export const MOODS = {
  Premium: "premium, high-end, refined and expensive-looking",
  Corporate: "clean corporate, trustworthy, business-report appropriate",
  Luxury: "luxurious, opulent, glossy and glamorous",
  Modern: "modern, contemporary, sleek and current",
  Minimal: "minimalist, restrained, lots of clean negative space",
  Dark: "dark, dramatic, moody with deep shadows",
};

export const DENSITIES = {
  Simple: "very simple composition, generous empty space, uncluttered, calm",
  Balanced: "balanced composition suitable for a real business report cover",
  Dramatic:
    "dramatic composition with light rays, gradients, layered depth and premium lighting effects",
};

// 제목 안전영역: 해당 구역을 시각적으로 차분/어둡게 비워 두라는 지시.
export const SAFE_AREAS = {
  "left": {
    label: "Left Title Area",
    instruction:
      "Reserve the LEFT ~40% as clean, open gradient space free of buildings and decorations, for a title added later. Shift the building rendering toward the right/bottom.",
  },
  "center": {
    label: "Center Title Area",
    instruction:
      "Reserve a clean, open gradient band across the CENTER, free of buildings and busy decorations, for a title added later.",
  },
  "right": {
    label: "Right Title Area",
    instruction:
      "Reserve the RIGHT ~40% as clean, open gradient space free of buildings and decorations, for a title added later. Shift the building rendering toward the left/bottom.",
  },
  "bottom": {
    label: "Bottom Title Area",
    instruction:
      "Keep the building rendering as a strip in the lower portion and reserve the space just above it as clean, open gradient area for a title added later.",
  },
  "full": {
    label: "Full Image",
    instruction:
      "Use the full frame as a balanced composition; no specific reserved title area.",
  },
};

// 텍스트/로고 금지 — 여러 표현을 겹쳐 확률을 낮춘다. gpt-image-1은 negative prompt를
// 공식 지원하지 않으므로 긍정문 안에 강하게 녹인다.
const NO_TEXT_CLAUSE =
  "ABSOLUTELY NO text of any kind: no words, no letters, no Korean characters, no English words, no gibberish text, no captions, no labels, no numbers, no dates. NO logos, NO watermarks, NO signatures, NO signage, NO UI elements, NO typography whatsoever. The image must be a pure clean background only.";

/**
 * 하나의 옵션 조합에 대한 최종 프롬프트를 만든다.
 */
export function buildPrompt({ colorTone, mood, density, safeArea }) {
  const tone = COLOR_TONES[colorTone];
  const moodDesc = MOODS[mood];
  const densityDesc = DENSITIES[density];
  const safe = SAFE_AREAS[safeArea];

  return [
    "Create a clean, modern background for the COVER of a Korean real-estate proposal/report, in a polished corporate brochure style.",
    "CRITICAL: keep the provided architectural rendering SHARP, crisp, photorealistic and highly detailed. Do NOT blur, fog, haze, soften, repaint, or turn it into an abstract/painterly image. Preserve its real structures and materials exactly.",
    "Composition: place the building rendering as a clean, sharp panoramic strip along the LOWER portion of the frame, sitting on the ground/water line as in the original.",
    `Fill the remaining space, especially the upper area, with a smooth clean gradient sky in ${tone}, as generous open negative space.`,
    "Add refined, minimal corporate design accents: a few thin elegant curved arc/ribbon lines sweeping through one upper corner, a faint halftone dot pattern in one corner, and delicate flowing wave/mesh lines near a lower corner. Keep these decorations subtle, tasteful and clearly secondary to the building.",
    `Overall mood: ${moodDesc}.`,
    `Composition density: ${densityDesc}.`,
    safe.instruction,
    NO_TEXT_CLAUSE,
    "The result must look like a professionally designed report cover (like a corporate brochure), NOT a photo filter or a foggy dream. Usable as-is behind a title added later in PowerPoint.",
  ].join(" ");
}

// spike 기본 매트릭스: 전 조합(7×6×3×5=630)은 과하므로 대표 조합만 생성한다.
// 여기서 텍스트 누출/안전영역 확보/톤 재현을 눈으로 검증한다.
export const DEFAULT_MATRIX = [
  { colorTone: "Navy", mood: "Corporate", density: "Balanced", safeArea: "left" },
  { colorTone: "Navy", mood: "Premium", density: "Dramatic", safeArea: "bottom" },
  { colorTone: "Gold", mood: "Luxury", density: "Dramatic", safeArea: "center" },
  { colorTone: "White", mood: "Minimal", density: "Simple", safeArea: "left" },
  { colorTone: "Black", mood: "Dark", density: "Dramatic", safeArea: "right" },
  { colorTone: "Blue", mood: "Modern", density: "Balanced", safeArea: "bottom" },
];
