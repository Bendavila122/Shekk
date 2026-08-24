import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Smartphone, Sparkles, ArrowRight, RotateCcw } from "lucide-react";
import { AppShell, ScreenHeader, Notice } from "@/components/AppShell";
import { Chip, MicroLabel, SectionHead } from "@/components/Kit";
import { rankSimOffers, provider, offerUrl, isAffiliate, type DataNeed, type Offer } from "@/lib/offers";
import { track } from "@/lib/analytics";
import { useTravel } from "@/lib/useProgramme";

export const Route = createFileRoute("/services/esim")({
  head: () => ({
    meta: [
      { title: "Find your Israeli SIM · Shekk" },
      {
        name: "description",
        content:
          "Answer four questions and Shekk recommends the right Israeli eSIM or local SIM for your stay — data-only, Israeli number or unlimited.",
      },
      { property: "og:title", content: "Find your Israeli SIM · Shekk" },
      { property: "og:description", content: "The right eSIM for how long you're staying and how much data you need." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EsimFinder,
});

const STAY_OPTIONS: { label: string; days: number }[] = [
  { label: "Under 2 weeks", days: 10 },
  { label: "2–4 weeks", days: 25 },
  { label: "1–3 months", days: 75 },
  { label: "3–12 months", days: 200 },
  { label: "Moving here", days: 400 },
];

const DATA_OPTIONS: { label: string; value: DataNeed; hint: string }[] = [
  { label: "Light", value: "light", hint: "Messaging and maps" },
  { label: "Normal", value: "normal", hint: "Social, music, some video" },
  { label: "Heavy", value: "heavy", hint: "Video calls and hotspotting" },
];

function OfferCard({ offer, best }: { offer: Offer; best?: boolean }) {
  const p = provider(offer.providerId);
  return (
    <div
      className={`rounded-2xl border bg-card p-4 shadow-card ${best ? "border-primary/40 ring-1 ring-primary/20" : "border-border"}`}
    >
      {best ? (
        <MicroLabel className="mb-1.5 text-primary">
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="size-3.5" /> Best for you
          </span>
        </MicroLabel>
      ) : null}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-snug">{offer.name}</p>
          <p className="text-[12px] text-muted-foreground">{offer.headline}</p>
          <p className="mt-1 text-[11px] font-semibold text-muted-foreground">{p?.name}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-display text-lg font-bold leading-none">{offer.price}</p>
          <p className="text-[11px] text-muted-foreground">{offer.period}</p>
        </div>
      </div>
      <ul className="mt-3 space-y-1.5">
        {offer.points.map((pt) => (
          <li key={pt} className="flex gap-2 text-[12px] text-muted-foreground">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
            {pt}
          </li>
        ))}
      </ul>
      <a
        href={offerUrl(offer, offer.id)}
        target="_blank"
        rel="noreferrer noopener"
        onClick={() => {
          track("sim_provider_selected", { offer: offer.id, provider: offer.providerId });
          track("sim_affiliate_clicked", { offer: offer.id, provider: offer.providerId, affiliate: isAffiliate(offer) });
        }}
        className={`tap mt-3.5 inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-bold ${
          best ? "bg-primary text-primary-foreground" : "border border-border bg-background text-foreground"
        }`}
      >
        Get connected with {p?.name} <ArrowRight className="size-3.5" />
      </a>
    </div>
  );
}

function EsimFinder() {
  const { travel } = useTravel();
  const [days, setDays] = useState<number | null>(null);
  const [needsNumber, setNeedsNumber] = useState<boolean | null>(null);
  const [data, setData] = useState<DataNeed | null>(null);

  useEffect(() => {
    track("sim_recommendation_started");
  }, []);

  const answered = days !== null && needsNumber !== null && data !== null;
  const ranked = useMemo(() => rankSimOffers({ days, needsNumber, data }), [days, needsNumber, data]);

  useEffect(() => {
    if (answered) track("sim_recommendation_completed", { days, needsNumber, data });
  }, [answered, days, needsNumber, data]);

  return (
    <AppShell>
      <ScreenHeader title="Find your SIM" subtitle="Four quick questions" back="/services" />

      <header className="px-5 pt-5">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
          <Smartphone className="size-3.5" /> Get connected
        </span>
        <h1 className="mt-2.5 font-display text-[1.75rem] font-bold leading-tight tracking-tight">
          Land in Israel with data
        </h1>
        <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
          Tell us about your stay and we'll point you at the plan that fits — no guessing between twelve tabs.
        </p>
      </header>

      <div className="space-y-6 px-4 pb-10 pt-6">
        <section>
          <SectionHead title="How long are you staying?" />
          <div className="flex flex-wrap gap-2">
            {STAY_OPTIONS.map((o) => (
              <Chip key={o.label} selected={days === o.days} onClick={() => setDays(o.days)}>
                {o.label}
              </Chip>
            ))}
          </div>
          {travel.arrivalDate ? (
            <p className="mt-2 px-1 text-[11.5px] text-muted-foreground">
              You told us you arrive on{" "}
              {new Date(`${travel.arrivalDate}T00:00:00`).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
              })}
              .
            </p>
          ) : null}
        </section>

        <section>
          <SectionHead title="Do you need an Israeli phone number?" hint="Deliveries, clinics, Rav-Kav and banks ask for one" />
          <div className="flex flex-wrap gap-2">
            <Chip selected={needsNumber === true} onClick={() => setNeedsNumber(true)}>
              Yes, an Israeli number
            </Chip>
            <Chip selected={needsNumber === false} onClick={() => setNeedsNumber(false)}>
              No, data is enough
            </Chip>
          </div>
        </section>

        <section>
          <SectionHead title="How much data do you use?" />
          <div className="flex flex-wrap gap-2">
            {DATA_OPTIONS.map((o) => (
              <Chip key={o.value} selected={data === o.value} onClick={() => setData(o.value)}>
                {o.label} · {o.hint}
              </Chip>
            ))}
          </div>
        </section>

        {answered ? (
          <section className="space-y-3">
            <SectionHead
              title="Your recommendation"
              hint="Prices are indicative until a partner feed is live"
              action={
                <button
                  type="button"
                  onClick={() => {
                    setDays(null);
                    setNeedsNumber(null);
                    setData(null);
                  }}
                  className="tap-flat inline-flex items-center gap-1.5 text-[12px] font-semibold text-primary"
                >
                  <RotateCcw className="size-3.5" /> Start again
                </button>
              }
            />
            {ranked.slice(0, 3).map((o, i) => (
              <OfferCard key={o.id} offer={o} best={i === 0} />
            ))}
          </section>
        ) : (
          <Notice title="Answer the three questions">
            We'll rank the plans as soon as we know your dates, whether you need an Israeli number and how much data you
            use.
          </Notice>
        )}

        <section className="rounded-2xl border border-border bg-card p-4 shadow-card">
          <p className="text-sm font-semibold">Activating on landing day</p>
          <ol className="mt-2 space-y-1.5 text-[12px] leading-relaxed text-muted-foreground">
            <li>1. Install the eSIM at home on Wi-Fi, before you fly.</li>
            <li>2. Leave your home SIM in place for bank codes — just turn its data off.</li>
            <li>3. On landing, switch the Israeli eSIM on and set it as your data line.</li>
            <li>4. Check data works before you leave arrivals, while Wi-Fi is still there.</li>
          </ol>
        </section>
      </div>
    </AppShell>
  );
}
