/* 기록 저장. 서버가 없다. 전부 기기 안에만 남는다.
 *
 * 토스의 Storage 는 앱을 종료해도 값이 유지되는 네이티브 저장소다. 토스 앱
 * 밖(브라우저에서 개발할 때)에서는 호출이 실패하므로 localStorage 로 떨어진다.
 * 두 경로가 섞이지 않도록 읽기·쓰기 모두 같은 판단을 거친다. */

import { Storage } from "@apps-in-toss/web-framework";
import type { ClubId, ObRule, Round } from "./types";

const KEY_ROUNDS = "golf:rounds";
const KEY_DRAFT = "golf:draft";
const KEY_PREFS = "golf:prefs";

/**
 * 마지막 안전망. 샌드박스 iframe 처럼 localStorage 마저 막힌 곳에서는 쓰기가
 * 조용히 사라지는데, 그러면 방금 끝낸 라운드를 저장하고 다시 읽는 순간
 * 기록이 없어진 것처럼 보인다. 탭을 닫으면 함께 사라지지만, 적어도 앱이
 * 켜져 있는 동안은 앞뒤가 맞는다.
 */
const memory = new Map<string, string>();

async function read(key: string): Promise<string | null> {
  try {
    return await Storage.getItem(key);
  } catch {
    try {
      return localStorage.getItem(key);
    } catch {
      return memory.get(key) ?? null;
    }
  }
}

async function write(key: string, value: string): Promise<void> {
  try {
    await Storage.setItem(key, value);
  } catch {
    try {
      localStorage.setItem(key, value);
    } catch {
      memory.set(key, value);
    }
  }
}

async function remove(key: string): Promise<void> {
  try {
    await Storage.removeItem(key);
  } catch {
    try {
      localStorage.removeItem(key);
    } catch {
      memory.delete(key);
    }
  }
}

function parse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    // 저장된 값이 깨졌으면 기록 전체를 잃는 것보다 기본값으로 여는 편이 낫다
    return fallback;
  }
}

/* ── 끝낸 라운드 ─────────────────────────────────────────────────── */

/** 최근 라운드가 앞에 오도록 정렬해서 돌려준다. */
export async function loadRounds(): Promise<Round[]> {
  const list = parse<Round[]>(await read(KEY_ROUNDS), []);
  return list.sort((a, b) => (b.finishedAt ?? 0) - (a.finishedAt ?? 0));
}

export async function saveRounds(rounds: Round[]): Promise<void> {
  await write(KEY_ROUNDS, JSON.stringify(rounds));
}

/** 같은 id 가 있으면 덮어쓰고, 없으면 더한다. */
export async function upsertRound(round: Round): Promise<Round[]> {
  const rounds = await loadRounds();
  const next = [round, ...rounds.filter((r) => r.id !== round.id)];
  next.sort((a, b) => (b.finishedAt ?? 0) - (a.finishedAt ?? 0));
  await saveRounds(next);
  return next;
}

export async function deleteRound(id: string): Promise<Round[]> {
  const next = (await loadRounds()).filter((r) => r.id !== id);
  await saveRounds(next);
  return next;
}

/* ── 진행 중인 라운드 ────────────────────────────────────────────── */

export type Draft = { round: Round; cursor: number };

/** 홀을 넘길 때마다 덮어쓴다. 앱이 죽어도 여기서 이어서 시작한다. */
export async function saveDraft(draft: Draft): Promise<void> {
  await write(KEY_DRAFT, JSON.stringify(draft));
}

export async function loadDraft(): Promise<Draft | null> {
  return parse<Draft | null>(await read(KEY_DRAFT), null);
}

export async function clearDraft(): Promise<void> {
  await remove(KEY_DRAFT);
}

/* ── 다음 라운드의 기본값 ────────────────────────────────────────── */

export type Prefs = {
  lastCourse: string;
  obRule: ObRule;
  /** 파4·파5 티샷에 미리 깔아 둘 클럽 */
  teeClub: ClubId;
  /** 그 밖의 샷에 미리 깔아 둘 클럽 */
  ironClub: ClubId;
};

export const DEFAULT_PREFS: Prefs = {
  lastCourse: "",
  obRule: "forward_tee",
  teeClub: "Dr",
  ironClub: "7i",
};

export async function loadPrefs(): Promise<Prefs> {
  return { ...DEFAULT_PREFS, ...parse<Partial<Prefs>>(await read(KEY_PREFS), {}) };
}

export async function savePrefs(prefs: Prefs): Promise<void> {
  await write(KEY_PREFS, JSON.stringify(prefs));
}
