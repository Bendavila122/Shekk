import { loadStripe, type Stripe } from "@stripe/stripe-js";

type StripeEnv = "sandbox" | "live";

const clientToken = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN as string | undefined;

function paymentsEnvironment(): StripeEnv {
  if (clientToken?.startsWith("pk_test_")) return "sandbox";
  if (clientToken?.startsWith("pk_live_")) return "live";
  throw new Error(
    "Membership payments are not configured for this build. Complete payment go-live to enable checkout.",
  );
}

let stripePromise: Promise<Stripe | null> | null = null;

export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    paymentsEnvironment();
    stripePromise = loadStripe(clientToken as string);
  }
  return stripePromise;
}

export function getStripeEnvironment(): StripeEnv {
  return paymentsEnvironment();
}

/** Price ids for the Shekk+ membership. */
export const SHEKK_PLUS_PRICE_ID = "shekk_plus_monthly";
export const SHEKK_PLUS_YEARLY_PRICE_ID = "shekk_plus_yearly";

export type BillingCycle = "monthly" | "yearly";

export const MEMBERSHIP_PLANS: Record<
  BillingCycle,
  { priceId: string; price: string; cadence: string; note: string }
> = {
  monthly: {
    priceId: SHEKK_PLUS_PRICE_ID,
    price: "£9.99",
    cadence: "per month",
    note: "Billed monthly. Cancel any time.",
  },
  yearly: {
    priceId: SHEKK_PLUS_YEARLY_PRICE_ID,
    price: "£99",
    cadence: "per year",
    note: "Billed yearly — two months on us.",
  },
};
