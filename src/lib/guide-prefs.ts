/**
 * Device-local state for the Guides mini app: which guides you saved, how far
 * you read, and which checklist boxes you ticked. Nothing here touches money
 * or the account — it's a reading-comfort layer, stored on the phone.
 */
import { useCallback, useEffect, useState } from "react";

const KEY = "shekk.guides.v1";

export type GuidePrefs = {
  saved: string[];
  /** guide id → furthest scroll progress, 0–1. */
  progress: Record<string, number>;
  /** "guideId:blockId" → ticked item indexes. */
  checks: Record<string, number[]>;
  /** guide id → thumbs verdict. */
  useful: Record<string, "yes" | "no">;
};

const DEFAULTS: GuidePrefs = { saved: [], progress: {}, checks: {}, useful: {} };

function read(): GuidePrefs {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? { ...DEFAULTS, ...(JSON.parse(raw) as Partial<GuidePrefs>) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

function write(next: GuidePrefs) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("shekk:guides"));
  } catch {
    /* quota — ignore */
  }
}

export function useGuidePrefs() {
  const [prefs, setPrefs] = useState<GuidePrefs>(DEFAULTS);

  useEffect(() => {
    const sync = () => setPrefs(read());
    sync();
    window.addEventListener("shekk:guides", sync);
    return () => window.removeEventListener("shekk:guides", sync);
  }, []);

  const save = useCallback((next: GuidePrefs) => {
    setPrefs(next);
    write(next);
  }, []);

  const toggleSaved = useCallback(
    (id: string) =>
      save({
        ...prefs,
        saved: prefs.saved.includes(id) ? prefs.saved.filter((x) => x !== id) : [id, ...prefs.saved],
      }),
    [prefs, save],
  );

  const setProgress = useCallback(
    (id: string, value: number) => {
      const current = prefs.progress[id] ?? 0;
      const next = Math.min(1, Math.max(current, value));
      if (next - current < 0.05 && !(next >= 0.99 && current < 0.99)) return;
      save({ ...prefs, progress: { ...prefs.progress, [id]: next } });
    },
    [prefs, save],
  );

  const toggleCheck = useCallback(
    (key: string, index: number) => {
      const list = prefs.checks[key] ?? [];
      const next = list.includes(index) ? list.filter((i) => i !== index) : [...list, index];
      save({ ...prefs, checks: { ...prefs.checks, [key]: next } });
    },
    [prefs, save],
  );

  const rate = useCallback(
    (id: string, verdict: "yes" | "no") =>
      save({
        ...prefs,
        useful: { ...prefs.useful, [id]: prefs.useful[id] === verdict ? verdict : verdict },
      }),
    [prefs, save],
  );

  return { prefs, toggleSaved, setProgress, toggleCheck, rate };
}
