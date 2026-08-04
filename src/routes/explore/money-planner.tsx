/**
 * Money Planner — the merged planning experience.
 *
 * One plan, three questions: what a month costs here, what landing costs,
 * and how much should sit untouched. The old Budget Planner and Cost of
 * Living calculators both redirect here.
 */

import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, LifeBuoy, Plane, Plus, RotateCcw, Trash2, Wallet } from "lucide-react";
import { AppShell, Card, Notice, ScreenHeader } from "@/components/AppShell";
import { Chip, MicroLabel, ProgressBar, SectionHead } from "@/components/Kit";
import { useLocalState } from "@/lib/local-state";
import {
  ARRIVAL_LINES,
  CITIES,
  COST_LINES,
  arrivalDefaults,
  arrivalTotal,
  baselineInputs,
  beforeYouFlyTotal,
  bufferTarget,
  bufferVerdict,
  cityOf,
  monthlyIn,
  monthlyLeft,
  monthlyOut,
  monthlyVerdict,
  retargetCity,
  starterMoneyPlan,
  type ArrivalKey,
  type CityId,
  type MoneyPlan,
} from "@/lib/cost-content";

export const Route = createFileRoute("/explore/money-planner")({
  head: () => ({
    meta: [
      { title: "Money Planner · Shekk" },
      {
        name: "description",
        content:
          "Plan your year in Israel in one place: what a month costs in your city, what your first fortnight costs, what comes in, and the emergency buffer you should land with.",
      },
      { property: "og:title", content: "Money Planner · Shekk" },
      {
        property: "og:description",
        content: "Monthly costs, arrival costs and your emergency buffer — one plan that takes a view.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MoneyPlanner,
});

const shekels = (n: number) => `₪${Math.round(n).toLocaleString("en-US")}`;

type Tab = "month" | "arrival" | "buffer";

const TABS: { id: Tab; label: string; Icon: typeof Wallet }[] = [
  { id: "month", label: "Every month", Icon: Wallet },
  { id: "arrival", label: "Landing", Icon: Plane },
  { id: "buffer", label: "Buffer", Icon: LifeBuoy },
];

function MoneyPlanner() {
  const { value, update } = useLocalState<{ plan: MoneyPlan }>("shekk.moneyplan.v1", {
    plan: starterMoneyPlan("jerusalem"),
  });
  const plan = value.plan;
  const setPlan = (next: MoneyPlan) => update({ plan: next });
  const [tab, setTab] = useState<Tab>("month");

  const city = cityOf(plan.city);
  const out = monthlyOut(plan);
  const inc = monthlyIn(plan);
  const left = monthlyLeft(plan);
  const verdict = monthlyVerdict(plan);
  const landing = arrivalTotal(plan);
  const buffer = bufferTarget(plan);
  const beforeFly = beforeYouFlyTotal(plan);

  /* The hero always answers the question the current tab is asking. */
  const hero =
    tab === "month"
      ? { label: `${city.emoji} ${city.name} · left each month`, amount: left, line: verdict.line }
      : tab === "arrival"
        ? {
            label: "Your first fortnight",
            amount: landing,
            line: `One-off costs before your first normal month starts. That's ${
              out ? (landing / out).toFixed(1) : "0"
            } months of your ${city.name} outgoings.`,
          }
        : {
            label: `Emergency buffer · ${plan.bufferMonths} month${plan.bufferMonths === 1 ? "" : "s"}`,
            amount: buffer,
            line: bufferVerdict(plan),
          };

  const grad =
    tab === "month"
      ? verdict.tone === "short"
        ? "var(--grad-alert)"
        : "var(--grad-balance)"
      : tab === "arrival"
        ? "var(--grad-sky)"
        : "var(--grad-premium)";

  const setCity = (id: CityId) => setPlan(retargetCity(plan, id));

  const editIncome = (id: string, patch: { label?: string; amount?: number }) =>
    setPlan({ ...plan, income: plan.income.map((l) => (l.id === id ? { ...l, ...patch } : l)) });

  return (
    <AppShell>
      <ScreenHeader title="Money planner" back="/israel" />

      <header className="px-4 pt-2">
        <div
          className="relative overflow-hidden rounded-[1.5rem] px-5 py-5 text-ink-foreground shadow-lift"
          style={{ backgroundImage: grad }}
        >
          <span className="card-sheen pointer-events-none absolute inset-0" aria-hidden />
          <div className="relative">
            <MicroLabel className="opacity-70">{hero.label}</MicroLabel>
            <p className="mt-2 font-display text-[2.6rem] font-bold leading-none tracking-tight">
              {shekels(hero.amount)}
            </p>
            <p className="mt-2 text-[12.5px] leading-relaxed opacity-85">{hero.line}</p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-[11.5px]">
              {(
                [
                  ["In", inc],
                  ["Out", out],
                  ["Before you fly", beforeFly],
                ] as [string, number][]
              ).map(([label, amount]) => (
                <div key={label} className="rounded-xl bg-ink-foreground/12 px-3 py-2">
                  <span className="block font-bold uppercase tracking-[0.1em] opacity-70">{label}</span>
                  <span className="mt-0.5 block font-display text-[15px] font-bold">{shekels(amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      <nav className="flex gap-2 px-4 pt-4" aria-label="Planner section">
        {TABS.map((t) => (
          <Chip key={t.id} selected={tab === t.id} onClick={() => setTab(t.id)} className="flex-1 justify-center">
            <t.Icon className="size-3.5" /> {t.label}
          </Chip>
        ))}
      </nav>

      <div className="mt-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {CITIES.map((c) => (
          <Chip
            key={c.id}
            selected={c.id === plan.city}
            onClick={() => setCity(c.id)}
            className="shrink-0 whitespace-nowrap"
          >
            {c.emoji} {c.name}
          </Chip>
        ))}
      </div>

      {tab === "month" ? (
        <div className="space-y-6 px-4 pb-12 pt-5">
          <section className="space-y-3">
            <SectionHead title="What goes out" hint={`Started from a typical ${city.name} month — drag it to match yours.`} />
            {COST_LINES.map((line) => {
              const amount = plan.monthly[line.key] || 0;
              const share = out ? amount / out : 0;
              return (
                <Card key={line.key}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[13.5px] font-semibold">
                      <span className="mr-1.5" aria-hidden>
                        {line.emoji}
                      </span>
                      {line.label}
                    </span>
                    <span className="shrink-0 font-display text-[15px] font-bold">{shekels(amount)}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={line.max}
                    step={line.step}
                    value={amount}
                    onChange={(e) =>
                      setPlan({ ...plan, monthly: { ...plan.monthly, [line.key]: Number(e.target.value) } })
                    }
                    aria-label={line.label}
                    className="mt-3 w-full accent-[var(--primary)]"
                  />
                  <p className="mt-1.5 text-[11.5px] leading-snug text-muted-foreground">
                    {line.hint} · {Math.round(share * 100)}% of your month
                  </p>
                </Card>
              );
            })}
          </section>

          <section>
            <SectionHead title="What comes in" hint="Money from home, work, stipends, scholarships." />
            <div className="space-y-2">
              {plan.income.map((l) => (
                <Card key={l.id} className="flex items-center gap-2 py-3">
                  <input
                    value={l.label}
                    onChange={(e) => editIncome(l.id, { label: e.target.value })}
                    aria-label="Label"
                    className="min-w-0 flex-1 bg-transparent text-[13.5px] font-semibold outline-none"
                  />
                  <span className="text-[13px] font-semibold text-muted-foreground">₪</span>
                  <input
                    type="number"
                    min={0}
                    value={l.amount}
                    onChange={(e) => editIncome(l.id, { amount: Math.max(0, Number(e.target.value)) })}
                    aria-label={`${l.label} amount`}
                    className="w-20 shrink-0 bg-transparent text-right font-display text-[15px] font-bold outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setPlan({ ...plan, income: plan.income.filter((x) => x.id !== l.id) })}
                    aria-label={`Remove ${l.label}`}
                    className="tap-flat shrink-0 text-muted-foreground"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </Card>
              ))}
              <button
                type="button"
                onClick={() =>
                  setPlan({
                    ...plan,
                    income: [...plan.income, { id: `i-${Date.now()}`, label: "New income", amount: 0 }],
                  })
                }
                className="tap-flat inline-flex items-center gap-1.5 px-1 text-[12.5px] font-bold text-primary"
              >
                <Plus className="size-4" /> Add a line
              </button>
            </div>
          </section>

          <section>
            <SectionHead title="What you want to keep" hint="Shekk takes this off before telling you what's spare." />
            <Card>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[13.5px] font-semibold">Kept aside each month</span>
                <span className="font-display text-[15px] font-bold">{shekels(plan.savingsTarget)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={3000}
                step={50}
                value={plan.savingsTarget}
                onChange={(e) => setPlan({ ...plan, savingsTarget: Number(e.target.value) })}
                aria-label="Savings target"
                className="mt-3 w-full accent-[var(--primary)]"
              />
            </Card>
          </section>

          <button
            type="button"
            onClick={() => setPlan({ ...plan, monthly: baselineInputs(plan.city) })}
            className="tap inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-border bg-card py-3 text-[12.5px] font-semibold"
          >
            <RotateCcw className="size-4" /> Reset to a typical {city.name} month
          </button>

          <button
            type="button"
            onClick={() => setTab("arrival")}
            className="tap inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-primary py-3.5 text-[13px] font-bold text-primary-foreground"
          >
            Next: what landing costs <ArrowRight className="size-4" />
          </button>
        </div>
      ) : tab === "arrival" ? (
        <div className="space-y-3 px-4 pb-12 pt-5">
          <SectionHead
            title="Your first fortnight"
            hint="One-offs, not monthly. This is the bill that surprises everybody."
          />
          {ARRIVAL_LINES.map((line) => {
            const amount = plan.arrival[line.key] || 0;
            return (
              <Card key={line.key}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[13.5px] font-semibold">
                    <span className="mr-1.5" aria-hidden>
                      {line.emoji}
                    </span>
                    {line.label}
                  </span>
                  <span className="shrink-0 font-display text-[15px] font-bold">{shekels(amount)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={line.max}
                  step={line.step}
                  value={amount}
                  onChange={(e) =>
                    setPlan({
                      ...plan,
                      arrival: { ...plan.arrival, [line.key as ArrivalKey]: Number(e.target.value) },
                    })
                  }
                  aria-label={line.label}
                  className="mt-3 w-full accent-[var(--primary)]"
                />
                <p className="mt-1.5 text-[11.5px] leading-snug text-muted-foreground">{line.hint}</p>
              </Card>
            );
          })}

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => setPlan({ ...plan, arrival: arrivalDefaults(plan.city) })}
              className="tap inline-flex items-center justify-center gap-1.5 rounded-full border border-border bg-card py-3 text-[12.5px] font-semibold"
            >
              <RotateCcw className="size-4" /> Reset
            </button>
            <button
              type="button"
              onClick={() => setTab("buffer")}
              className="tap inline-flex items-center justify-center gap-1.5 rounded-full bg-primary py-3 text-[12.5px] font-bold text-primary-foreground"
            >
              Set your buffer <ArrowRight className="size-4" />
            </button>
          </div>

          <Notice title="If your programme houses you">
            Drag deposit and first rent to zero. Most programme participants only pay the small lines here.
          </Notice>
        </div>
      ) : (
        <div className="space-y-4 px-4 pb-12 pt-5">
          <SectionHead
            title="How many months should sit untouched?"
            hint="Money you don't plan to spend, for the month that goes wrong."
          />
          <Card>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[13.5px] font-semibold">
                {plan.bufferMonths} month{plan.bufferMonths === 1 ? "" : "s"} of outgoings
              </span>
              <span className="font-display text-[17px] font-bold">{shekels(buffer)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={6}
              step={0.5}
              value={plan.bufferMonths}
              onChange={(e) => setPlan({ ...plan, bufferMonths: Number(e.target.value) })}
              aria-label="Buffer in months"
              className="mt-3 w-full accent-[var(--primary)]"
            />
            <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">{bufferVerdict(plan)}</p>
            <ProgressBar value={Math.min(1, plan.bufferMonths / 3)} className="mt-3" />
            <p className="mt-1.5 text-[11px] font-semibold text-muted-foreground">
              Two to three months is where most students land.
            </p>
          </Card>

          <Card>
            <MicroLabel className="text-muted-foreground">What this all adds up to</MicroLabel>
            <ul className="mt-2.5 space-y-2">
              {(
                [
                  ["Landing costs", landing],
                  ["Emergency buffer", buffer],
                ] as [string, number][]
              ).map(([label, amount]) => (
                <li key={label} className="flex items-baseline justify-between gap-3 text-[13px]">
                  <span className="font-semibold">{label}</span>
                  <span className="font-display font-bold">{shekels(amount)}</span>
                </li>
              ))}
              <li className="flex items-baseline justify-between gap-3 border-t border-border pt-2 text-[13.5px]">
                <span className="font-bold">In hand before you fly</span>
                <span className="font-display text-[17px] font-bold text-primary">{shekels(beforeFly)}</span>
              </li>
            </ul>
            <p className="mt-2.5 text-[12px] leading-relaxed text-muted-foreground">
              Plus {shekels(Math.max(0, out - inc))} a month if your income doesn't cover your outgoings.
            </p>
          </Card>

          <Link
            to="/topup"
            className="tap inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-primary py-3.5 text-[13px] font-bold text-primary-foreground"
          >
            Put money on Shekk <ArrowRight className="size-4" />
          </Link>

          <button
            type="button"
            onClick={() => setPlan(starterMoneyPlan(plan.city))}
            className="tap inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-border bg-card py-3 text-[12.5px] font-semibold"
          >
            <RotateCcw className="size-4" /> Start the whole plan again
          </button>

          <Notice title="Kept on this device">
            Your plan is yours alone — it isn't part of your Shekk balance. What you actually spend shows up in your
            activity instead.
          </Notice>
        </div>
      )}
    </AppShell>
  );
}
