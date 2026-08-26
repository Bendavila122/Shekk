/**
 * Shekk navigation map — pure, so it can be unit tested without React.
 *
 * Five launch tabs: Today, Programme, What's On, Explore, You. Money is paused
 * and has no tab (see `flags.ts`); Community is a capability reached from the
 * quick menu, You and Programme rather than a permanent tab.
 */

export const TAB_TODAY = "/";
export const TAB_PROGRAMME = "/programme";
export const TAB_WHATS_ON = "/whats-on";
export const TAB_EXPLORE = "/israel";
export const TAB_YOU = "/me";

export const TAB_ORDER = [TAB_TODAY, TAB_PROGRAMME, TAB_WHATS_ON, TAB_EXPLORE, TAB_YOU] as const;
export type TabPath = (typeof TAB_ORDER)[number];

/**
 * Which route prefixes light which tab. Longest match wins, so
 * `/explore/event/123` lights What's On even though `/explore` belongs to
 * Explore.
 */
const TAB_PREFIXES: Record<TabPath, string[]> = {
  [TAB_TODAY]: [],
  [TAB_PROGRAMME]: ["/programme", "/join"],
  [TAB_WHATS_ON]: ["/whats-on", "/tickets", "/explore/events", "/explore/event"],
  [TAB_EXPLORE]: [
    "/israel",
    "/explore",
    "/services",
    "/guides",
    "/news",
    "/siddur",
    "/benefits",
    "/before-you-fly",
    "/setup",
  ],
  [TAB_YOU]: [
    "/me",
    "/settings",
    "/social",
    "/activity",
    "/membership",
    "/card",
    "/verify",
    "/reverify",
    "/terms",
    "/help",
    "/welcome",
  ],
};

function clean(pathname: string): string {
  const p = pathname.split("?")[0].split("#")[0];
  return p === "/" ? "/" : p.replace(/\/+$/, "") || "/";
}

/** The bottom-tab that should be highlighted for a path, or null for none. */
export function activeTabFor(pathname: string): TabPath | null {
  const path = clean(pathname);
  if (path === "/") return TAB_TODAY;

  let best: { tab: TabPath; len: number } | null = null;
  for (const tab of TAB_ORDER) {
    for (const prefix of TAB_PREFIXES[tab]) {
      if (path === prefix || path.startsWith(`${prefix}/`)) {
        if (!best || prefix.length > best.len) best = { tab, len: prefix.length };
      }
    }
  }
  return best?.tab ?? null;
}

/**
 * Screens that keep the Shekk chrome (tab bar + quick menu). Everything else is
 * a mini app: full-bleed, its own splash, one floating back button.
 *
 * What's On, activity detail and My Tickets are destinations, not tools, so they
 * stay inside the chrome.
 */
const CHROME_ROOTS = new Set<string>([
  ...TAB_ORDER,
  "/social",
  "/benefits",
  "/guides",
  "/news",
  "/before-you-fly",
  "/whats-on",
  "/tickets",
]);

const CHROME_PREFIXES = ["/whats-on/", "/programme/", "/explore/events", "/explore/event/"];

/** True when a path is a browsing destination that keeps tabs, not a mini app. */
export function keepsChrome(pathname: string): boolean {
  const path = clean(pathname);
  return CHROME_ROOTS.has(path) || CHROME_PREFIXES.some((p) => path.startsWith(p));
}
