/**
 * Fitness discovery — shared types and Shekk's own layer on top of Google Places.
 *
 * Google tells us WHERE a place is, whether it is open and how people rate it.
 * Shekk adds what a student actually needs to decide: what a month costs, how
 * long the contract is, whether there is a short-stay option and whether we
 * have a partner offer. Venue-level extras will move into the backend when
 * partners are signed; the chain-level knowledge below is product content and
 * is matched by name so it works from day one.
 */

export type ActivityType =
  | "gym"
  | "classes"
  | "pool"
  | "studio"
  | "martial"
  | "climbing"
  | "courts"
  | "outdoor";

export const ACTIVITY_TYPES: { id: ActivityType; label: string; emoji: string; placeTypes: string[]; keyword: string }[] = [
  { id: "gym", label: "Gyms", emoji: "🏋️", placeTypes: ["gym", "fitness_center"], keyword: "gym" },
  { id: "classes", label: "Classes", emoji: "🤸", placeTypes: ["fitness_center", "yoga_studio"], keyword: "fitness class" },
  { id: "pool", label: "Pools", emoji: "🏊", placeTypes: ["swimming_pool"], keyword: "swimming pool" },
  { id: "studio", label: "Studios", emoji: "🧘", placeTypes: ["yoga_studio", "fitness_center"], keyword: "pilates yoga studio" },
  { id: "martial", label: "Martial arts", emoji: "🥋", placeTypes: ["gym"], keyword: "krav maga boxing martial arts" },
  { id: "climbing", label: "Climbing", emoji: "🧗", placeTypes: ["gym"], keyword: "climbing wall bouldering" },
  { id: "courts", label: "Courts & pitches", emoji: "⚽", placeTypes: ["sports_club", "sports_complex", "athletic_field"], keyword: "basketball football court" },
  { id: "outdoor", label: "Outdoor & running", emoji: "🏃", placeTypes: ["park", "sports_complex"], keyword: "running track outdoor gym" },
];

export const activityType = (id: string) => ACTIVITY_TYPES.find((a) => a.id === id);

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

/** How long the member is in Israel — drives which commitment actually fits. */
export type StayLength = "weeks" | "term" | "year" | "unsure";

export const STAY_OPTIONS: { id: StayLength; label: string; hint: string; months: number }[] = [
  { id: "weeks", label: "A few weeks", hint: "Day passes and punch cards", months: 1 },
  { id: "term", label: "A term (3–5 months)", hint: "Short contracts and monthly rolling", months: 4 },
  { id: "year", label: "The full year", hint: "Annual deals are cheapest per month", months: 10 },
  { id: "unsure", label: "Not sure yet", hint: "Show everything", months: 0 },
];

export const stayOption = (id: StayLength) => STAY_OPTIONS.find((s) => s.id === id)!;

/** Shekk's commercial layer for a venue or chain. */
export type FitnessExtras = {
  /** Typical monthly membership in shekels. */
  monthlyIls?: number;
  /** Cheapest one-off entry in shekels. */
  dayPassIls?: number;
  /** Shortest contract they will actually sign, in months. 1 = rolling. */
  minContractMonths?: number;
  /** True when a term-length or punch-card option exists. */
  shortStay?: boolean;
  facilities?: Facility[];
  /** A Shekk partner offer, when one is agreed. */
  offer?: string;
  note?: string;
};

/**
 * Chain-level knowledge, matched on the venue name. Ranges are typical list
 * prices students report — always shown as "typical", never as a quote.
 */
const CHAINS: { match: RegExp; label: string; extras: FitnessExtras }[] = [
  {
    match: /holmes\s*place/i,
    label: "Holmes Place",
    extras: {
      monthlyIls: 329,
      dayPassIls: 90,
      minContractMonths: 12,
      shortStay: false,
      facilities: ["pool", "sauna", "classes", "weights", "parking", "english"],
      note: "Big clubs with pools. Contracts are usually 12 months — ask about a student freeze.",
    },
  },
  {
    match: /\bicon\b|אייקון/i,
    label: "Icon Fitness",
    extras: {
      monthlyIls: 199,
      dayPassIls: 60,
      minContractMonths: 3,
      shortStay: true,
      facilities: ["classes", "weights", "student"],
      note: "Often happy to do a 3-month term for gap-year students.",
    },
  },
  {
    match: /gymbox|ג'ימבוקס/i,
    label: "GymBox",
    extras: {
      monthlyIls: 169,
      dayPassIls: 50,
      minContractMonths: 1,
      shortStay: true,
      facilities: ["weights", "classes"],
      note: "Rolling monthly, no long tie-in — the easiest one to leave.",
    },
  },
  {
    match: /go\s*active|גו\s*אקטיב/i,
    label: "Go Active",
    extras: { monthlyIls: 249, dayPassIls: 70, minContractMonths: 6, shortStay: true, facilities: ["pool", "classes", "weights"] },
  },
  {
    match: /country\s*club|קאנטרי/i,
    label: "Country club",
    extras: {
      monthlyIls: 299,
      dayPassIls: 80,
      minContractMonths: 3,
      shortStay: true,
      facilities: ["pool", "sauna", "classes", "parking"],
      note: "Municipal country clubs sell single entries — good if you only swim now and then.",
    },
  },
  {
    match: /krav\s*maga/i,
    label: "Krav Maga",
    extras: { monthlyIls: 250, dayPassIls: 80, minContractMonths: 1, shortStay: true, facilities: ["classes", "english"] },
  },
  {
    match: /climb|boulder|טיפוס/i,
    label: "Climbing",
    extras: { monthlyIls: 220, dayPassIls: 75, minContractMonths: 1, shortStay: true, facilities: ["classes"] },
  },
  {
    match: /yoga|pilates|יוגה|פילאטיס/i,
    label: "Studio",
    extras: { monthlyIls: 320, dayPassIls: 70, minContractMonths: 1, shortStay: true, facilities: ["classes", "english"] },
  },
  {
    match: /pool|swim|בריכ/i,
    label: "Pool",
    extras: { dayPassIls: 55, monthlyIls: 240, minContractMonths: 1, shortStay: true, facilities: ["pool"] },
  },
];

/** What Shekk knows about this venue beyond what Google returns. */
export function extrasFor(name: string, types: string[] = []): FitnessExtras & { chain?: string } {
  const hit = CHAINS.find((c) => c.match.test(name));
  if (hit) return { ...hit.extras, chain: hit.label };
  // Fall back to a light guess from the Places types so filters still behave.
  if (types.includes("swimming_pool")) return { dayPassIls: 55, minContractMonths: 1, shortStay: true, facilities: ["pool"] };
  if (types.includes("yoga_studio")) return { dayPassIls: 70, minContractMonths: 1, shortStay: true, facilities: ["classes"] };
  return {};
}

/** A venue as the Fitness screens use it. */
export type FitnessVenue = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lon: number;
  rating: number | null;
  reviews: number | null;
  openNow: boolean | null;
  priceLevel: number | null;
  types: string[];
  phone?: string | null;
  website?: string | null;
  mapsUri?: string | null;
  photoName?: string | null;
  hours?: string[];
  /** Straight-line km from the member, filled in client-side. */
  distanceKm?: number;
  extras: FitnessExtras & { chain?: string };
};

export const shekels = (n: number) => `₪${Math.round(n).toLocaleString("en-IL")}`;

export const distanceLabel = (km?: number) =>
  km === undefined ? "" : km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(km < 10 ? 1 : 0)} km`;

/** Rough walk time at 4.8 km/h — enough for a discovery list. */
export const walkMinutes = (km: number) => Math.max(1, Math.round((km / 4.8) * 60));

/** Cheapest sensible monthly cost for someone staying `months` months. */
export function effectiveMonthly(extras: FitnessExtras, months: number): number | null {
  if (extras.monthlyIls === undefined) return null;
  if (!months || months >= 6) return extras.monthlyIls;
  // Short stays usually pay a premium when they dodge the long contract.
  return Math.round(extras.monthlyIls * (extras.shortStay ? 1.1 : 1.25));
}

/** Does this venue realistically work for a stay of this length? */
export function fitsStay(extras: FitnessExtras, stay: StayLength): boolean {
  if (stay === "unsure" || stay === "year") return true;
  const min = extras.minContractMonths;
  if (min === undefined) return true;
  const months = stayOption(stay).months;
  return extras.shortStay === true || min <= months || Boolean(extras.dayPassIls);
}

export type FitnessFilters = {
  activity: ActivityType | "all";
  maxPriceIls: number | null;
  maxDistanceKm: number | null;
  facilities: Facility[];
  stay: StayLength;
  openNow: boolean;
  partnerOnly: boolean;
};

export const DEFAULT_FILTERS: FitnessFilters = {
  activity: "all",
  maxPriceIls: null,
  maxDistanceKm: null,
  facilities: [],
  stay: "unsure",
  openNow: false,
  partnerOnly: false,
};

export function filterVenues(venues: FitnessVenue[], f: FitnessFilters): FitnessVenue[] {
  return venues.filter((v) => {
    if (f.openNow && v.openNow === false) return false;
    if (f.partnerOnly && !v.extras.offer) return false;
    if (f.maxDistanceKm !== null && v.distanceKm !== undefined && v.distanceKm > f.maxDistanceKm) return false;
    if (f.maxPriceIls !== null) {
      const monthly = effectiveMonthly(v.extras, stayOption(f.stay).months);
      if (monthly !== null && monthly > f.maxPriceIls) return false;
    }
    if (f.facilities.length) {
      const has = new Set(v.extras.facilities ?? []);
      if (!f.facilities.every((x) => has.has(x))) return false;
    }
    if (!fitsStay(v.extras, f.stay)) return false;
    return true;
  });
}

export const countActiveFilters = (f: FitnessFilters) =>
  (f.activity !== "all" ? 1 : 0) +
  (f.maxPriceIls !== null ? 1 : 0) +
  (f.maxDistanceKm !== null ? 1 : 0) +
  f.facilities.length +
  (f.stay !== "unsure" ? 1 : 0) +
  (f.openNow ? 1 : 0) +
  (f.partnerOnly ? 1 : 0);
