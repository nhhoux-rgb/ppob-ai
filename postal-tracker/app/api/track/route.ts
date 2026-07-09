import { XMLParser } from "fast-xml-parser";

export const runtime = "nodejs";

// ── 남용 방지 설정 ───────────────────────────────────────────────
const MAX_BATCH = 30; // 한 요청에 조회할 최대 등기번호 수(클라가 이 단위로 청크 전송)
const CONCURRENCY = 5; // 우체국 서버에 한 번에 던지는 동시 요청 수(얌전하게)
const FETCH_TIMEOUT_MS = 15_000;
const RETRY = 2; // 실패 시 재시도 횟수
const RATE_LIMIT = 90; // IP당 분당 허용 조회 건수
const RATE_WINDOW_MS = 60_000;

// 공식 API 엔드포인트 (공공데이터포털: 국내우편물 종적 조회 서비스)
const EPOST_ENDPOINT =
  "http://openapi.epost.go.kr/trace/retrieveLongitudinalService/retrieveLongitudinalService/getLongitudinalDomesticList";

const hits = new Map<string, number[]>();

function isRateLimited(ip: string, cost: number): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  for (let i = 0; i < cost; i++) recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE_LIMIT;
}

export type TrackResult = {
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
  _rawXml?: string; // POSTAL_DEBUG=1 일 때만 채워짐 (필드 매핑 확인용)
};

export type TrackEvent = {
  date: string;
  time: string;
  location: string;
  status: string;
  detail: string;
};

// ── 관용적 필드 추출 ─────────────────────────────────────────────
// 우체국 응답 XML의 정확한 태그명을 실제 키 없이 확정하기 어렵기 때문에,
// 후보 태그명 목록으로 값을 찾는 방식을 쓴다. 실제 키를 받은 뒤 응답 한 건만
// 확인하면 아래 후보 목록에 정확한 태그명을 추가/조정해 바로 확정할 수 있다.
function scalar(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "object") return "";
  return String(v).trim();
}

// 여러 후보 키 중 첫 번째로 값이 있는 스칼라를 반환
function pick(o: Record<string, unknown>, keys: string[]): string {
  for (const k of keys) {
    const s = scalar(o?.[k]);
    if (s) return s;
  }
  return "";
}

// fast-xml-parser는 요소가 1개면 객체, 여러 개면 배열로 준다 → 항상 배열로 정규화.
function toArray(v: unknown): Record<string, unknown>[] {
  if (v === undefined || v === null) return [];
  return (Array.isArray(v) ? v : [v]).filter(
    (x) => x && typeof x === "object"
  ) as Record<string, unknown>[];
}

const parser = new XMLParser({
  ignoreAttributes: false,
  parseTagValue: false,
  trimValues: true,
});

function parseEpostXml(xml: string, number: string): TrackResult {
  const obj = parser.parse(xml) as Record<string, unknown>;
  const root = (obj?.LongitudinalDomesticListResponse ?? obj ?? {}) as Record<
    string,
    unknown
  >;
  const header = (root.cmmMsgHeader ?? {}) as Record<string, unknown>;

  // ── 에러 봉투 감지 ──
  // 정상: <successYN>Y</successYN><returnCode>00</returnCode>
  // 오류: <successYN>N</successYN><returnCode>30</returnCode><errMsg>...ERROR</errMsg>
  const successYN = scalar(header.successYN).toUpperCase();
  const errMsg = scalar(header.errMsg);
  const errCode = scalar(header.returnCode);
  if (
    successYN === "N" ||
    (errMsg && /ERROR|NOT_REGISTERED|LIMIT|DENY|INVALID|등록되지|초과/i.test(errMsg))
  ) {
    return blankResult(
      number,
      "오류",
      `우체국 API: ${errMsg || "조회 실패"}${errCode ? ` (${errCode})` : ""}`
    );
  }

  // ── 실제 태그명 매핑 (getLongitudinalDomesticList 응답 기준) ──
  const sender = pick(root, ["applcntNm", "sender", "발송인"]);
  const recipient = pick(root, ["addrseNm", "receiver", "수취인"]);
  const mailType = pick(root, ["pstmtrKnd", "mailType", "우편물종류"]);
  const deliveryStatus = pick(root, ["dlvySttus", "deliveryStatus", "배달상태"]);
  const deliveryDate = pick(root, ["dlvyDe", "deliveryDate", "배달일자"]);

  const events: TrackEvent[] = toArray(root.longitudinalDomesticList).map(
    (e) => ({
      date: pick(e, ["dlvyDate", "date"]),
      time: pick(e, ["dlvyTime", "time"]),
      location: pick(e, ["nowLc", "location", "현재위치"]),
      status: pick(e, ["processSttus", "status", "처리현황"]),
      detail: pick(e, ["detailDc", "detail", "상세"]),
    })
  );

  const last = events[events.length - 1];
  const lastEvent = last
    ? [last.date, last.time, last.location, last.status]
        .filter(Boolean)
        .join(" ")
    : "";

  const hasAny = sender || recipient || deliveryStatus || events.length > 0;
  if (!hasAny) {
    return blankResult(number, "데이터없음", "");
  }

  return {
    number,
    status: "성공",
    sender,
    recipient,
    mailType,
    deliveryDate,
    deliveryStatus: deliveryStatus || (last ? last.status : ""),
    lastEvent,
    events,
  };
}

function blankResult(
  number: string,
  status: TrackResult["status"],
  error: string
): TrackResult {
  return {
    number,
    status,
    sender: "",
    recipient: "",
    mailType: "",
    deliveryDate: "",
    deliveryStatus: "",
    lastEvent: "",
    events: [],
    ...(error ? { error } : {}),
  };
}

// ── 실제 우체국 API 1건 조회 ─────────────────────────────────────
async function trackOne(number: string, serviceKey: string): Promise<TrackResult> {
  // data.go.kr 은 Encoding/Decoding 두 형태의 인증키를 준다.
  // 어느 걸 넣어도 동작하도록: 이미 %XX 인코딩이 있으면(Encoding 키) 그대로,
  // 없으면(Decoding 키) 한 번 인코딩한다. (Encoding 키를 또 인코딩하면 깨짐)
  const key = serviceKey.trim();
  const encodedKey = /%[0-9A-Fa-f]{2}/.test(key) ? key : encodeURIComponent(key);
  const url = `${EPOST_ENDPOINT}?serviceKey=${encodedKey}&rgist=${encodeURIComponent(
    number
  )}`;

  for (let attempt = 1; attempt <= RETRY + 1; attempt++) {
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        headers: { Accept: "application/xml" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const xml = await res.text();
      const parsed = parseEpostXml(xml, number);
      if (process.env.POSTAL_DEBUG === "1") parsed._rawXml = xml;
      return parsed;
    } catch (e) {
      if (attempt > RETRY) {
        return blankResult(
          number,
          "오류",
          e instanceof Error ? e.message : "조회 실패"
        );
      }
    }
  }
  return blankResult(number, "오류", "조회 실패");
}

// ── 목업(키 없을 때) — 화면/CSV 흐름을 그대로 시연 ────────────────
function mockOne(number: string): TrackResult {
  const digitsum = number
    .split("")
    .reduce((a, c) => a + (Number(c) || 0), 0);
  const bucket = digitsum % 10;
  if (bucket === 0) return blankResult(number, "데이터없음", "");
  const delivered = bucket > 3;
  const returned = bucket === 1;
  const status = returned ? "반송" : delivered ? "배달완료" : "배달준비";
  const events: TrackEvent[] = [
    { date: "2026.07.05", time: "14:20", location: "서울강남우체국", status: "접수", detail: "" },
    { date: "2026.07.06", time: "09:10", location: "동서울물류센터", status: "발송", detail: "" },
    ...(delivered
      ? [{ date: "2026.07.07", time: "11:35", location: "수취인 주소", status, detail: returned ? "수취인 부재" : "본인 수령" }]
      : []),
  ];
  const last = events[events.length - 1];
  return {
    number,
    status: "성공",
    sender: "(주)행복분양",
    recipient: `홍길동${bucket}`,
    mailType: "등기통상",
    deliveryDate: delivered ? "2026.07.07" : "",
    deliveryStatus: status,
    lastEvent: `${last.date} ${last.time} ${last.location} ${last.status}`,
    events,
  };
}

// 동시성 제한 map
async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx]);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, worker)
  );
  return out;
}

function normalize(raw: unknown): string {
  return String(raw ?? "").replace(/[^0-9]/g, "");
}

export async function POST(req: Request) {
  try {
    // ── 출처(Origin) 체크 ──
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

    const body = await req.json();
    const rawNumbers: unknown[] = Array.isArray(body.numbers)
      ? body.numbers
      : [];
    const numbers = rawNumbers
      .map(normalize)
      .filter((n) => n.length >= 9 && n.length <= 15)
      .slice(0, MAX_BATCH);

    if (numbers.length === 0) {
      return Response.json(
        { error: "조회할 등기번호가 없습니다. (숫자 9~15자리)" },
        { status: 400 }
      );
    }

    // ── rate limit (조회 건수만큼 비용 차감) ──
    const ip =
      (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() ||
      "unknown";
    if (isRateLimited(ip, numbers.length)) {
      return Response.json(
        { error: "조회 요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." },
        { status: 429 }
      );
    }

    const serviceKey = process.env.POSTAL_API_KEY;
    const mock = !serviceKey;

    const results = await mapLimit(numbers, CONCURRENCY, (n) =>
      mock ? Promise.resolve(mockOne(n)) : trackOne(n, serviceKey!)
    );

    return Response.json({ results, mock });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
