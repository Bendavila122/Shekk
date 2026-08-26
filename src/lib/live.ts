/** React hooks for the live weather + Jewish-calendar widget data. */
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import type { Place } from "./location";
import { getJewishToday, getWeather } from "./live.functions";
import type { LiveJewish, LiveWeather } from "./live-types";

/** Milliseconds until the next local midnight — zmanim are good until then. */
function msUntilMidnight() {
  const now = new Date();
  const next = new Date(now);
  next.setHours(24, 0, 0, 0);
  return Math.max(60_000, next.getTime() - now.getTime());
}

export function useWeather(place: Place | null) {
  return useQuery<LiveWeather>({
    queryKey: ["weather", place?.lat?.toFixed(2), place?.lon?.toFixed(2)],
    queryFn: () => getWeather({ data: { lat: place!.lat, lon: place!.lon } }),
    enabled: !!place,
    staleTime: 15 * 60_000,
    gcTime: 60 * 60_000,
    refetchOnWindowFocus: true,
    // Free upstreams throttle occasionally; a couple of spaced retries clears it.
    retry: 2,
    retryDelay: (attempt) => Math.min(4000, 600 * 2 ** attempt),
  });
}

export function useJewish(place: Place | null) {
  const q = useQuery<LiveJewish>({
    queryKey: ["jewish", place?.lat?.toFixed(2), place?.lon?.toFixed(2)],
    queryFn: () => getJewishToday({ data: { lat: place!.lat, lon: place!.lon } }),
    enabled: !!place,
    staleTime: msUntilMidnight(),
    gcTime: 24 * 60 * 60_000,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  // Refetch the moment the day actually turns: shkia, candle lighting, havdalah,
  // nightfall — whichever comes first — so the tile flips state on time.
  const j = q.data;
  const marks = [j?.sunsetAt, j?.tzeitAt, j?.candleDate, j?.havdalahDate, j?.next?.at];
  const nextMark = marks
    .filter((m): m is string => !!m)
    .map((m) => new Date(m).getTime())
    .filter((t) => Number.isFinite(t) && t > Date.now())
    .sort((a, b) => a - b)[0];

  useEffect(() => {
    if (!nextMark) return;
    const delay = Math.min(Math.max(nextMark - Date.now() + 30_000, 15_000), 6 * 3600_000);
    const id = window.setTimeout(() => void q.refetch(), delay);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextMark]);

  return q;
}


/** "in 3h 12m" style countdown to an ISO timestamp, or null once it has passed. */
export function countdownTo(iso: string | null | undefined, from = new Date()): string | null {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - from.getTime();
  if (!Number.isFinite(ms) || ms <= 0) return null;
  const mins = Math.round(ms / 60_000);
  if (mins < 60) return `in ${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h < 24) return m ? `in ${h}h ${m}m` : `in ${h}h`;
  const d = Math.floor(h / 24);
  return `in ${d} day${d > 1 ? "s" : ""}`;
}

export const isToday = (iso: string | null | undefined) =>
  !!iso && new Date(iso).toDateString() === new Date().toDateString();
