/**
 * Maps mini app — shared types and the category taxonomy.
 *
 * Everything here is browser-safe: the Google calls themselves live in
 * maps.server.ts behind the connector gateway.
 */

export type MapsPlace = {
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
  phone: string | null;
  website: string | null;
  mapsUri: string | null;
  hours?: string[];
};

export type MapsLeg = { mode: "WALK" | "TRANSIT" | "DRIVE"; minutes: number; km: number } | null;

export type MapsCategory = {
  id: string;
  label: string;
  emoji: string;
  /** Google Places (New) types this category searches. */
  placeTypes: string[];
};

/** What a student in Israel actually looks for on a map. */
export const MAPS_CATEGORIES: MapsCategory[] = [
  { id: "food", label: "Food", emoji: "🥙", placeTypes: ["restaurant", "meal_takeaway", "bakery"] },
  { id: "cafe", label: "Coffee", emoji: "☕", placeTypes: ["cafe", "coffee_shop"] },
  { id: "supermarket", label: "Groceries", emoji: "🛒", placeTypes: ["supermarket", "grocery_store", "convenience_store"] },
  { id: "pharmacy", label: "Pharmacy", emoji: "💊", placeTypes: ["pharmacy", "drugstore"] },
  { id: "clinic", label: "Clinic", emoji: "🩺", placeTypes: ["doctor", "hospital", "medical_lab"] },
  { id: "atm", label: "Cash", emoji: "🏧", placeTypes: ["atm", "bank"] },
  { id: "transit", label: "Transit", emoji: "🚌", placeTypes: ["bus_station", "train_station", "light_rail_station"] },
  { id: "gym", label: "Gym", emoji: "🏋️", placeTypes: ["gym", "fitness_center"] },
  { id: "laundry", label: "Laundry", emoji: "🧺", placeTypes: ["laundry"] },
  { id: "shul", label: "Shul", emoji: "🕍", placeTypes: ["synagogue"] },
  { id: "sights", label: "Sights", emoji: "📸", placeTypes: ["tourist_attraction", "museum", "historical_landmark"] },
  { id: "shops", label: "Shops", emoji: "🛍️", placeTypes: ["shopping_mall", "clothing_store", "electronics_store"] },
];

export const mapsCategory = (id: string) => MAPS_CATEGORIES.find((c) => c.id === id) ?? MAPS_CATEGORIES[0]!;

export function categoryEmoji(place: MapsPlace): string {
  for (const c of MAPS_CATEGORIES) {
    if (place.types.some((t) => c.placeTypes.includes(t))) return c.emoji;
  }
  return "📍";
}

export const RADII = [
  { label: "500 m", value: 500 },
  { label: "1 km", value: 1000 },
  { label: "3 km", value: 3000 },
  { label: "10 km", value: 10000 },
];

export function kmLabel(km: number) {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(km < 10 ? 1 : 0)} km`;
}

export const PRICE_LABEL = ["Free", "₪", "₪₪", "₪₪₪", "₪₪₪₪"];

/** Deep link that opens the place in the real Google Maps app. */
export function directionsUrl(place: MapsPlace) {
  return (
    place.mapsUri ??
    `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}&destination_place_id=${place.id}`
  );
}
