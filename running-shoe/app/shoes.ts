// 러닝화 계급도 데이터.
//
// ⚠️ 이 목록은 커뮤니티에서 공유된 "러닝화 계급도"(2025.02 버전) 이미지를
// 참고해 1차로 옮겨 적은 초안입니다. 모델명·등급·뱃지는 출시 상황에 따라
// 바뀔 수 있으니 정식 오픈 전에 한 번 검수하세요.
//
// - 가격(priceBand)은 "참고용 대략 밴드"입니다. 쿠팡 파트너스 정책상 실시간
//   가격을 직접 크롤링/표기하지 않고, 상세에서 쿠팡 링크로 최저가를 확인하게
//   합니다.
// - coupangUrl 은 지금은 비워두면 상품명 검색 링크로 대체됩니다. 파트너스
//   승인 후 각 상품의 파트너스 딥링크로 교체하세요.

export type BadgeKey = "new" | "pick" | "great";

export const BADGES: Record<BadgeKey, { label: string; color: string }> = {
  new: { label: "새로 나온 신제품", color: "amber" },
  pick: { label: "런갤러 선호 픽", color: "emerald" },
  great: { label: "런리핏 87점(Great) 이상", color: "sky" },
};

export type BrandKey =
  | "nike"
  | "adidas"
  | "asics"
  | "newbalance"
  | "saucony"
  | "puma"
  | "hoka"
  | "brooks"
  | "mizuno"
  | "on";

// color: 실제 상품 사진이 없을 때 쓰는 브랜드 컬러 썸네일용 [시작색, 끝색] 그라데이션.
export const BRANDS: { key: BrandKey; name: string; color: [string, string] }[] =
  [
    { key: "nike", name: "나이키", color: ["#4b5563", "#111827"] },
    { key: "adidas", name: "아디다스", color: ["#1e293b", "#0b1220"] },
    { key: "asics", name: "아식스", color: ["#1e40af", "#0b2a6b"] },
    { key: "newbalance", name: "뉴발란스", color: ["#e11d48", "#9f1239"] },
    { key: "saucony", name: "사코니", color: ["#ea580c", "#9a3412"] },
    { key: "puma", name: "푸마", color: ["#525252", "#171717"] },
    { key: "hoka", name: "호카", color: ["#0d9488", "#0f766e"] },
    { key: "brooks", name: "브룩스", color: ["#4338ca", "#312e81"] },
    { key: "mizuno", name: "미즈노", color: ["#0ea5e9", "#0369a1"] },
    { key: "on", name: "온", color: ["#475569", "#1e293b"] },
  ];

export type TierKey =
  | "entry"
  | "maxCushion"
  | "stability"
  | "allrounder"
  | "lightTrainer"
  | "nonPlate"
  | "lightPlate"
  | "carbonPlate"
  | "midRace"
  | "longRace";

export type GroupKey = "daily" | "superTrainer" | "racing";

export const GROUPS: { key: GroupKey; name: string }[] = [
  { key: "daily", name: "데일리" },
  { key: "superTrainer", name: "슈퍼 트레이너" },
  { key: "racing", name: "레이싱" },
];

export const TIERS: {
  key: TierKey;
  group: GroupKey;
  name: string;
  priceBand: string;
  desc: string;
}[] = [
  {
    key: "entry",
    group: "daily",
    name: "입문화",
    priceBand: "약 13~16만 원대",
    desc: "입문자·데일리 조깅에 무난한 쿠션과 내구성을 갖춘 기본 데일리 트레이너.",
  },
  {
    key: "maxCushion",
    group: "daily",
    name: "맥스 쿠션화",
    priceBand: "약 17~23만 원대",
    desc: "두꺼운 미드솔로 장거리·회복주에서 발을 푹신하게 받쳐주는 맥스 쿠션화.",
  },
  {
    key: "stability",
    group: "daily",
    name: "안정화",
    priceBand: "약 15~19만 원대",
    desc: "과도한 발 안쪽 쏠림(오버프로네이션)을 잡아주는 안정화 구조의 데일리화.",
  },
  {
    key: "allrounder",
    group: "daily",
    name: "올라운더",
    priceBand: "약 15~19만 원대",
    desc: "조깅부터 템포런까지 두루 소화하는 균형 잡힌 올라운드 데일리화.",
  },
  {
    key: "lightTrainer",
    group: "daily",
    name: "경량 트레이너",
    priceBand: "약 11~15만 원대",
    desc: "가벼운 무게로 스피드 훈련·인터벌에 적합한 경량 트레이너.",
  },
  {
    key: "nonPlate",
    group: "superTrainer",
    name: "논 플레이트",
    priceBand: "약 16~21만 원대",
    desc: "플레이트 없이 반발 폼만으로 경쾌한 추진력을 내는 슈퍼 트레이너.",
  },
  {
    key: "lightPlate",
    group: "superTrainer",
    name: "라이트 플레이트",
    priceBand: "약 19~24만 원대",
    desc: "부드러운 플레이트로 데일리와 템포런을 모두 커버하는 라이트 플레이트화.",
  },
  {
    key: "carbonPlate",
    group: "superTrainer",
    name: "카본 플레이트",
    priceBand: "약 23~28만 원대",
    desc: "카본 플레이트를 넣어 훈련용으로도 강한 반발을 주는 슈퍼 트레이너.",
  },
  {
    key: "midRace",
    group: "racing",
    name: "중거리",
    priceBand: "약 22~30만 원대",
    desc: "5~10km 등 중거리 레이스에 맞춘 경량 카본 레이싱화.",
  },
  {
    key: "longRace",
    group: "racing",
    name: "장거리",
    priceBand: "약 28~40만 원대",
    desc: "하프·풀 마라톤 기록 단축을 위한 최상위 카본 레이싱화.",
  },
];

export type Shoe = {
  id: string;
  brand: BrandKey;
  tier: TierKey;
  name: string;
  badges: BadgeKey[];
  // 개별 참고가/설명이 있으면 우선 사용, 없으면 등급 기본값 사용.
  priceBand?: string;
  desc?: string;
  // 파트너스 딥링크. 비어 있으면 상품명 검색 링크로 대체.
  coupangUrl?: string;
  // 실제 상품 이미지 URL. 있으면 사진으로, 없으면 브랜드 컬러 썸네일로 표시.
  // (쿠팡 파트너스 오픈 API 승인 후 상품 이미지 URL을 넣으면 자동 교체됨)
  image?: string;
};

// 등급별 신발 목록. [모델명, 뱃지목록] 튜플로 간결하게 정의하고 아래에서
// 평평한 Shoe[] 로 펼친다. 뱃지: n=신제품, p=선호픽, g=런리핏 87+.
type Seed = [name: string, badges?: string];

const RAW: Record<BrandKey, Partial<Record<TierKey, Seed[]>>> = {
  nike: {
    entry: [["페가수스 41", "n"], ["인피니티 런"], ["페가수스 프리미엄", "p"]],
    maxCushion: [["인빈서블 3"], ["보메로 18", "p"]],
    stability: [["스트럭처 25"]],
    allrounder: [["보메로 17", "p"]],
    lightTrainer: [["라이벌 플라이 4"]],
    nonPlate: [["페가수스 플러스", "p"]],
    carbonPlate: [["줌 플라이 6", "p"]],
    midRace: [["스트릭 플라이", "p"]],
    longRace: [["베이퍼플라이 3", "pg"], ["알파플라이 3", "pg"]],
  },
  adidas: {
    entry: [["아디스타 3", "p"], ["슈퍼노바 라이즈 2", "p"]],
    maxCushion: [["슈퍼노바 프리마", "p"]],
    stability: [["슈퍼노바 솔루션"]],
    allrounder: [["아디제로 SL 2", "p"]],
    lightTrainer: [["아디오스 9", "p"]],
    nonPlate: [["에보 SL", "pg"]],
    lightPlate: [["보스턴 12", "pg"]],
    carbonPlate: [["프라임 X2 스트렁", "p"]],
    midRace: [["타쿠미 센 10", "pg"]],
    longRace: [["아디오스 프로 3", "pg"], ["아디오스 프로 4", "pg"], ["에보 1"]],
  },
  asics: {
    entry: [["젤 큐뮬러스 27", "p"]],
    maxCushion: [["젤 님버스 27", "pg"], ["글라이드라이드 맥스"]],
    stability: [["젤 카야노 31", "pg"]],
    allrounder: [["노바블라스트 5", "p"]],
    nonPlate: [["슈퍼블라스트 2", "pg"]],
    carbonPlate: [["매직스피드 4", "p"]],
    longRace: [["S4 플러스"], ["메타스피드 스카이 파리", "pg"], ["메타스피드 엣지 파리", "g"]],
  },
  newbalance: {
    entry: [["퓨얼셀 프로펠 V5"], ["프레시폼 880 V15", "p"]],
    maxCushion: [["프레시폼 모어 V5"]],
    stability: [["프레시폼 봉고 V6"], ["프레시폼 860 V14"]],
    allrounder: [["프레시폼 1080 V14"]],
    lightTrainer: [["퓨얼셀 레벨 V4"]],
    nonPlate: [["발로스"]],
    carbonPlate: [["퓨얼셀 SC 트레이너 V3", "p"]],
    midRace: [["퓨얼셀 SC 페이서 V2"]],
    longRace: [["퓨얼셀 SC 엘리트 V4", "pg"]],
  },
  saucony: {
    entry: [["액슨 3", "p"], ["라이드 18", "p"]],
    maxCushion: [["트라이엄프 22", "p"]],
    stability: [["가이드 17"], ["템퍼스 2", "p"], ["허리케인 24"]],
    lightTrainer: [["칸바라 15"]],
    lightPlate: [["엔돌핀 스피드 4", "pg"]],
    carbonPlate: [["칸바라 프로"]],
    longRace: [["엔돌핀 프로 4", "pg"], ["엔돌핀 엘리트", "g"]],
  },
  puma: {
    entry: [["벨로시티 나이트로 3", "p"]],
    maxCushion: [["매그니파이 나이트로 3"], ["매그맥스 나이트로", "p"]],
    stability: [["포에버런 나이트로", "p"]],
    lightTrainer: [["리버레이트 나이트로 2"]],
    nonPlate: [["마하 6", "p"]],
    lightPlate: [["마하 X2"]],
    carbonPlate: [["디비에이트 나이트로 3", "p"]],
    midRace: [["프로피오 나이트로", "p"]],
    longRace: [["패스트R 나이트로 엘리트 2"], ["디비에이트 나이트로 엘리트 3", "p"]],
  },
  hoka: {
    entry: [["클리프톤 9", "p"]],
    maxCushion: [["본디 9", "p"]],
    stability: [["아라히 7"], ["가비오타 5"]],
    allrounder: [["오로라 BL"]],
    nonPlate: [["하이퍼리온 4"]],
    lightPlate: [["하이퍼리온 맥스", "p"]],
    carbonPlate: [["스카이워드 X", "p"]],
    longRace: [["로켓 X2", "pg"], ["시엘로 X1 2.0", "p"]],
  },
  brooks: {
    entry: [["고스트 16"]],
    maxCushion: [["고스트 맥스 2"], ["글리세린 22"], ["글리세린 맥스", "p"]],
    stability: [["아드레날린 GTS 24", "p"], ["하이페리온 GTS 2"]],
    nonPlate: [["네오션"]],
    lightPlate: [["네오 버티", "p"]],
    longRace: [["하이페리온 엘리트 4", "pg"], ["하이페리온 엘리트 4 PB", "p"]],
  },
  mizuno: {
    entry: [["웨이브 라이더 28", "p"]],
    maxCushion: [["웨이브 스카이 8", "p"]],
    stability: [["웨이브 호라이즌 7"], ["웨이브 인스파이어 21", "p"]],
    longRace: [["리벨리온 프로 2", "p"], ["리벨리온 프로 3"], ["리벨리온 프로 로우"]],
  },
  on: {
    entry: [["클라우드 서프 2", "p"], ["클라우드서퍼 넥스트"]],
    maxCushion: [["클라우드 이클립스", "p"]],
    stability: [["클라우드 러너"]],
    allrounder: [["클라우드몬스터 1·2", "p"]],
    lightTrainer: [["클라우드 플로우 4", "p"]],
    nonPlate: [["클라우드몬스터 하이퍼", "p"]],
    lightPlate: [["클라우드 스트라토스 3", "p"]],
    midRace: [["클라우드 붐 존"]],
    longRace: [["클라우드 붐 에코 3", "pg"], ["클라우드 붐 스트라이크 LS", "p"]],
  },
};

function parseBadges(code?: string): BadgeKey[] {
  if (!code) return [];
  const map: Record<string, BadgeKey> = { n: "new", p: "pick", g: "great" };
  return [...code].map((c) => map[c]).filter(Boolean) as BadgeKey[];
}

export const SHOES: Shoe[] = Object.entries(RAW).flatMap(([brand, tiers]) =>
  Object.entries(tiers).flatMap(([tier, seeds]) =>
    (seeds as Seed[]).map(([name, badges], i) => ({
      id: `${brand}-${tier}-${i}`,
      brand: brand as BrandKey,
      tier: tier as TierKey,
      name,
      badges: parseBadges(badges),
    })),
  ),
);

export const TIER_BY_KEY = Object.fromEntries(
  TIERS.map((t) => [t.key, t]),
) as Record<TierKey, (typeof TIERS)[number]>;

export const BRAND_BY_KEY = Object.fromEntries(
  BRANDS.map((b) => [b.key, b]),
) as Record<BrandKey, (typeof BRANDS)[number]>;

// 상품의 쿠팡 링크. 개별 파트너스 딥링크가 있으면 그걸, 없으면 상품명 검색
// 링크를 돌려준다. 파트너스 subId(채널 추적용)를 env 로 붙일 수 있다.
export function coupangLink(shoe: Shoe): string {
  const brandName = BRAND_BY_KEY[shoe.brand].name;
  if (shoe.coupangUrl && shoe.coupangUrl !== "#") return shoe.coupangUrl;
  const q = encodeURIComponent(`${brandName} ${shoe.name}`);
  const sub = process.env.NEXT_PUBLIC_COUPANG_SUBID;
  const base = `https://www.coupang.com/np/search?component=&q=${q}`;
  return sub ? `${base}&subId=${encodeURIComponent(sub)}` : base;
}

export function shoePrice(shoe: Shoe): string {
  return shoe.priceBand ?? TIER_BY_KEY[shoe.tier].priceBand;
}

export function shoeDesc(shoe: Shoe): string {
  return shoe.desc ?? TIER_BY_KEY[shoe.tier].desc;
}
