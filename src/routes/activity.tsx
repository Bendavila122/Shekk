import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { IdCard, Plus } from "lucide-react";
import { AppShell, Card } from "@/components/AppShell";
import { useApp } from "@/lib/store";
import { useOnboardedGate } from "@/lib/useOnboardedGate";
import { ils, usdRef } from "@/lib/mock";

export const Route = createFileRoute("/activity")({
  head: () => ({
    meta: [
      { title: "Activity · Shekk" },
      {
        name: "description",
        content:
          "Your full Shekk history: every top-up, partner-app order and token transfer, with shekel and USD reference amounts.",
      },
      { property: "og:title", content: "Activity · Shekk" },
      { property: "og:description", content: "Every top-up, order and transfer in one statement." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ActivityScreen,
});

type Filter = "all" | "spend" | "topup";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "spend", label: "Spends" },
  { id: "topup", label: "Top-ups" },
];

function ActivityScreen() {
  const ready = useOnboardedGate();
  const { state } = useApp();
  const [filter, setFilter] = useState<Filter>("all");

  const txns = state.txns;

  const shown = useMemo(
    () =>
      txns.filter((t) => (filter === "all" ? true : filter === "topup" ? t.amount > 0 : t.amount < 0)),
    [txns, filter],
  );

  const spentTotal = useMemo(
    () => txns.filter((t) => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0),
    [txns],
  );

  if (!ready) {
    return (
      <AppShell>
        <div className="p-6 text-sm text-muted-foreground">Loading…</div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <header className="px-5 pt-7">
        <h1 className="font-display text-4xl font-bold tracking-tight">Activity</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every top-up, partner-app order and token transfer, newest first.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-3 px-4 pt-5">
        <Card className="p-4">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Balance</p>
          <p className="font-display text-2xl font-bold">{ils(state.balance)}</p>
          <p className="text-[11px] text-muted-foreground">≈ {usdRef(state.balance)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Spent so far</p>
          <p className="font-display text-2xl font-bold">{ils(spentTotal)}</p>
          <p className="text-[11px] text-muted-foreground">{txns.length} entries</p>
        </Card>
      </section>

      <div className="flex gap-2 px-4 pt-4">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`tap rounded-full px-4 py-2 text-xs font-semibold ${
              filter === f.id ? "bg-ink text-ink-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <section className="px-4 pb-8 pt-4">
        <Card className="divide-y divide-border p-0">
          {shown.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-sm text-muted-foreground">Nothing here yet.</p>
              <Link
                to="/topup"
                className="tap mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
              >
                <Plus className="size-3.5" /> Top up tokens
              </Link>
            </div>
          ) : (
            shown.map((t) => (
              <div key={t.id} className="flex items-center gap-3 p-3.5">
                <span className="flex size-10 items-center justify-center rounded-xl bg-muted text-lg">{t.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{t.merchant}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.category} · {t.date}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${t.amount > 0 ? "text-success" : ""}`}>
                    {t.amount > 0 ? "+" : "−"}
                    {ils(Math.abs(t.amount))}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{usdRef(Math.abs(t.amount))}</p>
                </div>
              </div>
            ))
          )}
        </Card>

        <Link
          to="/terms"
          className="tap mt-4 flex items-center gap-2 rounded-2xl bg-primary-soft px-4 py-3 text-xs text-foreground"
        >
          <IdCard className="size-4 shrink-0 text-primary" />
          Tokens are shekel-denominated, non-refundable and non-withdrawable — spendable inside the partner apps in
          Shekk and with other Shekk users. Read the terms.
        </Link>
      </section>
    </AppShell>
  );
}
