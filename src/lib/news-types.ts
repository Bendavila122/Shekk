/** Shared shapes for the live Israeli news headlines. */

export type NewsSourceId = "toi" | "jpost" | "ynet" | "inn";

export type NewsItem = {
  id: string;
  title: string;
  url: string;
  source: NewsSourceId;
  sourceName: string;
  /** ISO timestamp of publication. */
  publishedAt: string;
  urgent: boolean;
  /** Lead image from the feed, when the publisher supplies one. */
  image?: string;
};

export type NewsFeed = {
  items: NewsItem[];
  /** Sources that failed this round — the rest still render. */
  failed: NewsSourceId[];
  fetchedAt: string;
};

export const NEWS_SOURCES: { id: NewsSourceId; name: string; short: string }[] = [
  { id: "toi", name: "Times of Israel", short: "ToI" },
  { id: "jpost", name: "Jerusalem Post", short: "JPost" },
  { id: "ynet", name: "Ynetnews", short: "Ynet" },
  { id: "inn", name: "Arutz Sheva", short: "A7" },
];

export const NEWS_SOURCE_NAME: Record<NewsSourceId, string> = {
  toi: "Times of Israel",
  jpost: "Jerusalem Post",
  ynet: "Ynetnews",
  inn: "Arutz Sheva",
};

/**
 * Heuristic only — press coverage, never an official Home Front Command alert.
 * Kept deliberately narrow so ordinary politics//diplomacy stories don't trip it.
 */
const URGENT_PATTERNS = [
  /\brocket(s)?\b/i,
  /\bsiren(s)?\b/i,
  /\bmissile(s)?\b/i,
  /\bdrone(s)?\b/i,
  /\bhome front command\b/i,
  /\bterror(ist)? attack\b/i,
  /\bstabbing\b/i,
  /\bshooting attack\b/i,
  /\bcar[- ]ramming\b/i,
  /\bexplosion\b/i,
  /\bair raid\b/i,
  /\bevacuat(e|ion)\b/i,
  /\bstate of emergency\b/i,
  /\bcasualtie?s\b/i,
  /\bwounded\b/i,
  /\bkilled\b/i,
  /\bsecurity incident\b/i,
  /\bintercepted\b/i,
];

export function isUrgentHeadline(title: string): boolean {
  return URGENT_PATTERNS.some((re) => re.test(title));
}

/** "12m ago" / "3h ago" / "Tue" — compact stamp for tiles and lists. */
export function relativeTime(iso: string, from: Date = new Date()): string {
  const ms = from.getTime() - new Date(iso).getTime();
  if (!Number.isFinite(ms)) return "";
  const mins = Math.round(ms / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}
