/** Recently opened partner apps — the only thing the home screen shows. */
import { useCallback, useEffect, useState } from "react";
import { ALL_SERVICES, type Service } from "./services";

const KEY = "shekk.recents.v2";
const MAX = 5;

/** Sensible starting point before the student has opened anything. */
const DEFAULT_RECENTS = ["gett", "siddur", "topup", "split"];

function read(): string[] {
  if (typeof window === "undefined") return DEFAULT_RECENTS;
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as string[]) : null;
    return Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_RECENTS;
  } catch {
    return DEFAULT_RECENTS;
  }
}

export function recordServiceUse(id: string) {
  if (typeof window === "undefined") return;
  const next = [id, ...read().filter((x) => x !== id)].slice(0, MAX);
  window.localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("shekk:recents"));
}

export function useRecentServices(): Service[] {
  const [ids, setIds] = useState<string[]>(DEFAULT_RECENTS);

  const sync = useCallback(() => setIds(read()), []);

  useEffect(() => {
    sync();
    window.addEventListener("shekk:recents", sync);
    return () => window.removeEventListener("shekk:recents", sync);
  }, [sync]);

  return ids
    .map((id) => ALL_SERVICES.find((s) => s.id === id))
    .filter((s): s is Service => Boolean(s))
    .slice(0, MAX);
}
