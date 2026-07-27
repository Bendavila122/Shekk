## Goal
Add a personalised, swipeable "For You" section below the existing Home content. Nothing on the current Home screen changes — greeting, search, recents, "Paying people" card and re-verify banner all stay exactly as they are.

All data stays mock/simulated (consistent with the rest of the prototype): no real weather API, GPS or news feed. A deterministic "context engine" derives the user's situation from the clock, calendar, their stored transactions, recent apps and program city, so the screen genuinely changes through the day and differs between users.

## 1. Context engine — `src/lib/personalise.ts` (new)
A single `useUserContext()` hook returning:
- `timeOfDay` (early / morning / afternoon / evening / late), `dayOfWeek`
- `isErevShabbat`, `isShabbat`, `isMotzash`, plus a small hard-coded Hebrew-calendar table for chagim and fast days (Chanukah, Tu BiShvat, Purim, Pesach, Yom HaZikaron/Atzmaut, Lag BaOmer, Shavuot, 17 Tammuz, Tisha B'Av, Yamim Noraim, Sukkot) with candle-lighting / havdalah / fast times per city
- `city` derived from the user's program (`PROGRAMS[].city`) — Jerusalem, Tel Aviv etc.
- `weather` — deterministic pseudo-random per city + date: temp, condition, UV, rain %, AQI, sunrise/sunset
- Behaviour signals computed from `state.txns` and recent apps: top category, favourite merchant, spend-this-week, whether transit spend is stale (Rav-Kav low), pending splits count

Deterministic seeding uses a hash of name + date, so two different users get different content but the same user's screen is stable within a session.

## 2. Widget catalogue — `src/lib/widgets.tsx` (new)
Nine widget definitions, each with `id`, `title`, `icon/emoji`, `gradient` token, a `relevance(ctx) => number` score, and a render body:
- **Today** — weather, temp, UV, rain %, AQI, sunrise/sunset; on Friday swaps to candle lighting + havdalah. CTA "View forecast".
- **Wallet** — Shekk balance, spend this week, pending split count, cashback, promo codes. CTAs: Add Credits / Split Bill / View Activity.
- **Happening Nearby** — 3–4 events from `EVENTS` + city-flavoured extras. CTA "View Events".
- **Travel** — next train/bus from `BUS_LINES`, Rav-Kav balance warning, traffic, taxi pricing. CTA "Plan Journey".
- **Deals For You** — offers picked from `SHOPS`/`RESTAURANTS` filtered by the user's actual top spending category and favourite merchant. Never random.
- **Israel Today** — 3–5 neutral headlines (transport, student, holiday, weather, national), rotated by date. CTA "Read More".
- **Jewish Life** — Friday: candle lighting, Friday-night meals, minyan times from `SHULS`; fast day: fast begins/ends; chag: countdown + guides. CTA "View Details".
- **Social** — friend activity from `FEED`, someone paid you back, pending splits, programme announcements. CTA "Open".
- **Discover** — nearby café/restaurant/attraction/volunteering/student-discount picks for the user's city.

Each widget's relevance score combines time of day, day of week, holiday state and behaviour signals, matching the requested ordering (morning → Weather/Travel/Wallet; afternoon → Food/Deals; evening → Events/Nightlife; late Friday → Jewish Life first).

## 3. UI — `src/components/ForYou.tsx` (new)
- Horizontal scroll-snap carousel (`overflow-x-auto snap-x snap-mandatory no-scrollbar`), one card ≈ 85% of viewport width, peek of the next card.
- Cards: `rounded-[1.75rem]`, soft gradient backgrounds from new design tokens, large emoji/icon header, clear title/subtitle hierarchy, body rows, optional CTA button row.
- Dot pagination under the rail that tracks scroll position.
- Header row: "For You" + a small settings/pin button opening the customisation sheet.
- Skeleton cards on first paint, then a gentle staggered `fade-in`.
- Pull-to-refresh: touch-drag at scroll-top reveals a spinner, re-seeds the context and re-animates values.
- Micro-interactions: snap-scroll, `tap-icon`-style press feedback, `navigator.vibrate` haptic on CTA/pin where supported, animated number transitions on refresh.

## 4. Customisation — `src/components/ForYouSettings.tsx` (new)
Bottom sheet listing all widgets with: pin toggle, hide toggle, drag-free up/down reorder arrows for pinned items, and a compact/expanded size switch. Preferences persist in `localStorage` (`shekk.foryou.v1`). Pinned widgets always render first in the user's order; the rest are sorted by relevance score; hidden ones are excluded.

## 5. Wiring
- `src/routes/index.tsx`: insert `<ForYou />` after the "Paying people" section and before `<ReverifyBanner />`. No other edits to this file.
- `src/styles.css`: add gradient + surface tokens for the widget backgrounds (`--gradient-sky`, `--gradient-wallet`, `--gradient-events`, etc.) plus a `skeleton` shimmer utility — all semantic tokens, no hardcoded colours in components.

## Technical notes
- All new logic is client-side and derives from existing store state and mock data; no backend, no network calls, no new dependencies.
- Deterministic hashing keeps SSR and hydration consistent; anything clock-dependent is read in `useEffect` to avoid hydration mismatch.
- Existing Home components and routes are untouched apart from the single insertion point.
