// 도전권/보상 정책 값. 백엔드(supabase-edge-tickets.ts)와 동일하게 유지.
export const TICKETS = {
  daily: 10, // 하루 도전권
  shareReward: 1, // 공유 1회당
  shareDailyCap: 5, // 하루 공유 보상 한도
  adReward: 5, // 광고 1회당
  purchaseCount: 30, // 유료 1건 지급
  purchasePrice: 990, // 원
};

// 토스 콘솔에서 등록한 뒤 값을 채우면 광고/결제 버튼이 실제로 작동한다.
// 비어 있으면 버튼은 "준비 중"으로 표시된다.
export const TOSS = {
  adGroupId: '', // 앱인토스 콘솔 > 광고 > 광고그룹 ID
  purchaseSku: '', // 앱인토스 콘솔 > 인앱결제 상품 SKU (30장 990원 상품)
};
