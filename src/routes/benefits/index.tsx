import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Lock, Sparkles, MapPin, Check } from "lucide-react";
import { useVisibleBenefits } from "@/lib/admin";
import { AppShell, Card, ScreenHeader } from "@/components/AppShell";
import { ServiceLogo } from "@/components/ServiceLogo";
import { useApp } from "@/lib/store";
import { BENEFIT_CATEGORIES, type Benefit, type BenefitCategoryId } from "@/lib/benefits";

export const Route = createFileRoute("/benefits/")({
  head: () => ({
    meta: [
      { title: "Benefits · Shekk" },
      {
        name: "description",
        content:
          "The Shekk benefits marketplace: partner offers on food, transport, gyms, weekend trips and Hebrew lessons across Israel.",
      },
      { property: "og:title", content: "Benefits · Shekk" },
      { property: "og:description", content: "Member offers from Israeli brands, redeemed inside Shekk." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BenefitsScreen,
});

function BenefitsScreen() {
  const { isPremium, state } = useApp();
  const [cat, setCat] = useState<BenefitCategoryId | "all">("all");
  const BENEFITS = useVisibleBenefits();

  const list = useMemo(() => (cat === "all" ? BENEFITS : BENEFITS.filter((b) => b.category === cat)), [cat, BENEFITS]);
  const featured = BENEFITS.filter((b) => b.premium).slice(0, 3);

  return (
    <AppShell>
      <ScreenHeader title="Benefits" subtitle="Partner offers, redeemed inside Shekk" back="/explore" />

      {!isPremium ? (
        <section className="px-4 pt-4">
          <Link to="/membership" className="tap block">
            <div className="grad-premium relative overflow-hidden rounded-2xl p-4 text-ink-foreground">
              <span className="card-sheen pointer-events-none absolute inset-0" aria-hidden />
              <p className="relative text-sm font-semibold">Unlock every offer with Shekk Premium</p>
              <p className="relative text-xs opacity-85">
                {BENEFITS.filter((b) => b.premium).length} members-only deals are locked on your plan.
              </p>
            </div>
          </Link>
        </section>
      ) : null}

      {/* Featured rail */}
      <section className="pt-5">
        <h2 className="mb-2 px-5 font-display text-lg font-bold tracking-tight">Featured this week</h2>
        <div className="scrollbar-none flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 scroll-px-5 pb-1">
          {featured.map((b) => (
            <Link
              key={b.id}
              to="/benefits/$id"
              params={{ id: b.id }}
              className="tap w-[260px] shrink-0 snap-start rounded-2xl border border-border bg-card p-4 shadow-card"
            >
              <div className="flex items-center gap-3">
                <ServiceLogo service={{ name: b.brand, emoji: b.emoji, domain: b.domain }} size={40} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{b.brand}</p>
                  <p className="text-[11px] text-muted-foreground">{b.location}</p>
                </div>
              </div>
              <p className="mt-3 line-clamp-2 text-sm font-semibold leading-snug">{b.headline}</p>
              <p className="mt-2 inline-block rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-bold text-primary">
                {b.discount}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Category filter */}
      <div className="scrollbar-none mt-5 flex gap-2 overflow-x-auto px-5 pb-1">
        {[{ id: "all" as const, label: "All", emoji: "✨" }, ...BENEFIT_CATEGORIES].map((c) => (
          <button
            key={c.id}
            onClick={() => setCat(c.id as BenefitCategoryId | "all")}
            className={`tap-flat shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold ${
              cat === c.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {c.emoji} {c.label}
          </button>
        ))}
      </div>

      <section className="space-y-3 px-4 pb-10 pt-4">
        {list.map((b) => (
          <BenefitRow key={b.id} benefit={b} locked={!!b.premium && !isPremium} redeemed={state.redeemed.includes(b.id)} />
        ))}
      </section>
    </AppShell>
  );
}

export function BenefitRow({
  benefit: b,
  locked,
  redeemed,
}: {
  benefit: Benefit;
  locked: boolean;
  redeemed: boolean;
}) {
  return (
    <Link to="/benefits/$id" params={{ id: b.id }} className="tap block">
      <Card className="flex items-start gap-3 p-4">
        <ServiceLogo service={{ name: b.brand, emoji: b.emoji, domain: b.domain }} size={44} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold">{b.brand}</p>
            {b.premium ? (
              <span className="flex shrink-0 items-center gap-0.5 rounded-full bg-notice-soft px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-notice-foreground">
                {locked ? <Lock className="size-2.5" /> : <Sparkles className="size-2.5" />} Premium
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 line-clamp-2 text-sm leading-snug">{b.headline}</p>
          <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
            <MapPin className="size-3" /> {b.location} · {b.expires}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${
            redeemed ? "bg-success-soft text-success" : "bg-primary-soft text-primary"
          }`}
        >
          {redeemed ? <Check className="size-3.5" /> : b.discount}
        </span>
      </Card>
    </Link>
  );
}
