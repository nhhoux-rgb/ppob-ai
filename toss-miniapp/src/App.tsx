import { useRef, useState, type ChangeEvent } from "react";
import { Device } from "@apps-in-toss/web-framework";

// 기존 Vercel 백엔드 재사용 (CORS 허용됨)
const API_URL = "https://ppob-ai-aics.vercel.app/api/price";

type PriceResult = {
  item: string;
  size?: "소형" | "중형" | "대형";
  licensed?: boolean;
  priceMin: number;
  priceMax: number;
  priceEstimate: number;
  confidence: "high" | "medium" | "low";
  reason: string;
  note?: string;
};

const CONFIDENCE_LABEL: Record<PriceResult["confidence"], string> = {
  high: "신뢰도 높음",
  medium: "신뢰도 보통",
  low: "신뢰도 낮음",
};

const won = (n: number) => `${Math.round(n).toLocaleString()}원`;

export default function App() {
  const [image, setImage] = useState("");
  const [cost, setCost] = useState(1000);
  const [result, setResult] = useState<PriceResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // 토스 밖(브라우저)에서 테스트할 때 파일 선택으로 폴백
  function fileFallback() {
    fileRef.current?.click();
  }
  function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
      setResult(null);
      setError("");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  async function pickCamera() {
    try {
      const res = await Device.openCamera({ base64: true, maxWidth: 1024 });
      if (res?.dataUri) {
        setImage(res.dataUri);
        setResult(null);
        setError("");
      }
    } catch {
      fileFallback();
    }
  }

  async function pickGallery() {
    try {
      const res = await Device.getPhotos({
        base64: true,
        maxCount: 1,
        maxWidth: 1024,
      });
      const uri = res?.[0]?.dataUri;
      if (uri) {
        setImage(uri);
        setResult(null);
        setError("");
      }
    } catch {
      fileFallback();
    }
  }

  async function analyze() {
    if (!image) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: image }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "분석 실패");
      setResult(data);
    } catch {
      setError("분석 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }

  const safeCost = cost > 0 ? cost : 1000;
  const breakeven = result ? Math.floor(result.priceEstimate / safeCost) : 0;
  const beMin = result ? Math.floor(result.priceMin / safeCost) : 0;
  const beMax = result ? Math.floor(result.priceMax / safeCost) : 0;

  return (
    <div className="wrap">
      <header className="header">
        <span className="brand">본전분석</span>
        <span className="badge">인형뽑기</span>
      </header>

      <h1 className="title">이 인형, 뽑는 게 이득일까?</h1>
      <p className="sub">사진을 올리면 대략적인 가격과 손익분기를 알려드려요.</p>

      <div className="label">한 판 가격</div>
      <div className="costbox">
        <input
          type="number"
          inputMode="numeric"
          min={100}
          step={100}
          value={cost}
          onChange={(e) => setCost(Number(e.target.value))}
        />
        <span>원</span>
      </div>

      {image ? (
        <div className="imgwrap">
          <img src={image} alt="분석 이미지" />
          {loading && (
            <div className="overlay">
              <div className="spinner" />
              <span>가격 분석 중...</span>
            </div>
          )}
        </div>
      ) : (
        <button className="upload" onClick={pickGallery}>
          <div className="upicon">📷</div>
          <div className="uptitle">인형 사진 추가</div>
          <div className="upsub">사진 한 장이면 끝</div>
        </button>
      )}

      <div className="btnrow">
        <button className="btn" onClick={pickCamera}>
          카메라
        </button>
        <button className="btn" onClick={pickGallery}>
          갤러리
        </button>
      </div>

      <button
        className="analyze"
        disabled={!image || loading}
        onClick={analyze}
      >
        {loading ? "분석 중..." : "가격 분석하기"}
      </button>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={onFile}
      />

      {error && <div className="error">{error}</div>}

      {result && !loading && (
        <section className="card">
          <div className="card-head">
            <div>
              <div className="muted">분석 대상</div>
              <div className="item">{result.item}</div>
              <div className="chips">
                {result.size && <span className="chip">{result.size}</span>}
                {typeof result.licensed === "boolean" && (
                  <span className={`chip ${result.licensed ? "chip-v" : ""}`}>
                    {result.licensed ? "정품 추정" : "무명 추정"}
                  </span>
                )}
              </div>
            </div>
            <span className={`conf conf-${result.confidence}`}>
              {CONFIDENCE_LABEL[result.confidence]}
            </span>
          </div>

          <div className="price">
            <div className="muted">추정 소매가</div>
            <div className="price-main">{won(result.priceEstimate)}</div>
            <div className="muted">
              예상 범위 {won(result.priceMin)} ~ {won(result.priceMax)}
            </div>
          </div>

          <div className="be">
            <div className="be-top">한 판 {won(safeCost)} 기준</div>
            <div className="be-main">
              약 <b>{breakeven}</b>판 안에 뽑으면 이득!
            </div>
            <div className="be-range">
              (범위 {beMin}~{beMax}판)
            </div>
          </div>

          {(result.reason || result.note) && (
            <div className="reason">
              {result.reason && (
                <p>
                  <b>판단 근거 </b>
                  {result.reason}
                </p>
              )}
              {result.note && (
                <p className="muted-p">
                  <b>참고 </b>
                  {result.note}
                </p>
              )}
            </div>
          )}
        </section>
      )}

      <footer className="foot">
        AI가 추정한 대략적인 가격이며 실제 시세와 다를 수 있어요. 참고용으로만
        활용하세요.
      </footer>
    </div>
  );
}
