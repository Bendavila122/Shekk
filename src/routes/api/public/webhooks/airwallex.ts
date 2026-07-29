/**
 * Airwallex webhook — the only path that credits a member's balance.
 *
 * The app never says "my payment worked, add my shekels". Airwallex says the
 * money settled, we verify their signature over the raw body, and only then
 * does `funding_settle` run. The event id is the idempotency key, so a retried
 * delivery credits nothing twice.
 */

import { createFileRoute } from "@tanstack/react-router";

type AirwallexEvent = {
  id?: string;
  name?: string;
  data?: {
    object?: {
      id?: string;
      amount?: number;
      currency?: string;
      metadata?: Record<string, string>;
    };
  };
};

const FUNDABLE = ["USD", "GBP", "EUR", "CAD", "AUD", "ZAR"] as const;
type Fundable = (typeof FUNDABLE)[number];

export const Route = createFileRoute("/api/public/webhooks/airwallex")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const raw = await request.text();

        const { verifyWebhook } = await import("@/lib/airwallex.server");
        const ok = await verifyWebhook(
          raw,
          request.headers.get("x-timestamp"),
          request.headers.get("x-signature"),
        );
        if (!ok) return new Response("Invalid signature", { status: 401 });

        let event: AirwallexEvent;
        try {
          event = JSON.parse(raw) as AirwallexEvent;
        } catch {
          return new Response("Bad payload", { status: 400 });
        }

        // Only a settled payment moves money. Everything else is acknowledged
        // so Airwallex stops retrying, but changes nothing.
        if (event.name !== "payment_intent.succeeded") {
          return new Response("ok");
        }

        const object = event.data?.object;
        const userId = object?.metadata?.shekk_user_id;
        const currency = object?.currency?.toUpperCase();
        const amount = object?.amount;

        if (!userId || !amount || !currency || !FUNDABLE.includes(currency as Fundable)) {
          console.error("[airwallex] unusable payment_intent.succeeded", {
            intent: object?.id,
            currency,
          });
          return new Response("ok");
        }

        const { settleFunding } = await import("@/lib/ledger.server");
        const { priceTopUp } = await import("@/lib/ledger-pricing.server");

        // Shekels are recomputed here from what was actually paid; no amount
        // that ever touched a browser is trusted.
        const quote = priceTopUp(currency as Fundable, amount);

        try {
          await settleFunding(userId, {
            payCurrency: quote.from,
            payAmount: quote.amount,
            interbankRate: quote.interbank,
            quotedRate: quote.rate,
            fee: quote.fee,
            shekels: quote.shekels,
            method: "card",
            idempotencyKey: event.id ?? object?.id ?? null,
          });
        } catch (error) {
          // Throwing asks Airwallex to retry, which is what we want if our own
          // database was briefly unavailable.
          console.error("[airwallex] funding settle failed", error);
          return new Response("Retry", { status: 500 });
        }

        return new Response("ok");
      },
    },
  },
});
