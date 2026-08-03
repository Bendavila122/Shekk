import { createFileRoute } from "@tanstack/react-router";
import { Plus, RotateCcw, Trash2 } from "lucide-react";
import { AppShell, Card, Notice, ScreenHeader } from "@/components/AppShell";
import { MicroLabel, SectionHead } from "@/components/Kit";
import { useLocalState } from "@/lib/local-state";
import { STARTER_PLAN, planTotals, planVerdict, type BudgetPlan } from "@/lib/cost-content";

export const Route = createFileRoute("/explore/budget")({
  head: () => ({
    meta: [
      { title: "Monthly Budget Planner · Shekk" },
      {
        name: "description",
        content:
          "Edit what comes in, what goes out and how much you want to keep, and Shekk tells you straight away whether your month in Israel balances.",
      },
      { property: "og:title", content: "Monthly Budget Planner · Shekk" },
      {
        property: "og:description",
        content: "Income, expenses, savings and what's actually left each month.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BudgetPlanner,
});

const shekels = (n: number) => `₪${Math.round(n).toLocaleString("en-US")}`;

function BudgetPlanner() {
  const { value, update } = useLocalState<{ plan: BudgetPlan }>("shekk.budget.v1", { plan: STARTER_PLAN });
  const plan = value.plan;
  const { income, expenses, remaining } = planTotals(plan);
  const verdict = planVerdict(plan);

  const setPlan = (next: BudgetPlan) => update({ plan: next });

  const editLine = (kind: "income" | "expenses", id: string, patch: { label?: string; amount?: number }) =>
    setPlan({ ...plan, [kind]: plan[kind].map((l) => (l.id === id ? { ...l, ...patch } : l)) });

  const addLine = (kind: "income" | "expenses") =>
    setPlan({
      ...plan,
      [kind]: [
        ...plan[kind],
        { id: `${kind}-${Date.now()}`, label: kind === "income" ? "New income" : "New expense", amount: 0 },
      ],
    });

  const removeLine = (kind: "income" | "expenses", id: string) =>
    setPlan({ ...plan, [kind]: plan[kind].filter((l) => l.id !== id) });

  const section = (kind: "income" | "expenses", title: string, hint: string) => (
    <section>
      <SectionHead title={title} hint={hint} />
      <div className="space-y-2">
        {plan[kind].map((l) => (
          <Card key={l.id} className="flex items-center gap-2 py-3">
            <input
              value={l.label}
              onChange={(e) => editLine(kind, l.id, { label: e.target.value })}
              aria-label="Label"
              className="min-w-0 flex-1 bg-transparent text-[13.5px] font-semibold outline-none"
            />
            <span className="text-[13px] font-semibold text-muted-foreground">₪</span>
            <input
              type="number"
              min={0}
              value={l.amount}
              onChange={(e) => editLine(kind, l.id, { amount: Math.max(0, Number(e.target.value)) })}
              aria-label={`${l.label} amount`}
              className="w-20 shrink-0 bg-transparent text-right font-display text-[15px] font-bold outline-none"
            />
            <button
              type="button"
              onClick={() => removeLine(kind, l.id)}
              aria-label={`Remove ${l.label}`}
              className="tap-flat shrink-0 text-muted-foreground"
            >
              <Trash2 className="size-4" />
            </button>
          </Card>
        ))}
        <button
          type="button"
          onClick={() => addLine(kind)}
          className="tap-flat inline-flex items-center gap-1.5 px-1 text-[12.5px] font-bold text-primary"
        >
          <Plus className="size-4" /> Add a line
        </button>
      </div>
    </section>
  );

  return (
    <AppShell>
      <ScreenHeader title="Budget planner" back="/israel" />

      <header className="px-4 pt-2">
        <div
          className="relative overflow-hidden rounded-[1.5rem] px-5 py-5 text-ink-foreground shadow-lift"
          style={{ backgroundImage: remaining < 0 ? "var(--grad-alert)" : "var(--grad-balance)" }}
        >
          <span className="card-sheen pointer-events-none absolute inset-0" aria-hidden />
          <div className="relative">
            <MicroLabel className="opacity-70">Left each month</MicroLabel>
            <p className="mt-2 font-display text-[2.6rem] font-bold leading-none tracking-tight">
              {shekels(remaining)}
            </p>
            <p className="mt-2 text-[12.5px] leading-relaxed opacity-85">{verdict}</p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-[11.5px]">
              {[
                ["In", income],
                ["Out", expenses],
                ["Saving", plan.savingsTarget],
              ].map(([label, amount]) => (
                <div key={label as string} className="rounded-xl bg-ink-foreground/12 px-3 py-2">
                  <span className="block font-bold uppercase tracking-[0.1em] opacity-70">{label}</span>
                  <span className="mt-0.5 block font-display text-[15px] font-bold">
                    {shekels(amount as number)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="space-y-6 px-4 pb-12 pt-6">
        {section("income", "What comes in", "Money from home, work, stipends, scholarships.")}
        {section("expenses", "What goes out", "Everything you pay every month, not one-offs.")}

        <section>
          <SectionHead title="What you want to keep" hint="Shekk takes this off before telling you what's spare." />
          <Card>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[13.5px] font-semibold">Savings target</span>
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
          onClick={() => setPlan(STARTER_PLAN)}
          className="tap inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-border bg-card py-3 text-[12.5px] font-semibold"
        >
          <RotateCcw className="size-4" /> Start again
        </button>

        <Notice title="Kept on this device">
          Your plan stays on your phone — it isn't part of your Shekk balance. Money you actually spend shows up in
          your activity instead.
        </Notice>
      </div>
    </AppShell>
  );
}
