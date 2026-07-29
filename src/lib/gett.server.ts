/**
 * Gett (Business API) client. Server-only.
 *
 * Docs: https://business-api.gett.com — OAuth2 client-credentials, then
 * price estimation, ride creation, tracking and cancellation.
 *
 * Credentials come from project secrets:
 *   GETT_CLIENT_ID, GETT_CLIENT_SECRET, optional GETT_API_BASE
 * When they are absent the app falls back to a local simulator so the
 * booking flow stays usable in preview.
 */

type TokenCache = { token: string; expiresAt: number };
let tokenCache: TokenCache | null = null;

export function gettConfigured() {
  return Boolean(process.env.GETT_CLIENT_ID && process.env.GETT_CLIENT_SECRET);
}

function base() {
  return (process.env.GETT_API_BASE || "https://business-api.gett.com").replace(/\/$/, "");
}

async function accessToken(): Promise<string> {
  const now = Date.now();
  if (tokenCache && tokenCache.expiresAt > now + 30_000) return tokenCache.token;

  const res = await fetch(`${base()}/v1/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      scope: "business",
      client_id: process.env.GETT_CLIENT_ID,
      client_secret: process.env.GETT_CLIENT_SECRET,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    console.error(`Gett auth failed [${res.status}]: ${body}`);
    throw new Error(`Gett auth failed [${res.status}]: ${body}`);
  }
  const json = (await res.json()) as { access_token: string; expires_in?: number };
  tokenCache = {
    token: json.access_token,
    expiresAt: now + (json.expires_in ?? 3600) * 1000,
  };
  return tokenCache.token;
}

export async function gettFetch<T>(
  path: string,
  init: { method?: string; body?: unknown; query?: Record<string, string | number | undefined> } = {},
): Promise<T> {
  const token = await accessToken();
  const url = new URL(`${base()}${path}`);
  for (const [k, v] of Object.entries(init.query ?? {})) {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
  }
  const res = await fetch(url.toString(), {
    method: init.method ?? "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) {
    console.error(`Gett request failed ${init.method ?? "GET"} ${path} [${res.status}]: ${text}`);
    throw new Error(`Gett request failed [${res.status}]: ${text}`);
  }
  return (text ? JSON.parse(text) : {}) as T;
}

/* ------------------------------------------------------------------ */
/* Shared types                                                        */
/* ------------------------------------------------------------------ */

export type Place = { label: string; lat: number; lng: number };

export type RideOption = {
  id: string;
  name: string;
  productId: string;
  seats: number;
  etaMinutes: number;
  price: number;
  currency: string;
  emoji: string;
};

export type RideStatus = {
  rideId: string;
  status: "searching" | "assigned" | "arriving" | "in_progress" | "completed" | "cancelled";
  label: string;
  driverName?: string;
  car?: string;
  plate?: string;
  etaMinutes?: number;
  price?: number;
  currency?: string;
  simulated: boolean;
};

/* ------------------------------------------------------------------ */
/* Live Gett calls                                                     */
/* ------------------------------------------------------------------ */

const EMOJI: Record<string, string> = { standard: "🚕", xl: "🚐", premium: "🚙", executive: "🚘" };

function emojiFor(name: string) {
  const key = Object.keys(EMOJI).find((k) => name.toLowerCase().includes(k));
  return key ? EMOJI[key] : "🚕";
}

export async function liveEstimate(pickup: Place, dropoff: Place): Promise<RideOption[]> {
  const data = await gettFetch<{
    products?: Array<{
      product_id?: string;
      id?: string;
      display_name?: string;
      name?: string;
      passengers?: number;
      eta?: number;
      eta_seconds?: number;
      price?: { amount?: number; currency?: string } | number;
      estimated_price?: { amount?: number; currency?: string };
    }>;
  }>("/v1/ride_price_estimation", {
    method: "POST",
    body: {
      pickup: { location: { lat: pickup.lat, lng: pickup.lng }, address: pickup.label },
      destination: { location: { lat: dropoff.lat, lng: dropoff.lng }, address: dropoff.label },
    },
  });

  return (data.products ?? []).map((p, i) => {
    const priceObj = typeof p.price === "object" ? p.price : p.estimated_price;
    const amount = typeof p.price === "number" ? p.price : (priceObj?.amount ?? 0);
    const name = p.display_name || p.name || `Option ${i + 1}`;
    return {
      id: p.product_id || p.id || `gett-${i}`,
      productId: p.product_id || p.id || "",
      name,
      seats: p.passengers ?? 4,
      etaMinutes: p.eta ?? Math.round((p.eta_seconds ?? 240) / 60),
      price: Number(amount) || 0,
      currency: priceObj?.currency ?? "ILS",
      emoji: emojiFor(name),
    };
  });
}

export async function liveBook(args: {
  pickup: Place;
  dropoff: Place;
  productId: string;
  passengerName: string;
  passengerPhone?: string;
}): Promise<{ rideId: string }> {
  const data = await gettFetch<{ ride_id?: string; id?: string }>("/v1/rides", {
    method: "POST",
    body: {
      product_id: args.productId,
      pickup: { location: { lat: args.pickup.lat, lng: args.pickup.lng }, address: args.pickup.label },
      destination: { location: { lat: args.dropoff.lat, lng: args.dropoff.lng }, address: args.dropoff.label },
      passenger: { first_name: args.passengerName, phone: args.passengerPhone },
      payment: { type: "business_account" },
    },
  });
  return { rideId: data.ride_id || data.id || "" };
}

export async function liveStatus(rideId: string): Promise<RideStatus> {
  const data = await gettFetch<{
    status?: string;
    driver?: { first_name?: string; name?: string; car?: { model?: string; plate_number?: string; color?: string } };
    eta?: number;
    price?: { amount?: number; currency?: string };
  }>(`/v1/rides/${encodeURIComponent(rideId)}`);

  const raw = (data.status || "searching").toLowerCase();
  const status: RideStatus["status"] =
    raw.includes("cancel") ? "cancelled"
    : raw.includes("complet") || raw.includes("finish") ? "completed"
    : raw.includes("progress") || raw.includes("onboard") ? "in_progress"
    : raw.includes("arriv") || raw.includes("waiting") ? "arriving"
    : raw.includes("assign") || raw.includes("accept") ? "assigned"
    : "searching";

  return {
    rideId,
    status,
    label: raw.replace(/_/g, " "),
    driverName: data.driver?.first_name || data.driver?.name,
    car: [data.driver?.car?.color, data.driver?.car?.model].filter(Boolean).join(" ") || undefined,
    plate: data.driver?.car?.plate_number,
    etaMinutes: data.eta,
    price: data.price?.amount,
    currency: data.price?.currency ?? "ILS",
    simulated: false,
  };
}

export async function liveCancel(rideId: string): Promise<void> {
  await gettFetch(`/v1/rides/${encodeURIComponent(rideId)}/cancel`, { method: "POST", body: {} });
}
