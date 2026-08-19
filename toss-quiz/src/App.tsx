import { useEffect, useRef, useState } from "react";
import { CATEGORIES, categoryLabel, type CategoryKey } from "./categories";
import { pickByCategory, type Question } from "./questions";

// 기존 Vercel 백엔드에 문제 생성 API 추가 (CORS 허용됨)
const API_URL = "https://ppob-ai-aics.vercel.app/api/quiz";
const ROUND_SIZE = 10;
const TIME_LIMIT_MS = 5000; // 문제당 제한시간 5초
const REVEAL_MS = 1400; // 정답 공개 후 자동으로 넘어가기까지

type RoundQuestion = {
  catLabel: string;
  q: string;
  options: string[];
  answer: number;
  explain: string;
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 보기 순서를 섞어 정답 인덱스를 다시 계산.
function shuffleOptions(
  q: { options: string[]; answer: number },
): { options: string[]; answer: number } {
  const correct = q.options[q.answer];
  const options = shuffle(q.options);
  return { options, answer: options.indexOf(correct) };
}

function fromLocal(cat: CategoryKey): RoundQuestion[] {
  return pickByCategory(cat, ROUND_SIZE).map((q: Question) => {
    const s = shuffleOptions(q);
    return {
      catLabel: categoryLabel(q.cat),
      q: q.q,
      options: s.options,
      answer: s.answer,
      explain: q.explain,
    };
  });
}

// AI 응답을 라운드 형식으로. 실패하면 예외를 던져 폴백으로 넘긴다.
async function fromAI(cat: CategoryKey): Promise<RoundQuestion[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      // 단순 요청으로 보내 프리플라이트 회피 (토스 프록시 우회)
      headers: { "Content-Type": "text/plain;charset=UTF-8" },
      body: JSON.stringify({ category: cat, count: ROUND_SIZE }),
      signal: controller.signal,
    });
    const data = await res.json();
    if (!res.ok || !Array.isArray(data.questions)) {
      throw new Error(data.error || `HTTP ${res.status}`);
    }
    const label = cat === "random" ? "상식" : categoryLabel(cat);
    const round: RoundQuestion[] = data.questions
      .filter(
        (q: any) =>
          q &&
          typeof q.q === "string" &&
          Array.isArray(q.options) &&
          q.options.length === 4,
      )
      .map((q: any) => {
        const s = shuffleOptions({ options: q.options, answer: q.answer });
        return {
          catLabel: label,
          q: q.q,
          options: s.options,
          answer: s.answer,
          explain: typeof q.explain === "string" ? q.explain : "",
        };
      });
    if (round.length === 0) throw new Error("no questions");
    return round;
  } finally {
    clearTimeout(timer);
  }
}

type Phase = "start" | "loading" | "playing" | "result";

function verdict(score: number, total: number): { emoji: string; msg: string } {
  const ratio = score / total;
  if (ratio === 1) return { emoji: "🏆", msg: "만점! 상식 마스터네요" };
  if (ratio >= 0.7) return { emoji: "🎉", msg: "훌륭해요! 상식이 탄탄하네요" };
  if (ratio >= 0.4) return { emoji: "👍", msg: "나쁘지 않아요, 조금만 더!" };
  return { emoji: "📚", msg: "다시 도전해 볼까요?" };
}

export default function App() {
  const [phase, setPhase] = useState<Phase>("start");
  const [cat, setCat] = useState<CategoryKey>("random");
  const [aiUsed, setAiUsed] = useState(true);
  const [round, setRound] = useState<RoundQuestion[]>([]);

  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [remaining, setRemaining] = useState(TIME_LIMIT_MS);
  const [score, setScore] = useState(0);

  const lockedRef = useRef(false); // 답 선택/시간초과로 잠김
  const advanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cur = round[idx];
  const locked = selected !== null || timedOut;
  const isLast = idx === round.length - 1;

  async function start(category: CategoryKey) {
    setCat(category);
    setScore(0);
    setIdx(0);
    setPhase("loading");
    try {
      const r = await fromAI(category);
      setRound(r);
      setAiUsed(true);
    } catch {
      setRound(fromLocal(category));
      setAiUsed(false);
    }
    resetQuestion();
    setPhase("playing");
  }

  function resetQuestion() {
    lockedRef.current = false;
    setSelected(null);
    setTimedOut(false);
    setRemaining(TIME_LIMIT_MS);
  }

  // 문제별 카운트다운 타이머
  useEffect(() => {
    if (phase !== "playing" || !cur) return;
    const startAt = Date.now();
    const iv = setInterval(() => {
      if (lockedRef.current) {
        clearInterval(iv);
        return;
      }
      const rem = TIME_LIMIT_MS - (Date.now() - startAt);
      if (rem <= 0) {
        clearInterval(iv);
        setRemaining(0);
        lockedRef.current = true;
        setTimedOut(true);
        scheduleAdvance();
      } else {
        setRemaining(rem);
      }
    }, 50);
    return () => clearInterval(iv);
    // idx 가 바뀔 때마다 새 타이머 시작
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, phase, round]);

  function pick(i: number) {
    if (lockedRef.current) return;
    lockedRef.current = true;
    setSelected(i);
    if (i === cur.answer) setScore((s) => s + 1);
    scheduleAdvance();
  }

  function scheduleAdvance() {
    if (advanceRef.current) clearTimeout(advanceRef.current);
    advanceRef.current = setTimeout(advance, REVEAL_MS);
  }

  function advance() {
    if (advanceRef.current) {
      clearTimeout(advanceRef.current);
      advanceRef.current = null;
    }
    if (isLast) {
      setPhase("result");
      return;
    }
    resetQuestion();
    setIdx((v) => v + 1);
  }

  useEffect(() => {
    return () => {
      if (advanceRef.current) clearTimeout(advanceRef.current);
    };
  }, []);

  // ── 시작 화면: 분야 선택 ──────────────────
  if (phase === "start") {
    return (
      <div className="wrap">
        <header className="header">
          <span className="brand">5초 상식퀴즈</span>
          <span className="badge">⚡ 스피드</span>
        </header>
        <div className="intro">
          <div className="intro-emoji">🧠⏱️</div>
          <h1 className="title">문제당 5초, 순발력 상식 게임</h1>
          <p className="sub">
            분야를 고르면 AI가 매번 새로운 {ROUND_SIZE}문제를 출제해요. 5초 안에
            정답을 골라보세요!
          </p>
        </div>
        <div className="catlabel">분야 선택</div>
        <div className="catgrid">
          {CATEGORIES.map((c) => (
            <button key={c.key} className="cat" onClick={() => start(c.key)}>
              <span className="cat-emoji">{c.emoji}</span>
              <span className="cat-name">{c.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── 로딩 화면 ─────────────────────────────
  if (phase === "loading") {
    return (
      <div className="wrap center">
        <div className="spinner" />
        <div className="loadmsg">
          AI가 <b>{categoryLabel(cat)}</b> 문제를 만드는 중...
        </div>
        <div className="loadsub">잠시만 기다려 주세요 (최대 15초)</div>
      </div>
    );
  }

  // ── 결과 화면 ─────────────────────────────
  if (phase === "result") {
    const v = verdict(score, round.length);
    return (
      <div className="wrap">
        <header className="header">
          <span className="brand">5초 상식퀴즈</span>
          <span className="badge">결과</span>
        </header>
        <div className="result">
          <div className="result-emoji">{v.emoji}</div>
          <div className="result-score">
            <b>{score}</b>
            <span> / {round.length}</span>
          </div>
          <div className="result-msg">{v.msg}</div>
          <div className="result-bar">
            <div
              className="result-bar-fill"
              style={{ width: `${(score / round.length) * 100}%` }}
            />
          </div>
          <div className="result-tag">
            {categoryLabel(cat)} · {aiUsed ? "AI 출제" : "기본 문제"}
          </div>
        </div>
        <button className="primary" onClick={() => start(cat)}>
          같은 분야 다시
        </button>
        <button className="ghost" onClick={() => setPhase("start")}>
          분야 다시 고르기
        </button>
      </div>
    );
  }

  // ── 문제 풀이(5초 타이머) ─────────────────
  const secs = Math.ceil(remaining / 1000);
  const timePct = (remaining / TIME_LIMIT_MS) * 100;
  const danger = remaining <= 2000;

  return (
    <div className="wrap">
      <header className="header">
        <span className="brand">5초 상식퀴즈</span>
        <span className="badge">
          {idx + 1} / {round.length}
        </span>
      </header>

      {/* 5초 타이머 */}
      <div className="timer">
        <div className="timer-track">
          <div
            className={`timer-fill ${danger ? "danger" : ""}`}
            style={{ width: `${timePct}%` }}
          />
        </div>
        <div className={`timer-num ${danger ? "danger" : ""}`}>
          {locked ? (selected === cur.answer ? "✓" : "—") : secs}
        </div>
      </div>

      <div className="qcat">{cur.catLabel}</div>
      <h1 className="question">{cur.q}</h1>

      <div className="options">
        {cur.options.map((opt, i) => {
          let cls = "opt";
          if (locked) {
            if (i === cur.answer) cls += " opt-correct";
            else if (i === selected) cls += " opt-wrong";
            else cls += " opt-dim";
          }
          return (
            <button key={i} className={cls} onClick={() => pick(i)}>
              <span className="opt-mark">
                {locked && i === cur.answer
                  ? "✓"
                  : locked && i === selected
                    ? "✕"
                    : String.fromCharCode(65 + i)}
              </span>
              <span className="opt-text">{opt}</span>
            </button>
          );
        })}
      </div>

      {locked && (
        <div
          className={`explain ${
            selected === cur.answer ? "explain-o" : "explain-x"
          }`}
        >
          <div className="explain-head">
            {selected === cur.answer
              ? "정답이에요! ✨"
              : timedOut
                ? "시간 초과! ⏱️"
                : "아쉬워요 😅"}
          </div>
          {cur.explain && <p>{cur.explain}</p>}
        </div>
      )}

      {locked && (
        <button className="primary" onClick={advance}>
          {isLast ? "결과 보기" : "다음 문제 →"}
        </button>
      )}
    </div>
  );
}
