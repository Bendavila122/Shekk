import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Panel, PageTitle, Stat, Bar, Pill } from "@/components/admin/AdminUI";
import { useAdminConfig } from "@/lib/admin";
import { ils, useAdminMembers, useAdminOverview } from "@/lib/admin-data";
import { COMPARISON, TIERS } from "@/lib/membership";

export const Route = createFileRoute("/admin/memberships")({
  component: Memberships,
});

function Memberships() {
  const { config, update } = useAdminConfig();
  const { data: members = [], isLoading } = useAdminMembers(true);
  const { data: overview } = useAdminOverview(true);

  const premium = useMemo(() => members.filter((m) => m.membership === "premium"), [members]);
  const free = useMemo(() => members.filter((m) => m.membership === "free"), [members]);
  const conversion = Math.round((premium.length / Math.max(1, members.length)) * 100);
  const avgPremiumSpend = Math.round(premium.reduce((n, a) => n + a.spentAgorot, 0) / Math.max(1, premium.length));
  const avgFreeSpend = Math.round(free.reduce((n, a) => n + a.spentAgorot, 0) / Math.max(1, free.length));
  const monthlyRevenueGbp = premium.length * config.premiumPriceGbp;

  return (
    <>
      <PageTitle title="Memberships" subtitle="Shekk vs Shekk+ — live mix, pricing and what each plan is worth." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Shekk+ members" value={String(premium.length)} sub={`${conversion}% of the book`} />
        <Stat label="Free members" value={String(free.length)} />
        <Stat
          label="Monthly revenue"
          value={`£${monthlyRevenueGbp.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          tone="positive"
        />
        <Stat label="Cards issued" value={String(members.filter((a) => a.cardIssued).length)} />
      </div>

      <Panel title="Subscription states" className="mt-4">
        {(overview?.subscriptions ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">{isLoading ? "Loading…" : "No subscriptions yet."}</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {overview!.subscriptions.map((s) => (
              <Pill
                key={s.status}
                tone={s.status === "active" || s.status === "trialing" ? "success" : s.status === "canceled" ? "muted" : "warning"}
              >
                {s.status.replace(/_/g, " ")} · {s.count}
              </Pill>
            ))}
          </div>
        )}
      </Panel>


      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Panel title="Plan pricing & margins">
          <label className="block text-sm font-semibold">Premium price (£ / month)</label>
          <input
            type="number"
            step="0.01"
            value={config.premiumPriceGbp}
            onChange={(e) => update({ premiumPriceGbp: Number(e.target.value) || 0 })}
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold">Free FX margin (%)</label>
              <input
                type="number"
                step="0.1"
                value={config.fxMarginFree}
                onChange={(e) => update({ fxMarginFree: Number(e.target.value) || 0 })}
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold">Premium FX margin (%)</label>
              <input
                type="number"
                step="0.1"
                value={config.fxMarginPremium}
                onChange={(e) => update({ fxMarginPremium: Number(e.target.value) || 0 })}
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            These figures drive the revenue projections in this console. Rates shown to members still come from the
            live FX partner quote.
          </p>
        </Panel>

        <Panel title="Behaviour by plan">
          <div className="space-y-4">
            <div>
              <div className="mb-1 flex justify-between text-sm font-semibold">
                <span>Average spend · Premium</span>
                <span>{shekels(avgPremiumSpend)}</span>
              </div>
              <Bar value={avgPremiumSpend} max={Math.max(avgPremiumSpend, avgFreeSpend)} />
            </div>
            <div>
              <div className="mb-1 flex justify-between text-sm font-semibold">
                <span>Average spend · Free</span>
                <span>{shekels(avgFreeSpend)}</span>
              </div>
              <Bar value={avgFreeSpend} max={Math.max(avgPremiumSpend, avgFreeSpend)} />
            </div>
            <div>
              <div className="mb-1 flex justify-between text-sm font-semibold">
                <span>Premium conversion</span>
                <span>{conversion}%</span>
              </div>
              <Bar value={conversion} max={100} />
            </div>
          </div>
        </Panel>
      </div>

      <Panel title="What each plan includes" className="mt-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {TIERS.map((t) => (
            <div key={t.id} className="rounded-2xl border border-border p-4">
              <p className="font-display text-lg font-bold">{t.name}</p>
              <p className="text-xs text-muted-foreground">
                {t.id === "premium" ? `£${config.premiumPriceGbp.toFixed(2)}` : t.price} · {t.cadence}
              </p>
              <ul className="mt-3 space-y-1.5 text-sm">
                {t.perks.map((p) => (
                  <li key={p.title} className="flex gap-2">
                    <span>{p.icon}</span>
                    <span className="font-semibold">{p.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="py-2 font-semibold">Feature</th>
                <th className="py-2 font-semibold">Free</th>
                <th className="py-2 font-semibold">Premium</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row) => (
                <tr key={row.label} className="border-b border-border last:border-0">
                  <td className="py-2 font-semibold">{row.label}</td>
                  <td className="py-2 text-muted-foreground">{row.free}</td>
                  <td className="py-2 text-muted-foreground">{row.premium}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
