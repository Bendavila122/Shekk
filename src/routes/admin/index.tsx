import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { ArrowRight } from "lucide-react";
import { Panel, PageTitle, Stat, Bar, Pill } from "@/components/admin/AdminUI";
import {
  ACCOUNTS,
  moneyTotals,
  shekels,
  spendByCategory,
  useAdminConfig,
  weeklySeries,
  applyCatalogue,
} from "@/lib/admin";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/admin/")({
  component: Overview,
});

function Overview() {
  const { config } = useAdminConfig();
  const { state } = useApp();
  const totals = useMemo(() => moneyTotals(ACCOUNTS, config), [config]);
  const series = useMemo(() => weeklySeries(), []);
  const cats = useMemo(() => spendByCategory(ACCOUNTS), []);
  const catalogue = useMemo(() => applyCatalogue(config), [config]);

  const liveServices = catalogue.flatMap((c) => c.services).filter((s) => s.status === "live").length;
  const premium = ACCOUNTS.filter((a) => a.membership === "premium").length;
  const maxWeek = Math.max(...series.map((w) => Math.max(w.added, w.spent)));

  return (
    <>
      <PageTitle title="Overview" subtitle="Everything moving through Shekk right now." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Members" value={String(ACCOUNTS.length)} sub={`${premium} on Premium`} />
        <Stat label="Balance held" value={shekels(totals.float)} sub="Across all accounts" />
        <Stat label="Money added (all time)" value={shekels(totals.added)} tone="positive" />
        <Stat label="Money spent" value={shekels(totals.spent)} tone="negative" />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="FX revenue" value={shekels(totals.fxRevenue)} sub={`${config.fxMarginFree}% / ${config.fxMarginPremium}% margin`} />
        <Stat label="Membership revenue" value={shekels(totals.membershipRevenue)} sub="Monthly run rate" />
        <Stat label="Live services" value={String(liveServices)} sub={`${catalogue.length} categories`} />
        <Stat label="Active promotions" value={String(config.promotions.filter((p) => p.active).length)} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Panel title="Money in vs out — 12 weeks" className="lg:col-span-2">
          <div className="flex h-48 items-end gap-2">
            {series.map((w) => (
              <div key={w.label} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex h-40 w-full items-end justify-center gap-1">
                  <div
                    className="w-1/2 rounded-t bg-primary"
                    style={{ height: `${(w.added / maxWeek) * 100}%` }}
                    title={`Added ${shekels(w.added)}`}
                  />
                  <div
                    className="w-1/2 rounded-t bg-muted-foreground/40"
                    style={{ height: `${(w.spent / maxWeek) * 100}%` }}
                    title={`Spent ${shekels(w.spent)}`}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">{w.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-primary" /> Added</span>
            <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-muted-foreground/40" /> Spent</span>
          </div>
        </Panel>

        <Panel title="Spend by category">
          <div className="space-y-3">
            {cats.map((c) => (
              <div key={c.label}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-semibold">{c.emoji} {c.label}</span>
                  <span className="text-muted-foreground">{shekels(c.amount)}</span>
                </div>
                <Bar value={c.amount} max={cats[0].amount} />
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel
          title="This device's account"
          action={<Pill tone="primary">Live app state</Pill>}
        >
          <p className="text-sm text-muted-foreground">
            The console reads the same store the app writes, so the signed-in demo account is visible here too.
          </p>
          <div className="mt-3 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-muted p-3">
              <p className="text-[11px] text-muted-foreground">Name</p>
              <p className="truncate text-sm font-semibold">{state.name}</p>
            </div>
            <div className="rounded-xl bg-muted p-3">
              <p className="text-[11px] text-muted-foreground">Balance</p>
              <p className="text-sm font-semibold">{shekels(state.balance)}</p>
            </div>
            <div className="rounded-xl bg-muted p-3">
              <p className="text-[11px] text-muted-foreground">Plan</p>
              <p className="text-sm font-semibold capitalize">{state.membership}</p>
            </div>
          </div>
        </Panel>

        <Panel title="Jump to">
          <div className="grid gap-2">
            {[
              { to: "/admin/money", label: "Money flow — added, converted, spent, sent, withdrawn" },
              { to: "/admin/accounts", label: "Accounts — search, KYC status, suspend" },
              { to: "/admin/apps", label: "Apps & services — add, hide, change status" },
              { to: "/admin/promotions", label: "Promotions — what surfaces in the app" },
            ].map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3 text-sm font-semibold hover:bg-muted"
              >
                {l.label}
                <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}
