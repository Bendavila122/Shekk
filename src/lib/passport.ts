/**
 * Shekk Passport — a small, local-first model for the illustrated travel
 * passport. One entry per Israeli city: visited or not, the date it was
 * stamped, and one memory (photo + caption).
 *
 * Nothing here touches money, auth or the backend. State lives on the device
 * so V1 works offline and cannot break anything else in the app.
 *
 * This file is deliberately data-only + pure helpers so it can be unit tested
 * and so adding a city later is a one-line change.
 */
import { useCallback, useEffect, useMemo, useState } from "react";

export type CityTheme =
  | "jerusalem"
  | "telaviv"
  | "haifa"
  | "eilat"
  | "tiberias"
  | "akko"
  | "tzfat"
  | "beersheva"
  | "herzliya"
  | "netanya"
  | "ashdod"
  | "ashkelon"
  | "nazareth"
  | "ramatgan"
  | "caesarea";

export type PassportCity = {
  id: CityTheme;
  name: string;
  /** Transliterated / alternate name shown small under the title. */
  hebrew: string;
  /** One line of personality on the spread. */
  blurb: string;
  /** Ink colour of the city's stamp. */
  ink: string;
  /** Paper wash behind the illustration. */
  wash: string;
  /** Real coordinates, used only for the optional proximity check-in. */
  lat: number;
  lng: number;
  /** Position on the stylised schematic map, in percent of the map box. */
  map: { x: number; y: number };
};

/** The curated V1 collection. Extensible: add a row, get a new spread. */
export const PASSPORT_CITIES: PassportCity[] = [
  {
    id: "jerusalem",
    name: "Jerusalem",
    hebrew: "Yerushalayim",
    blurb: "Warm stone, old walls, and a city that hums at sunset.",
    ink: "oklch(0.48 0.14 46)",
    wash: "oklch(0.94 0.035 78)",
    lat: 31.7683,
    lng: 35.2137,
    map: { x: 62, y: 58 },
  },
  {
    id: "telaviv",
    name: "Tel Aviv",
    hebrew: "Tel Aviv–Yafo",
    blurb: "Bauhaus balconies, flat white, and the sea at the end of every street.",
    ink: "oklch(0.5 0.16 232)",
    wash: "oklch(0.94 0.03 214)",
    lat: 32.0853,
    lng: 34.7818,
    map: { x: 30, y: 49 },
  },
  {
    id: "haifa",
    name: "Haifa",
    hebrew: "Hefa",
    blurb: "A hillside city stacked above terraced gardens and a working port.",
    ink: "oklch(0.46 0.13 160)",
    wash: "oklch(0.94 0.03 158)",
    lat: 32.794,
    lng: 34.9896,
    map: { x: 33, y: 26 },
  },
  {
    id: "eilat",
    name: "Eilat",
    hebrew: "Eilat",
    blurb: "Red mountains, warm reef, and fish that look photoshopped.",
    ink: "oklch(0.5 0.17 24)",
    wash: "oklch(0.94 0.035 40)",
    lat: 29.5577,
    lng: 34.9519,
    map: { x: 55, y: 94 },
  },
  {
    id: "tiberias",
    name: "Tiberias",
    hebrew: "Tveria",
    blurb: "Low, still and bright — the Kinneret doing its thing.",
    ink: "oklch(0.47 0.13 208)",
    wash: "oklch(0.94 0.03 196)",
    lat: 32.7922,
    lng: 35.5312,
    map: { x: 62, y: 24 },
  },
  {
    id: "akko",
    name: "Akko",
    hebrew: "Acre",
    blurb: "Sea walls, a Crusader crypt, and the best hummus argument in Israel.",
    ink: "oklch(0.45 0.11 258)",
    wash: "oklch(0.94 0.03 250)",
    lat: 32.9281,
    lng: 35.0819,
    map: { x: 33, y: 18 },
  },
  {
    id: "tzfat",
    name: "Tzfat",
    hebrew: "Safed",
    blurb: "Blue doors, mountain air, mystics and alleyways.",
    ink: "oklch(0.45 0.15 258)",
    wash: "oklch(0.94 0.035 252)",
    lat: 32.9646,
    lng: 35.496,
    map: { x: 59, y: 16 },
  },
  {
    id: "beersheva",
    name: "Be'er Sheva",
    hebrew: "Be'er Sheva",
    blurb: "Capital of the Negev — desert light and student energy.",
    ink: "oklch(0.5 0.12 68)",
    wash: "oklch(0.94 0.03 76)",
    lat: 31.2518,
    lng: 34.7913,
    map: { x: 40, y: 75 },
  },
  {
    id: "herzliya",
    name: "Herzliya",
    hebrew: "Herzliya",
    blurb: "Marina masts, quiet beaches and glass towers.",
    ink: "oklch(0.47 0.12 224)",
    wash: "oklch(0.95 0.025 220)",
    lat: 32.1663,
    lng: 34.8436,
    map: { x: 30, y: 44 },
  },
  {
    id: "netanya",
    name: "Netanya",
    hebrew: "Netanya",
    blurb: "Cliff-top promenades and long sandstone beaches.",
    ink: "oklch(0.5 0.13 88)",
    wash: "oklch(0.95 0.03 92)",
    lat: 32.3215,
    lng: 34.8532,
    map: { x: 30, y: 38 },
  },
  {
    id: "ashdod",
    name: "Ashdod",
    hebrew: "Ashdod",
    blurb: "Cranes, containers and a surprisingly good sunset.",
    ink: "oklch(0.46 0.12 244)",
    wash: "oklch(0.94 0.025 236)",
    lat: 31.8014,
    lng: 34.6435,
    map: { x: 27, y: 60 },
  },
  {
    id: "ashkelon",
    name: "Ashkelon",
    hebrew: "Ashkelon",
    blurb: "Ancient columns lying in the sand beside a national park beach.",
    ink: "oklch(0.5 0.12 118)",
    wash: "oklch(0.95 0.03 112)",
    lat: 31.6688,
    lng: 34.5743,
    map: { x: 26, y: 66 },
  },
  {
    id: "nazareth",
    name: "Nazareth",
    hebrew: "Natzeret",
    blurb: "Hill town of domes, spice markets and knafeh.",
    ink: "oklch(0.46 0.13 300)",
    wash: "oklch(0.94 0.03 306)",
    lat: 32.6996,
    lng: 35.3035,
    map: { x: 50, y: 27 },
  },
  {
    id: "ramatgan",
    name: "Ramat Gan",
    hebrew: "Ramat Gan",
    blurb: "Diamond towers on one side, a giant green park on the other.",
    ink: "oklch(0.47 0.13 148)",
    wash: "oklch(0.95 0.03 146)",
    lat: 32.0684,
    lng: 34.8248,
    map: { x: 34, y: 51 },
  },
  {
    id: "caesarea",
    name: "Caesarea",
    hebrew: "Kesariya",
    blurb: "A Roman theatre, an aqueduct, and the sea filling the harbour ruins.",
    ink: "oklch(0.48 0.11 196)",
    wash: "oklch(0.95 0.03 190)",
    lat: 32.5,
    lng: 34.8925,
    map: { x: 30, y: 32 },
  },
];

export function cityById(id: string): PassportCity | null {
  return PASSPORT_CITIES.find((c) => c.id === id) ?? null;
}

/** One city's saved state. */
export type PassportEntry = {
  visited: boolean;
  /** ISO date (yyyy-mm-dd) the stamp was placed. */
  visitedOn?: string;
  /** Downscaled data URL of the single memory photo. */
  photo?: string;
  caption?: string;
};

export type PassportState = {
  /** Keyed by city id; missing key means never visited. */
  entries: Record<string, PassportEntry>;
  /** Set once, so the front matter can say which season this book covers. */
  openedOn?: string;
};

export const PASSPORT_KEY = "shekk.passport.v1";

const EMPTY: PassportState = { entries: {} };

/** Pure: how far the collection has come. */
export function passportProgress(state: PassportState) {
  const visited = PASSPORT_CITIES.filter((c) => state.entries[c.id]?.visited);
  const memories = visited.filter((c) => Boolean(state.entries[c.id]?.photo));
  return {
    total: PASSPORT_CITIES.length,
    visited: visited.length,
    memories: memories.length,
    percent: Math.round((visited.length / PASSPORT_CITIES.length) * 100),
  };
}

/** Pure: "Aug 2026 – Jun 2027" style label for the season a book covers. */
export function seasonLabel(iso?: string) {
  const d = iso ? new Date(iso) : new Date();
  const year = d.getFullYear();
  // A programme year runs roughly Aug → Jul.
  const start = d.getMonth() >= 7 ? year : year - 1;
  return `${start}/${String(start + 1).slice(2)}`;
}

/** Pure: friendly stamp date, e.g. "14 Aug 2026". */
export function stampDate(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

/** Pure: great-circle distance in kilometres. */
export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * Pure: the closest city to a position, plus its distance. Used by the optional
 * "I'm here" check-in — the caller decides whether the distance is close enough.
 */
export function nearestCity(pos: { lat: number; lng: number }) {
  let best: { city: PassportCity; km: number } | null = null;
  for (const city of PASSPORT_CITIES) {
    const km = distanceKm(pos, city);
    if (!best || km < best.km) best = { city, km };
  }
  return best!;
}

/** How close you have to be for a check-in to stamp the page. */
export const CHECKIN_RADIUS_KM = 25;

function read(): PassportState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(PASSPORT_KEY);
    const parsed = raw ? (JSON.parse(raw) as PassportState) : null;
    if (parsed && typeof parsed === "object" && parsed.entries) return parsed;
  } catch {
    /* unreadable — start fresh rather than crash the book */
  }
  return EMPTY;
}

/**
 * The passport state hook. Local-first on purpose: no schema, no RLS, no risk
 * to auth. If this graduates to per-user cloud storage later, only this hook
 * changes.
 */
export function usePassport() {
  const [state, setState] = useState<PassportState>(EMPTY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const loaded = read();
    setState(loaded.openedOn ? loaded : { ...loaded, openedOn: new Date().toISOString() });
    setReady(true);
  }, []);

  const write = useCallback((next: PassportState) => {
    setState(next);
    try {
      window.localStorage.setItem(PASSPORT_KEY, JSON.stringify(next));
    } catch {
      /* quota (usually a big photo) — keep it in memory for this session */
    }
  }, []);

  const patch = useCallback(
    (id: string, entry: Partial<PassportEntry>) => {
      setState((prev) => {
        const next: PassportState = {
          ...prev,
          entries: { ...prev.entries, [id]: { visited: false, ...prev.entries[id], ...entry } },
        };
        try {
          window.localStorage.setItem(PASSPORT_KEY, JSON.stringify(next));
        } catch {
          /* quota */
        }
        return next;
      });
    },
    [],
  );

  const stamp = useCallback(
    (id: string, when = new Date()) =>
      patch(id, { visited: true, visitedOn: when.toISOString().slice(0, 10) }),
    [patch],
  );

  const unstamp = useCallback((id: string) => patch(id, { visited: false }), [patch]);

  const setMemory = useCallback(
    (id: string, photo?: string, caption?: string) => patch(id, { photo, caption }),
    [patch],
  );

  const progress = useMemo(() => passportProgress(state), [state]);

  return { state, ready, stamp, unstamp, setMemory, patch, write, progress };
}

/**
 * Downscale a chosen photo so a scrapbook page never blows the storage quota.
 * Returns a JPEG data URL. Browser-only.
 */
export async function readPhotoAsDataUrl(file: File, max = 900): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Could not read that image"));
      el.src = url;
    });
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not process that image");
    ctx.drawImage(img, 0, 0, w, h);
    return canvas.toDataURL("image/jpeg", 0.72);
  } finally {
    URL.revokeObjectURL(url);
  }
}
