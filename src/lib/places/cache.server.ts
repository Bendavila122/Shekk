/**
 * Shekk Location Platform — request cache and in-flight dedupe. Server only.
 *
 * Google Places is metered per request, so two things matter: never ask twice
 * for the same thing at the same moment, and hold an answer just long enough to
 * absorb a screen's worth of re-renders.
 *
 * This is a short-TTL IN-MEMORY cache and nothing else. Google's terms do not
 * allow building a durable copy of Places content, so nothing here is ever
 * written to the database.
 */

type Entry = { value: unknown; expires: number };

const cache = new Map<string, Entry>();
const inflight = new Map<string, Promise<unknown>>();

/** Ceiling on entries so a busy worker cannot grow without bound. */
const MAX_ENTRIES = 500;

/** Cache lifetimes, deliberately short. Places content stays transient. */
export const TTL = {
  /** Nearby/text results: a list can be a few minutes old without harm. */
  list: 3 * 60_000,
  /** Place details: hours and rating move slowly. */
  detail: 5 * 60_000,
  /** Travel legs: traffic moves, so keep these tight. */
  travel: 2 * 60_000,
  /** Shekk's own venue metadata: ours, so it can live longer. */
  meta: 10 * 60_000,
} as const;

function sweep() {
  const now = Date.now();
  for (const [key, entry] of cache) if (entry.expires <= now) cache.delete(key);
  if (cache.size <= MAX_ENTRIES) return;
  // Oldest-inserted first; Map preserves insertion order.
  const excess = cache.size - MAX_ENTRIES;
  let i = 0;
  for (const key of cache.keys()) {
    if (i++ >= excess) break;
    cache.delete(key);
  }
}

/**
 * Run `load` unless a fresh answer is cached or an identical call is already in
 * flight. Failures are never cached — a transient Google error must not stick.
 */
export async function cached<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) return hit.value as T;

  const running = inflight.get(key);
  if (running) return running as Promise<T>;

  const promise = load()
    .then((value) => {
      cache.set(key, { value, expires: Date.now() + ttlMs });
      sweep();
      return value;
    })
    .finally(() => {
      inflight.delete(key);
    });

  inflight.set(key, promise);
  return promise;
}

/** Test seam. */
export function resetPlacesCache() {
  cache.clear();
  inflight.clear();
}

export const placesCacheSize = () => cache.size;
