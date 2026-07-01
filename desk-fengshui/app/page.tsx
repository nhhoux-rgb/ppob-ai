"use client";

import { useRef, useState, type ChangeEvent } from "react";
import SiteFooter from "./site-footer";
import VisitorCount from "./visitor-count";
import ShareButton from "./share-button";
import SharePageButton from "./share-page-button";
import SaveImageButton from "./save-image-button";

type Item = {
  category: string;
  score: number;
  finding: string;
  advice: string;
};

type AddItem = {
  item: string;
  place: string;
  reason: string;
};

type RemoveItem = {
  item: string;
  reason: string;
};

type Result = {
  nickname?: string;
  overallScore: number;
  grade: string;
  summary: string;
  items: Item[];
  addItems?: AddItem[];
  removeItems?: RemoveItem[];
  fortune?: string;
  tip?: string;
};

// 점수 구간별 색 테마 (풍수: 옥/금 계열)
function scoreTheme(score: number) {
  if (score >= 75)
    return { bg: "#059669", light: "#d1fae5", text: "#047857", ring: "#10b981" };
  if (score >= 55)
    return { bg: "#d97706", light: "#fef3c7", text: "#b45309", ring: "#f59e0b" };
  return { bg: "#dc2626", light: "#fee2e2", text: "#b91c1c", ring: "#ef4444" };
}

export default function Home() {
  const [image, setImage] = useState<string>("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [error, setError] = useState("");

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLElement>(null);

  function handleImage(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
      setResult(null);
      setError("");
      setDetailOpen(false);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  async function analyze() {
    if (!image) return;

    setLoading(true);
    setError("");
    setResult(null);
    setDetailOpen(false);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: image }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "분석 실패");
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("분석 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  const hasImage = Boolean(image);
  const theme = result ? scoreTheme(result.overallScore) : scoreTheme(60);

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900 antialiased">
      <main className="mx-auto w-full max-w-[520px] px-5 py-8 sm:px-6 sm:py-10">
        <header className="mb-6 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xl font-bold tracking-tight text-emerald-700">
            <CompassIcon className="h-6 w-6" />
            책상풍수
          </span>
          <div className="flex items-center gap-2">
            <SharePageButton />
            <span
              className="rounded-full px-3 py-1 text-xs font-semibold"
              style={{ backgroundColor: "#ecfdf5", color: "#047857" }}
            >
              Beta
            </span>
          </div>
        </header>

        <section className="mb-5">
          <h1 className="text-[1.75rem] font-bold leading-tight tracking-tight sm:text-[1.875rem]">
            책상 풍수 AI 분석
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-500">
            책상 사진 한 장이면 재물운·집중력·건강운 풍수를 봐드려요.
          </p>
        </section>

        <section className="mb-4">
          {!hasImage ? (
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              className="flex w-full flex-col items-center justify-center rounded-3xl border border-dashed px-6 py-14 shadow-sm transition active:scale-[0.99]"
              style={{
                borderColor: "#a7f3d0",
                background: "linear-gradient(to bottom, #ecfdf599, #ffffff)",
              }}
            >
              <div
                className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg"
                style={{ backgroundColor: "#059669" }}
              >
                <CameraIcon className="h-8 w-8 text-white" />
              </div>
              <p className="text-base font-semibold text-zinc-900">
                책상 사진을 올려 주세요
              </p>
              <p className="mt-1.5 text-sm text-zinc-500">
                책상 전체가 보이면 더 정확해요
              </p>
            </button>
          ) : (
            <div className="relative rounded-3xl border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
              <div className="aspect-[4/3] overflow-hidden rounded-3xl bg-zinc-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt="분석 이미지"
                  className="h-full w-full object-cover"
                />
              </div>

              {loading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-black/50 backdrop-blur-[2px]">
                  <div className="flex flex-col items-center rounded-2xl bg-white/10 px-6 py-5 text-white backdrop-blur-md">
                    <LoadingSpinner className="mb-3 h-8 w-8 text-white" />
                    <p className="text-sm font-semibold">기운을 살피는 중...</p>
                  </div>
                </div>
              )}

              {result && !loading && (
                <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                  <CheckIcon className="h-3.5 w-3.5" style={{ color: "#4ade80" }} />
                  분석 완료
                </div>
              )}

              <button
                type="button"
                onClick={() => replaceInputRef.current?.click()}
                className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-black/85 active:scale-95"
              >
                <RefreshIcon className="h-3.5 w-3.5" />
                다시 선택
              </button>
            </div>
          )}
        </section>

        <section className="mb-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white py-3.5 text-sm font-semibold text-zinc-800 shadow-sm transition hover:border-emerald-200 active:scale-[0.98]"
          >
            <CameraIcon className="h-5 w-5" style={{ color: "#059669" }} />
            카메라
          </button>
          <button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            className="flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white py-3.5 text-sm font-semibold text-zinc-800 shadow-sm transition hover:border-emerald-200 active:scale-[0.98]"
          >
            <UploadIcon className="h-5 w-5" style={{ color: "#059669" }} />
            갤러리
          </button>
        </section>

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={handleImage}
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={handleImage}
        />
        <input
          ref={replaceInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={handleImage}
        />

        <button
          type="button"
          disabled={!hasImage || loading}
          onClick={analyze}
          className="mb-5 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-semibold text-white shadow-lg transition enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-400 disabled:shadow-none"
          style={
            !hasImage || loading
              ? undefined
              : {
                  backgroundColor: "#059669",
                  boxShadow: "0 8px 24px rgba(5,150,105,0.25)",
                }
          }
        >
          {loading ? (
            <>
              <LoadingSpinner className="h-5 w-5 text-white" />
              분석 중...
            </>
          ) : (
            <>
              <SparkleIcon className="h-5 w-5" />
              풍수 분석하기
            </>
          )}
        </button>

        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        {result && !loading && (
          <section
            ref={resultRef}
            className="overflow-hidden rounded-3xl border border-zinc-100 bg-white shadow-[0_4px_24px_rgb(0,0,0,0.06)]"
          >
            {/* 종합 점수 */}
            <div
              className="flex items-center gap-4 px-5 py-5"
              style={{
                background: `linear-gradient(135deg, ${theme.light}, #ffffff)`,
              }}
            >
              <ScoreRing score={result.overallScore} theme={theme} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className="rounded-lg px-2.5 py-1 text-sm font-bold"
                    style={{ backgroundColor: theme.bg, color: "#ffffff" }}
                  >
                    {result.grade}
                  </span>
                  <span className="text-xs font-medium text-zinc-400">
                    종합 풍수 점수
                  </span>
                </div>
                {result.nickname && (
                  <p className="mt-2 text-base font-bold leading-snug text-zinc-900">
                    “{result.nickname}”
                  </p>
                )}
                <p className="mt-1 text-sm font-medium leading-snug text-zinc-600">
                  {result.summary}
                </p>
              </div>
            </div>

            {/* 항목별 분석 */}
            <div className="border-t border-zinc-100">
              <div className="flex items-center gap-2 px-4 py-3.5">
                <CompassIcon className="h-5 w-5" style={{ color: "#059669" }} />
                <h2 className="text-sm font-bold text-zinc-900">항목별 풍수</h2>
              </div>
              <div className="divide-y divide-zinc-100">
                {result.items.map((it, i) => {
                  const t = scoreTheme(it.score);
                  return (
                    <article key={`${i}-${it.category}`} className="px-4 py-3.5">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-zinc-900">
                          {it.category}
                        </p>
                        <span
                          className="shrink-0 rounded-lg px-2.5 py-1 text-sm font-bold tabular-nums"
                          style={{ backgroundColor: t.light, color: t.text }}
                        >
                          {it.score}점
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(Math.max(it.score, 0), 100)}%`,
                            backgroundColor: t.bg,
                          }}
                        />
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                        {it.finding}
                      </p>
                      <p
                        className="mt-2 rounded-xl px-3 py-2 text-xs leading-relaxed"
                        style={{ backgroundColor: "#ecfdf5", color: "#047857" }}
                      >
                        💡 {it.advice}
                      </p>
                    </article>
                  );
                })}
              </div>
            </div>

            {/* 이걸 놓아보세요 (구체적 추가 추천) */}
            {result.addItems && result.addItems.length > 0 && (
              <div className="border-t border-zinc-100 px-4 py-4">
                <div className="mb-3 flex items-center gap-1.5">
                  <SparkleIcon className="h-4 w-4" />
                  <p className="text-sm font-bold text-emerald-700">
                    이걸 놓아보세요
                  </p>
                </div>
                <ul className="space-y-2.5">
                  {result.addItems.map((a, i) => (
                    <li
                      key={`add-${i}-${a.item}`}
                      className="flex items-start gap-2.5 rounded-xl bg-emerald-50 px-3 py-2.5"
                    >
                      <span className="mt-0.5 text-base leading-none">➕</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-bold text-emerald-900">
                          {a.item}
                          <span className="ml-1.5 rounded-md bg-emerald-100 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                            {a.place}
                          </span>
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-emerald-800/80">
                          {a.reason}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 이건 치우세요 (구체적 제거 추천) */}
            {result.removeItems && result.removeItems.length > 0 && (
              <div className="border-t border-zinc-100 px-4 py-4">
                <div className="mb-3 flex items-center gap-1.5">
                  <XCircleIcon className="h-4 w-4" style={{ color: "#d97706" }} />
                  <p className="text-sm font-bold" style={{ color: "#b45309" }}>
                    이건 치우세요
                  </p>
                </div>
                <ul className="space-y-2.5">
                  {result.removeItems.map((r, i) => (
                    <li
                      key={`rm-${i}-${r.item}`}
                      className="flex items-start gap-2.5 rounded-xl bg-amber-50 px-3 py-2.5"
                    >
                      <span className="mt-0.5 text-base leading-none">🧹</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-bold text-amber-900">
                          {r.item}
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-amber-800/80">
                          {r.reason}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 오늘의 책상 운세 */}
            {result.fortune && (
              <div className="border-t border-zinc-100 px-4 py-4">
                <div
                  className="rounded-2xl px-4 py-3.5"
                  style={{
                    background:
                      "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
                  }}
                >
                  <p className="mb-1 flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                    🔮 오늘의 책상 운세
                  </p>
                  <p className="text-[13px] font-medium leading-relaxed text-emerald-900">
                    {result.fortune}
                  </p>
                </div>
              </div>
            )}

            {/* 종합 개운 팁 */}
            {result.tip && (
              <div className="border-t border-zinc-100 px-4 py-3">
                <button
                  type="button"
                  onClick={() => setDetailOpen(!detailOpen)}
                  className="flex w-full items-center justify-between text-sm font-semibold text-emerald-700 transition"
                >
                  오늘의 개운 팁
                  <ChevronIcon open={detailOpen} />
                </button>
                {detailOpen && (
                  <p
                    className="mt-3 rounded-xl px-3 py-2.5 text-xs leading-relaxed"
                    style={{ backgroundColor: "#ecfdf5", color: "#065f46" }}
                  >
                    {result.tip}
                  </p>
                )}
              </div>
            )}
            {/* 저장 이미지용 워터마크 (카드를 캡처할 때 함께 담김) */}
            <div className="border-t border-zinc-100 px-4 py-3 text-center text-[11px] font-semibold text-emerald-600">
              🧭 책상풍수 · ppob-ai-7k27.vercel.app
            </div>
          </section>
        )}

        {result && !loading && (
          <ShareButton
            text={
              result.nickname
                ? `🧭 내 책상은 “${result.nickname}” (${result.overallScore}점)! 네 책상 풍수 점수도 볼래?`
                : `🧭 내 책상 풍수 점수는 ${result.overallScore}점! 네 책상도 AI로 봐봐`
            }
          />
        )}

        {result && !loading && (
          <SaveImageButton targetRef={resultRef} />
        )}

        <footer className="mt-8 pb-6 text-center text-xs leading-relaxed text-zinc-400">
          <VisitorCount />
          <p>
            재미로 보는 풍수 분석이에요. 실제 운세나 과학적 사실과는 무관하니
            가볍게 즐겨 주세요.
          </p>
          <SiteFooter />
        </footer>
      </main>
    </div>
  );
}

function ScoreRing({
  score,
  theme,
}: {
  score: number;
  theme: { bg: string; ring: string };
}) {
  const clamped = Math.min(Math.max(score, 0), 100);
  const r = 34;
  const c = 2 * Math.PI * r;
  const offset = c - (clamped / 100) * c;

  return (
    <div className="relative h-20 w-20 shrink-0">
      <svg viewBox="0 0 80 80" className="h-20 w-20 -rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" stroke="#f1f5f9" strokeWidth="8" />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke={theme.ring}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-2xl font-bold tabular-nums leading-none"
          style={{ color: theme.bg }}
        >
          {clamped}
        </span>
        <span className="mt-0.5 text-[10px] font-medium text-zinc-400">점</span>
      </div>
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

function CompassIcon({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
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
      style={style}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}

function CameraIcon({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
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
      style={style}
      aria-hidden="true"
    >
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  );
}

function UploadIcon({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
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
      style={style}
      aria-hidden="true"
    >
      <path d="M12 16V4" />
      <path d="m7 9 5-5 5 5" />
      <path d="M20 16v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2" />
    </svg>
  );
}

function SparkleIcon({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
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
      style={style ?? { color: "#059669" }}
      aria-hidden="true"
    >
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
      <path d="M19 14l.75 2.25L22 17l-2.25.75L19 20l-.75-2.25L16 17l2.25-.75L19 14z" />
    </svg>
  );
}

function CheckIcon({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </svg>
  );
}

function XCircleIcon({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
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
      style={style}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
