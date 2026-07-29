import { useCallback, useEffect, useState } from "react";
import { getPlaceName } from "./live.functions";

export type Place = {
  city: string;
  /** Neighbourhood-level label shown under the city when we have one. */
  area?: string;
  lat: number;
  lon: number;
  /** How we arrived at this place — GPS reading, geocoded name, or a manual pick. */
  source?: "gps" | "geocoded" | "manual";
  /** Epoch ms of the fix, used to decide when a refresh is worth it. */
  at?: number;
};

export type LocationStatus = "idle" | "asking" | "granted" | "denied" | "unavailable" | "manual";

export type LocationState = {
  status: LocationStatus;
  place: Place | null;
  /** True while a geolocation request is in flight. */
  loading: boolean;
  /** Set when the browser refused or timed out, so the UI can explain why. */
  error: string | null;
};

/** Places a student on a gap year actually ends up in. */
export const ISRAEL_PLACES: Place[] = [
  { city: "Jerusalem", area: "City centre", lat: 31.7683, lon: 35.2137 },
  { city: "Jerusalem", area: "Katamon", lat: 31.7563, lon: 35.2093 },
  { city: "Jerusalem", area: "Old City", lat: 31.7767, lon: 35.2345 },
  { city: "Jerusalem", area: "Har Nof", lat: 31.7889, lon: 35.1728 },
  { city: "Tel Aviv", area: "Florentin", lat: 32.0553, lon: 34.7686 },
  { city: "Tel Aviv", area: "City centre", lat: 32.0853, lon: 34.7818 },
  { city: "Tel Aviv", area: "Tel Aviv Port", lat: 32.0975, lon: 34.7729 },
  { city: "Beit Shemesh", area: "Ramat Beit Shemesh", lat: 31.7248, lon: 34.9932 },
  { city: "Efrat", lat: 31.6547, lon: 35.1508 },
  { city: "Modiin", lat: 31.8928, lon: 35.0104 },
  { city: "Ra'anana", lat: 32.1848, lon: 34.8713 },
  { city: "Herzliya", lat: 32.1624, lon: 34.8447 },
  { city: "Netanya", lat: 32.3215, lon: 34.8532 },
  { city: "Haifa", lat: 32.794, lon: 34.9896 },
  { city: "Tzfat", lat: 32.9646, lon: 35.496 },
  { city: "Tiberias", lat: 32.7959, lon: 35.5312 },
  { city: "Beer Sheva", lat: 31.2518, lon: 34.7913 },
  { city: "Eilat", lat: 29.5577, lon: 34.9519 },
];

/** Distinct city names for the manual picker. */
export const LOCATION_CITIES = Array.from(new Set(ISRAEL_PLACES.map((p) => p.city)));

const KEY = "shekk.location.v1";

const toRad = (n: number) => (n * Math.PI) / 180;

/** Great-circle distance in km. */
export function distanceKm(aLat: number, aLon: number, bLat: number, bLon: number) {
  const dLat = toRad(bLat - aLat);
  const dLon = toRad(bLon - aLon);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

/** Snap raw coordinates to the closest known place. */
export function nearestPlace(lat: number, lon: number): Place {
  let best = ISRAEL_PLACES[0];
  let bestD = Infinity;
  for (const p of ISRAEL_PLACES) {
    const d = distanceKm(lat, lon, p.lat, p.lon);
    if (d < bestD) {
      bestD = d;
      best = p;
    }
  }
  // Too far from anywhere we know — keep the coordinates, drop the area label.
  if (bestD > 40) return { city: best.city, lat, lon };
  return { ...best, lat, lon };
}

export const placeForCity = (city: string): Place =>
  ISRAEL_PLACES.find((p) => p.city === city) ?? ISRAEL_PLACES[0];

// ---- tiny shared store so every screen shows the same location ----

let current: LocationState = { status: "idle", place: null, loading: false, error: null };
const listeners = new Set<(s: LocationState) => void>();

function set(next: Partial<LocationState>) {
  current = { ...current, ...next };
  listeners.forEach((l) => l(current));
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify({ status: current.status, place: current.place }));
  } catch {
    /* storage unavailable */
  }
}

function restore() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return;
    const saved = JSON.parse(raw) as { status: LocationStatus; place: Place | null };
    if (saved?.place) current = { status: saved.status ?? "manual", place: saved.place, loading: false };
  } catch {
    /* ignore */
  }
}

let restored = false;

/** Upgrade a GPS fix with a real city / neighbourhood name. */
async function resolveName(lat: number, lon: number, snapped: Place) {
  try {
    const named = await getPlaceName({ data: { lat, lon } });
    if (!named?.city) return;
    // Ignore if the student has since picked a city by hand or moved on.
    if (current.status === "manual") return;
    if (!current.place || distanceKm(current.place.lat, current.place.lon, lat, lon) > 1) return;
    set({
      place: {
        city: named.city,
        area: named.area ?? snapped.area,
        lat,
        lon,
        source: "geocoded",
        at: Date.now(),
      },
    });
    persist();
  } catch {
    /* keep the snapped name */
  }
}

export function useLocation() {
  const [state, setState] = useState<LocationState>(current);

  useEffect(() => {
    if (!restored) {
      restored = true;
      restore();
    }
    listeners.add(setState);
    setState(current);
    return () => {
      listeners.delete(setState);
    };
  }, []);

  /** Ask the browser for permission, then name the spot properly. */
  const detect = useCallback(() => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      set({ status: "unavailable", loading: false, error: "This browser can't share your location." });
      return;
    }
    set({ status: "asking", loading: true, error: null });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        // Show the nearest known place instantly, then upgrade with a real name.
        const snapped = { ...nearestPlace(lat, lon), source: "gps" as const, at: Date.now() };
        set({ status: "granted", loading: false, place: snapped, error: null });
        persist();
        void resolveName(lat, lon, snapped);
      },
      (err) => {
        const denied = err.code === err.PERMISSION_DENIED;
        set({
          status: denied ? "denied" : "unavailable",
          loading: false,
          error: denied
            ? "Location is blocked for Shekk in your browser settings."
            : err.code === err.TIMEOUT
              ? "Couldn't get a location fix in time."
              : "Location is unavailable right now.",
        });
        persist();
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 2 * 60 * 1000 },
    );
  }, []);

  // Refresh a GPS fix when the app comes back to the foreground and it is stale.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      if (current.status !== "granted" || current.loading) return;
      if (current.place?.at && Date.now() - current.place.at < 10 * 60_000) return;
      detect();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [detect]);


  /** Manual override from the picker — sticks until the student re-detects. */
  const setCity = useCallback((city: string) => {
    set({ status: "manual", loading: false, error: null, place: { ...placeForCity(city), source: "manual", at: Date.now() } });
    persist();
  }, []);

  const clear = useCallback(() => {
    set({ status: "idle", loading: false, place: null, error: null });
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  }, []);

  return { ...state, detect, setCity, clear };
}
