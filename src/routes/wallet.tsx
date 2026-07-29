import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, ArrowLeftRight, ArrowUpRight, ArrowDownLeft, CreditCard, ChevronRight, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { AppShell, Card, ReverifyBanner } from "@/components/AppShell";
import { ShekkCardFace } from "@/components/ShekkCard";
import { useApp } from "@/lib/store";
import { useOnboardedGate } from "@/lib/useOnboardedGate";
import { ils } from "@/lib/mock";
import { refIn } from "@/lib/currencies";

export const Route = createFileRoute("/wallet")({
  head: () => ({
    meta: [
      { title: "Wallet · Shekk" },
      {
        name: "description",
        content:
          "Your Shekk shekel account: available balance, add money, exchange currency, send and request, and every card transaction in one place.",
      },
      { property: "og:title", content: "Wallet · Shekk" },
      { property: "og:description", content: "One shekel account for everything you spend in Israel." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: WalletScreen,
});

const ACTIONS = [
  { to: "/topup", label: "Add money", Icon: Plus },
  { to: "/exchange", label: "Exchange", Icon: ArrowLeftRight },
  { to: "/social", label: "Send", Icon: ArrowUpRight },
  { to: "/social", label: "Request", Icon: ArrowDownLeft },
  { to: "/card", label: "Card", Icon: CreditCard },
] as const;

function WalletScreen() {
  const ready = useOnboardedGate();
  const { state, isPremium, held, available } = useApp();
  const [hidden, setHidden] = useState(state.settings.hideBalance);

  const thisMonth = useMemo(
    () => state.txns.filter((t) => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0),
    [state.txns],
  );

  if (!ready) {
    return (
      <AppShell>
        <div className="p-6 text-sm text-muted-foreground">Loading…</div>
      </AppShell>
    );
  }

  const firstName = state.name.split(" ")[0] || "Shekk member";

  return (
    <AppShell>
      {/* Balance header */}
      <section className="px-4 pt-6">
        <div className="grad-balance relative overflow-hidden rounded-[1.75rem] px-5 pb-5 pt-6 text-ink-foreground shadow-lift">
          <span className="card-sheen pointer-events-none absolute inset-0" aria-hidden />
          <div className="relative">
            <div className="flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-widest opacity-70">Shekk balance</p>
              <button
                onClick={() => setHidden((v) => !v)}
                aria-label={hidden ? "Show balance" : "Hide balance"}
                className="tap-flat rounded-full bg-ink-foreground/10 p-1.5"
              >
                {hidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <p className="mt-1 font-display text-5xl font-bold leading-none tracking-tight">
              {hidden ? "₪ ••••" : ils(state.balance)}
            </p>
            <p className="mt-2 text-xs opacity-70">
              {held > 0
                ? `${hidden ? "••••" : ils(available)} available · ${hidden ? "••••" : ils(held)} reserved`
                : `Available now · ≈ ${hidden ? "••••" : refIn(state.settings.payCurrency, state.balance)}`}
            </p>

            <div className="mt-5 grid grid-cols-5 gap-1.5">
              {ACTIONS.map(({ to, label, Icon }) => (
                <Link
                  key={label}
                  to={to}
                  className="tap-icon flex flex-col items-center gap-1.5 rounded-2xl bg-ink-foreground/10 py-2.5"
                >
                  <Icon className="size-[18px]" strokeWidth={2.4} />
                  <span className="text-[9.5px] font-semibold leading-none">{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Card strip */}
      <section className="px-4 pt-4">
        <Link to="/card" className="tap block">
          <Card className="flex items-center gap-4 p-4">
            <div className="w-24 shrink-0">
              <ShekkCardFace
                name={firstName}
                last4={state.card.last4}
                expiry={state.card.expiry}
                balance={state.balance}
                frozen={state.card.frozen}
                className="!rounded-xl !p-2 !shadow-card"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">Shekk Card</p>
              <p className="text-xs text-muted-foreground">
                {state.card.issued
                  ? state.card.frozen
                    ? "Frozen · tap to unfreeze"
                    : `Mastercard •••• ${state.card.last4} · in Apple Pay`
                  : isPremium
                    ? "Ready to issue"
                    : "Included with Shekk Premium"}
              </p>
            </div>
            <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
          </Card>
        </Link>
      </section>

      {/* Spend summary */}
      <section className="grid grid-cols-2 gap-3 px-4 pt-3">
        <Card className="p-4">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Spent this month</p>
          <p className="font-display text-2xl font-bold">{ils(thisMonth)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Membership</p>
          <p className="font-display text-2xl font-bold">{isPremium ? "Premium" : "Free"}</p>
          <Link to="/membership" className="text-[11px] font-semibold text-primary">
            {isPremium ? "See benefits" : "Upgrade"}
          </Link>
        </Card>
      </section>

      {/* Recent activity */}
      <section className="px-4 pb-8 pt-5">
        <div className="mb-3 flex items-baseline justify-between px-1">
          <h2 className="font-display text-lg font-bold tracking-tight">Recent activity</h2>
          <Link to="/activity" className="tap-flat text-[12px] font-semibold text-primary">
            See all
          </Link>
        </div>
        <Card className="divide-y divide-border p-0">
          {state.txns.slice(0, 7).map((t) => (
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
                <p className="text-[11px] text-muted-foreground">
                  {refIn(state.settings.payCurrency, Math.abs(t.amount))}
                </p>
              </div>
            </div>
          ))}
        </Card>

        <p className="mt-4 flex items-start gap-2 px-1 text-[11px] leading-relaxed text-muted-foreground">
          <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
          Your shekel account and card are provided by Shekk's regulated banking and issuing partners. Shekk builds the
          app.{" "}
          <Link to="/terms" className="font-semibold underline">
            Terms
          </Link>
        </p>
      </section>

      <ReverifyBanner />
      <div className="pb-4" />
    </AppShell>
  );
}
