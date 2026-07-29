import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Panel, PageTitle, Stat, Pill } from "@/components/admin/AdminUI";
import {
  ils,
  when,
  useAdminActions,
  useAdminMemberDetail,
  useAdminMembers,
} from "@/lib/admin-data";

export const Route = createFileRoute("/admin/accounts")({
  component: Accounts,
});

type Filter = "all" | "active" | "pending-kyc" | "suspended" | "premium";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "active", label: "Verified" },
  { id: "pending-kyc", label: "Pending KYC" },
  { id: "suspended", label: "Frozen" },
  { id: "premium", label: "Shekk+" },
];

const PENDING = ["submitted", "in_review", "pending"];

function kycTone(status: string) {
  if (status === "approved" || status === "verified") return "success" as const;
  if (status === "rejected") return "danger" as const;
  if (PENDING.includes(status)) return "warning" as const;
  return "muted" as const;
}

function Accounts() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState<string | null>(null);

  const { data: members = [], isLoading, error } = useAdminMembers(true);

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return members.filter((a) => {
      if (filter === "premium" && a.membership !== "premium") return false;
      if (filter === "active" && !(a.kycStatus === "approved" || a.kycStatus === "verified")) return false;
      if (filter === "pending-kyc" && !PENDING.includes(a.kycStatus)) return false;
      if (filter === "suspended" && a.accountStatus === "active") return false;
      if (!term) return true;
      return [a.name, a.email, a.city, a.program, a.country, a.userId]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term));
    });
  }, [members, q, filter]);

  return (
    <>
      <PageTitle title="Accounts" subtitle="Every Shekk member, their status and their money — live from the backend." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Total accounts" value={String(members.length)} />
        <Stat
          label="Verified"
          value={String(members.filter((a) => a.kycStatus === "approved" || a.kycStatus === "verified").length)}
          tone="positive"
        />
        <Stat label="Pending KYC" value={String(members.filter((a) => PENDING.includes(a.kycStatus)).length)} />
        <Stat label="Cards issued" value={String(members.filter((a) => a.cardIssued).length)} />
      </div>

      <Panel className="mt-6">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex min-w-52 flex-1 items-center gap-2 rounded-xl border border-border px-3 py-2">
            <Search className="size-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, email, city, program"
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
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="py-2 pr-3 font-semibold">Member</th>
                <th className="py-2 pr-3 font-semibold">Program</th>
                <th className="py-2 pr-3 font-semibold">Plan</th>
                <th className="py-2 pr-3 font-semibold">KYC</th>
                <th className="py-2 pr-3 font-semibold">Account</th>
                <th className="py-2 pr-3 text-right font-semibold">Balance</th>
                <th className="py-2 pr-3 text-right font-semibold">Added</th>
                <th className="py-2 text-right font-semibold">Spent</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr
                  key={a.userId}
                  onClick={() => setOpen(a.userId)}
                  className="cursor-pointer border-b border-border last:border-0 hover:bg-muted"
                >
                  <td className="py-2.5 pr-3">
                    <p className="font-semibold">{a.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.email ?? "no email"} · joined {when(a.joinedISO)}
                    </p>
                  </td>
                  <td className="py-2.5 pr-3 text-xs text-muted-foreground">
                    {a.program ?? "—"}
                    {a.city ? ` · ${a.city}` : ""}
                  </td>
                  <td className="py-2.5 pr-3">
                    <Pill tone={a.membership === "premium" ? "primary" : "muted"}>
                      {a.membership === "premium" ? "Shekk+" : "Shekk"}
                    </Pill>
                  </td>
                  <td className="py-2.5 pr-3">
                    <Pill tone={kycTone(a.kycStatus)}>{a.kycStatus.replace(/_/g, " ")}</Pill>
                  </td>
                  <td className="py-2.5 pr-3">
                    <Pill tone={a.accountStatus === "active" ? "success" : a.accountStatus === "none" ? "muted" : "danger"}>
                      {a.accountStatus}
                    </Pill>
                  </td>
                  <td className="py-2.5 pr-3 text-right font-semibold">{ils(a.balanceAgorot)}</td>
                  <td className="py-2.5 pr-3 text-right text-muted-foreground">{ils(a.addedAgorot)}</td>
                  <td className="py-2.5 text-right text-muted-foreground">{ils(a.spentAgorot)}</td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                    {isLoading
                      ? "Loading the member book…"
                      : error
                        ? "Could not load accounts."
                        : members.length === 0
                          ? "No members have signed up yet."
                          : "No accounts match that search."}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Panel>

      {open ? <MemberDrawer userId={open} onClose={() => setOpen(null)} /> : null}
    </>
  );
}

function MemberDrawer({ userId, onClose }: { userId: string; onClose: () => void }) {
  const { data, isLoading } = useAdminMemberDetail(userId);
  const { setKyc, setAccount } = useAdminActions();
  const [reason, setReason] = useState("");

  const p = data?.profile as any;
  const acct = data?.account as any;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-0 sm:items-center sm:p-6">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default" />
      <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border border-border bg-card p-6 shadow-lift sm:rounded-3xl">
        {isLoading || !data ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Loading member…</p>
        ) : (
          <>
            <p className="font-display text-xl font-bold">
              {[p?.legal_first_name, p?.legal_last_name].filter(Boolean).join(" ") || p?.email || "Member"}
            </p>
            <p className="text-xs text-muted-foreground">
              {p?.email ?? "no email"} · joined {when(p?.created_at)} · KYC {String(p?.kyc_status ?? "not_started").replace(/_/g, " ")}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              {[
                ["Balance", ils(Number(acct?.balance_agorot ?? 0))],
                ["On hold", ils(Number(acct?.held_agorot ?? 0))],
                ["Account", acct?.status ?? "none"],
                ["Program", p?.program ?? "—"],
                ["City", p?.city ?? p?.address_city ?? "—"],
                ["Country", p?.address_country ?? "—"],
                ["Funding currency", p?.preferred_currency ?? "—"],
                ["Card", p?.airwallex_cardholder_id ? "Issued" : "Not issued"],
                ["ILS account", p?.airwallex_account_status ?? "not submitted"],
              ].map(([k, v]) => (
                <div key={k as string} className="rounded-xl bg-muted p-3">
                  <p className="text-[11px] text-muted-foreground">{k}</p>
                  <p className="truncate font-semibold capitalize">{String(v).replace(/_/g, " ")}</p>
                </div>
              ))}
            </div>

            <div className="mt-5">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Review KYC</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(["in_review", "approved", "rejected"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    disabled={setKyc.isPending}
                    onClick={() => setKyc.mutate({ userId, status: s, reason: s === "rejected" ? reason || "Not eligible" : null })}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                      p?.kyc_status === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {s.replace(/_/g, " ")}
                  </button>
                ))}
              </div>
              <input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Rejection reason (optional)"
                className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>

            <div className="mt-5">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Account status</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(["active", "frozen", "closed"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    disabled={setAccount.isPending}
                    onClick={() => setAccount.mutate({ userId, status: s })}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                      acct?.status === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    Set {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Recent ledger</p>
                <div className="mt-2 divide-y divide-border">
                  {data.entries.length === 0 ? (
                    <p className="py-3 text-sm text-muted-foreground">No movement yet.</p>
                  ) : (
                    data.entries.slice(0, 10).map((e: any) => (
                      <div key={e.id} className="flex items-center gap-2 py-2 text-sm">
                        <span>{e.icon}</span>
                        <span className="min-w-0 flex-1 truncate">{e.merchant}</span>
                        <span className={e.direction === "credit" ? "font-semibold text-success" : "font-semibold"}>
                          {e.direction === "credit" ? "+" : "−"}
                          {ils(Number(e.amount_agorot))}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Top ups & documents</p>
                <div className="mt-2 divide-y divide-border">
                  {data.funding.slice(0, 5).map((f: any) => (
                    <div key={f.id} className="flex items-center gap-2 py-2 text-sm">
                      <span className="min-w-0 flex-1 truncate">
                        {f.pay_currency} {(Number(f.pay_amount_minor) / 100).toFixed(2)}
                      </span>
                      <Pill tone={f.status === "settled" ? "success" : "warning"}>{f.status}</Pill>
                    </div>
                  ))}
                  {data.documents.map((d: any) => (
                    <div key={d.id} className="flex items-center gap-2 py-2 text-sm">
                      <span className="min-w-0 flex-1 truncate capitalize">{String(d.kind).replace(/_/g, " ")}</span>
                      <Pill tone="muted">{d.status}</Pill>
                    </div>
                  ))}
                  {data.funding.length === 0 && data.documents.length === 0 ? (
                    <p className="py-3 text-sm text-muted-foreground">Nothing uploaded or funded yet.</p>
                  ) : null}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full rounded-2xl bg-ink px-5 py-3 text-sm font-bold text-ink-foreground"
            >
              Close
            </button>
          </>
        )}
      </div>
    </div>
  );
}
