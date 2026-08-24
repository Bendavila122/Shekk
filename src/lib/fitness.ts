/**
 * Fitness — Shekk's own layer on top of the shared location platform.
 *
 * Google tells us WHERE a place is, whether it's open and how people rate it.
 * Shekk adds what a student actually needs to decide: what a month costs, how
 * long the contract is, whether a short-stay option exists and whether we have
 * a partner offer.
 *
 * Every one of those Shekk facts now comes from the `venue_meta` table via
 * `Place.meta` — edited by a human in the console, stamped with when it was
 * last checked. Nothing is guessed from a venue's name any more.
 */

import { categorySet, type Place, type PlaceCategoryId, type PlaceMeta } from "@/lib/places";

/** The activity chips Fitness offers, drawn from the shared taxonomy. */
export const FITNESS_CATEGORY_IDS = [
  "gym",
  "classes",
  "pool",
  "studio",
  "martial",
  "climbing",
  "courts",
  "outdoor",
] as const satisfies readonly PlaceCategoryId[];

export type ActivityType = (typeof FITNESS_CATEGORY_IDS)[number];

export const FITNESS_CATEGORIES = categorySet(FITNESS_CATEGORY_IDS);

export const activityType = (id: string) => FITNESS_CATEGORIES.find((a) => a.id === id);

/** Shekk-defined facility tags. These are ours, stored in `venue_meta`. */
export type Facility =
  | "pool"
  | "sauna"
  | "classes"
  | "weights"
  | "womens"
  | "mens"
  | "shabbat"
  | "student"
  | "english"
  | "parking";

export const FACILITIES: { id: Facility; label: string; emoji: string }[] = [
  { id: "pool", label: "Pool", emoji: "🏊" },
  { id: "sauna", label: "Sauna / spa", emoji: "🧖" },
  { id: "classes", label: "Group classes", emoji: "🤸" },
  { id: "weights", label: "Free weights", emoji: "🏋️" },
  { id: "womens", label: "Women's hours", emoji: "♀️" },
  { id: "mens", label: "Men's hours", emoji: "♂️" },
  { id: "shabbat", label: "Shomer Shabbat", emoji: "🕯️" },
  { id: "student", label: "Student rate", emoji: "🎓" },
  { id: "english", label: "English spoken", emoji: "🇬🇧" },
  { id: "parking", label: "Parking", emoji: "🅿️" },
];

export const facility = (id: string) => FACILITIES.find((f) => f.id === id);

export const facilityLabel = (id: string) => facility(id)?.label ?? id;

/** How long the member is in Israel — drives which commitment actually fits. */
export type StayLength = "weeks" | "term" | "year" | "unsure";

export const STAY_OPTIONS: { id: StayLength; label: string; hint: string; months: number }[] = [
  { id: "weeks", label: "A few weeks", hint: "Day passes and punch cards", months: 1 },
  { id: "term", label: "A term (3–5 months)", hint: "Short contracts and monthly rolling", months: 4 },
  { id: "year", label: "The full year", hint: "Annual deals are cheapest per month", months: 10 },
  { id: "unsure", label: "Not sure yet", hint: "Show everything", months: 0 },
];

export const stayOption = (id: StayLength) => STAY_OPTIONS.find((s) => s.id === id)!;

/**
 * The monthly price Shekk actually holds for this venue, or null.
 *
 * There is deliberately no arithmetic here. A number shown to a member as a
 * Shekk price must be exactly what a human recorded in `venue_meta` — we never
 * manufacture a short-stay premium or any other derived figure.
 */
export function storedMonthly(meta: PlaceMeta): number | null {
  return meta.monthlyIls ?? null;
}

/** The day-pass price Shekk holds, or null. Again, stored values only. */
export function storedDayPass(meta: PlaceMeta): number | null {
  return meta.dayPassIls ?? null;
}

/**
 * Does this venue realistically work for a stay of this length? Uses contract
 * facts only — minimum contract, a short-stay option, or a day pass existing.
 */
export function fitsStay(meta: PlaceMeta, stay: StayLength): boolean {
  if (stay === "unsure" || stay === "year") return true;
  const min = meta.minContractMonths;
  if (min === undefined) return true;
  const months = stayOption(stay).months;
  return meta.shortStay === true || min <= months || meta.dayPassIls !== undefined;
}

export type SortMode = "distance" | "rating" | "price";

export type FitnessFilters = {
  activity: ActivityType | "all";
  maxPriceIls: number | null;
  maxDistanceKm: number | null;
  minRating: number | null;
  facilities: Facility[];
  stay: StayLength;
  openNow: boolean;
  partnerOnly: boolean;
  sort: SortMode;
};

export const DEFAULT_FILTERS: FitnessFilters = {
  activity: "all",
  maxPriceIls: null,
  maxDistanceKm: null,
  minRating: null,
  facilities: [],
  stay: "unsure",
  openNow: false,
  partnerOnly: false,
  sort: "distance",
};

export function filterVenues(places: Place[], f: FitnessFilters): Place[] {
  const filtered = places.filter((p) => {
    const meta = p.meta;
    // "Open now" means Google explicitly said open. Unknown never passes.
    if (f.openNow && p.hours.openNow !== true) return false;
    if (f.partnerOnly && !meta.partner) return false;
    if (f.minRating !== null && (p.rating ?? 0) < f.minRating) return false;
    if (f.maxDistanceKm !== null && p.distanceKm !== undefined && p.distanceKm > f.maxDistanceKm) return false;
    if (f.maxPriceIls !== null) {
      // Only a stored price can rule a venue out; an unknown price never does.
      const monthly = storedMonthly(meta);
      if (monthly !== null && monthly > f.maxPriceIls) return false;
    }
    if (f.facilities.length) {
      const has = new Set(meta.facilities ?? []);
      if (!f.facilities.every((x) => has.has(x))) return false;
    }
    if (!fitsStay(meta, f.stay)) return false;
    return true;
  });

  return sortVenues(filtered, f.sort);
}

export function sortVenues(places: Place[], sort: SortMode): Place[] {
  const list = [...places];
  if (sort === "rating") return list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  if (sort === "price")
    return list.sort((a, b) => {
      // Venues with no known price sink to the bottom rather than pretending to be free.
      const pa = storedMonthly(a.meta) ?? Number.POSITIVE_INFINITY;
      const pb = storedMonthly(b.meta) ?? Number.POSITIVE_INFINITY;
      return pa - pb;
    });
  return list.sort((a, b) => (a.distanceKm ?? 99) - (b.distanceKm ?? 99));
}

export const countActiveFilters = (f: FitnessFilters) =>
  (f.activity !== "all" ? 1 : 0) +
  (f.maxPriceIls !== null ? 1 : 0) +
  (f.maxDistanceKm !== null ? 1 : 0) +
  (f.minRating !== null ? 1 : 0) +
  f.facilities.length +
  (f.stay !== "unsure" ? 1 : 0) +
  (f.openNow ? 1 : 0) +
  (f.partnerOnly ? 1 : 0);

/** The mini-app key saved places are filed under. */
export const FITNESS_APP = "fitness";
