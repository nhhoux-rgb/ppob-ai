"use client";

import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";

// 표지 템플릿 방식 (AI 미사용, 전부 브라우저 canvas · 즉시 · 무료 · 글자/워터마크 0)

type RGB = [number, number, number];
type Colors = { deep: RGB; light: RGB; accent: RGB };
type Opts = {
  fx: number;
  fy: number;
  ov: number; // 배경 그라데이션 강도 0~1
  zoom: number; // 사진 크기 배율 (1~)
  panel: number; // 프레임(패널) 크기 0~1
  lineColor: string; // 구분선 색 (#hex)
  lineGrad: boolean; // 구분선 그라데이션
  shape: string; // 배경 도형 패턴
};

const RATIOS = [
  { key: "a4-landscape", label: "A4 가로", w: 1600, h: 1131 },
  { key: "16:9", label: "16:9 PPT", w: 1600, h: 900 },
  { key: "a4-portrait", label: "A4 세로", w: 1131, h: 1600 },
] as const;

const TONES: Record<string, Colors> = {
  Navy: { deep: [11, 37, 69], light: [28, 74, 128], accent: [201, 162, 74] },
  Blue: { deep: [15, 76, 138], light: [63, 127, 192], accent: [255, 255, 255] },
  White: { deep: [219, 227, 239], light: [255, 255, 255], accent: [30, 58, 138] },
  Black: { deep: [14, 14, 16], light: [51, 55, 63], accent: [201, 162, 74] },
  Gold: { deep: [42, 30, 8], light: [185, 139, 52], accent: [244, 227, 184] },
  Green: { deep: [14, 59, 48], light: [47, 111, 92], accent: [207, 232, 221] },
  Gray: { deep: [47, 52, 59], light: [91, 98, 108], accent: [211, 217, 224] },
};
const TONE_KEYS = ["Auto", ...Object.keys(TONES)];

const TEMPLATES = [
  { key: "fullbleed", label: "풀이미지" },
  { key: "sidebar", label: "사이드바" },
  { key: "bottom", label: "하단 밴드" },
  { key: "diagonal", label: "대각 분할" },
  { key: "card", label: "프레임 카드" },
  { key: "topbar", label: "상단 타이틀바" },
] as const;

const SHAPES = [
  { key: "none", label: "없음" },
  { key: "circle", label: "원" },
  { key: "band", label: "밴드" },
  { key: "triangle", label: "삼각" },
] as const;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function clamp(n: number) {
  return Math.max(0, Math.min(255, Math.round(n)));
}
const rgbStr = (c: RGB) => `rgb(${clamp(c[0])},${clamp(c[1])},${clamp(c[2])})`;
const rgba = (c: RGB, a: number) => `rgba(${clamp(c[0])},${clamp(c[1])},${clamp(c[2])},${a})`;
function hexToRgb(h: string): RGB {
  let s = h.replace("#", "");
  if (s.length === 3) s = s.split("").map((x) => x + x).join("");
  const n = parseInt(s, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function lerp(a: RGB, b: RGB, t: number): RGB {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

// fx,fy: 크롭 초점, zoom: 배율(>1 확대)
function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
  fx = 0.5,
  fy = 0.5,
  zoom = 1
) {
  const s = Math.max(dw / img.naturalWidth, dh / img.naturalHeight) * zoom;
  const sw = dw / s;
  const sh = dh / s;
  const sx = (img.naturalWidth - sw) * fx;
  const sy = (img.naturalHeight - sh) * fy;
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
}

function autoTone(img: HTMLImageElement): Colors {
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
  return {
    deep: [r * 0.4, g * 0.4, b * 0.4],
    light: [r * 0.7 + 70, g * 0.7 + 70, b * 0.7 + 70],
    accent: [r * 0.5 + 150, g * 0.5 + 150, b * 0.5 + 150],
  };
}

// 구분선 (색상/그라데이션 지원)
function divider(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  thick: number,
  colorHex: string,
  grad: boolean
) {
  ctx.lineWidth = thick;
  if (grad) {
    const [r, g, b] = hexToRgb(colorHex);
    const gg = ctx.createLinearGradient(x1, y1, x2, y2);
    gg.addColorStop(0, `rgba(${r},${g},${b},0)`);
    gg.addColorStop(0.5, `rgba(${r},${g},${b},1)`);
    gg.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.strokeStyle = gg;
  } else {
    ctx.strokeStyle = colorHex;
  }
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function accentTick(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, colorHex: string) {
  ctx.fillStyle = colorHex;
  ctx.fillRect(x, y, w, Math.max(3, w * 0.03));
}

// 배경 장식 도형 (그라데이션) — 주로 좌상단 제목 영역에 은은하게
function drawShape(ctx: CanvasRenderingContext2D, W: number, H: number, shape: string, colorHex: string) {
  if (shape === "none") return;
  const [r, g, b] = hexToRgb(colorHex);
  ctx.save();
  if (shape === "circle") {
    const grd = ctx.createRadialGradient(W * 0.18, H * 0.22, 0, W * 0.18, H * 0.22, W * 0.42);
    grd.addColorStop(0, `rgba(${r},${g},${b},0.3)`);
    grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(W * 0.18, H * 0.22, W * 0.42, 0, Math.PI * 2);
    ctx.fill();
  } else if (shape === "band") {
    ctx.translate(W * 0.3, H * 0.28);
    ctx.rotate(-0.4);
    const bw = W * 1.1;
    const bh = H * 0.16;
    const grd = ctx.createLinearGradient(-bw / 2, 0, bw / 2, 0);
    grd.addColorStop(0, `rgba(${r},${g},${b},0)`);
    grd.addColorStop(0.5, `rgba(${r},${g},${b},0.22)`);
    grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = grd;
    ctx.fillRect(-bw / 2, -bh / 2, bw, bh);
  } else if (shape === "triangle") {
    const grd = ctx.createLinearGradient(0, 0, W * 0.5, H * 0.5);
    grd.addColorStop(0, `rgba(${r},${g},${b},0.32)`);
    grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(W * 0.48, 0);
    ctx.lineTo(0, H * 0.6);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function render(
  key: string,
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  img: HTMLImageElement,
  c: Colors,
  o: Opts
) {
  const { fx, fy, ov, zoom, panel, lineColor, lineGrad, shape } = o;
  const tline = Math.max(3, W / 300);
  const bgGrad = () => {
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, rgbStr(c.deep));
    g.addColorStop(1, rgbStr(lerp(c.light, c.deep, ov * 0.6)));
    return g;
  };

  if (key === "fullbleed") {
    drawCover(ctx, img, 0, 0, W, H, fx, fy, zoom);
    const edge = 0.5 + panel * 0.4; // 어두운 제목영역 폭
    const gx = ctx.createLinearGradient(0, 0, W, 0);
    gx.addColorStop(0, rgba(c.deep, 0.35 + ov * 0.6));
    gx.addColorStop(edge * 0.6, rgba(c.deep, 0.12 + ov * 0.3));
    gx.addColorStop(edge, rgba(c.deep, 0));
    ctx.fillStyle = gx;
    ctx.fillRect(0, 0, W, H);
    const gy = ctx.createLinearGradient(0, H * 0.55, 0, H);
    gy.addColorStop(0, rgba(c.deep, 0));
    gy.addColorStop(1, rgba(c.deep, ov * 0.6));
    ctx.fillStyle = gy;
    ctx.fillRect(0, 0, W, H);
    drawShape(ctx, W, H, shape, lineColor);
    accentTick(ctx, W * 0.07, H * 0.2, W * 0.12, lineColor);
    return;
  }

  if (key === "sidebar") {
    ctx.fillStyle = bgGrad();
    ctx.fillRect(0, 0, W, H);
    drawShape(ctx, W, H, shape, lineColor);
    const pw = Math.round(W * (0.45 + panel * 0.4));
    const px = W - pw;
    drawCover(ctx, img, px, 0, pw, H, fx, fy, zoom);
    divider(ctx, px - tline / 2, 0, px - tline / 2, H, tline, lineColor, lineGrad);
    accentTick(ctx, W * 0.08, H * 0.2, W * 0.14, lineColor);
    return;
  }

  if (key === "bottom") {
    ctx.fillStyle = bgGrad();
    ctx.fillRect(0, 0, W, H);
    drawShape(ctx, W, H, shape, lineColor);
    const ph = Math.round(H * (0.45 + panel * 0.4));
    const py = H - ph;
    drawCover(ctx, img, 0, py, W, ph, fx, fy, zoom);
    divider(ctx, 0, py - tline / 2, W, py - tline / 2, tline, lineColor, lineGrad);
    accentTick(ctx, W * 0.08, H * 0.18, W * 0.14, lineColor);
    return;
  }

  if (key === "diagonal") {
    ctx.fillStyle = bgGrad();
    ctx.fillRect(0, 0, W, H);
    drawShape(ctx, W, H, shape, lineColor);
    const topX = W * (0.6 - panel * 0.3);
    const botX = topX - W * 0.14;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(topX, 0);
    ctx.lineTo(W, 0);
    ctx.lineTo(W, H);
    ctx.lineTo(botX, H);
    ctx.closePath();
    ctx.clip();
    drawCover(ctx, img, botX, 0, W - botX, H, fx, fy, zoom);
    ctx.restore();
    divider(ctx, topX, 0, botX, H, tline, lineColor, lineGrad);
    accentTick(ctx, W * 0.07, H * 0.2, W * 0.13, lineColor);
    return;
  }

  if (key === "card") {
    ctx.fillStyle = bgGrad();
    ctx.fillRect(0, 0, W, H);
    drawShape(ctx, W, H, shape, lineColor);
    const m = Math.round(W * (0.12 - panel * 0.07));
    const cardH = Math.round(H * (0.45 + panel * 0.3));
    const cardY = H - cardH - m;
    const cardX = m;
    const cardW = W - m * 2;
    const rad = Math.round(W * 0.012);
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.35)";
    ctx.shadowBlur = Math.round(W * 0.02);
    ctx.shadowOffsetY = Math.round(H * 0.01);
    ctx.fillStyle = "#000";
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(cardX, cardY, cardW, cardH, rad);
    else ctx.rect(cardX, cardY, cardW, cardH);
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(cardX, cardY, cardW, cardH, rad);
    else ctx.rect(cardX, cardY, cardW, cardH);
    ctx.clip();
    drawCover(ctx, img, cardX, cardY, cardW, cardH, fx, fy, zoom);
    ctx.restore();
    accentTick(ctx, cardX, cardY - H * 0.06, W * 0.14, lineColor);
    return;
  }

  if (key === "topbar") {
    drawCover(ctx, img, 0, 0, W, H, fx, fy, zoom);
    const barH = Math.round(H * (0.15 + panel * 0.22));
    ctx.fillStyle = rgba(c.deep, 0.55 + ov * 0.43);
    ctx.fillRect(0, 0, W, barH);
    drawShape(ctx, W, barH * 2, shape, lineColor);
    divider(ctx, 0, barH, W, barH, tline, lineColor, lineGrad);
    accentTick(ctx, W * 0.07, barH * 0.42, W * 0.12, lineColor);
    return;
  }
}

export default function CoverLab() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const uploadRef = useRef<HTMLImageElement | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const [hasImage, setHasImage] = useState(false);
  const [ratioKey, setRatioKey] = useState<string>("a4-landscape");
  const [template, setTemplate] = useState<string>("fullbleed");
  const [tone, setTone] = useState<string>("Auto");
  const [posX, setPosX] = useState(50);
  const [posY, setPosY] = useState(50);
  const [gradPct, setGradPct] = useState(70);
  const [zoomPct, setZoomPct] = useState(100);
  const [panelPct, setPanelPct] = useState(55);
  const [lineColor, setLineColor] = useState("#c9a24a");
  const [lineGrad, setLineGrad] = useState(false);
  const [shape, setShape] = useState("none");

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
    const colors: Colors = tone === "Auto" ? (up ? autoTone(up) : TONES.Navy) : TONES[tone];

    if (!up) {
      const g = ctx.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, rgbStr(colors.deep));
      g.addColorStop(1, rgbStr(colors.light));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      return;
    }
    render(template, ctx, W, H, up, colors, {
      fx: posX / 100,
      fy: posY / 100,
      ov: gradPct / 100,
      zoom: zoomPct / 100,
      panel: panelPct / 100,
      lineColor,
      lineGrad,
      shape,
    });
  }, [ratio, template, tone, posX, posY, gradPct, zoomPct, panelPct, lineColor, lineGrad, shape]);

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
        <h1 className="text-xl font-bold">표지 만들기</h1>
        <p className="mt-1 text-sm text-zinc-500">
          조감도를 올리고 템플릿·색·크기를 조절하세요. 모든 설정은 즉시 반영되고, 글자·로고는 넣지
          않습니다.
        </p>

        <div className="mt-6 grid gap-6 md:grid-cols-[1fr_300px]">
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
            <Row label="템플릿">
              {TEMPLATES.map((t) => (
                <Chip key={t.key} active={template === t.key} onClick={() => setTemplate(t.key)}>
                  {t.label}
                </Chip>
              ))}
            </Row>
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

            <Slider label={`사진 가로 위치 (${posX})`} value={posX} onChange={setPosX} />
            <Slider label={`사진 세로 위치 (${posY})`} value={posY} onChange={setPosY} />
            <Slider label={`사진 크기 (${zoomPct}%)`} min={100} max={250} value={zoomPct} onChange={setZoomPct} />
            <Slider label={`프레임 크기 (${panelPct})`} min={30} max={80} value={panelPct} onChange={setPanelPct} />
            <Slider label={`그라데이션 강도 (${gradPct})`} value={gradPct} onChange={setGradPct} />

            <Row label="구분선 색상">
              <input
                type="color"
                value={lineColor}
                onChange={(e) => setLineColor(e.target.value)}
                className="h-8 w-14 cursor-pointer rounded border border-zinc-200 bg-white"
              />
              <label className="flex items-center gap-1.5 text-sm text-zinc-600">
                <input
                  type="checkbox"
                  checked={lineGrad}
                  onChange={(e) => setLineGrad(e.target.checked)}
                />
                구분선 그라데이션
              </label>
            </Row>

            <Row label="배경 도형 패턴">
              {SHAPES.map((s) => (
                <Chip key={s.key} active={shape === s.key} onClick={() => setShape(s.key)}>
                  {s.label}
                </Chip>
              ))}
            </Row>

            <p className="text-xs text-zinc-400">
              어두운/빈 영역에 PPT에서 제목을 넣으세요. 액센트 선이 제목 시작 위치 가이드입니다.
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
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

function Slider({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div>
      <div className="mb-1 text-xs font-semibold text-zinc-500">{label}</div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
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
