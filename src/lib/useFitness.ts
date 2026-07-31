/**
 * Fitness discovery for the UI: nearby venues, text search, saved places and
 * the compare tray. Saved and compare live in local storage for now — they are
 * a personal shortlist, not money, and will move to the backend when
 * memberships and bookings land.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { distanceKm, useLocation } from "@/lib/location";
import {
  ACTIVITY_TYPES,
  activityType,
  type ActivityType,
  type FitnessVenue,
} from "@/lib/fitness";
import {
  fitnessMapsStatus,
  fitnessNearby,
  fitnessSearch,
  fitnessTravel,
  fitnessVenue,
} from "@/lib/fitness.functions";

const SAVED_KEY = "shekk.fitness.saved.v1";
const COMPARE_KEY = "shekk.fitness.compare.v1";

export type SavedVenue = { id: string; name: string; address: string; savedAt: number };

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
}

/** Shortlist of places the member saved, plus the compare tray. */
export function useFitnessShortlist() {
  const [saved, setSaved] = useState<SavedVenue[]>([]);
  const [compare, setCompare] = useState<string[]>([]);

  useEffect(() => {
    setSaved(read<SavedVenue[]>(SAVED_KEY, []));
    setCompare(read<string[]>(COMPARE_KEY, []));
  }, []);

  const toggleSaved = useCallback((venue: FitnessVenue) => {
    setSaved((list) => {
      const next = list.some((s) => s.id === venue.id)
        ? list.filter((s) => s.id !== venue.id)
        : [{ id: venue.id, name: venue.name, address: venue.address, savedAt: Date.now() }, ...list].slice(0, 60);
      write(SAVED_KEY, next);
      return next;
    });
  }, []);

  const toggleCompare = useCallback((id: string) => {
    setCompare((list) => {
      const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id].slice(-3);
      write(COMPARE_KEY, next);
      return next;
    });
  }, []);

  const clearCompare = useCallback(() => {
    setCompare([]);
    write(COMPARE_KEY, []);
  }, []);

  return {
    saved,
    savedIds: useMemo(() => new Set(saved.map((s) => s.id)), [saved]),
    compare,
    toggleSaved,
    toggleCompare,
    clearCompare,
    isSaved: (id: string) => saved.some((s) => s.id === id),
  };
}

const withDistance = (venues: FitnessVenue[], from: { lat: number; lon: number } | null) =>
  venues
    .map((v) =>
      from ? { ...v, distanceKm: distanceKm(from.lat, from.lon, v.lat, v.lon) } : v,
    )
    .sort((a, b) => (a.distanceKm ?? 99) - (b.distanceKm ?? 99));

/** Is the Google Maps connection wired up for this project? */
export function useMapsReady() {
  const query = useQuery({
    queryKey: ["fitness", "maps-status"],
    queryFn: () => fitnessMapsStatus(),
    staleTime: 5 * 60_000,
  });
  return { ready: query.data?.configured ?? null, loading: query.isLoading };
}

/**
 * The discovery feed. A query searches by text (so "pool in Netanya" works even
 * without GPS); otherwise we list what's nearby.
 */
export function useFitnessVenues(options: {
  activity: ActivityType | "all";
  query: string;
  radiusM: number;
}) {
  const { place } = useLocation();
  const { ready } = useMapsReady();
  const q = options.query.trim();

  const placeTypes =
    options.activity === "all"
      ? Array.from(new Set(ACTIVITY_TYPES.flatMap((a) => a.placeTypes))).slice(0, 8)
      : activityType(options.activity)?.placeTypes ?? ["gym"];

  const search = useQuery<FitnessVenue[]>({
    queryKey: ["fitness", "venues", options.activity, q, options.radiusM, place?.lat, place?.lon],
    enabled: ready === true && (q.length >= 2 || Boolean(place)),
    staleTime: 5 * 60_000,
    retry: 1,
    queryFn: async () => {
      if (q.length >= 2) {
        const keyword = options.activity === "all" ? "" : `${activityType(options.activity)?.keyword ?? ""} `;
        const venues = await fitnessSearch({
          data: {
            query: `${keyword}${q}`.trim(),
            ...(place ? { lat: place.lat, lon: place.lon } : {}),
          },
        });
        return withDistance(venues, place ?? null);
      }
      const venues = await fitnessNearby({
        data: { lat: place!.lat, lon: place!.lon, radiusM: options.radiusM, placeTypes },
      });
      return withDistance(venues, place ?? null);
    },
  });

  return {
    venues: search.data ?? [],
    loading: search.isFetching,
    error: search.error instanceof Error ? search.error.message : null,
    refetch: search.refetch,
    mapsReady: ready,
    place,
  };
}

/** One venue's full record, plus walking and transit time from the member. */
export function useFitnessVenue(id: string) {
  const { place } = useLocation();
  const { ready } = useMapsReady();

  const venue = useQuery<FitnessVenue>({
    queryKey: ["fitness", "venue", id],
    enabled: ready === true && Boolean(id),
    staleTime: 10 * 60_000,
    queryFn: () => fitnessVenue({ data: { id } }),
  });

  const travel = useQuery({
    queryKey: ["fitness", "travel", id, place?.lat, place?.lon],
    enabled: Boolean(place && venue.data),
    staleTime: 10 * 60_000,
    queryFn: () =>
      fitnessTravel({
        data: {
          fromLat: place!.lat,
          fromLon: place!.lon,
          toLat: venue.data!.lat,
          toLon: venue.data!.lon,
        },
      }),
  });

  const data = venue.data
    ? place
      ? { ...venue.data, distanceKm: distanceKm(place.lat, place.lon, venue.data.lat, venue.data.lon) }
      : venue.data
    : null;

  return {
    venue: data,
    loading: venue.isLoading,
    error: venue.error instanceof Error ? venue.error.message : null,
    travel: travel.data ?? null,
    mapsReady: ready,
  };
}

/** Load the saved shortlist as full venue records so it can be compared. */
export function useVenuesByIds(ids: string[]) {
  const { place } = useLocation();
  const { ready } = useMapsReady();
  const key = ids.join(",");

  const query = useQuery<FitnessVenue[]>({
    queryKey: ["fitness", "venues-by-id", key, place?.lat, place?.lon],
    enabled: ready === true && ids.length > 0,
    staleTime: 10 * 60_000,
    queryFn: async () => {
      const rows = await Promise.all(
        ids.map((id) => fitnessVenue({ data: { id } }).catch(() => null)),
      );
      return withDistance(rows.filter((r): r is FitnessVenue => Boolean(r)), place ?? null);
    },
  });

  return { venues: query.data ?? [], loading: query.isFetching };
}
