import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Check, Lock, Ticket, ShieldCheck } from "lucide-react";
import { AppShell, Card, ScreenHeader, PrimaryButton } from "@/components/AppShell";
import { ServiceLogo } from "@/components/ServiceLogo";
import { useApp } from "@/lib/store";
import { benefit } from "@/lib/benefits";

export const Route = createFileRoute("/benefits/$id")({
  loader: ({ params }) => {
    const b = benefit(params.id);
    if (!b) throw notFound();
    return { benefit: b };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Offer unavailable · Shekk" }, { name: "robots", content: "noindex" }] };
    }
    const b = loaderData.benefit;
    const title = `${b.brand} — ${b.discount} · Shekk`;
    return {
      meta: [
        { title },
        { name: "description", content: b.headline },
        { property: "og:title", content: title },
        { property: "og:description", content: b.headline },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: BenefitDetail,
});

function BenefitDetail() {
  const { benefit: b } = Route.useLoaderData();
  const { state, isPremium, redeemBenefit } = useApp();
  const [justRedeemed, setJustRedeemed] = useState(false);

  const locked = !!b.premium && !isPremium;
  const redeemed = state.redeemed.includes(b.id) || justRedeemed;

  return (
    <AppShell>
      <ScreenHeader title={b.brand} subtitle={b.discount} back="/benefits" />

      <section className="px-5 pt-6">
        <div className="flex items-center gap-4">
          <ServiceLogo service={{ name: b.brand, emoji: b.emoji, domain: b.domain }} size={64} />
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-bold leading-tight tracking-tight">{b.headline}</h1>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3.5" /> {b.location}
            </p>
          </div>
        </div>

        <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{b.detail}</p>
      </section>

      <section className="px-4 pt-5">
        <Card className="space-y-3 p-4 text-sm">
          <Detail label="Discount" value={b.discount} />
          <Detail label="How it works" value={b.redemption} />
          <Detail label="Valid" value={b.expires} />
          <Detail label="Plan" value={b.premium ? "Shekk Premium" : "All members"} />
        </Card>
      </section>

      <section className="px-4 pb-10 pt-5">
        {locked ? (
          <Link
            to="/membership"
            className="tap flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-4 text-base font-semibold text-primary-foreground"
          >
            <Lock className="size-4" /> Unlock with Premium
          </Link>
        ) : redeemed ? (
          <Card className="p-5 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-success-soft">
              <Check className="size-7 text-success" />
            </div>
            <p className="mt-3 font-display text-lg font-bold">Offer added</p>
            <p className="mt-1 text-xs text-muted-foreground">
              It applies automatically the next time you pay {b.brand} with Shekk.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-muted px-3 py-2 font-mono text-sm font-semibold">
              <Ticket className="size-4" /> SHEKK-{b.id.slice(0, 6).toUpperCase()}
            </div>
          </Card>
        ) : (
          <PrimaryButton
            onClick={() => {
              redeemBenefit(b.id);
              setJustRedeemed(true);
            }}
          >
            Redeem offer
          </PrimaryButton>
        )}

        <p className="mt-4 flex items-start gap-2 px-1 text-[11px] leading-relaxed text-muted-foreground">
          <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
          Partner offers are provided by the named business. In this prototype redemption is simulated.
        </p>
      </section>
    </AppShell>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
