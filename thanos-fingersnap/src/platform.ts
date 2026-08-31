// 앱인토스 네이티브 연동. 토스 안에서는 실제 API를 쓰고, 토스 밖(브라우저에서
// 개발 중이거나 미지원 버전)에서는 웹 표준으로 조용히 떨어진다.
// deprecated 된 share / generateHapticFeedback / getTossShareLink 는 쓰지 않는다.
import { Device, SafeArea, Share } from "@apps-in-toss/web-framework";

/** 진동. 토스 밖에서는 navigator.vibrate, 그것도 없으면 아무 일도 없다. */
export async function haptic(type: "tap" | "success" | "error") {
  try {
    await Device.triggerHaptic({ type });
    return;
  } catch {
    // 토스 앱이 아니다 — 웹 표준으로
  }
  try {
    navigator.vibrate?.(type === "tap" ? 10 : 30);
  } catch {
    /* 무시 */
  }
}

/**
 * 노치·홈 인디케이터 영역을 CSS 변수로 내려준다.
 * 반환값은 구독 해제 함수(토스 밖에서는 undefined).
 */
export function watchSafeArea() {
  const apply = (i: { top: number; bottom: number }) => {
    document.documentElement.style.setProperty("--safe-top", `${i.top}px`);
    document.documentElement.style.setProperty("--safe-bottom", `${i.bottom}px`);
  };
  try {
    apply(SafeArea.get());
    return SafeArea.subscribe({ onEvent: apply });
  } catch {
    // 토스 앱이 아니면 CSS 기본값 env(safe-area-inset-*) 이 쓰인다
    return undefined;
  }
}

/**
 * 친구에게 공유. 토스 → 웹 공유 시트 → 클립보드 순으로 내려간다.
 * 어디까지 갔는지 알아야 버튼 문구를 정할 수 있어서 결과를 돌려준다.
 */
export async function share(message: string): Promise<"shared" | "copied" | "none"> {
  try {
    await Share.sendMessage({ message });
    return "shared";
  } catch {
    // 토스 밖이거나 사용자가 취소 — 아래로
  }
  try {
    if (navigator.share) {
      await navigator.share({ title: "타노스 핑거스냅", text: message });
      return "shared";
    }
  } catch {
    // 사용자가 공유 시트를 닫았다
    return "none";
  }
  try {
    await navigator.clipboard?.writeText(message);
    return "copied";
  } catch {
    return "none";
  }
}
