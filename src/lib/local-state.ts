/**
 * Tiny device-local state hook for the interactive assistants.
 *
 * Nothing here touches money or the account — it's the "what did I tick,
 * what did I learn, what did I type into the calculator" layer, stored on
 * the phone so an assistant remembers where you were.
 */
import { useCallback, useEffect, useRef, useState } from "react";

export function useLocalState<T extends object>(key: string, defaults: T) {
  const defaultsRef = useRef(defaults);
  const [value, setValue] = useState<T>(defaults);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) setValue({ ...defaultsRef.current, ...(JSON.parse(raw) as Partial<T>) });
    } catch {
      /* unreadable or unparseable — fall back to defaults */
    }
    setReady(true);
  }, [key]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          /* quota — keep it in memory */
        }
        return resolved;
      });
    },
    [key],
  );

  return { value, update, ready };
}

/** Add or remove an id from a list. */
export function toggleId(list: string[], id: string) {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

/** Stable "today" index so daily content is the same all day, per device. */
export function dayIndex(date = new Date()) {
  return Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000,
  );
}

/** Today's ISO date, used for streaks. */
export function todayISO(date = new Date()) {
  return date.toISOString().slice(0, 10);
}
