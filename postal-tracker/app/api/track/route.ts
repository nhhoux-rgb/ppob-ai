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

// 파싱된 객체 트리에서 후보 키에 해당하는 첫 스칼라 값을 재귀 탐색
function pickDeep(node: unknown, candidates: string[]): string {
  const wanted = candidates.map((c) => c.toLowerCase());
  const stack: unknown[] = [node];
  while (stack.length) {
    const cur = stack.pop();
    if (cur && typeof cur === "object") {
      for (const [k, val] of Object.entries(cur as Record<string, unknown>)) {
        if (wanted.includes(k.toLowerCase())) {
          const s = scalar(val);
          if (s) return s;
        }
        if (val && typeof val === "object") stack.push(val);
      }
    }
  }
  return "";
}

// 종적 이벤트 배열을 트리에서 찾는다: 날짜/시간/처리현황스러운 필드를 가진
// 객체들의 배열을 우선 채택.
function findEventArray(node: unknown): Record<string, unknown>[] {
  const stack: unknown[] = [node];
  let best: Record<string, unknown>[] = [];
  while (stack.length) {
    const cur = stack.pop();
    if (Array.isArray(cur)) {
      const objs = cur.filter(
        (x) => x && typeof x === "object"
      ) as Record<string, unknown>[];
      const looksLikeEvents = objs.some((o) =>
        Object.keys(o).some((k) =>
          /date|time|일자|시간|현황|status|위치|location|처리/i.test(k)
        )
      );
      if (looksLikeEvents && objs.length > best.length) best = objs;
      for (const x of cur) if (x && typeof x === "object") stack.push(x);
    } else if (cur && typeof cur === "object") {
      for (const val of Object.values(cur as Record<string, unknown>)) {
        if (val && typeof val === "object") stack.push(val);
      }
    }
  }
  return best;
}

function mapEvent(o: Record<string, unknown>): TrackEvent {
  return {
    date: pickDeep(o, ["date", "일자", "occrDate", "workDate", "dlvyDate"]),
    time: pickDeep(o, ["time", "시간", "occrTime", "workTime"]),
    location: pickDeep(o, [
      "location",
      "현재위치",
      "발생국",
      "office",
      "place",
      "postOffice",
      "우체국",
    ]),
    status: pickDeep(o, [
      "status",
      "처리현황",
      "처리",
      "stateKind",
      "작업진행상태",
      "progress",
    ]),
    detail: pickDeep(o, ["detail", "description", "상세", "비고", "detailDc"]),
  };
}

const parser = new XMLParser({
  ignoreAttributes: false,
  parseTagValue: false,
  trimValues: true,
});

function parseEpostXml(xml: string, number: string): TrackResult {
  const obj = parser.parse(xml);

  // data.go.kr 공통 에러 봉투 감지 (키 미등록/트래픽초과 등)
  // 실제 에러 응답 예: <cmmMsgHeader><successYN>N</successYN>
  //   <returnCode>30</returnCode><errMsg>SERVICE KEY IS NOT REGISTERED ERROR.</errMsg>
  const successYN = pickDeep(obj, ["successYN"]).toUpperCase();
  const errMsg = pickDeep(obj, [
    "errMsg",
    "returnAuthMsg",
    "resultMsg",
    "cmmMsgHeader",
  ]);
  const errCode = pickDeep(obj, [
    "returnCode",
    "returnReasonCode",
    "resultCode",
  ]);
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

  const sender = pickDeep(obj, [
    "sender",
    "senderName",
    "발송인",
    "보내는분",
    "fromName",
  ]);
  const recipient = pickDeep(obj, [
    "receiver",
    "recipient",
    "수취인",
    "받는분",
    "toName",
    "recvName",
  ]);
  const mailType = pickDeep(obj, ["mailType", "우편물종류", "종류", "postType"]);
  const deliveryStatus = pickDeep(obj, [
    "deliveryStatus",
    "배달상태",
    "처리상태",
    "stateKind",
    "trackState",
  ]);
  const deliveryDate = pickDeep(obj, [
    "deliveryDate",
    "배달일자",
    "배달일",
    "수령인배달일",
    "dlvyDate",
  ]);

  const events = findEventArray(obj).map(mapEvent);
  const last = events[events.length - 1];
  const lastEvent = last
    ? [last.date, last.time, last.location, last.status]
        .filter(Boolean)
        .join(" ")
    : "";

  const hasAny =
    sender || recipient || deliveryStatus || events.length > 0;
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
  // data.go.kr 은 "일반 인증키(Decoding)"를 넣고 URLSearchParams로 인코딩하는 게 안전.
  const qs = new URLSearchParams({ serviceKey, rgist: number });
  const url = `${EPOST_ENDPOINT}?${qs.toString()}`;

  for (let attempt = 1; attempt <= RETRY + 1; attempt++) {
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        headers: { Accept: "application/xml" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const xml = await res.text();
      return parseEpostXml(xml, number);
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
