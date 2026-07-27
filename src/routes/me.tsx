import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgeCheck, AlertTriangle, ChevronRight, Bookmark, Receipt, Settings, FileText } from "lucide-react";
import { AppShell, Card, ReverifyBanner } from "@/components/AppShell";
import { PROGRAMS, ils, usdRef } from "@/lib/mock";
import { useApp } from "@/lib/store";
import { useOnboardedGate } from "@/lib/useOnboardedGate";

export const Route = createFileRoute("/me")({
  head: () => ({
    meta: [
      { title: "Me · ShekelPay" },
      {
        name: "description",
        content: "Verification badge, program and cohort details, order history and plain-language credit terms.",
      },
      { property: "og:title", content: "Me · ShekelPay" },
      { property: "og:description", content: "Your ShekelPay account, verification status and credit terms." },
    ],
  }),
  component: Me,
});

function Me() {
  const ready = useOnboardedGate();
  const { state, verification, daysLeft, triggerReverify, reset } = useApp();
  const program = PROGRAMS.find((p) => p.id === state.programId);

  if (!ready) return <AppShell><div className="p-6 text-sm text-muted-foreground">Loading…</div></AppShell>;

  const badge =
    verification === "verified"
      ? { label: "Verified", cls: "bg-success-soft text-success", Icon: BadgeCheck }
      : verification === "expiring"
        ? { label: "Expiring soon", cls: "bg-warning-soft text-warning-foreground", Icon: AlertTriangle }
        : { label: "Needs update", cls: "bg-warning-soft text-warning-foreground", Icon: AlertTriangle };

  return (
    <AppShell>
      <header className="bg-ink px-5 pb-8 pt-7 text-ink-foreground">
        <div className="flex items-center gap-4">
          <span className="flex size-16 items-center justify-center rounded-2xl bg-accent text-2xl font-bold text-accent-foreground">
            {(state.name || "S").slice(0, 1).toUpperCase()}
          </span>
          <div>
            <h1 className="text-2xl font-bold">{state.name || "Student"}</h1>
            <p className="text-sm opacity-70">
              {program?.name} · {state.cohort}
            </p>
          </div>
        </div>
        <div className={`mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${badge.cls}`}>
          <badge.Icon className="size-4" /> {badge.label}
          {daysLeft !== null && <span>· {daysLeft} days left</span>}
        </div>
      </header>

      <div className="space-y-4 px-4 py-5">
        <ReverifyBanner />

        <Card>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Credit balance</p>
          <p className="font-display text-3xl font-bold">{ils(state.balance)}</p>
          <p className="text-xs text-muted-foreground">≈ {usdRef(state.balance)} reference · not withdrawable</p>
        </Card>

        <Card className="p-0">
          <RowLink to="/topup" Icon={Receipt} label="Order & top-up history" hint={`${state.txns.length} records`} />
          <RowLink to="/explore/shops" Icon={Bookmark} label="Saved places & discounts" hint="7 saved" />
          <RowLink to="/explore/admin" Icon={FileText} label="Program documents & visa" hint="Student visa A/2" />
          <RowLink to="/terms" Icon={Settings} label="Full Terms & Conditions" hint="" />
        </Card>

        <Card className="space-y-2">
          <h2 className="text-base font-semibold">How your credits work</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• You buy credits — it's a purchase, not a deposit. We're not a bank and we don't hold your money.</li>
            <li>• Credits are in shekels, non-refundable and non-withdrawable.</li>
            <li>• Order through a partner app inside ShekelPay and <span className="font-medium text-foreground">we pay them</span> — your card is never charged at checkout.</li>
            <li>• We then deduct the shekel-token equivalent of that order from your preloaded balance.</li>
            <li>• Every top up shows the ShekelPay rate and the exact credits you get before you confirm.</li>
            <li>• Re-verify your ID once a year to keep the account active.</li>
          </ul>

          <Link to="/terms" className="inline-block pt-1 text-sm font-semibold text-primary">
            Read the full terms →
          </Link>
        </Card>

        <Card className="space-y-3">
          <h2 className="text-base font-semibold">Demo controls</h2>
          <p className="text-xs text-muted-foreground">Prototype only — fire the annual re-verification cycle.</p>
          <button
            onClick={triggerReverify}
            className="tap w-full rounded-2xl bg-warning px-4 py-3 text-sm font-semibold text-warning-foreground"
          >
            Trigger annual re-verification
          </button>
          <button onClick={reset} className="tap w-full rounded-2xl bg-muted px-4 py-3 text-sm font-semibold">
            Reset demo (back to sign up)
          </button>
        </Card>
      </div>
    </AppShell>
  );
}

function RowLink({
  to,
  Icon,
  label,
  hint,
}: {
  to: string;
  Icon: typeof Receipt;
  label: string;
  hint: string;
}) {
  return (
    <Link to={to} className="tap flex items-center gap-3 border-b border-border p-4 last:border-0">
      <Icon className="size-5 text-primary" />
      <span className="flex-1 text-sm font-semibold">{label}</span>
      <span className="text-xs text-muted-foreground">{hint}</span>
      <ChevronRight className="size-4 text-muted-foreground" />
    </Link>
  );
}
