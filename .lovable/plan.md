## Goal

Right now both widgets are simulated. `src/lib/personalise.ts` invents the weather from a hash of the student's name and reads candle lighting / havdalah / sunrise / sunset from a hardcoded `CITY_PROFILE` table (Jerusalem always 16:38 / 17:53), and the sedra comes from a fixed 54-week counter anchored to "12 October", so it drifts and ignores double parshiyot and chagim. The Hebrew date is the only genuinely correct value.

Plan: replace both with live data keyed off the student's actual coordinates.

## 1. Live Jewish Life data (Hebcal)

New `src/lib/jewish.ts` + a server function that calls Hebcal (free, no key) for the current location:

- Zmanim (`/zmanim`): sunrise, sunset, alot hashachar, chatzot, pliag, tzeit — computed from the exact lat/lon and timezone, not a city table.
- Shabbat/chag times (`/shabbat`): candle lighting (correct local minhag offset — 40 min Jerusalem, 18/20 min elsewhere), havdalah, and the parsha for that week including double parshiyot ("Matot-Masei") and "Shabbat Chazon" style specials.
- Holidays (`/hebcal`): today's yom tov / fast / minor day with real fast start and end times, replacing the hardcoded `JEWISH_CALENDAR` MM-DD table.
- Hebrew date from Hebcal converter (keeps the existing `Intl` value as an offline fallback).

Cached per city+date, refreshed in the background, with the current static values kept only as a last-resort offline fallback (labelled as such in the sheet, so the widget never silently shows a wrong candle time).

The widget itself gains real state: on Friday it shows tonight's candle lighting with a countdown; on Shabbat it shows havdalah; on a fast day, real fast begin/end; otherwise sedra + zmanim.

## 2. Live weather (Open-Meteo)

New `src/lib/weather.ts` server function calling Open-Meteo forecast + air-quality endpoints for the location's lat/lon:

- Current temp, apparent temp, WMO weather code mapped to our condition labels/emoji, UV index, precipitation probability, daily high/low, plus European AQI from the air-quality endpoint.
- Condition mapping drives the existing `gradientFor` colours (sun / cloud / rain / haze / night), so tiles keep reacting to real weather.
- Short client cache (~15 min) and a stale-data indicator; if the call fails, the tile shows "Weather unavailable" rather than fabricated numbers.

## 3. Location logic, properly

- `LocationBar` keeps the one-time permission ask, but on success we now reverse-geocode the coordinates (Open-Meteo's geocoding/BigData-style reverse lookup, Israel-scoped) so any location in Israel resolves to a real city/neighbourhood name, falling back to `nearestPlace()` from the current list when the lookup fails.
- Watch and refresh: re-detect when the app returns to the foreground, and re-fetch weather/zmanim when the student moves more than ~5 km.
- Manual picker becomes the authoritative override — expanded to all Israeli cities we support, searchable, and once set it sticks until the student taps "Use my current location" again.
- Denied / unavailable / timeout each get a distinct, honest message plus a direct route to the picker; both widgets then use the picked city's coordinates.
- Everything — weather, zmanim, candle lighting, sedra specials — reads from one shared `place` (lat/lon), so the two widgets can never disagree about where you are.

## 4. Widget UI

- Jewish Life detail sheet: full zmanim list for the day (alot, sunrise, sof zman kriat shema, chatzot, mincha gedola, shkia, tzeit), candle/havdalah, upcoming chag, and a "times for <city>" line with a change-location control.
- Today/weather sheet: hourly-ish summary, high/low, UV, rain chance, AQI, and the same city control (currently a separate `WEATHER_CITIES` list — merged into the single location source).
- Loading skeletons instead of placeholder numbers; timestamp of last refresh.

## Technical notes

- Both fetches go through `createServerFn` so upstream calls are server-side and cacheable, wrapped in TanStack Query with `staleTime` (weather 15 min, zmanim until midnight).
- `personalise.ts` keeps its role for spending signals and seeding, but its `CITY_PROFILE` zmanim, `CONDITIONS` random weather and `JEWISH_CALENDAR` table are removed from the live path.
- No API keys or new secrets needed; Hebcal and Open-Meteo are both free and unauthenticated.
