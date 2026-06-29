"use client";

import { useRef, useState, type ChangeEvent } from "react";
import SiteFooter from "../site-footer";
import ToolTabs from "../tool-tabs";

type PriceResult = {
  item: string;
  priceMin: number;
  priceMax: number;
  priceEstimate: number;
  confidence: "high" | "medium" | "low";
  reason: string;
  note?: string;
};

const CONFIDENCE_LABEL: Record<PriceResult["confidence"], string> = {
  high: "신뢰도 높음",
  medium: "신뢰도 보통",
  low: "신뢰도 낮음",
};

const CONFIDENCE_THEME: Record<PriceResult["confidence"], string> = {
  high: "bg-green-100 text-green-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-zinc-100 text-zinc-500",
};

function won(n: number) {
  return `${Math.round(n).toLocaleString()}원`;
}

export default function ValuePage() {
  const [image, setImage] = useState("");
  const [cost, setCost] = useState(1000);
  const [result, setResult] = useState<PriceResult | null>(null);
  const [loading, setLoading] = useState(false);
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
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  async function analyze() {
    if (!image) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/price", {
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
  const safeCost = cost > 0 ? cost : 1000;
  const breakeven = result
    ? Math.floor(result.priceEstimate / safeCost)
    : 0;
  const breakevenMin = result ? Math.floor(result.priceMin / safeCost) : 0;
  const breakevenMax = result ? Math.floor(result.priceMax / safeCost) : 0;

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

        <ToolTabs />

        <section className="mb-5">
          <h1 className="text-[1.75rem] font-bold leading-tight tracking-tight sm:text-[1.875rem]">
            본전 분석
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-500">
            인형 사진을 올리면 대략적인 소매가와 손익분기 판수를 알려드립니다.
          </p>
        </section>

        {/* 한 판 가격 입력 */}
        <section className="mb-4">
          <label className="mb-1.5 block text-sm font-semibold text-zinc-700">
            한 판 가격
          </label>
          <div className="flex items-center gap-2 rounded-2xl border border-zinc-200 px-4 py-3 focus-within:border-violet-300">
            <input
              type="number"
              inputMode="numeric"
              min={100}
              step={100}
              value={cost}
              onChange={(e) => setCost(Number(e.target.value))}
              className="w-full bg-transparent text-base font-semibold outline-none"
            />
            <span className="shrink-0 text-sm font-medium text-zinc-400">원</span>
          </div>
        </section>

        {/* 이미지 영역 */}
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
                인형 사진을 추가해 주세요
              </p>
              <p className="mt-1.5 text-sm text-zinc-500">
                인형이 잘 보일수록 가격 추정이 정확합니다
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
                    <Spinner className="mb-3 h-8 w-8 text-white" />
                    <p className="text-sm font-semibold">가격 분석 중...</p>
                  </div>
                </div>
              )}
              <button
                type="button"
                onClick={() => replaceInputRef.current?.click()}
                className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-black/85 active:scale-95"
              >
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

        <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="sr-only" tabIndex={-1} aria-hidden onChange={handleImage} />
        <input ref={galleryInputRef} type="file" accept="image/*" className="sr-only" tabIndex={-1} aria-hidden onChange={handleImage} />
        <input ref={replaceInputRef} type="file" accept="image/*" className="sr-only" tabIndex={-1} aria-hidden onChange={handleImage} />

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
              <Spinner className="h-5 w-5 text-white" />
              분석 중...
            </>
          ) : (
            "가격 분석하기"
          )}
        </button>

        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        {result && !loading && (
          <section className="overflow-hidden rounded-3xl border border-zinc-100 bg-white shadow-[0_4px_24px_rgb(0,0,0,0.06)]">
            <div className="border-b border-zinc-100 px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-zinc-400">분석 대상</p>
                  <p className="mt-0.5 text-sm font-bold text-zinc-900">
                    {result.item}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${CONFIDENCE_THEME[result.confidence]}`}
                >
                  {CONFIDENCE_LABEL[result.confidence]}
                </span>
              </div>
            </div>

            {/* 추정 소매가 */}
            <div className="px-5 py-5 text-center">
              <p className="text-xs font-medium text-zinc-400">추정 소매가</p>
              <p className="mt-1 text-3xl font-bold text-violet-600">
                {won(result.priceEstimate)}
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                예상 범위 {won(result.priceMin)} ~ {won(result.priceMax)}
              </p>
            </div>

            {/* 손익분기 */}
            <div className="border-t border-zinc-100 bg-violet-50 px-5 py-5 text-center">
              <p className="text-sm font-semibold text-violet-900">
                한 판 {won(safeCost)} 기준
              </p>
              <p className="mt-2 text-lg font-bold text-violet-700">
                약 <span className="text-2xl">{breakeven}</span>판 안에 뽑으면 이득!
              </p>
              <p className="mt-1 text-xs text-violet-500">
                (범위 {breakevenMin}~{breakevenMax}판)
              </p>
            </div>

            {/* 근거 */}
            {(result.reason || result.note) && (
              <div className="space-y-2 px-5 py-4">
                {result.reason && (
                  <p className="text-xs leading-relaxed text-zinc-600">
                    <span className="font-semibold text-zinc-400">판단 근거 </span>
                    {result.reason}
                  </p>
                )}
                {result.note && (
                  <p className="text-xs leading-relaxed text-zinc-500">
                    <span className="font-semibold text-zinc-400">참고 </span>
                    {result.note}
                  </p>
                )}
              </div>
            )}
          </section>
        )}

        <footer className="mt-8 pb-6 text-center text-xs leading-relaxed text-zinc-400">
          <p>
            AI가 추정한 대략적인 가격이며 실제 시세와 다를 수 있습니다. 참고용으로만
            활용하세요.
          </p>
          <SiteFooter />
        </footer>
      </main>
    </div>
  );
}

function Spinner({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className ?? ""}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

function CameraIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  );
}

function UploadIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true">
      <path d="M12 16V4" />
      <path d="m7 9 5-5 5 5" />
      <path d="M20 16v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2" />
    </svg>
  );
}
