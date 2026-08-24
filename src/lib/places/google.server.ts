/**
 * Shekk Location Platform — the single Google gateway. Server only.
 *
 * Places (New) and the Routes API through the Lovable connector gateway, so no
 * Google key ever reaches the browser. This is the ONLY file in Shekk allowed
 * to talk to Google. Everything else goes through `api.server.ts`.
 *
 * Google content stays transient: rows returned here are cached in memory for
 * minutes and never written to the database. Only the place id is storable.
 */

import type { Place, TravelLeg, TravelMode } from "./types";

const GATEWAY = "https://connector-gateway.lovable.dev/google_maps";

export function googleConfigured() {
  return Boolean(process.env["LOVABLE_API_KEY"] && process.env["GOOGLE_MAPS_API_KEY"]);
}

function headers(fieldMask?: string) {
  const h: Record<string, string> = {
    Authorization: `Bearer ${process.env["LOVABLE_API_KEY"]}`,
    "X-Connection-Api-Key": process.env["GOOGLE_MAPS_API_KEY"]!,
    "Content-Type": "application/json",
  };
  if (fieldMask) h["X-Goog-FieldMask"] = fieldMask;
  return h;
}

async function gateway<T>(path: string, init: RequestInit & { fieldMask?: string }): Promise<T> {
  if (!googleConfigured()) {
    throw new Error("Places needs the Google Maps connection — it isn't linked yet.");
  }
  const res = await fetch(`${GATEWAY}${path}`, { ...init, headers: headers(init.fieldMask) });
  if (res.status === 403) {
    const body = (await res.json().catch(() => ({}))) as { error?: { details?: Array<{ reason?: string }> } };
    const reason = body.error?.details?.find((d) => d.reason)?.reason;
    if (reason === "API_KEY_HTTP_REFERRER_BLOCKED")
      throw new Error(
        'Google Maps server key is referrer-restricted. Set the server key\'s application restrictions to "None" or "IP addresses".',
      );
    if (reason === "API_KEY_SERVICE_BLOCKED")
      throw new Error("Google Maps server key does not allow this API. Add Places and Routes to the key's allowed APIs.");
    throw new Error("Google Maps denied the request (403). Check the server key restrictions.");
  }
  if (!res.ok) {
    const body = await res.text();
    console.error(`Google Maps gateway failed [${res.status}]: ${body}`);
    throw new Error(`Google Maps request failed [${res.status}]: ${body}`);
  }
  return (await res.json()) as T;
}

type PlaceRow = {
  id: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  location?: { latitude: number; longitude: number };
  rating?: number;
  userRatingCount?: number;
  currentOpeningHours?: { openNow?: boolean; weekdayDescriptions?: string[] };
  regularOpeningHours?: { openNow?: boolean; weekdayDescriptions?: string[] };
  priceLevel?: string;
  types?: string[];
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  websiteUri?: string;
  googleMapsUri?: string;
  photos?: { name?: string }[];
};

const PRICE_LEVELS: Record<string, number> = {
  PRICE_LEVEL_FREE: 0,
  PRICE_LEVEL_INEXPENSIVE: 1,
  PRICE_LEVEL_MODERATE: 2,
  PRICE_LEVEL_EXPENSIVE: 3,
  PRICE_LEVEL_VERY_EXPENSIVE: 4,
};

const LIST_MASK =
  "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.currentOpeningHours.openNow,places.priceLevel,places.types,places.photos.name";

const DETAIL_MASK =
  "id,displayName,formattedAddress,location,rating,userRatingCount,currentOpeningHours,regularOpeningHours,priceLevel,types,nationalPhoneNumber,internationalPhoneNumber,websiteUri,googleMapsUri,photos.name";

/** Google row → Shekk `Place`. `meta` is filled later by the merge layer. */
function toPlace(p: PlaceRow): Place {
  const weekdays = p.currentOpeningHours?.weekdayDescriptions ?? p.regularOpeningHours?.weekdayDescriptions;
  return {
    id: p.id,
    name: p.displayName?.text ?? "Unnamed place",
    address: p.formattedAddress ?? "",
    lat: p.location?.latitude ?? 0,
    lon: p.location?.longitude ?? 0,
    rating: p.rating ?? null,
    reviews: p.userRatingCount ?? null,
    priceLevel: p.priceLevel ? PRICE_LEVELS[p.priceLevel] ?? null : null,
    types: p.types ?? [],
    hours: {
      openNow: p.currentOpeningHours?.openNow ?? p.regularOpeningHours?.openNow ?? null,
      ...(weekdays ? { weekdays } : {}),
    },
    phone: p.nationalPhoneNumber ?? p.internationalPhoneNumber ?? null,
    website: p.websiteUri ?? null,
    mapsUri: p.googleMapsUri ?? null,
    photoNames: (p.photos ?? []).map((x) => x.name).filter((n): n is string => Boolean(n)),
    meta: {},
  };
}

export async function nearbyRows(input: {
  lat: number;
  lon: number;
  radiusM: number;
  placeTypes: string[];
}): Promise<Place[]> {
  const json = await gateway<{ places?: PlaceRow[] }>("/places/v1/places:searchNearby", {
    method: "POST",
    fieldMask: LIST_MASK,
    body: JSON.stringify({
      includedTypes: input.placeTypes,
      maxResultCount: 20,
      rankPreference: "DISTANCE",
      locationRestriction: {
        circle: {
          center: { latitude: input.lat, longitude: input.lon },
          radius: Math.min(50_000, input.radiusM),
        },
      },
    }),
  });
  return (json.places ?? []).map(toPlace);
}

export async function searchRows(input: { query: string; lat?: number; lon?: number }): Promise<Place[]> {
  const body: Record<string, unknown> = { textQuery: input.query, maxResultCount: 20, regionCode: "IL" };
  if (input.lat !== undefined && input.lon !== undefined) {
    body["locationBias"] = {
      circle: { center: { latitude: input.lat, longitude: input.lon }, radius: 30_000 },
    };
  }
  const json = await gateway<{ places?: PlaceRow[] }>("/places/v1/places:searchText", {
    method: "POST",
    fieldMask: LIST_MASK,
    body: JSON.stringify(body),
  });
  return (json.places ?? []).map(toPlace);
}

export async function detailRow(placeId: string): Promise<Place> {
  const json = await gateway<PlaceRow>(`/places/v1/places/${encodeURIComponent(placeId)}`, {
    method: "GET",
    fieldMask: DETAIL_MASK,
  });
  return toPlace(json);
}

/**
 * A Google-hosted photo URL. We follow the redirect only to read the final
 * Google URL — photos are always served from Google, never rehosted by Shekk.
 */
export async function photoUrl(photoName: string, maxWidthPx: number): Promise<string | null> {
  try {
    const json = await gateway<{ photoUri?: string }>(
      `/places/v1/${photoName}/media?maxWidthPx=${maxWidthPx}&skipHttpRedirect=true`,
      { method: "GET" },
    );
    return json.photoUri ?? null;
  } catch (e) {
    console.error("place photo failed", e);
    return null;
  }
}

/** One travel leg. Never throws — travel info is a nicety, not the feature. */
export async function travelLeg(input: {
  fromLat: number;
  fromLon: number;
  toLat: number;
  toLon: number;
  mode: TravelMode;
}): Promise<TravelLeg | null> {
  try {
    const json = await gateway<{ routes?: { duration?: string; distanceMeters?: number }[] }>(
      "/routes/directions/v2:computeRoutes",
      {
        method: "POST",
        fieldMask: "routes.duration,routes.distanceMeters",
        body: JSON.stringify({
          origin: { location: { latLng: { latitude: input.fromLat, longitude: input.fromLon } } },
          destination: { location: { latLng: { latitude: input.toLat, longitude: input.toLon } } },
          travelMode: input.mode,
        }),
      },
    );
    const route = json.routes?.[0];
    if (!route?.duration) return null;
    const seconds = Number(String(route.duration).replace("s", ""));
    return {
      mode: input.mode,
      minutes: Math.max(1, Math.round(seconds / 60)),
      km: Math.round(((route.distanceMeters ?? 0) / 1000) * 10) / 10,
    };
  } catch (e) {
    console.error("travel leg failed", e);
    return null;
  }
}
