import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowUpRight, Plus, IdCard, Users, ChevronRight, QrCode, Search, Grid3X3 } from "lucide-react";
import { AppShell, Card, ReverifyBanner } from "@/components/AppShell";
import { QRCode } from "@/components/QRCode";
import { useApp } from "@/lib/store";
import { useOnboardedGate } from "@/lib/useOnboardedGate";
import { ils, usdRef } from "@/lib/mock";
import { HOME_SECTIONS, STATUS_LABEL, serviceLinkProps, type Service } from "@/lib/services";
import { ServiceLogo } from "@/components/ServiceLogo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Home · ShekelPay" },
      {
        name: "description",
        content:
          "Your Israeli phone, inside your phone: Wolt, Gett, Rav-Kav, Israel Railways, Go-To and more — all paid with shekel tokens.",
      },
      { property: "og:title", content: "Home · ShekelPay" },
      { property: "og:description", content: "One home screen for every Israeli app a gap-year student needs." },
    ],
  }),
  component: HomeScreen,
});

function AppIcon({ service }: { service: Service }) {
  return (
    <Link
      {...serviceLinkProps(service)}
      className="tap group flex flex-col items-center gap-1.5"
    >
      <span className="relative">
        <ServiceLogo service={service} size={58} className="rounded-[1.15rem] shadow-card" />
        {service.status !== "live" ? (
          <span className="absolute -right-1 -top-1 rounded-full bg-ink px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-ink-foreground">
            {service.status === "integrating" ? "soon" : "info"}
          </span>
        ) : null}
      </span>
      <span className="line-clamp-2 text-center text-[11px] font-medium leading-tight text-foreground">
        {service.name}
      </span>
    </Link>
  );
}

function HomeScreen() {
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

  const firstName = (state.name || "there").split(" ")[0];

  return (
    <AppShell>
      {/* Status strip + wallet */}
      <div className="bg-ink px-5 pb-8 pt-6 text-ink-foreground">
        <p className="text-xs uppercase tracking-widest opacity-60">Shalom, {firstName}</p>
        <div className="mt-3 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-widest opacity-60">Token balance</p>
            <p className="font-display text-4xl font-bold leading-tight">{ils(state.balance)}</p>
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

      {/* Search into the full catalogue */}
      <div className="-mt-5 px-4">
        <Link
          to="/explore"
          className="tap flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground shadow-card"
        >
          <Search className="size-4 shrink-0" />
          Search apps, guides and services
        </Link>
      </div>

      {/* Springboard */}
      <div className="space-y-6 px-4 pt-6">
        {HOME_SECTIONS.map((section) => (
          <section key={section.label}>
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold">{section.label}</h2>
                <p className="text-[11px] text-muted-foreground">{section.hint}</p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-x-2 gap-y-5 sm:grid-cols-5 lg:grid-cols-8">
              {section.services.map((s) => (
                <AppIcon key={s.id} service={s} />
              ))}
            </div>
          </section>
        ))}

        <Link
          to="/explore"
          className="tap flex items-center justify-between rounded-2xl bg-muted px-4 py-3 text-sm font-semibold"
        >
          <span className="flex items-center gap-2">
            <Grid3X3 className="size-4 text-primary" /> All apps &amp; guides
          </span>
          <ChevronRight className="size-4 text-muted-foreground" />
        </Link>

        <p className="text-center text-[11px] text-muted-foreground">
          Tap a logo and it opens inside ShekelPay. You never pay the partner directly — we do, and the shekel-token
          equivalent comes off your balance. {STATUS_LABEL.integrating} apps open their guide for now.
        </p>
      </div>

      {/* Paying people */}
      <section className="px-4 pt-6">
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
            <Link to="/social" className="tap rounded-xl bg-muted px-2 py-2.5 text-center text-xs font-semibold">
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

      {/* Activity */}
      <section className="px-4 pb-6 pt-5">
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
            state.txns.slice(0, 6).map((t) => (
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
