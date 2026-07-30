"use client";

import { useRef, useState } from "react";
import SiteFooter from "./site-footer";
import VisitorCount from "./visitor-count";
import ShareButton from "./share-button";
import SharePageButton from "./share-page-button";
import SaveImageButton from "./save-image-button";

type Universe = {
  emoji: string;
  title: string;
  choice: string;
  tagline: string;
  job: string;
  location: string;
  happiness: number;
  wealth: number;
  story: string;
  highlight: string;
  regret: string;
};

type Result = {
  branch: string;
  universes: Universe[];
  mostDivergent: string;
  message: string;
};

// 우주마다 다른 색을 입혀 카드가 한눈에 구분되게 한다.
const ACCENTS = [
  { ring: "#a78bfa", chip: "rgba(167,139,250,0.18)", text: "#ddd6fe", glow: "rgba(139,92,246,0.35)" },
  { ring: "#f0abfc", chip: "rgba(240,171,252,0.18)", text: "#f5d0fe", glow: "rgba(217,70,239,0.32)" },
  { ring: "#67e8f9", chip: "rgba(103,232,249,0.18)", text: "#cffafe", glow: "rgba(34,211,238,0.30)" },
  { ring: "#fda4af", chip: "rgba(253,164,175,0.18)", text: "#fecdd3", glow: "rgba(244,63,94,0.30)" },
];

// 예시 갈림길 — 입력 막막함을 줄여주는 빠른 시작 칩
const EXAMPLES = [
  "대학 전공을 안정적인 학과 대신 하고 싶던 예술로 정했다면",
  "그때 첫 회사를 그만두고 창업을 했다면",
  "20대에 무작정 해외로 떠났다면",
  "헤어졌던 그 사람과 계속 만났다면",
];

export default function Home() {
  const [branch, setBranch] = useState("");
  const [current, setCurrent] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const resultRef = useRef<HTMLElement>(null);

  async function observe() {
    const trimmed = branch.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ branch: trimmed, current: current.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "관측 실패");
      setResult(data);
      // 결과가 나오면 부드럽게 스크롤
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 60);
    } catch (err) {
      console.error(err);
      setError("평행우주를 관측하지 못했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = branch.trim().length > 0 && !loading;

  return (
    <div className="relative min-h-screen overflow-hidden font-sans text-violet-50 antialiased">
      {/* 은하 배경 */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(120% 90% at 50% -10%, #3b1d78 0%, #1b1442 40%, #0b0713 75%)",
        }}
      />
      <Stars />

      <main className="mx-auto w-full max-w-[560px] px-5 py-8 sm:px-6 sm:py-10">
        <header className="mb-6 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xl font-bold tracking-tight text-violet-100">
            <span className="text-2xl leading-none">🌌</span>
            평행우주
          </span>
          <div className="flex items-center gap-2">
            <SharePageButton />
            <span className="rounded-full bg-violet-500/20 px-3 py-1 text-xs font-semibold text-violet-200">
              Beta
            </span>
          </div>
        </header>

        <section className="mb-6">
          <h1 className="text-[1.9rem] font-bold leading-tight tracking-tight sm:text-[2.05rem]">
            평행우주 속
            <br />
            <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-sky-300 bg-clip-text text-transparent">
              또 다른 나
            </span>
            를 만나보세요
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-violet-200/70">
            그때 다른 선택을 했다면 어떤 삶을 살고 있을까요? 인생의 갈림길 하나만
            적으면 AI가 평행우주 3곳의 나를 이야기로 그려드려요.
          </p>
        </section>

        {/* 입력 카드 */}
        <section className="mb-4 rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_8px_40px_rgba(76,29,149,0.25)] backdrop-blur-sm">
          <label className="mb-2 block text-sm font-semibold text-violet-100">
            🔀 내 인생의 갈림길
          </label>
          <textarea
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            rows={3}
            maxLength={400}
            placeholder="예: 대학 때 안정적인 회사 대신 창업을 선택한 순간"
            className="w-full resize-none rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm leading-relaxed text-violet-50 placeholder:text-violet-200/35 outline-none transition focus:border-violet-400/50 focus:bg-black/30"
          />

          {/* 예시 칩 */}
          <div className="mt-3 flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => setBranch(ex)}
                className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] font-medium text-violet-200/70 transition hover:border-violet-400/40 hover:text-violet-100 active:scale-95"
              >
                {ex}
              </button>
            ))}
          </div>

          <label className="mb-2 mt-5 block text-sm font-semibold text-violet-100">
            🙂 지금의 나 <span className="text-violet-200/50">(선택)</span>
          </label>
          <input
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            maxLength={160}
            placeholder="예: 서울에서 일하는 30대 직장인"
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-violet-50 placeholder:text-violet-200/35 outline-none transition focus:border-violet-400/50 focus:bg-black/30"
          />
        </section>

        <button
          type="button"
          disabled={!canSubmit}
          onClick={observe}
          className="mb-5 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-semibold text-white shadow-lg transition enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          style={
            !canSubmit
              ? { backgroundColor: "#3f3a5a" }
              : {
                  background:
                    "linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)",
                  boxShadow: "0 10px 30px rgba(139,92,246,0.35)",
                }
          }
        >
          {loading ? (
            <>
              <LoadingSpinner className="h-5 w-5 text-white" />
              평행우주 관측 중...
            </>
          ) : (
            <>
              <SparkleIcon className="h-5 w-5" />
              평행우주 열어보기
            </>
          )}
        </button>

        {error && (
          <div className="mb-5 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-200">
            {error}
          </div>
        )}

        {loading && (
          <div className="mb-5 flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-12 text-center">
            <div className="mb-4 text-4xl">🌠</div>
            <p className="text-sm font-semibold text-violet-100">
              갈림길에서 갈라진 우주들을 살펴보는 중...
            </p>
            <p className="mt-1.5 text-xs text-violet-200/60">
              또 다른 내가 어떻게 살고 있는지 관측하고 있어요
            </p>
          </div>
        )}

        {result && !loading && (
          <section ref={resultRef}>
            {/* 갈림길 요약 */}
            <div className="mb-4 rounded-3xl border border-white/10 bg-white/[0.04] px-5 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-violet-300/70">
                당신의 갈림길
              </p>
              <p className="mt-1.5 text-sm font-medium leading-relaxed text-violet-50">
                {result.branch}
              </p>
              <p className="mt-2 text-xs text-violet-200/60">
                이 순간에서 갈라진 세 개의 우주를 열었어요 ↓
              </p>
            </div>

            {/* 평행우주 카드들 */}
            <div className="space-y-4">
              {result.universes.map((u, i) => {
                const a = ACCENTS[i % ACCENTS.length];
                const isMost = u.title === result.mostDivergent;
                return (
                  <article
                    key={`${i}-${u.title}`}
                    className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-5"
                    style={{ boxShadow: `0 10px 40px ${a.glow}` }}
                  >
                    <div
                      className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-40 blur-3xl"
                      style={{ background: a.glow }}
                    />

                    <div className="relative flex items-start gap-3">
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl"
                        style={{ backgroundColor: a.chip }}
                      >
                        {u.emoji}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-lg font-bold leading-tight text-violet-50">
                            {u.title}
                          </h2>
                          {isMost && (
                            <span className="rounded-full bg-fuchsia-500/25 px-2 py-0.5 text-[10px] font-bold text-fuchsia-200">
                              가장 다른 우주
                            </span>
                          )}
                        </div>
                        <p
                          className="mt-1 text-sm font-medium leading-snug"
                          style={{ color: a.text }}
                        >
                          {u.tagline}
                        </p>
                      </div>
                    </div>

                    {/* 선택 */}
                    <p className="relative mt-3 rounded-xl bg-black/20 px-3 py-2 text-xs leading-relaxed text-violet-100/90">
                      🔀 {u.choice}
                    </p>

                    {/* 직업/장소 */}
                    <div className="relative mt-3 flex flex-wrap gap-2 text-[11px]">
                      <span className="rounded-lg bg-white/5 px-2.5 py-1 font-medium text-violet-200/80">
                        💼 {u.job}
                      </span>
                      <span className="rounded-lg bg-white/5 px-2.5 py-1 font-medium text-violet-200/80">
                        📍 {u.location}
                      </span>
                    </div>

                    {/* 행복/부 지수 */}
                    <div className="relative mt-4 grid grid-cols-2 gap-3">
                      <Meter label="행복 지수" value={u.happiness} color={a.ring} />
                      <Meter label="부 지수" value={u.wealth} color={a.ring} />
                    </div>

                    {/* 스토리 */}
                    <p className="relative mt-4 text-[13px] leading-relaxed text-violet-100/85">
                      {u.story}
                    </p>

                    {/* 하이라이트 & 아쉬움 */}
                    <div className="relative mt-3 space-y-2">
                      <p className="flex items-start gap-2 rounded-xl bg-white/[0.04] px-3 py-2 text-xs leading-relaxed text-violet-100/90">
                        <span className="mt-px">✨</span>
                        <span>{u.highlight}</span>
                      </p>
                      <p className="flex items-start gap-2 rounded-xl bg-white/[0.04] px-3 py-2 text-xs leading-relaxed text-violet-200/70">
                        <span className="mt-px">🕯️</span>
                        <span>{u.regret}</span>
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* 마무리 메시지 */}
            {result.message && (
              <div
                className="mt-4 rounded-3xl border border-white/10 px-5 py-5 text-center"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(139,92,246,0.18), rgba(217,70,239,0.12))",
                }}
              >
                <p className="text-xl">💫</p>
                <p className="mt-2 text-sm font-medium leading-relaxed text-violet-50">
                  {result.message}
                </p>
              </div>
            )}

            {/* 저장 이미지용 워터마크 */}
            <div className="mt-3 text-center text-[11px] font-semibold text-violet-300/70">
              🌌 평행우주 나의 삶
            </div>
          </section>
        )}

        {result && !loading && (
          <ShareButton
            text={`🌌 평행우주 속 또 다른 내 삶을 봤어! "${result.mostDivergent}"의 나는 어떻게 살고 있을까? 너도 네 평행우주 열어봐`}
          />
        )}

        {result && !loading && <SaveImageButton targetRef={resultRef} />}

        <footer className="mt-8 pb-6 text-center text-xs leading-relaxed text-violet-200/50">
          <VisitorCount />
          <p>
            재미로 상상해보는 평행우주 이야기예요. 실제 미래나 과학적 사실과는
            무관하니 가볍게 즐겨 주세요.
          </p>
          <SiteFooter />
        </footer>
      </main>
    </div>
  );
}

function Meter({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const clamped = Math.min(Math.max(value, 0), 100);
  return (
    <div className="rounded-xl bg-black/20 px-3 py-2.5">
      <div className="flex items-baseline justify-between">
        <span className="text-[11px] font-medium text-violet-200/70">
          {label}
        </span>
        <span
          className="text-sm font-bold tabular-nums"
          style={{ color }}
        >
          {clamped}
        </span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${clamped}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// 배경 별들 — 결정적(고정) 좌표라 SSR/CSR 불일치가 없다.
function Stars() {
  const stars = [
    [8, 12], [22, 30], [40, 8], [58, 22], [72, 14], [88, 34],
    [15, 55], [33, 70], [50, 48], [66, 62], [80, 78], [92, 58],
    [12, 88], [28, 95], [46, 84], [60, 92], [74, 88], [90, 96],
  ];
  return (
    <div className="pointer-events-none absolute inset-0 -z-10">
      {stars.map(([x, y], i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            width: i % 3 === 0 ? 2.5 : 1.5,
            height: i % 3 === 0 ? 2.5 : 1.5,
            opacity: i % 2 === 0 ? 0.5 : 0.25,
          }}
        />
      ))}
    </div>
  );
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className ?? ""}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
      <path d="M19 14l.75 2.25L22 17l-2.25.75L19 20l-.75-2.25L16 17l2.25-.75L19 14z" />
    </svg>
  );
}
