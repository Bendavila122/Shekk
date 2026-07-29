/**
 * Airwallex server functions.
 *
 * Thin wrappers only — every helper lives in `airwallex.server.ts` and is
 * imported inside the handler, so nothing server-only can leak into a client
 * bundle. None of these move money in the ledger; funding is credited by the
 * verified webhook alone.
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Is the payment partner connected? Safe for anyone to ask. */
export const airwallexStatus = createServerFn({ method: "GET" }).handler(async () => {
  const { isConfigured } = await import("./airwallex.server");
  return {
    connected: isConfigured(),
    environment: process.env.AIRWALLEX_ENV === "production" ? "production" : "sandbox",
  };
});

/** Start a top up. Returns the client secret the payment sheet needs. */
export const startTopUp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        currency: z.enum(["USD", "GBP", "EUR", "CAD", "AUD", "ZAR"]),
        amount: z.number().finite().positive().max(50_000),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { isConfigured, createPaymentIntent } = await import("./airwallex.server");
    if (!isConfigured()) return { connected: false as const };

    const intent = await createPaymentIntent({
      userId: context.userId,
      amount: data.amount,
      currency: data.currency,
      requestId: crypto.randomUUID(),
    });
    return { connected: true as const, ...intent };
  });

/** Live FX rate into shekels, before Shekk's margin. */
export const liveFxRate = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z.object({ from: z.enum(["USD", "GBP", "EUR", "CAD", "AUD", "ZAR"]) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { isConfigured, fxRate } = await import("./airwallex.server");
    if (!isConfigured()) return null;
    try {
      return await fxRate(data.from);
    } catch {
      // A stale reference rate is better than a broken top-up screen.
      return null;
    }
  });

/** Shekk's own float at Airwallex. Company money — admins only. */
export const platformBalances = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");

    const { isConfigured, listBalances } = await import("./airwallex.server");
    if (!isConfigured()) return { connected: false as const, balances: [] };
    return { connected: true as const, balances: await listBalances() };
  });

/** Issue a Shekk card to the signed-in member. */
export const issueCard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        form: z.enum(["VIRTUAL", "PHYSICAL"]),
        firstName: z.string().min(1).max(60),
        lastName: z.string().min(1).max(60),
        email: z.string().email(),
        countryCode: z.string().length(2).default("IL"),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { isConfigured, createCardholder, createCard } = await import("./airwallex.server");
    if (!isConfigured()) return { connected: false as const };

    const { cardholderId } = await createCardholder({
      requestId: crypto.randomUUID(),
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      countryCode: data.countryCode,
    });
    const card = await createCard({
      requestId: crypto.randomUUID(),
      cardholderId,
      form: data.form,
      nameOnCard: `${data.firstName} ${data.lastName}`.slice(0, 26),
    });
    return { connected: true as const, card };
  });
