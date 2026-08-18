/* 골프 스코어 계산기 — 앱인토스 미니앱.
 *
 * 서버가 없다. 라운드 기록은 전부 기기 안(토스 Storage)에만 남는다. 골프장은
 * 통신이 자주 끊기고, 라운드 하나를 넣는 데 네 시간이 걸린다. 네트워크에
 * 기대는 순간 필드에서 못 쓰는 앱이 된다. */

import { useCallback, useEffect, useMemo, useState } from "react";
import { SafeArea } from "@apps-in-toss/web-framework";
import Play from "./Play";
import Review from "./Review";
import { Segmented, Spark, haptic } from "./ui";
import { OB_RULE_LABEL, type ObRule, type Round, newRound } from "./types";
import { roundTotals, toParText } from "./score";
import {
  DEFAULT_PREFS,
  type Draft,
  type Prefs,
  clearDraft,
  deleteRound,
  loadDraft,
  loadPrefs,
  loadRounds,
  saveDraft,
  savePrefs,
  upsertRound,
} from "./storage";

type ScreenName = "home" | "setup" | "play" | "review";

function today(): string {
  // en-CA 로케일이 YYYY-MM-DD 를 준다
  return new Date().toLocaleDateString("en-CA");
}

function now(): string {
  return new Date().toTimeString().slice(0, 5);
}

export default function App() {
  const [screen, setScreen] = useState<ScreenName>("home");
  const [rounds, setRounds] = useState<Round[]>([]);
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  // 안전영역 — 노치와 홈 인디케이터를 피한다
  useEffect(() => {
    const apply = (i: { top: number; bottom: number }) => {
      document.documentElement.style.setProperty("--safe-top", `${i.top}px`);
      document.documentElement.style.setProperty("--safe-bottom", `${i.bottom}px`);
    };
    try {
      apply(SafeArea.get());
      return SafeArea.subscribe({ onEvent: apply });
    } catch {
      // 토스 앱이 아니면 CSS 기본값(env(safe-area-inset-*))이 쓰인다
      return undefined;
    }
  }, []);

  useEffect(() => {
    let alive = true;
    Promise.all([loadRounds(), loadPrefs(), loadDraft()]).then(([r, p, d]) => {
      if (!alive) return;
      setRounds(r);
      setPrefs(p);
      setDraft(d);
      setReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  /** 홀을 넘길 때마다 저장한다. 앱이 죽어도 여기서 이어서 시작한다. */
  const updateDraft = useCallback((next: Draft) => {
    setDraft(next);
    saveDraft(next);
  }, []);

  function start(input: {
    course: string;
    date: string;
    teeTime: string;
    holeCount: 9 | 18;
    obRule: ObRule;
  }) {
    const round = newRound(input, { teeClub: prefs.teeClub, ironClub: prefs.ironClub });
    const next = { ...prefs, lastCourse: input.course, obRule: input.obRule };
    setPrefs(next);
    savePrefs(next);
    updateDraft({ round, cursor: 0 });
    setScreen("play");
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  async function finish() {
    if (!draft) return;
    // 도중에 끝냈으면 실제로 기록한 홀까지만 남긴다. 나머지를 파로 채우면
    // 치지도 않은 홀이 평균에 섞인다.
    const played = draft.round.holes.slice(0, draft.cursor + 1);
    const saved: Round = { ...draft.round, holes: played, finishedAt: Date.now() };
    setRounds(await upsertRound(saved));
    await clearDraft();
    setDraft(null);
    setReviewId(saved.id);
    setScreen("review");
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  async function abandon() {
    await clearDraft();
    setDraft(null);
    setScreen("home");
  }

  async function remove(id: string) {
    setRounds(await deleteRound(id));
    setReviewId(null);
    setScreen("home");
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  const reviewing = useMemo(
    () => rounds.find((r) => r.id === reviewId) ?? null,
    [rounds, reviewId]
  );

  return (
    <div className="app">
      <header className="top">
        <div className="brand">골프 스코어</div>
        {screen !== "home" && (
          <button
            className="top-back"
            onClick={() => {
              haptic("tap");
              setScreen("home");
              window.scrollTo({ top: 0, behavior: "instant" });
            }}
          >
            홈
          </button>
        )}
      </header>

      {!ready && <div className="loading">기록을 불러오는 중…</div>}

      {ready && screen === "home" && (
        <Home
          rounds={rounds}
          draft={draft}
          onNew={() => {
            haptic("tap");
            setScreen("setup");
          }}
          onResume={() => {
            haptic("tap");
            setScreen("play");
          }}
          onOpen={(id) => {
            haptic("tap");
            setReviewId(id);
            setScreen("review");
            window.scrollTo({ top: 0, behavior: "instant" });
          }}
        />
      )}

      {ready && screen === "setup" && (
        <Setup prefs={prefs} rounds={rounds} onStart={start} onCancel={() => setScreen("home")} />
      )}

      {ready && screen === "play" && draft && (
        <Play
          round={draft.round}
          cursor={draft.cursor}
          onRound={(round) => updateDraft({ ...draft, round })}
          onCursor={(cursor) => updateDraft({ ...draft, cursor })}
          onFinish={finish}
          onExit={abandon}
        />
      )}

      {ready && screen === "review" && reviewing && (
        <Review
          round={reviewing}
          rounds={rounds}
          onBack={() => {
            haptic("tap");
            setScreen("home");
            window.scrollTo({ top: 0, behavior: "instant" });
          }}
          onDelete={remove}
        />
      )}

      <footer className="foot">기록은 이 기기 안에만 저장됩니다.</footer>
    </div>
  );
}

/* ── 홈 ──────────────────────────────────────────────────────────── */

function Home({
  rounds,
  draft,
  onNew,
  onResume,
  onOpen,
}: {
  rounds: Round[];
  draft: Draft | null;
  onNew: () => void;
  onResume: () => void;
  onOpen: (id: string) => void;
}) {
  const spark = useMemo(
    () =>
      [...rounds]
        .reverse()
        .map((r) => {
          const t = roundTotals(r);
          return t.holes ? (t.strokes / t.holes) * 18 : 0;
        })
        .slice(-10),
    [rounds]
  );

  const average =
    spark.length > 0 ? spark.reduce((a, b) => a + b, 0) / spark.length : null;

  return (
    <div className="home">
      {draft && (
        <button className="resume" onClick={onResume}>
          <span className="resume-tag">이어서 하기</span>
          <span className="resume-main">
            {draft.round.course || "이름 없는 구장"} · {draft.cursor + 1}번홀까지 입력됨
          </span>
        </button>
      )}

      <button className="btn big" onClick={onNew}>
        새 라운드 시작
      </button>

      {spark.length >= 2 && (
        <section className="panel">
          <div className="panel-head">
            <span>18홀 환산 타수</span>
            <b>평균 {average!.toFixed(1)}</b>
          </div>
          <Spark values={spark} />
        </section>
      )}

      <h2 className="sec">내 기록</h2>
      {rounds.length === 0 ? (
        <p className="empty">
          아직 기록이 없습니다.
          <br />첫 라운드를 넣으면 여기에 쌓입니다.
        </p>
      ) : (
        <ul className="rounds">
          {rounds.map((r) => {
            const t = roundTotals(r);
            return (
              <li key={r.id}>
                <button className="round-card" onClick={() => onOpen(r.id)}>
                  <div className="rc-left">
                    <div className="rc-course">{r.course || "이름 없는 구장"}</div>
                    <div className="rc-meta">
                      {r.date} · {t.holes}홀 · 퍼트 {t.putts} · 벌타 {t.penalties}
                    </div>
                  </div>
                  <div className="rc-right">
                    <b>{t.strokes}</b>
                    <span className={t.toPar > 0 ? "over" : t.toPar < 0 ? "under" : ""}>
                      {toParText(t.toPar)}
                    </span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ── 라운드 설정 ─────────────────────────────────────────────────── */

function Setup({
  prefs,
  rounds,
  onStart,
  onCancel,
}: {
  prefs: Prefs;
  rounds: Round[];
  onStart: (input: {
    course: string;
    date: string;
    teeTime: string;
    holeCount: 9 | 18;
    obRule: ObRule;
  }) => void;
  onCancel: () => void;
}) {
  const [course, setCourse] = useState(prefs.lastCourse);
  const [date, setDate] = useState(today());
  const [teeTime, setTeeTime] = useState(now());
  const [holeCount, setHoleCount] = useState<9 | 18>(18);
  const [obRule, setObRule] = useState<ObRule>(prefs.obRule);

  // 예전에 갔던 구장은 다시 치기 마련이라 이름을 다시 타이핑하지 않게 한다
  const courses = useMemo(() => {
    const seen: string[] = [];
    for (const r of rounds) {
      if (r.course && !seen.includes(r.course)) seen.push(r.course);
    }
    return seen.slice(0, 6);
  }, [rounds]);

  return (
    <div className="setup">
      <h2 className="sec">라운드 정보</h2>

      <label className="field">
        <span>구장</span>
        <input
          value={course}
          onChange={(e) => setCourse(e.target.value)}
          placeholder="구장 이름"
          autoComplete="off"
        />
      </label>
      {courses.length > 0 && (
        <div className="recent-courses">
          {courses.map((c) => (
            <button
              key={c}
              className={`chip small${c === course ? " on" : ""}`}
              onClick={() => {
                haptic("tap");
                setCourse(c);
              }}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <label className="field">
        <span>날짜</span>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </label>

      <label className="field">
        <span>티업 시간</span>
        <input type="time" value={teeTime} onChange={(e) => setTeeTime(e.target.value)} />
      </label>

      <div className="field">
        <span>홀 수</span>
        <Segmented
          options={[
            { value: 18, label: "18홀" },
            { value: 9, label: "9홀" },
          ]}
          value={holeCount}
          onChange={(v) => setHoleCount(v as 9 | 18)}
        />
      </div>

      <div className="field">
        <span>OB 처리</span>
        <Segmented
          options={[
            { value: "forward_tee", label: OB_RULE_LABEL.forward_tee },
            { value: "stroke_distance", label: OB_RULE_LABEL.stroke_distance },
          ]}
          value={obRule}
          onChange={(v) => setObRule(v as ObRule)}
        />
      </div>
      <p className="hint">
        특설티는 앞으로 나가는 대신 벌타를 2 먹는 국내 로컬룰입니다. 원래 자리에서
        다시 치는 정규 규칙은 벌타 1입니다.
      </p>

      <div className="setup-actions">
        <button
          className="btn"
          onClick={() => {
            haptic("success");
            onStart({ course: course.trim(), date, teeTime, holeCount, obRule });
          }}
        >
          1번홀부터 시작
        </button>
        <button className="btn ghost" onClick={onCancel}>
          취소
        </button>
      </div>
      <p className="hint">파는 홀마다 화면에서 바로 바꿀 수 있습니다.</p>
    </div>
  );
}
