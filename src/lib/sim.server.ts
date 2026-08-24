/**
 * SIM/eSIM data layer.
 *
 * Catalogue reads use a publishable-key client (RLS exposes only active rows).
 * Everything that writes — recommendations, outbound clicks, admin edits — runs
 * with the service role, so the browser can never author catalogue data.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { FulfilmentMode, PlanSource, PlanType, SimAnswers, SimPlan, SimProvider } from "./sim";
import { rankPlans } from "./sim-ranking";

/* ───────────────────────────── clients ───────────────────────────── */

function publicClient(): SupabaseClient {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

async function adminClient(): Promise<SupabaseClient> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as unknown as SupabaseClient;
}

/* ───────────────────────────── mapping ───────────────────────────── */

function mapProvider(row: any): SimProvider {
  const mode = (row.mode ?? "disabled") as FulfilmentMode;
  return {
    id: row.id,
    name: row.name,
    blurb: row.blurb ?? null,
    siteUrl: row.site_url ?? null,
    mode,
    affiliateReady: mode === "affiliate" && Boolean(row.affiliate_url_template),
    sortOrder: row.sort_order ?? 0,
  };
}

function mapPlan(row: any, providers: Map<string, SimProvider>): SimPlan {
  return {
    id: row.id,
    providerId: row.provider_id,
    provider: providers.get(row.provider_id) ?? null,
    externalId: row.external_id ?? null,
    name: row.name,
    headline: row.headline ?? null,
    countryCode: row.country_code ?? "IL",
    planType: (row.plan_type ?? "data_only") as PlanType,
    dataMb: row.data_mb ?? null,
    unlimited: Boolean(row.unlimited),
    fairUseNote: row.fair_use_note ?? null,
    validityDays: row.validity_days ?? null,
    callsIncluded: Boolean(row.calls_included),
    textsIncluded: Boolean(row.texts_included),
    phoneNumberIncluded: Boolean(row.phone_number_included),
    rechargeable: Boolean(row.rechargeable),
    activationPolicy: row.activation_policy ?? null,
    operator: row.operator ?? null,
    networks: row.networks ?? [],
    displayPriceMinor: row.display_price_minor ?? 0,
    displayPriceLabel: row.display_price_label ?? null,
    displayPeriodLabel: row.display_period_label ?? null,
    currency: row.currency ?? "GBP",
    source: (row.source ?? "manual") as PlanSource,
    featured: Boolean(row.featured),
    rankBoost: row.rank_boost ?? 0,
    points: row.points ?? [],
  };
}

/* ───────────────────────────── catalogue reads ───────────────────────────── */

export async function listPlans(): Promise<SimPlan[]> {
  const db = publicClient();
  const [{ data: providerRows }, { data: planRows }] = await Promise.all([
    db.from("sim_providers").select("*").eq("active", true).order("sort_order"),
    db.from("sim_plans").select("*").eq("active", true).eq("in_stock", true),
  ]);
  const providers = new Map((providerRows ?? []).map((p) => [p.id as string, mapProvider(p)]));
  return (planRows ?? []).map((r) => mapPlan(r, providers));
}

export async function getPlan(id: string): Promise<SimPlan | null> {
  const db = publicClient();
  const { data: row } = await db.from("sim_plans").select("*").eq("id", id).eq("active", true).maybeSingle();
  if (!row) return null;
  const { data: p } = await db.from("sim_providers").select("*").eq("id", row.provider_id).maybeSingle();
  const providers = new Map<string, SimProvider>();
  if (p) providers.set(p.id as string, mapProvider(p));
  return mapPlan(row, providers);
}

/* ───────────────────────────── recommendation ───────────────────────────── */

export async function saveRecommendation(
  userId: string | null,
  answers: SimAnswers,
): Promise<{ recommendationId: string | null; rankedPlanIds: string[] }> {
  const plans = await listPlans();
  const ranked = rankPlans(plans, answers);
  const rankedPlanIds = ranked.map((r) => r.plan.id);
  if (rankedPlanIds.length === 0) return { recommendationId: null, rankedPlanIds };

  const db = await adminClient();
  const { data, error } = await db
    .from("sim_recommendations")
    .insert({
      user_id: userId,
      answers: answers as unknown as Record<string, unknown>,
      ranked: ranked.map((r) => ({ planId: r.plan.id, score: r.score })),
      top_plan_id: rankedPlanIds[0],
    })
    .select("id")
    .maybeSingle();
  if (error) return { recommendationId: null, rankedPlanIds };
  return { recommendationId: (data?.id as string) ?? null, rankedPlanIds };
}

/* ───────────────────────────── outbound handoff ───────────────────────────── */

export type Handoff = {
  clickId: string | null;
  url: string | null;
  affiliate: boolean;
  /** Present when there is nothing to open at all. */
  reason?: string;
};

/**
 * Record the click, then return where to send the member.
 *
 * An affiliate link is only returned when the provider is in `affiliate` mode and
 * a template is configured. Otherwise we fall back to the provider's own site and
 * say plainly that it is not an affiliate handoff — the UI must not imply a
 * purchase happened inside Shekk either way.
 */
export async function recordHandoff(input: {
  userId: string | null;
  planId: string;
  recommendationId?: string | null;
}): Promise<Handoff> {
  const plan = await getPlan(input.planId);
  if (!plan) return { clickId: null, url: null, affiliate: false, reason: "That plan is no longer available." };

  const db = await adminClient();
  const { data: providerRow } = await db
    .from("sim_providers")
    .select("*")
    .eq("id", plan.providerId)
    .maybeSingle();

  const mode = (providerRow?.mode ?? "disabled") as FulfilmentMode;
  const template = (providerRow?.affiliate_url_template as string | null) ?? null;
  const site = (providerRow?.site_url as string | null) ?? null;
  const affiliate = mode === "affiliate" && Boolean(template);

  if (!affiliate && !site) {
    return {
      clickId: null,
      url: null,
      affiliate: false,
      reason: `We have no link for ${plan.provider?.name ?? "this provider"} yet.`,
    };
  }

  const { data: click } = await db
    .from("sim_clicks")
    .insert({
      user_id: input.userId,
      provider_id: plan.providerId,
      plan_id: plan.id,
      recommendation_id: input.recommendationId ?? null,
      target_url: affiliate ? template! : site!,
      affiliate,
    })
    .select("id")
    .maybeSingle();

  const clickId = (click?.id as string) ?? null;
  const url = affiliate
    ? template!
        .replace("{sub}", clickId ?? "shekk")
        .replace("{plan}", plan.externalId ?? plan.id)
    : site!;

  return { clickId, url, affiliate };
}

/* ───────────────────────────── member reads ───────────────────────────── */

export async function myOrders(userId: string) {
  const db = await adminClient();
  const { data } = await db
    .from("sim_orders")
    .select("id, provider_id, plan_id, mode, status, amount_minor, currency, created_at, failure_reason")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function myEsims(userId: string) {
  const db = await adminClient();
  const { data } = await db
    .from("sim_esims")
    .select("id, provider_id, plan_id, status, iccid, lpa_string, qr_url, expires_at, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

/* ───────────────────────────── admin ───────────────────────────── */

export async function adminProviders() {
  const db = await adminClient();
  const { data } = await db.from("sim_providers").select("*").order("sort_order");
  return (data ?? []).map((r) => ({
    id: r.id as string,
    name: r.name as string,
    blurb: (r.blurb as string | null) ?? null,
    siteUrl: (r.site_url as string | null) ?? null,
    mode: (r.mode ?? "disabled") as FulfilmentMode,
    affiliateUrlTemplate: (r.affiliate_url_template as string | null) ?? null,
    affiliateNetwork: (r.affiliate_network as string | null) ?? null,
    affiliateTrackingId: (r.affiliate_tracking_id as string | null) ?? null,
    active: Boolean(r.active),
    sortOrder: (r.sort_order as number) ?? 0,
  }));
}

export type AdminProviderPatch = {
  id: string;
  mode?: FulfilmentMode;
  affiliateUrlTemplate?: string | null;
  affiliateNetwork?: string | null;
  affiliateTrackingId?: string | null;
  active?: boolean;
};

export async function adminSaveProvider(patch: AdminProviderPatch) {
  const db = await adminClient();
  const row: Record<string, unknown> = {};
  if (patch.mode !== undefined) row["mode"] = patch.mode;
  if (patch.affiliateUrlTemplate !== undefined) row["affiliate_url_template"] = patch.affiliateUrlTemplate || null;
  if (patch.affiliateNetwork !== undefined) row["affiliate_network"] = patch.affiliateNetwork || null;
  if (patch.affiliateTrackingId !== undefined) row["affiliate_tracking_id"] = patch.affiliateTrackingId || null;
  if (patch.active !== undefined) row["active"] = patch.active;
  if (Object.keys(row).length === 0) return { ok: true };
  const { error } = await db.from("sim_providers").update(row).eq("id", patch.id);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function adminPlans() {
  const db = await adminClient();
  const [{ data: planRows }, { data: providerRows }] = await Promise.all([
    db.from("sim_plans").select("*").order("created_at", { ascending: true }),
    db.from("sim_providers").select("*"),
  ]);
  const providers = new Map((providerRows ?? []).map((p) => [p.id as string, mapProvider(p)]));
  return (planRows ?? []).map((r) => ({
    ...mapPlan(r, providers),
    active: Boolean(r.active),
    inStock: Boolean(r.in_stock),
  }));
}

export type AdminPlanPatch = {
  id?: string;
  providerId?: string;
  name?: string;
  headline?: string | null;
  planType?: PlanType;
  dataMb?: number | null;
  unlimited?: boolean;
  validityDays?: number | null;
  phoneNumberIncluded?: boolean;
  callsIncluded?: boolean;
  textsIncluded?: boolean;
  rechargeable?: boolean;
  displayPriceMinor?: number;
  displayPriceLabel?: string | null;
  displayPeriodLabel?: string | null;
  currency?: string;
  active?: boolean;
  inStock?: boolean;
  featured?: boolean;
  rankBoost?: number;
  points?: string[];
};

const PLAN_COLUMNS: Record<keyof AdminPlanPatch, string> = {
  id: "id",
  providerId: "provider_id",
  name: "name",
  headline: "headline",
  planType: "plan_type",
  dataMb: "data_mb",
  unlimited: "unlimited",
  validityDays: "validity_days",
  phoneNumberIncluded: "phone_number_included",
  callsIncluded: "calls_included",
  textsIncluded: "texts_included",
  rechargeable: "rechargeable",
  displayPriceMinor: "display_price_minor",
  displayPriceLabel: "display_price_label",
  displayPeriodLabel: "display_period_label",
  currency: "currency",
  active: "active",
  inStock: "in_stock",
  featured: "featured",
  rankBoost: "rank_boost",
  points: "points",
};

export async function adminSavePlan(patch: AdminPlanPatch) {
  const db = await adminClient();
  const row: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(patch)) {
    if (k === "id" || v === undefined) continue;
    row[PLAN_COLUMNS[k as keyof AdminPlanPatch]] = v;
  }

  if (patch.id) {
    const { error } = await db.from("sim_plans").update(row).eq("id", patch.id);
    if (error) throw new Error(error.message);
    return { ok: true, id: patch.id };
  }

  // Anything created by hand in the console is manually curated by definition.
  row["source"] = "manual";
  const { data, error } = await db.from("sim_plans").insert(row).select("id").maybeSingle();
  if (error) throw new Error(error.message);
  return { ok: true, id: (data?.id as string) ?? null };
}

export async function adminClicks(limit = 50) {
  const db = await adminClient();
  const { data } = await db
    .from("sim_clicks")
    .select("id, provider_id, plan_id, target_url, affiliate, user_id, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function adminOrders(limit = 50) {
  const db = await adminClient();
  const { data } = await db
    .from("sim_orders")
    .select("id, user_id, provider_id, plan_id, mode, status, amount_minor, currency, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

/**
 * Catalogue sync. Safe to press at any time: with no credentials it reports what
 * is missing and writes nothing. When an adapter goes live this becomes the
 * upsert path, keyed on (provider_id, external_id).
 */
export async function adminSyncProvider(providerId: string) {
  const { withCapability } = await import("./sim-providers/index.server");
  const outcome = await withCapability(providerId, "listPlans", (a) => a.listPlans!());
  if (!outcome.ok) {
    return { ok: false as const, synced: 0, reason: outcome.reason, detail: outcome.detail };
  }
  const db = await adminClient();
  const rows = outcome.data.map((p) => ({
    provider_id: providerId,
    external_id: p.externalId,
    name: p.name,
    headline: p.headline,
    country_code: p.countryCode,
    data_mb: p.dataMb,
    unlimited: p.unlimited,
    validity_days: p.validityDays,
    calls_included: p.callsIncluded,
    texts_included: p.textsIncluded,
    phone_number_included: p.phoneNumberIncluded,
    rechargeable: p.rechargeable,
    operator: p.operator,
    networks: p.networks,
    net_cost_minor: p.netCostMinor,
    currency: p.currency,
    source: "api",
    raw: p.raw as Record<string, unknown>,
    synced_at: new Date().toISOString(),
  }));
  if (rows.length > 0) {
    const { error } = await db.from("sim_plans").upsert(rows, { onConflict: "provider_id,external_id" });
    if (error) throw new Error(error.message);
  }
  return { ok: true as const, synced: rows.length };
}

export async function adminAdapterStatus() {
  const { adapterStatus } = await import("./sim-providers/index.server");
  return adapterStatus();
}
