## Goal

Live English-language Israeli headlines on the For You page, tapping through to a full news screen, with urgent/security items visually elevated.

## Sources

Four public English RSS feeds, merged and de-duplicated:
- Times of Israel
- Jerusalem Post
- Ynetnews
- Arutz Sheva (Israel National News)

Each headline keeps its source name, publish time and link out to the original article. Nothing is rewritten or summarised — headline + source + time only, so there's no editorial or copyright exposure.

## Data layer

- `src/lib/news-types.ts` — `NewsItem` shape (id, title, source, url, publishedAt, urgent) plus the urgency heuristic.
- `src/lib/news.server.ts` — fetches all four feeds in parallel with a short timeout, parses the XML with a small dependency-free reader (no Node-only libraries; must run in the edge worker), normalises dates, drops duplicates by normalised title, sorts newest-first, caps the list, and degrades gracefully if a feed is down (returns whatever succeeded).
- `src/lib/news.functions.ts` — `getIsraelNews` server function (GET, no auth, public read).
- `src/lib/news.ts` — `useNews()` React Query hook: 5-minute stale time, refetch on window focus, same pattern as the existing weather/Jewish hooks.

## Urgent highlighting

A keyword heuristic over the headline (rocket, siren, Home Front Command, attack, alert, security incident, etc.). Urgent items:
- push the news tile to the top of For You and switch it to an alert gradient,
- get a red "Live" pill on the /news page.

The tile and page carry a one-line disclaimer that this is press coverage, not an official Home Front Command alert.

## For You tile

New `news` widget in `src/lib/widgets.ts`:
- title "Israel news", headline = latest item, rows = next few headlines with source and relative time,
- relevance boosted when an urgent item is present (jumps to hero position), otherwise mid-pack,
- detail sheet lists ~6 headlines and a "See all news" CTA to `/news`,
- loading and unavailable states matching the existing weather widget behaviour.

The tile also appears in For You settings automatically, so it can be pinned or hidden like every other widget.

## /news route

`src/routes/news.tsx` inside `AppShell`:
- urgent items in a highlighted band at the top when present,
- source filter chips (All / Times of Israel / JPost / Ynet / Arutz Sheva),
- headline list with source, relative time and outbound link (new tab, `rel="noopener noreferrer"`),
- pull-to-refresh style refresh button, last-updated stamp, empty/error state,
- its own `head()` with Shekk-specific title, description, og and twitter tags.

Also linked from the Explore tab's list so it's reachable without the widget.

## Technical notes

- Feeds are fetched server-side only — avoids browser CORS entirely and keeps one warm cache per deployment.
- Parsing is regex/string based over `<item>`/`<entry>` blocks with HTML entity decoding; no `xml2js`/`sharp`-class dependencies that break on the worker runtime.
- All titles are rendered as text, never `dangerouslySetInnerHTML`.
- No database changes, no auth changes, no money-layer changes.
