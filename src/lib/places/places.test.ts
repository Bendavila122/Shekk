/**
 * Location Platform guarantees, pinned as tests.
 *
 * Three of these exist purely to stop a policy regression: Google content must
 * not be retained after a request completes, photo attributions must survive
 * the mapping, and Shekk metadata must never overwrite a Google field.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { categoryFor, categorySet, placeTypesFor, PLACE_CATEGORIES } from "./taxonomy";
import { coordKey, nearbyKey, roundCoord } from "./format";
import { dedupe, placesCacheSize, placesInflightSize, resetPlacesCache } from "./cache.server";
import { mergeMeta, toMeta } from "./meta.server";
import type { Place } from "./types";

const gymTypes = ["gym", "fitness_center"];

describe("taxonomy", () => {
  it("maps Google types back to a category", () => {
    expect(categoryFor(gymTypes)?.id).toBe("gym");
    expect(categoryFor(["synagogue"])?.id).toBe("synagogue");
    expect(categoryFor(["unheard_of_type"])).toBeUndefined();
  });

  it("de-duplicates Google types across overlapping categories", () => {
    const cats = categorySet(["gym", "classes", "studio"]);
    const types = placeTypesFor(cats, 50);
    expect(new Set(types).size).toBe(types.length);
  });

  it("respects the requested type limit", () => {
    expect(placeTypesFor(PLACE_CATEGORIES, 5)).toHaveLength(5);
  });
});

describe("request keys", () => {
  it("rounds coordinates so a drifting GPS fix reuses one key", () => {
    expect(roundCoord(31.7683123)).toBe(31.768);
    expect(coordKey({ lat: 31.76831, lon: 35.21371 })).toBe(coordKey({ lat: 31.768339, lon: 35.213744 }));
  });

  it("keys nearby requests by rounded position, radius and sorted types", () => {
    const a = nearbyKey({ lat: 31.7683, lon: 35.2137 }, 3000, ["gym", "spa"]);
    const b = nearbyKey({ lat: 31.7683, lon: 35.2137 }, 3000, ["spa", "gym"]);
    expect(a).toBe(b);
    expect(a).not.toBe(nearbyKey({ lat: 31.7683, lon: 35.2137 }, 5000, ["gym", "spa"]));
  });
});

describe("in-flight dedupe", () => {
  beforeEach(resetPlacesCache);

  it("shares one call between concurrent identical requests", async () => {
    const load = vi.fn(async () => {
      await new Promise((r) => setTimeout(r, 5));
      return ["row"];
    });
    const [a, b] = await Promise.all([dedupe("k", load), dedupe("k", load)]);
    expect(load).toHaveBeenCalledTimes(1);
    expect(a).toBe(b);
  });

  it("retains no Google content once the request settles", async () => {
    await dedupe("k", async () => ["row"]);
    expect(placesInflightSize()).toBe(0);
    expect(placesCacheSize()).toBe(0);

    const load = vi.fn(async () => ["row"]);
    await dedupe("k", load);
    await dedupe("k", load);
    // A second, later request must go back to Google rather than reuse a copy.
    expect(load).toHaveBeenCalledTimes(2);
  });

  it("does not retain a failed request", async () => {
    await expect(dedupe("boom", async () => Promise.reject(new Error("nope")))).rejects.toThrow("nope");
    expect(placesInflightSize()).toBe(0);
    await expect(dedupe("boom", async () => "ok")).resolves.toBe("ok");
  });
});

const googlePlace = (): Place => ({
  id: "place-1",
  name: "Google's Name",
  address: "1 Real Street, Jerusalem",
  lat: 31.7683,
  lon: 35.2137,
  types: gymTypes,
  rating: 4.4,
  reviews: 812,
  priceLevel: 2,
  hours: { openNow: true },
  phone: "02-000-0000",
  website: "https://example.com",
  mapsUri: "https://maps.google.com/?cid=1",
  photos: [{ name: "places/place-1/photos/abc", authors: [] }],
  meta: {},
});

describe("Shekk metadata merge", () => {
  it("maps a venue_meta row without inventing values", () => {
    const meta = toMeta({
      google_place_id: "place-1",
      chain: "Holmes Place",
      city: "Jerusalem",
      day_pass_ils: 70,
      monthly_ils: 249,
      min_contract_months: 3,
      facilities: ["pool", "sauna"],
      english_friendly: true,
      short_stay: true,
      partner: false,
      partner_offer: null,
      verified_at: "2026-08-01T00:00:00Z",
      notes: "Ask for the student rate.",
    } as never);
    expect(meta).toMatchObject({
      chain: "Holmes Place",
      dayPassIls: 70,
      monthlyIls: 249,
      minContractMonths: 3,
      shortStay: true,
      englishFriendly: true,
    });
    expect(meta.partnerOffer).toBeUndefined();
  });

  it("attaches Shekk data without touching any Google field", () => {
    const place = googlePlace();
    const [merged] = mergeMeta([place], new Map([["place-1", { monthlyIls: 249, chain: "Holmes Place" }]]));
    expect(merged!.meta).toEqual({ monthlyIls: 249, chain: "Holmes Place" });
    expect(merged!.name).toBe("Google's Name");
    expect(merged!.rating).toBe(4.4);
    expect(merged!.hours.openNow).toBe(true);
    expect(merged!.photos[0]!.name).toBe("places/place-1/photos/abc");
  });

  it("leaves meta empty when Shekk knows nothing", () => {
    const [merged] = mergeMeta([googlePlace()], new Map());
    expect(merged!.meta).toEqual({});
  });
});

describe("Google row mapping", () => {
  const env = { ...process.env };

  beforeEach(() => {
    process.env["LOVABLE_API_KEY"] = "test-lovable";
    process.env["GOOGLE_MAPS_API_KEY"] = "test-connection";
  });

  afterEach(() => {
    process.env = { ...env };
    vi.unstubAllGlobals();
  });

  it("maps a nearby row, including photo attributions", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => ({
          places: [
            {
              id: "place-1",
              displayName: { text: "Holmes Place" },
              formattedAddress: "1 Real Street",
              location: { latitude: 31.7, longitude: 35.2 },
              rating: 4.4,
              userRatingCount: 812,
              currentOpeningHours: { openNow: true },
              priceLevel: "PRICE_LEVEL_MODERATE",
              types: gymTypes,
              photos: [
                {
                  name: "places/place-1/photos/abc",
                  googleMapsUri: "https://maps.google.com/photo",
                  flagContentUri: "https://maps.google.com/flag",
                  authorAttributions: [
                    { displayName: "A Local", uri: "https://maps.google.com/contrib/1", photoUri: "https://lh3/avatar" },
                  ],
                },
              ],
            },
          ],
        }),
      })),
    );

    const { nearbyRows } = await import("./google.server");
    const [place] = await nearbyRows({ lat: 31.7, lon: 35.2, radiusM: 3000, placeTypes: gymTypes });

    expect(place).toMatchObject({ id: "place-1", name: "Holmes Place", rating: 4.4, priceLevel: 2 });
    expect(place!.hours.openNow).toBe(true);
    expect(place!.meta).toEqual({});
    const photo = place!.photos[0]!;
    expect(photo.name).toBe("places/place-1/photos/abc");
    expect(photo.googleMapsUri).toBe("https://maps.google.com/photo");
    expect(photo.authors[0]).toMatchObject({ displayName: "A Local" });
  });

  it("asks Google for photo attribution fields", async () => {
    const fetchMock = vi.fn(async (_url: string, _init: RequestInit) => ({
      ok: true,
      status: 200,
      json: async () => ({ places: [] }),
    }));
    vi.stubGlobal("fetch", fetchMock);
    const { nearbyRows } = await import("./google.server");
    await nearbyRows({ lat: 31.7, lon: 35.2, radiusM: 1000, placeTypes: ["gym"] });
    const init = fetchMock.mock.calls[0]![1] as unknown as { headers: Record<string, string> };
    const mask = init.headers["X-Goog-FieldMask"]!;
    expect(mask).toContain("photos.authorAttributions");
    expect(mask).toContain("photos.googleMapsUri");
  });

  it("refuses to call Google when the connection is missing", async () => {
    delete process.env["LOVABLE_API_KEY"];
    const { nearbyRows } = await import("./google.server");
    await expect(nearbyRows({ lat: 31.7, lon: 35.2, radiusM: 1000, placeTypes: ["gym"] })).rejects.toThrow(
      /Google Maps connection/i,
    );
  });
});
