import { useMemo, useState } from "react";
import { QUESTIONS, type Question } from "./questions";

const ROUND_SIZE = 7;

type RoundQuestion = {
  category: string;
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

// 문제 순서 + 보기 순서를 모두 섞어 한 라운드를 구성.
function buildRound(): RoundQuestion[] {
  const picked = shuffle(QUESTIONS).slice(0, ROUND_SIZE);
  return picked.map((qn: Question) => {
    const correct = qn.options[qn.answer];
    const options = shuffle(qn.options);
    return {
      category: qn.category,
      q: qn.q,
      options,
      answer: options.indexOf(correct),
      explain: qn.explain,
    };
  });
}

type Phase = "start" | "playing" | "result";

function verdict(score: number, total: number): { emoji: string; msg: string } {
  const ratio = score / total;
  if (ratio === 1) return { emoji: "🏆", msg: "만점! 상식 마스터네요" };
  if (ratio >= 0.7) return { emoji: "🎉", msg: "훌륭해요! 상식이 탄탄하네요" };
  if (ratio >= 0.4) return { emoji: "👍", msg: "나쁘지 않아요, 조금만 더!" };
  return { emoji: "📚", msg: "다시 도전해 볼까요?" };
}

export default function App() {
  const [phase, setPhase] = useState<Phase>("start");
  const [round, setRound] = useState<RoundQuestion[]>([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  function start() {
    setRound(buildRound());
    setIdx(0);
    setSelected(null);
    setScore(0);
    setPhase("playing");
  }

  const cur = round[idx];
  const answered = selected !== null;
  const isLast = idx === round.length - 1;

  function pick(i: number) {
    if (answered) return;
    setSelected(i);
    if (i === cur.answer) setScore((s) => s + 1);
  }

  function next() {
    if (isLast) {
      setPhase("result");
      return;
    }
    setIdx((v) => v + 1);
    setSelected(null);
  }

  const progress = useMemo(
    () => (round.length ? ((idx + (answered ? 1 : 0)) / round.length) * 100 : 0),
    [idx, answered, round.length],
  );

  // ── 시작 화면 ────────────────────────────────
  if (phase === "start") {
    return (
      <div className="wrap">
        <header className="header">
          <span className="brand">시사상식 퀴즈</span>
          <span className="badge">상식</span>
        </header>
        <div className="hero">
          <div className="hero-emoji">🧠</div>
          <h1 className="title">오늘의 상식, 몇 점일까?</h1>
          <p className="sub">
            경제·국제·과학·역사까지, 매번 다른 {ROUND_SIZE}문제로 상식을
            테스트해 보세요.
          </p>
        </div>
        <button className="primary" onClick={start}>
          퀴즈 시작하기
        </button>
        <p className="startnote">총 {QUESTIONS.length}문제 중 무작위 출제</p>
      </div>
    );
  }

  // ── 결과 화면 ────────────────────────────────
  if (phase === "result") {
    const v = verdict(score, round.length);
    return (
      <div className="wrap">
        <header className="header">
          <span className="brand">시사상식 퀴즈</span>
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
        </div>
        <button className="primary" onClick={start}>
          다시 풀기
        </button>
      </div>
    );
  }

  // ── 문제 풀이 화면 ───────────────────────────
  return (
    <div className="wrap">
      <header className="header">
        <span className="brand">시사상식 퀴즈</span>
        <span className="badge">
          {idx + 1} / {round.length}
        </span>
      </header>

      <div className="pbar">
        <div className="pbar-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="qcat">{cur.category}</div>
      <h1 className="question">{cur.q}</h1>

      <div className="options">
        {cur.options.map((opt, i) => {
          let cls = "opt";
          if (answered) {
            if (i === cur.answer) cls += " opt-correct";
            else if (i === selected) cls += " opt-wrong";
            else cls += " opt-dim";
          }
          return (
            <button key={i} className={cls} onClick={() => pick(i)}>
              <span className="opt-mark">
                {answered && i === cur.answer
                  ? "✓"
                  : answered && i === selected
                    ? "✕"
                    : String.fromCharCode(65 + i)}
              </span>
              <span className="opt-text">{opt}</span>
            </button>
          );
        })}
      </div>

      {answered && (
        <div
          className={`explain ${selected === cur.answer ? "explain-o" : "explain-x"}`}
        >
          <div className="explain-head">
            {selected === cur.answer ? "정답이에요! ✨" : "아쉬워요 😅"}
          </div>
          <p>{cur.explain}</p>
        </div>
      )}

      <button className="primary" disabled={!answered} onClick={next}>
        {isLast ? "결과 보기" : "다음 문제"}
      </button>
    </div>
  );
}
