import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Panel, PageTitle, Stat, Pill } from "@/components/admin/AdminUI";
import { ACCOUNTS, shekels, type AdminAccount } from "@/lib/admin";

export const Route = createFileRoute("/admin/accounts")({
  component: Accounts,
});

type Filter = "all" | "active" | "pending-kyc" | "suspended" | "premium";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "pending-kyc", label: "Pending KYC" },
  { id: "suspended", label: "Suspended" },
  { id: "premium", label: "Premium" },
];

function Accounts() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [overrides, setOverrides] = useState<Record<string, AdminAccount["status"]>>({});
  const [open, setOpen] = useState<string | null>(null);

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return ACCOUNTS.map((a) => ({ ...a, status: overrides[a.id] ?? a.status })).filter((a) => {
      if (filter === "premium" ? a.membership !== "premium" : filter !== "all" && a.status !== filter) return false;
      if (!term) return true;
      return [a.name, a.city, a.program, a.country, a.id].some((v) => v.toLowerCase().includes(term));
    });
  }, [q, filter, overrides]);

  const selected = rows.find((r) => r.id === open) ?? null;

  return (
    <>
      <PageTitle title="Accounts" subtitle="Every Shekk member, their status and their money." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Total accounts" value={String(ACCOUNTS.length)} />
        <Stat label="Verified" value={String(ACCOUNTS.filter((a) => a.status === "active").length)} tone="positive" />
        <Stat label="Pending KYC" value={String(ACCOUNTS.filter((a) => a.status === "pending-kyc").length)} />
        <Stat label="Cards issued" value={String(ACCOUNTS.filter((a) => a.cardIssued).length)} />
      </div>

      <Panel className="mt-6">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex min-w-52 flex-1 items-center gap-2 rounded-xl border border-border px-3 py-2">
            <Search className="size-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, city, program, ID"
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                filter === f.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="py-2 pr-3 font-semibold">Member</th>
                <th className="py-2 pr-3 font-semibold">Program</th>
                <th className="py-2 pr-3 font-semibold">Plan</th>
                <th className="py-2 pr-3 font-semibold">Status</th>
                <th className="py-2 pr-3 text-right font-semibold">Balance</th>
                <th className="py-2 pr-3 text-right font-semibold">Added</th>
                <th className="py-2 text-right font-semibold">Spent</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr
                  key={a.id}
                  onClick={() => setOpen(a.id)}
                  className="cursor-pointer border-b border-border last:border-0 hover:bg-muted"
                >
                  <td className="py-2.5 pr-3">
                    <p className="font-semibold">{a.name}</p>
                    <p className="text-xs text-muted-foreground">{a.city} · {a.country}</p>
                  </td>
                  <td className="py-2.5 pr-3 text-xs text-muted-foreground">{a.program}</td>
                  <td className="py-2.5 pr-3">
                    <Pill tone={a.membership === "premium" ? "primary" : "muted"}>{a.membership}</Pill>
                  </td>
                  <td className="py-2.5 pr-3">
                    <Pill tone={a.status === "active" ? "success" : a.status === "suspended" ? "danger" : "warning"}>
                      {a.status}
                    </Pill>
                  </td>
                  <td className="py-2.5 pr-3 text-right font-semibold">{shekels(a.balance)}</td>
                  <td className="py-2.5 pr-3 text-right text-muted-foreground">{shekels(a.addedTotal)}</td>
                  <td className="py-2.5 text-right text-muted-foreground">{shekels(a.spentTotal)}</td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                    No accounts match that search.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Panel>

      {selected ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-0 sm:items-center sm:p-6">
          <button type="button" aria-label="Close" onClick={() => setOpen(null)} className="absolute inset-0 cursor-default" />
          <div className="relative w-full max-w-lg rounded-t-3xl border border-border bg-card p-6 shadow-lift sm:rounded-3xl">
            <p className="font-display text-xl font-bold">{selected.name}</p>
            <p className="text-xs text-muted-foreground">
              {selected.id} · joined {selected.joinedISO} · last active {selected.lastActive}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              {[
                ["Balance", shekels(selected.balance)],
                ["Added", shekels(selected.addedTotal)],
                ["Spent", shekels(selected.spentTotal)],
                ["Sent", shekels(selected.sentTotal)],
                ["Withdrawn", shekels(selected.withdrawnTotal)],
                ["Funding currency", selected.currency],
                ["Card", selected.cardIssued ? "Issued" : "Not issued"],
                ["Plan", selected.membership],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl bg-muted p-3">
                  <p className="text-[11px] text-muted-foreground">{k}</p>
                  <p className="font-semibold capitalize">{v}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {(["active", "pending-kyc", "suspended"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setOverrides((o) => ({ ...o, [selected.id]: s }))}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                    selected.status === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  Set {s}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setOpen(null)}
              className="mt-5 w-full rounded-2xl bg-ink px-5 py-3 text-sm font-bold text-ink-foreground"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
