/**
 * Deterministic personalisation engine for the Home "For You" rail.
 *
 * Everything here is simulated (this is a prototype — no GPS, weather API or
 * news feed). Values are derived from the clock, a small Jewish-calendar table,
 * the student's programme city and their own stored activity, then seeded with
 * a hash of their name so two students never see the same Home screen.
 */
import { useEffect, useMemo, useState } from "react";
import { PROGRAMS, type Txn } from "./mock";
import { useApp } from "./store";

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

type JewishDay = {
  label: string;
  kind: "chag" | "fast" | "minor";
  blurb: string;
};

/** Small illustrative table keyed by MM-DD (Gregorian approximation). */
const JEWISH_CALENDAR: Record<string, JewishDay> = {
  "12-14": { label: "Chanukah", kind: "chag", blurb: "Night 1 — candles after tzeit" },
  "01-13": { label: "Tu BiShvat", kind: "minor", blurb: "New year of the trees" },
  "03-03": { label: "Purim", kind: "chag", blurb: "Megillah, mishloach manot, seudah" },
  "04-02": { label: "Erev Pesach", kind: "chag", blurb: "Seder night — chametz burn by 10:41" },
  "04-21": { label: "Yom HaZikaron", kind: "minor", blurb: "Siren 20:00 · ceremonies citywide" },
  "04-22": { label: "Yom HaAtzmaut", kind: "chag", blurb: "Israel's independence day" },
  "05-06": { label: "Lag BaOmer", kind: "minor", blurb: "Bonfires · Meron buses run all night" },
  "05-22": { label: "Shavuot", kind: "chag", blurb: "All-night learning · dairy seudot" },
  "07-05": { label: "17 Tammuz", kind: "fast", blurb: "Fast begins 04:12 · ends 20:14" },
  "07-26": { label: "Tisha B'Av", kind: "fast", blurb: "Fast begins 19:36 · ends 20:02" },
  "09-12": { label: "Erev Rosh Hashanah", kind: "chag", blurb: "Two days of yom tov ahead" },
  "09-21": { label: "Yom Kippur", kind: "fast", blurb: "Fast begins 17:59 · ends 19:12" },
  "09-26": { label: "Sukkot", kind: "chag", blurb: "Sukkah hopping across the city" },
};

const CITY_PROFILE: Record<string, { candle: string; havdalah: string; sunrise: string; sunset: string; base: number }> = {
  Jerusalem: { candle: "16:38", havdalah: "17:53", sunrise: "06:38", sunset: "16:58", base: 19 },
  "Tel Aviv": { candle: "16:53", havdalah: "17:55", sunrise: "06:36", sunset: "17:00", base: 23 },
  Haifa: { candle: "16:44", havdalah: "17:54", sunrise: "06:35", sunset: "16:59", base: 22 },
  "Beer Sheva": { candle: "16:52", havdalah: "17:54", sunrise: "06:37", sunset: "17:01", base: 25 },
  Tzfat: { candle: "16:41", havdalah: "17:52", sunrise: "06:34", sunset: "16:57", base: 16 },
  Netanya: { candle: "16:52", havdalah: "17:55", sunrise: "06:36", sunset: "17:00", base: 22 },
  Eilat: { candle: "16:56", havdalah: "17:56", sunrise: "06:29", sunset: "16:54", base: 29 },
  "Tel Aviv Port": { candle: "16:53", havdalah: "17:55", sunrise: "06:36", sunset: "17:00", base: 23 },
  Israel: { candle: "16:45", havdalah: "17:54", sunrise: "06:37", sunset: "16:59", base: 21 },
  Default: { candle: "16:45", havdalah: "17:54", sunrise: "06:37", sunset: "16:59", base: 21 },
};

/** Cities the student can switch the weather widget to. */
export const WEATHER_CITIES = ["Jerusalem", "Tel Aviv", "Haifa", "Beer Sheva", "Tzfat", "Netanya", "Eilat"] as const;

/** Weekly sedra cycle — approximate, cycles from Simchat Torah. */
const PARSHIYOT = [
  "Bereishit", "Noach", "Lech Lecha", "Vayera", "Chayei Sarah", "Toldot", "Vayetzei", "Vayishlach", "Vayeshev",
  "Miketz", "Vayigash", "Vayechi", "Shemot", "Vaera", "Bo", "Beshalach", "Yitro", "Mishpatim", "Terumah",
  "Tetzaveh", "Ki Tisa", "Vayakhel", "Pekudei", "Vayikra", "Tzav", "Shemini", "Tazria", "Metzora", "Acharei Mot",
  "Kedoshim", "Emor", "Behar", "Bechukotai", "Bamidbar", "Naso", "Beha'alotcha", "Shlach", "Korach", "Chukat",
  "Balak", "Pinchas", "Matot", "Masei", "Devarim", "Vaetchanan", "Eikev", "Re'eh", "Shoftim", "Ki Teitzei",
  "Ki Tavo", "Nitzavim", "Vayelech", "Ha'azinu", "V'Zot HaBracha",
];

function sedraFor(d: Date): string {
  const anchor = new Date(d.getFullYear(), 9, 12); // ~Simchat Torah
  const start = d < anchor ? new Date(d.getFullYear() - 1, 9, 12) : anchor;
  const weeks = Math.floor((d.getTime() - start.getTime()) / (7 * 86400000));
  return PARSHIYOT[weeks % PARSHIYOT.length];
}

function hebrewDate(d: Date): string {
  try {
    return new Intl.DateTimeFormat("en-u-ca-hebrew", { day: "numeric", month: "long", year: "numeric" }).format(d);
  } catch {
    return "";
  }
}


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
  city: string;
  zmanim: { candle: string; havdalah: string; sunrise: string; sunset: string };
  weather: {
    temp: number;
    feels: number;
    condition: string;
    emoji: string;
    uv: number;
    rain: number;
    aqi: number;
    high: number;
    low: number;
  };
  signals: {
    topCategory: string;
    favouriteMerchant: string;
    spentThisWeek: number;
    pendingSplits: number;
    lastTransitSpend: number;
    ravKavLow: boolean;
    cashback: number;
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
    cashback: +(spentThisWeek * 0.012).toFixed(2),
    seed,
  };
}

/* ----------------------------------------------------------------- hook */

/**
 * Reads the clock only after mount so SSR and hydration agree.
 * `refreshKey` lets pull-to-refresh re-seed the simulated live values.
 */
export function useUserContext(refreshKey = 0): UserContext {
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
    const zmanim = CITY_PROFILE[city] ?? CITY_PROFILE.Default;

    const seed = `${state.name}|${city}|${mmdd}|${refreshKey}`;
    const condition = pick(CONDITIONS, `${seed}|cond`);
    const temp = between(`${seed}|temp`, city === "Tel Aviv" ? 17 : 13, city === "Tel Aviv" ? 29 : 26);

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
      city,
      zmanim,
      weather: {
        temp,
        feels: temp + between(`${seed}|feels`, -2, 3),
        condition: condition.label,
        emoji: condition.emoji,
        uv: between(`${seed}|uv`, 2, 9),
        rain: between(`${seed}|rain`, 0, condition.label === "Light rain" ? 80 : 25),
        aqi: between(`${seed}|aqi`, 18, 74),
        high: temp + between(`${seed}|hi`, 1, 5),
        low: temp - between(`${seed}|lo`, 3, 8),
      },
      signals: {
        ...signalsFrom(state.txns, seed),
        pendingSplits: state.splits.filter((s) => !s.paid).length,
      },
    };
  }, [now, refreshKey, state.name, state.programId, state.txns, state.splits]);
}
