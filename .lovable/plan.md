## Goal

Two problems with the Jewish Life widget:

1. The artwork is a generic city silhouette with a dome and spire floating above it, so it doesn't read as anywhere in particular.
2. The calendar data is only partly location-aware. It is hard-wired to Jerusalem time and the Israeli holiday scheme, the Hebrew date never rolls over at nightfall, and several values are picked from a 21-day window rather than from the day/Shabbat they belong to.

---

## Part 1 — Redraw the backdrop (recognisable Jerusalem)

Rebuild the scene illustration so it is one coherent, hand-drawn Old City view instead of a random skyline:

- One grounded horizon: layered Judean stone hills at the back, city wall with crenellations across the front, everything sitting on a single baseline.
- Landmarks in correct relative position and scale: the Dome of the Rock (dome on its drum, sitting on the platform, not floating), the Hurva dome, the Tower of David with its tapered minaret-style tower, low stone rooftops with arched windows, and two cypress trees for depth.
- Depth pass: hills in a lighter tint behind, wall and rooftops in the dark silhouette tint, so it stops looking like one flat cut-out.
- Anchor the Shabbat candles on the wall ledge with a soft pool of light, instead of hovering in empty sky.
- Fix the daytime sky, which currently runs blue straight into orange. Days become blue to warm Jerusalem stone; erev keeps the sunset; Shabbat and chag keep their night palettes; a fast day stays desaturated.
- Scene state driven by real data rather than the clock: stars appear after actual nightfall (tzeit) for that location, candles appear from the hours before candle-lighting through havdalah, and chag/fast states come from the calendar as they do now.
- Both tile sizes and the small icon in the detail sheet get the correct crop, so the wall is never cut through a landmark.

## Part 2 — Make the data accurate and location-specific

The widget follows wherever the student actually is (their GPS fix, or the city they pinned), including before they fly out.

- **Timezone follows location.** Times are currently formatted in Asia/Jerusalem no matter what. Resolve the real timezone for the coordinates and use it for every time shown, the "today" date boundary, and the calendar request.
- **Israel vs diaspora scheme.** The Israeli scheme is currently forced. Detect whether the coordinates are in Israel and use the Israeli scheme there, the diaspora scheme (two-day chagim, diaspora parasha cycle after a split) abroad. A one-line note names which scheme is in use when abroad.
- **Correct candle-lighting custom.** Right now only "within 12 km of Jerusalem" gets 40 minutes and everywhere else gets 18. Add the real customs for the main Israeli cities (Jerusalem 40, Haifa and Zichron Ya'akov 30, Be'er Sheva, Tel Aviv, Netanya, Petach Tikva and the rest at their local minhag), and the standard 18 minutes abroad — with the offset stated in the detail sheet so nobody is guessing.
- **Hebrew date rolls over at nightfall.** After shkia the widget should already show the next Hebrew date, and label the evening as erev where relevant. It currently shows the daytime date all night.
- **Correct Hebrew month names.** There is an empty lookup table in the code today, so month names pass through raw. Use full transliterated names, with Adar I / Adar II handled in a leap year.
- **Values tied to the right day.** Parashat hashavua, "this Shabbat" specials (Shabbat Mevarchim, Rosh Chodesh, Chazon, Nachamu, Shuva and so on), candle-lighting and havdalah are all picked from the next relevant occasion relative to now — including a chag candle-lighting mid-week — instead of the first match in a three-week window. Past times stop showing as upcoming.
- **Fasts.** Take each fast's real start from the calendar rather than assuming: Yom Kippur and Tisha B'Av from the previous evening's shkia, minor fasts from alot hashachar, ending at tzeit for that location.
- **Freshness.** Data currently refreshes at midnight only. Add a refresh at the next shkia and at the next candle-lighting or havdalah instant, so the tile changes state at the moment it should, and keep it keyed to the current place so switching cities refetches.
- **Say where the times are for.** Like the weather tile, the Jewish Life tile and sheet name the place ("Times for Jerusalem"), plus a live countdown to the next moment that matters ("Candles in 4h 12m").

## Technical notes

- Scene: rewrite `src/components/JewishScene.tsx` (multi-layer inline SVG: hills, wall, landmarks, trees) and the `.jl-*` block in `src/styles.css` for palettes, candle anchoring and layering. `jewishSceneKind` gains the real sunset/nightfall and candle-window inputs.
- Data: rewrite the Jewish half of `src/lib/live.server.ts` — timezone resolution from the coordinates (available from the weather provider's response), an Israel bounding check, a candle-offset city table, a nightfall-aware Hebrew date conversion, and occasion-scoped selection of parasha/candles/havdalah/specials/fasts. `LiveJewish` in `src/lib/live-types.ts` grows fields for tzid, candle offset, scheme, nightfall, next-moment ISO and labels.
- Presentation: `src/lib/widgets.ts` (rows, headline, countdown, place label) and the small amount of scene wiring in `src/components/ForYou.tsx`; `src/lib/personalise.ts` uses the real instants for erev/Shabbat/motzash in the resolved timezone.
- Verified in the preview at mobile width for a weekday, erev Shabbat and a chag state.
