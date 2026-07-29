/**
 * Ledger server functions.
 *
 * Thin wrappers only — every helper lives in `ledger.server.ts`. Each function
 * is authenticated, and the member is taken from the verified token, never
 * from anything the client sends. The client can ask to spend; it can never
 * state a balance.
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const shekels = z.number().finite().positive().max(200_000);
const label = z.string().trim().min(1).max(120);

export const getLedger = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { readSnapshot } = await import("./ledger.server");
    return readSnapshot(context.userId);
  });

export const spendMoney = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        amount: shekels,
        merchant: label,
        category: label.default("Other"),
        icon: z.string().max(8).default("💳"),
        externalRef: z.string().max(120).nullish(),
        idempotencyKey: z.string().max(120).nullish(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { post } = await import("./ledger.server");
    return post(context.userId, {
      direction: "debit",
      shekels: data.amount,
      merchant: data.merchant,
      category: data.category,
      icon: data.icon,
      externalRef: data.externalRef,
      idempotencyKey: data.idempotencyKey,
    });
  });

export const receiveMoney = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        amount: shekels,
        merchant: label,
        category: label.default("Friends"),
        icon: z.string().max(8).default("👥"),
        counterparty: z.string().max(120).nullish(),
        idempotencyKey: z.string().max(120).nullish(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { post } = await import("./ledger.server");
    return post(context.userId, {
      direction: "credit",
      shekels: data.amount,
      merchant: data.merchant,
      category: data.category,
      icon: data.icon,
      counterparty: data.counterparty,
      idempotencyKey: data.idempotencyKey,
    });
  });

export const holdMoney = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        amount: shekels,
        merchant: label,
        category: label.default("Other"),
        icon: z.string().max(8).default("💳"),
        externalRef: z.string().max(120).nullish(),
        idempotencyKey: z.string().max(120).nullish(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { createHold } = await import("./ledger.server");
    return createHold(context.userId, {
      shekels: data.amount,
      merchant: data.merchant,
      category: data.category,
      icon: data.icon,
      externalRef: data.externalRef,
      idempotencyKey: data.idempotencyKey,
    });
  });

export const settleHoldFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z.object({ holdId: z.string().uuid(), finalAmount: shekels.optional() }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { settleHold } = await import("./ledger.server");
    return settleHold(context.userId, data.holdId, data.finalAmount);
  });

export const releaseHoldFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ holdId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { releaseHold } = await import("./ledger.server");
    return releaseHold(context.userId, data.holdId);
  });

/**
 * Complete a top up.
 *
 * The shekel amount is recomputed server-side from the currency and the amount
 * paid — the client's arithmetic is never trusted. When Airwallex is live this
 * runs from the verified payment webhook instead of a client call.
 */
export const completeTopUp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        payCurrency: z.enum(["USD", "GBP", "EUR", "CAD", "AUD", "ZAR"]),
        payAmount: z.number().finite().positive().max(50_000),
        method: z.enum(["apple-pay", "google-pay", "bank-transfer", "card"]).default("apple-pay"),
        idempotencyKey: z.string().max(120).nullish(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { settleFunding } = await import("./ledger.server");
    const { priceTopUp } = await import("./ledger-pricing.server");
    const quote = priceTopUp(data.payCurrency, data.payAmount);
    return settleFunding(context.userId, {
      payCurrency: data.payCurrency,
      payAmount: data.payAmount,
      interbankRate: quote.interbank,
      quotedRate: quote.rate,
      fee: quote.fee,
      shekels: quote.shekels,
      method: data.method,
      idempotencyKey: data.idempotencyKey,
    });
  });
