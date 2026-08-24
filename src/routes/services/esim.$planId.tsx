import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowUpRight, Info, Lock } from "lucide-react";
import { AppShell, ScreenHeader, Notice } from "@/components/AppShell";
import { ErrorState, LoadingBlocks, MicroLabel, SectionHead, StatusPill } from "@/components/Kit";
import { getSimPlan, startSimHandoff } from "@/lib/sim.functions";
import { capabilityLines, INDICATIVE_PRICE_NOTE, isIndicative, periodLabel, planAction, priceLabel } from "@/lib/sim";
import { track } from "@/lib/analytics";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const Route = createFileRoute("/services/esim/$planId")({
  /** `rec` carries the finder's saved recommendation id so a click can be attributed. */
  validateSearch: (search: Record<string, unknown>) => {
    const rec = typeof search.rec === "string" && UUID.test(search.rec) ? search.rec : undefined;
    return { rec } as { rec?: string };
  },
  head: () => ({
    meta: [
      { title: "SIM plan detail · Shekk" },
      {
        name: "description",
        content:
          "What this Israeli SIM plan includes — data, validity, whether an Israeli number comes with it, and how to get it.",
      },
      { property: "og:title", content: "SIM plan detail · Shekk" },
      { property: "og:description", content: "Data, validity and activation for one Israeli SIM plan." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PlanDetail,
});

function PlanDetail() {
  const { planId } = Route.useParams();
  const { rec } = Route.useSearch();
  const fetchPlan = useServerFn(getSimPlan);
  const handoff = useServerFn(startSimHandoff);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["sim", "plan", planId],
    queryFn: () => fetchPlan({ data: { id: planId } }),
    staleTime: 5 * 60_000,
  });

  const plan = query.data ?? null;

  useEffect(() => {
    if (plan) track("sim_plan_viewed", { plan: plan.id, provider: plan.providerId });
  }, [plan]);

  async function go() {
    if (!plan) return;
    setProblem(null);
    setBusy(true);
    try {
      const result = await handoff({ data: { planId: plan.id, recommendationId: rec ?? null } });
      track("sim_affiliate_clicked", {
        plan: plan.id,
        provider: plan.providerId,
        affiliate: result.affiliate,
        provider_mode: plan.provider?.mode ?? "disabled",
      });
      if (!result.url) {
        setProblem(result.reason ?? "We don't have a link for this provider yet.");
        return;
      }
      window.open(result.url, "_blank", "noreferrer,noopener");
    } catch (e) {
      setProblem((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (query.isLoading) {
    return (
      <AppShell>
        <ScreenHeader title="Plan" back="/services/esim" />
        <div className="px-4 pt-6">
          <LoadingBlocks rows={4} />
        </div>
      </AppShell>
    );
  }

  if (query.error || !plan) {
    return (
      <AppShell>
        <ScreenHeader title="Plan" back="/services/esim" />
        <div className="px-4 pt-6">
          <ErrorState
            title="Couldn't load this plan"
            body={query.error ? (query.error as Error).message : "This plan is no longer in the catalogue."}
            onRetry={() => void query.refetch()}
          />
        </div>
      </AppShell>
    );
  }

  const action = planAction(plan);

  return (
    <AppShell>
      <ScreenHeader title={plan.provider?.name ?? "Plan"} subtitle="Plan detail" back="/services/esim" />

      <header className="px-5 pt-5">
        <MicroLabel className="text-muted-foreground">{plan.provider?.name}</MicroLabel>
        <h1 className="mt-1.5 font-display text-[1.6rem] font-bold leading-tight tracking-tight">{plan.name}</h1>
        {plan.headline ? <p className="mt-1 text-[13px] text-muted-foreground">{plan.headline}</p> : null}
        <div className="mt-3 flex items-end gap-2">
          <p className="font-display text-3xl font-bold leading-none">{priceLabel(plan)}</p>
          <p className="pb-0.5 text-[12px] text-muted-foreground">{periodLabel(plan)}</p>
        </div>
        {isIndicative(plan) ? (
          <p className="mt-1.5 text-[11.5px] text-muted-foreground">
            {INDICATIVE_PRICE_NOTE} Curated by hand from what {plan.provider?.name ?? "the provider"} publishes — check
            the current price and allowance on their site.
          </p>
        ) : null}
      </header>

      <div className="space-y-4 px-4 pb-10 pt-6">
        <section className="rounded-2xl border border-border bg-card p-4 shadow-card">
          <SectionHead title="What you get" />
          <ul className="space-y-1.5">
            {capabilityLines(plan).map((line) => (
              <li key={line} className="flex gap-2 text-[12.5px] text-muted-foreground">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                {line}
              </li>
            ))}
          </ul>
          {plan.points.length > 0 ? (
            <ul className="mt-3 space-y-1.5 border-t border-border pt-3">
              {plan.points.map((p) => (
                <li key={p} className="flex gap-2 text-[12.5px] text-muted-foreground">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground/40" aria-hidden />
                  {p}
                </li>
              ))}
            </ul>
          ) : null}
        </section>

        {plan.fairUseNote || plan.activationPolicy || plan.operator || plan.networks.length > 0 ? (
          <section className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <SectionHead title="The small print" />
            <dl className="space-y-2 text-[12.5px]">
              {plan.activationPolicy ? (
                <div>
                  <dt className="font-semibold">Activation</dt>
                  <dd className="text-muted-foreground">{plan.activationPolicy}</dd>
                </div>
              ) : null}
              {plan.fairUseNote ? (
                <div>
                  <dt className="font-semibold">Fair use</dt>
                  <dd className="text-muted-foreground">{plan.fairUseNote}</dd>
                </div>
              ) : null}
              {plan.operator ? (
                <div>
                  <dt className="font-semibold">Network</dt>
                  <dd className="text-muted-foreground">{plan.operator}</dd>
                </div>
              ) : null}
              {plan.networks.length > 0 ? (
                <div>
                  <dt className="font-semibold">Roams on</dt>
                  <dd className="text-muted-foreground">{plan.networks.join(", ")}</dd>
                </div>
              ) : null}
            </dl>
          </section>
        ) : null}

        {!plan.phoneNumberIncluded ? (
          <Notice title="This plan does not give you an Israeli number">
            It's data only. If you need a number for deliveries, clinics or Rav-Kav, go back and answer yes to the
            number question — we'll show plans that include one.
          </Notice>
        ) : null}

        <section className="rounded-2xl border border-border bg-card p-4 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold">Getting this plan</p>
            <StatusPill tone={action.kind === "affiliate" ? "live" : "preview"}>
              {action.kind === "affiliate" ? "Partner link" : "Not sold in Shekk"}
            </StatusPill>
          </div>

          {action.kind === "affiliate" ? (
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">
              We'll hand you over to {plan.provider?.name}. You buy and pay there — Shekk doesn't take your payment.
            </p>
          ) : (
            <p className="mt-1.5 flex gap-2 text-[12.5px] leading-relaxed text-muted-foreground">
              <Info className="mt-0.5 size-4 shrink-0" />
              {action.note}
            </p>
          )}

          {action.kind === "checkout_disabled" ? (
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-[11.5px] font-semibold text-muted-foreground">
              <Lock className="size-3.5" /> Paying in Shekk is switched off
            </p>
          ) : null}

          <button
            type="button"
            onClick={() => void go()}
            disabled={busy}
            className="tap mt-3.5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-[13px] font-bold text-primary-foreground disabled:opacity-60"
          >
            {busy ? "Opening…" : action.kind === "affiliate" ? action.label : `Open ${plan.provider?.name}`}
            <ArrowUpRight className="size-4" />
          </button>

          {problem ? <p className="mt-2 text-[12px] font-semibold text-destructive">{problem}</p> : null}

          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            Opens {plan.provider?.name}'s own site in a new tab.
          </p>
        </section>
      </div>
    </AppShell>
  );
}
