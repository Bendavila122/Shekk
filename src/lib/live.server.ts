/**
 * Live data sources for the Home widgets.
 *
 * Weather + air quality: Open-Meteo (free, unauthenticated).
 * Jewish calendar, zmanim, candle lighting: Hebcal (free, unauthenticated).
 * Reverse geocoding: OpenStreetMap Nominatim with a BigDataCloud fallback.
 *
 * Everything here runs server-side (called from thin createServerFn wrappers).
 */
import { describeWeatherCode, type LiveJewish, type LivePlaceName, type LiveWeather, type LiveZman } from "./live-types";

const TZID = "Asia/Jerusalem";

async function getJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { accept: "application/json", "user-agent": "Shekk/1.0 (+https://shekk.app)", ...(init?.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`Upstream ${res.status} for ${new URL(url).host}`);
  return (await res.json()) as T;
}

const round = (n: number | null | undefined) => (typeof n === "number" ? Math.round(n) : 0);

/* ------------------------------------------------------------- weather */

export async function fetchWeather(lat: number, lon: number): Promise<LiveWeather> {
  const forecastUrl =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,apparent_temperature,weather_code,is_day,relative_humidity_2m,wind_speed_10m` +
    `&hourly=precipitation_probability,uv_index` +
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max` +
    `&timezone=auto&forecast_days=1`;
  const aqiUrl =
    `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}` +
    `&current=european_aqi&timezone=auto`;

  type Forecast = {
    current: {
      time: string;
      temperature_2m: number;
      apparent_temperature: number;
      weather_code: number;
      is_day: number;
      relative_humidity_2m: number;
      wind_speed_10m: number;
    };
    hourly: { time: string[]; precipitation_probability: (number | null)[]; uv_index: (number | null)[] };
    daily: {
      temperature_2m_max: number[];
      temperature_2m_min: number[];
      precipitation_probability_max: (number | null)[];
      uv_index_max: (number | null)[];
    };
  };

  const [forecast, air] = await Promise.all([
    getJson<Forecast>(forecastUrl),
    getJson<{ current?: { european_aqi?: number | null } }>(aqiUrl).catch(() => null),
  ]);

  const c = forecast.current;
  const isDay = c.is_day === 1;
  const { label, emoji } = describeWeatherCode(c.weather_code, isDay);

  // Line the hourly arrays up with the current hour so UV / rain match "now".
  const hourKey = c.time.slice(0, 13);
  const idx = Math.max(0, forecast.hourly.time.findIndex((t) => t.startsWith(hourKey)));
  const rainNow = forecast.hourly.precipitation_probability?.[idx];
  const uvNow = forecast.hourly.uv_index?.[idx];

  return {
    temp: round(c.temperature_2m),
    feels: round(c.apparent_temperature),
    condition: label,
    emoji,
    uv: round(uvNow ?? forecast.daily.uv_index_max?.[0] ?? 0),
    rain: round(rainNow ?? forecast.daily.precipitation_probability_max?.[0] ?? 0),
    aqi: typeof air?.current?.european_aqi === "number" ? Math.round(air.current.european_aqi) : null,
    high: round(forecast.daily.temperature_2m_max?.[0]),
    low: round(forecast.daily.temperature_2m_min?.[0]),
    humidity: round(c.relative_humidity_2m),
    wind: round(c.wind_speed_10m),
    isDay,
    updatedAt: new Date().toISOString(),
  };
}

/* -------------------------------------------------------- jewish life */

const ZMAN_LABELS: { key: string; label: string }[] = [
  { key: "alotHaShachar", label: "Alot hashachar" },
  { key: "misheyakir", label: "Misheyakir" },
  { key: "sunrise", label: "Netz (sunrise)" },
  { key: "sofZmanShma", label: "Sof zman Shema" },
  { key: "sofZmanTfilla", label: "Sof zman Tefilla" },
  { key: "chatzot", label: "Chatzot" },
  { key: "minchaGedola", label: "Mincha gedola" },
  { key: "plagHaMincha", label: "Plag hamincha" },
  { key: "sunset", label: "Shkia (sunset)" },
  { key: "tzeit7083deg", label: "Tzeit hakochavim" },
];

function hhmm(iso: string | undefined | null, tzid: string): string | null {
  if (!iso) return null;
  try {
    return new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: tzid,
    }).format(new Date(iso));
  } catch {
    return null;
  }
}

/**
 * Candle-lighting minhag for the coordinates. Hebcal's own defaults: 40 minutes
 * before shkia in Jerusalem, 30 in Haifa and Zikhron Ya'akov, 18 everywhere else.
 */
const CANDLE_CITIES: { name: string; lat: number; lon: number; km: number; mins: number }[] = [
  { name: "Jerusalem", lat: 31.7683, lon: 35.2137, km: 14, mins: 40 },
  { name: "Haifa", lat: 32.794, lon: 34.9896, km: 12, mins: 30 },
  { name: "Zikhron Ya'akov", lat: 32.5721, lon: 34.9519, km: 6, mins: 30 },
];

function kmBetween(aLat: number, aLon: number, bLat: number, bLon: number): number {
  const dLat = (aLat - bLat) * 111;
  const dLon = (aLon - bLon) * 111 * Math.cos(((aLat + bLat) / 2) * (Math.PI / 180));
  return Math.sqrt(dLat * dLat + dLon * dLon);
}

function candleOffset(lat: number, lon: number): number {
  for (const c of CANDLE_CITIES) {
    if (kmBetween(lat, lon, c.lat, c.lon) <= c.km) return c.mins;
  }
  return 18;
}

function dateKey(d: Date, tzid: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: tzid, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

/** Day of week (0 = Sunday) in the given timezone. */
function weekdayIn(d: Date, tzid: string): number {
  const name = new Intl.DateTimeFormat("en-US", { timeZone: tzid, weekday: "short" }).format(d);
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(name);
}

const shiftDays = (key: string, days: number): string => {
  const [y, m, d] = key.split("-").map(Number);
  const dt = new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
};

/** Timezone for the coordinates, courtesy of Open-Meteo's `timezone=auto`. */
const tzCache = new Map<string, string>();
async function resolveTz(lat: number, lon: number): Promise<string> {
  const key = `${lat.toFixed(2)},${lon.toFixed(2)}`;
  const hit = tzCache.get(key);
  if (hit) return hit;
  try {
    const res = await getJson<{ timezone?: string }>(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m&timezone=auto`,
    );
    const tz = res.timezone && res.timezone !== "GMT" ? res.timezone : null;
    if (tz) {
      tzCache.set(key, tz);
      return tz;
    }
  } catch {
    /* fall through to the geographic guess */
  }
  // Israel bounding box, else UTC — never guess a wrong offset silently.
  const israelish = lat > 29.4 && lat < 33.4 && lon > 34.2 && lon < 35.9;
  const tz = israelish ? TZID : "UTC";
  tzCache.set(key, tz);
  return tz;
}

const HEBREW_MONTHS: Record<string, string> = {
  Nisan: "Nisan",
  Iyyar: "Iyar",
  Iyar: "Iyar",
  Sivan: "Sivan",
  Tamuz: "Tammuz",
  Tammuz: "Tammuz",
  Av: "Av",
  Elul: "Elul",
  Tishrei: "Tishrei",
  Cheshvan: "Cheshvan",
  Kislev: "Kislev",
  Tevet: "Tevet",
  "Sh'vat": "Shevat",
  Shvat: "Shevat",
  Adar: "Adar",
  "Adar I": "Adar I",
  "Adar II": "Adar II",
  "Adar1": "Adar I",
  "Adar2": "Adar II",
};

type HebcalItem = {
  title: string;
  date: string;
  hdate?: string;
  category: string;
  subcat?: string;
  memo?: string;
  title_orig?: string;
};

type ZmanimRange = { times: Record<string, Record<string, string>> };

export async function fetchJewish(lat: number, lon: number): Promise<LiveJewish> {
  const tzid = await resolveTz(lat, lon);
  const inIsrael = tzid === TZID || (lat > 29.4 && lat < 33.4 && lon > 34.2 && lon < 35.9);
  const now = new Date();
  const today = dateKey(now, tzid);
  const yesterday = shiftDays(today, -1);
  const end = shiftDays(today, 21);
  const b = inIsrael ? candleOffset(lat, lon) : 18;
  const geo = `geo=pos&latitude=${lat}&longitude=${lon}&tzid=${encodeURIComponent(tzid)}`;

  const calUrl =
    `https://www.hebcal.com/hebcal?v=1&cfg=json&maj=on&min=on&mod=on&mf=on&ss=on&nx=on&s=on&c=on&M=on` +
    `${inIsrael ? "&i=on" : ""}&b=${b}&start=${yesterday}&end=${end}&${geo}`;
  const zmanimUrl = `https://www.hebcal.com/zmanim?cfg=json&start=${yesterday}&end=${shiftDays(today, 2)}&${geo}`;

  const [cal, zman] = await Promise.all([
    getJson<{ items: HebcalItem[] }>(calUrl),
    getJson<ZmanimRange>(zmanimUrl).catch(() => ({ times: {} }) as ZmanimRange),
  ]);

  /** Zman instant for a given key on a given date. */
  const at = (key: string, day = today): string | null => zman.times?.[key]?.[day] ?? null;

  const sunsetAt = at("sunset");
  const tzeitAt = at("tzeit7083deg");
  const afterSunset = !!sunsetAt && now >= new Date(sunsetAt);

  // The Hebrew date belongs to the night once shkia has passed.
  const conv = await getJson<{ hy?: number; hm?: string; hd?: number; hebrew?: string }>(
    `https://www.hebcal.com/converter?cfg=json&date=${today}&g2h=1&strict=1${afterSunset ? "&gs=on" : ""}`,
  ).catch(() => ({}) as { hy?: number; hm?: string; hd?: number });

  const hebrewDate =
    conv.hd && conv.hm && conv.hy
      ? `${conv.hd} ${HEBREW_MONTHS[conv.hm] ?? conv.hm} ${conv.hy}`
      : new Intl.DateTimeFormat("en-u-ca-hebrew", { day: "numeric", month: "long", year: "numeric", timeZone: tzid }).format(now);

  const items = cal.items ?? [];
  const dayOf = (i: HebcalItem) => i.date.slice(0, 10);
  const onDay = (i: HebcalItem, day: string) => dayOf(i) === day;
  const instant = (i: HebcalItem) => new Date(i.date);

  /* ---- the Shabbat the sedra and specials belong to: today if it's Shabbat, else the next one */
  const dow = weekdayIn(now, tzid);
  const shabbatDate = shiftDays(today, dow === 6 ? 0 : 6 - dow);

  const parashaItem =
    items.find((i) => i.category === "parashat" && onDay(i, shabbatDate)) ??
    items.find((i) => i.category === "parashat" && dayOf(i) >= today);
  const specialItem = items.find(
    (i) => onDay(i, shabbatDate) && (i.subcat === "shabbat" || (i.category === "roshchodesh" && dow === 6)),
  );

  /* ---- candles / havdalah: the pair we are actually inside or heading into */
  const candlesAll = items.filter((i) => i.category === "candles");
  const havdalahAll = items.filter((i) => i.category === "havdalah");
  const nextHavdalah = havdalahAll.find((i) => instant(i) > now) ?? null;
  const nextCandles = candlesAll.find((i) => instant(i) > now) ?? null;
  // Inside Shabbat / chag when havdalah comes before the next lighting.
  const inside = !!nextHavdalah && (!nextCandles || instant(nextHavdalah) < instant(nextCandles));
  const candleItem = inside
    ? ([...candlesAll].reverse().find((i) => instant(i) <= now) ?? nextCandles)
    : nextCandles;
  const havdalahItem = nextHavdalah;

  const candleFor = (i: HebcalItem | null): string | null => {
    if (!i) return null;
    const day = dayOf(i);
    const erevChag = items.find(
      (x) => x.category === "holiday" && onDay(x, day) && x.subcat !== "shabbat" && /^Erev /.test(x.title),
    );
    if (erevChag) return erevChag.title;
    const chagStart = items.find((x) => x.category === "holiday" && onDay(x, shiftDays(day, 1)) && x.subcat === "major");
    if (chagStart) return `Erev ${chagStart.title}`;
    return "Shabbat";
  };

  /* ---- today's own holiday + what's coming up */
  const holidayDay = afterSunset ? shiftDays(today, 1) : today;
  const holidayToday = items.find(
    (i) => i.category === "holiday" && onDay(i, holidayDay) && i.subcat !== "shabbat",
  );
  const upcomingItem = items.find(
    (i) => i.category === "holiday" && dayOf(i) > holidayDay && (i.subcat === "major" || i.subcat === "fast"),
  );

  const zmanim: LiveZman[] = ZMAN_LABELS.map(({ key, label }) => ({
    key,
    label,
    time: hhmm(at(key), tzid) ?? "—",
  })).filter((z) => z.time !== "—");

  const kindOf = (i: HebcalItem): "chag" | "fast" | "minor" =>
    i.subcat === "fast" ? "fast" : i.subcat === "major" ? "chag" : "minor";

  /* ---- fasts: today's, or one starting tonight */
  const fastItem =
    items.find((i) => i.category === "holiday" && i.subcat === "fast" && onDay(i, today)) ??
    items.find((i) => i.category === "holiday" && i.subcat === "fast" && onDay(i, shiftDays(today, 1))) ??
    null;
  let fast: LiveJewish["fast"] = null;
  if (fastItem) {
    const fastDay = dayOf(fastItem);
    // Yom Kippur and Tisha B'Av begin at shkia the evening before; the rest at dawn.
    const nightFast = /Yom Kippur|Tish/i.test(fastItem.title);
    const beginsAt = nightFast ? at("sunset", shiftDays(fastDay, -1)) : at("alotHaShachar", fastDay);
    const endsAt = at("tzeit85deg", fastDay) ?? at("tzeit7083deg", fastDay);
    const active = fastDay === today || (nightFast && !!beginsAt && now >= new Date(beginsAt));
    if (active || fastDay === shiftDays(today, 1)) {
      fast = {
        label: fastItem.title,
        begins: hhmm(beginsAt, tzid) ?? "—",
        ends: hhmm(endsAt, tzid) ?? "—",
        beginsAt,
        endsAt,
      };
    }
  }

  /* ---- the next moment worth counting down to */
  const candidates: { label: string; at: string | null }[] = [
    fast?.beginsAt && now < new Date(fast.beginsAt) ? { label: `${fast.label} begins`, at: fast.beginsAt } : null,
    fast?.endsAt && fast.beginsAt && now >= new Date(fast.beginsAt) ? { label: "Fast ends", at: fast.endsAt } : null,
    candleItem && instant(candleItem) > now ? { label: "Candle lighting", at: candleItem.date } : null,
    havdalahItem ? { label: "Havdalah", at: havdalahItem.date } : null,
    sunsetAt && now < new Date(sunsetAt) ? { label: "Shkia", at: sunsetAt } : null,
    tzeitAt && now < new Date(tzeitAt) ? { label: "Tzeit hakochavim", at: tzeitAt } : null,
  ].filter(Boolean) as { label: string; at: string | null }[];
  const next =
    candidates
      .filter((c): c is { label: string; at: string } => !!c.at && new Date(c.at) > now)
      .sort((a, z) => +new Date(a.at) - +new Date(z.at))[0] ?? null;

  return {
    hebrewDate,
    afterSunset,
    sedra: parashaItem ? parashaItem.title.replace(/^Parashat\s+/, "") : null,
    shabbatDate,
    shabbatSpecial: specialItem?.title ?? null,
    candle: candleItem ? (hhmm(candleItem.date, tzid) ?? candleItem.title.split(": ")[1] ?? null) : null,
    candleDate: candleItem?.date ?? null,
    candleLabel: candleFor(candleItem),
    candleMins: b,
    havdalah: havdalahItem ? (hhmm(havdalahItem.date, tzid) ?? havdalahItem.title.split(": ")[1] ?? null) : null,
    havdalahDate: havdalahItem?.date ?? null,
    holiday: holidayToday
      ? { label: holidayToday.title, kind: kindOf(holidayToday), blurb: holidayToday.memo ?? "" }
      : null,
    upcoming: upcomingItem ? { label: upcomingItem.title, date: dayOf(upcomingItem) } : null,
    fast,
    zmanim,
    sunrise: hhmm(at("sunrise"), tzid),
    sunset: hhmm(sunsetAt, tzid),
    tzeit: hhmm(tzeitAt, tzid),
    sunsetAt,
    tzeitAt,
    next,
    tzid,
    scheme: inIsrael ? "israel" : "diaspora",
    schemeNote: inIsrael
      ? `Israel calendar · lights ${b} min before shkia`
      : `Diaspora calendar · lights ${b} min before shkia`,
  };
}


/* ---------------------------------------------------- reverse geocoding */

export async function fetchPlaceName(lat: number, lon: number): Promise<LivePlaceName | null> {
  try {
    type Nom = {
      name?: string;
      address?: Record<string, string>;
    };
    const nom = await getJson<Nom>(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&accept-language=en&zoom=14`,
    );
    const a = nom.address ?? {};
    const city = a.city ?? a.town ?? a.village ?? a.municipality ?? a.county ?? a.state;
    const area = a.neighbourhood ?? a.suburb ?? a.quarter ?? a.city_district ?? nom.name;
    if (city) {
      return { city, area: area && area !== city ? area : undefined, country: a.country };
    }
  } catch {
    /* fall through to the backup provider */
  }

  try {
    type Bdc = { city?: string; locality?: string; countryName?: string; principalSubdivision?: string };
    const bdc = await getJson<Bdc>(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
      { redirect: "follow" },
    );
    const city = bdc.city || bdc.locality || bdc.principalSubdivision;
    if (city) {
      return {
        city,
        area: bdc.locality && bdc.locality !== city ? bdc.locality : undefined,
        country: bdc.countryName,
      };
    }
  } catch {
    /* no name available */
  }

  return null;
}
