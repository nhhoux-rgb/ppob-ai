"use client";

import Link from "next/link";
import { useRef, useState, type ChangeEvent } from "react";

type Target = {
  rank: number;
  name: string;
  score: number;
  reason: string;
  strategy: string;
  x: number;
  y: number;
};

type Result = {
  summary: string;
  targets: Target[];
  avoid?: string[];
  tip?: string;
};

const RANK_THEME = [
  { bg: "#22c55e", light: "#dcfce7", text: "#15803d", border: "#86efac" },
  { bg: "#fbbf24", light: "#fef3c7", text: "#b45309", border: "#fcd34d" },
  { bg: "#3b82f6", light: "#dbeafe", text: "#1d4ed8", border: "#93c5fd" },
] as const;

function getTheme(rank: number) {
  return RANK_THEME[Math.min(Math.max(rank, 1), 3) - 1]!;
}

function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function normalizeTargets(targets: Target[] | undefined) {
  if (!targets?.length) return [];

  return [...targets]
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 3)
    .map((t, i) => ({
      ...t,
      displayRank: t.rank > 0 ? t.rank : i + 1,
    }));
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
  const targets = normalizeTargets(result?.targets);
  const best = targets[0];

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900 antialiased">
      <main className="mx-auto w-full max-w-[520px] px-5 py-8 sm:px-6 sm:py-10">
        <header className="mb-6 flex items-center justify-between">
          <span className="text-xl font-bold tracking-tight text-violet-600">
            뽑AI
          </span>
          <span
            className="rounded-full px-3 py-1 text-xs font-semibold"
            style={{ backgroundColor: "#f5f3ff", color: "#6d28d9" }}
          >
            Beta
          </span>
        </header>

        <section className="mb-5">
          <h1 className="text-[1.75rem] font-bold leading-tight tracking-tight sm:text-[1.875rem]">
            인형뽑기 AI 공략
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-500">
            사진 한 장으로 제일 뽑기 쉬운 인형을 찾아드립니다.
          </p>
        </section>

        <section className="mb-4">
          {!hasImage ? (
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              className="flex w-full flex-col items-center justify-center rounded-3xl border border-dashed px-6 py-14 shadow-sm transition active:scale-[0.99]"
              style={{
                borderColor: "#ddd6fe",
                background: "linear-gradient(to bottom, #f5f3ff99, #ffffff)",
              }}
            >
              <div
                className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg"
                style={{ backgroundColor: "#7c3aed" }}
              >
                <CameraIcon className="h-8 w-8 text-white" />
              </div>
              <p className="text-base font-semibold text-zinc-900">
                사진을 추가해 주세요
              </p>
              <p className="mt-1.5 text-sm text-zinc-500">
                기계 전체가 보이면 더 정확합니다
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
                    <p className="text-sm font-semibold">AI 분석 중...</p>
                  </div>
                </div>
              )}

              {result && !loading && (
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                    <CheckIcon className="h-3.5 w-3.5" style={{ color: "#4ade80" }} />
                    분석 완료
                  </div>

                  {targets.map((t) => {
                    const theme = getTheme(t.displayRank);

                    return (
                      <div
                        key={`${t.displayRank}-${t.name}`}
                        className="absolute flex flex-col items-center"
                        style={{
                          left: `${t.x}%`,
                          top: `${t.y}%`,
                          transform: "translate(-50%, -50%)",
                        }}
                      >
                        <div
                          className="flex shrink-0 items-center justify-center rounded-full border-[3px] border-white text-lg font-bold shadow-lg"
                          style={{
                            width: 48,
                            height: 48,
                            minWidth: 48,
                            minHeight: 48,
                            backgroundColor: hexToRgba(theme.bg, 0.65),
                            color: "#ffffff",
                            boxShadow: `0 4px 12px ${hexToRgba(theme.bg, 0.5)}, 0 0 0 1px rgba(0,0,0,0.12)`,
                          }}
                        >
                          {t.displayRank}
                        </div>
                      </div>
                    );
                  })}
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
            className="flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white py-3.5 text-sm font-semibold text-zinc-800 shadow-sm transition hover:border-violet-200 active:scale-[0.98]"
          >
            <CameraIcon className="h-5 w-5" style={{ color: "#7c3aed" }} />
            카메라
          </button>
          <button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            className="flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white py-3.5 text-sm font-semibold text-zinc-800 shadow-sm transition hover:border-violet-200 active:scale-[0.98]"
          >
            <UploadIcon className="h-5 w-5" style={{ color: "#7c3aed" }} />
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
              : { backgroundColor: "#7c3aed", boxShadow: "0 8px 24px rgba(124,58,237,0.25)" }
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
              AI 분석하기
            </>
          )}
        </button>

        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        {result && !loading && (
          <section className="overflow-hidden rounded-3xl border border-zinc-100 bg-white shadow-[0_4px_24px_rgb(0,0,0,0.06)]">
            <div className="flex items-center gap-2 border-b border-zinc-100 px-4 py-3.5">
              <MedalIcon className="h-5 w-5" style={{ color: "#7c3aed" }} />
              <h2 className="text-sm font-bold text-zinc-900">추천 순위</h2>
            </div>

            <div className="divide-y divide-zinc-100">
              {targets.map((t) => {
                const theme = getTheme(t.displayRank);
                return (
                  <article
                    key={`card-${t.displayRank}-${t.name}`}
                    className="flex items-start gap-3 px-4 py-3.5"
                  >
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                      style={{ backgroundColor: theme.bg }}
                    >
                      {t.displayRank}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold leading-snug text-zinc-900">
                        {t.name}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-500">
                        {t.reason}
                      </p>
                    </div>
                    <span
                      className="shrink-0 rounded-lg px-2.5 py-1 text-sm font-bold tabular-nums"
                      style={{ backgroundColor: theme.light, color: theme.text }}
                    >
                      {t.score}%
                    </span>
                  </article>
                );
              })}
            </div>

            {result.avoid && result.avoid.length > 0 && (
              <div className="border-t border-zinc-100 px-4 py-4">
                <div className="mb-2 flex items-center gap-1.5">
                  <XCircleIcon className="h-4 w-4" style={{ color: "#ef4444" }} />
                  <p className="text-sm font-bold" style={{ color: "#dc2626" }}>
                    피해야 할 인형
                  </p>
                </div>
                <ul className="space-y-1">
                  {result.avoid.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-xs leading-relaxed text-zinc-500"
                    >
                      <span
                        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: "#f87171" }}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="border-t border-zinc-100 px-4 py-3">
              <button
                type="button"
                onClick={() => setDetailOpen(!detailOpen)}
                className="flex w-full items-center justify-between text-sm font-semibold transition"
                style={{ color: "#7c3aed" }}
              >
                자세히 보기
                <ChevronIcon open={detailOpen} />
              </button>

              {detailOpen && (
                <div className="mt-3 space-y-3 pb-1">
                  {(result.tip || result.summary) && (
                    <p
                      className="rounded-xl px-3 py-2.5 text-xs leading-relaxed"
                      style={{ backgroundColor: "#f5f3ff", color: "#5b21b6" }}
                    >
                      {result.tip || result.summary}
                    </p>
                  )}

                  {targets.map((t) => (
                    <div
                      key={`detail-${t.displayRank}-${t.name}`}
                      className="rounded-xl bg-zinc-50 px-3 py-2.5 text-xs leading-relaxed text-zinc-600"
                    >
                      <p className="mb-1 font-semibold text-zinc-800">
                        #{t.displayRank} {t.name}
                      </p>
                      <p>
                        <span className="font-medium text-zinc-400">
                          공략 방법
                        </span>{" "}
                        {t.strategy}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        <footer className="mt-8 pb-6 text-center text-xs leading-relaxed text-zinc-400">
          <p>
            사진상 배치 기준 추천이며, 실제 성공 여부는 기계 세팅에 따라 달라질
            수 있습니다.
          </p>
          <Link
            href="/privacy"
            className="mt-3 inline-block font-medium text-zinc-400 underline underline-offset-2 transition hover:text-violet-600"
          >
            개인정보처리방침
          </Link>
        </footer>
      </main>
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

function MedalIcon({
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
      <path d="M7.5 4.5 9 9l4.5 1.5L9 12l-1.5 4.5L7.5 12 3 10.5 7.5 9z" />
      <path d="M16.5 4.5 15 9l-4.5 1.5L15 12l1.5 4.5L16.5 12 21 10.5 16.5 9z" />
      <circle cx="12" cy="16" r="4" />
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
