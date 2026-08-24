/**
 * Adapter registry. Providers with no adapter (a local carrier bought in a shop,
 * for example) simply have none — callers get an explicit `not_supported`.
 */

import { airaloAdapter } from "./airalo.server";
import { sailyAdapter } from "./saily.server";
import type { AdapterOutcome, ProviderCapability, SimProviderAdapter } from "./types";
import { unavailable } from "./types";

const ADAPTERS: Record<string, SimProviderAdapter> = {
  airalo: airaloAdapter,
  saily: sailyAdapter,
};

export function adapterFor(providerId: string): SimProviderAdapter | null {
  return ADAPTERS[providerId] ?? null;
}

export function adapterStatus() {
  return Object.values(ADAPTERS).map((a) => ({
    id: a.id,
    name: a.name,
    configured: a.configured(),
    capabilities: a.capabilities,
  }));
}

/**
 * Run a capability safely: never throws for a missing adapter, a missing
 * capability or missing credentials.
 */
export async function withCapability<T>(
  providerId: string,
  capability: ProviderCapability,
  run: (a: SimProviderAdapter) => Promise<AdapterOutcome<T>>,
): Promise<AdapterOutcome<T>> {
  const adapter = adapterFor(providerId);
  if (!adapter) return unavailable("not_supported", `No Shekk adapter exists for "${providerId}".`);
  if (!adapter.supports(capability)) {
    return unavailable("not_supported", `${adapter.name} does not support ${capability} through Shekk.`);
  }
  if (!adapter.configured()) {
    return unavailable("not_configured", `${adapter.name} has no credentials configured in this environment.`);
  }
  try {
    return await run(adapter);
  } catch (e) {
    return unavailable("not_supported", (e as Error).message);
  }
}
