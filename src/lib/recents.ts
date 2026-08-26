/** Recently opened apps and tools — what Home's "Jump back in" row shows. */
import { useCallback, useEffect, useState } from "react";
import { ALL_SERVICES, type Service } from "./services";
import { MONEY_ENABLED } from "./flags";

const KEY = "shekk.recents.v2";
const MAX = 5;

/**
 * Service ids that belong to the paused regulated money product. They are never
 * deleted from a member's storage — just filtered out of the result while
 * MONEY_ENABLED is false, so they return with the flag.
 */
export const MONEY_SERVICE_IDS = new Set(["topup", "split", "exchange", "card", "wallet"]);

/** Sensible starting point before the student has opened anything. */
const DEFAULT_RECENTS = ["siddur", "maps", "fitness", "visa"];

/** Pure: drop paused-money ids while the money product is off. */
export function filterMoneyRecents(ids: string[], moneyEnabled: boolean): string[] {
  return moneyEnabled ? ids : ids.filter((id) => !MONEY_SERVICE_IDS.has(id));
}

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

  return filterMoneyRecents(ids, MONEY_ENABLED)
    .map((id) => ALL_SERVICES.find((s) => s.id === id))
    .filter((s): s is Service => Boolean(s))
    .slice(0, MAX);
}
