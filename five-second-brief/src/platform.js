const delay = ms => new Promise(r => setTimeout(r, ms));

export const platform = {
  mode: 'mock',
  async login() { await delay(450); return { userId:'mock-user', nickname:'김토스' }; },
  async showRewardedAd() { await delay(1200); return { rewarded:true, unitType:'attempt', unitAmount:1 }; },
  async submitScore(score) { localStorage.setItem('five-second-last-score', String(score)); return { ok:true }; },
  async share(message) {
    if (navigator.share) return navigator.share({ title:'5초 브리핑', text:message });
    await navigator.clipboard?.writeText(message); return { copied:true };
  }
};

// 실제 앱인토스 연결 지점
// login: appLogin() 인가코드 -> 파트너 서버의 mTLS 토큰 교환
// ad: loadFullScreenAd() -> loaded -> showFullScreenAd() -> userEarnedReward일 때만 서버 지급
// score: 서버 검증 후 submitGameCenterLeaderBoardScore({ score }) 병행
// share: getTossShareLink({ path })로 딥링크 생성 후 share({ message })
// IAP: IAP.createOneTimePurchaseOrder + 서버 원장 + completeProductGrant
