/**
 * Top-up pricing, computed on the server.
 *
 * The client shows a quote for transparency, but the shekels actually credited
 * are always recalculated here from the currency and the amount paid, so a
 * tampered request cannot buy shekels it did not pay for.
 *
 * When Airwallex is connected, `interbank` comes from their live FX quote
 * instead of the static reference table, and Shekk's margin stays on top.
 */

import { currency, type CurrencyCode } from "./currencies";
import { FX_MARGIN } from "./banking";

export type ServerQuote = {
  from: CurrencyCode;
  amount: number;
  interbank: number;
  rate: number;
  shekels: number;
  fee: number;
};

export function priceTopUp(from: CurrencyCode, amount: number): ServerQuote {
  const interbank = currency(from).ilsPerUnit;
  const rate = +(interbank * (1 - FX_MARGIN)).toFixed(4);
  const shekels = +(amount * rate).toFixed(2);
  const gross = amount * interbank;
  return {
    from,
    amount,
    interbank,
    rate,
    shekels,
    fee: +((gross - shekels) / interbank).toFixed(2),
  };
}
