// 앱인토스 플랫폼 연동. 토스 안에서는 실제 로그인/공유 API를 쓰고,
// 토스 밖(웹/미지원)에서는 localStorage 게스트로 자연스럽게 폴백한다.
import { User, getConsentedUserData, share as tossShare } from '@apps-in-toss/web-framework';

const delay = (ms) => new Promise((r) => setTimeout(r, ms));
const withTimeout = (p, ms) =>
  Promise.race([
    p,
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ]);

const LS_ID = 'five-second-player-key';
const LS_GUEST_NICK = 'five-second-guest-nick';
const LS_TOSS_NICK = 'five-second-toss-nick';

function readLS(k) {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
}
function writeLS(k, v) {
  try {
    localStorage.setItem(k, v);
  } catch {
    /* ignore */
  }
}

function guestId() {
  let v = readLS(LS_ID);
  if (!v) {
    v = 'web:' + (crypto?.randomUUID?.() ?? Date.now().toString(36) + Math.random().toString(36).slice(2));
    writeLS(LS_ID, v);
  }
  return v;
}
function guestNick() {
  let v = readLS(LS_GUEST_NICK);
  if (!v) {
    v = '게스트' + Math.floor(1000 + Math.random() * 9000);
    writeLS(LS_GUEST_NICK, v);
  }
  return v;
}

async function tossHash() {
  try {
    const r = await withTimeout(User.getAnonymousKey(), 2500);
    if (r && typeof r === 'object' && r.hash) return r.hash;
  } catch {
    /* 토스 밖 */
  }
  return null;
}

// 이름 동의 데이터. 약관 미등록/거부 시 null. 성공하면 캐시.
async function tossName() {
  const cached = readLS(LS_TOSS_NICK);
  if (cached) return cached;
  try {
    const data = await getConsentedUserData({ consentedUserDataKey: 'user_name' });
    if (data) {
      const v = Object.values(data).find(
        (x) => typeof x === 'string' && x.trim().length > 0,
      );
      if (typeof v === 'string') {
        writeLS(LS_TOSS_NICK, v.trim());
        return v.trim();
      }
    }
  } catch {
    /* TERMS_NOT_SET / USER_DECLINED / 미지원 */
  }
  return null;
}

export const platform = {
  user: null,

  // 로그인: 토스 익명 고유키(+동의 시 이름). 실패 시 게스트.
  async login() {
    const hash = await tossHash();
    if (hash) {
      const nickname = (await tossName()) || guestNick();
      this.user = { userId: 'toss:' + hash, nickname, source: 'toss' };
      return this.user;
    }
    this.user = { userId: guestId(), nickname: guestNick(), source: 'web' };
    return this.user;
  },

  // 보상형 광고는 이번 버전 범위 밖 → mock 유지
  async showRewardedAd() {
    await delay(1200);
    return { rewarded: true, unitType: 'attempt', unitAmount: 1 };
  },

  async share(message) {
    try {
      if (typeof tossShare === 'function') {
        await tossShare({ message });
        return { shared: true };
      }
    } catch {
      /* 폴백 */
    }
    try {
      if (navigator.share) return await navigator.share({ title: '5초 브리핑', text: message });
      await navigator.clipboard?.writeText(message);
    } catch {
      /* ignore */
    }
    return { copied: true };
  },
};
