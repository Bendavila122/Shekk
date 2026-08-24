/**
 * Saily adapter — stub.
 *
 * Saily has no public partner ordering API we can rely on today, so this adapter
 * declares only the capabilities we could plausibly implement, and reports
 * `not_supported` for anything else. With no SAILY_API_KEY it is unconfigured and
 * makes no network calls.
 */

import { makeAdapter, unavailable, type SimProviderAdapter } from "./types";

function apiKey(): string | null {
  const key = process.env["SAILY_API_KEY"];
  return key && key.length > 0 ? key : null;
}

const NOT_CONFIGURED = "Saily API credentials are not set for this environment.";

export const sailyAdapter: SimProviderAdapter = makeAdapter({
  id: "saily",
  name: "Saily",
  configured: () => apiKey() !== null,
  capabilities: ["listPlans"],

  listPlans: async () => unavailable("not_configured", NOT_CONFIGURED),
});
