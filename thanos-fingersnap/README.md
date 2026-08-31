# 타노스 핑거스냅 — 토스 미니앱

버튼을 한 번 누르면 살아남거나 먼지가 된다. 확률은 정확히 5대5, 그게 전부다.
Vite + React + `@apps-in-toss/web-framework`.

## 개발

```bash
npm install
npm run dev        # 브라우저에서 확인 (네이티브 API는 폴백된다)
npm run typecheck
npm run build      # vite build && ait build
npm run deploy     # ait deploy
```

`appName`은 `apps-in-toss.config.ts`에 `thanos-fingersnap`으로 박혀 있다.
토스 개발자센터에 등록한 이름과 **반드시 같아야** 한다. 이 값이 번들 안
`bundle.json`에 들어가서 업로드할 때 대조되므로, 파일 이름을 바꾸는 것으로는
해결되지 않는다.

## 확률은 진짜 절반이다

`Math.random()` 대신 `crypto.getRandomValues()`로 1바이트를 받아 짝수/홀수로
가른다. 256은 2로 나누어떨어지므로 나머지 편향이 없다. 20만 번 뽑아 50.08%가
나오는 것을 확인했다.

결과는 **버튼을 누르는 순간** 정해지고 연출은 그 뒤에 재생된다. 연출이 끝난
뒤에 뽑으면 애니메이션 길이가 결과에 영향을 주는 것처럼 보인다.

## 네이티브 API

전부 `src/platform.ts` 한 곳에 모아 `try/catch`로 감쌌다. 토스 앱 밖(브라우저
개발 중)에서는 조용히 웹 표준으로 떨어진다.

| 용도 | 토스 | 폴백 |
| --- | --- | --- |
| 결과 공유 | `Share.sendMessage` | `navigator.share` → 클립보드 복사 |
| 스냅 진동 | `Device.triggerHaptic` | `navigator.vibrate` |
| 노치·홈 인디케이터 | `SafeArea.get` / `subscribe` | `env(safe-area-inset-*)` |

`share`, `generateHapticFeedback`, `getTossShareLink`는 deprecated라 쓰지 않는다.

권한은 하나도 요청하지 않는다(`permissions: []`). 서버도 쓰지 않는다. 누적
기록(`총 N번 중 M번 생존`)은 `localStorage`에만 남으므로 기기를 옮기면 초기화된다.

## 빌드 주의

`vite.config.ts`에 `css: { postcss: {} }`가 있다. 이걸 빼면 vite가 상위 폴더로
올라가 저장소 루트 Next.js 앱의 `postcss.config.mjs`(테일윈드)를 주워 와서
빌드가 깨진다. 이 앱은 순수 CSS만 쓴다.

루트 Vercel 배포에는 포함되지 않도록 `../.vercelignore`에 넣어 두었다.

## 심사 전에 확인할 것

건틀렛은 원본 이미지를 쓰지 않고 보석 여섯 개를 도형으로만 그렸다. 다만 앱
이름은 마블 캐릭터 이름이라, 스토어 등록 시 상표 문제로 반려될 여지가 있다.
걸리면 이름만 바꾸면 되도록 문구는 `src/App.tsx` 위쪽에 모여 있다.
