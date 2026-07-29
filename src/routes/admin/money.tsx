import { createFileRoute } from "@tanstack/react-router";
import { Panel, PageTitle, Stat, Bar, Pill } from "@/components/admin/AdminUI";
import { CURRENCIES } from "@/lib/currencies";
import { ils, minor, when, useAdminOverview } from "@/lib/admin-data";

export const Route = createFileRoute("/admin/money")({
  component: Money,
});

function Money() {
  const { data, isLoading } = useAdminOverview(true);

  const funding = data?.fundingByCurrency ?? [];
  const maxCurrency = Math.max(1, ...funding.map((f) => f.shekelsAgorot));
  const weekly = data?.weekly ?? [];
  const maxWeek = Math.max(1, ...weekly.map((w) => w.added));
  const flag = (code: string) => CURRENCIES.find((c) => c.code === code)?.flag ?? "🌍";

  return (
    <>
      <PageTitle title="Money flow" subtitle="Every shekel that has entered, moved or left the ledger." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Stat label="Added" value={ils(data?.addedAgorot ?? 0)} sub="Settled top ups" tone="positive" />
        <Stat label="Spent" value={ils(data?.spentAgorot ?? 0)} sub="Card & in-app" tone="negative" />
        <Stat label="Balance held" value={ils(data?.floatAgorot ?? 0)} sub="Safeguarded with partner bank" />
        <Stat label="On hold" value={ils(data?.heldAgorot ?? 0)} sub="Open authorisations" />
        <Stat label="Top ups settled" value={String(funding.reduce((n, f) => n + f.count, 0))} />
        <Stat label="Currencies used" value={String(funding.length)} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Panel title="Funding currency mix">
          {funding.length === 0 ? (
            <p className="py-6 text-sm text-muted-foreground">
              {isLoading ? "Loading…" : "No settled top ups yet."}
            </p>
          ) : (
            <div className="space-y-3">
              {funding.map((c) => (
                <div key={c.code}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-semibold">
                      {flag(c.code)} {c.code} · {c.count} top up{c.count === 1 ? "" : "s"}
                    </span>
                    <span className="text-muted-foreground">
                      {minor(c.code, c.minor)} → {ils(c.shekelsAgorot)}
                    </span>
                  </div>
                  <Bar value={c.shekelsAgorot} max={maxCurrency} />
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Weekly money added">
          {weekly.length === 0 ? (
            <p className="py-6 text-sm text-muted-foreground">Nothing yet.</p>
          ) : (
            <div className="flex h-40 items-end gap-1.5">
              {weekly.map((w) => (
                <div key={w.label} className="flex flex-1 flex-col items-center gap-1">
                  <div className="w-full rounded-t bg-primary" style={{ height: `${(w.added / maxWeek) * 130}px` }} />
                  <span className="text-[10px] text-muted-foreground">{w.label}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      <Panel title="Live ledger — all members" className="mt-4">
        <div className="divide-y divide-border">
          {(data?.recent ?? []).length === 0 ? (
            <p className="py-6 text-sm text-muted-foreground">
              {isLoading ? "Loading…" : "The ledger is empty."}
            </p>
          ) : (
            data!.recent.map((t) => (
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
