import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Sparkles, Crown } from "lucide-react";
import { AppShell, Card, ScreenHeader, PrimaryButton } from "@/components/AppShell";
import { useApp } from "@/lib/store";
import { TIERS, COMPARISON } from "@/lib/membership";

export const Route = createFileRoute("/membership")({
  head: () => ({
    meta: [
      { title: "Shekk Membership · Shekk" },
      {
        name: "description",
        content:
          "Compare Shekk Free and Shekk Premium: the Shekk Mastercard, the full benefits marketplace, lower conversion margins, member events and concierge support.",
      },
      { property: "og:title", content: "Shekk Membership · Shekk" },
      { property: "og:description", content: "The card, the benefits and someone to call." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MembershipScreen,
});

function MembershipScreen() {
  const { state, setMembership, isPremium } = useApp();

  return (
    <AppShell>
      <ScreenHeader title="Membership" subtitle="Choose how much Shekk does for you" back="/me" />

      <section className="px-4 pt-5">
        <div className="grad-premium relative overflow-hidden rounded-[1.75rem] p-5 text-ink-foreground shadow-lift">
          <span className="card-sheen pointer-events-none absolute inset-0" aria-hidden />
          <div className="relative">
            <Crown className="size-6" />
            <p className="mt-3 font-display text-2xl font-bold leading-tight">
              {isPremium ? "You're a Premium member" : "Shekk Premium"}
            </p>
            <p className="mt-1 text-sm opacity-85">
              {isPremium
                ? "Card, full marketplace, member pricing and concierge — all active."
                : "£14.99 a month. Cancel any time, keep your account either way."}
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4 px-4 pt-5">
        {TIERS.map((t) => {
          const current = state.membership === t.id;
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
                  <p className="flex items-center justify-center gap-1.5 rounded-2xl bg-success-soft py-3 text-sm font-semibold text-success">
                    <Check className="size-4" /> Your current plan
                  </p>
                ) : (
                  <PrimaryButton onClick={() => setMembership(t.id)}>
                    {t.id === "premium" ? "Upgrade to Premium" : "Switch to Free"}
                  </PrimaryButton>
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
            <span className="text-center">Free</span>
            <span className="text-center">Premium</span>
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
                Every partner offer, from Wolt to weekend tiyulim.
              </span>
            </span>
          </Card>
        </Link>
        <p className="mt-3 px-1 text-[11px] text-muted-foreground">
          Membership billing is simulated in this prototype — nothing is charged.
        </p>
      </section>
    </AppShell>
  );
}
