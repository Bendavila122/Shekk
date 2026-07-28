import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowDown, Check, Info } from "lucide-react";
import { AppShell, Card, ScreenHeader, PrimaryButton } from "@/components/AppShell";
import { useApp } from "@/lib/store";
import { useOnboardedGate } from "@/lib/useOnboardedGate";
import { ils } from "@/lib/mock";
import { CURRENCIES, currency, money } from "@/lib/currencies";
import { quoteFx, FX_MARGIN } from "@/lib/banking";

export const Route = createFileRoute("/exchange")({
  head: () => ({
    meta: [
      { title: "Exchange · Shekk" },
      {
        name: "description",
        content:
          "Convert dollars, pounds, euros and more into Israeli shekels at a rate close to interbank, with the cost shown before you confirm.",
      },
      { property: "og:title", content: "Exchange · Shekk" },
      { property: "og:description", content: "Convert into shekels without the airport rate." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ExchangeScreen,
});

function ExchangeScreen() {
  const ready = useOnboardedGate();
  const { state, addMoney, isPremium } = useApp();
  const [from, setFrom] = useState(state.settings.payCurrency);
  const [amount, setAmount] = useState("250");
  const [done, setDone] = useState(false);

  if (!ready) {
    return (
      <AppShell>
        <div className="p-6 text-sm text-muted-foreground">Loading…</div>
      </AppShell>
    );
  }

  const cur = currency(from);
  const value = Math.max(0, Number(amount) || 0);
  const q = quoteFx(from, value);
  const marginLabel = `${(FX_MARGIN * 100).toFixed(1)}%`;

  return (
    <AppShell>
      <ScreenHeader title="Exchange" subtitle="Convert into your shekel balance" back="/wallet" />

      {done ? (
        <section className="px-5 pt-8 text-center">
          <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-success-soft">
            <Check className="size-10 text-success" />
          </div>
          <h1 className="mt-6 font-display text-3xl font-bold">{ils(q.shekels)} converted</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {money(cur.code, q.amount)} exchanged at ₪{q.rate.toFixed(3)}. It's in your Shekk balance now.
          </p>
          <div className="mt-8 space-y-3 text-left">
            <PrimaryButton onClick={() => setDone(false)}>Convert again</PrimaryButton>
            <Link to="/wallet" className="tap block rounded-2xl bg-muted py-4 text-center text-sm font-semibold">
              Back to wallet
            </Link>
          </div>
        </section>
      ) : (
        <>
          <section className="px-4 pt-5">
            <Card className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">From</p>
              <div className="mt-2 flex items-center gap-3">
                <select
                  value={from}
                  onChange={(e) => setFrom(e.target.value as typeof from)}
                  className="shrink-0 rounded-xl bg-muted px-3 py-2 text-sm font-semibold outline-none"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code}
                    </option>
                  ))}
                </select>
                <input
                  inputMode="decimal"
                  value={amount}
                  onFocus={(e) => e.currentTarget.select()}
                  onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                  className="w-full min-w-0 bg-transparent text-right font-display text-4xl font-bold outline-none"
                />
              </div>

              <div className="my-4 flex items-center gap-3">
                <span className="h-px flex-1 bg-border" />
                <span className="flex size-8 items-center justify-center rounded-full bg-primary-soft text-primary">
                  <ArrowDown className="size-4" />
                </span>
                <span className="h-px flex-1 bg-border" />
              </div>

              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">To</p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <span className="shrink-0 rounded-xl bg-muted px-3 py-2 text-sm font-semibold">🇮🇱 ILS</span>
                <span className="truncate font-display text-4xl font-bold">{ils(q.shekels)}</span>
              </div>
            </Card>
          </section>

          <section className="px-4 pt-4">
            <Card className="space-y-2.5 text-sm">
              <Row label="Interbank rate" value={`${cur.symbol}1 = ₪${q.interbank.toFixed(3)}`} muted />
              <Row label={`Shekk margin (${marginLabel})`} value={money(cur.code, q.fee)} muted />
              <div className="border-t border-border pt-2.5">
                <Row label="Your rate" value={`${cur.symbol}1 = ₪${q.rate.toFixed(3)}`} bold />
              </div>
            </Card>

            {!isPremium ? (
              <Link
                to="/membership"
                className="tap mt-3 flex items-start gap-2 rounded-2xl border border-notice-border bg-notice-soft px-4 py-3 text-xs text-notice-foreground"
              >
                <Info className="mt-0.5 size-4 shrink-0" />
                <span>
                  Shekk Premium converts at a 1.2% margin instead of {marginLabel}. On this exchange that's{" "}
                  {money(cur.code, +(q.fee * 0.6).toFixed(2))} back.
                </span>
              </Link>
            ) : null}

            <p className="mt-3 px-1 text-[11px] text-muted-foreground">
              Rates refresh every 30 seconds. Conversion is handled by Shekk's FX partner — simulated here.
            </p>
          </section>

          <section className="px-4 pb-10 pt-6">
            <PrimaryButton
              disabled={value <= 0}
              onClick={() => {
                addMoney(q.shekels, q.amount, `${money(cur.code, q.amount)} exchanged`);
                setDone(true);
              }}
            >
              Convert {money(cur.code, q.amount)}
            </PrimaryButton>
          </section>
        </>
      )}
    </AppShell>
  );
}

function Row({ label, value, muted, bold }: { label: string; value: string; muted?: boolean; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className={muted ? "text-muted-foreground" : ""}>{label}</span>
      <span className={bold ? "font-display text-lg font-bold" : "font-semibold"}>{value}</span>
    </div>
  );
}
