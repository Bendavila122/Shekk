import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowUpRight, Plus, ScanLine, IdCard } from "lucide-react";
import { AppShell, Card, ReverifyBanner } from "@/components/AppShell";
import { QRCode } from "@/components/QRCode";
import { useApp } from "@/lib/store";
import { useOnboardedGate } from "@/lib/useOnboardedGate";
import { ils, usdRef } from "@/lib/mock";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pay · ShekelPay" },
      {
        name: "description",
        content: "Show your pay code, check your shekel credits and see every spend as a clean statement line.",
      },
      { property: "og:title", content: "Pay · ShekelPay" },
      { property: "og:description", content: "One code to pay anywhere your program goes." },
    ],
  }),
  component: PayTab,
});

function PayTab() {
  const ready = useOnboardedGate();
  const { state } = useApp();
  const [mode, setMode] = useState<"show" | "scan">("show");

  if (!ready) {
    return (
      <AppShell>
        <div className="flex h-[70vh] items-center justify-center text-sm text-muted-foreground">Loading…</div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="bg-ink px-5 pb-10 pt-6 text-ink-foreground">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest opacity-60">Credit balance</p>
            <p className="font-display text-4xl font-bold">{ils(state.balance)}</p>
            <p className="text-xs opacity-60">≈ {usdRef(state.balance)} reference value</p>
          </div>
          <Link
            to="/topup"
            className="tap flex items-center gap-1.5 rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground"
          >
            <Plus className="size-4" /> Top up
          </Link>
        </div>
      </div>

      <div className="-mt-6">
        <div className="mx-4 rounded-3xl border border-border bg-card p-4 shadow-card">
          <div className="mb-4 grid grid-cols-2 gap-1 rounded-2xl bg-muted p-1">
            {(["show", "scan"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`tap rounded-xl py-2 text-sm font-semibold ${
                  mode === m ? "bg-card text-foreground shadow-card" : "text-muted-foreground"
                }`}
              >
                {m === "show" ? "Show my code" : "Scan to pay"}
              </button>
            ))}
          </div>

          {mode === "show" ? (
            <div className="flex flex-col items-center">
              <QRCode value={`shekelpay:${state.name || "student"}:${state.cohort}`} className="h-64 w-64" />
              <p className="mt-3 text-sm font-semibold">{state.name || "Your"} · pay code</p>
              <p className="text-xs text-muted-foreground">Merchant scans this. No cash, no cards, no shuk math.</p>
            </div>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-muted/50">
              <ScanLine className="size-10 text-primary" />
              <p className="text-sm font-semibold">Camera would open here</p>
              <p className="max-w-[16rem] text-center text-xs text-muted-foreground">
                Point at a merchant code to pay from credits. Prototype — scanning is mocked.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-5">
        <ReverifyBanner />
      </div>

      <section className="px-4 pb-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-base font-semibold">Activity</h2>
          <Link to="/me" className="text-xs font-semibold text-primary">
            Full history <ArrowUpRight className="inline size-3" />
          </Link>
        </div>
        <Card className="divide-y divide-border p-0">
          {state.txns.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">
              Nothing yet — top up credits and your first spend shows here.
            </p>
          ) : (
            state.txns.slice(0, 8).map((t) => (
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
          Credits are shekel-denominated, non-refundable and non-withdrawable — spendable in-app and with partner
          merchants. Read the terms.
        </Link>
      </section>
    </AppShell>
  );
}
