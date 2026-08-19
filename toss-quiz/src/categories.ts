// 분야 정의. key 는 /api/quiz 백엔드의 CATEGORIES 와 반드시 동기화한다.
export type CategoryKey =
  | "random"
  | "economy"
  | "politics"
  | "world"
  | "science"
  | "it"
  | "koreanhistory"
  | "worldhistory"
  | "society"
  | "sports"
  | "arts";

export type Category = {
  key: CategoryKey;
  label: string; // 화면 표시용 짧은 이름
  emoji: string;
};

export const CATEGORIES: Category[] = [
  { key: "random", label: "랜덤", emoji: "🎲" },
  { key: "economy", label: "경제", emoji: "💰" },
  { key: "politics", label: "정치·법", emoji: "⚖️" },
  { key: "world", label: "국제", emoji: "🌍" },
  { key: "science", label: "과학", emoji: "🔬" },
  { key: "it", label: "IT·기술", emoji: "💻" },
  { key: "koreanhistory", label: "한국사", emoji: "🇰🇷" },
  { key: "worldhistory", label: "세계사", emoji: "🏛️" },
  { key: "society", label: "사회·문화", emoji: "🏙️" },
  { key: "sports", label: "스포츠", emoji: "⚽" },
  { key: "arts", label: "예술·문학", emoji: "🎨" },
];

export function categoryLabel(key: string): string {
  return CATEGORIES.find((c) => c.key === key)?.label ?? "상식";
}
