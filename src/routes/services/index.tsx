import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, Smartphone, Tag, BusFront, HeartPulse, FileText } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PageHeader, SectionHead, ToolRow, MicroLabel } from "@/components/Kit";
import { PARTNER_OFFERS } from "@/lib/offers";

export const Route = createFileRoute("/services/")({
  head: () => ({
    meta: [
      { title: "Services · Shekk" },
      {
        name: "description",
        content:
          "Sort the things you actually have to buy for Israel: an eSIM or Israeli number, travel and medical cover, airport transport and student discounts.",
      },
      { property: "og:title", content: "Services · Shekk" },
      {
        property: "og:description",
        content: "eSIM, insurance, transport and offers — recommended for your dates and your stay.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ServicesHub,
});

function ServicesHub() {
  return (
    <AppShell>
      <PageHeader
        title="Services"
        subtitle="The things you have to buy for Israel, recommended for your stay."
      />

      <section className="px-4 pt-5">
        <SectionHead title="Get connected and covered" hint="Two questions each, then a recommendation" />
        <div className="space-y-2.5">
          <ToolRow
            to="/services/esim"
            icon={Smartphone}
            title="Find my SIM"
            body="eSIM or an Israeli number — matched to how long you're staying"
          />
          <ToolRow
            to="/services/insurance"
            icon={ShieldCheck}
            title="Compare insurance"
            body="Medical, programme-standard and adventure cover"
          />
        </div>
      </section>

      <section className="px-4 pt-7">
        <SectionHead title="Getting around and settled" hint="Practical, not theoretical" />
        <div className="space-y-2.5">
          <ToolRow
            to="/explore/transit"
            icon={BusFront}
            title="Transport and Rav-Kav"
            body="What to use, how to pay and the mistakes to avoid"
          />
          <ToolRow
            to="/explore/health"
            icon={HeartPulse}
            title="Health cover wallet"
            body="Your kupah or insurance card, ready at the clinic"
          />
          <ToolRow
            to="/explore/documents"
            icon={FileText}
            title="Document vault"
            body="Passport, visa and policies — private and offline"
          />
        </div>
      </section>

      <section className="px-4 pt-7 pb-10">
        <SectionHead
          title="Offers and discounts"
          hint="Partner deals for people living here"
          action={
            <Link to="/services/offers" className="tap-flat text-[12.5px] font-semibold text-primary">
              See all
            </Link>
          }
        />
        <div className="space-y-2.5">
          {PARTNER_OFFERS.slice(0, 2).map((o) => (
            <Link
              key={o.id}
              to="/services/offers"
              className="tap flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-card"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <Tag className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <MicroLabel className="text-muted-foreground">{o.price}</MicroLabel>
                <span className="mt-0.5 block text-[13.5px] font-semibold leading-snug">{o.name}</span>
                <span className="block text-[12px] leading-snug text-muted-foreground">{o.headline}</span>
              </span>
              <span className="shrink-0 text-sm font-semibold text-primary">→</span>
            </Link>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
