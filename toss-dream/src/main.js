import "./style.css";
import "./result-v2.css";
import {
  fallbackResult,
  MAX_DREAM_LENGTH,
  normalizeDream,
  STORAGE_KEY,
  validateDream,
} from "./dream.js";

// 기존 Vercel 백엔드에 꿈해몽 API 추가 (CORS 허용됨)
const API_URL = "https://ppob-ai-aics.vercel.app/api/dream";
const SHARE_IMAGE_URL = "https://ppob-ai-aics.vercel.app/dream-share.png";
const REQUEST_TIMEOUT_MS = 45000;

// 해몽 생성이 길어질 때 기다림이 덜 지루하도록 번갈아 보여주는 문구.
const LOADING_STEPS = [
  "꿈을 읽고 있어요",
  "장면 속 상징을 찾고 있어요",
  "전통 해몽과 맞춰보는 중이에요",
  "오늘의 운세를 정리하는 중이에요",
];

// 앱인토스 콘솔에서 보상형 광고그룹을 발급받으면 이 값만 채우면 된다.
// 비어 있으면 광고 없이 행운 미션을 바로 공개한다.
const AD_GROUP_ID = "";

const app = document.querySelector("#app");
const state = {
  page: "input",
  dream: "",
  result: null,
  loading: false,
  error: "",
  actionUnlocked: false,
  adReady: false,
};

const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c],
  );

// 토스 웹뷰 밖(웹 공개판)에서는 프레임워크 로드가 실패할 수 있으므로
// 필요한 시점에만 지연 로딩하고, 실패하면 null로 두고 웹 기본 동작을 쓴다.
let bridgePromise = null;
function bridge() {
  if (!bridgePromise) {
    bridgePromise = import("@apps-in-toss/web-framework").catch(() => null);
  }
  return bridgePromise;
}

async function preloadRewardedAd() {
  if (!AD_GROUP_ID) return;
  const toss = await bridge();
  if (!toss) return;
  try {
    if (!toss.loadFullScreenAd.isSupported()) return;
    state.adReady = false;
    toss.loadFullScreenAd({
      options: { adGroupId: AD_GROUP_ID },
      onEvent: (event) => {
        if (event.type === "loaded") state.adReady = true;
      },
      onError: () => {
        state.adReady = false;
      },
    });
  } catch {
    state.adReady = false;
  }
}

function unlockAction() {
  state.actionUnlocked = true;
  render();
}

async function showRewardedAd() {
  const toss = await bridge();
  // 광고를 띄울 수 없는 환경(웹 공개판, 광고그룹 미설정 등)에서는
  // 사용자를 막지 않고 미션을 그대로 공개한다.
  if (!AD_GROUP_ID || !toss || !toss.showFullScreenAd.isSupported()) {
    unlockAction();
    return;
  }
  if (!state.adReady) {
    state.error = "광고를 아직 준비하지 못했어요. 잠시 후 다시 눌러주세요.";
    render();
    preloadRewardedAd();
    return;
  }
  let rewarded = false;
  try {
    toss.showFullScreenAd({
      options: { adGroupId: AD_GROUP_ID },
      onEvent: (event) => {
        if (event.type === "userEarnedReward") rewarded = true;
        if (event.type === "dismissed") {
          state.adReady = false;
          if (rewarded) unlockAction();
          else {
            state.error = "광고를 끝까지 보면 행운 미션이 열려요.";
            render();
          }
          window.setTimeout(preloadRewardedAd, 500);
        }
      },
      onError: () => {
        state.error = "광고를 불러오지 못했어요. 다시 시도해주세요.";
        render();
        preloadRewardedAd();
      },
    });
  } catch {
    state.error = "광고를 표시하지 못했어요.";
    render();
    preloadRewardedAd();
  }
}

async function requestInterpretation(dream) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      // 단순 요청으로 보내 프리플라이트 회피 (토스 프록시 우회)
      headers: { "Content-Type": "text/plain;charset=UTF-8" },
      body: JSON.stringify({ dream }),
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || "해몽을 가져오지 못했어요.");
    return payload;
  } finally {
    clearTimeout(timer);
  }
}

async function analyzeDream() {
  const checked = validateDream(state.dream);
  if (!checked.ok) {
    state.error = checked.message;
    render();
    return;
  }
  state.loading = true;
  state.error = "";
  render();
  let step = 0;
  const ticker = setInterval(() => {
    step = (step + 1) % LOADING_STEPS.length;
    const button = app.querySelector("#analyze");
    if (button) button.innerHTML = `<i class="spinner"></i> ${LOADING_STEPS[step]}`;
  }, 2600);
  try {
    if (import.meta.env.DEV) {
      // 로컬 개발 모드에서는 API 키 없이 화면만 확인할 수 있게 샘플 해몽을 쓴다.
      await new Promise((resolve) => setTimeout(resolve, 700));
      state.result = fallbackResult(checked.dream);
    } else {
      state.result = await requestInterpretation(checked.dream);
    }
    state.page = "result";
    state.actionUnlocked = false;
  } catch (error) {
    state.error =
      error.name === "AbortError"
        ? "응답이 늦어지고 있어요. 잠시 후 다시 시도해주세요."
        : error.message || "잠시 후 다시 시도해주세요.";
  } finally {
    clearInterval(ticker);
    state.loading = false;
    render();
  }
}

function saveResult() {
  try {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    history.unshift({
      id: Date.now(),
      dream: normalizeDream(state.dream),
      result: state.result,
      savedAt: new Date().toISOString(),
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 10)));
    state.error = "내 기기에 저장했어요.";
  } catch {
    state.error = "저장하지 못했어요.";
  }
  render();
}

async function shareResult() {
  const r = state.result;
  const fortuneLine = r.fortunes
    .map((item) => `${item.emoji}${item.key} ${item.level}`)
    .join(" · ");
  const toss = await bridge();
  try {
    let link = location.href;
    if (toss?.Share?.createLink) {
      link = await toss.Share.createLink({
        path: "intoss://ai-dream",
        ogImageUrl: SHARE_IMAGE_URL,
      });
    }
    const message = `🌙 내 꿈은 ${r.categoryLabel}!\n${r.title}\n${fortuneLine}\n\n꿈결에서 내 꿈도 해몽해보기\n${link}`;
    if (toss?.Share?.sendMessage) await toss.Share.sendMessage({ message });
    else if (navigator.share)
      await navigator.share({
        title: `꿈결 · ${r.categoryLabel}`,
        text: message,
        url: link,
      });
    else {
      await navigator.clipboard.writeText(message);
      state.error = "공유 문구와 링크를 복사했어요.";
      render();
    }
  } catch {
    const message = `🌙 내 꿈은 ${r.categoryLabel}! ${r.title} — 꿈결 AI 꿈해몽 ${location.href}`;
    try {
      await navigator.clipboard.writeText(message);
      state.error = "공유 문구와 링크를 복사했어요.";
    } catch {
      state.error = "공유를 열지 못했어요. 다시 시도해주세요.";
    }
    render();
  }
}

function renderInput() {
  app.innerHTML = `<section class="input-page">
    <div class="moon-mark"><span>☾</span></div>
    <p class="eyebrow">AI DREAM NOTE</p><h1>어젯밤 꿈,<br>무슨 의미였을까요?</h1>
    <p class="lead">장면과 그때 기분을 함께 적을수록<br>더 정확한 해석이 나와요.</p>
    <div class="input-card"><label for="dream">꿈 내용</label><textarea id="dream" maxlength="${MAX_DREAM_LENGTH}" placeholder="예: 큰 뱀이 집 안으로 들어왔는데 이상하게 무섭지 않고 오히려 반가웠어요.">${esc(state.dream)}</textarea><div class="counter"><span>개인정보는 적지 마세요</span><b>${state.dream.length}/${MAX_DREAM_LENGTH}</b></div></div>
    ${state.error ? `<p class="notice">${esc(state.error)}</p>` : ""}
    <button id="analyze" class="primary" ${state.loading ? "disabled" : ""}>${state.loading ? `<i class="spinner"></i> ${LOADING_STEPS[0]}` : "꿈 해몽하기 <span>→</span>"}</button>
    <p class="fine">해몽은 재미와 자기 성찰을 위한 참고용이에요.</p>
  </section>`;
  const textarea = app.querySelector("#dream");
  textarea.oninput = (event) => {
    state.dream = event.target.value;
    app.querySelector(".counter b").textContent =
      `${state.dream.length}/${MAX_DREAM_LENGTH}`;
  };
  app.querySelector("#analyze").onclick = analyzeDream;
}

// 운세 점수를 0~100 막대 너비로. 값이 없으면 막대를 숨긴다.
function scoreBar(score) {
  if (typeof score !== "number" || !Number.isFinite(score)) return "";
  const width = Math.min(100, Math.max(0, Math.round(score)));
  return `<div class="gauge"><i style="width:${width}%"></i></div><small class="score">${width}점</small>`;
}

function renderResult() {
  const r = state.result;
  app.innerHTML = `<section class="result-page">
    <button id="back" class="back">‹ 다시 해몽하기</button><div class="result-head ${esc(r.category)}"><span class="category-badge">${r.category === "lucky" ? "🍀" : r.category === "caution" ? "🔔" : "☁️"} ${esc(r.categoryLabel)}</span><p>${esc(r.categoryLine)}</p><h1>${esc(r.title)}</h1></div>
    <article class="summary-card"><p>${esc(r.summary)}</p><div class="mood"><span>꿈이 남긴 기분</span><b>${esc(r.mood)}</b></div></article>
    ${r.todayFocus ? `<article class="focus-card"><span>☀️</span><div><small>오늘 하루, 이것만</small><b>${esc(r.todayFocus)}</b></div></article>` : ""}
    <h2>오늘의 운세 한눈에</h2><div class="fortunes">${r.fortunes.map((f) => `<article><div><span>${esc(f.emoji)}</span><b>${esc(f.key)}</b></div><strong>${esc(f.level)}</strong>${scoreBar(f.score)}<p>${esc(f.note)}</p></article>`).join("")}</div>
    <h2>꿈속 주요 상징</h2><div class="symbols">${r.symbols.map((s) => `<article><span>${esc(s.emoji)}</span><div><b>${esc(s.name)}</b><p>${esc(s.meaning)}</p>${s.connection ? `<p class="link">→ ${esc(s.connection)}</p>` : ""}</div></article>`).join("")}</div>
    ${r.reflection ? `<article class="reflect-card"><small>스스로에게 던져볼 질문</small><b>${esc(r.reflection)}</b></article>` : ""}
    <section class="good-card ${state.actionUnlocked ? "unlocked" : ""}"><div class="gift">${state.actionUnlocked ? esc(r.goodThingEmoji) : "🎁"}</div><div><small>오늘의 행운 미션</small><h2>${state.actionUnlocked ? esc(r.goodThing) : "행운 미션 확인하기"}</h2></div>${state.actionUnlocked ? `<p class="mission-why">${esc(r.goodThingWhy)}</p><ol>${r.actionSteps.map((step) => `<li>${esc(step)}</li>`).join("")}</ol>` : `<button id="reward" class="reward">무료로 확인하기${AD_GROUP_ID ? " <span>AD</span>" : ""}</button>`}</section>
    ${state.error ? `<p class="notice">${esc(state.error)}</p>` : ""}
    <button id="share" class="primary share-button">친구에게 결과 공유하기 <span>↗</span></button><button id="save" class="secondary">결과 저장하기</button><button id="again" class="secondary subtle">다른 꿈 해몽하기</button>
    <p class="fine">${esc(r.disclaimer)}</p>
  </section>`;
  app.querySelector("#back").onclick = app.querySelector("#again").onclick =
    () => {
      state.page = "input";
      state.error = "";
      render();
    };
  app.querySelector("#save").onclick = saveResult;
  app.querySelector("#share").onclick = shareResult;
  app.querySelector("#reward")?.addEventListener("click", showRewardedAd);
}

function render() {
  if (state.page === "input") renderInput();
  else renderResult();
}

render();
preloadRewardedAd();
