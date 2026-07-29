import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Panel, PageTitle, Stat, Bar } from "@/components/admin/AdminUI";
import { ACCOUNTS, moneyTotals, shekels, useAdminConfig, weeklySeries } from "@/lib/admin";
import { CURRENCIES } from "@/lib/currencies";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/admin/money")({
  component: Money,
});

function Money() {
  const { config } = useAdminConfig();
  const { state } = useApp();
  const totals = useMemo(() => moneyTotals(ACCOUNTS, config), [config]);
  const series = useMemo(() => weeklySeries(), []);

  const byCurrency = useMemo(() => {
    const map = new Map<string, number>();
    ACCOUNTS.forEach((a) => map.set(a.currency, (map.get(a.currency) ?? 0) + a.addedTotal));
    return CURRENCIES.map((c) => ({ code: c.code, flag: c.flag, label: c.label, amount: map.get(c.code) ?? 0 })).sort(
      (a, b) => b.amount - a.amount,
    );
  }, []);

  const recent = state.txns.slice(0, 12);
  const maxCurrency = byCurrency[0]?.amount ?? 1;
  const maxWeek = Math.max(...series.map((w) => w.added));

  return (
    <>
      <PageTitle title="Money flow" subtitle="Added, converted, spent, sent and withdrawn across the book." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Stat label="Added" value={shekels(totals.added)} sub="Funded from home currency" tone="positive" />
        <Stat label="Converted" value={shekels(totals.converted)} sub="FX into shekels" />
        <Stat label="Spent" value={shekels(totals.spent)} sub="Card & in-app" tone="negative" />
        <Stat label="Sent to friends" value={shekels(totals.sent)} />
        <Stat label="Withdrawn" value={shekels(totals.withdrawn)} sub="Back to source" />
        <Stat label="Balance held" value={shekels(totals.float)} sub="Safeguarded with partner bank" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Panel title="Funding currency mix">
          <div className="space-y-3">
            {byCurrency.map((c) => (
              <div key={c.code}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-semibold">{c.flag} {c.code} · {c.label}</span>
                  <span className="text-muted-foreground">{shekels(c.amount)}</span>
                </div>
                <Bar value={c.amount} max={maxCurrency} />
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Weekly money added">
          <div className="flex h-40 items-end gap-1.5">
            {series.map((w) => (
              <div key={w.label} className="flex flex-1 flex-col items-center gap-1">
                <div className="w-full rounded-t bg-primary" style={{ height: `${(w.added / maxWeek) * 130}px` }} />
                <span className="text-[10px] text-muted-foreground">{w.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-muted p-3">
              <p className="text-[11px] text-muted-foreground">FX revenue</p>
              <p className="font-display text-lg font-bold">{shekels(totals.fxRevenue)}</p>
            </div>
            <div className="rounded-xl bg-muted p-3">
              <p className="text-[11px] text-muted-foreground">Membership revenue</p>
              <p className="font-display text-lg font-bold">{shekels(totals.membershipRevenue)}</p>
            </div>
          </div>
        </Panel>
      </div>

      <Panel title="Live ledger — this device" className="mt-4">
        <div className="divide-y divide-border">
          {recent.map((t) => (
            <div key={t.id} className="flex items-center gap-3 py-2.5">
              <span className="text-lg">{t.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{t.merchant}</p>
                <p className="text-xs text-muted-foreground">{t.category} · {t.date}</p>
              </div>
              <span className={`text-sm font-bold ${t.amount < 0 ? "text-foreground" : "text-success"}`}>
                {t.amount < 0 ? "−" : "+"}{shekels(Math.abs(t.amount))}
              </span>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}
