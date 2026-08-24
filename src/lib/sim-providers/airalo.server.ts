/**
 * Airalo adapter — stub.
 *
 * Airalo's partner API can list packages, order eSIMs and report usage, so the
 * capability list reflects what we would wire up. Until AIRALO_CLIENT_ID and
 * AIRALO_CLIENT_SECRET exist in this environment, `configured()` is false and
 * every method returns `not_configured` without touching the network.
 */

import { makeAdapter, unavailable, type SimProviderAdapter } from "./types";

function credentials(): { id: string; secret: string } | null {
  const id = process.env["AIRALO_CLIENT_ID"];
  const secret = process.env["AIRALO_CLIENT_SECRET"];
  if (!id || !secret) return null;
  return { id, secret };
}

const NOT_CONFIGURED = "Airalo API credentials are not set for this environment.";

export const airaloAdapter: SimProviderAdapter = makeAdapter({
  id: "airalo",
  name: "Airalo",
  configured: () => credentials() !== null,
  capabilities: ["listPlans", "createFulfilment", "getInstallation", "getUsage", "topUp"],

  listPlans: async () => unavailable("not_configured", NOT_CONFIGURED),
  createFulfilment: async () => unavailable("not_configured", NOT_CONFIGURED),
  getInstallation: async () => unavailable("not_configured", NOT_CONFIGURED),
  getUsage: async () => unavailable("not_configured", NOT_CONFIGURED),
  topUp: async () => unavailable("not_configured", NOT_CONFIGURED),
});
