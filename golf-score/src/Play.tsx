/* 홀 입력 화면. 라운드 중에 가장 오래 보는 화면이라 두 가지를 지켰다.
 *
 *   1. 잘 친 샷은 아무것도 누르지 않아도 된다. 결과의 기본값이 "정타"고,
 *      샷 개수도 파에 맞춰 미리 깔려 있다. 미스만 찍는다.
 *   2. 한 홀이 한 화면에 들어간다. 스크롤하지 않고 다음 홀로 넘어간다. */

import { useEffect, useState } from "react";
import { Screen } from "@apps-in-toss/web-framework";
import {
  CLUBS,
  CLUB_GROUPS,
  type ClubId,
  type Hole,
  type Par,
  type Round,
  type Shot,
  type ShotResult,
  clubLabel,
  clubShort,
  regulationShots,
  resultLabel,
} from "./types";
import { holeStrokes, holeToPar, penaltyOf, scoreName, toParText } from "./score";
import { Stepper, haptic } from "./ui";

const SHOT_NAMES = ["티샷", "세컨샷", "서드샷"];

function shotName(i: number): string {
  return SHOT_NAMES[i] ?? `${i + 1}번째 샷`;
}

/** 결과 고르는 판. 성격별로 묶어야 눈으로 찾는 시간이 줄어든다. */
const RESULT_GROUPS: { title: string; ids: ShotResult[]; cols?: 2 }[] = [
  { title: "", ids: ["good"] },
  // 벌타는 이름이 길어 네 칸에 넣으면 줄이 접힌다. 두 칸으로 벌린다.
  { title: "벌타", ids: ["ob_left", "ob_right", "hazard_left", "hazard_right"], cols: 2 },
  { title: "위치", ids: ["rough_left", "rough_right", "bunker"] },
  { title: "임팩트", ids: ["duff", "top", "sky", "shank"] },
];

export default function Play({
  round,
  cursor,
  onRound,
  onCursor,
  onFinish,
  onExit,
}: {
  round: Round;
  cursor: number;
  onRound: (r: Round) => void;
  onCursor: (n: number) => void;
  onFinish: () => void;
  onExit: () => void;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);

  // 라운드 중에는 화면이 꺼지지 않게 한다. 화면을 벗어나면 되돌린다.
  useEffect(() => {
    try {
      Screen.setAwakeMode({ enabled: true });
    } catch {
      // 토스 앱이 아니면 통과
    }
    return () => {
      try {
        Screen.setAwakeMode({ enabled: false });
      } catch {
        // 위와 같다
      }
    };
  }, []);

  const hole = round.holes[cursor];
  if (!hole) return null;

  const last = cursor === round.holes.length - 1;
  const strokes = holeStrokes(hole, round.obRule);
  const diff = holeToPar(hole, round.obRule);

  // 여기까지의 누적. 다음 홀로 넘어가기 전에 흐름을 알 수 있다.
  const played = round.holes.slice(0, cursor + 1);
  const runningStrokes = played.reduce((s, h) => s + holeStrokes(h, round.obRule), 0);
  const runningPar = played.reduce((s, h) => s + h.par, 0);

  function patch(next: Partial<Hole>) {
    onRound({
      ...round,
      holes: round.holes.map((h, i) => (i === cursor ? { ...h, ...next } : h)),
    });
  }

  function setShot(index: number, next: Partial<Shot>) {
    patch({ shots: hole.shots.map((s, i) => (i === index ? { ...s, ...next } : s)) });
  }

  /** 파를 바꾸면 아직 손대지 않은 샷 줄도 같이 맞춰 준다. */
  function setPar(par: Par) {
    const wasRegulation = hole.shots.length === regulationShots(hole.par);
    if (!wasRegulation) {
      patch({ par });
      return;
    }
    const want = regulationShots(par);
    const shots = hole.shots.slice(0, want);
    while (shots.length < want) {
      shots.push({ club: shots.length === 0 && par > 3 ? "Dr" : "7i", result: "good" });
    }
    patch({ par, shots });
  }

  function addShot() {
    haptic("tap");
    const prev = hole.shots[hole.shots.length - 1];
    patch({ shots: [...hole.shots, { club: prev?.club ?? "7i", result: "good" }] });
  }

  function removeShot(index: number) {
    if (hole.shots.length <= 1) return;
    haptic("tap");
    setOpen(null);
    patch({ shots: hole.shots.filter((_, i) => i !== index) });
  }

  function go(delta: number) {
    const next = cursor + delta;
    if (next < 0 || next >= round.holes.length) return;
    haptic("tap");
    setOpen(null);
    onCursor(next);
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function toggle(key: string) {
    haptic("tap");
    setOpen(open === key ? null : key);
  }

  return (
    <div className="play">
      <div className="hole-bar">
        <button className="nav-btn" onClick={() => go(-1)} disabled={cursor === 0}>
          ◀
        </button>
        <div className="hole-title">
          <b>{hole.no}</b>번홀
        </div>
        <button className="nav-btn" onClick={() => go(1)} disabled={last}>
          ▶
        </button>
      </div>

      <div className="par-row">
        <span className="label">파</span>
        <div className="seg">
          {([3, 4, 5] as Par[]).map((p) => (
            <button
              key={p}
              className={`seg-item${p === hole.par ? " on" : ""}`}
              onClick={() => {
                if (p !== hole.par) haptic("tap");
                setPar(p);
              }}
            >
              {p}
            </button>
          ))}
        </div>
        <span className="running">
          {runningStrokes}타 · {toParText(runningStrokes - runningPar)}
        </span>
      </div>

      <div className="shots">
        {hole.shots.map((shot, i) => {
          const penalty = penaltyOf(shot.result, round.obRule);
          return (
            <div className="shot-block" key={i}>
              <div className="shot-row">
                <span className="shot-no">{shotName(i)}</span>
                <button
                  className={`chip club${open === `c${i}` ? " open" : ""}`}
                  onClick={() => toggle(`c${i}`)}
                >
                  {clubShort(shot.club)}
                </button>
                <button
                  className={`chip res ${shot.result === "good" ? "ok" : "miss"}${
                    open === `r${i}` ? " open" : ""
                  }`}
                  onClick={() => toggle(`r${i}`)}
                >
                  {resultLabel(shot.result)}
                  {penalty > 0 && <em className="pen">+{penalty}</em>}
                </button>
                {hole.shots.length > 1 && (
                  <button className="chip del" onClick={() => removeShot(i)} aria-label="이 샷 지우기">
                    ✕
                  </button>
                )}
              </div>

              {open === `c${i}` && (
                <div className="picker">
                  {CLUB_GROUPS.map((g) => (
                    <div className="pick-group" key={g}>
                      <div className="pick-title">{g}</div>
                      <div className="pick-grid">
                        {CLUBS.filter((c) => c.group === g).map((c) => (
                          <button
                            key={c.id}
                            className={`pick${c.id === shot.club ? " on" : ""}`}
                            onClick={() => {
                              haptic("tap");
                              setShot(i, { club: c.id as ClubId });
                              setOpen(null);
                            }}
                          >
                            {clubLabel(c.id)}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {open === `r${i}` && (
                <div className="picker">
                  {RESULT_GROUPS.map((g) => (
                    <div className="pick-group" key={g.title || "base"}>
                      {g.title && <div className="pick-title">{g.title}</div>}
                      <div className={`pick-grid${g.cols === 2 ? " two" : ""}`}>
                        {g.ids.map((id) => (
                          <button
                            key={id}
                            className={`pick${id === shot.result ? " on" : ""}${
                              id === "good" ? " wide" : ""
                            }`}
                            onClick={() => {
                              haptic(id === "good" ? "tap" : "error");
                              setShot(i, { result: id });
                              setOpen(null);
                            }}
                          >
                            {resultLabel(id)}
                            {penaltyOf(id, round.obRule) > 0 && (
                              <em className="pen">+{penaltyOf(id, round.obRule)}</em>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        <button className="add-shot" onClick={addShot}>
          + 샷 추가
        </button>
      </div>

      <div className="putt-row">
        <span className="label">퍼트</span>
        <Stepper value={hole.putts} min={0} max={9} onChange={(v) => patch({ putts: v })} />
      </div>

      <div className={`hole-score${diff > 0 ? " over" : diff < 0 ? " under" : ""}`}>
        <b>{strokes}</b>타
        <span>{scoreName(diff)}</span>
      </div>

      <div className="play-actions">
        {last ? (
          <button className="btn" onClick={() => { haptic("success"); onFinish(); }}>
            라운드 끝내기
          </button>
        ) : (
          <button className="btn" onClick={() => go(1)}>
            다음 홀 →
          </button>
        )}
        <button className="btn ghost" onClick={() => { haptic("tap"); setAsking(true); }}>
          {last ? "그만두기" : "여기서 끝내기"}
        </button>
      </div>

      {asking && (
        <div className="ask">
          <div className="ask-box">
            <p>
              {cursor + 1}번홀까지 기록했습니다.
              <br />
              여기까지만 저장하고 끝낼까요?
            </p>
            <div className="ask-actions">
              <button className="btn" onClick={() => { setAsking(false); haptic("success"); onFinish(); }}>
                여기까지 저장
              </button>
              <button className="btn ghost" onClick={() => { setAsking(false); onExit(); }}>
                기록 버리고 나가기
              </button>
              <button className="btn plain" onClick={() => setAsking(false)}>
                계속 입력하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
