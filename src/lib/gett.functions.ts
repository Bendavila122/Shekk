import { createServerFn } from "@tanstack/react-start";
import {
  gettConfigured,
  liveBook,
  liveCancel,
  liveEstimate,
  liveStatus,
  type Place,
  type RideOption,
  type RideStatus,
} from "./gett.server";

const place = (p: unknown): Place => {
  const v = p as Partial<Place>;
  if (!v || typeof v.lat !== "number" || typeof v.lng !== "number" || typeof v.label !== "string") {
    throw new Error("Invalid location");
  }
  return { label: v.label.slice(0, 160), lat: v.lat, lng: v.lng };
};

function km(a: Place, b: Place) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function simulatedOptions(pickup: Place, dropoff: Place): RideOption[] {
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

function simulatedStatus(rideId: string): RideStatus {
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
    etaMinutes: stage === "arriving" ? Math.max(1, Math.round((70 - elapsed) / 20)) : stage === "in_progress" ? Math.max(1, Math.round((200 - elapsed) / 45)) : undefined,
    price: Number(priceCents) / 100,
    currency: "ILS",
    simulated: true,
  };
}

/** Whether the app is talking to the real Gett Business API. */
export const gettStatusFn = createServerFn({ method: "GET" }).handler(async () => ({
  live: gettConfigured(),
}));

/** Search an address and return coordinates (OpenStreetMap Nominatim). */
export const searchPlaces = createServerFn({ method: "GET" })
  .inputValidator((d: { q: string }) => ({ q: String(d.q ?? "").slice(0, 120) }))
  .handler(async ({ data }) => {
    if (data.q.trim().length < 3) return { places: [] as Place[] };
    try {
      const url = new URL("https://nominatim.openstreetmap.org/search");
      url.searchParams.set("q", data.q);
      url.searchParams.set("format", "json");
      url.searchParams.set("limit", "6");
      url.searchParams.set("countrycodes", "il");
      const res = await fetch(url, { headers: { "User-Agent": "Shekk/1.0 (rides)" } });
      if (!res.ok) return { places: [] as Place[] };
      const json = (await res.json()) as Array<{ display_name: string; lat: string; lon: string }>;
      return {
        places: json.map((p) => ({
          label: p.display_name.split(",").slice(0, 3).join(",").trim(),
          lat: Number(p.lat),
          lng: Number(p.lon),
        })),
      };
    } catch (e) {
      console.error("Place search failed", e);
      return { places: [] as Place[] };
    }
  });

/** Price + ETA options for a journey. */
export const estimateRide = createServerFn({ method: "POST" })
  .inputValidator((d: { pickup: unknown; dropoff: unknown }) => ({
    pickup: place(d.pickup),
    dropoff: place(d.dropoff),
  }))
  .handler(async ({ data }) => {
    if (!gettConfigured()) {
      return { live: false, options: simulatedOptions(data.pickup, data.dropoff) };
    }
    try {
      const options = await liveEstimate(data.pickup, data.dropoff);
      if (!options.length) return { live: true, options: simulatedOptions(data.pickup, data.dropoff) };
      return { live: true, options };
    } catch (e) {
      console.error("Gett estimate failed", e);
      return { live: false, options: simulatedOptions(data.pickup, data.dropoff), error: "Gett unavailable — showing indicative prices." };
    }
  });

/** Order the taxi. */
export const bookRide = createServerFn({ method: "POST" })
  .inputValidator((d: { pickup: unknown; dropoff: unknown; productId: string; price: number; passengerName: string; passengerPhone?: string }) => ({
    pickup: place(d.pickup),
    dropoff: place(d.dropoff),
    productId: String(d.productId ?? "").slice(0, 80),
    price: Math.max(0, Number(d.price) || 0),
    passengerName: String(d.passengerName ?? "Shekk member").slice(0, 60),
    passengerPhone: d.passengerPhone ? String(d.passengerPhone).slice(0, 24) : undefined,
  }))
  .handler(async ({ data }) => {
    const simulate = () => ({
      live: false,
      rideId: `sim.${Date.now()}.${Math.round(data.price * 100)}.${Math.floor(Math.random() * 1000)}`,
    });
    if (!gettConfigured() || data.productId.startsWith("sim-")) return simulate();
    try {
      const { rideId } = await liveBook(data);
      if (!rideId) return simulate();
      return { live: true, rideId };
    } catch (e) {
      console.error("Gett booking failed", e);
      return { ...simulate(), error: "Gett booking unavailable — tracking a simulated ride." };
    }
  });

/** Poll ride progress. */
export const rideStatus = createServerFn({ method: "POST" })
  .inputValidator((d: { rideId: string }) => ({ rideId: String(d.rideId ?? "").slice(0, 120) }))
  .handler(async ({ data }): Promise<RideStatus> => {
    if (data.rideId.startsWith("sim.")) return simulatedStatus(data.rideId);
    try {
      return await liveStatus(data.rideId);
    } catch (e) {
      console.error("Gett status failed", e);
      throw new Error("Could not fetch ride status");
    }
  });

/** Cancel an in-flight ride. */
export const cancelRide = createServerFn({ method: "POST" })
  .inputValidator((d: { rideId: string }) => ({ rideId: String(d.rideId ?? "").slice(0, 120) }))
  .handler(async ({ data }) => {
    if (data.rideId.startsWith("sim.")) return { ok: true };
    try {
      await liveCancel(data.rideId);
      return { ok: true };
    } catch (e) {
      console.error("Gett cancel failed", e);
      return { ok: false };
    }
  });
