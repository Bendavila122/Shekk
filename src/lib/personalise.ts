/**
 * Deterministic personalisation engine for the Home "For You" rail.
 *
 * Everything here is simulated (this is a prototype — no GPS, weather API or
 * news feed). Values are derived from the clock, a small Jewish-calendar table,
 * the student's programme city and their own stored activity, then seeded with
 * a hash of their name so two students never see the same Home screen.
 */
import { useEffect, useMemo, useState } from "react";
import { type Txn } from "./mock";
import { useApp } from "./store";
import type { LiveJewish, LiveWeather } from "./live-types";

/* ---------------------------------------------------------------- seeding */

export function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/** Stable pseudo-random in [0,1) for a given seed string. */
export function rand(seed: string): number {
  return (hash(seed) % 100000) / 100000;
}

export function pick<T>(arr: readonly T[], seed: string): T {
  return arr[hash(seed) % arr.length];
}

function between(seed: string, min: number, max: number): number {
  return Math.round(min + rand(seed) * (max - min));
}

/* ------------------------------------------------------------- calendar */

export type TimeOfDay = "early" | "morning" | "afternoon" | "evening" | "late";

export type JewishDay = {
  label: string;
  kind: "chag" | "fast" | "minor";
  blurb: string;
};

/* ---------------------------------------------------------------- types */

export type UserContext = {
  ready: boolean;
  now: Date;
  hour: number;
  timeOfDay: TimeOfDay;
  dayOfWeek: number; // 0 = Sunday
  isFriday: boolean;
  isErevShabbat: boolean;
  isShabbat: boolean;
  isMotzash: boolean;
  jewishDay: JewishDay | null;
  sedra: string | null;
  hebrewDate: string;
  city: string;
  /** Where the live data is measured — the student's detected or chosen place. */
  weatherCity: string;
  /** Live Hebcal payload; null while loading or if Hebcal is unreachable. */
  jewish: LiveJewish | null;
  jewishLoading: boolean;
  jewishError: boolean;
  /** Live Open-Meteo payload; null while loading or if the fetch failed. */
  weather: LiveWeather | null;
  weatherLoading: boolean;
  weatherError: boolean;
  signals: {
    topCategory: string;
    favouriteMerchant: string;
    spentThisWeek: number;
    pendingSplits: number;
    lastTransitSpend: number;
    ravKavLow: boolean;
    requests: { from: string; reason: string; amount: number }[];
    requestedTotal: number;
    seed: string;
  };
};


function timeOfDay(hour: number): TimeOfDay {
  if (hour < 6) return "early";
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  if (hour < 22) return "evening";
  return "late";
}

function signalsFrom(txns: Txn[], seed: string) {
  const spends = txns.filter((t) => t.amount < 0);
  const byCategory = new Map<string, number>();
  const byMerchant = new Map<string, number>();
  for (const t of spends) {
    byCategory.set(t.category, (byCategory.get(t.category) ?? 0) + Math.abs(t.amount));
    byMerchant.set(t.merchant, (byMerchant.get(t.merchant) ?? 0) + Math.abs(t.amount));
  }
  const top = [...byCategory.entries()].sort((a, b) => b[1] - a[1])[0];
  const fav = [...byMerchant.entries()].sort((a, b) => b[1] - a[1])[0];
  const spentThisWeek = spends.reduce((s, t) => s + Math.abs(t.amount), 0);
  const lastTransitSpend = spends
    .filter((t) => t.category.toLowerCase().includes("transit"))
    .reduce((s, t) => s + Math.abs(t.amount), 0);

  return {
    topCategory: top?.[0] ?? "Food & drink",
    favouriteMerchant: fav?.[0] ?? "Cafe Rimon",
    spentThisWeek: +spentThisWeek.toFixed(2),
    lastTransitSpend,
    ravKavLow: lastTransitSpend < 60,
    seed,
  };
}

/* ----------------------------------------------------------------- hook */

/**
 * Reads the clock only after mount so SSR and hydration agree.
 * `refreshKey` re-seeds the simulated live values; `weatherCityOverride`
 * lets the student point the weather widget at another Israeli city.
 */
export function useUserContext(refreshKey = 0, weatherCityOverride?: string | null): UserContext {
  const { state } = useApp();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, [refreshKey]);

  return useMemo<UserContext>(() => {
    const d = now ?? new Date(2026, 0, 1, 9, 0, 0);
    const hour = d.getHours();
    const dayOfWeek = d.getDay();
    const mmdd = `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const programCity = PROGRAMS.find((p) => p.id === state.programId)?.city ?? "Jerusalem";
    const city = programCity.includes("Tel Aviv") ? "Tel Aviv" : programCity.includes("Jerusalem") ? "Jerusalem" : "Israel";
    const weatherCity = weatherCityOverride && CITY_PROFILE[weatherCityOverride] ? weatherCityOverride : city;
    const zmanim = CITY_PROFILE[weatherCity] ?? CITY_PROFILE.Default;

    const seed = `${state.name}|${city}|${mmdd}|${refreshKey}`;
    const wSeed = `${seed}|${weatherCity}`;
    const condition = pick(CONDITIONS, `${wSeed}|cond`);
    const base = (CITY_PROFILE[weatherCity] ?? CITY_PROFILE.Default).base;
    const temp = between(`${wSeed}|temp`, base - 5, base + 5);
    const unpaid = state.splits.filter((s) => !s.paid);

    return {
      ready: now !== null,
      now: d,
      hour,
      timeOfDay: timeOfDay(hour),
      dayOfWeek,
      isFriday: dayOfWeek === 5,
      isErevShabbat: dayOfWeek === 5 && hour >= 11,
      isShabbat: (dayOfWeek === 5 && hour >= 17) || (dayOfWeek === 6 && hour < 18),
      isMotzash: dayOfWeek === 6 && hour >= 18,
      jewishDay: JEWISH_CALENDAR[mmdd] ?? null,
      sedra: sedraFor(d),
      hebrewDate: hebrewDate(d),
      city,
      weatherCity,
      zmanim,
      weather: {
        temp,
        feels: temp + between(`${wSeed}|feels`, -2, 3),
        condition: condition.label,
        emoji: condition.emoji,
        uv: between(`${wSeed}|uv`, 2, 9),
        rain: between(`${wSeed}|rain`, 0, condition.label === "Light rain" ? 80 : 25),
        aqi: between(`${wSeed}|aqi`, 18, 74),
        high: temp + between(`${wSeed}|hi`, 1, 5),
        low: temp - between(`${wSeed}|lo`, 3, 8),
      },
      signals: {
        ...signalsFrom(state.txns, seed),
        pendingSplits: unpaid.length,
        requests: unpaid.map((s) => ({ from: s.from, reason: s.reason, amount: s.amount })),
        requestedTotal: +unpaid.reduce((sum, s) => sum + s.amount, 0).toFixed(2),
      },
    };
  }, [now, refreshKey, weatherCityOverride, state.name, state.programId, state.txns, state.splits]);

}
