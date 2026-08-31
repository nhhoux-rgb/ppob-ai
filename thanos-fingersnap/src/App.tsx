import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { haptic, share, watchSafeArea } from "./platform";

type Phase = "idle" | "snapping" | "result";
type Fate = "alive" | "dust";

/** 스냅 버튼을 누르고 결과가 뜰 때까지 (ms). 연출 길이와 같다. */
const SNAP_MS = 1500;

const LS_KEY = "thanos-snap-record";

type Tally = {
  total: number;
  alive: number;
  /** 연속 생존 */
  streak: number;
  /** 최고 연속 생존 */
  best: number;
};

const EMPTY: Tally = { total: 0, alive: 0, streak: 0, best: 0 };

function loadRecord(): Tally {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return EMPTY;
    const v = JSON.parse(raw) as Partial<Tally>;
    return {
      total: Number(v.total) || 0,
      alive: Number(v.alive) || 0,
      streak: Number(v.streak) || 0,
      best: Number(v.best) || 0,
    };
  } catch {
    return EMPTY;
  }
}

function saveRecord(r: Tally) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(r));
  } catch {
    /* 시크릿 모드 등 — 기록만 안 남는다 */
  }
}

/**
 * 정확히 5대5. Math.random 대신 암호학적 난수를 쓴다.
 * 256은 2로 나누어떨어지므로 나머지 편향이 없다.
 */
function flip(): Fate {
  try {
    const b = new Uint8Array(1);
    crypto.getRandomValues(b);
    return b[0] % 2 === 0 ? "alive" : "dust";
  } catch {
    return Math.random() < 0.5 ? "alive" : "dust";
  }
}

/** 흩어지는 재. 스냅할 때마다 새로 뿌린다. */
type Speck = { x: number; y: number; dx: number; dy: number; d: number; s: number };

function makeDust(n: number): Speck[] {
  return Array.from({ length: n }, () => ({
    x: 50 + (Math.random() - 0.5) * 46,
    y: 50 + (Math.random() - 0.5) * 46,
    dx: (Math.random() - 0.5) * 120,
    dy: -40 - Math.random() * 140,
    d: Math.random() * 0.5,
    s: 2 + Math.random() * 4,
  }));
}

export default function App() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [fate, setFate] = useState<Fate | null>(null);
  const [record, setRecord] = useState<Tally>(loadRecord);
  const [dust, setDust] = useState<Speck[]>([]);
  const [shareLabel, setShareLabel] = useState("친구에게 공유하기");
  const timer = useRef<number | null>(null);

  // 노치와 홈 인디케이터를 피한다
  useEffect(() => watchSafeArea(), []);

  // 화면을 떠날 때 예약된 결과 공개를 취소한다
  useEffect(() => () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
  }, []);

  function snap() {
    if (phase === "snapping") return;
    haptic("tap");

    // 결과는 누르는 순간 이미 정해진다. 연출 뒤에 뽑으면 연출 길이가
    // 결과에 영향을 주는 것처럼 보인다.
    const result = flip();
    setFate(result);
    setPhase("snapping");
    setDust(makeDust(56));
    setShareLabel("친구에게 공유하기");

    timer.current = window.setTimeout(() => {
      setPhase("result");
      haptic(result === "alive" ? "success" : "error");

      setRecord((prev) => {
        const streak = result === "alive" ? prev.streak + 1 : 0;
        const next: Tally = {
          total: prev.total + 1,
          alive: prev.alive + (result === "alive" ? 1 : 0),
          streak,
          best: Math.max(prev.best, streak),
        };
        saveRecord(next);
        return next;
      });
    }, SNAP_MS);
  }

  function again() {
    setPhase("idle");
    setFate(null);
    setShareLabel("친구에게 공유하기");
  }

  async function onShare() {
    const message =
      fate === "alive"
        ? `타노스 핑거스냅 — 나는 살아남았다.${
            record.streak > 1 ? ` (연속 ${record.streak}번째 생존)` : ""
          }\n너도 손가락 한 번 튕겨봐. 확률은 정확히 절반이다.`
        : `타노스 핑거스냅 — 나는 먼지가 되었다.\n너는 남은 절반일까? 손가락 한 번이면 끝난다.`;

    const r = await share(message);
    if (r === "shared") setShareLabel("공유했습니다");
    else if (r === "copied") setShareLabel("메시지를 복사했습니다");
    if (r !== "none") window.setTimeout(() => setShareLabel("친구에게 공유하기"), 1800);
  }

  const alivePct = record.total ? Math.round((record.alive / record.total) * 100) : 0;

  const headline = useMemo(() => {
    if (phase === "result" && fate === "alive") return "살아남았다";
    if (phase === "result" && fate === "dust") return "먼지가 되었다";
    if (phase === "snapping") return "…";
    return "타노스 핑거스냅";
  }, [phase, fate]);

  const sub =
    phase === "result"
      ? fate === "alive"
        ? "당신은 남은 절반입니다."
        : "당신은 사라진 절반입니다."
      : phase === "snapping"
        ? "우주의 절반이 정해지는 중"
        : "손가락 한 번. 확률은 정확히 절반.";

  return (
    <main className={`stage ${phase} ${fate ?? ""}`}>
      <div className="halo" aria-hidden="true" />

      <header className="head">
        <h1 className="headline">{headline}</h1>
        <p className="sub">{sub}</p>
      </header>

      <div className="arena">
        <Gauntlet phase={phase} fate={fate} />
        {phase !== "idle" && (
          <div className="dust" aria-hidden="true">
            {dust.map((p, i) => (
              <i
                key={i}
                style={
                  {
                    left: `${p.x}%`,
                    top: `${p.y}%`,
                    width: `${p.s}px`,
                    height: `${p.s}px`,
                    "--dx": `${p.dx}px`,
                    "--dy": `${p.dy}px`,
                    animationDelay: `${1 + p.d}s`,
                  } as CSSProperties
                }
              />
            ))}
          </div>
        )}
      </div>

      <div className="actions" role="status" aria-live="polite">
        {phase === "result" ? (
          <>
            <button className="btn" onClick={onShare}>
              {shareLabel}
            </button>
            <button className="btn ghost" onClick={again}>
              한 번 더 스냅
            </button>
          </>
        ) : (
          <button className="btn snap" onClick={snap} disabled={phase === "snapping"}>
            {phase === "snapping" ? "스냅…" : "핑거스냅"}
          </button>
        )}
      </div>

      <footer className="record">
        {record.total === 0 ? (
          <span>아직 한 번도 튕기지 않았습니다.</span>
        ) : (
          <span>
            {record.total}번 중 <b>{record.alive}번</b> 생존 ({alivePct}%)
            {record.best > 1 ? ` · 최고 연속 ${record.best}번` : ""}
          </span>
        )}
      </footer>
    </main>
  );
}

/**
 * 건틀렛. 원본 그림을 쓰지 않고 여섯 개의 보석만 도형으로 그렸다.
 * 스냅하는 동안 보석이 차례로 켜지고, 마지막에 한 번 번쩍인다.
 */
function Gauntlet({ phase, fate }: { phase: Phase; fate: Fate | null }) {
  // 육각형 배치 — 반지름 34, 위에서부터 시계방향
  const gems = ["#8B5CF6", "#3B82F6", "#EF4444", "#F59E0B", "#22C55E", "#FACC15"];

  return (
    <svg className="gauntlet" viewBox="0 0 120 120" role="img" aria-label="인피니티 건틀렛">
      <defs>
        <radialGradient id="metal" cx="38%" cy="30%">
          <stop offset="0%" stopColor="#FCE9A8" />
          <stop offset="55%" stopColor="#D9A441" />
          <stop offset="100%" stopColor="#6B4212" />
        </radialGradient>
      </defs>

      <circle className="ring" cx="60" cy="60" r="46" />
      <circle className="palm" cx="60" cy="60" r="26" fill="url(#metal)" />
      <circle className="core" cx="60" cy="60" r="14" />

      {gems.map((c, i) => {
        const a = (Math.PI / 3) * i - Math.PI / 2;
        return (
          <circle
            key={i}
            className="gem"
            cx={60 + Math.cos(a) * 38}
            cy={60 + Math.sin(a) * 38}
            r="7.5"
            fill={c}
            style={{ animationDelay: `${i * 0.13}s` }}
          />
        );
      })}

      {/* 판정 표시. 글리프 대신 선으로 그린다 — 기기 폰트를 타지 않고 또렷하다. */}
      {phase === "result" && (
        <path
          className="verdict"
          d={fate === "alive" ? "M53 60 l5 6 l11 -13" : "M54 54 l12 12 M66 54 l-12 12"}
        />
      )}
    </svg>
  );
}
