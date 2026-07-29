/** Shared shapes for the live weather / Jewish-calendar widgets. */

export type LiveWeather = {
  temp: number;
  feels: number;
  condition: string;
  emoji: string;
  uv: number;
  rain: number;
  aqi: number | null;
  high: number;
  low: number;
  humidity: number;
  wind: number;
  isDay: boolean;
  /** ISO timestamp of when the reading was produced. */
  updatedAt: string;
};

export type LiveZman = { key: string; label: string; time: string };

export type LiveJewish = {
  hebrewDate: string;
  /** e.g. "Eikev" or "Matot-Masei". */
  sedra: string | null;
  /** Special shabbat / chag label for the coming shabbat, when there is one. */
  shabbatSpecial: string | null;
  candle: string | null;
  candleDate: string | null;
  havdalah: string | null;
  havdalahDate: string | null;
  holiday: { label: string; kind: "chag" | "fast" | "minor"; blurb: string } | null;
  upcoming: { label: string; date: string } | null;
  fast: { label: string; begins: string; ends: string } | null;
  zmanim: LiveZman[];
  sunrise: string | null;
  sunset: string | null;
  tzeit: string | null;
  tzid: string;
};

export type LivePlaceName = {
  city: string;
  area?: string;
  country?: string;
};

/** WMO weather code → label + emoji, tuned to how Israel actually feels. */
export function describeWeatherCode(code: number, isDay: boolean): { label: string; emoji: string } {
  if (code === 0) return { label: isDay ? "Clear" : "Clear night", emoji: isDay ? "☀️" : "🌙" };
  if (code === 1) return { label: "Mostly sunny", emoji: isDay ? "🌤" : "🌙" };
  if (code === 2) return { label: "Partly cloudy", emoji: "⛅️" };
  if (code === 3) return { label: "Overcast", emoji: "☁️" };
  if (code === 45 || code === 48) return { label: "Hamsin haze", emoji: "🌫" };
  if (code >= 51 && code <= 57) return { label: "Drizzle", emoji: "🌦" };
  if (code >= 61 && code <= 65) return { label: "Light rain", emoji: "🌧" };
  if (code === 66 || code === 67) return { label: "Freezing rain", emoji: "🌧" };
  if (code >= 71 && code <= 77) return { label: "Snow", emoji: "🌨" };
  if (code >= 80 && code <= 82) return { label: "Rain showers", emoji: "🌦" };
  if (code === 85 || code === 86) return { label: "Snow showers", emoji: "🌨" };
  if (code >= 95) return { label: "Thunderstorms", emoji: "⛈" };
  return { label: "Cloudy", emoji: "☁️" };
}
