/**
 * Launch feature flags.
 *
 * Shekk Money (ledger, top-up, card, exchange, Airwallex, Stripe) is built and
 * preserved, but it is paused for launch: no navigation entry points, no Home
 * prompts, no service tiles. Everything stays reachable by direct URL so the
 * work can be switched back on by flipping one value — set
 * `VITE_MONEY_ENABLED=true` (or edit the fallback below) and the entry points
 * and balance-funded checkout come back without another IA rewrite.
 */

function envFlag(name: string): boolean | null {
  const raw = (import.meta.env as Record<string, string | undefined>)[name];
  if (raw === undefined) return null;
  return raw === "true" || raw === "1";
}

/** Is the regulated money product live for members? */
export const MONEY_ENABLED = envFlag("VITE_MONEY_ENABLED") ?? false;

/** Can a member pay for something from their Shekk balance right now? */
export function balancePaymentsAvailable(): boolean {
  return MONEY_ENABLED;
}
