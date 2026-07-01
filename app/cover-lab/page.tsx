"use client";

import { useRef, useState, type ChangeEvent } from "react";

// 부동산 표지 배경 생성 (AI 방식).
// 사용자는 색상 · 건물 위치 · 비율만 고르고, 나머지 디자인(구도/장식/그라데이션)은
// GPT가 보고서 표지에 어울리게 알아서 만든다.

const RATIOS = [
  { key: "a4-landscape", label: "A4 가로" },
  { key: "16:9", label: "16:9 PPT" },
  { key: "a4-portrait", label: "A4 세로" },
] as const;

const COLOR_TONES = ["Navy", "Blue", "Black", "White", "Gold", "Green", "Gray"] as const;

const PLACEMENTS = [
  { key: "bottom-left", label: "왼쪽 아래" },
  { key: "bottom-center", label: "가운데 아래" },
  { key: "bottom-right", label: "오른쪽 아래" },
  { key: "bottom-wide", label: "하단 전체(파노라마)" },
] as const;

export default function CoverLab() {
  const [image, setImage] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [ratio, setRatio] = useState<string>("a4-landscape");
  const [colorTone, setColorTone] = useState<string>("Navy");
  const [placement, setPlacement] = useState<string>("bottom-center");

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
        body: JSON.stringify({ imageBase64: image, colorTone, ratio, placement }),
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

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 antialiased">
      <main className="mx-auto w-full max-w-3xl px-5 py-8">
        <h1 className="text-xl font-bold">표지 배경 생성</h1>
        <p className="mt-1 text-sm text-zinc-500">
          조감도를 올리고 색상과 건물 위치만 고르세요. 나머지 디자인은 AI가 보고서 표지에 어울리게
          알아서 만듭니다.
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
          <OptionRow label="건물 위치">
            {PLACEMENTS.map((p) => (
              <Chip key={p.key} active={placement === p.key} onClick={() => setPlacement(p.key)}>
                {p.label}
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
            <h2 className="mb-2 text-sm font-semibold">생성 결과</h2>
            <div className="overflow-hidden rounded-lg border">
              <img src={result} alt="생성된 표지 배경" className="block w-full" />
            </div>
            <div className="mt-3 flex gap-2">
              <a
                href={result}
                download="cover-background.png"
                className="inline-block rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white"
              >
                PNG 다운로드
              </a>
              <button
                onClick={generate}
                disabled={loading}
                className="inline-block rounded-lg bg-white px-4 py-2 text-sm font-semibold text-zinc-700 ring-1 ring-zinc-200 disabled:opacity-40"
              >
                다시 생성
              </button>
            </div>
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
