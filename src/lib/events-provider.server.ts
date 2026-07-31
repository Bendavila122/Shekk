/**
 * Ticketing partner seam.
 *
 * Shekk's events layer is provider-agnostic: rows carry a `provider` and a
 * `provider_ref` so listings pulled from a partner (Eventer, Tickchak, …) can
 * live beside the ones created in the Shekk Console.
 *
 * No partner is wired up yet — that needs a partner agreement and an API key
 * from the platform. When one lands, implement `listPartnerEvents` against
 * their real response shape and `syncPartnerEvents` will upsert by
 * `provider_ref`. Nothing here ever invents listings.
 */

import type { EventKind } from "./events.server";

export type PartnerEvent = {
  ref: string;
  title: string;
  kind: EventKind;
  description: string | null;
  host: string;
  venue: string | null;
  city: string | null;
  startsAt: string;
  endsAt: string | null;
  price: number;
  capacity: number;
  coverUrl: string | null;
};

export type PartnerId = "eventer" | "tickchak";

function credentials(provider: PartnerId): string | null {
  const key = provider === "eventer" ? process.env.EVENTER_API_KEY : process.env.TICKCHAK_API_KEY;
  return key && key.length > 0 ? key : null;
}

/** Is a partner feed configured at all? */
export function partnerConfigured(provider: PartnerId): boolean {
  return credentials(provider) !== null;
}

/**
 * Fetch and normalise a partner's listings.
 *
 * Returns an empty list while no credentials are configured, so the rest of the
 * app behaves exactly as it does today: the catalogue is whatever the console
 * holds.
 */
export async function listPartnerEvents(provider: PartnerId): Promise<PartnerEvent[]> {
  const key = credentials(provider);
  if (!key) return [];
  // Implement against the partner's documented endpoint once access is granted.
  console.warn(`[events] ${provider} adapter not implemented yet`);
  return [];
}

/** Upsert a partner's listings into the catalogue, keyed on provider_ref. */
export async function syncPartnerEvents(provider: PartnerId): Promise<{ synced: number }> {
  const listings = await listPartnerEvents(provider);
  if (listings.length === 0) return { synced: 0 };

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const rows = listings.map((e) => ({
    provider,
    provider_ref: e.ref,
    title: e.title,
    kind: e.kind,
    description: e.description,
    host: e.host,
    venue: e.venue,
    city: e.city,
    starts_at: e.startsAt,
    ends_at: e.endsAt,
    price_agorot: Math.round(e.price * 100),
    capacity: e.capacity,
    cover_url: e.coverUrl,
    status: "published" as const,
  }));

  const { error } = await supabaseAdmin
    .from("events")
    .upsert(rows, { onConflict: "provider,provider_ref" });
  if (error) {
    console.error(`[events] ${provider} sync:`, error.message);
    throw new Error("Could not sync partner events");
  }
  return { synced: rows.length };
}
