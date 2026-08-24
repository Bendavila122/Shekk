/**
 * Shekk SIM/eSIM — shared, client-safe domain.
 *
 * Deliberately provider-agnostic. Nothing in the UI knows about Airalo, Saily or
 * any local carrier: a plan is a normalised row, and how it can be bought is
 * decided by its provider's `mode`:
 *
 *   disabled  — informational only. We link to the provider's own site and say so.
 *   affiliate — we record an outbound click and hand off to a configured link.
 *   voucher   — future: Shekk sells a code. Not enabled yet.
 *   api       — future: Shekk provisions the eSIM through the provider's API. Not enabled yet.
 *
 * Two honesty rules are encoded here rather than left to copy:
 *   1. A phone number is only ever claimed when `phoneNumberIncluded` is true.
 *   2. Manually curated plans (`source === "manual"`) carry indicative prices, so
 *      the UI must label them as such.
 */

export type FulfilmentMode = "disabled" | "affiliate" | "voucher" | "api";
export type PlanType = "data_only" | "data_voice" | "local_number";
export type PlanSource = "manual" | "api";

/** Modes where Shekk itself takes the money. Both are off in this release. */
export const SHEKK_PAID_MODES: FulfilmentMode[] = ["voucher", "api"];

export type SimProvider = {
  id: string;
  name: string;
  blurb: string | null;
  siteUrl: string | null;
  mode: FulfilmentMode;
  /** True only when the mode is `affiliate` AND a link template exists. */
  affiliateReady: boolean;
  sortOrder: number;
};

export type SimPlan = {
  id: string;
  providerId: string;
  provider: SimProvider | null;
  externalId: string | null;
  name: string;
  headline: string | null;
  countryCode: string;
  planType: PlanType;
  dataMb: number | null;
  unlimited: boolean;
  fairUseNote: string | null;
  validityDays: number | null;
  callsIncluded: boolean;
  textsIncluded: boolean;
  phoneNumberIncluded: boolean;
  rechargeable: boolean;
  activationPolicy: string | null;
  operator: string | null;
  networks: string[];
  displayPriceMinor: number;
  displayPriceLabel: string | null;
  displayPeriodLabel: string | null;
  currency: string;
  source: PlanSource;
  featured: boolean;
  rankBoost: number;
  points: string[];
};

/* ───────────────────────────── Wizard answers ───────────────────────────── */

export type UsageProfile = "light" | "normal" | "heavy";

export type SimAnswers = {
  /** Length of stay in days. */
  days: number | null;
  usage: UsageProfile | null;
  /** Does the member need an Israeli number for calls and texts? */
  needsCalls: boolean | null;
  /** Optional self-declared eSIM compatibility. */
  deviceEsimReady: boolean | null;
};

export const EMPTY_ANSWERS: SimAnswers = {
  days: null,
  usage: null,
  needsCalls: null,
  deviceEsimReady: null,
};

export function answersComplete(a: SimAnswers) {
  return a.days !== null && a.usage !== null && a.needsCalls !== null;
}

export const STAY_OPTIONS: { label: string; days: number }[] = [
  { label: "Under 2 weeks", days: 10 },
  { label: "2–4 weeks", days: 25 },
  { label: "1–3 months", days: 75 },
  { label: "3–12 months", days: 200 },
  { label: "Moving here", days: 400 },
];

export const USAGE_OPTIONS: { label: string; value: UsageProfile; hint: string; monthlyGb: number }[] = [
  { label: "Light", value: "light", hint: "Messaging and maps", monthlyGb: 3 },
  { label: "Normal", value: "normal", hint: "Social, music, some video", monthlyGb: 20 },
  { label: "Heavy", value: "heavy", hint: "Video calls and hotspotting", monthlyGb: 50 },
];

export function monthlyNeedGb(usage: UsageProfile): number {
  return USAGE_OPTIONS.find((o) => o.value === usage)?.monthlyGb ?? 20;
}

/* ───────────────────────────── Display helpers ───────────────────────────── */

const SYMBOLS: Record<string, string> = { GBP: "£", USD: "$", EUR: "€", ILS: "₪" };

export function money(minor: number, currency: string) {
  const symbol = SYMBOLS[currency] ?? `${currency} `;
  const major = minor / 100;
  return `${symbol}${major % 1 === 0 ? major.toFixed(0) : major.toFixed(2)}`;
}

/** What we show as the price. Manual rows keep their curated "≈ £18" label. */
export function priceLabel(plan: SimPlan) {
  return plan.displayPriceLabel ?? money(plan.displayPriceMinor, plan.currency);
}

export function periodLabel(plan: SimPlan) {
  if (plan.displayPeriodLabel) return plan.displayPeriodLabel;
  if (plan.validityDays) return `${plan.validityDays} days`;
  return "";
}

export function dataLabel(plan: SimPlan) {
  if (plan.unlimited) return "Unlimited data";
  if (plan.dataMb === null) return "Data allowance not published";
  if (plan.dataMb >= 1024) return `${Math.round(plan.dataMb / 1024)} GB data`;
  return `${plan.dataMb} MB data`;
}

/**
 * Capability lines. Never claims a number, calls or texts unless the plan row
 * says so — an unconfirmed capability is simply not mentioned.
 */
export function capabilityLines(plan: SimPlan): string[] {
  const out: string[] = [dataLabel(plan)];
  if (plan.phoneNumberIncluded) out.push("Israeli phone number included");
  else out.push("No Israeli phone number — data only");
  if (plan.callsIncluded) out.push("Calls included");
  if (plan.textsIncluded) out.push("Texts included");
  if (plan.rechargeable) out.push("Rechargeable without a new eSIM");
  if (plan.validityDays) out.push(`Valid for ${plan.validityDays} days`);
  return out;
}

/** How the CTA should behave for a plan, given its provider's configuration. */
export type PlanAction =
  | { kind: "affiliate"; label: string }
  | { kind: "info"; label: string; note: string }
  | { kind: "checkout_disabled"; label: string; note: string };

export function planAction(plan: SimPlan): PlanAction {
  const p = plan.provider;
  const name = p?.name ?? "the provider";
  if (p?.mode === "affiliate" && p.affiliateReady) {
    return { kind: "affiliate", label: `Continue with ${name}` };
  }
  if (p && SHEKK_PAID_MODES.includes(p.mode)) {
    return {
      kind: "checkout_disabled",
      label: `Buying in Shekk is not switched on yet`,
      note: `Paying for this inside Shekk is built but not enabled. For now, buy it directly from ${name}.`,
    };
  }
  return {
    kind: "info",
    label: `Open ${name}`,
    note: `Not purchasable in Shekk yet — we haven't signed a partner deal with ${name}. This link goes to their own site.`,
  };
}

export function isIndicative(plan: SimPlan) {
  return plan.source === "manual";
}

/** One sentence, used everywhere a hand-curated price is shown. */
export const INDICATIVE_PRICE_NOTE =
  "Placeholder price — Shekk has not verified this with the provider. We'll show verified prices once a partner feed is live.";

/**
 * Only plans whose provider resolved (i.e. is active and readable) are ever
 * public. Keeps a disabled provider's catalogue from lingering with no provider.
 */
export function withActiveProvider(plans: SimPlan[]): SimPlan[] {
  return plans.filter((p) => p.provider !== null);
}
