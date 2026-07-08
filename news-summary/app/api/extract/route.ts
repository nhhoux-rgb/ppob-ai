export const runtime = "nodejs";

// ── 남용 방지 설정 ───────────────────────────────────────────────
const RATE_LIMIT = 20; // IP당 허용 요청 수
const RATE_WINDOW_MS = 60_000; // 위 횟수의 측정 구간(1분)
const FETCH_TIMEOUT_MS = 9_000; // 기사 페이지 응답 대기 한도
const MAX_HTML_BYTES = 4_000_000; // 4MB 넘는 페이지는 앞부분만 사용
const MAX_BODY_CHARS = 14_000; // 요약에 넘길 본문 최대 길이
const MAX_LOGO_BYTES = 500_000; // 데이터 URL로 담을 로고 최대 크기

const hits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE_LIMIT;
}

// 브라우저처럼 보이게 하는 헤더 (일부 언론사의 기본 봇 차단 회피용)
const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
};

// ── HTML에서 메타/본문 뽑아내기 (의존성 없이 정규식 기반) ──────────

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) =>
      String.fromCodePoint(parseInt(n, 16))
    );
}

// <meta property="og:xxx" content="..."> / name= 둘 다 대응 (속성 순서 무관)
function metaContent(html: string, key: string): string | null {
  const escaped = key.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
  const patterns = [
    new RegExp(
      `<meta[^>]+(?:property|name)=["']${escaped}["'][^>]*\\scontent=["']([^"']*)["']`,
      "i"
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${escaped}["']`,
      "i"
    ),
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m && m[1]) return decodeEntities(m[1].trim());
  }
  return null;
}

// <link rel="..." href="..."> 값 추출
function linkHref(html: string, rels: string[]): string | null {
  for (const rel of rels) {
    const re = new RegExp(
      `<link[^>]+rel=["'][^"']*${rel}[^"']*["'][^>]*href=["']([^"']+)["']`,
      "i"
    );
    const m = html.match(re);
    if (m && m[1]) return decodeEntities(m[1].trim());
    const re2 = new RegExp(
      `<link[^>]+href=["']([^"']+)["'][^>]*rel=["'][^"']*${rel}[^"']*["']`,
      "i"
    );
    const m2 = html.match(re2);
    if (m2 && m2[1]) return decodeEntities(m2[1].trim());
  }
  return null;
}

// JSON-LD 구조화 데이터에서 유용한 필드 추출 (기사 스키마)
function fromJsonLd(html: string): {
  headline?: string;
  datePublished?: string;
  publisher?: string;
  articleBody?: string;
} {
  const out: {
    headline?: string;
    datePublished?: string;
    publisher?: string;
    articleBody?: string;
  } = {};
  const blocks = html.matchAll(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  );
  for (const b of blocks) {
    let json: unknown;
    try {
      json = JSON.parse(b[1].trim());
    } catch {
      continue;
    }
    const nodes: unknown[] = Array.isArray(json) ? json : [json];
    // @graph 형태도 펼쳐서 훑는다
    const flat: unknown[] = [];
    for (const n of nodes) {
      flat.push(n);
      if (n && typeof n === "object" && "@graph" in n) {
        const g = (n as { "@graph": unknown })["@graph"];
        if (Array.isArray(g)) flat.push(...g);
      }
    }
    for (const n of flat) {
      if (!n || typeof n !== "object") continue;
      const o = n as Record<string, unknown>;
      const type = String(o["@type"] ?? "");
      if (!/Article|NewsArticle|Report|BlogPosting/i.test(type)) continue;
      if (!out.headline && typeof o.headline === "string")
        out.headline = o.headline;
      if (!out.datePublished && typeof o.datePublished === "string")
        out.datePublished = o.datePublished;
      if (!out.articleBody && typeof o.articleBody === "string")
        out.articleBody = o.articleBody;
      if (!out.publisher && o.publisher && typeof o.publisher === "object") {
        const p = o.publisher as Record<string, unknown>;
        if (typeof p.name === "string") out.publisher = p.name;
      }
    }
  }
  return out;
}

// 본문 후보 텍스트: <article> 우선, 없으면 문단(<p>)들을 이어붙임
function extractBodyText(html: string): string {
  // script/style 통째로 제거
  let cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ");

  const article = cleaned.match(/<article[\s\S]*?<\/article>/i);
  const scope = article ? article[0] : cleaned;

  // 문단 단위로 뽑아 자연스러운 줄바꿈 유지
  const paras = [...scope.matchAll(/<p[\s\S]*?<\/p>/gi)]
    .map((m) => decodeEntities(m[0].replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim())
    .filter((t) => t.length > 0);

  let text = paras.join("\n");
  // 문단이 거의 없으면 전체 태그를 벗겨 대체
  if (text.replace(/\s/g, "").length < 200) {
    cleaned = scope.replace(/<[^>]+>/g, " ");
    text = decodeEntities(cleaned).replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  }
  return text.slice(0, MAX_BODY_CHARS);
}

function absoluteUrl(href: string, base: string): string | null {
  try {
    return new URL(href, base).toString();
  } catch {
    return null;
  }
}

// 로고 후보를 서버에서 내려받아 data URL로 변환 (클라이언트 CORS 문제 회피)
async function fetchAsDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: BROWSER_HEADERS,
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const type = res.headers.get("content-type") ?? "";
    if (!type.startsWith("image/")) return null;
    const buf = await res.arrayBuffer();
    if (buf.byteLength > MAX_LOGO_BYTES) return null;
    const b64 = Buffer.from(buf).toString("base64");
    return `data:${type};base64,${b64}`;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    // ── 출처(Origin) 체크: 다른 사이트/도구에서의 직접 호출 차단 ──
    const host = req.headers.get("host");
    const origin = req.headers.get("origin");
    if (origin && host) {
      try {
        if (new URL(origin).host !== host) {
          return Response.json(
            { error: "허용되지 않은 요청입니다." },
            { status: 403 }
          );
        }
      } catch {
        // origin 헤더가 깨진 경우는 통과
      }
    }

    const ip =
      (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() ||
      "unknown";
    if (isRateLimited(ip)) {
      return Response.json(
        { error: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." },
        { status: 429 }
      );
    }

    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return Response.json({ error: "링크가 없습니다." }, { status: 400 });
    }

    let target: URL;
    try {
      target = new URL(url.trim());
      if (target.protocol !== "http:" && target.protocol !== "https:") {
        throw new Error("bad protocol");
      }
    } catch {
      return Response.json(
        { error: "올바른 기사 링크(http/https)를 입력해 주세요." },
        { status: 400 }
      );
    }

    // ── 기사 페이지 내려받기 ──
    let html: string;
    try {
      const res = await fetch(target.toString(), {
        headers: BROWSER_HEADERS,
        redirect: "follow",
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      if (!res.ok) {
        return Response.json(
          {
            error: `기사 페이지를 불러오지 못했어요 (HTTP ${res.status}). 본문을 직접 붙여넣어 주세요.`,
            fallback: true,
          },
          { status: 200 }
        );
      }
      const buf = await res.arrayBuffer();
      const sliced = buf.byteLength > MAX_HTML_BYTES ? buf.slice(0, MAX_HTML_BYTES) : buf;
      html = new TextDecoder("utf-8").decode(sliced);
    } catch {
      return Response.json(
        {
          error:
            "기사 페이지에 접근할 수 없었어요 (차단 또는 시간 초과). 본문을 직접 붙여넣어 주세요.",
          fallback: true,
        },
        { status: 200 }
      );
    }

    const jsonLd = fromJsonLd(html);
    const titleTag = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);

    const press =
      metaContent(html, "og:site_name") ??
      jsonLd.publisher ??
      metaContent(html, "twitter:site") ??
      target.hostname.replace(/^www\./, "");

    const date =
      metaContent(html, "article:published_time") ??
      metaContent(html, "og:article:published_time") ??
      jsonLd.datePublished ??
      metaContent(html, "date") ??
      metaContent(html, "og:regDate") ??
      "";

    const title =
      metaContent(html, "og:title") ??
      jsonLd.headline ??
      (titleTag ? decodeEntities(titleTag[1].trim()) : "") ??
      "";

    const bodyText =
      jsonLd.articleBody && jsonLd.articleBody.length > 300
        ? jsonLd.articleBody.slice(0, MAX_BODY_CHARS)
        : extractBodyText(html);

    // ── 로고 후보: apple-touch-icon > icon > 파비콘 서비스 ──
    const domain = target.hostname.replace(/^www\./, "");
    const iconHref =
      linkHref(html, ["apple-touch-icon"]) ??
      linkHref(html, ["shortcut icon", "icon"]);
    const logoCandidates: string[] = [];
    if (iconHref) {
      const abs = absoluteUrl(iconHref, target.toString());
      if (abs) logoCandidates.push(abs);
    }
    // 최후의 보루: 구글 파비콘 서비스(고해상도)
    logoCandidates.push(
      `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
    );

    let logoDataUrl: string | null = null;
    for (const cand of logoCandidates) {
      logoDataUrl = await fetchAsDataUrl(cand);
      if (logoDataUrl) break;
    }

    return Response.json({
      press,
      date,
      title,
      bodyText,
      domain,
      logoDataUrl,
    });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "기사를 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
