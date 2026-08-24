/**
 * Shekk Location Platform — the Shekk-owned metadata layer. Server only.
 *
 * `venue_meta` holds ONLY what Shekk knows: prices we checked, contract length,
 * facilities, partner status. It is joined to Google results by place id.
 *
 * Nothing Google-derived is ever written here — no ratings, hours, photos,
 * review counts or phone numbers — because Google's terms do not permit a
 * durable copy of Places content.
 *
 * `internal_notes` is deliberately absent from the column list below: it is for
 * the console only and must never reach a member-facing place response.
 */

import { cachedOwn, TTL } from "./cache.server";
import type { Place, PlaceMeta } from "./types";

/** Member-facing columns only. Never add `internal_notes` here. */
export const PUBLIC_META_COLUMNS =
  "google_place_id, label, name_snapshot, chain, city, day_pass_ils, monthly_ils, min_contract_months, facilities, english_friendly, short_stay, partner, partner_offer, verified_at, notes, active";

type MetaRow = {
  google_place_id: string;
  label: string | null;
  name_snapshot: string | null;
  chain: string | null;
  city: string | null;
  day_pass_ils: number | null;
  monthly_ils: number | null;
  min_contract_months: number | null;
  facilities: string[] | null;
  english_friendly: boolean;
  short_stay: boolean;
  partner: boolean;
  partner_offer: string | null;
  verified_at: string | null;
  notes: string | null;
  active: boolean;
};

/** Row -> PlaceMeta, dropping every field we simply don't know. */
export function toMeta(row: MetaRow): PlaceMeta {
  const meta: PlaceMeta = {};
  if (row.chain) meta.chain = row.chain;
  if (row.city) meta.city = row.city;
  if (row.day_pass_ils !== null) meta.dayPassIls = row.day_pass_ils;
  if (row.monthly_ils !== null) meta.monthlyIls = row.monthly_ils;
  if (row.min_contract_months !== null) meta.minContractMonths = row.min_contract_months;
  if (row.facilities?.length) meta.facilities = row.facilities;
  if (row.english_friendly) meta.englishFriendly = true;
  if (row.short_stay) meta.shortStay = true;
  if (row.partner) meta.partner = true;
  // An offer is only ever surfaced for a signed partner.
  if (row.partner && row.partner_offer) meta.partnerOffer = row.partner_offer;
  if (row.verified_at) meta.verifiedAt = row.verified_at;
  if (row.notes) meta.notes = row.notes;
  return meta;
}

async function db() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as unknown as { from: (t: string) => any };
}

/**
 * Load Shekk metadata for a batch of place ids. Read-only and non-sensitive, so
 * a failure degrades to "we know nothing about these" rather than an error.
 */
export async function metaFor(placeIds: string[]): Promise<Map<string, PlaceMeta>> {
  const ids = Array.from(new Set(placeIds.filter(Boolean))).sort();
  if (!ids.length) return new Map();

  return cachedOwn(`meta:${ids.join("|")}`, TTL.meta, async () => {
    try {
      const client = await db();
      const { data, error } = await client
        .from("venue_meta")
        .select(PUBLIC_META_COLUMNS)
        .eq("active", true)
        .in("google_place_id", ids);
      if (error) throw error;
      const map = new Map<string, PlaceMeta>();
      for (const row of (data ?? []) as MetaRow[]) map.set(row.google_place_id, toMeta(row));
      return map;
    } catch (e) {
      console.error("venue_meta lookup failed", e);
      return new Map<string, PlaceMeta>();
    }
  });
}

/** Attach Shekk metadata to Google results. Pure — easy to test. */
export function mergeMeta(places: Place[], meta: Map<string, PlaceMeta>): Place[] {
  return places.map((p) => {
    const found = meta.get(p.id);
    return found ? { ...p, meta: found } : p;
  });
}

/** Fetch and merge in one step. */
export async function withMeta(places: Place[]): Promise<Place[]> {
  if (!places.length) return places;
  return mergeMeta(places, await metaFor(places.map((p) => p.id)));
}
