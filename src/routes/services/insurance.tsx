import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, Sparkles, ArrowRight, RotateCcw } from "lucide-react";
import { AppShell, ScreenHeader, Notice } from "@/components/AppShell";
import { Chip, MicroLabel, SectionHead } from "@/components/Kit";
import { rankInsuranceOffers, provider, offerUrl, isAffiliate, type Offer } from "@/lib/offers";
import { track } from "@/lib/analytics";

export const Route = createFileRoute("/services/insurance")({
  head: () => ({
    meta: [
      { title: "Compare travel and medical cover · Shekk" },
      {
        name: "description",
        content:
          "Answer a few questions and Shekk recommends travel and medical insurance that fits your dates in Israel, your programme's rules and the activities you'll do.",
      },
      { property: "og:title", content: "Compare travel and medical cover · Shekk" },
      { property: "og:description", content: "Insurance matched to your dates, programme and activities in Israel." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: InsuranceFinder,
});

const STAY_OPTIONS: { label: string; days: number }[] = [
  { label: "Under 1 month", days: 20 },
  { label: "1–3 months", days: 75 },
  { label: "3–12 months", days: 200 },
  { label: "Over a year", days: 400 },
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
          track("insurance_provider_selected", { offer: offer.id, provider: offer.providerId });
          track("insurance_affiliate_clicked", {
            offer: offer.id,
            provider: offer.providerId,
            affiliate: isAffiliate(offer),
          });
        }}
        className={`tap mt-3.5 inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-bold ${
          best ? "bg-primary text-primary-foreground" : "border border-border bg-background text-foreground"
        }`}
      >
        Check cover with {p?.name} <ArrowRight className="size-3.5" />
      </a>
    </div>
  );
}

function InsuranceFinder() {
  const [days, setDays] = useState<number | null>(null);
  const [activities, setActivities] = useState<boolean | null>(null);
  const [programmeCover, setProgrammeCover] = useState<boolean | null>(null);
  const [student, setStudent] = useState<boolean | null>(null);

  useEffect(() => {
    track("insurance_recommendation_started");
  }, []);

  const answered = days !== null && activities !== null && programmeCover !== null;
  const ranked = useMemo(
    () => rankInsuranceOffers({ days, activities, programmeCover, student }),
    [days, activities, programmeCover, student],
  );

  useEffect(() => {
    if (answered) track("insurance_recommendation_completed", { days, activities, programmeCover, student });
  }, [answered, days, activities, programmeCover, student]);

  return (
    <AppShell>
      <ScreenHeader title="Compare cover" subtitle="A few quick questions" back="/services" />

      <header className="px-5 pt-5">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
          <ShieldCheck className="size-3.5" /> Stay covered
        </span>
        <h1 className="mt-2.5 font-display text-[1.75rem] font-bold leading-tight tracking-tight">
          Cover that actually fits your year
        </h1>
        <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
          Israeli healthcare is excellent and expensive without cover. Answer three questions and we'll narrow it down.
        </p>
      </header>

      <div className="space-y-6 px-4 pb-10 pt-6">
        <section>
          <SectionHead title="How long are you covered for?" />
          <div className="flex flex-wrap gap-2">
            {STAY_OPTIONS.map((o) => (
              <Chip key={o.label} selected={days === o.days} onClick={() => setDays(o.days)}>
                {o.label}
              </Chip>
            ))}
          </div>
        </section>

        <section>
          <SectionHead title="Will you do sport, tiyulim or adventure activities?" />
          <div className="flex flex-wrap gap-2">
            <Chip selected={activities === true} onClick={() => setActivities(true)}>
              Yes, regularly
            </Chip>
            <Chip selected={activities === false} onClick={() => setActivities(false)}>
              No, everyday life
            </Chip>
          </div>
        </section>

        <section>
          <SectionHead title="Does your programme already provide cover?" />
          <div className="flex flex-wrap gap-2">
            <Chip selected={programmeCover === true} onClick={() => setProgrammeCover(true)}>
              Yes, partly
            </Chip>
            <Chip selected={programmeCover === false} onClick={() => setProgrammeCover(false)}>
              No, I need my own
            </Chip>
          </div>
        </section>

        <section>
          <SectionHead title="Are you a student?" hint="Some insurers price student cover differently" />
          <div className="flex flex-wrap gap-2">
            <Chip selected={student === true} onClick={() => setStudent(true)}>
              Yes
            </Chip>
            <Chip selected={student === false} onClick={() => setStudent(false)}>
              No
            </Chip>
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
                    setActivities(null);
                    setProgrammeCover(null);
                    setStudent(null);
                  }}
                  className="tap-flat inline-flex items-center gap-1.5 text-[12px] font-semibold text-primary"
                >
                  <RotateCcw className="size-3.5" /> Start again
                </button>
              }
            />
            {programmeCover ? (
              <Notice title="Check what your programme covers first">
                Ask for the policy document before buying your own. Programme cover often handles emergencies but not
                dental, gadgets or adventure activities.
              </Notice>
            ) : null}
            {ranked.slice(0, 3).map((o, i) => (
              <OfferCard key={o.id} offer={o} best={i === 0} />
            ))}
          </section>
        ) : (
          <Notice title="Answer the three questions">
            Dates, activities and whether your programme already covers you decide which cover makes sense.
          </Notice>
        )}

        <section className="rounded-2xl border border-border bg-card p-4 shadow-card">
          <p className="text-sm font-semibold">Once you're covered</p>
          <ul className="mt-2 space-y-1.5 text-[12px] leading-relaxed text-muted-foreground">
            <li>Save the policy PDF in your Shekk document vault.</li>
            <li>Add the insurer's card and hotline to your health wallet.</li>
            <li>Photograph your passport and visa — clinics ask for both.</li>
          </ul>
        </section>
      </div>
    </AppShell>
  );
}
