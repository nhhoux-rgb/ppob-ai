/* 여러 화면이 같이 쓰는 조각들. */

import { Device } from "@apps-in-toss/web-framework";

/** 토스 앱 밖(브라우저 개발 중)에서는 네이티브 API가 없으므로 조용히 넘어간다. */
export async function haptic(type: "tap" | "success" | "error") {
  try {
    await Device.triggerHaptic({ type });
  } catch {
    // 토스 앱이 아니면 통과
  }
}

export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="seg">
      {options.map((o) => (
        <button
          key={String(o.value)}
          className={`seg-item${o.value === value ? " on" : ""}`}
          onClick={() => {
            if (o.value !== value) haptic("tap");
            onChange(o.value);
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Stepper({
  value,
  min = 0,
  max = 9,
  onChange,
}: {
  value: number;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
}) {
  const step = (d: number) => {
    const next = Math.min(max, Math.max(min, value + d));
    if (next === value) return;
    haptic("tap");
    onChange(next);
  };
  return (
    <div className="stepper">
      <button className="step-btn" onClick={() => step(-1)} disabled={value <= min} aria-label="줄이기">
        −
      </button>
      <span className="step-val">{value}</span>
      <button className="step-btn" onClick={() => step(1)} disabled={value >= max} aria-label="늘리기">
        +
      </button>
    </div>
  );
}

/** 라운드별 18홀 환산 타수를 잇는 작은 꺾은선. 값이 둘 미만이면 그리지 않는다. */
export function Spark({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const w = 300;
  const h = 64;
  const pad = 6;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const x = (i: number) => pad + (i * (w - pad * 2)) / (values.length - 1);
  const y = (v: number) => pad + ((max - v) * (h - pad * 2)) / span;
  const points = values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  return (
    <svg className="spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
      <polyline className="spark-line" points={points} />
      {values.map((v, i) => (
        <circle
          key={i}
          className={`spark-dot${i === values.length - 1 ? " last" : ""}`}
          cx={x(i)}
          cy={y(v)}
          r={i === values.length - 1 ? 4 : 2.5}
        />
      ))}
    </svg>
  );
}
