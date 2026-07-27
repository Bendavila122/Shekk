import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowUpRight, Plus, IdCard, Users, ChevronRight, QrCode } from "lucide-react";
import { AppShell, Card, ReverifyBanner } from "@/components/AppShell";
import { QRCode } from "@/components/QRCode";
import { useApp } from "@/lib/store";
import { useOnboardedGate } from "@/lib/useOnboardedGate";
import { ils, usdRef } from "@/lib/mock";
import { FEATURED_SERVICES, serviceLinkProps } from "@/lib/services";
import { ServiceLogo } from "@/components/ServiceLogo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Wallet · ShekelPay" },
      {
        name: "description",
        content:
          "Your shekel tokens, the Israeli apps you actually use — Wolt, Gett, Rav-Kav, Go-To, Israel Railways — and one-tap transfers to friends.",
      },
      { property: "og:title", content: "Wallet · ShekelPay" },
      { property: "og:description", content: "Tokens in, apps inside, friends paid in a tap." },
    ],
  }),
  component: PayTab,
});

function PayTab() {
  const ready = useOnboardedGate();
  const { state } = useApp();
  const [showCode, setShowCode] = useState(false);

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
            <p className="text-xs uppercase tracking-widest opacity-60">Token balance</p>
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

      <div className="-mt-6 px-4">
        <div className="rounded-3xl border border-border bg-card p-4 shadow-card">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-base font-semibold">Your apps</h2>
            <Link to="/explore" className="text-xs font-semibold text-primary">
              All services <ChevronRight className="inline size-3" />
            </Link>
          </div>
          <p className="mb-3 text-xs text-muted-foreground">
            Tap a logo and it opens straight into that app, inside ShekelPay. You never pay them directly — we do.
          </p>
          <div className="grid grid-cols-5 gap-2">
            {FEATURED_SERVICES.map((s) => (
              <Link
                key={s.id}
                {...serviceLinkProps(s)}
                className="tap flex flex-col items-center gap-1.5 rounded-2xl bg-muted px-1 py-3"
              >
                <ServiceLogo service={s} size={36} />
                <span className="text-center text-[10px] font-semibold leading-tight">{s.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <section className="px-4 pt-4">
        <Card className="space-y-3">
          <h2 className="text-base font-semibold">How paying works</h2>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary-soft text-[11px] font-bold text-primary">1</span>
              You preload tokens once with Apple Pay.
            </li>
            <li className="flex gap-2">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary-soft text-[11px] font-bold text-primary">2</span>
              Order inside Wolt, Gett, Rav-Kav, Go-To or Israel Railways — <span className="font-medium text-foreground">ShekelPay pays them</span>, not your card.
            </li>
            <li className="flex gap-2">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary-soft text-[11px] font-bold text-primary">3</span>
              The shekel-token equivalent comes straight off your balance and lands in Activity.
            </li>
          </ol>
        </Card>
      </section>

      <section className="px-4 pt-4">
        <Card className="p-0">
          <div className="flex items-center gap-3 p-4">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <Users className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">Paying people</p>
              <p className="text-xs text-muted-foreground">
                Send tokens to friends on ShekelPay or split a bill with your cohort.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 border-t border-border p-3">
            <Link
              to="/social"
              className="tap rounded-xl bg-primary px-2 py-2.5 text-center text-xs font-semibold text-primary-foreground"
            >
              Send tokens
            </Link>
            <Link
              to="/social"
              className="tap rounded-xl bg-muted px-2 py-2.5 text-center text-xs font-semibold"
            >
              Split a bill
            </Link>
            <button
              onClick={() => setShowCode((v) => !v)}
              className="tap flex items-center justify-center gap-1 rounded-xl bg-muted px-2 py-2.5 text-xs font-semibold"
            >
              <QrCode className="size-4" /> My code
            </button>
          </div>
          {showCode ? (
            <div className="flex flex-col items-center border-t border-border p-4">
              <QRCode value={`shekelpay:${state.name || "student"}:${state.cohort}`} className="h-36 w-36" />
              <p className="mt-2 text-xs font-semibold">{state.name || "Your"} · friend code</p>
              <p className="text-center text-[11px] text-muted-foreground">
                A friend scans this to send you tokens. It isn't a merchant payment code.
              </p>
            </div>
          ) : null}
        </Card>
      </section>

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
              Nothing yet — top up tokens and your first spend shows here.
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
          Tokens are shekel-denominated, non-refundable and non-withdrawable — spendable inside the partner apps in
          ShekelPay and with other ShekelPay users. Read the terms.
        </Link>
      </section>
    </AppShell>
  );
}
