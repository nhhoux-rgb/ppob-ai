import { useEffect, useRef, useState } from "react";
import { CATEGORIES, categoryLabel, type CategoryKey } from "./categories";
import { pickByCategory, type Question } from "./questions";
import {
  getIdentity,
  requestTossName,
  setStoredName,
  type Identity,
} from "./identity";
import { fetchTop, submitScore, type RankEntry } from "./leaderboard";

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

function shuffleOptions(q: { options: string[]; answer: number }): {
  options: string[];
  answer: number;
} {
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

async function fromAI(cat: CategoryKey): Promise<RoundQuestion[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(API_URL, {
      method: "POST",
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

type Phase = "start" | "loading" | "playing" | "result" | "rank";

function verdict(score: number, total: number): { emoji: string; msg: string } {
  const ratio = score / total;
  if (ratio === 1) return { emoji: "🏆", msg: "만점! 상식 마스터네요" };
  if (ratio >= 0.7) return { emoji: "🎉", msg: "훌륭해요! 상식이 탄탄하네요" };
  if (ratio >= 0.4) return { emoji: "👍", msg: "나쁘지 않아요, 조금만 더!" };
  return { emoji: "📚", msg: "다시 도전해 볼까요?" };
}

// 정답 시 획득 점수: 기본 100 + 남은 시간 비례 보너스(최대 +100)
function gainFor(remainingMs: number): number {
  return 100 + Math.round((Math.max(0, remainingMs) / TIME_LIMIT_MS) * 100);
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
  const [score, setScore] = useState(0); // 맞힌 개수
  const [points, setPoints] = useState(0); // 이번 라운드 점수

  const [identity, setIdentity] = useState<Identity | null>(null);
  const [nick, setNick] = useState("");

  // 랭킹 화면 상태
  const [rankTop, setRankTop] = useState<RankEntry[]>([]);
  const [rankMe, setRankMe] = useState<{ rank: number | null; points: number }>(
    { rank: null, points: 0 },
  );
  const [rankSize, setRankSize] = useState(0);
  const [rankLoading, setRankLoading] = useState(false);
  const [rankDisabled, setRankDisabled] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const lockedRef = useRef(false);
  const advanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cur = round[idx];
  const locked = selected !== null || timedOut;
  const isLast = idx === round.length - 1;

  // 최초 진입 시 신원 로드
  useEffect(() => {
    let alive = true;
    getIdentity().then((id) => {
      if (!alive) return;
      setIdentity(id);
      setNick(id.name);
    });
    return () => {
      alive = false;
    };
  }, []);

  async function loadTossName() {
    const n = await requestTossName();
    if (n) {
      setNick(n);
      setStoredName(n);
    }
  }

  async function start(category: CategoryKey) {
    setCat(category);
    setScore(0);
    setPoints(0);
    setIdx(0);
    setSubmitted(false);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, phase, round]);

  function pick(i: number) {
    if (lockedRef.current) return;
    lockedRef.current = true;
    setSelected(i);
    if (i === cur.answer) {
      setScore((s) => s + 1);
      setPoints((p) => p + gainFor(remaining));
    }
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

  async function openRank() {
    setPhase("rank");
    setRankLoading(true);
    setRankDisabled(false);
    const res = await fetchTop(identity?.id);
    setRankLoading(false);
    if (!res) return;
    if (res.disabled) {
      setRankDisabled(true);
      return;
    }
    setRankTop(res.top);
    setRankMe(res.me);
    setRankSize(res.size);
  }

  async function submitAndShowRank() {
    if (!identity || submitting) return;
    const name = nick.trim() || "게스트";
    setStoredName(name);
    setSubmitting(true);
    setPhase("rank");
    setRankLoading(true);
    setRankDisabled(false);
    const res = await submitScore(identity.id, name, points);
    setSubmitting(false);
    setRankLoading(false);
    setSubmitted(true);
    if (!res) return;
    if (res.disabled) {
      setRankDisabled(true);
      return;
    }
    setRankTop(res.top);
    setRankMe({ rank: res.rank, points: res.total });
    setRankSize(res.size);
  }

  // ── 시작 화면 ─────────────────────────────
  if (phase === "start") {
    return (
      <div className="wrap">
        <header className="header">
          <span className="brand">5초 상식퀴즈</span>
          <button className="rankbtn" onClick={openRank}>
            🏆 랭킹
          </button>
        </header>
        <div className="intro">
          <div className="intro-emoji">🧠⏱️</div>
          <h1 className="title">문제당 5초, 순발력 상식 게임</h1>
          <p className="sub">
            분야를 고르면 AI가 매번 새로운 {ROUND_SIZE}문제를 출제해요. 빨리
            맞힐수록 높은 점수! 랭킹에 도전해 보세요.
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
        {identity && (
          <p className="whoami">
            랭킹 이름: <b>{identity.name}</b>
          </p>
        )}
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

  // ── 랭킹 화면 ─────────────────────────────
  if (phase === "rank") {
    return (
      <div className="wrap">
        <header className="header">
          <span className="brand">🏆 랭킹</span>
          <span className="badge">누적 점수</span>
        </header>

        {rankLoading ? (
          <div className="rankloading">
            <div className="spinner" />
            <div className="loadsub">
              {submitting ? "점수 등록 중..." : "랭킹 불러오는 중..."}
            </div>
          </div>
        ) : rankDisabled ? (
          <div className="empty">
            아직 랭킹 서버가 준비되지 않았어요.
            <br />
            (백엔드에 Redis 설정이 필요해요)
          </div>
        ) : (
          <>
            {submitted && (
              <div className="myrank-card">
                <div className="muted">내 순위</div>
                <div className="myrank-main">
                  {rankMe.rank ? `${rankMe.rank}위` : "-"}
                  <span className="myrank-pts">
                    {rankMe.points.toLocaleString()}점
                  </span>
                </div>
                <div className="muted-sm">전체 {rankSize.toLocaleString()}명 중</div>
              </div>
            )}
            {rankTop.length === 0 ? (
              <div className="empty">
                아직 랭킹이 비어 있어요. 첫 주인공이 되어보세요!
              </div>
            ) : (
              <ol className="ranklist">
                {rankTop.map((r) => (
                  <li key={r.rank} className={`rankrow ${r.me ? "me" : ""}`}>
                    <span className={`rk rk-${r.rank <= 3 ? r.rank : "n"}`}>
                      {r.rank <= 3 ? ["🥇", "🥈", "🥉"][r.rank - 1] : r.rank}
                    </span>
                    <span className="rname">{r.name}</span>
                    <span className="rpts">{r.points.toLocaleString()}점</span>
                  </li>
                ))}
              </ol>
            )}
          </>
        )}

        <button className="primary" onClick={() => setPhase("start")}>
          분야 골라 플레이
        </button>
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
          <div className="result-points">{points.toLocaleString()}점</div>
          <div className="result-score">
            정답 <b>{score}</b> / {round.length}
          </div>
          <div className="result-msg">{v.msg}</div>
        </div>

        <div className="nickbox">
          <label className="nicklabel">랭킹에 표시할 이름</label>
          <input
            className="nickinput"
            value={nick}
            maxLength={16}
            onChange={(e) => setNick(e.target.value)}
            placeholder="닉네임"
          />
          {identity?.source === "toss" && (
            <button className="tossname" onClick={loadTossName}>
              토스 이름으로 등록하기
            </button>
          )}
        </div>

        <button
          className="primary"
          disabled={submitting}
          onClick={submitAndShowRank}
        >
          🏆 랭킹 등록하기
        </button>
        <button className="ghost" onClick={() => start(cat)}>
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
          {idx + 1} / {round.length} · {points.toLocaleString()}점
        </span>
      </header>

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
              ? `정답이에요! +${gainFor(remaining)}점 ✨`
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
