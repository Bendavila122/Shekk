/**
 * Pure parsers for the live weather providers.
 *
 * Kept free of `fetch` so the response-shape handling is unit-testable, and so
 * the same normalisation runs whichever provider answered.
 *
 * Primary: Open-Meteo (WMO codes, UV, rain probability).
 * Fallback: MET Norway locationforecast (no key, different egress path) — it
 * has no UV or rain *probability*, so those come back `null` rather than being
 * invented.
 */
import { describeWeatherCode, type LiveWeather } from "./live-types";

export type OpenMeteoForecast = {
  current?: {
    time?: string;
    temperature_2m?: number | null;
    apparent_temperature?: number | null;
    weather_code?: number | null;
    is_day?: number | null;
    relative_humidity_2m?: number | null;
    wind_speed_10m?: number | null;
  } | null;
  hourly?: {
    time?: string[];
    precipitation_probability?: (number | null)[];
    uv_index?: (number | null)[];
  } | null;
  daily?: {
    temperature_2m_max?: (number | null)[];
    temperature_2m_min?: (number | null)[];
    precipitation_probability_max?: (number | null)[];
    uv_index_max?: (number | null)[];
  } | null;
};

export type MetNoForecast = {
  properties?: {
    timeseries?: {
      time: string;
      data?: {
        instant?: {
          details?: {
            air_temperature?: number | null;
            relative_humidity?: number | null;
            wind_speed?: number | null;
            cloud_area_fraction?: number | null;
          };
        };
        next_1_hours?: { summary?: { symbol_code?: string } };
        next_6_hours?: { summary?: { symbol_code?: string } };
        next_12_hours?: { summary?: { symbol_code?: string } };
      };
    }[];
  };
};

const round = (n: number | null | undefined) => (typeof n === "number" && Number.isFinite(n) ? Math.round(n) : null);
const num = (n: number | null | undefined) => (typeof n === "number" && Number.isFinite(n) ? n : null);

/** Thrown when a provider answered but the payload is not usable. */
export class WeatherShapeError extends Error {}

export function parseOpenMeteo(json: OpenMeteoForecast, aqi: number | null, now = new Date()): LiveWeather {
  const c = json.current;
  const temp = round(c?.temperature_2m);
  const code = num(c?.weather_code);
  if (temp === null || code === null) {
    throw new WeatherShapeError("Open-Meteo returned no current conditions");
  }
  const isDay = c?.is_day === undefined || c?.is_day === null ? true : c.is_day === 1;
  const { label, emoji } = describeWeatherCode(code, isDay);

  // Line the hourly arrays up with the current hour so UV / rain match "now".
  const hours = json.hourly?.time ?? [];
  const hourKey = (c?.time ?? "").slice(0, 13);
  const found = hourKey ? hours.findIndex((t) => t.startsWith(hourKey)) : -1;
  const idx = found >= 0 ? found : 0;

  const rain = num(json.hourly?.precipitation_probability?.[idx]) ?? num(json.daily?.precipitation_probability_max?.[0]);
  const uv = num(json.hourly?.uv_index?.[idx]) ?? num(json.daily?.uv_index_max?.[0]);

  return {
    temp,
    feels: round(c?.apparent_temperature) ?? temp,
    condition: label,
    emoji,
    uv: round(uv),
    rain: round(rain),
    aqi: round(aqi),
    high: round(json.daily?.temperature_2m_max?.[0]) ?? temp,
    low: round(json.daily?.temperature_2m_min?.[0]) ?? temp,
    humidity: round(c?.relative_humidity_2m) ?? 0,
    wind: round(c?.wind_speed_10m) ?? 0,
    isDay,
    provider: "open-meteo",
    updatedAt: now.toISOString(),
  };
}

/** MET Norway symbol_code → the same labels/emoji the WMO mapping produces. */
export function describeMetSymbol(symbol: string | undefined, isDay: boolean): { label: string; emoji: string } {
  const s = (symbol ?? "").replace(/_(day|night|polartwilight)$/, "");
  if (s === "clearsky") return describeWeatherCode(0, isDay);
  if (s === "fair") return describeWeatherCode(1, isDay);
  if (s === "partlycloudy") return describeWeatherCode(2, isDay);
  if (s === "cloudy") return describeWeatherCode(3, isDay);
  if (s === "fog") return describeWeatherCode(45, isDay);
  if (s.includes("thunder")) return describeWeatherCode(95, isDay);
  if (s.includes("snow") || s.includes("sleet")) return describeWeatherCode(71, isDay);
  if (s.includes("rainshowers")) return describeWeatherCode(80, isDay);
  if (s.includes("drizzle")) return describeWeatherCode(51, isDay);
  if (s.includes("rain")) return describeWeatherCode(61, isDay);
  return describeWeatherCode(3, isDay);
}

export function parseMetNo(json: MetNoForecast, aqi: number | null, now = new Date()): LiveWeather {
  const series = json.properties?.timeseries ?? [];
  if (!series.length) throw new WeatherShapeError("MET Norway returned no timeseries");

  const nowMs = now.getTime();
  // The entry covering "now": the last one at or before now, else the first.
  let current = series[0];
  for (const entry of series) {
    if (Date.parse(entry.time) <= nowMs) current = entry;
    else break;
  }
  const details = current.data?.instant?.details;
  const temp = round(details?.air_temperature);
  if (temp === null) throw new WeatherShapeError("MET Norway returned no temperature");

  const symbol =
    current.data?.next_1_hours?.summary?.symbol_code ??
    current.data?.next_6_hours?.summary?.symbol_code ??
    current.data?.next_12_hours?.summary?.symbol_code;
  const isDay = symbol ? !symbol.endsWith("_night") : true;
  const { label, emoji } = describeMetSymbol(symbol, isDay);

  // Highs / lows across the next 24 hours of instant readings.
  const next24 = series
    .filter((e) => {
      const t = Date.parse(e.time);
      return t >= nowMs && t <= nowMs + 24 * 3600_000;
    })
    .map((e) => num(e.data?.instant?.details?.air_temperature))
    .filter((n): n is number => n !== null);
  const highs = next24.length ? next24 : [temp];

  return {
    temp,
    feels: temp,
    condition: label,
    emoji,
    uv: null,
    rain: null,
    aqi: round(aqi),
    high: Math.round(Math.max(...highs, temp)),
    low: Math.round(Math.min(...highs, temp)),
    humidity: round(details?.relative_humidity) ?? 0,
    // MET Norway reports m/s; the rest of the app shows km/h.
    wind: round((num(details?.wind_speed) ?? 0) * 3.6) ?? 0,
    isDay,
    provider: "met.no",
    updatedAt: now.toISOString(),
  };
}
