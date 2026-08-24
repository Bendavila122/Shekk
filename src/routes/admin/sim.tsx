import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Panel, PageTitle, Stat, Pill, Toggle } from "@/components/admin/AdminUI";
import {
  adminSaveSimPlan,
  adminSaveSimProvider,
  adminSimOverview,
  adminSyncSimProvider,
} from "@/lib/sim.functions";
import { money, type FulfilmentMode } from "@/lib/sim";

export const Route = createFileRoute("/admin/sim")({
  component: SimConsole,
});

const MODES: FulfilmentMode[] = ["disabled", "affiliate", "voucher", "api"];

function SimConsole() {
  const qc = useQueryClient();
  const overview = useServerFn(adminSimOverview);
  const saveProvider = useServerFn(adminSaveSimProvider);
  const savePlan = useServerFn(adminSaveSimPlan);
  const sync = useServerFn(adminSyncSimProvider);
  const [notice, setNotice] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const query = useQuery({
    queryKey: ["admin", "sim"],
    queryFn: () => overview(),
    staleTime: 15_000,
  });

  const invalidate = () => void qc.invalidateQueries({ queryKey: ["admin", "sim"] });

  const providerMutation = useMutation({
    mutationFn: (v: { id: string; mode?: FulfilmentMode; affiliateUrlTemplate?: string | null; active?: boolean }) =>
      saveProvider({ data: v }),
    onSuccess: invalidate,
    onError: (e) => setNotice((e as Error).message),
  });

  const planMutation = useMutation({
    mutationFn: (v: { id: string; rankBoost?: number; featured?: boolean; active?: boolean }) => savePlan({ data: v }),
    onSuccess: invalidate,
    onError: (e) => setNotice((e as Error).message),
  });

  const syncMutation = useMutation({
    mutationFn: (providerId: string) => sync({ data: { providerId } }),
    onSuccess: (r) => {
      setNotice(r.ok ? `Synced ${r.synced} plans.` : `Sync unavailable — ${r.detail}`);
      invalidate();
    },
    onError: (e) => setNotice((e as Error).message),
  });

  const providers = query.data?.providers ?? [];
  const plans = query.data?.plans ?? [];
  const clicks = query.data?.clicks ?? [];
  const adapters = query.data?.adapters ?? [];

  const liveProviders = providers.filter((p) => p.mode === "affiliate" && p.affiliateUrlTemplate).length;
  const planName = useMemo(() => new Map(plans.map((p) => [p.id, p.name])), [plans]);

  return (
    <>
      <PageTitle title="SIM & eSIM" subtitle="Providers, plans and outbound handoffs." />

      {notice ? (
        <Panel className="mb-4">
          <p className="text-sm">{notice}</p>
        </Panel>
      ) : null}

      {query.error ? (
        <Panel className="mb-4">
          <p className="text-sm text-destructive">{(query.error as Error).message}</p>
        </Panel>
      ) : null}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Providers" value={String(providers.length)} sub={`${liveProviders} with a partner link`} />
        <Stat label="Plans" value={String(plans.length)} sub={`${plans.filter((p) => p.active).length} live`} />
        <Stat label="Handoffs" value={String(clicks.length)} sub="Most recent 50" />
        <Stat
          label="Affiliate clicks"
          value={String(clicks.filter((c) => c.affiliate).length)}
          sub="Tracked partner links"
        />
      </div>

      <Panel title="Providers" className="mt-6">
        <div className="space-y-4">
          {providers.map((p) => (
            <div key={p.id} className="rounded-xl border border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">
                    {p.name} <span className="text-muted-foreground">· {p.id}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{p.blurb}</p>
                </div>
                <div className="flex items-center gap-2">
                  {p.mode === "affiliate" && !p.affiliateUrlTemplate ? (
                    <Pill tone="warning">Affiliate mode, no link</Pill>
                  ) : (
                    <Pill tone={p.mode === "affiliate" ? "success" : "muted"}>{p.mode}</Pill>
                  )}
                  <Toggle
                    label="Active"
                    checked={p.active}
                    onChange={(v) => providerMutation.mutate({ id: p.id, active: v })}
                  />
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {MODES.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => providerMutation.mutate({ id: p.id, mode: m })}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                      p.mode === m ? "border-primary bg-primary text-primary-foreground" : "border-border"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              <div className="mt-3">
                <label className="block text-xs font-semibold text-muted-foreground" htmlFor={`aff-${p.id}`}>
                  Affiliate URL template — use {"{sub}"} for our click id and {"{plan}"} for the provider plan id
                </label>
                <div className="mt-1 flex gap-2">
                  <input
                    id={`aff-${p.id}`}
                    defaultValue={p.affiliateUrlTemplate ?? ""}
                    placeholder="https://partner.example.com/il?aff=xxxx&sub={sub}"
                    onChange={(e) => setDrafts((d) => ({ ...d, [p.id]: e.target.value }))}
                    className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      providerMutation.mutate({ id: p.id, affiliateUrlTemplate: drafts[p.id] ?? p.affiliateUrlTemplate })
                    }
                    className="rounded-lg bg-ink px-3 py-2 text-xs font-semibold text-ink-foreground"
                  >
                    Save link
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Members only see a partner handoff when the mode is <b>affiliate</b> and a link is saved. Otherwise
                  Shekk says plainly that it isn't purchasable here and opens the provider's own site.
                </p>
              </div>

              <div className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => syncMutation.mutate(p.id)}
                  disabled={syncMutation.isPending}
                  className="rounded-lg border border-border px-3 py-2 text-xs font-semibold"
                >
                  Sync catalogue
                </button>
                {(() => {
                  const a = adapters.find((x) => x.id === p.id);
                  if (!a) return <Pill tone="muted">No API adapter</Pill>;
                  return a.configured ? (
                    <Pill tone="success">Adapter configured</Pill>
                  ) : (
                    <Pill tone="warning">Adapter needs credentials</Pill>
                  );
                })()}
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Plans" className="mt-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-xs">
            <thead className="text-muted-foreground">
              <tr>
                <th className="py-2">Plan</th>
                <th className="py-2">Provider</th>
                <th className="py-2">Data</th>
                <th className="py-2">Number</th>
                <th className="py-2">Price</th>
                <th className="py-2">Source</th>
                <th className="py-2">Boost</th>
                <th className="py-2">Featured</th>
                <th className="py-2">Live</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="py-2 pr-3 font-semibold">{p.name}</td>
                  <td className="py-2 pr-3">{p.providerId}</td>
                  <td className="py-2 pr-3">
                    {p.unlimited ? "Unlimited" : p.dataMb ? `${Math.round(p.dataMb / 1024)} GB` : "—"}
                  </td>
                  <td className="py-2 pr-3">
                    {p.phoneNumberIncluded ? <Pill tone="success">Yes</Pill> : <Pill tone="muted">No</Pill>}
                  </td>
                  <td className="py-2 pr-3">
                    {p.displayPriceLabel ?? money(p.displayPriceMinor, p.currency)}
                    <span className="text-muted-foreground"> {p.displayPeriodLabel ?? ""}</span>
                  </td>
                  <td className="py-2 pr-3">
                    <Pill tone={p.source === "api" ? "success" : "muted"}>{p.source}</Pill>
                  </td>
                  <td className="py-2 pr-3">
                    <input
                      type="number"
                      defaultValue={p.rankBoost}
                      min={-10}
                      max={10}
                      onBlur={(e) => {
                        const v = Number(e.target.value);
                        if (v !== p.rankBoost) planMutation.mutate({ id: p.id, rankBoost: v });
                      }}
                      className="w-16 rounded-lg border border-border bg-background px-2 py-1"
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <Toggle
                      label=""
                      checked={p.featured}
                      onChange={(v) => planMutation.mutate({ id: p.id, featured: v })}
                    />
                  </td>
                  <td className="py-2">
                    <Toggle label="" checked={p.active} onChange={(v) => planMutation.mutate({ id: p.id, active: v })} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">
          Plans marked <b>manual</b> are curated by hand and shown to members as indicative pricing. Only a live provider
          sync sets a plan to <b>api</b>. Never tick "Number" unless the provider confirms an Israeli number is included.
        </p>
      </Panel>

      <Panel title="Recent handoffs" className="mt-6">
        {clicks.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No outbound clicks yet.</p>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="text-muted-foreground">
              <tr>
                <th className="py-2">When</th>
                <th className="py-2">Provider</th>
                <th className="py-2">Plan</th>
                <th className="py-2">Kind</th>
                <th className="py-2">Member</th>
              </tr>
            </thead>
            <tbody>
              {clicks.map((c) => (
                <tr key={c.id as string} className="border-t border-border">
                  <td className="py-2 pr-3">{new Date(c.created_at as string).toLocaleString("en-GB")}</td>
                  <td className="py-2 pr-3">{c.provider_id as string}</td>
                  <td className="py-2 pr-3">{planName.get(c.plan_id as string) ?? "—"}</td>
                  <td className="py-2 pr-3">
                    {c.affiliate ? <Pill tone="success">affiliate</Pill> : <Pill tone="muted">site link</Pill>}
                  </td>
                  <td className="py-2">{c.user_id ? "signed in" : "anonymous"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
    </>
  );
}
