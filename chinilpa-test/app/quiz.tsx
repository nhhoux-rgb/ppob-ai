"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BREAK_LABEL,
  EPILOGUE,
  QUESTIONS,
  STAGE_LABEL,
  type EpilogueOption,
  type Option,
} from "./questions";
import { TYPES, decide } from "./types";

// 표본이 충분히 쌓이기 전에 보여줄 "꺾인 단계" 기본 분포.
// scripts/calibrate.mts 의 시뮬레이션 결과다. 실제 응답이 THRESHOLD 건을
// 넘으면 실측치로 갈아탄다.
const BASE: Record<number, number> = { 0: 16, 1: 33, 2: 40, 3: 1, 4: 4, 5: 1, 6: 5 };

/** 실측 분포로 갈아타기 위한 최소 표본 수 */
const REAL_SAMPLE_MIN = 50;

const KANJI = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二", "十三", "十四", "十五"];
const CIRCLED = ["①", "②", "③"];

type Stats = {
  total: number;
  stage: Record<string, number>;
  type: Record<string, number>;
};

type Phase = "intro" | "quiz" | "epilogue" | "result";

export default function Quiz() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [index, setIndex] = useState(0);
  const [belief, setBelief] = useState(0);
  const [active, setActive] = useState(0);
  const [direct, setDirect] = useState(0);
  const [informs, setInforms] = useState(0);
  const [breakStage, setBreakStage] = useState(-1);
  const [epilogue, setEpilogue] = useState<EpilogueOption | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [copied, setCopied] = useState(false);

  // 표지 카운터 — 시작할 때와 다시 조사받을 때마다 새로 읽는다.
  const loadStats = useCallback(() => {
    fetch("/api/stats")
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
    setBelief((v) => v + o.b);
    setActive((v) => v + o.a);
    setDirect((v) => v + o.d);
    if (o.inform) setInforms((v) => v + 1);
    if (!o.r && breakStage < 0) setBreakStage(QUESTIONS[index].st);

    if (index + 1 < QUESTIONS.length) {
      setIndex(index + 1);
    } else {
      setPhase("epilogue");
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function chooseEpilogue(o: EpilogueOption) {
    setEpilogue(o);
    setPhase("result");
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  // 결과 화면에 들어온 순간 집계에 한 번만 반영한다.
  useEffect(() => {
    if (phase !== "result") return;
    const stage = breakStage < 0 ? 6 : breakStage;
    fetch("/api/stats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage, type: resultKey }),
    })
      .then((r) => r.json())
      .then((d: Stats) => setStats(d))
      .catch(() => {});
    // 결과 화면 진입 시 1회만 — 점수는 이미 확정돼 있다.
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
    setCopied(false);
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
    <>
      <Grain />
      <div className="sheet">
        <div className="formhead">
          <div className="formno">{formNo}</div>
          <div className="secret">秘</div>
        </div>
        <div className="rule-thin" />

        {phase === "intro" && <Intro stats={stats} onStart={() => setPhase("quiz")} />}

        {phase === "quiz" && (
          <QuestionView index={index} onChoose={choose} />
        )}

        {phase === "epilogue" && <EpilogueView onChoose={chooseEpilogue} />}

        {phase === "result" && (
          <Result
            resultKey={resultKey}
            breakStage={breakStage < 0 ? 6 : breakStage}
            epilogue={epilogue}
            stats={stats}
            copied={copied}
            setCopied={setCopied}
            onRestart={restart}
          />
        )}
      </div>
    </>
  );
}

/* ── 종이 질감 ───────────────────────────────────────────────────── */
function Grain() {
  return (
    <>
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <filter id="grainf">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </svg>
      <div id="grain" aria-hidden="true">
        <svg width="100%" height="100%">
          <rect width="100%" height="100%" filter="url(#grainf)" opacity="0.26" />
        </svg>
      </div>
    </>
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
      <p style={{ marginTop: 26, textAlign: "center" }}>
        <Link href="/sources" className="backlink">
          이 숫자들의 출처 보기
        </Link>
      </p>
    </section>
  );
}

/* ── 문항 ────────────────────────────────────────────────────────── */
function QuestionView({
  index,
  onChoose,
}: {
  index: number;
  onChoose: (o: Option) => void;
}) {
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
            <span className="num" aria-hidden="true">
              {CIRCLED[k]}
            </span>
            <span>{o.t}</span>
          </button>
        ))}
      </div>
      <div
        className="track"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={QUESTIONS.length + 1}
        aria-valuenow={index + 1}
        aria-label={`전체 ${QUESTIONS.length + 1}문항 중 ${index + 1}번째`}
      >
        {QUESTIONS.map((_, k) => (
          <i key={k} className={k < index ? "on" : k === index ? "cur" : ""} />
        ))}
        <i />
      </div>
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
            <span className="num" aria-hidden="true">
              {CIRCLED[k]}
            </span>
            <span>{o.t}</span>
          </button>
        ))}
      </div>
      <div
        className="track"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={QUESTIONS.length + 1}
        aria-valuenow={QUESTIONS.length + 1}
        aria-label="마지막 문항"
      >
        {QUESTIONS.map((_, k) => (
          <i key={k} className="on" />
        ))}
        <i className="cur" />
      </div>
    </section>
  );
}

/* ── 결과 ────────────────────────────────────────────────────────── */
function Result({
  resultKey,
  breakStage,
  epilogue,
  stats,
  copied,
  setCopied,
  onRestart,
}: {
  resultKey: string;
  breakStage: number;
  epilogue: EpilogueOption | null;
  stats: Stats | null;
  copied: boolean;
  setCopied: (v: boolean) => void;
  onRestart: () => void;
}) {
  const t = TYPES[resultKey];

  // 꺾인 단계 분포 — 표본이 충분하면 실측, 아니면 시뮬레이션 기본값
  const stageTotal = stats
    ? Object.values(stats.stage ?? {}).reduce((s, v) => s + v, 0)
    : 0;
  const useReal = stageTotal >= REAL_SAMPLE_MIN;
  const stagePct = (k: number) =>
    useReal && stats
      ? Math.round(((stats.stage?.[String(k)] ?? 0) / stageTotal) * 100)
      : BASE[k];

  // 같은 유형이 나온 비율
  const typeTotal = stats
    ? Object.values(stats.type ?? {}).reduce((s, v) => s + v, 0)
    : 0;
  const useRealType = typeTotal >= REAL_SAMPLE_MIN;
  const typePct =
    useRealType && stats
      ? Math.round(((stats.type?.[resultKey] ?? 0) / typeTotal) * 100)
      : t.pct;

  let harder = 0;
  for (let k = breakStage + 1; k <= 6; k++) harder += stagePct(k);

  const shareText = `친일파 테스트 — 나는 「${t.n}」\n${t.q}\n${
    breakStage === 6
      ? "끝까지 꺾이지 않았습니다."
      : breakStage === 0
        ? "아무것도 걸리지 않았을 때 이미 꺾였습니다."
        : `${breakStage}단계에서 꺾였습니다.`
  }\n너는 몇 단계에서 꺾일까?`;

  async function share() {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/r/${t.key}`
        : "";
    const payload = { title: "친일파 테스트", text: shareText, url };

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(payload);
        return;
      } catch {
        // 사용자가 취소 — 아래 복사로 넘어가지 않고 종료
        return;
      }
    }
    try {
      await navigator.clipboard.writeText(`${shareText}\n${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // 클립보드 차단 환경 — 무시
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
          <text
            x="50"
            y="50"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="46"
          >
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
          <>
            당신은 <em>끝까지</em> 꺾이지 않았습니다.
          </>
        ) : breakStage === 0 ? (
          <>
            당신은 <em>아무것도 걸리지 않았을 때</em> 이미 꺾였습니다.
          </>
        ) : (
          <>
            당신은 <em>{breakStage}단계</em>에서 꺾였습니다.
          </>
        )}
      </div>

      <div>
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
      </div>

      <div className="note">
        당신보다 늦게까지 버틴 사람은 <b>{harder}%</b>입니다. 같은 결과를 받은
        사람은 <b>{typePct}%</b>입니다.
        {useReal && stats
          ? ` 실제 응답 ${stats.total.toLocaleString()}건 기준.`
          : " 표본이 쌓이면 실제 응답 기준으로 바뀝니다."}
      </div>

      <div className="actions">
        <button className="btn" onClick={share}>
          {copied ? "복사했습니다" : "결과 공유하기"}
        </button>
        <Link href={`/r/${t.key}`} className="btn-ghost">
          이 유형 자세히 보기
        </Link>
        <button className="btn-ghost" onClick={onRestart}>
          다시 조사받기
        </button>
      </div>
    </section>
  );
}
