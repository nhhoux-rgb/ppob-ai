"use client";

import { useRef, useState, type ChangeEvent } from "react";

// 부동산 표지 배경 생성 — 웹 테스트 페이지(랩).
// 목적: 터미널 없이 브라우저에서 조감도를 올리고 옵션을 골라 생성 결과를 눈으로 검증한다.
// (정식 서비스가 아니라 품질 go/no-go 확인용 내부 페이지)

const RATIOS = [
  { key: "a4-landscape", label: "A4 가로" },
  { key: "16:9", label: "16:9 PPT" },
  { key: "a4-portrait", label: "A4 세로" },
] as const;

const COLOR_TONES = ["Navy", "Blue", "Black", "White", "Gold", "Green", "Gray"] as const;
const MOODS = ["Premium", "Corporate", "Luxury", "Modern", "Minimal", "Dark"] as const;
const DENSITIES = ["Simple", "Balanced", "Dramatic"] as const;
const SAFE_AREAS = [
  { key: "left", label: "왼쪽" },
  { key: "center", label: "가운데" },
  { key: "right", label: "오른쪽" },
  { key: "bottom", label: "아래" },
  { key: "full", label: "전체(없음)" },
] as const;

const PLACEMENTS = [
  { key: "bottom-left", label: "왼쪽 아래" },
  { key: "bottom-center", label: "가운데 아래" },
  { key: "bottom-right", label: "오른쪽 아래" },
  { key: "bottom-wide", label: "하단 전체(파노라마)" },
] as const;

const SCALES = [
  { key: "small", label: "작게" },
  { key: "medium", label: "보통" },
  { key: "large", label: "크게" },
] as const;

const GRADIENTS = [
  { key: "top-dark", label: "위쪽 진하게" },
  { key: "bottom-dark", label: "아래쪽 진하게" },
  { key: "diagonal", label: "대각선" },
  { key: "radial", label: "가운데 밝게" },
] as const;

// 미리보기 전용 안전영역 점선 위치(다운로드 이미지엔 미포함).
const SAFE_BOX: Record<string, React.CSSProperties | null> = {
  left: { left: "3%", top: "10%", width: "37%", height: "80%" },
  center: { left: "20%", top: "30%", width: "60%", height: "40%" },
  right: { right: "3%", top: "10%", width: "37%", height: "80%" },
  bottom: { left: "8%", bottom: "6%", width: "84%", height: "28%" },
  full: null,
};

export default function CoverLab() {
  const [image, setImage] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [ratio, setRatio] = useState<string>("a4-landscape");
  const [colorTone, setColorTone] = useState<string>("Navy");
  const [mood, setMood] = useState<string>("Corporate");
  const [density, setDensity] = useState<string>("Balanced");
  const [safeArea, setSafeArea] = useState<string>("left");
  const [placement, setPlacement] = useState<string>("bottom-center");
  const [scale, setScale] = useState<string>("medium");
  const [gradient, setGradient] = useState<string>("top-dark");
  const [showGuide, setShowGuide] = useState(true);

  const fileRef = useRef<HTMLInputElement>(null);

  function handleImage(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
      setResult("");
      setError("");
    };
    reader.readAsDataURL(f);
    e.target.value = "";
  }

  async function generate() {
    if (!image) return;
    setLoading(true);
    setError("");
    setResult("");
    try {
      const res = await fetch("/api/cover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: image,
          colorTone,
          mood,
          density,
          safeArea,
          ratio,
          placement,
          scale,
          gradient,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "생성 실패");
      setResult(data.imageBase64);
    } catch (err) {
      setError(err instanceof Error ? err.message : "생성 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  const box = SAFE_BOX[safeArea];

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 antialiased">
      <main className="mx-auto w-full max-w-3xl px-5 py-8">
        <h1 className="text-xl font-bold">표지 배경 생성 · 테스트 랩</h1>
        <p className="mt-1 text-sm text-zinc-500">
          조감도를 올리고 옵션을 골라 &quot;생성&quot;을 누르세요. 품질 검증용 내부 페이지입니다.
        </p>

        {/* 업로드 */}
        <section className="mt-6">
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full rounded-xl border-2 border-dashed border-zinc-300 bg-white py-10 text-sm font-medium text-zinc-600 hover:border-violet-400 hover:text-violet-600"
          >
            {image ? "다른 조감도로 변경" : "조감도 이미지 올리기 (JPG/PNG/WEBP)"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handleImage}
          />
          {image && (
            <img src={image} alt="업로드한 조감도" className="mt-3 max-h-48 rounded-lg border" />
          )}
        </section>

        {/* 옵션 */}
        <section className="mt-6 space-y-4">
          <OptionRow label="비율">
            {RATIOS.map((r) => (
              <Chip key={r.key} active={ratio === r.key} onClick={() => setRatio(r.key)}>
                {r.label}
              </Chip>
            ))}
          </OptionRow>
          <OptionRow label="컬러톤">
            {COLOR_TONES.map((c) => (
              <Chip key={c} active={colorTone === c} onClick={() => setColorTone(c)}>
                {c}
              </Chip>
            ))}
          </OptionRow>
          <OptionRow label="무드">
            {MOODS.map((m) => (
              <Chip key={m} active={mood === m} onClick={() => setMood(m)}>
                {m}
              </Chip>
            ))}
          </OptionRow>
          <OptionRow label="밀도">
            {DENSITIES.map((d) => (
              <Chip key={d} active={density === d} onClick={() => setDensity(d)}>
                {d}
              </Chip>
            ))}
          </OptionRow>
          <OptionRow label="제목 안전영역">
            {SAFE_AREAS.map((s) => (
              <Chip key={s.key} active={safeArea === s.key} onClick={() => setSafeArea(s.key)}>
                {s.label}
              </Chip>
            ))}
          </OptionRow>
          <OptionRow label="건물 위치">
            {PLACEMENTS.map((p) => (
              <Chip key={p.key} active={placement === p.key} onClick={() => setPlacement(p.key)}>
                {p.label}
              </Chip>
            ))}
          </OptionRow>
          <OptionRow label="건물 크기">
            {SCALES.map((s) => (
              <Chip key={s.key} active={scale === s.key} onClick={() => setScale(s.key)}>
                {s.label}
              </Chip>
            ))}
          </OptionRow>
          <OptionRow label="그라데이션">
            {GRADIENTS.map((g) => (
              <Chip key={g.key} active={gradient === g.key} onClick={() => setGradient(g.key)}>
                {g.label}
              </Chip>
            ))}
          </OptionRow>
        </section>

        <button
          onClick={generate}
          disabled={!image || loading}
          className="mt-6 w-full rounded-xl bg-violet-600 py-3 text-sm font-semibold text-white disabled:opacity-40"
        >
          {loading ? "생성 중… (최대 1분)" : "표지 배경 생성"}
        </button>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        {/* 결과 */}
        {result && (
          <section className="mt-8">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold">생성 결과</h2>
              <label className="flex items-center gap-1.5 text-xs text-zinc-500">
                <input
                  type="checkbox"
                  checked={showGuide}
                  onChange={(e) => setShowGuide(e.target.checked)}
                />
                안전영역 가이드 표시(다운로드엔 미포함)
              </label>
            </div>
            <div className="relative inline-block overflow-hidden rounded-lg border">
              <img src={result} alt="생성된 표지 배경" className="block w-full" />
              {showGuide && box && (
                <div
                  className="pointer-events-none absolute rounded border-2 border-dashed border-white/80"
                  style={box}
                >
                  <span className="absolute left-1 top-1 rounded bg-black/50 px-1 text-[10px] text-white">
                    제목 영역
                  </span>
                </div>
              )}
            </div>
            <a
              href={result}
              download="cover-background.png"
              className="mt-3 inline-block rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white"
            >
              PNG 다운로드
            </a>
          </section>
        )}
      </main>
    </div>
  );
}

function OptionRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 text-xs font-semibold text-zinc-500">{label}</div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-sm font-medium ${
        active ? "bg-violet-600 text-white" : "bg-white text-zinc-700 ring-1 ring-zinc-200"
      }`}
    >
      {children}
    </button>
  );
}
