"use client";

import { useMemo, useRef, useState, type ChangeEvent } from "react";
import SiteFooter from "./site-footer";
import VisitorCount from "./visitor-count";
import SharePageButton from "./share-page-button";
import SaveImageButton from "./save-image-button";
import SummaryCard, { type Clip } from "./summary-card";

type Mode = "url" | "paste";

// 로고 기억 키: 도메인이 있으면 도메인 기준, 없으면 언론사명 기준
function logoKey(domain: string, press: string): string {
  return domain ? `logo:dom:${domain}` : `logo:name:${press.trim()}`;
}

function loadRememberedLogo(domain: string, press: string): string | null {
  try {
    return localStorage.getItem(logoKey(domain, press));
  } catch {
    return null;
  }
}

function saveRememberedLogo(domain: string, press: string, dataUrl: string) {
  try {
    localStorage.setItem(logoKey(domain, press), dataUrl);
  } catch {
    // localStorage 차단 환경 — 무시
  }
}

function forgetLogo(domain: string, press: string) {
  try {
    localStorage.removeItem(logoKey(domain, press));
  } catch {
    // 무시
  }
}

export default function Home() {
  const [mode, setMode] = useState<Mode>("url");
  const [urlInput, setUrlInput] = useState("");
  const [pasteInput, setPasteInput] = useState("");

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const [clip, setClip] = useState<Clip | null>(null);
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [domain, setDomain] = useState("");
  const [remember, setRemember] = useState(true);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLElement>(null);

  function update<K extends keyof Clip>(key: K, value: Clip[K]) {
    setClip((c) => (c ? { ...c, [key]: value } : c));
  }

  async function generate() {
    setLoading(true);
    setError("");
    setStatus("");
    setClip(null);

    try {
      let text = "";
      let pressHint = "";
      let dateHint = "";
      let titleHint = "";
      let dom = "";
      let detectedLogo: string | null = null;

      if (mode === "url") {
        if (!urlInput.trim()) {
          setError("기사 링크를 입력해 주세요.");
          setLoading(false);
          return;
        }
        setStatus("기사를 불러오는 중...");
        const exRes = await fetch("/api/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: urlInput.trim() }),
        });
        const ex = await exRes.json();
        if (!exRes.ok) throw new Error(ex.error || "기사 불러오기 실패");
        if (ex.fallback) {
          // 페이지 접근이 막힌 경우: 붙여넣기 모드로 전환 유도
          setMode("paste");
          setError(ex.error);
          setLoading(false);
          return;
        }
        text = ex.bodyText || "";
        pressHint = ex.press || "";
        dateHint = ex.date || "";
        titleHint = ex.title || "";
        dom = ex.domain || "";
        detectedLogo = ex.logoDataUrl || null;
      } else {
        if (pasteInput.trim().replace(/\s/g, "").length < 30) {
          setError("요약할 기사 본문을 붙여넣어 주세요.");
          setLoading(false);
          return;
        }
        text = pasteInput.trim();
      }

      setStatus("AI가 요약하는 중...");
      const sumRes = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, pressHint, dateHint, titleHint }),
      });
      const sum = await sumRes.json();
      if (!sumRes.ok) throw new Error(sum.error || "요약 실패");

      const nextClip: Clip = {
        press: sum.press || pressHint || "",
        date: sum.date || dateHint || "",
        headline: sum.headline || titleHint || "",
        subheadlines: Array.isArray(sum.subheadlines) ? sum.subheadlines : [],
        body: Array.isArray(sum.body) ? sum.body : [],
      };

      // 로고: 기억된 로고가 있으면 우선, 없으면 자동 감지 로고
      const remembered = loadRememberedLogo(dom, nextClip.press);
      setDomain(dom);
      setClip(nextClip);
      setLogoDataUrl(remembered ?? detectedLogo);
      setStatus("");
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "처리 중 오류가 발생했습니다."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleLogoUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setLogoDataUrl(dataUrl);
      if (remember && clip) saveRememberedLogo(domain, clip.press, dataUrl);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function clearLogo() {
    setLogoDataUrl(null);
    if (clip) forgetLogo(domain, clip.press);
  }

  const filename = useMemo(() => {
    if (!clip) return "기사요약";
    const base = `${clip.press} ${clip.headline}`.replace(/[\\/:*?"<>|\n]/g, " ").trim();
    return base.slice(0, 40) || "기사요약";
  }, [clip]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-zinc-900 antialiased">
      <main className="mx-auto w-full max-w-[560px] px-5 py-8 sm:px-6 sm:py-10">
        <header className="mb-6 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xl font-bold tracking-tight text-sky-700">
            <ClipIcon className="h-6 w-6" />
            뉴스클리핑
          </span>
          <div className="flex items-center gap-2">
            <SharePageButton />
            <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
              Beta
            </span>
          </div>
        </header>

        <section className="mb-5">
          <h1 className="text-[1.6rem] font-bold leading-tight tracking-tight sm:text-[1.8rem]">
            기사 요약 이미지 생성기
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-500">
            기사 링크를 붙여넣으면 언론사·날짜·제목·요약이 담긴 이미지를
            만들어 드려요. 보고서에 바로 붙여넣기 좋은 PNG로 저장됩니다.
          </p>
        </section>

        {/* ── 입력 방식 탭 ── */}
        <div className="mb-3 inline-flex rounded-xl bg-white p-1 shadow-sm ring-1 ring-zinc-100">
          <TabButton active={mode === "url"} onClick={() => setMode("url")}>
            링크로
          </TabButton>
          <TabButton active={mode === "paste"} onClick={() => setMode("paste")}>
            본문 붙여넣기
          </TabButton>
        </div>

        <section className="mb-4">
          {mode === "url" ? (
            <input
              type="url"
              inputMode="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://... 기사 주소를 붙여넣으세요"
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />
          ) : (
            <textarea
              value={pasteInput}
              onChange={(e) => setPasteInput(e.target.value)}
              placeholder="기사 본문을 복사해서 붙여넣으세요. (제목 + 본문을 함께 넣으면 더 정확해요)"
              rows={7}
              className="w-full resize-y rounded-2xl border border-zinc-200 bg-white px-4 py-3.5 text-sm leading-relaxed outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />
          )}
        </section>

        <button
          type="button"
          disabled={loading}
          onClick={generate}
          className="mb-5 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-semibold text-white shadow-lg transition enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-400 disabled:shadow-none"
          style={
            loading
              ? undefined
              : { backgroundColor: "#0284c7", boxShadow: "0 8px 24px rgba(2,132,199,0.25)" }
          }
        >
          {loading ? (
            <>
              <Spinner className="h-5 w-5 text-white" />
              {status || "처리 중..."}
            </>
          ) : (
            <>
              <SparkleIcon className="h-5 w-5" />
              요약 이미지 만들기
            </>
          )}
        </button>

        {error && (
          <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
            {error}
          </div>
        )}

        {/* ── 결과: 편집 + 미리보기 ── */}
        {clip && (
          <>
            {/* 미리보기 카드 */}
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-zinc-700">
              <EyeIcon className="h-4 w-4 text-sky-600" />
              미리보기
            </div>
            <div className="mb-5 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
              <SummaryCard ref={cardRef} clip={clip} logoDataUrl={logoDataUrl} />
            </div>

            <SaveImageButton targetRef={cardRef} filename={filename} />

            {/* 로고 설정 */}
            <section className="mt-5 rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm">
              <p className="mb-3 flex items-center gap-1.5 text-sm font-bold text-zinc-800">
                <ImageIcon className="h-4 w-4 text-sky-600" />
                언론사 로고
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-24 items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-slate-50">
                  {logoDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={logoDataUrl}
                      alt="로고"
                      className="max-h-12 max-w-[88px] object-contain"
                    />
                  ) : (
                    <span className="text-[11px] text-zinc-400">로고 없음</span>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-2">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="flex-1 rounded-xl border border-zinc-200 bg-white py-2 text-xs font-semibold text-zinc-700 transition hover:border-sky-300 hover:text-sky-700 active:scale-95"
                    >
                      로고 업로드/변경
                    </button>
                    {logoDataUrl && (
                      <button
                        type="button"
                        onClick={clearLogo}
                        className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-500 transition hover:border-red-200 hover:text-red-500 active:scale-95"
                      >
                        지우기
                      </button>
                    )}
                  </div>
                  <label className="flex cursor-pointer items-center gap-1.5 text-[11px] font-medium text-zinc-500">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="h-3.5 w-3.5 accent-sky-600"
                    />
                    이 언론사 로고로 기억하기 (다음에 자동 적용)
                  </label>
                </div>
              </div>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                tabIndex={-1}
                aria-hidden
                onChange={handleLogoUpload}
              />
            </section>

            {/* 내용 편집 */}
            <section className="mt-4 rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm">
              <p className="mb-3 flex items-center gap-1.5 text-sm font-bold text-zinc-800">
                <PencilIcon className="h-4 w-4 text-sky-600" />
                내용 편집
              </p>

              <div className="grid grid-cols-2 gap-3">
                <Field label="언론사">
                  <input
                    value={clip.press}
                    onChange={(e) => update("press", e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="배포일">
                  <input
                    value={clip.date}
                    onChange={(e) => update("date", e.target.value)}
                    placeholder="예: 2024.10."
                    className={inputCls}
                  />
                </Field>
              </div>

              <Field label="강조 제목" className="mt-3">
                <textarea
                  value={clip.headline}
                  onChange={(e) => update("headline", e.target.value)}
                  rows={2}
                  className={`${inputCls} resize-y`}
                />
              </Field>

              <ListEditor
                label="부제"
                items={clip.subheadlines}
                onChange={(v) => update("subheadlines", v)}
                placeholder="부제를 입력하세요"
                rows={1}
              />

              <ListEditor
                label="요약 본문"
                items={clip.body}
                onChange={(v) => update("body", v)}
                placeholder="요약 문단을 입력하세요"
                rows={3}
              />
            </section>
          </>
        )}

        <footer className="mt-8 pb-6 text-center text-xs leading-relaxed text-zinc-400">
          <VisitorCount />
          <p>
            AI 요약은 참고용이에요. 보고서에 넣기 전 원문과 수치를 꼭 확인해
            주세요.
          </p>
          <SiteFooter />
        </footer>
      </main>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100";

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-[11px] font-semibold text-zinc-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function ListEditor({
  label,
  items,
  onChange,
  placeholder,
  rows,
}: {
  label: string;
  items: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
  rows: number;
}) {
  function setAt(i: number, val: string) {
    onChange(items.map((it, idx) => (idx === i ? val : it)));
  }
  function removeAt(i: number) {
    onChange(items.filter((_, idx) => idx !== i));
  }
  function add() {
    onChange([...items, ""]);
  }

  return (
    <div className="mt-3">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[11px] font-semibold text-zinc-500">{label}</span>
        <button
          type="button"
          onClick={add}
          className="text-[11px] font-semibold text-sky-600 hover:text-sky-700"
        >
          + 추가
        </button>
      </div>
      <div className="space-y-2">
        {items.length === 0 && (
          <p className="rounded-lg bg-slate-50 px-3 py-2 text-[11px] text-zinc-400">
            항목이 없습니다. “추가”를 눌러 입력하세요.
          </p>
        )}
        {items.map((it, i) => (
          <div key={i} className="flex items-start gap-1.5">
            <textarea
              value={it}
              onChange={(e) => setAt(i, e.target.value)}
              placeholder={placeholder}
              rows={rows}
              className={`${inputCls} resize-y`}
            />
            <button
              type="button"
              onClick={() => removeAt(i)}
              aria-label="삭제"
              className="mt-1.5 shrink-0 rounded-lg border border-zinc-200 px-2 py-1.5 text-xs text-zinc-400 transition hover:border-red-200 hover:text-red-500"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function TabButton({
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
      type="button"
      onClick={onClick}
      className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition ${
        active
          ? "bg-sky-600 text-white shadow-sm"
          : "text-zinc-500 hover:text-zinc-800"
      }`}
    >
      {children}
    </button>
  );
}

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className ?? ""}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

function ClipIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M15.5 2H8.6c-.4 0-.8.2-1.1.5-.3.3-.5.7-.5 1.1V20c0 .4.2.8.5 1.1.3.3.7.5 1.1.5h9.8c.4 0 .8-.2 1.1-.5.3-.3.5-.7.5-1.1V6.5L15.5 2z" />
      <path d="M15 2v5h5" />
      <path d="M10 12h6" />
      <path d="M10 16h6" />
    </svg>
  );
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
      <path d="M19 14l.75 2.25L22 17l-2.25.75L19 20l-.75-2.25L16 17l2.25-.75L19 14z" />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  );
}

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}
