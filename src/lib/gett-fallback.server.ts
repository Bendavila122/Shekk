/**
 * Fallback ride pricing + tracking used when Gett credentials are absent
 * or the Gett API is unreachable. Kept out of the *.functions.ts module so
 * server-function splitting can't drop these helpers.
 */
import type { Place, RideOption, RideStatus } from "./gett.server";

export function parsePlace(p: unknown): Place {
  const v = p as Partial<Place>;
  if (!v || typeof v.lat !== "number" || typeof v.lng !== "number" || typeof v.label !== "string") {
    throw new Error("Invalid location");
  }
  return { label: v.label.slice(0, 160), lat: v.lat, lng: v.lng };
}

export function km(a: Place, b: Place) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function simulatedOptions(pickup: Place, dropoff: Place): RideOption[] {
  const d = Math.max(1.2, km(pickup, dropoff));
  const base = 12 + d * 4.4;
  const round = (n: number) => Math.round(n * 2) / 2;
  return [
    { id: "sim-standard", productId: "sim-standard", name: "Gett Standard", seats: 4, etaMinutes: 3, price: round(base), currency: "ILS", emoji: "🚕" },
    { id: "sim-xl", productId: "sim-xl", name: "Gett XL (5 seats)", seats: 5, etaMinutes: 6, price: round(base * 1.45), currency: "ILS", emoji: "🚐" },
    { id: "sim-premium", productId: "sim-premium", name: "Gett Premium", seats: 4, etaMinutes: 5, price: round(base * 1.8), currency: "ILS", emoji: "🚙" },
  ];
}

const DRIVERS = ["Moshe", "Avi", "Yossi", "Dana", "Eli", "Noa"];
const CARS = ["White Skoda Octavia", "Grey Toyota Corolla", "Black Hyundai i30", "Silver Kia Niro"];

export function simulatedStatus(rideId: string): RideStatus {
  // rideId shape: sim.<startedAtMs>.<priceCents>.<seed>
  const [, startedAt, priceCents, seed] = rideId.split(".");
  const elapsed = (Date.now() - Number(startedAt)) / 1000;
  const s = Number(seed) || 0;
  const stage: RideStatus["status"] =
    elapsed < 8 ? "searching" : elapsed < 25 ? "assigned" : elapsed < 70 ? "arriving" : elapsed < 200 ? "in_progress" : "completed";
  const labels: Record<RideStatus["status"], string> = {
    searching: "Finding you a driver",
    assigned: "Driver accepted",
    arriving: "Driver is on the way",
    in_progress: "On the way to your destination",
    completed: "Ride complete",
    cancelled: "Ride cancelled",
  };
  return {
    rideId,
    status: stage,
    label: labels[stage],
    driverName: stage === "searching" ? undefined : DRIVERS[s % DRIVERS.length],
    car: stage === "searching" ? undefined : CARS[s % CARS.length],
    plate: stage === "searching" ? undefined : `${20 + (s % 70)}-${100 + (s % 800)}-${10 + (s % 80)}`,
    etaMinutes:
      stage === "arriving"
        ? Math.max(1, Math.round((70 - elapsed) / 20))
        : stage === "in_progress"
          ? Math.max(1, Math.round((200 - elapsed) / 45))
          : undefined,
    price: Number(priceCents) / 100,
    currency: "ILS",
    simulated: true,
  };
}

export async function nominatimSearch(q: string): Promise<Place[]> {
  if (q.trim().length < 3) return [];
  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", q);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "6");
    url.searchParams.set("countrycodes", "il");
    const res = await fetch(url, { headers: { "User-Agent": "Shekk/1.0 (rides)" } });
    if (!res.ok) return [];
    const json = (await res.json()) as Array<{ display_name: string; lat: string; lon: string }>;
    return json.map((p) => ({
      label: p.display_name.split(",").slice(0, 3).join(",").trim(),
      lat: Number(p.lat),
      lng: Number(p.lon),
    }));
  } catch (e) {
    console.error("Place search failed", e);
    return [];
  }
}
