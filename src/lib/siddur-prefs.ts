/**
 * Siddur local preferences — same lightweight localStorage pattern as recents.ts.
 * No new state library, no server, no database.
 */
import { useCallback, useEffect, useState } from "react";
import type { NusachId } from "./siddur";

const KEY = "shekk.siddur.v1";
const EVENT = "shekk:siddur";
const MAX_RECENT = 6;

export type DisplayMode = "hebrew" | "bilingual";

export type SiddurPrefs = {
  nusach: NusachId;
  display: DisplayMode;
  /** 0–4, drives the reader font size. */
  textSize: number;
  /** Comfortable line spacing on/off. */
  roomy: boolean;
  favourites: string[];
  recents: string[];
  /** prayerId -> section id last read. */
  positions: Record<string, string>;
  /** Last prayer opened, for "Continue reading". */
  lastPrayerId: string | null;
};

export const DEFAULT_PREFS: SiddurPrefs = {
  nusach: "ashkenaz",
  display: "bilingual",
  textSize: 2,
  roomy: true,
  favourites: [],
  recents: [],
  positions: {},
  lastPrayerId: null,
};

export const TEXT_SIZES = ["text-lg", "text-xl", "text-2xl", "text-3xl", "text-4xl"];

function read(): SiddurPrefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_PREFS;
    return { ...DEFAULT_PREFS, ...(JSON.parse(raw) as Partial<SiddurPrefs>) };
  } catch {
    return DEFAULT_PREFS;
  }
}

function write(next: SiddurPrefs) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(EVENT));
}

/** Hydration-safe reader + writer for the siddur preferences. */
export function useSiddurPrefs() {
  const [prefs, setPrefs] = useState<SiddurPrefs>(DEFAULT_PREFS);
  const [hydrated, setHydrated] = useState(false);

  const sync = useCallback(() => setPrefs(read()), []);

  useEffect(() => {
    sync();
    setHydrated(true);
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, [sync]);

  const update = useCallback((patch: Partial<SiddurPrefs>) => {
    const next = { ...read(), ...patch };
    write(next);
    setPrefs(next);
  }, []);

  const toggleFavourite = useCallback((id: string) => {
    const current = read();
    const favourites = current.favourites.includes(id)
      ? current.favourites.filter((x) => x !== id)
      : [id, ...current.favourites];
    const next = { ...current, favourites };
    write(next);
    setPrefs(next);
  }, []);

  const recordOpen = useCallback((id: string) => {
    const current = read();
    const next: SiddurPrefs = {
      ...current,
      lastPrayerId: id,
      recents: [id, ...current.recents.filter((x) => x !== id)].slice(0, MAX_RECENT),
    };
    write(next);
    setPrefs(next);
  }, []);

  const savePosition = useCallback((prayerId: string, sectionId: string) => {
    const current = read();
    if (current.positions[prayerId] === sectionId) return;
    const next: SiddurPrefs = {
      ...current,
      positions: { ...current.positions, [prayerId]: sectionId },
    };
    write(next);
    setPrefs(next);
  }, []);

  return { prefs, hydrated, update, toggleFavourite, recordOpen, savePosition };
}
