// 앱인토스 플랫폼 연동. 토스 안에서는 실제 로그인/공유/광고/결제 API를 쓰고,
// 토스 밖(웹/미지원)에서는 자연스럽게 폴백한다.
import {
  User,
  getConsentedUserData,
  share as tossShare,
  loadFullScreenAd,
  showFullScreenAd,
  IAP,
} from '@apps-in-toss/web-framework';
import { TOSS } from './config.js';

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
function supported(fn) {
  try {
    return typeof fn?.isSupported === 'function' ? fn.isSupported() : false;
  } catch {
    return false;
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

  // 광고/결제 사용 가능 여부(설정값 + 네이티브 지원)
  adAvailable() {
    return Boolean(TOSS.adGroupId) && supported(loadFullScreenAd) && supported(showFullScreenAd);
  },
  purchaseAvailable() {
    return Boolean(TOSS.purchaseSku) && supported(IAP.createOneTimePurchaseOrder);
  },

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

  // 보상형 전면광고: 시청 완료(userEarnedReward)면 { rewarded:true }.
  async showRewardedAd() {
    const adGroupId = TOSS.adGroupId;
    if (!this.adAvailable()) return { rewarded: false, reason: 'unavailable' };
    return new Promise((resolve) => {
      let done = false;
      let earned = false;
      const finish = (r) => {
        if (done) return;
        done = true;
        resolve(r);
      };
      try {
        loadFullScreenAd({
          options: { adGroupId },
          onEvent: (e) => {
            if (e?.type === 'loaded') {
              showFullScreenAd({
                options: { adGroupId },
                onEvent: (ev) => {
                  if (ev?.type === 'userEarnedReward') earned = true;
                  if (ev?.type === 'dismissed' || ev?.type === 'failedToShow') {
                    finish({ rewarded: earned });
                  }
                },
                onError: () => finish({ rewarded: false, reason: 'show_error' }),
              });
            }
          },
          onError: () => finish({ rewarded: false, reason: 'load_error' }),
        });
      } catch {
        finish({ rewarded: false, reason: 'exception' });
      }
      // 안전장치: 60초 내 종료 없으면 실패 처리
      setTimeout(() => finish({ rewarded: earned }), 60000);
    });
  },

  // 유료 도전권 구매. onGrant(orderId)=>Promise<boolean> 로 서버 지급을 수행.
  async purchase(onGrant) {
    const sku = TOSS.purchaseSku;
    if (!this.purchaseAvailable()) return { ok: false, reason: 'unavailable' };
    return new Promise((resolve) => {
      let done = false;
      const finish = (r) => {
        if (done) return;
        done = true;
        resolve(r);
      };
      try {
        IAP.createOneTimePurchaseOrder({
          options: {
            sku,
            processProductGrant: async ({ orderId }) => {
              try {
                return await onGrant(orderId);
              } catch {
                return false;
              }
            },
          },
          onEvent: (e) => {
            if (e?.type === 'success') finish({ ok: true });
          },
          onError: () => finish({ ok: false, reason: 'error' }),
        });
      } catch {
        finish({ ok: false, reason: 'exception' });
      }
    });
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
      if (navigator.share) return await navigator.share({ title: '5초 상식퀴즈', text: message });
      await navigator.clipboard?.writeText(message);
    } catch {
      /* ignore */
    }
    return { copied: true };
  },
};
