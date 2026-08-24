/**
 * The SIM provider seam.
 *
 * Every partner is reached through this interface, and every method is optional.
 * Callers must ask `supports()` first, so an unconfigured or partially capable
 * provider degrades to an explicit "not available with this provider" instead of
 * throwing somewhere deep in a route.
 *
 * No adapter in this release makes a live call. Credentials, when they exist,
 * live in Lovable Cloud secrets and are read inside handlers only — never stored
 * in the database and never shipped to the browser.
 */

export type ProviderCapability =
  | "listPlans"
  | "createFulfilment"
  | "getInstallation"
  | "getUsage"
  | "topUp"
  | "checkCompatibility";

export type NormalisedPlan = {
  externalId: string;
  name: string;
  headline: string | null;
  countryCode: string;
  dataMb: number | null;
  unlimited: boolean;
  validityDays: number | null;
  callsIncluded: boolean;
  textsIncluded: boolean;
  phoneNumberIncluded: boolean;
  rechargeable: boolean;
  operator: string | null;
  networks: string[];
  netCostMinor: number | null;
  currency: string;
  raw: unknown;
};

export type FulfilmentRequest = {
  orderId: string;
  externalPlanId: string;
  /** Passed through to the provider so retries never double-charge. */
  idempotencyKey: string;
};

export type FulfilmentResult = {
  providerOrderRef: string;
  iccid: string | null;
  activationCode: string | null;
  lpaString: string | null;
  qrUrl: string | null;
  smdpAddress: string | null;
  matchingId: string | null;
  expiresAt: string | null;
  raw: unknown;
};

export type UsageSnapshot = {
  totalMb: number | null;
  remainingMb: number | null;
  expiresAt: string | null;
};

/** Why an operation could not run. Surfaced verbatim to operators, not users. */
export type UnavailableReason = "not_configured" | "not_supported" | "disabled";

export type AdapterOutcome<T> = { ok: true; data: T } | { ok: false; reason: UnavailableReason; detail: string };

export function unavailable<T>(reason: UnavailableReason, detail: string): AdapterOutcome<T> {
  return { ok: false, reason, detail };
}

export type SimProviderAdapter = {
  id: string;
  name: string;
  /** True only when the required secrets are present in this environment. */
  configured: () => boolean;
  capabilities: ProviderCapability[];
  supports: (c: ProviderCapability) => boolean;

  listPlans?: () => Promise<AdapterOutcome<NormalisedPlan[]>>;
  createFulfilment?: (req: FulfilmentRequest) => Promise<AdapterOutcome<FulfilmentResult>>;
  getInstallation?: (providerOrderRef: string) => Promise<AdapterOutcome<FulfilmentResult>>;
  getUsage?: (iccid: string) => Promise<AdapterOutcome<UsageSnapshot>>;
  topUp?: (iccid: string, externalPlanId: string) => Promise<AdapterOutcome<FulfilmentResult>>;
  checkCompatibility?: (deviceModel: string) => Promise<AdapterOutcome<boolean>>;
};

/** Shared shell so each adapter only declares what it can genuinely do. */
export function makeAdapter(
  base: Omit<SimProviderAdapter, "supports">,
): SimProviderAdapter {
  return { ...base, supports: (c) => base.capabilities.includes(c) };
}
