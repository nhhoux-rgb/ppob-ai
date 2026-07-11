"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import SiteFooter from "./site-footer";
import VisitorCount from "./visitor-count";
import SharePageButton from "./share-page-button";
import { BRANDS, TIER_BY_KEY, BRAND_BY_KEY, type BrandKey, type Shoe } from "./shoes";
import {
  recommend,
  BUDGETS,
  type Purpose,
  type RaceDist,
  type Level,
  type Stability,
  type BudgetKey,
  type Reco,
} from "./recommend";
import { ShoeThumb, ShoeModal, BADGE_DOT } from "./shoe-ui";

const PURPOSES: { key: Purpose; label: string; sub: string }[] = [
  { key: "daily", label: "데일리", sub: "조깅·러닝" },
  { key: "training", label: "트레이닝", sub: "훈련·템포런" },
  { key: "race", label: "대회", sub: "기록 도전" },
];
const RACE_DISTS: { key: RaceDist; label: string }[] = [
  { key: "10k", label: "10K" },
  { key: "half", label: "하프" },
  { key: "full", label: "풀코스" },
];
const LEVELS: { key: Level; label: string; sub: string }[] = [
  { key: "beginner", label: "입문", sub: "1년 미만" },
  { key: "intermediate", label: "중급", sub: "1~3년" },
  { key: "advanced", label: "고급", sub: "3년+" },
];
const STABILITIES: { key: Stability; label: string; sub: string }[] = [
  { key: "neutral", label: "보통", sub: "중립발" },
  { key: "support", label: "안정화 필요", sub: "과내전" },
];

export default function Home() {
  const [purpose, setPurpose] = useState<Purpose>("daily");
  const [raceDist, setRaceDist] = useState<RaceDist>("half");
  const [level, setLevel] = useState<Level>("beginner");
  const [stability, setStability] = useState<Stability>("neutral");
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");
  const [budget, setBudget] = useState<BudgetKey>("any");
  const [brands, setBrands] = useState<BrandKey[]>([]);
  const [results, setResults] = useState<Reco[] | null>(null);
  const [selected, setSelected] = useState<Shoe | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  function toggleBrand(key: BrandKey) {
    setBrands((prev) =>
      prev.includes(key) ? prev.filter((b) => b !== key) : [...prev, key],
    );
  }

  function onSubmit() {
    const recos = recommend(
      {
        age: age ? Number(age) : undefined,
        weight: weight ? Number(weight) : undefined,
        purpose,
        raceDist: purpose === "race" ? raceDist : undefined,
        level,
        stability,
        budget,
        brands,
      },
      3,
    );
    setResults(recos);
    // 결과로 부드럽게 스크롤
    requestAnimationFrame(() =>
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 py-8">
      <VisitorCount />

      <header className="text-center">
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl">
          러닝화 추천
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
          몇 가지만 고르면 나에게 맞는 러닝화를 골라드려요. 참고가와 구매 링크까지
          한 번에.
        </p>
        <div className="mt-3 flex justify-center">
          <SharePageButton />
        </div>
      </header>

      {/* 입력 폼 */}
      <div className="mt-6 space-y-5 rounded-3xl border border-zinc-100 bg-white p-5 shadow-sm">
        <Field label="구매 목적">
          <Segmented options={PURPOSES} value={purpose} onChange={setPurpose} />
          {purpose === "race" && (
            <div className="mt-2">
              <Segmented
                options={RACE_DISTS}
                value={raceDist}
                onChange={setRaceDist}
                small
              />
            </div>
          )}
        </Field>

        <Field label="러닝 경력">
          <Segmented options={LEVELS} value={level} onChange={setLevel} />
        </Field>

        <Field label="발 안정성" hint="발이 안쪽으로 무너지면 '안정화 필요'">
          <Segmented
            options={STABILITIES}
            value={stability}
            onChange={setStability}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="몸무게" hint="선택">
            <NumberInput
              value={weight}
              onChange={setWeight}
              placeholder="예: 70"
              unit="kg"
            />
          </Field>
          <Field label="나이" hint="선택">
            <NumberInput
              value={age}
              onChange={setAge}
              placeholder="예: 30"
              unit="세"
            />
          </Field>
        </div>

        <Field label="예산">
          <div className="grid grid-cols-3 gap-1.5">
            {BUDGETS.map((b) => (
              <button
                key={b.key}
                type="button"
                onClick={() => setBudget(b.key)}
                className={`rounded-xl px-2 py-2 text-xs font-semibold transition ${
                  budget === b.key
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label="선호 브랜드" hint="복수 선택 · 없으면 전체">
          <div className="flex flex-wrap gap-1.5">
            {BRANDS.map((b) => {
              const on = brands.includes(b.key);
              return (
                <button
                  key={b.key}
                  type="button"
                  onClick={() => toggleBrand(b.key)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    on
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  }`}
                >
                  {b.name}
                </button>
              );
            })}
          </div>
        </Field>

        <button
          type="button"
          onClick={onSubmit}
          className="w-full rounded-2xl bg-indigo-600 px-4 py-4 text-base font-bold text-white transition hover:bg-indigo-700 active:scale-[0.99]"
        >
          추천받기
        </button>
      </div>

      {/* 결과 */}
      <div ref={resultRef} className="scroll-mt-4">
        {results && (
          <section className="mt-8">
            <h2 className="text-center text-lg font-extrabold text-zinc-900">
              추천 러닝화 {results.length}선
            </h2>
            <p className="mt-1 text-center text-xs text-zinc-400">
              입력하신 조건에 맞춰 골랐어요. 눌러서 참고가·구매 링크를 확인하세요.
            </p>

            <div className="mt-4 space-y-3">
              {results.map((r, i) => (
                <RecoCard
                  key={r.shoe.id}
                  reco={r}
                  rank={i + 1}
                  onClick={() => setSelected(r.shoe)}
                />
              ))}
            </div>

            <p className="mt-5 text-center text-sm text-zinc-500">
              더 많은 모델이 궁금하다면{" "}
              <Link
                href="/tier"
                className="font-semibold text-indigo-600 underline underline-offset-2"
              >
                러닝화 계급도
              </Link>
              에서 전체를 확인하세요.
            </p>
          </section>
        )}
      </div>

      {!results && (
        <div className="mt-8 rounded-2xl bg-indigo-50 px-5 py-4 text-center">
          <p className="text-sm font-semibold text-indigo-900">
            브랜드별 전체 러닝화가 궁금하세요?
          </p>
          <Link
            href="/tier"
            className="mt-2 inline-block text-sm font-bold text-indigo-600 underline underline-offset-2"
          >
            러닝화 계급도 보기 →
          </Link>
        </div>
      )}

      <div className="mt-auto pt-10">
        <SiteFooter />
      </div>

      {selected && (
        <ShoeModal shoe={selected} onClose={() => setSelected(null)} />
      )}
    </main>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline gap-2">
        <span className="text-sm font-bold text-zinc-800">{label}</span>
        {hint && <span className="text-[11px] text-zinc-400">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
  small,
}: {
  options: { key: T; label: string; sub?: string }[];
  value: T;
  onChange: (v: T) => void;
  small?: boolean;
}) {
  return (
    <div
      className="grid gap-1.5 rounded-2xl bg-zinc-100 p-1.5"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          onClick={() => onChange(o.key)}
          className={`rounded-xl transition ${small ? "py-2" : "py-2.5"} ${
            value === o.key
              ? "bg-white text-indigo-600 shadow-sm"
              : "text-zinc-500 hover:text-zinc-700"
          }`}
        >
          <span className="block text-sm font-bold">{o.label}</span>
          {o.sub && (
            <span className="mt-0.5 block text-[10px] font-medium opacity-70">
              {o.sub}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

function NumberInput({
  value,
  onChange,
  placeholder,
  unit,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  unit: string;
}) {
  return (
    <div className="flex items-center rounded-xl border border-zinc-300 bg-white focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100">
      <input
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, ""))}
        placeholder={placeholder}
        className="w-full rounded-xl bg-transparent px-3 py-2.5 text-right text-base font-semibold tabular-nums outline-none"
      />
      <span className="pr-3 text-sm font-medium text-zinc-400">{unit}</span>
    </div>
  );
}

function RecoCard({
  reco,
  rank,
  onClick,
}: {
  reco: Reco;
  rank: number;
  onClick: () => void;
}) {
  const { shoe, reasons } = reco;
  const brand = BRAND_BY_KEY[shoe.brand];
  const tier = TIER_BY_KEY[shoe.tier];
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-3 text-left transition hover:border-indigo-300 hover:shadow-md active:scale-[0.99]"
    >
      <div className="relative shrink-0">
        <ShoeThumb shoe={shoe} className="h-16 w-16 rounded-2xl" />
        <span className="absolute -left-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-extrabold text-white shadow">
          {rank}
        </span>
        {shoe.badges.length > 0 && (
          <span className="absolute -right-1 -top-1 flex gap-0.5 rounded-full bg-white/95 px-0.5 py-px shadow-sm ring-1 ring-black/5">
            {shoe.badges.map((b) => (
              <span key={b} className={`h-1.5 w-1.5 rounded-full ${BADGE_DOT[b]}`} />
            ))}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold text-indigo-600">
          {brand.name} · {tier.name}
        </p>
        <p className="truncate text-base font-bold text-zinc-900 group-hover:text-indigo-700">
          {shoe.name}
        </p>
        <p className="mt-0.5 text-xs font-medium text-zinc-500">
          {tier.priceBand}
        </p>
        {reasons.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {reasons.map((rz) => (
              <span
                key={rz}
                className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-600"
              >
                {rz}
              </span>
            ))}
          </div>
        )}
      </div>

      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5 shrink-0 text-zinc-300 group-hover:text-indigo-500"
        aria-hidden="true"
      >
        <path d="m9 18 6-6-6-6" />
      </svg>
    </button>
  );
}
