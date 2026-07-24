"use client";

import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";

// 코드 합성 표지 (AI 미사용):
//  - 배경 = 깔끔한 그라데이션 (컬러톤 선택 또는 사진에서 자동 추출)
//  - 원본 렌더 = 그대로 사진 패널로 배치 (선명도 100%, 글자/워터마크 0)
//  - 나머지는 제목 넣을 여백. 전부 브라우저에서 즉시, 무료, 안정적.

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

// [진한색, 밝은색, 액센트색]
const TONES: Record<string, [string, string, string]> = {
  Navy: ["#0b2545", "#1c4a80", "#c9a24a"],
  Blue: ["#0f4c8a", "#3f7fc0", "#ffffff"],
  White: ["#dbe3ef", "#ffffff", "#1e3a8a"],
  Black: ["#0e0e10", "#33373f", "#c9a24a"],
  Gold: ["#2a1e08", "#b98b34", "#f4e3b8"],
  Green: ["#0e3b30", "#2f6f5c", "#cfe8dd"],
  Gray: ["#2f343b", "#5b626c", "#d3d9e0"],
};
const TONE_KEYS = ["Auto", ...Object.keys(TONES)];

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

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

function clamp(n: number) {
  return Math.max(0, Math.min(255, Math.round(n)));
}
function rgb(r: number, g: number, b: number) {
  return `rgb(${clamp(r)}, ${clamp(g)}, ${clamp(b)})`;
}

// 사진에서 평균색을 뽑아 [진한, 밝은, 액센트] 그라데이션 색을 만든다.
function autoTone(img: HTMLImageElement): [string, string, string] {
  const c = document.createElement("canvas");
  c.width = 16;
  c.height = 16;
  const cx = c.getContext("2d");
  if (!cx) return TONES.Navy;
  cx.drawImage(img, 0, 0, 16, 16);
  const d = cx.getImageData(0, 0, 16, 16).data;
  let r = 0,
    g = 0,
    b = 0,
    n = 0;
  for (let i = 0; i < d.length; i += 4) {
    r += d[i];
    g += d[i + 1];
    b += d[i + 2];
    n++;
  }
  r /= n;
  g /= n;
  b /= n;
  const deep = rgb(r * 0.45, g * 0.45, b * 0.45);
  const light = rgb(r * 0.75 + 90, g * 0.75 + 90, b * 0.75 + 90);
  const accent = rgb(r * 0.6 + 130, g * 0.6 + 130, b * 0.6 + 130);
  return [deep, light, accent];
}

export default function CoverLab() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const uploadRef = useRef<HTMLImageElement | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const [hasImage, setHasImage] = useState(false);
  const [ratioKey, setRatioKey] = useState<string>("a4-landscape");
  const [layout, setLayout] = useState<string>("right");
  const [tone, setTone] = useState<string>("Auto");
  const [accentOn, setAccentOn] = useState(true);

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

    const up = uploadRef.current;
    const [deep, light, accent] =
      tone === "Auto" ? (up ? autoTone(up) : TONES.Navy) : TONES[tone];

    // 배경: 대각선 그라데이션
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, deep);
    grad.addColorStop(1, light);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    if (!up) return;

    // 사진 패널 위치
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
      ph = Math.round(H * 0.58);
      py = H - ph;
      seam = "top";
    }

    // 이음새만 부드럽게 페더링
    const off = document.createElement("canvas");
    off.width = pw;
    off.height = ph;
    const octx = off.getContext("2d");
    if (octx) {
      drawCover(octx, up, 0, 0, pw, ph);
      octx.globalCompositeOperation = "destination-in";
      const f = 0.12;
      let g2: CanvasGradient;
      if (seam === "left") {
        g2 = octx.createLinearGradient(0, 0, pw, 0);
        g2.addColorStop(0, "rgba(0,0,0,0)");
        g2.addColorStop(f, "rgba(0,0,0,1)");
        g2.addColorStop(1, "rgba(0,0,0,1)");
      } else if (seam === "right") {
        g2 = octx.createLinearGradient(0, 0, pw, 0);
        g2.addColorStop(0, "rgba(0,0,0,1)");
        g2.addColorStop(1 - f, "rgba(0,0,0,1)");
        g2.addColorStop(1, "rgba(0,0,0,0)");
      } else {
        g2 = octx.createLinearGradient(0, 0, 0, ph);
        g2.addColorStop(0, "rgba(0,0,0,0)");
        g2.addColorStop(f, "rgba(0,0,0,1)");
        g2.addColorStop(1, "rgba(0,0,0,1)");
      }
      octx.fillStyle = g2;
      octx.fillRect(0, 0, pw, ph);
      octx.globalCompositeOperation = "source-over";
      ctx.drawImage(off, px, py);
    }

    // 얇은 액센트 라인 (이음새 살짝 안쪽)
    if (accentOn) {
      ctx.fillStyle = accent;
      ctx.globalAlpha = 0.9;
      const t = Math.max(2, Math.round(W / 400));
      if (seam === "left") ctx.fillRect(px, 0, t, H);
      else if (seam === "right") ctx.fillRect(px + pw - t, 0, t, H);
      else ctx.fillRect(0, py, W, t);
      ctx.globalAlpha = 1;
    }
  }, [ratio, layout, tone, accentOn]);

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
      draw();
    };
    reader.readAsDataURL(f);
    e.target.value = "";
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
          조감도를 올리면 원본 사진을 그대로 표지에 배치하고 배경을 깔끔하게 채웁니다. 색·위치는
          즉시 바뀝니다. (글자·로고 없음)
        </p>

        <div className="mt-6 grid gap-6 md:grid-cols-[1fr_280px]">
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
            <button
              onClick={download}
              disabled={!hasImage}
              className="mt-3 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            >
              PNG 다운로드
            </button>
          </div>

          <div className="space-y-4">
            <Row label="배경 컬러">
              {TONE_KEYS.map((t) => (
                <Chip key={t} active={tone === t} onClick={() => setTone(t)}>
                  {t === "Auto" ? "자동(사진색)" : t}
                </Chip>
              ))}
            </Row>
            <Row label="비율">
              {RATIOS.map((r) => (
                <Chip key={r.key} active={ratioKey === r.key} onClick={() => setRatioKey(r.key)}>
                  {r.label}
                </Chip>
              ))}
            </Row>
            <Row label="사진 위치">
              {LAYOUTS.map((l) => (
                <Chip key={l.key} active={layout === l.key} onClick={() => setLayout(l.key)}>
                  {l.label}
                </Chip>
              ))}
            </Row>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={accentOn}
                onChange={(e) => setAccentOn(e.target.checked)}
              />
              액센트 라인 표시
            </label>
            <p className="text-xs text-zinc-400">
              모든 설정은 즉시 반영됩니다. 왼쪽/위쪽 빈 공간에 PPT에서 제목을 넣으세요.
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
