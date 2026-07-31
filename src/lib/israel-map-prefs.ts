import { useCallback, useEffect, useState } from "react";
import { MAP_PLACES, REGIONS } from "@/lib/israel-map";

const REGION_KEY = "shekk.map.regions.v1";
const PLACE_KEY = "shekk.map.places.v1";

function read(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function write(key: string, value: string[]) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or blocked — the map still works, it just won't remember */
  }
}

/** Which areas and pins you've marked as visited, kept on this device. */
export function useVisited() {
  const [regions, setRegions] = useState<string[]>([]);
  const [places, setPlaces] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setRegions(read(REGION_KEY));
    setPlaces(read(PLACE_KEY));
    setReady(true);
  }, []);

  const toggleRegion = useCallback((id: string) => {
    setRegions((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      write(REGION_KEY, next);
      return next;
    });
  }, []);

  const togglePlace = useCallback((id: string) => {
    setPlaces((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      write(PLACE_KEY, next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setRegions([]);
    setPlaces([]);
    write(REGION_KEY, []);
    write(PLACE_KEY, []);
  }, []);

  return {
    ready,
    regions,
    places,
    toggleRegion,
    togglePlace,
    reset,
    regionPct: Math.round((regions.length / REGIONS.length) * 100),
    placePct: Math.round((places.length / MAP_PLACES.length) * 100),
  };
}
