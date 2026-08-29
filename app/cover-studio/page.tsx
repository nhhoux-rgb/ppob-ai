"use client";

import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";

// ─────────────────────────────────────────────────────────────────────────
// 코드 합성 방식 표지 스튜디오 (AI 미사용, 전부 브라우저 canvas)
//
// AI 생성(/cover-lab)과 달리 여기서는 결과가 100% 결정론적이다:
//  - 조감도를 지정한 위치/크기에 정확히 배치 (위 가장자리는 부드럽게 그라데이션 블렌딩)
//  - 그라데이션 하늘, 곡선 리본, 하프톤 점, 물결 메시선을 코드로 정확히 그림
//  - 슬라이더를 움직이면 즉시 다시 그려지고, 텍스트/로고는 애초에 존재하지 않음
//  - 생성 비용 0
// ─────────────────────────────────────────────────────────────────────────

const RATIOS = [
  { key: "a4-landscape", label: "A4 가로", w: 1600, h: 1131 },
  { key: "16:9", label: "16:9 PPT", w: 1600, h: 900 },
  { key: "a4-portrait", label: "A4 세로", w: 1131, h: 1600 },
] as const;

// [진한색, 밝은색] 2단 그라데이션.
const TONE_STOPS: Record<string, [string, string]> = {
  Navy: ["#0b2545", "#9db8d6"],
  Blue: ["#0f4c8a", "#dbeafe"],
  Black: ["#0a0a0a", "#4a4f57"],
  White: ["#c9d8ef", "#ffffff"],
  Gold: ["#161007", "#d9b45a"],
  Green: ["#0e3b30", "#9cc7b8"],
  Gray: ["#2f343b", "#d3d9e0"],
};
const TONES = Object.keys(TONE_STOPS);

const GRADIENTS = [
  { key: "top-dark", label: "위쪽 진하게" },
  { key: "bottom-dark", label: "아래쪽 진하게" },
  { key: "diagonal", label: "대각선" },
  { key: "radial", label: "가운데 밝게" },
] as const;

// 장식 요소들 — 각각 독립적으로 켜고 끌 수 있다.
const DECO_ELEMENTS = [
  { key: "ribbons", label: "곡선 리본" },
  { key: "dots", label: "하프톤 점" },
  { key: "waves", label: "물결선" },
  { key: "grid", label: "라인 그리드" },
  { key: "rays", label: "대각 빛줄기" },
] as const;

type DecoKey = (typeof DECO_ELEMENTS)[number]["key"];

type State = {
  ratioKey: string;
  tone: string;
  gradient: string;
  posX: number; // 건물 가로 위치 0~100 (중심)
  posY: number; // 건물 세로 위치, 하단 기준 위로 올리는 정도 0~40
  size: number; // 건물 너비 비율 30~100
  feather: number; // 위/옆 가장자리 블렌딩 정도 0~60
  deco: Record<DecoKey, boolean>; // 장식 요소별 on/off
};

export default function CoverStudio() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [hasImage, setHasImage] = useState(false);

  const [s, setS] = useState<State>({
    ratioKey: "a4-landscape",
    tone: "Navy",
    gradient: "top-dark",
    posX: 30,
    posY: 0,
    size: 70,
    feather: 30,
    deco: { ribbons: true, dots: true, waves: true, grid: false, rays: false },
  });

  const set = <K extends keyof State>(k: K, v: State[K]) => setS((p) => ({ ...p, [k]: v }));
  const toggleDeco = (k: DecoKey) =>
    setS((p) => ({ ...p, deco: { ...p.deco, [k]: !p.deco[k] } }));

  const ratio = RATIOS.find((r) => r.key === s.ratioKey) ?? RATIOS[0];

  // ── 그리기 ──────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = ratio.w;
    const H = ratio.h;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const [deep, light] = TONE_STOPS[s.tone];

    // 1) 그라데이션 배경
    let grad: CanvasGradient;
    if (s.gradient === "radial") {
      grad = ctx.createRadialGradient(W * 0.5, H * 0.55, H * 0.05, W * 0.5, H * 0.55, H * 0.9);
      grad.addColorStop(0, light);
      grad.addColorStop(1, deep);
    } else if (s.gradient === "diagonal") {
      grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, deep);
      grad.addColorStop(1, light);
    } else if (s.gradient === "bottom-dark") {
      grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, light);
      grad.addColorStop(1, deep);
    } else {
      grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, deep);
      grad.addColorStop(1, light);
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // 2) 조감도 배치 (위/옆 가장자리를 페더링해 그라데이션에 녹임)
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth) {
      const bw = (W * s.size) / 100;
      const bh = (bw * img.naturalHeight) / img.naturalWidth;
      const cx = (W * s.posX) / 100;
      const x = Math.round(cx - bw / 2);
      const y = Math.round(H - bh - (H * s.posY) / 100);

      // 오프스크린에 그린 뒤 알파 마스크로 가장자리 페더링
      const off = document.createElement("canvas");
      off.width = Math.max(1, Math.round(bw));
      off.height = Math.max(1, Math.round(bh));
      const octx = off.getContext("2d");
      if (octx) {
        octx.drawImage(img, 0, 0, off.width, off.height);
        const f = s.feather / 100;
        octx.globalCompositeOperation = "destination-in";
        // 위쪽 페더
        const topFade = octx.createLinearGradient(0, 0, 0, off.height);
        topFade.addColorStop(0, "rgba(0,0,0,0)");
        topFade.addColorStop(Math.min(0.9, f * 1.6), "rgba(0,0,0,1)");
        octx.fillStyle = topFade;
        octx.fillRect(0, 0, off.width, off.height);
        // 좌우 페더 (약하게)
        const sideFade = octx.createLinearGradient(0, 0, off.width, 0);
        const sf = Math.min(0.35, f * 0.6);
        sideFade.addColorStop(0, "rgba(0,0,0,0)");
        sideFade.addColorStop(sf, "rgba(0,0,0,1)");
        sideFade.addColorStop(1 - sf, "rgba(0,0,0,1)");
        sideFade.addColorStop(1, "rgba(0,0,0,0)");
        octx.fillStyle = sideFade;
        octx.fillRect(0, 0, off.width, off.height);
        octx.globalCompositeOperation = "source-over";
        ctx.drawImage(off, x, y);
      }
    }

    // 3) 장식 요소 (각각 독립적으로 on/off)
    const lightTone = s.tone === "White";
    const stroke = (a: number) =>
      lightTone ? `rgba(40,80,150,${a})` : `rgba(255,255,255,${a})`;
    const fill = (a: number) =>
      lightTone ? `rgba(40,80,150,${a})` : `rgba(255,255,255,${a})`;

    // 3a) 좌상단 곡선 리본
    if (s.deco.ribbons) {
      ctx.save();
      ctx.lineWidth = Math.max(1, W / 900);
      for (let i = 0; i < 5; i++) {
        ctx.strokeStyle = stroke(0.18 - i * 0.02);
        ctx.beginPath();
        const off = i * (H * 0.04);
        ctx.moveTo(-W * 0.1, H * 0.05 + off);
        ctx.bezierCurveTo(W * 0.2, H * 0.3 + off, W * 0.35, -H * 0.05 + off, W * 0.75, H * 0.18 + off);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 3b) 우상단 하프톤 점
    if (s.deco.dots) {
      ctx.save();
      const cols = 16;
      const rows = 8;
      const gap = W * 0.018;
      const startX = W - cols * gap - W * 0.03;
      const startY = H * 0.04;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const t = c / cols; // 오른쪽으로 갈수록 커지고 진해짐
          const rad = (W / 900) * (0.6 + t * 2.2);
          ctx.fillStyle = fill(0.05 + t * 0.22);
          ctx.beginPath();
          ctx.arc(startX + c * gap, startY + r * gap, rad, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }

    // 3c) 우하단 물결 메시선
    if (s.deco.waves) {
      ctx.save();
      ctx.lineWidth = Math.max(0.6, W / 1600);
      for (let i = 0; i < 14; i++) {
        ctx.strokeStyle = stroke(0.14 - i * 0.008);
        ctx.beginPath();
        const baseY = H * 0.78 + i * (H * 0.02);
        ctx.moveTo(W * 0.55, baseY);
        for (let px = W * 0.55; px <= W; px += W * 0.02) {
          const yy = baseY + Math.sin((px / W) * Math.PI * 6 + i * 0.4) * (H * 0.02);
          ctx.lineTo(px, yy);
        }
        ctx.stroke();
      }
      ctx.restore();
    }

    // 3d) 은은한 라인 그리드 (전체)
    if (s.deco.grid) {
      ctx.save();
      ctx.lineWidth = Math.max(0.5, W / 2200);
      ctx.strokeStyle = stroke(0.06);
      const step = W * 0.05;
      for (let x = step; x < W; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = step; y < H; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 3e) 대각 빛줄기
    if (s.deco.rays) {
      ctx.save();
      for (let i = 0; i < 5; i++) {
        const bw = W * (0.06 + i * 0.015);
        const x0 = -W * 0.1 + i * (W * 0.14);
        ctx.fillStyle = fill(0.05 - i * 0.006);
        ctx.beginPath();
        ctx.moveTo(x0, 0);
        ctx.lineTo(x0 + bw, 0);
        ctx.lineTo(x0 + bw + W * 0.35, H);
        ctx.lineTo(x0 + W * 0.35, H);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }
  }, [ratio, s]);

  useEffect(() => {
    draw();
  }, [draw]);

  function handleImage(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        imgRef.current = img;
        setHasImage(true);
        draw();
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.download = "cover-studio.png";
    a.href = canvas.toDataURL("image/png");
    a.click();
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 antialiased">
      <main className="mx-auto w-full max-w-5xl px-5 py-8">
        <h1 className="text-xl font-bold">표지 스튜디오 · 코드 합성 (AI 미사용)</h1>
        <p className="mt-1 text-sm text-zinc-500">
          조감도를 올리고 슬라이더로 위치·크기·그라데이션을 조절하세요. 움직이는 즉시 반영되고,
          항상 선명하며 텍스트가 들어가지 않습니다.
        </p>

        <div className="mt-6 grid gap-6 md:grid-cols-[1fr_300px]">
          {/* 미리보기 */}
          <div>
            <button
              onClick={() => fileRef.current?.click()}
              className="mb-3 w-full rounded-xl border-2 border-dashed border-zinc-300 bg-white py-4 text-sm font-medium text-zinc-600 hover:border-violet-400 hover:text-violet-600"
            >
              {hasImage ? "다른 조감도로 변경" : "조감도 이미지 올리기 (JPG/PNG/WEBP)"}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleImage}
            />
            <div className="relative overflow-hidden rounded-lg border bg-white">
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

          {/* 컨트롤 */}
          <div className="space-y-4">
            <Row label="비율">
              {RATIOS.map((r) => (
                <Chip key={r.key} active={s.ratioKey === r.key} onClick={() => set("ratioKey", r.key)}>
                  {r.label}
                </Chip>
              ))}
            </Row>
            <Row label="컬러톤">
              {TONES.map((t) => (
                <Chip key={t} active={s.tone === t} onClick={() => set("tone", t)}>
                  {t}
                </Chip>
              ))}
            </Row>
            <Row label="그라데이션">
              {GRADIENTS.map((g) => (
                <Chip key={g.key} active={s.gradient === g.key} onClick={() => set("gradient", g.key)}>
                  {g.label}
                </Chip>
              ))}
            </Row>
            <Slider label={`건물 가로 위치 (${s.posX})`} min={0} max={100} value={s.posX} onChange={(v) => set("posX", v)} />
            <Slider label={`건물 높이 올림 (${s.posY})`} min={0} max={40} value={s.posY} onChange={(v) => set("posY", v)} />
            <Slider label={`건물 크기 (${s.size})`} min={30} max={100} value={s.size} onChange={(v) => set("size", v)} />
            <Slider label={`가장자리 블렌딩 (${s.feather})`} min={0} max={60} value={s.feather} onChange={(v) => set("feather", v)} />
            <Row label="장식 요소 (자유 조합)">
              {DECO_ELEMENTS.map((d) => (
                <Chip key={d.key} active={s.deco[d.key]} onClick={() => toggleDeco(d.key)}>
                  {d.label}
                </Chip>
              ))}
            </Row>
          </div>
        </div>

        <p className="mt-6 text-xs text-zinc-400">
          참고: 조감도의 원래 배경(하늘 등)은 위/옆 &quot;블렌딩&quot;으로 흐려 녹입니다. 배경을 완전히
          제거해 건물만 오려 붙이는 기능은 정식 버전에서 추가할 수 있습니다.
        </p>
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

function Slider({
  label,
  min,
  max,
  value,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (v: number) => void;
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
