import { createFileRoute } from "@tanstack/react-router";
import { Tag } from "lucide-react";
import { AppShell, ScreenHeader, Notice } from "@/components/AppShell";
import { PageHeader, MicroLabel } from "@/components/Kit";
import { PARTNER_OFFERS, offerUrl, provider, isAffiliate } from "@/lib/offers";
import { track } from "@/lib/analytics";

export const Route = createFileRoute("/services/offers")({
  head: () => ({
    meta: [
      { title: "Offers and discounts · Shekk" },
      {
        name: "description",
        content:
          "Partner offers and student discounts for people living in Israel: airport transfers, transport discounts and more.",
      },
      { property: "og:title", content: "Offers and discounts · Shekk" },
      { property: "og:description", content: "Deals worth knowing about for your time in Israel." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OffersPage,
});

function OffersPage() {
  return (
    <AppShell>
      <ScreenHeader title="Offers" subtitle="Partner deals" back="/services" />
      <PageHeader title="Offers" subtitle="Deals worth knowing about while you're here." />

      <div className="space-y-3 px-4 pb-10 pt-4">
        <Notice title="Early partner list">
          We only list things we'd recommend to a friend. As partners come on board, offers here become bookable in a
          tap.
        </Notice>

        {PARTNER_OFFERS.map((o) => {
          const p = provider(o.providerId);
          return (
            <div key={o.id} className="rounded-2xl border border-border bg-card p-4 shadow-card">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <MicroLabel className="text-muted-foreground">{p?.name ?? "Partner"}</MicroLabel>
                  <p className="mt-1 text-sm font-semibold leading-snug">{o.name}</p>
                  <p className="text-[12px] text-muted-foreground">{o.headline}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-display text-base font-bold leading-none">{o.price}</p>
                  <p className="text-[11px] text-muted-foreground">{o.period}</p>
                </div>
              </div>
              <ul className="mt-3 space-y-1.5">
                {o.points.map((pt) => (
                  <li key={pt} className="flex gap-2 text-[12px] text-muted-foreground">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                    {pt}
                  </li>
                ))}
              </ul>
              <a
                href={offerUrl(o, o.id)}
                target="_blank"
                rel="noreferrer noopener"
                onClick={() => track("offer_clicked", { offer: o.id, provider: o.providerId, affiliate: isAffiliate(o) })}
                className="tap mt-3 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-[12.5px] font-bold text-primary-foreground"
              >
                <Tag className="size-3.5" /> Open {p?.name ?? "offer"}
              </a>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
