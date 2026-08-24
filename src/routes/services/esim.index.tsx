import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Smartphone, Sparkles, ArrowRight, RotateCcw, Signal } from "lucide-react";
import { AppShell, ScreenHeader, Notice } from "@/components/AppShell";
import { Chip, MicroLabel, SectionHead, EmptyState, ErrorState, LoadingBlocks } from "@/components/Kit";
import { listSimPlans, submitSimAnswers } from "@/lib/sim.functions";
import {
  EMPTY_ANSWERS,
  STAY_OPTIONS,
  USAGE_OPTIONS,
  answersComplete,
  dataLabel,
  isIndicative,
  periodLabel,
  priceLabel,
  type SimAnswers,
  type SimPlan,
  type UsageProfile,
} from "@/lib/sim";
import { rankPlans } from "@/lib/sim-ranking";
import { track } from "@/lib/analytics";
import { useTravel } from "@/lib/useProgramme";

export const Route = createFileRoute("/services/esim/")({
  head: () => ({
    meta: [
      { title: "Find your Israeli SIM · Shekk" },
      {
        name: "description",
        content:
          "Answer three questions and Shekk recommends the right Israeli eSIM or local SIM for your stay — data-only, Israeli number or unlimited.",
      },
      { property: "og:title", content: "Find your Israeli SIM · Shekk" },
      { property: "og:description", content: "The right eSIM for how long you're staying and how much data you need." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EsimFinder,
});

function PlanCard({ plan, best, reasons }: { plan: SimPlan; best?: boolean; reasons: string[] }) {
  return (
    <Link
      to="/services/esim/$planId"
      params={{ planId: plan.id }}
      onClick={() => track("sim_provider_selected", { plan: plan.id, provider: plan.providerId, best: Boolean(best) })}
      className={`tap block rounded-2xl border bg-card p-4 text-left shadow-card ${
        best ? "border-primary/40 ring-1 ring-primary/20" : "border-border"
      }`}
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
          <p className="text-sm font-semibold leading-snug">{plan.name}</p>
          <p className="text-[12px] text-muted-foreground">{plan.headline}</p>
          <p className="mt-1 text-[11px] font-semibold text-muted-foreground">{plan.provider?.name}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-display text-lg font-bold leading-none">{priceLabel(plan)}</p>
          <p className="text-[11px] text-muted-foreground">{periodLabel(plan)}</p>
        </div>
      </div>

      <ul className="mt-3 space-y-1.5">
        <li className="flex gap-2 text-[12px] text-muted-foreground">
          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
          {dataLabel(plan)}
        </li>
        <li className="flex gap-2 text-[12px] text-muted-foreground">
          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
          {plan.phoneNumberIncluded ? "Israeli phone number included" : "Data only — no Israeli number"}
        </li>
        {reasons.slice(0, 1).map((r) => (
          <li key={r} className="flex gap-2 text-[12px] text-muted-foreground">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
            {r}
          </li>
        ))}
      </ul>

      <span className="tap-flat mt-3.5 inline-flex items-center gap-1.5 text-[12.5px] font-bold text-primary">
        See the detail <ArrowRight className="size-3.5" />
      </span>
    </Link>
  );
}

function EsimFinder() {
  const { travel } = useTravel();
  const navigate = useNavigate();
  const fetchPlans = useServerFn(listSimPlans);
  const saveAnswers = useServerFn(submitSimAnswers);
  const [answers, setAnswers] = useState<SimAnswers>(EMPTY_ANSWERS);

  const plansQuery = useQuery({
    queryKey: ["sim", "plans"],
    queryFn: () => fetchPlans(),
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    track("sim_recommendation_started");
  }, []);

  const complete = answersComplete(answers);
  const plans = plansQuery.data ?? [];
  const ranked = useMemo(() => (complete ? rankPlans(plans, answers) : []), [complete, plans, answers]);

  // Persist the run once it's complete, so a later handoff can be attributed.
  useEffect(() => {
    if (!complete || plans.length === 0) return;
    track("sim_recommendation_completed", {
      days: answers.days,
      usage: answers.usage,
      needsCalls: answers.needsCalls,
    });
    void saveAnswers({ data: { answers } }).catch(() => {
      /* the recommendation is a record, never a blocker */
    });
  }, [complete, plans.length, answers, saveAnswers]);

  const set = <K extends keyof SimAnswers>(key: K, value: SimAnswers[K]) =>
    setAnswers((a) => ({ ...a, [key]: value }));

  return (
    <AppShell>
      <ScreenHeader title="Find your SIM" subtitle="Three quick questions" back="/services" />

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
              <Chip key={o.label} selected={answers.days === o.days} onClick={() => set("days", o.days)}>
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
          <SectionHead
            title="Do you need an Israeli phone number?"
            hint="Deliveries, clinics, Rav-Kav and banks ask for one"
          />
          <div className="flex flex-wrap gap-2">
            <Chip selected={answers.needsCalls === true} onClick={() => set("needsCalls", true)}>
              Yes, an Israeli number
            </Chip>
            <Chip selected={answers.needsCalls === false} onClick={() => set("needsCalls", false)}>
              No, data is enough
            </Chip>
          </div>
        </section>

        <section>
          <SectionHead title="How much data do you use?" />
          <div className="flex flex-wrap gap-2">
            {USAGE_OPTIONS.map((o) => (
              <Chip
                key={o.value}
                selected={answers.usage === o.value}
                onClick={() => set("usage", o.value as UsageProfile)}
              >
                {o.label} · {o.hint}
              </Chip>
            ))}
          </div>
        </section>

        <section>
          <SectionHead title="Does your phone support eSIM?" hint="Optional — most iPhones from XS and recent Androids do" />
          <div className="flex flex-wrap gap-2">
            <Chip
              selected={answers.deviceEsimReady === true}
              onClick={() => {
                set("deviceEsimReady", true);
                track("sim_device_check_used", { esimReady: true });
              }}
            >
              Yes, it does
            </Chip>
            <Chip
              selected={answers.deviceEsimReady === false}
              onClick={() => {
                set("deviceEsimReady", false);
                track("sim_device_check_used", { esimReady: false });
              }}
            >
              No or not sure
            </Chip>
          </div>
        </section>

        {plansQuery.isLoading ? (
          <LoadingBlocks rows={3} />
        ) : plansQuery.error ? (
          <ErrorState
            title="Couldn't load the plans"
            body={(plansQuery.error as Error).message}
            onRetry={() => void plansQuery.refetch()}
          />
        ) : plans.length === 0 ? (
          <EmptyState
            icon={Signal}
            title="No plans in the catalogue yet"
            body="Shekk's SIM catalogue is empty for now. Ask your programme what they recommend in the meantime."
          />
        ) : complete ? (
          <section className="space-y-3">
            <SectionHead
              title="Your recommendation"
              hint="Prices are indicative until a partner feed is live"
              action={
                <button
                  type="button"
                  onClick={() => setAnswers(EMPTY_ANSWERS)}
                  className="tap-flat inline-flex items-center gap-1.5 text-[12px] font-semibold text-primary"
                >
                  <RotateCcw className="size-3.5" /> Start again
                </button>
              }
            />
            {ranked.slice(0, 4).map((r, i) => (
              <PlanCard key={r.plan.id} plan={r.plan} best={i === 0} reasons={r.reasons} />
            ))}
            {ranked.some((r) => isIndicative(r.plan)) ? (
              <p className="px-1 text-[11.5px] leading-relaxed text-muted-foreground">
                These plan shapes and prices are curated by hand from what providers publish. You can't buy a SIM inside
                Shekk yet — we'll tell you exactly where to go instead.
              </p>
            ) : null}
            <button
              type="button"
              onClick={() => void navigate({ to: "/services/esim/mine" })}
              className="tap-flat w-full rounded-2xl border border-dashed border-border p-3 text-[12.5px] font-semibold text-muted-foreground"
            >
              Where your eSIMs will live once you can buy here
            </button>
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
