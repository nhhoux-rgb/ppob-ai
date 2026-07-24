"use client";

import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";

// 하이브리드(B안) 표지 생성:
//  - AI(Gemini)는 "배경만" 생성 (건물·글자 없음 → 워터마크/컷아웃 문제 제거)
//  - 업로드한 원본 렌더는 브라우저 canvas로 그대로 합성 (선명도 100%, 글자 0)
//  - 원본을 깔끔한 사진 패널로 배치하고, 나머지는 제목 넣을 여백으로 비운다.

const RATIOS = [
  { key: "a4-landscape", label: "A4 가로", w: 1600, h: 1131 },
  { key: "16:9", label: "16:9 PPT", w: 1600, h: 900 },
  { key: "a4-portrait", label: "A4 세로", w: 1131, h: 1600 },
] as const;

const LAYOUTS = [
  { key: "right", label: "사진 오른쪽" },
  { key: "left", label: "사진 왼쪽" },
  { key: "bottom", label: "사진 아래" },
] as const;

const EXAMPLES = [
  "밝고 깨끗한 화이트",
  "네이비 톤 고급스럽게",
  "따뜻한 골드 프리미엄",
  "딥블루 야경 분위기",
  "미니멀 그레이",
  "차분한 그린",
] as const;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// 대상 사각형을 꽉 채우도록(cover) 이미지를 그린다.
function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number,
  dy: number,
  dw: number,
  dh: number
) {
  const s = Math.max(dw / img.naturalWidth, dh / img.naturalHeight);
  const sw = dw / s;
  const sh = dh / s;
  const sx = (img.naturalWidth - sw) / 2;
  const sy = (img.naturalHeight - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
}

export default function CoverLab() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const uploadRef = useRef<HTMLImageElement | null>(null);
  const bgRef = useRef<HTMLImageElement | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const [hasImage, setHasImage] = useState(false);
  const [hasBg, setHasBg] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [ratioKey, setRatioKey] = useState<string>("a4-landscape");
  const [layout, setLayout] = useState<string>("right");
  const [userPrompt, setUserPrompt] = useState<string>("");

  const ratio = RATIOS.find((r) => r.key === ratioKey) ?? RATIOS[0];

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = ratio.w;
    const H = ratio.h;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 배경
    const bg = bgRef.current;
    if (bg) {
      drawCover(ctx, bg, 0, 0, W, H);
    } else {
      ctx.fillStyle = "#eef1f5";
      ctx.fillRect(0, 0, W, H);
    }

    // 사진 패널 (원본 렌더)
    const up = uploadRef.current;
    if (up) {
      // 패널 위치/크기 + 이음새(seam) 방향
      let px = 0,
        py = 0,
        pw: number = W,
        ph: number = H;
      let seam: "left" | "right" | "top" = "left";
      if (layout === "right") {
        pw = Math.round(W * 0.58);
        px = W - pw;
        seam = "left";
      } else if (layout === "left") {
        pw = Math.round(W * 0.58);
        px = 0;
        seam = "right";
      } else {
        // bottom
        ph = Math.round(H * 0.58);
        py = H - ph;
        seam = "top";
      }

      // 오프스크린에 패널을 그린 뒤, 이음새 방향만 부드럽게 페더링
      const off = document.createElement("canvas");
      off.width = pw;
      off.height = ph;
      const octx = off.getContext("2d");
      if (octx) {
        drawCover(octx, up, 0, 0, pw, ph);
        octx.globalCompositeOperation = "destination-in";
        let grad: CanvasGradient;
        const f = 0.14; // 페더 폭 비율
        if (seam === "left") {
          grad = octx.createLinearGradient(0, 0, pw, 0);
          grad.addColorStop(0, "rgba(0,0,0,0)");
          grad.addColorStop(f, "rgba(0,0,0,1)");
        } else if (seam === "right") {
          grad = octx.createLinearGradient(0, 0, pw, 0);
          grad.addColorStop(1 - f, "rgba(0,0,0,1)");
          grad.addColorStop(1, "rgba(0,0,0,0)");
        } else {
          grad = octx.createLinearGradient(0, 0, 0, ph);
          grad.addColorStop(0, "rgba(0,0,0,0)");
          grad.addColorStop(f, "rgba(0,0,0,1)");
        }
        // 페더 영역 밖은 완전히 유지
        if (seam === "left") grad.addColorStop(1, "rgba(0,0,0,1)");
        else if (seam === "top") grad.addColorStop(1, "rgba(0,0,0,1)");
        else grad.addColorStop(0, "rgba(0,0,0,1)");
        octx.fillStyle = grad;
        octx.fillRect(0, 0, pw, ph);
        octx.globalCompositeOperation = "source-over";
        ctx.drawImage(off, px, py);
      }
    }
  }, [ratio, layout]);

  useEffect(() => {
    draw();
  }, [draw]);

  function handleImage(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = async () => {
      uploadRef.current = await loadImage(reader.result as string);
      setHasImage(true);
      // 새 이미지 올리면 기존 배경은 유지(다시 생성 전까지). 바로 미리보기.
      draw();
    };
    reader.readAsDataURL(f);
    e.target.value = "";
  }

  async function generateBg() {
    const up = uploadRef.current;
    if (!up) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/cover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: up.src, ratio: ratioKey, userPrompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "배경 생성 실패");
      bgRef.current = await loadImage(data.imageBase64);
      setHasBg(true);
      draw();
    } catch (err) {
      setError(err instanceof Error ? err.message : "생성 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.download = "cover.png";
    a.href = canvas.toDataURL("image/png");
    a.click();
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 antialiased">
      <main className="mx-auto w-full max-w-4xl px-5 py-8">
        <h1 className="text-xl font-bold">표지 배경 생성</h1>
        <p className="mt-1 text-sm text-zinc-500">
          조감도를 올리면 AI가 배경을 만들고, 원본 사진은 그대로 표지에 배치합니다. 원하는 색·느낌은
          아래 칸에 적어주세요. (글자·로고는 넣지 않습니다)
        </p>

        <div className="mt-6 grid gap-6 md:grid-cols-[1fr_300px]">
          {/* 미리보기 */}
          <div>
            <button
              onClick={() => fileInput.current?.click()}
              className="mb-3 w-full rounded-xl border-2 border-dashed border-zinc-300 bg-white py-4 text-sm font-medium text-zinc-600 hover:border-violet-400 hover:text-violet-600"
            >
              {hasImage ? "다른 조감도로 변경" : "조감도 이미지 올리기 (JPG/PNG/WEBP)"}
            </button>
            <input
              ref={fileInput}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleImage}
            />
            <div className="overflow-hidden rounded-lg border bg-white">
              <canvas ref={canvasRef} className="block w-full" />
            </div>
            {hasImage && !hasBg && (
              <p className="mt-2 text-xs text-zinc-400">
                지금은 임시 배경입니다. &quot;AI 배경 생성&quot;을 누르면 배경이 채워집니다.
              </p>
            )}
            <div className="mt-3 flex gap-2">
              <button
                onClick={download}
                disabled={!hasImage}
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
              >
                PNG 다운로드
              </button>
            </div>
          </div>

          {/* 컨트롤 */}
          <div className="space-y-4">
            <Row label="원하는 색·느낌 (선택)">
              <textarea
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                rows={2}
                maxLength={600}
                placeholder="예) 네이비 톤 고급스럽게"
                className="w-full rounded-xl border border-zinc-200 bg-white p-2.5 text-sm outline-none focus:border-violet-400"
              />
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex}
                    onClick={() =>
                      setUserPrompt((p) => (p.trim() ? `${p.trim()}, ${ex}` : ex))
                    }
                    className="rounded-full bg-white px-2 py-0.5 text-xs text-zinc-600 ring-1 ring-zinc-200 hover:bg-violet-50 hover:text-violet-700"
                  >
                    + {ex}
                  </button>
                ))}
              </div>
            </Row>

            <button
              onClick={generateBg}
              disabled={!hasImage || loading}
              className="w-full rounded-xl bg-violet-600 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
            >
              {loading ? "AI 배경 생성 중… (최대 1분)" : hasBg ? "AI 배경 다시 생성" : "AI 배경 생성"}
            </button>
            {error && <p className="text-sm text-red-600">{error}</p>}

            <Row label="비율">
              {RATIOS.map((r) => (
                <Chip key={r.key} active={ratioKey === r.key} onClick={() => setRatioKey(r.key)}>
                  {r.label}
                </Chip>
              ))}
            </Row>
            <Row label="사진 위치 (즉시 반영)">
              {LAYOUTS.map((l) => (
                <Chip key={l.key} active={layout === l.key} onClick={() => setLayout(l.key)}>
                  {l.label}
                </Chip>
              ))}
            </Row>
            <p className="text-xs text-zinc-400">
              사진 위치·비율은 AI 재생성 없이 바로 바뀝니다. 색·느낌을 바꾸려면 &quot;AI 배경
              다시 생성&quot;을 누르세요.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
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
