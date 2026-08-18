import { useCallback, useEffect, useMemo, useState } from "react";
import { Device, SafeArea, Share } from "@apps-in-toss/web-framework";
import {
  DRUNK_OPTIONS,
  DRUNK_Q,
  DUPE_OPTIONS,
  DUPE_Q,
  FREQ_OPTIONS,
  FREQ_Q,
  judge,
  shareText,
  won,
  type Answers,
  type Drunk,
  type Dupe,
  type Freq,
} from "./verdict";

type Phase = "price" | "q1" | "q2" | "q3" | "result";

const STEPS: Phase[] = ["price", "q1", "q2", "q3", "result"];

/** 토스 앱 밖(브라우저에서 개발할 때)에는 네이티브 API가 없다. 조용히 넘긴다. */
async function haptic(type: "tap" | "success") {
  try {
    await Device.triggerHaptic({ type });
  } catch {
    // 토스 앱이 아니면 진동은 없다. 그뿐이다.
  }
}

/** 자릿수 콤마. 입력 중에도 계속 다시 그린다. */
const comma = (digits: string) =>
  digits ? Number(digits).toLocaleString("ko-KR") : "";

const QUICK = [
  { label: "+1만", v: 10_000 },
  { label: "+5만", v: 50_000 },
  { label: "+10만", v: 100_000 },
  { label: "+100만", v: 1_000_000 },
];

export default function App() {
  const [phase, setPhase] = useState<Phase>("price");
  const [digits, setDigits] = useState("");
  const [item, setItem] = useState("");
  const [freq, setFreq] = useState<Freq | null>(null);
  const [dupe, setDupe] = useState<Dupe | null>(null);
  const [drunk, setDrunk] = useState<Drunk | null>(null);
  const [copied, setCopied] = useState(false);

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
      // 토스 앱이 아니면 CSS 기본값 env(safe-area-inset-*) 이 쓰인다
      return undefined;
    }
  }, []);

  const price = Number(digits || "0");

  const answers: Answers | null = useMemo(
    () =>
      freq && dupe && drunk
        ? { price, item, freq, dupe, drunk }
        : null,
    [price, item, freq, dupe, drunk]
  );

  const verdict = useMemo(() => (answers ? judge(answers) : null), [answers]);

  const go = useCallback((next: Phase) => {
    setPhase(next);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const back = useCallback(() => {
    const i = STEPS.indexOf(phase);
    if (i > 0) {
      haptic("tap");
      go(STEPS[i - 1]);
    }
  }, [phase, go]);

  function pick<T>(set: (v: T) => void, value: T, next: Phase) {
    haptic("tap");
    set(value);
    go(next);
  }

  function restart() {
    haptic("tap");
    setDigits("");
    setItem("");
    setFreq(null);
    setDupe(null);
    setDrunk(null);
    setCopied(false);
    go("price");
  }

  async function share() {
    if (!answers || !verdict) return;
    await haptic("success");
    const message = shareText(answers, verdict);
    try {
      await Share.sendMessage({ message });
    } catch {
      // 토스 앱 밖이거나 사용자가 취소했다. 브라우저에서는 클립보드로 떨어진다.
      try {
        await navigator.clipboard.writeText(message);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      } catch {
        // 클립보드도 막혀 있으면 할 수 있는 게 없다
      }
    }
  }

  const stepNo = STEPS.indexOf(phase);

  return (
    <div className="slip">
      <div className="edge edge-top" aria-hidden="true" />

      <header className="head">
        <h1 className="shop">살까 말까 판독기</h1>
        <p className="tagline">소 비 합 리 화 판 독 · 연 중 무 휴</p>
      </header>
      <div className="rule" />

      {phase === "price" && (
        <PriceStep
          digits={digits}
          item={item}
          onDigits={setDigits}
          onItem={setItem}
          onNext={() => {
            haptic("tap");
            go("q1");
          }}
        />
      )}

      {phase === "q1" && (
        <Question
          no={1}
          q={FREQ_Q}
          note="하루당 얼마인지는 여기서 갈린다."
          options={FREQ_OPTIONS}
          selected={freq}
          onPick={(v) => pick(setFreq, v, "q2")}
          onBack={back}
        />
      )}
      {phase === "q2" && (
        <Question
          no={2}
          q={DUPE_Q}
          note="서랍을 열어 보고 답하십시오."
          options={DUPE_OPTIONS}
          selected={dupe}
          onPick={(v) => pick(setDupe, v, "q3")}
          onBack={back}
        />
      )}
      {phase === "q3" && (
        <Question
          no={3}
          q={DRUNK_Q}
          note="이 문항이 승인율을 가장 많이 흔든다."
          options={DRUNK_OPTIONS}
          selected={drunk}
          onPick={(v) => pick(setDrunk, v, "result")}
          onBack={back}
        />
      )}

      {phase === "result" && verdict && answers && (
        <Result
          a={answers}
          v={verdict}
          copied={copied}
          onShare={share}
          onRestart={restart}
        />
      )}

      {phase !== "result" && (
        <div className="steps" aria-hidden="true">
          {STEPS.slice(0, 4).map((s, i) => (
            <span key={s} className={i <= stepNo ? "dot on" : "dot"} />
          ))}
        </div>
      )}

      <div className="edge edge-bottom" aria-hidden="true" />
    </div>
  );
}

/* ── 금액 입력 ──────────────────────────────────────────────────── */

function PriceStep({
  digits,
  item,
  onDigits,
  onItem,
  onNext,
}: {
  digits: string;
  item: string;
  onDigits: (v: string) => void;
  onItem: (v: string) => void;
  onNext: () => void;
}) {
  const price = Number(digits || "0");
  const ok = price >= 100;

  function add(v: number) {
    haptic("tap");
    // 10자리(99억)를 넘기면 영수증 폭을 벗어난다
    onDigits(String(Math.min(price + v, 9_999_999_999)));
  }

  return (
    <section>
      <p className="ask">사고 싶은 게 얼마입니까</p>

      <div className="amount">
        <input
          className="amount-in"
          inputMode="numeric"
          // 숫자 이외를 지우고 앞자리 0도 떨군다. 붙여넣기까지 여기서 걸린다.
          value={comma(digits)}
          placeholder="0"
          onChange={(e) => onDigits(e.target.value.replace(/\D/g, "").replace(/^0+/, "").slice(0, 10))}
          aria-label="가격"
        />
        <span className="amount-won">원</span>
      </div>

      <div className="quick">
        {QUICK.map((q) => (
          <button key={q.label} className="chip" onClick={() => add(q.v)}>
            {q.label}
          </button>
        ))}
        <button
          className="chip chip-clear"
          onClick={() => {
            haptic("tap");
            onDigits("");
          }}
        >
          지움
        </button>
      </div>

      <div className="rule dim" />

      <label className="field">
        <span className="field-label">품 목</span>
        <input
          className="field-in"
          value={item}
          maxLength={14}
          placeholder="운동화 (안 적어도 됩니다)"
          onChange={(e) => onItem(e.target.value)}
        />
      </label>

      <button className="go" disabled={!ok} onClick={onNext}>
        {ok ? "판 독 시 작" : "금액을 입력하십시오"}
      </button>

      <p className="fine">
        본 판독기는 아무 근거도 대지 않습니다. 결제는 본인 책임입니다.
      </p>
    </section>
  );
}

/* ── 문항 ──────────────────────────────────────────────────────── */

function Question<T extends string>({
  no,
  q,
  note,
  options,
  selected,
  onPick,
  onBack,
}: {
  no: number;
  q: string;
  note: string;
  options: { v: T; label: string; sub: string }[];
  selected: T | null;
  onPick: (v: T) => void;
  onBack: () => void;
}) {
  return (
    <section>
      <div className="qno">문 항 {no} / 3</div>
      <h2 className="q">{q}</h2>
      <p className="qnote">{note}</p>

      <div className="options">
        {options.map((o, i) => (
          <button
            key={o.v}
            className={o.v === selected ? "opt on" : "opt"}
            onClick={() => onPick(o.v)}
          >
            <span className="opt-no">{i + 1}</span>
            <span className="opt-body">
              <span className="opt-label">{o.label}</span>
              <span className="opt-sub">{o.sub}</span>
            </span>
          </button>
        ))}
      </div>

      <button className="back" onClick={onBack}>
        ← 앞 문항
      </button>
    </section>
  );
}

/* ── 결과 영수증 ────────────────────────────────────────────────── */

function Result({
  a,
  v,
  copied,
  onShare,
  onRestart,
}: {
  a: Answers;
  v: ReturnType<typeof judge>;
  copied: boolean;
  onShare: () => void;
  onRestart: () => void;
}) {
  // 도장 색으로 결과가 한눈에 읽혀야 한다. 승인은 초록, 반려는 빨강,
  // 그 사이(보류·재고)는 노랑이다.
  const tone = v.stamp === "승인" ? "ok" : v.stamp === "반려" ? "no" : "hold";

  return (
    <section className="result">
      <div className={`stamp ${tone}`}>
        <span className="stamp-small">구 매</span>
        <span className="stamp-big">{v.stamp}</span>
      </div>

      <dl className="ledger">
        <Row k="품목" val={a.item.trim() || "이름 없는 물건"} />
        <Row k="정가" val={won(a.price)} strong />
        <Row k="예상 수명" val={`${v.lifeLabel} · ${v.uses.toLocaleString("ko-KR")}회`} />
        <Row k="하루당" val={won(v.perDay)} />
        <Row k="1회당" val={won(v.perUse)} />
      </dl>

      <div className="rule" />

      <div className="metrics">
        <Metric k="소비 승인율" v={`${v.approval}%`} bar={v.approval} tone="ok" />
        <Metric k="핑계 수준" v={`${v.excuse}급`} note={v.excuseNote} bar={v.excuseScore} tone="mid" />
        <Metric k="내일 후회 확률" v={`${v.regret}%`} bar={v.regret} tone="no" />
      </div>

      <div className="rule" />

      <div className="reasons">
        <div className="reasons-label">판 독 소 견</div>
        {v.lines.map((l, i) => (
          <p key={i} className="reason">
            {l}
          </p>
        ))}
      </div>

      <p className="sentence">{v.sentence}</p>

      <div className="rule dim" />
      <div className="barcode" aria-hidden="true">
        {/* 승인번호에서 뽑아 그린다. 같은 판정이면 같은 무늬가 나온다.
            열 자리로는 줄이 너무 짧아 영수증 폭만큼 되풀이한다. */}
        {Array.from(v.approvalNo.replace(/\D/g, "").repeat(6)).map((d, i) => (
          <i key={i} style={{ width: `${1 + (Number(d) % 4)}px` }} />
        ))}
      </div>
      <div className="serial">승인번호 {v.approvalNo}</div>

      <div className="actions">
        <button className="go" onClick={onShare}>
          {copied ? "복 사 했 습 니 다" : "결 과 보 내 기"}
        </button>
        <button className="back wide" onClick={onRestart}>
          다시 판독하기
        </button>
      </div>

      <p className="fine">
        본 판독은 농담입니다. 숫자는 입력하신 답에서 기계적으로 계산된 것이고,
        어떤 것도 실제 재정 조언이 아닙니다.
      </p>
    </section>
  );
}

function Row({ k, val, strong }: { k: string; val: string; strong?: boolean }) {
  return (
    <div className={strong ? "row strong" : "row"}>
      <dt>{k}</dt>
      <dd>{val}</dd>
    </div>
  );
}

function Metric({
  k,
  v,
  note,
  bar,
  tone,
}: {
  k: string;
  v: string;
  note?: string;
  bar: number;
  tone: "ok" | "mid" | "no";
}) {
  return (
    <div className="metric">
      <div className="metric-top">
        <span className="metric-k">{k}</span>
        <span className="metric-v">{v}</span>
      </div>
      <div className={`gauge ${tone}`}>
        <i style={{ width: `${Math.max(2, Math.min(100, bar))}%` }} />
      </div>
      {note && <div className="metric-note">{note}</div>}
    </div>
  );
}
