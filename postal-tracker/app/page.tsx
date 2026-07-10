"use client";

import { useMemo, useRef, useState, type ChangeEvent } from "react";
import Link from "next/link";
import SiteFooter from "./site-footer";
import VisitorCount from "./visitor-count";
import SharePageButton from "./share-page-button";

type TrackEvent = {
  date: string;
  time: string;
  location: string;
  status: string;
  detail: string;
};

type TrackResult = {
  number: string;
  status: "성공" | "데이터없음" | "오류";
  sender: string;
  recipient: string;
  mailType: string;
  deliveryDate: string;
  deliveryStatus: string;
  lastEvent: string;
  events: TrackEvent[];
  error?: string;
};

const CHUNK = 30; // 한 번에 서버로 보내는 등기번호 수

type Category =
  | "delivered"
  | "returned"
  | "undelivered"
  | "progress"
  | "none"
  | "error";

function classify(r: TrackResult): Category {
  if (r.status === "오류") return "error";
  if (r.status === "데이터없음") return "none";
  const s = `${r.deliveryStatus} ${r.lastEvent}`;
  if (/반송|반환|수취거부/.test(s)) return "returned";
  if (/배달완료|배달됨|배송완료/.test(s)) return "delivered";
  if (/미배달|미수취|미수령/.test(s)) return "undelivered";
  // 배달 우체국에 '도착'했지만 아직 수령 전인 경우도 미수령으로 본다.
  // (○○우편집중국 '도착'은 이동 중이므로 제외)
  const last = r.events[r.events.length - 1];
  if (
    last &&
    /도착/.test(last.status) &&
    /우체국$/.test(last.location) &&
    !/집중국/.test(last.location)
  ) {
    return "undelivered";
  }
  return "progress";
}

const CAT_META: Record<
  Category,
  { label: string; badge: string; dot: string }
> = {
  delivered: {
    label: "배달완료",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  returned: {
    label: "반송",
    badge: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
  },
  undelivered: {
    label: "미수령",
    badge: "bg-orange-50 text-orange-700 border-orange-200",
    dot: "bg-orange-500",
  },
  progress: {
    label: "배송중",
    badge: "bg-sky-50 text-sky-700 border-sky-200",
    dot: "bg-sky-500",
  },
  none: {
    label: "조회안됨",
    badge: "bg-zinc-100 text-zinc-500 border-zinc-200",
    dot: "bg-zinc-400",
  },
  error: {
    label: "오류",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
};

const FILTERS: { key: "all" | Category; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "delivered", label: "배달완료" },
  { key: "returned", label: "반송" },
  { key: "undelivered", label: "미수령" },
  { key: "progress", label: "배송중" },
  { key: "none", label: "조회안됨" },
  { key: "error", label: "오류" },
];

function parseNumbers(text: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const token of text.split(/[\s,;]+/)) {
    const digits = token.replace(/[^0-9]/g, "");
    if (digits.length >= 9 && digits.length <= 15 && !seen.has(digits)) {
      seen.add(digits);
      out.push(digits);
    }
  }
  return out;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function toCsv(rows: TrackResult[]): string {
  const header = [
    "등기번호",
    "상태",
    "보내는분",
    "받는분",
    "우편물종류",
    "배달일자",
    "배달상태",
    "최종처리현황",
  ];
  const esc = (v: string) => `"${(v ?? "").replace(/"/g, '""')}"`;
  const lines = rows.map((r) =>
    [
      r.number,
      CAT_META[classify(r)].label,
      r.sender,
      r.recipient,
      r.mailType,
      r.deliveryDate,
      r.deliveryStatus,
      r.lastEvent || (r.error ?? ""),
    ]
      .map(esc)
      .join(",")
  );
  // 엑셀 한글 깨짐 방지용 BOM
  return "﻿" + [header.join(","), ...lines].join("\r\n");
}

export default function Home() {
  const [text, setText] = useState("");
  const [results, setResults] = useState<TrackResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(
    null
  );
  const [ocrLoading, setOcrLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [filter, setFilter] = useState<"all" | Category>("all");
  const fileRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLInputElement>(null);

  const parsed = useMemo(() => parseNumbers(text), [text]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {
      all: results.length,
      delivered: 0,
      returned: 0,
      undelivered: 0,
      progress: 0,
      none: 0,
      error: 0,
    };
    for (const r of results) c[classify(r)]++;
    return c;
  }, [results]);

  const shown = useMemo(
    () => (filter === "all" ? results : results.filter((r) => classify(r) === filter)),
    [results, filter]
  );

  async function runTrack() {
    setError("");
    setNotice("");
    const numbers = parseNumbers(text);
    if (numbers.length === 0) {
      setError("등기번호를 한 줄에 하나씩 붙여넣거나 접수증 사진을 올려 주세요.");
      return;
    }
    setLoading(true);
    setResults([]);
    setFilter("all");
    setProgress({ done: 0, total: numbers.length });

    const acc: TrackResult[] = [];
    let mockSeen = false;
    try {
      for (let i = 0; i < numbers.length; i += CHUNK) {
        const chunk = numbers.slice(i, i + CHUNK);
        const res = await fetch("/api/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ numbers: chunk }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "조회 중 오류가 발생했습니다.");
          break;
        }
        if (data.mock) mockSeen = true;
        acc.push(...(data.results as TrackResult[]));
        setResults([...acc]);
        setProgress({ done: Math.min(i + CHUNK, numbers.length), total: numbers.length });
      }
      if (mockSeen) {
        setNotice(
          "데모 데이터로 표시 중입니다. 배포 후 우체국 서비스키(POSTAL_API_KEY)를 설정하면 실제 배송상태가 조회됩니다."
        );
      }
    } catch {
      setError("네트워크 오류로 조회를 완료하지 못했습니다.");
    } finally {
      setLoading(false);
      setProgress(null);
    }
  }

  async function onCsvFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const content = await file.text();
    const nums = parseNumbers(content);
    if (nums.length === 0) {
      setError("파일에서 등기번호를 찾지 못했습니다.");
      return;
    }
    setError("");
    setText((prev) => mergeText(prev, nums));
    setNotice(`파일에서 등기번호 ${nums.length}건을 불러왔습니다.`);
  }

  async function onImage(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    setError("");
    setNotice("");
    setOcrLoading(true);
    try {
      const found: string[] = [];
      for (const file of files) {
        const dataUrl = await fileToDataUrl(file);
        const res = await fetch("/api/ocr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: dataUrl }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "이미지 분석에 실패했습니다.");
          continue;
        }
        found.push(...(data.numbers as string[]));
      }
      if (found.length === 0) {
        setError("사진에서 등기번호를 찾지 못했습니다. 더 선명한 사진을 사용해 보세요.");
      } else {
        setText((prev) => mergeText(prev, found));
        setNotice(`접수증에서 등기번호 ${found.length}건을 인식했습니다. 확인 후 조회하세요.`);
      }
    } catch {
      setError("이미지 분석 중 오류가 발생했습니다.");
    } finally {
      setOcrLoading(false);
    }
  }

  function mergeText(prev: string, add: string[]): string {
    const existing = parseNumbers(prev);
    const merged = parseNumbers([...existing, ...add].join("\n"));
    return merged.join("\n");
  }

  function downloadCsv() {
    const blob = new Blob([toCsv(results)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
    a.href = url;
    a.download = `등기조회_${stamp}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="mx-auto w-full max-w-3xl grow px-4 py-8 sm:py-12">
      <header className="mb-6 text-center">
        <h1 className="text-2xl font-black tracking-tight text-zinc-900 sm:text-3xl">
          📮 등기조회 · 대량 일괄 배송조회
        </h1>
        <p className="mt-2 text-sm text-zinc-500 sm:text-base">
          등기번호를 붙여넣거나 <b>접수증 사진</b>을 올리면 우체국 배송상태를 한 번에
          조회합니다. 등기 <b>대량조회·일괄조회</b>로 배달완료·반송·미수령을 표로 정리하고
          CSV로 내려받으세요.
        </p>
      </header>

      <VisitorCount />

      {/* 입력 카드 */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => imgRef.current?.click()}
            disabled={ocrLoading}
            className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-50"
          >
            {ocrLoading ? "인식 중…" : "📷 접수증 사진으로 불러오기"}
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 px-3.5 py-2 text-sm font-semibold text-zinc-700 transition hover:border-zinc-300"
          >
            📄 CSV·TXT 불러오기
          </button>
          {parsed.length > 0 && (
            <span className="ml-auto text-xs font-semibold text-sky-600">
              인식된 등기번호 {parsed.length}건
            </span>
          )}
          <input
            ref={imgRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={onImage}
          />
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.txt,text/csv,text/plain"
            hidden
            onChange={onCsvFile}
          />
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          placeholder={"등기번호를 한 줄에 하나씩 붙여넣으세요.\n예)\n1234567890123\n6045012345678"}
          className="w-full resize-y rounded-xl border border-zinc-200 bg-zinc-50 p-3 font-mono text-sm text-zinc-800 outline-none focus:border-sky-400 focus:bg-white"
        />

        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={runTrack}
            disabled={loading || parsed.length === 0}
            className="inline-flex grow items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50 sm:grow-0 sm:px-6"
          >
            {loading
              ? progress
                ? `조회 중… ${progress.done}/${progress.total}`
                : "조회 중…"
              : `배송상태 조회하기${parsed.length ? ` (${parsed.length}건)` : ""}`}
          </button>
          {text && (
            <button
              type="button"
              onClick={() => {
                setText("");
                setResults([]);
                setError("");
                setNotice("");
              }}
              className="rounded-xl px-3 py-3 text-sm font-medium text-zinc-400 transition hover:text-zinc-600"
            >
              지우기
            </button>
          )}
        </div>

        {loading && progress && (
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
            <div
              className="h-full rounded-full bg-sky-500 transition-all"
              style={{ width: `${(progress.done / progress.total) * 100}%` }}
            />
          </div>
        )}

        {error && (
          <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
            {error}
          </p>
        )}
        {notice && !error && (
          <p className="mt-3 rounded-lg bg-sky-50 px-3 py-2 text-sm text-sky-700">
            {notice}
          </p>
        )}
      </section>

      {/* 결과 */}
      {results.length > 0 && (
        <section className="mt-6">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {FILTERS.map((f) => {
              const n = counts[f.key] ?? 0;
              if (f.key !== "all" && n === 0) return null;
              const active = filter === f.key;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    active
                      ? "border-sky-500 bg-sky-500 text-white"
                      : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
                  }`}
                >
                  {f.label} {n}
                </button>
              );
            })}
            <button
              type="button"
              onClick={downloadCsv}
              className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-500"
            >
              ⬇ CSV 저장
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-xs font-semibold text-zinc-500">
                  <th className="px-3 py-2.5">상태</th>
                  <th className="px-3 py-2.5">등기번호</th>
                  <th className="px-3 py-2.5">받는분</th>
                  <th className="px-3 py-2.5">보내는분</th>
                  <th className="px-3 py-2.5">배달일자</th>
                  <th className="px-3 py-2.5">최종처리현황</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((r, i) => {
                  const meta = CAT_META[classify(r)];
                  return (
                    <tr
                      key={`${r.number}-${i}`}
                      className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/60"
                    >
                      <td className="px-3 py-2.5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-semibold ${meta.badge}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                          {meta.label}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 font-mono text-zinc-700">
                        {r.number}
                      </td>
                      <td className="px-3 py-2.5 text-zinc-700">{r.recipient || "-"}</td>
                      <td className="px-3 py-2.5 text-zinc-500">{r.sender || "-"}</td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-zinc-500">
                        {r.deliveryDate || "-"}
                      </td>
                      <td className="px-3 py-2.5 text-zinc-500">
                        {r.lastEvent || r.error || "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* 안내 문단 (SEO/애드센스용 원본 콘텐츠) */}
      <section className="mt-10 space-y-3 text-sm leading-relaxed text-zinc-600">
        <h2 className="text-base font-bold text-zinc-800">
          등기 대량조회 · 일괄조회, 이렇게 쓰세요
        </h2>
        <p>
          우편물을 대량으로 발송하면 접수증(영수증)에 등기번호가 여러 건 찍혀 나옵니다.
          한 건씩 우체국 홈페이지에서 등기번호를 조회하는 대신, 접수증 사진을 올리면
          등기번호를 자동으로 읽어 <b>여러 건을 한 번에</b> 조회합니다. 배달완료·반송·
          <b>미수령</b>·배송중 상태를 정리해 CSV(발송대장)로 저장할 수 있습니다.
        </p>
        <p className="text-zinc-500">
          등기우편 대량조회가 필요한 분양·법무·관리사무소 등 실무에 특히 유용합니다. 등기
          반송·미수령 건만 골라 재발송을 관리하세요. 조회는 우정사업본부 공식 오픈API를
          사용합니다.
        </p>
      </section>

      {/* 가이드 링크 (내부 링크 + 콘텐츠) */}
      <section className="mt-8">
        <h2 className="mb-3 text-base font-bold text-zinc-800">등기우편 가이드</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            { href: "/guide/track-methods", label: "우체국 등기 배송조회 3가지 방법" },
            { href: "/guide/excel-bulk", label: "등기 여러 건 엑셀로 한 번에 조회" },
            { href: "/guide/undelivered", label: "등기 미수령·미배달 확인·대처" },
            { href: "/guide/how-to-track", label: "등기번호로 배송조회 하는 법" },
            { href: "/guide/returned", label: "등기 반송 사유와 대처법" },
            { href: "/guide/bulk-send", label: "대량 등기 발송 방법과 준비물" },
          ].map((g) => (
            <Link
              key={g.href}
              href={g.href}
              className="rounded-xl border border-zinc-100 bg-white px-4 py-3 text-sm font-medium text-zinc-700 shadow-sm transition hover:border-sky-200 hover:text-sky-700"
            >
              {g.label} →
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-8 flex justify-center">
        <SharePageButton />
      </div>
      <footer className="mt-6 border-t border-zinc-100 pt-6 text-center text-xs text-zinc-400">
        <SiteFooter />
      </footer>
    </main>
  );
}
