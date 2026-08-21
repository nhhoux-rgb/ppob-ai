import { User } from "@apps-in-toss/web-framework";

export type Identity = {
  id: string;
  name: string;
  source: "toss" | "web";
};

const LS_ID = "quiz:webid";
const LS_NAME = "quiz:webname";

function randomSuffix(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

function getWebId(): string {
  try {
    let id = localStorage.getItem(LS_ID);
    if (!id) {
      id = `web:${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
      localStorage.setItem(LS_ID, id);
    }
    return id;
  } catch {
    return `web:anon${randomSuffix()}`;
  }
}

export function getStoredName(): string {
  try {
    return localStorage.getItem(LS_NAME) ?? "";
  } catch {
    return "";
  }
}

export function setStoredName(name: string) {
  try {
    localStorage.setItem(LS_NAME, name);
  } catch {
    /* ignore */
  }
}

function defaultNick(): string {
  const saved = getStoredName();
  if (saved) return saved;
  const n = `게스트${randomSuffix()}`;
  setStoredName(n);
  return n;
}

// 토스 브릿지가 없는 환경(웹)에서 호출이 멈추지 않도록 타임아웃 처리.
function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), ms),
    ),
  ]);
}

// 최초 로드 시: 토스 익명 고유키만 가져온다(동의 웹뷰를 띄우지 않음).
// 토스 밖(웹)에서는 localStorage 기반 게스트 신원으로 폴백.
export async function getIdentity(): Promise<Identity> {
  try {
    const res = await withTimeout(User.getAnonymousKey(), 2500);
    const hash =
      res && typeof res === "object" && "hash" in res ? res.hash : null;
    if (hash) {
      return { id: `toss:${hash}`, name: defaultNick(), source: "toss" };
    }
  } catch {
    /* 토스 밖 → 폴백 */
  }
  return { id: getWebId(), name: defaultNick(), source: "web" };
}

// "랭킹 등록" 시점에 호출: 토스 이름 동의 데이터를 요청한다.
// 약관 미등록(TERMS_NOT_SET)·거부·미지원 시 null 을 반환한다.
// 동의 웹뷰가 뜰 수 있어 이 호출에는 타임아웃을 걸지 않는다.
export async function requestTossName(): Promise<string | null> {
  try {
    const data = await User.getConsentedData({
      consentedUserDataKey: "USER_NAME",
    });
    if (data) {
      const v = Object.values(data).find(
        (x) => typeof x === "string" && x.trim().length > 0,
      );
      if (typeof v === "string") return v.trim();
    }
  } catch {
    /* TERMS_NOT_SET / USER_DECLINED / 미지원 → null */
  }
  return null;
}
