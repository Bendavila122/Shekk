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

function hhmm(iso: string | undefined | null, tzid = TZID): string | null {
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

/** Jerusalem lights 40 minutes before shkia; almost everywhere else is 18. */
function candleOffset(lat: number, lon: number): number {
  const dLat = lat - 31.7683;
  const dLon = lon - 35.2137;
  const km = Math.sqrt((dLat * 111) ** 2 + (dLon * 95) ** 2);
  return km < 12 ? 40 : 18;
}

function dateKey(d: Date, tzid = TZID): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: tzid, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

type HebcalItem = {
  title: string;
  date: string;
  hdate?: string;
  category: string;
  subcat?: string;
  memo?: string;
  title_orig?: string;
};

export async function fetchJewish(lat: number, lon: number): Promise<LiveJewish> {
  const now = new Date();
  const today = dateKey(now);
  const end = dateKey(new Date(now.getTime() + 21 * 86400000));
  const b = candleOffset(lat, lon);
  const geo = `geo=pos&latitude=${lat}&longitude=${lon}&tzid=${encodeURIComponent(TZID)}`;

  const calUrl =
    `https://www.hebcal.com/hebcal?v=1&cfg=json&maj=on&min=on&mod=on&mf=on&ss=on&s=on&c=on&M=on&i=on` +
    `&b=${b}&start=${today}&end=${end}&${geo}`;
  const zmanimUrl = `https://www.hebcal.com/zmanim?cfg=json&date=${today}&${geo}`;
  const convUrl = `https://www.hebcal.com/converter?cfg=json&date=${today}&g2h=1&strict=1`;

  const [cal, zman, conv] = await Promise.all([
    getJson<{ items: HebcalItem[] }>(calUrl),
    getJson<{ times: Record<string, string> }>(zmanimUrl).catch(() => ({ times: {} as Record<string, string> })),
    getJson<{ hebrew?: string; hy?: number; hm?: string; hd?: number; events?: string[] }>(convUrl).catch(() => ({})),
  ]);

  const items = cal.items ?? [];
  const onDay = (i: HebcalItem, day: string) => i.date.slice(0, 10) === day;

  const parashaItem = items.find((i) => i.category === "parashat");
  const candleItem = items.find((i) => i.category === "candles");
  const havdalahItem = items.find((i) => i.category === "havdalah");
  const specialItem = items.find((i) => i.category === "holiday" && i.subcat === "shabbat");

  const holidayToday = items.find(
    (i) => i.category === "holiday" && onDay(i, today) && i.subcat !== "shabbat",
  );
  const upcomingItem = items.find(
    (i) => i.category === "holiday" && !onDay(i, today) && (i.subcat === "major" || i.subcat === "fast"),
  );

  const times = zman.times ?? {};
  const zmanim: LiveZman[] = ZMAN_LABELS.map(({ key, label }) => ({
    key,
    label,
    time: hhmm(times[key]) ?? "—",
  })).filter((z) => z.time !== "—");

  const kindOf = (i: HebcalItem): "chag" | "fast" | "minor" =>
    i.subcat === "fast" ? "fast" : i.subcat === "major" ? "chag" : "minor";

  const fastToday = holidayToday && holidayToday.subcat === "fast" ? holidayToday : null;
  // Tisha B'Av and Yom Kippur start the evening before; the rest start at dawn.
  const majorFast = fastToday ? /Yom Kippur|Tish/i.test(fastToday.title) : false;

  const hebrewMonths: Record<string, string> = {};
  const hebrewDate =
    conv.hd && conv.hm && conv.hy
      ? `${conv.hd} ${hebrewMonths[conv.hm] ?? conv.hm} ${conv.hy}`
      : new Intl.DateTimeFormat("en-u-ca-hebrew", { day: "numeric", month: "long", year: "numeric" }).format(now);

  return {
    hebrewDate,
    sedra: parashaItem ? parashaItem.title.replace(/^Parashat\s+/, "") : null,
    shabbatSpecial: specialItem?.title ?? null,
    candle: candleItem ? (hhmm(candleItem.date) ?? candleItem.title.split(": ")[1] ?? null) : null,
    candleDate: candleItem?.date ?? null,
    havdalah: havdalahItem ? (hhmm(havdalahItem.date) ?? havdalahItem.title.split(": ")[1] ?? null) : null,
    havdalahDate: havdalahItem?.date ?? null,
    holiday: holidayToday
      ? { label: holidayToday.title, kind: kindOf(holidayToday), blurb: holidayToday.memo ?? "" }
      : null,
    upcoming: upcomingItem ? { label: upcomingItem.title, date: upcomingItem.date.slice(0, 10) } : null,
    fast: fastToday
      ? {
          label: fastToday.title,
          begins: (majorFast ? hhmm(times.sunset) : hhmm(times.alotHaShachar)) ?? "—",
          ends: hhmm(times.tzeit85deg) ?? hhmm(times.tzeit7083deg) ?? "—",
        }
      : null,
    zmanim,
    sunrise: hhmm(times.sunrise),
    sunset: hhmm(times.sunset),
    tzeit: hhmm(times.tzeit7083deg),
    tzid: TZID,
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
