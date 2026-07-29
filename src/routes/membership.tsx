import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Sparkles, Crown, Loader2 } from "lucide-react";
import { AppShell, Card, ScreenHeader, PrimaryButton, Notice } from "@/components/AppShell";
import { MembershipCheckout } from "@/components/MembershipCheckout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { useApp } from "@/lib/store";
import { TIERS, COMPARISON } from "@/lib/membership";
import { useSubscription } from "@/lib/useSubscription";
import { MEMBERSHIP_PLANS, getStripeEnvironment, type BillingCycle } from "@/lib/stripe";
import { createMembershipPortal } from "@/lib/payments.functions";

export const Route = createFileRoute("/membership")({
  head: () => ({
    meta: [
      { title: "Shekk+ Membership · Shekk" },
      {
        name: "description",
        content:
          "Compare Shekk and Shekk+ at £9.99 a month: the Shekk Mastercard, the full benefits marketplace, lower conversion margins, member events and concierge support.",
      },
      { property: "og:title", content: "Shekk+ Membership · Shekk" },
      { property: "og:description", content: "The card, the benefits and someone to call — £9.99 a month." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MembershipScreen,
});

function MembershipScreen() {
  const { state, setMembership } = useApp();
  const { subscription, isPlus, loading, refresh } = useSubscription();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [portalBusy, setPortalBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const plan = MEMBERSHIP_PLANS[cycle];

  // Membership state follows the billing record, not a local toggle.
  useEffect(() => {
    if (loading) return;
    const target = isPlus ? "premium" : "free";
    if (state.membership !== target) setMembership(target);
  }, [isPlus, loading, state.membership, setMembership]);

  // Coming back from checkout — re-read the membership record.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (new URLSearchParams(window.location.search).has("session_id")) {
      setCheckoutOpen(false);
      const timer = window.setInterval(() => void refresh(), 2000);
      const stop = window.setTimeout(() => window.clearInterval(timer), 20000);
      return () => {
        window.clearInterval(timer);
        window.clearTimeout(stop);
      };
    }
  }, [refresh]);

  const manage = async () => {
    setPortalBusy(true);
    setError(null);
    try {
      const result = await createMembershipPortal({
        data: { returnUrl: window.location.href, environment: getStripeEnvironment() },
      });
      if ("error" in result) throw new Error(result.error);
      window.open(result.url, "_blank");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not open billing");
    } finally {
      setPortalBusy(false);
    }
  };

  const renews = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString(undefined, {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <AppShell>
      <ScreenHeader title="Membership" subtitle="Choose how much Shekk does for you" back="/me" />

      <section className="px-4 pt-5">
        <div className="grad-premium relative overflow-hidden rounded-[1.75rem] p-5 text-ink-foreground shadow-lift">
          <span className="card-sheen pointer-events-none absolute inset-0" aria-hidden />
          <div className="relative">
            <Crown className="size-6" />
            <p className="mt-3 font-display text-2xl font-bold leading-tight">
              {isPlus ? "You're on Shekk+" : "Shekk+"}
            </p>
            <p className="mt-1 text-sm opacity-85">
              {isPlus
                ? subscription?.cancelAtPeriodEnd && renews
                  ? `Ends ${renews}. You keep everything until then.`
                  : renews
                    ? `Renews ${renews}.`
                    : "Card, full marketplace, member pricing and concierge — all active."
                : `${plan.price} ${plan.cadence}. Cancel any time, keep your account either way.`}
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 pt-4">
        <PaymentTestModeBanner />
      </section>

      {error ? (
        <section className="px-4 pt-4">
          <Notice title="Membership">{error}</Notice>
        </section>
      ) : null}

      {checkoutOpen ? (
        <section className="px-4 pt-4">
          <Card className="p-3">
            <MembershipCheckout
              key={plan.priceId}
              priceId={plan.priceId}
              returnUrl={`${typeof window !== "undefined" ? window.location.origin : ""}/membership?session_id={CHECKOUT_SESSION_ID}`}
            />
            <button
              type="button"
              onClick={() => setCheckoutOpen(false)}
              className="tap-flat mt-3 w-full rounded-2xl bg-muted py-3 text-sm font-semibold"
            >
              Cancel
            </button>
          </Card>
        </section>
      ) : null}

      <section className="space-y-4 px-4 pt-5">
        {TIERS.map((t) => {
          const current = t.id === "premium" ? isPlus : !isPlus;
          return (
            <Card key={t.id} className={`p-5 ${current ? "border-primary" : ""}`}>
              <div className="flex items-baseline justify-between gap-3">
                <div>
                  <p className="font-display text-xl font-bold tracking-tight">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.tagline}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-display text-lg font-bold">{t.price}</p>
                  <p className="text-[11px] text-muted-foreground">{t.cadence}</p>
                </div>
              </div>

              <ul className="mt-4 space-y-2.5">
                {t.perks.map((p) => (
                  <li key={p.title} className="flex items-start gap-2.5">
                    <span className="text-base leading-none">{p.icon}</span>
                    <span>
                      <span className="block text-sm font-semibold leading-tight">{p.title}</span>
                      <span className="block text-xs text-muted-foreground">{p.detail}</span>
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-5">
                {current ? (
                  <>
                    <p className="flex items-center justify-center gap-1.5 rounded-2xl bg-success-soft py-3 text-sm font-semibold text-success">
                      <Check className="size-4" /> Your current plan
                    </p>
                    {t.id === "premium" ? (
                      <button
                        type="button"
                        onClick={manage}
                        disabled={portalBusy}
                        className="tap-flat mt-2 w-full rounded-2xl bg-muted py-3 text-sm font-semibold disabled:opacity-60"
                      >
                        {portalBusy ? "Opening…" : "Manage or cancel membership"}
                      </button>
                    ) : null}
                  </>
                ) : t.id === "premium" ? (
                  <PrimaryButton onClick={() => setCheckoutOpen(true)} disabled={loading}>
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="size-4 animate-spin" /> Checking
                      </span>
                    ) : (
                      "Join Shekk+ · £9.99 a month"
                    )}
                  </PrimaryButton>
                ) : (
                  <button
                    type="button"
                    onClick={manage}
                    disabled={portalBusy}
                    className="tap-flat w-full rounded-2xl bg-muted py-3 text-sm font-semibold disabled:opacity-60"
                  >
                    {portalBusy ? "Opening…" : "Cancel Shekk+ to switch back"}
                  </button>
                )}
              </div>
            </Card>
          );
        })}
      </section>

      <section className="px-4 pt-6">
        <h2 className="mb-2 px-1 font-display text-lg font-bold tracking-tight">Side by side</h2>
        <Card className="p-0">
          <div className="grid grid-cols-[1.4fr_0.8fr_0.8fr] border-b border-border px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <span />
            <span className="text-center">Shekk</span>
            <span className="text-center">Shekk+</span>
          </div>
          {COMPARISON.map((row) => (
            <div
              key={row.label}
              className="grid grid-cols-[1.4fr_0.8fr_0.8fr] items-center border-b border-border px-4 py-3 text-xs last:border-0"
            >
              <span className="font-medium">{row.label}</span>
              <span className="text-center text-muted-foreground">{row.free}</span>
              <span className="text-center font-semibold text-primary">{row.premium}</span>
            </div>
          ))}
        </Card>
      </section>

      <section className="px-4 pb-10 pt-5">
        <Link to="/benefits" className="tap block">
          <Card className="flex items-center gap-3 p-4">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <Sparkles className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">See what's in the marketplace</span>
              <span className="block text-xs text-muted-foreground">
                Every partner offer, in one place.
              </span>
            </span>
          </Card>
        </Link>
        <p className="mt-3 px-1 text-[11px] text-muted-foreground">
          Shekk+ is billed at £9.99 a month and renews until you cancel. Membership is separate from
          your shekel account, which is provided by our regulated payment partner.
        </p>
      </section>
    </AppShell>
  );
}
