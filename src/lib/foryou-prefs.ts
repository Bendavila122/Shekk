/** Local persistence for the Home "For You" rail preferences. */
import { useCallback, useEffect, useState } from "react";

const KEY = "shekk.foryou.v1";

export type ForYouPrefs = {
  pinned: string[];
  hidden: string[];
  size: "compact" | "expanded";
  weatherCity: string | null;
};

const DEFAULTS: ForYouPrefs = { pinned: [], hidden: [], size: "expanded", weatherCity: null };

function read(): ForYouPrefs {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? { ...DEFAULTS, ...(JSON.parse(raw) as Partial<ForYouPrefs>) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

export function useForYouPrefs() {
  const [prefs, setPrefs] = useState<ForYouPrefs>(DEFAULTS);

  useEffect(() => setPrefs(read()), []);

  const save = useCallback((next: ForYouPrefs) => {
    setPrefs(next);
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignore quota errors — prototype only */
    }
  }, []);

  const togglePin = useCallback(
    (id: string) =>
      save({
        ...prefs,
        pinned: prefs.pinned.includes(id) ? prefs.pinned.filter((x) => x !== id) : [...prefs.pinned, id],
      }),
    [prefs, save],
  );

  const toggleHide = useCallback(
    (id: string) =>
      save({
        ...prefs,
        hidden: prefs.hidden.includes(id) ? prefs.hidden.filter((x) => x !== id) : [...prefs.hidden, id],
        pinned: prefs.pinned.filter((x) => x !== id),
      }),
    [prefs, save],
  );

  const move = useCallback(
    (id: string, dir: -1 | 1) => {
      const i = prefs.pinned.indexOf(id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= prefs.pinned.length) return;
      const pinned = [...prefs.pinned];
      [pinned[i], pinned[j]] = [pinned[j], pinned[i]];
      save({ ...prefs, pinned });
    },
    [prefs, save],
  );

  const setSize = useCallback((size: ForYouPrefs["size"]) => save({ ...prefs, size }), [prefs, save]);

  const setWeatherCity = useCallback((weatherCity: string | null) => save({ ...prefs, weatherCity }), [prefs, save]);

  const reset = useCallback(() => save(DEFAULTS), [save]);

  return { prefs, togglePin, toggleHide, move, setSize, setWeatherCity, reset };
}

export function haptic(ms = 8) {
  // Respect the Settings › Appearance haptics switch.
  try {
    const raw = localStorage.getItem("shekk.state.v2");
    if (raw && JSON.parse(raw)?.settings?.hapticFeedback === false) return;
  } catch {
    /* ignore */
  }
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(ms);
    } catch {
      /* unsupported */
    }
  }
}
