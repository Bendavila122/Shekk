/**
 * Shekk Location Platform — one taxonomy.
 *
 * Every mini app picks the categories it cares about from this single list, so
 * "gym" means the same Google types in Fitness, Maps and anywhere else.
 */

export type PlaceCategoryId =
  | "food"
  | "kosher"
  | "cafe"
  | "supermarket"
  | "pharmacy"
  | "clinic"
  | "atm"
  | "transit"
  | "gym"
  | "classes"
  | "pool"
  | "studio"
  | "martial"
  | "climbing"
  | "courts"
  | "outdoor"
  | "laundry"
  | "shul"
  | "mikveh"
  | "sights"
  | "nightlife"
  | "shops";

export type PlaceCategory = {
  id: PlaceCategoryId;
  label: string;
  emoji: string;
  /** Google Places (New) `includedTypes` for a nearby search. */
  placeTypes: string[];
  /** Extra words that sharpen a text search. Empty when the types suffice. */
  keyword: string;
};

export const PLACE_CATEGORIES: PlaceCategory[] = [
  { id: "food", label: "Food", emoji: "🥙", placeTypes: ["restaurant", "meal_takeaway", "bakery"], keyword: "" },
  { id: "kosher", label: "Kosher", emoji: "🍽️", placeTypes: ["restaurant", "meal_takeaway"], keyword: "kosher" },
  { id: "cafe", label: "Coffee", emoji: "☕", placeTypes: ["cafe", "coffee_shop"], keyword: "" },
  {
    id: "supermarket",
    label: "Groceries",
    emoji: "🛒",
    placeTypes: ["supermarket", "grocery_store", "convenience_store"],
    keyword: "",
  },
  { id: "pharmacy", label: "Pharmacy", emoji: "💊", placeTypes: ["pharmacy", "drugstore"], keyword: "" },
  { id: "clinic", label: "Clinic", emoji: "🩺", placeTypes: ["doctor", "hospital", "medical_lab"], keyword: "" },
  { id: "atm", label: "Cash", emoji: "🏧", placeTypes: ["atm", "bank"], keyword: "" },
  {
    id: "transit",
    label: "Transit",
    emoji: "🚌",
    placeTypes: ["bus_station", "train_station", "light_rail_station"],
    keyword: "",
  },
  { id: "gym", label: "Gyms", emoji: "🏋️", placeTypes: ["gym", "fitness_center"], keyword: "gym" },
  { id: "classes", label: "Classes", emoji: "🤸", placeTypes: ["fitness_center", "yoga_studio"], keyword: "fitness class" },
  { id: "pool", label: "Pools", emoji: "🏊", placeTypes: ["swimming_pool"], keyword: "swimming pool" },
  {
    id: "studio",
    label: "Studios",
    emoji: "🧘",
    placeTypes: ["yoga_studio", "fitness_center"],
    keyword: "pilates yoga studio",
  },
  { id: "martial", label: "Martial arts", emoji: "🥋", placeTypes: ["gym"], keyword: "krav maga boxing martial arts" },
  { id: "climbing", label: "Climbing", emoji: "🧗", placeTypes: ["gym"], keyword: "climbing wall bouldering" },
  {
    id: "courts",
    label: "Courts & pitches",
    emoji: "⚽",
    placeTypes: ["sports_club", "sports_complex", "athletic_field"],
    keyword: "basketball football court",
  },
  {
    id: "outdoor",
    label: "Outdoor & running",
    emoji: "🏃",
    placeTypes: ["park", "sports_complex"],
    keyword: "running track outdoor gym",
  },
  { id: "laundry", label: "Laundry", emoji: "🧺", placeTypes: ["laundry"], keyword: "" },
  { id: "shul", label: "Shul", emoji: "🕍", placeTypes: ["synagogue"], keyword: "" },
  { id: "mikveh", label: "Mikveh", emoji: "💧", placeTypes: ["place_of_worship"], keyword: "mikveh" },
  {
    id: "sights",
    label: "Sights",
    emoji: "📸",
    placeTypes: ["tourist_attraction", "museum", "historical_landmark"],
    keyword: "",
  },
  { id: "nightlife", label: "Nightlife", emoji: "🌃", placeTypes: ["bar", "night_club"], keyword: "" },
  {
    id: "shops",
    label: "Shops",
    emoji: "🛍️",
    placeTypes: ["shopping_mall", "clothing_store", "electronics_store"],
    keyword: "",
  },
];

const BY_ID = new Map(PLACE_CATEGORIES.map((c) => [c.id, c]));

export const placeCategory = (id: string): PlaceCategory | undefined => BY_ID.get(id as PlaceCategoryId);

/** The category set a mini app offers, in the order it should be shown. */
export function categorySet(ids: readonly PlaceCategoryId[]): PlaceCategory[] {
  return ids.map((id) => BY_ID.get(id)).filter((c): c is PlaceCategory => Boolean(c));
}

/** Which of the given categories a place looks like. */
export function categoryFor(types: readonly string[], within = PLACE_CATEGORIES): PlaceCategory | undefined {
  return within.find((c) => types.some((t) => c.placeTypes.includes(t)));
}

/** The emoji to pin this place with, falling back to a generic marker. */
export function emojiFor(types: readonly string[], within = PLACE_CATEGORIES): string {
  return categoryFor(types, within)?.emoji ?? "📍";
}

/**
 * Google's nearby search caps `includedTypes`, and a huge union returns mush.
 * Collapse a category set into a sane, de-duplicated list.
 */
export function placeTypesFor(categories: readonly PlaceCategory[], limit = 8): string[] {
  return Array.from(new Set(categories.flatMap((c) => c.placeTypes))).slice(0, limit);
}
