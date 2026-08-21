const API_URL = "https://ppob-ai-aics.vercel.app/api/quiz-rank";

export type RankEntry = {
  rank: number;
  name: string;
  points: number;
  me?: boolean;
};

export type TopResult = {
  disabled?: boolean;
  top: RankEntry[];
  size: number;
  me: { rank: number | null; points: number };
};

export type SubmitResult = {
  disabled?: boolean;
  added: number;
  total: number;
  rank: number | null;
  size: number;
  top: RankEntry[];
};

async function post(body: unknown): Promise<any> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      // 단순 요청으로 프리플라이트 회피 (토스 프록시 우회)
      headers: { "Content-Type": "text/plain;charset=UTF-8" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

export async function submitScore(
  id: string,
  name: string,
  points: number,
): Promise<SubmitResult | null> {
  try {
    const data = await post({ action: "submit", id, name, points });
    if (data?.disabled) return { disabled: true, added: 0, total: 0, rank: null, size: 0, top: [] };
    if (!Array.isArray(data?.top)) return null;
    return data as SubmitResult;
  } catch {
    return null;
  }
}

export async function fetchTop(id?: string): Promise<TopResult | null> {
  try {
    const data = await post({ action: "top", id });
    if (data?.disabled) return { disabled: true, top: [], size: 0, me: { rank: null, points: 0 } };
    if (!Array.isArray(data?.top)) return null;
    return data as TopResult;
  } catch {
    return null;
  }
}
