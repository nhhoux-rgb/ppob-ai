import { useCallback, useEffect, useMemo, useState } from "react";
import { Device, SafeArea, Share } from "@apps-in-toss/web-framework";
import {
  BREAK_LABEL,
  EPILOGUE,
  QUESTIONS,
  STAGE_LABEL,
  TYPES,
  decide,
  type EpilogueOption,
  type Option,
} from "./data";

// 집계는 웹앱과 같은 저장소를 쓴다. 미니앱에만 따로 쌓으면 "지금까지 N명"이
// 두 갈래로 갈라진다.
const API_BASE =
  import.meta.env.VITE_API_BASE ?? "https://ppob-ai-817q.vercel.app";

// 표본이 쌓이기 전 기본 분포 (scripts/calibrate.mts 결과)
const BASE: Record<number, number> = { 0: 16, 1: 33, 2: 40, 3: 1, 4: 4, 5: 1, 6: 5 };
const REAL_SAMPLE_MIN = 50;

const KANJI = ["一","二","三","四","五","六","七","八","九","十","十一","十二","十三","十四","十五"];
const CIRCLED = ["①", "②", "③"];

type Stats = { total: number; stage: Record<string, number>; type: Record<string, number> };
type Phase = "intro" | "quiz" | "epilogue" | "result";

/** 토스 앱 밖(브라우저 개발 중)에서는 네이티브 API가 없으므로 전부 무시한다. */
async function haptic(type: "tap" | "success") {
  try {
    await Device.triggerHaptic({ type });
  } catch {
    // 토스 앱이 아니면 조용히 통과
  }
}

export default function App() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [index, setIndex] = useState(0);
  const [belief, setBelief] = useState(0);
  const [active, setActive] = useState(0);
  const [direct, setDirect] = useState(0);
  const [informs, setInforms] = useState(0);
  const [breakStage, setBreakStage] = useState(-1);
  const [epilogue, setEpilogue] = useState<EpilogueOption | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [shared, setShared] = useState(false);

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

  const loadStats = useCallback(() => {
    fetch(`${API_BASE}/api/stats`)
      .then((r) => r.json())
      .then((d: Stats) => setStats(d))
      .catch(() => {});
  }, []);

  useEffect(loadStats, [loadStats]);

  const resultKey = useMemo(
    () => decide({ belief, active, direct, informs }),
    [belief, active, direct, informs]
  );

  function choose(o: Option) {
    haptic("tap");
    setBelief((v) => v + o.b);
    setActive((v) => v + o.a);
    setDirect((v) => v + o.d);
    if (o.inform) setInforms((v) => v + 1);
    if (!o.r && breakStage < 0) setBreakStage(QUESTIONS[index].st);

    if (index + 1 < QUESTIONS.length) setIndex(index + 1);
    else setPhase("epilogue");
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function chooseEpilogue(o: EpilogueOption) {
    haptic("success");
    setEpilogue(o);
    setPhase("result");
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  // 결과 화면 진입 시 한 번만 집계에 반영
  useEffect(() => {
    if (phase !== "result") return;
    const stage = breakStage < 0 ? 6 : breakStage;
    // 토스 아웃바운드 프록시가 CORS 프리플라이트를 막는다. text/plain 으로
    // 보내면 "단순 요청"이 되어 OPTIONS 없이 바로 나간다. (커밋 1b1818a)
    fetch(`${API_BASE}/api/stats`, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=UTF-8" },
      body: JSON.stringify({ stage, type: resultKey }),
    })
      .then((r) => r.json())
      .then((d: Stats) => setStats(d))
      .catch(() => {});
    // 점수는 이미 확정돼 있으므로 진입 시 1회만 실행한다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  function restart() {
    setIndex(0);
    setBelief(0);
    setActive(0);
    setDirect(0);
    setInforms(0);
    setBreakStage(-1);
    setEpilogue(null);
    setShared(false);
    setPhase("intro");
    loadStats();
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  const formNo =
    phase === "quiz"
      ? `身元調書 第${KANJI[index] ?? index + 1}項`
      : phase === "epilogue"
        ? "身元調書 附記"
        : phase === "result"
          ? "身元調書 所見"
          : "身元調書 第二號";

  return (
    <div className="sheet">
      <div className="formhead">
        <div className="formno">{formNo}</div>
        <div className="secret">秘</div>
      </div>
      <div className="rule-thin" />

      {phase === "intro" && <Intro stats={stats} onStart={() => { haptic("tap"); setPhase("quiz"); }} />}
      {phase === "quiz" && <QuestionView index={index} onChoose={choose} />}
      {phase === "epilogue" && <EpilogueView onChoose={chooseEpilogue} />}
      {phase === "result" && (
        <Result
          resultKey={resultKey}
          breakStage={breakStage < 0 ? 6 : breakStage}
          epilogue={epilogue}
          stats={stats}
          shared={shared}
          setShared={setShared}
          onRestart={restart}
        />
      )}
    </div>
  );
}

/* ── 표지 ────────────────────────────────────────────────────────── */
function Intro({ stats, onStart }: { stats: Stats | null; onStart: () => void }) {
  return (
    <section className="cover">
      <div className="eyebrow">昭和十一年 — 二十年</div>
      <h1 className="title">
        친일파
        <br />
        테스트
        <em>1940년, 당신의 선택</em>
      </h1>
      <p className="sub">
        열여섯 번의 갈림길이 있습니다. 처음엔 아무것도 걸려 있지 않고, 마지막엔
        사람의 목숨이 걸립니다.
      </p>
      <div className="premise">
        식민지 조선의 인구는 <b>2,500만</b>이었습니다.
        <br />
        친일인명사전에 오른 사람은 <b>4,389명</b>,
        <br />
        독립유공자로 서훈된 사람은 <b>1만 8천여 명</b>입니다.
        <br />
        <br />
        <b>나머지 99.9%는 어느 쪽도 아니었습니다.</b>
        <br />이 조사는 당신이 그 99.9% 안에서 어디쯤 서 있었을지를 봅니다.
      </div>
      <button className="btn" onClick={onStart}>
        조사를 시작한다
      </button>
      <div className="counted">
        {stats && stats.total > 0
          ? `지금까지 ${stats.total.toLocaleString()}명이 조사받았습니다`
          : "당신이 첫 번째 조사 대상입니다"}
      </div>
      <p className="disclaimer">
        실존 인물을 평가하지 않는 역사 학습 콘텐츠입니다.
      </p>
    </section>
  );
}

/* ── 문항 ────────────────────────────────────────────────────────── */
function QuestionView({ index, onChoose }: { index: number; onChoose: (o: Option) => void }) {
  const q = QUESTIONS[index];
  return (
    <section>
      <div className="qmeta">
        <div className="stage">{STAGE_LABEL[q.st]}</div>
        <div className="year">{q.yr}</div>
      </div>
      <div className="qbody" dangerouslySetInnerHTML={{ __html: q.t }} />
      <div className="opts">
        {q.o.map((o, k) => (
          <button key={k} className="opt" onClick={() => onChoose(o)}>
            <span className="num" aria-hidden="true">{CIRCLED[k]}</span>
            <span>{o.t}</span>
          </button>
        ))}
      </div>
      <Track current={index} />
    </section>
  );
}

/* ── 에필로그 ─────────────────────────────────────────────────────── */
function EpilogueView({ onChoose }: { onChoose: (o: EpilogueOption) => void }) {
  return (
    <section>
      <div className="epimark">附 記 — 판정에는 반영되지 않습니다</div>
      <div className="qmeta">
        <div className="stage">解 放</div>
        <div className="year">1945</div>
      </div>
      <div className="qbody" dangerouslySetInnerHTML={{ __html: EPILOGUE.t }} />
      <div className="opts">
        {EPILOGUE.o.map((o, k) => (
          <button key={k} className="opt" onClick={() => onChoose(o)}>
            <span className="num" aria-hidden="true">{CIRCLED[k]}</span>
            <span>{o.t}</span>
          </button>
        ))}
      </div>
      <Track current={QUESTIONS.length} />
    </section>
  );
}

function Track({ current }: { current: number }) {
  const total = QUESTIONS.length + 1;
  return (
    <div
      className="track"
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={current + 1}
      aria-label={`전체 ${total}문항 중 ${current + 1}번째`}
    >
      {Array.from({ length: total }, (_, k) => (
        <i key={k} className={k < current ? "on" : k === current ? "cur" : ""} />
      ))}
    </div>
  );
}

/* ── 결과 ────────────────────────────────────────────────────────── */
function Result({
  resultKey,
  breakStage,
  epilogue,
  stats,
  shared,
  setShared,
  onRestart,
}: {
  resultKey: string;
  breakStage: number;
  epilogue: EpilogueOption | null;
  stats: Stats | null;
  shared: boolean;
  setShared: (v: boolean) => void;
  onRestart: () => void;
}) {
  const t = TYPES[resultKey];

  const stageTotal = stats
    ? Object.values(stats.stage ?? {}).reduce((s, v) => s + v, 0)
    : 0;
  const useReal = stageTotal >= REAL_SAMPLE_MIN;
  const stagePct = (k: number) =>
    useReal && stats
      ? Math.round(((stats.stage?.[String(k)] ?? 0) / stageTotal) * 100)
      : BASE[k];

  const typeTotal = stats
    ? Object.values(stats.type ?? {}).reduce((s, v) => s + v, 0)
    : 0;
  const typePct =
    typeTotal >= REAL_SAMPLE_MIN && stats
      ? Math.round(((stats.type?.[resultKey] ?? 0) / typeTotal) * 100)
      : t.pct;

  let harder = 0;
  for (let k = breakStage + 1; k <= 6; k++) harder += stagePct(k);

  const brokeLine =
    breakStage === 6
      ? "끝까지 꺾이지 않았습니다."
      : breakStage === 0
        ? "아무것도 걸리지 않았을 때 이미 꺾였습니다."
        : `${breakStage}단계에서 꺾였습니다.`;

  async function onShare() {
    const message = `친일파 테스트 — 나는 「${t.n}」\n${t.q}\n${brokeLine}\n너는 몇 단계에서 꺾일까?`;
    try {
      await Share.sendMessage({ message });
      setShared(true);
      setTimeout(() => setShared(false), 1800);
    } catch {
      // 토스 앱 밖이거나 사용자가 취소 — 무시
    }
  }

  return (
    <section>
      <div className="rlabel">所 見</div>
      <h2 className="rname">{t.n}</h2>
      <div className="rquote">{t.q}</div>

      <div className="seal" aria-hidden="true">
        <svg viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" />
          <text x="50" y="50" textAnchor="middle" dominantBaseline="central" fontSize="46">
            {t.ch}
          </text>
        </svg>
      </div>

      <div className="rdesc">
        {t.d.map((p, i) => (
          <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
        ))}
      </div>

      <div className="hist">
        <b>기록</b> — {t.h}
      </div>

      <div className="counter">{t.c}</div>

      {epilogue && (
        <>
          <h3 className="sechead">해방 다음 날</h3>
          <div className="epilogue-echo">
            <b>{epilogue.t}</b>
            <br />
            {epilogue.echo}
          </div>
        </>
      )}

      <h3 className="sechead">당신이 꺾인 지점</h3>
      <div className="bigstat">
        {breakStage === 6 ? (
          <>당신은 <em>끝까지</em> 꺾이지 않았습니다.</>
        ) : breakStage === 0 ? (
          <>당신은 <em>아무것도 걸리지 않았을 때</em> 이미 꺾였습니다.</>
        ) : (
          <>당신은 <em>{breakStage}단계</em>에서 꺾였습니다.</>
        )}
      </div>

      {[0, 1, 2, 3, 4, 5, 6].map((k) => (
        <div className="metric" key={k}>
          <div className="mlabel">
            <span>
              {BREAK_LABEL[k]}
              {k === breakStage ? " — 당신" : ""}
            </span>
            <span>{stagePct(k)}%</span>
          </div>
          <div className={`bar${k === breakStage ? " mine" : ""}`}>
            <i style={{ width: `${stagePct(k)}%` }} />
          </div>
        </div>
      ))}

      <div className="note">
        당신보다 늦게까지 버틴 사람은 <b>{harder}%</b>입니다. 같은 결과를 받은
        사람은 <b>{typePct}%</b>입니다.
        {useReal && stats
          ? ` 실제 응답 ${stats.total.toLocaleString()}건 기준.`
          : " 표본이 쌓이면 실제 응답 기준으로 바뀝니다."}
      </div>

      <div className="actions">
        <button className="btn" onClick={onShare}>
          {shared ? "공유했습니다" : "결과 공유하기"}
        </button>
        <button className="btn-ghost" onClick={onRestart}>
          다시 조사받기
        </button>
      </div>

      <p className="disclaimer">
        실존 인물을 평가하지 않는 역사 학습 콘텐츠입니다. 위 비율은 이 테스트에
        응답한 사람들의 분포이며, 당시 조선인의 실제 분포가 아닙니다.
      </p>
    </section>
  );
}
