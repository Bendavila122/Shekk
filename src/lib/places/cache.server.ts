/**
 * Shekk Location Platform — in-flight dedupe, and a cache for Shekk's own data.
 * Server only.
 *
 * Google's Places terms do not allow pre-fetching, caching or storing Places
 * content, so Google-derived responses are NEVER retained here. All we do for
 * Google is collapse identical *concurrent* requests into one round trip, and
 * the shared promise is dropped the moment it settles.
 *
 * `venue_meta` is Shekk-owned content, so it gets a real short-TTL cache.
 */

type Entry = { value: unknown; expires: number };

/** Shekk-owned values only. Nothing Google-derived is ever put in here. */
const cache = new Map<string, Entry>();

/** Identical concurrent requests, Google-derived or not. Cleared on settle. */
const inflight = new Map<string, Promise<unknown>>();

/** Ceiling on entries so a busy worker cannot grow without bound. */
const MAX_ENTRIES = 300;

/** Cache lifetimes. Only Shekk-owned content is eligible. */
export const TTL = {
  /** Shekk's own venue metadata: ours, so it can be cached. */
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
 * Collapse identical concurrent calls into one. The result is handed to every
 * waiter and then forgotten — nothing is retained once the promise settles, so
 * this is safe for Google-derived content.
 */
export function dedupe<T>(key: string, load: () => Promise<T>): Promise<T> {
  const running = inflight.get(key);
  if (running) return running as Promise<T>;

  const promise = load().finally(() => {
    inflight.delete(key);
  });
  inflight.set(key, promise);
  return promise;
}

/**
 * Short-TTL cache for SHEKK-OWNED data only. Never call this with a Google
 * response. Failures are never cached.
 */
export async function cachedOwn<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) return hit.value as T;

  return dedupe(key, async () => {
    const value = await load();
    cache.set(key, { value, expires: Date.now() + ttlMs });
    sweep();
    return value;
  });
}

/** Test seam. */
export function resetPlacesCache() {
  cache.clear();
  inflight.clear();
}

export const placesCacheSize = () => cache.size;
export const placesInflightSize = () => inflight.size;
