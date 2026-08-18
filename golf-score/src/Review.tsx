/* 라운드가 끝난 뒤 보는 화면. 스코어카드 → 한줄요약 → 지난 기록과 비교 →
 * 항목별 진단 순서다. 숫자는 전부 기록에서 계산된 것이고 추정은 없다. */

import { useMemo, useState } from "react";
import { Share } from "@apps-in-toss/web-framework";
import type { Round } from "./types";
import { holeStrokes, holeToPar, toParText } from "./score";
import { analyze, shareText, trendOf } from "./analysis";
import { Spark, haptic } from "./ui";

export default function Review({
  round,
  rounds,
  onBack,
  onDelete,
}: {
  round: Round;
  rounds: Round[];
  onBack: () => void;
  onDelete: (id: string) => void;
}) {
  const analysis = useMemo(() => analyze(round), [round]);
  const trend = useMemo(() => trendOf(round, rounds), [round, rounds]);
  const [shared, setShared] = useState(false);
  const [asking, setAsking] = useState(false);

  const t = analysis.metrics.totals;

  async function share() {
    haptic("tap");
    try {
      await Share.sendMessage({ message: shareText(round, analysis) });
      setShared(true);
      setTimeout(() => setShared(false), 1800);
    } catch {
      // 토스 앱 밖이거나 사용자가 취소 — 무시
    }
  }

  return (
    <div className="review">
      <div className="rv-head">
        <div className="rv-course">{round.course || "이름 없는 구장"}</div>
        <div className="rv-when">
          {round.date}
          {round.teeTime ? ` · ${round.teeTime} 티업` : ""}
        </div>
      </div>

      <div className="total">
        <div className="total-main">
          <b>{t.strokes}</b>
          <span>타</span>
        </div>
        <div className={`total-par${t.toPar > 0 ? " over" : t.toPar < 0 ? " under" : ""}`}>
          {toParText(t.toPar)}
        </div>
        <div className="total-sub">
          {t.holes}홀 · 파 {t.par} · 퍼트 {t.putts} · 벌타 {t.penalties}
        </div>
      </div>

      {t.out && t.in && (
        <div className="halves">
          <div>
            <span>전반</span>
            <b>{t.out.strokes}</b>
          </div>
          <div>
            <span>후반</span>
            <b>{t.in.strokes}</b>
          </div>
        </div>
      )}

      <div className="headline">{analysis.headline}</div>

      <Scorecard round={round} />

      <h2 className="sec">지난 기록과 견주면</h2>
      <div className={`trend ${trend.verdict}`}>
        <p>{trend.summary}</p>
        {trend.enough && (
          <>
            <div className="trend-rows">
              <TrendRow
                label="18홀 환산 타수"
                value={trend.current.toFixed(1)}
                delta={trend.delta}
                unit="타"
              />
              <TrendRow
                label="홀당 퍼트"
                value={analysis.metrics.puttsPerHole.toFixed(2)}
                delta={trend.puttDelta}
                unit="개"
              />
              <TrendRow
                label="18홀 환산 벌타"
                value={((t.penalties / Math.max(1, t.holes)) * 18).toFixed(1)}
                delta={trend.penaltyDelta}
                unit="타"
              />
            </div>
            <div className="trend-note">
              최근 {trend.sampleSize}라운드 평균과의 차이입니다. 음수가 좋아진 것입니다.
            </div>
          </>
        )}
        {trend.history.length >= 2 && (
          <div className="spark-wrap">
            <Spark values={trend.history.map((h) => h.per18)} />
            <div className="spark-axis">
              <span>{trend.history[0].date.slice(5)}</span>
              <span>{trend.history[trend.history.length - 1].date.slice(5)}</span>
            </div>
          </div>
        )}
      </div>

      <h2 className="sec">라운딩 분석</h2>
      <div className="findings">
        {analysis.findings.map((f) => (
          <div className={`finding ${f.tone}`} key={f.title}>
            <div className="f-title">{f.title}</div>
            <div className="f-detail">{f.detail}</div>
          </div>
        ))}
      </div>

      <div className="rv-actions">
        <button className="btn" onClick={share}>
          {shared ? "공유했습니다" : "기록 공유하기"}
        </button>
        <button className="btn ghost" onClick={onBack}>
          목록으로
        </button>
        <button className="btn plain danger" onClick={() => { haptic("tap"); setAsking(true); }}>
          이 기록 삭제
        </button>
      </div>

      {asking && (
        <div className="ask">
          <div className="ask-box">
            <p>이 라운드 기록을 지울까요?<br />되돌릴 수 없습니다.</p>
            <div className="ask-actions">
              <button className="btn danger" onClick={() => onDelete(round.id)}>
                삭제
              </button>
              <button className="btn plain" onClick={() => setAsking(false)}>
                그대로 두기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TrendRow({
  label,
  value,
  delta,
  unit,
}: {
  label: string;
  value: string;
  delta: number | null;
  unit: string;
}) {
  const tone = delta === null ? "" : delta < -0.05 ? " good" : delta > 0.05 ? " bad" : "";
  return (
    <div className="trend-row">
      <span className="tr-label">{label}</span>
      <span className="tr-value">
        {value}
        {unit}
      </span>
      <span className={`tr-delta${tone}`}>
        {delta === null ? "—" : `${delta > 0 ? "+" : ""}${delta.toFixed(1)}`}
      </span>
    </div>
  );
}

/* ── 스코어카드 ──────────────────────────────────────────────────── */

function Scorecard({ round }: { round: Round }) {
  const front = round.holes.slice(0, 9);
  const back = round.holes.slice(9, 18);
  return (
    <div className="card-wrap">
      <Nine round={round} holes={front} label="OUT" />
      {back.length > 0 && <Nine round={round} holes={back} label="IN" />}
    </div>
  );
}

function Nine({ round, holes, label }: { round: Round; holes: Round["holes"]; label: string }) {
  const strokes = holes.reduce((s, h) => s + holeStrokes(h, round.obRule), 0);
  return (
    <table className="card">
      <tbody>
        <tr className="c-hole">
          <th>홀</th>
          {holes.map((h) => (
            <td key={h.no}>{h.no}</td>
          ))}
          <th className="sum">{label}</th>
        </tr>
        <tr className="c-par">
          <th>파</th>
          {holes.map((h) => (
            <td key={h.no}>{h.par}</td>
          ))}
          <td className="sum">{holes.reduce((s, h) => s + h.par, 0)}</td>
        </tr>
        <tr className="c-score">
          <th>타수</th>
          {holes.map((h) => {
            const d = holeToPar(h, round.obRule);
            return (
              <td key={h.no} className={d > 1 ? "bad" : d > 0 ? "over" : d === 0 ? "even" : "under"}>
                {holeStrokes(h, round.obRule)}
              </td>
            );
          })}
          <td className="sum">{strokes}</td>
        </tr>
      </tbody>
    </table>
  );
}
