"use client";

import { useRef, useState, type ChangeEvent } from "react";

// 부동산 표지 배경 생성 (AI 방식).
// 사용자는 사진만 넣으면 되고, 원하면 자유 입력칸에 느낌을 적어 조정한다.
// 나머지 디자인은 AI가 보고서 표지에 어울리게 알아서 만든다.

const RATIOS = [
  { key: "a4-landscape", label: "A4 가로" },
  { key: "16:9", label: "16:9 PPT" },
  { key: "a4-portrait", label: "A4 세로" },
] as const;

const QUALITIES = [
  { key: "high", label: "고품질(권장)" },
  { key: "medium", label: "보통(빠름·저렴)" },
] as const;

// 입력칸 아래 가이드 — 누르면 입력칸에 추가된다.
const EXAMPLES = [
  "밝고 깨끗한 화이트 배경",
  "네이비 톤으로 고급스럽게",
  "따뜻한 골드 포인트, 프리미엄",
  "야경 느낌, 도시 조명",
  "석양 배경, 웅장하게",
  "미니멀하게, 여백 많이",
  "왼쪽에 제목 넣을 여백 크게",
  "파노라마 넓은 구도",
] as const;

export default function CoverLab() {
  const [image, setImage] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [ratio, setRatio] = useState<string>("a4-landscape");
  const [quality, setQuality] = useState<string>("high");
  const [userPrompt, setUserPrompt] = useState<string>("");

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

  function addExample(text: string) {
    setUserPrompt((prev) => (prev.trim() ? `${prev.trim()}, ${text}` : text));
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
        body: JSON.stringify({ imageBase64: image, ratio, quality, userPrompt }),
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
          조감도만 올리면 AI가 보고서 표지에 어울리는 배경을 알아서 만듭니다. 원하는 느낌이 있으면
          아래 칸에 자유롭게 적어주세요. (글자·로고는 넣지 않습니다)
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

        {/* 자유 입력 */}
        <section className="mt-6">
          <div className="mb-1.5 text-xs font-semibold text-zinc-500">
            원하는 느낌 (선택 — 비워두면 AI가 알아서)
          </div>
          <textarea
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            rows={3}
            maxLength={600}
            placeholder="예) 밝고 깨끗한 화이트 배경, 왼쪽에 제목 넣을 여백 크게"
            className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm outline-none focus:border-violet-400"
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => addExample(ex)}
                className="rounded-full bg-white px-2.5 py-1 text-xs text-zinc-600 ring-1 ring-zinc-200 hover:bg-violet-50 hover:text-violet-700"
              >
                + {ex}
              </button>
            ))}
          </div>
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
          <OptionRow label="품질">
            {QUALITIES.map((qq) => (
              <Chip key={qq.key} active={quality === qq.key} onClick={() => setQuality(qq.key)}>
                {qq.label}
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
