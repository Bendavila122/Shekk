/**
 * Fitness filtering and price rules.
 *
 * The price tests exist to keep a synthetic short-stay premium from ever coming
 * back: a displayed price is exactly what a human recorded, or it is absent.
 */

import { describe, expect, it } from "vitest";
import { DEFAULT_FILTERS, filterVenues, fitsStay, sortVenues, storedDayPass, storedMonthly } from "./fitness";
import type { Place, PlaceMeta } from "@/lib/places";

const venue = (id: string, over: Partial<Place> = {}, meta: PlaceMeta = {}): Place => ({
  id,
  name: id,
  address: "somewhere",
  lat: 31.7,
  lon: 35.2,
  types: ["gym"],
  rating: 4.5,
  reviews: 100,
  priceLevel: 2,
  hours: { openNow: true },
  phone: null,
  website: null,
  mapsUri: null,
  photos: [],
  meta,
  ...over,
});

describe("stored prices", () => {
  it("returns exactly the recorded figures", () => {
    expect(storedMonthly({ monthlyIls: 249 })).toBe(249);
    expect(storedDayPass({ dayPassIls: 70 })).toBe(70);
  });

  it("returns null rather than estimating", () => {
    expect(storedMonthly({})).toBeNull();
    expect(storedDayPass({})).toBeNull();
  });

  it("never adds a short-stay premium", () => {
    expect(storedMonthly({ monthlyIls: 200, shortStay: false })).toBe(200);
    expect(storedMonthly({ monthlyIls: 200, shortStay: true })).toBe(200);
  });

  it("sorts unknown prices last", () => {
    const sorted = sortVenues(
      [venue("unknown"), venue("cheap", {}, { monthlyIls: 150 }), venue("dear", {}, { monthlyIls: 400 })],
      "price",
    );
    expect(sorted.map((p) => p.id)).toEqual(["cheap", "dear", "unknown"]);
  });
});

describe("filters", () => {
  it("excludes unknown opening state when Open now is on", () => {
    const places = [
      venue("open", { hours: { openNow: true } }),
      venue("closed", { hours: { openNow: false } }),
      venue("unknown", { hours: { openNow: null } }),
    ];
    const out = filterVenues(places, { ...DEFAULT_FILTERS, openNow: true });
    expect(out.map((p) => p.id)).toEqual(["open"]);
  });

  it("applies the minimum rating", () => {
    const out = filterVenues([venue("good", { rating: 4.6 }), venue("meh", { rating: 3.2 })], {
      ...DEFAULT_FILTERS,
      minRating: 4,
    });
    expect(out.map((p) => p.id)).toEqual(["good"]);
  });

  it("requires every selected facility", () => {
    const out = filterVenues(
      [
        venue("both", {}, { facilities: ["pool", "sauna"] }),
        venue("one", {}, { facilities: ["pool"] }),
        venue("none", {}, {}),
      ],
      { ...DEFAULT_FILTERS, facilities: ["pool", "sauna"] },
    );
    expect(out.map((p) => p.id)).toEqual(["both"]);
  });

  it("keeps only partners when partner-only is on", () => {
    const out = filterVenues([venue("p", {}, { partner: true }), venue("q", {}, {})], {
      ...DEFAULT_FILTERS,
      partnerOnly: true,
    });
    expect(out.map((p) => p.id)).toEqual(["p"]);
  });

  it("filters by stored monthly price only", () => {
    const out = filterVenues(
      [venue("cheap", {}, { monthlyIls: 150 }), venue("dear", {}, { monthlyIls: 500 }), venue("unknown", {}, {})],
      { ...DEFAULT_FILTERS, maxPriceIls: 200 },
    );
    // A venue with no recorded price is not silently priced out.
    expect(out.map((p) => p.id).sort()).toEqual(["cheap", "unknown"]);
  });
});

describe("stay compatibility", () => {
  it("accepts anything when the stay is a year or unknown", () => {
    expect(fitsStay({ minContractMonths: 12 }, "year")).toBe(true);
    expect(fitsStay({ minContractMonths: 12 }, "unsure")).toBe(true);
  });

  it("rejects a long contract for a few weeks unless there is a way in", () => {
    expect(fitsStay({ minContractMonths: 12 }, "weeks")).toBe(false);
    expect(fitsStay({ minContractMonths: 12, shortStay: true }, "weeks")).toBe(true);
    expect(fitsStay({ minContractMonths: 12, dayPassIls: 70 }, "weeks")).toBe(true);
    expect(fitsStay({ minContractMonths: 3 }, "term")).toBe(true);
  });
});
