import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { ArrowRight } from "lucide-react";
import { Panel, PageTitle, Stat, Bar, Pill } from "@/components/admin/AdminUI";
import { applyCatalogue, useAdminConfig } from "@/lib/admin";
import { ils, when, useAdminOverview } from "@/lib/admin-data";

export const Route = createFileRoute("/admin/")({
  component: Overview,
});

function Overview() {
  const { config } = useAdminConfig();
  const { data, isLoading, error } = useAdminOverview(true);
  const catalogue = useMemo(() => applyCatalogue(config), [config]);

  const liveServices = catalogue.flatMap((c) => c.services).filter((s) => s.status === "live").length;
  const weekly = data?.weekly ?? [];
  const maxWeek = Math.max(1, ...weekly.map((w) => Math.max(w.added, w.spent)));
  const maxCat = Math.max(1, ...(data?.categories ?? []).map((c) => c.amount));

  return (
    <>
      <PageTitle title="Overview" subtitle="Everything moving through Shekk right now." />

      {error ? (
        <Panel className="mb-4">
          <p className="text-sm text-destructive">Could not load live figures. {(error as Error).message}</p>
        </Panel>
      ) : null}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Members" value={String(data?.members ?? 0)} sub={`${data?.premium ?? 0} on Shekk+`} />
        <Stat label="Balance held" value={ils(data?.floatAgorot ?? 0)} sub={`${ils(data?.heldAgorot ?? 0)} on hold`} />
        <Stat label="Money added (all time)" value={ils(data?.addedAgorot ?? 0)} tone="positive" />
        <Stat label="Money spent" value={ils(data?.spentAgorot ?? 0)} tone="negative" />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Pending KYC" value={String(data?.pendingKyc ?? 0)} sub="Waiting on review" />
        <Stat label="Verified members" value={String(data?.verified ?? 0)} tone="positive" />
        <Stat label="Cards issued" value={String(data?.cardsIssued ?? 0)} />
        <Stat label="Live services" value={String(liveServices)} sub={`${catalogue.length} categories`} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Panel title="Money in vs out — 12 weeks" className="lg:col-span-2">
          {weekly.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              {isLoading ? "Loading…" : "No ledger movement yet."}
            </p>
          ) : (
            <>
              <div className="flex h-48 items-end gap-2">
                {weekly.map((w) => (
                  <div key={w.label} className="flex flex-1 flex-col items-center gap-1">
                    <div className="flex h-40 w-full items-end justify-center gap-1">
                      <div
                        className="w-1/2 rounded-t bg-primary"
                        style={{ height: `${(w.added / maxWeek) * 100}%` }}
                        title={`Added ${ils(w.added)}`}
                      />
                      <div
                        className="w-1/2 rounded-t bg-muted-foreground/40"
                        style={{ height: `${(w.spent / maxWeek) * 100}%` }}
                        title={`Spent ${ils(w.spent)}`}
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
            </>
          )}
        </Panel>

        <Panel title="Spend by category">
          {(data?.categories ?? []).length === 0 ? (
            <p className="py-6 text-sm text-muted-foreground">No spending recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {data!.categories.map((c) => (
                <div key={c.label}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-semibold">{c.label}</span>
                    <span className="text-muted-foreground">{ils(c.amount)}</span>
                  </div>
                  <Bar value={c.amount} max={maxCat} />
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      <Panel
        title="Latest ledger entries"
        className="mt-4"
        action={
          <Link to="/admin/money" className="flex items-center gap-1 text-xs font-semibold text-primary">
            Money flow <ArrowRight className="size-3.5" />
          </Link>
        }
      >
        <div className="divide-y divide-border">
          {(data?.recent ?? []).length === 0 ? (
            <p className="py-6 text-sm text-muted-foreground">
              {isLoading ? "Loading…" : "Nothing has moved through the ledger yet."}
            </p>
          ) : (
            data!.recent.slice(0, 10).map((t) => (
              <div key={t.id} className="flex items-center gap-3 py-2.5">
                <span className="text-lg">{t.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{t.merchant}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.name} · {t.category} · {when(t.createdISO)}
                  </p>
                </div>
                <Pill tone={t.direction === "credit" ? "success" : "muted"}>
                  {t.direction === "credit" ? "+" : "−"}
                  {ils(t.amountAgorot)}
                </Pill>
              </div>
            ))
          )}
        </div>
      </Panel>
    </>
  );
}
