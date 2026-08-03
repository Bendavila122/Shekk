import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Apple, Building2, Check, Loader2, Lock, ShieldCheck } from "lucide-react";
import { FocusScreen, PrimaryButton, Card } from "@/components/AppShell";
import { AirwallexDropIn } from "@/components/AirwallexDropIn";
import { ils } from "@/lib/mock";
import { CURRENCIES, currency, money } from "@/lib/currencies";
import { quoteFx } from "@/lib/banking";
import { useApp } from "@/lib/store";
import { useFunding } from "@/lib/useFunding";
import { SupportRow } from "@/components/SupportRow";


export const Route = createFileRoute("/topup")({
  head: () => ({
    meta: [
      { title: "Add money · Shekk" },
      {
        name: "description",
        content:
          "Add money to your Shekk account from six currencies and see the interbank rate, the conversion cost and the shekels you receive before you confirm.",
      },
      { property: "og:title", content: "Add money · Shekk" },
      { property: "og:description", content: "Transparent conversion on every transfer into your shekel account." },
    ],
  }),
  component: AddMoney,
});

const PRESETS = [50, 100, 250, 500];

function AddMoney() {
  const { state } = useApp();
  const { partner, blocked, needsVerification, phase, error, intent, fund, markSubmitted, failFunding, resetFunding } =
    useFunding();

  const [amount, setAmount] = useState("100");
  const [source, setSource] = useState(state.settings.payCurrency);
  const [sheet, setSheet] = useState<"apple" | "bank" | null>(null);
  const cur = currency(source);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const value = Math.max(0, Number(amount) || 0);
  const q = quoteFx(source, value);
  const isCustom = !PRESETS.includes(value);

  if (phase === "awaiting" || phase === "settled") {
    const settled = phase === "settled";
    return (
      <FocusScreen>
        <div className="flex min-h-screen flex-col justify-between px-6 pb-10 pt-24 sm:min-h-[860px]">
          <div className="text-center">
            <div
              className={`mx-auto flex size-20 items-center justify-center rounded-full ${
                settled ? "bg-success-soft" : "bg-muted"
              }`}
            >
              {settled ? (
                <Check className="size-10 text-success" />
              ) : (
                <Loader2 className="size-9 animate-spin text-muted-foreground" />
              )}
            </div>
            <h1 className="mt-6 font-display text-3xl font-bold">
              {settled ? `${ils(q.shekels)} added` : "Waiting for your payment"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {settled
                ? `${money(cur.code, q.amount)} settled into your shekel balance. The receipt is in Activity.`
                : `${money(cur.code, q.amount)} is with the payment partner. Your shekels appear the moment the payment settles — usually a few seconds.`}
            </p>
          </div>
          <div className="space-y-3">
            <PrimaryButton
              onClick={() => {
                resetFunding();
                navigate({ to: "/wallet" });
              }}
            >
              Back to wallet
            </PrimaryButton>
            <Link to="/explore" className="tap block rounded-2xl bg-muted py-4 text-center text-sm font-semibold">
              Explore Israel
            </Link>
          </div>
        </div>
      </FocusScreen>
    );
  }

  return (
    <FocusScreen>
      <div className="flex min-h-screen flex-col px-6 pb-10 pt-8 sm:min-h-[860px]">
        <Link to="/wallet" className="text-sm font-semibold text-muted-foreground">
          Cancel
        </Link>
        <h1 className="mt-4 font-display text-3xl font-bold tracking-tight">Add money</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pay in {cur.code}, hold shekels. Your balance lands in your Shekk account.
        </p>

        {blocked ? (
          <div className="mt-4 space-y-3 rounded-2xl border border-notice-border bg-notice-soft px-4 py-3 text-xs leading-relaxed text-notice-foreground">
            <div className="flex items-start gap-2">
              <Lock className="mt-0.5 size-4 shrink-0" />
              <span>{blocked}</span>
            </div>
            {needsVerification && (
              <Link
                to="/verify"
                className="tap block rounded-xl bg-notice-foreground px-4 py-2.5 text-center text-xs font-semibold text-notice-soft"
              >
                Verify my identity
              </Link>
            )}
          </div>
        ) : null}


        {/* Source currency */}
        <div className="-mx-6 mt-5 flex gap-2 overflow-x-auto px-6 pb-1 no-scrollbar">
          {CURRENCIES.map((c) => (
            <button
              key={c.code}
              onClick={() => setSource(c.code)}
              className={`tap flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold ${
                source === c.code ? "bg-ink text-ink-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              <span className="text-sm">{c.flag}</span> {c.code}
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-3xl border border-border bg-card p-5 shadow-card">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">You pay</span>
          <button
            type="button"
            onClick={() => inputRef.current?.focus()}
            className="mt-1 flex w-full items-baseline gap-2 text-left"
          >
            <span className="font-display text-4xl font-bold">{cur.symbol}</span>
            <input
              ref={inputRef}
              inputMode="decimal"
              value={amount}
              onFocus={(e) => e.currentTarget.select()}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
              className="w-full bg-transparent font-display text-5xl font-bold outline-none"
            />
          </button>
          <div className="mt-4 grid grid-cols-4 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => setAmount(String(p))}
                className={`tap rounded-xl py-2 text-sm font-semibold ${
                  Number(amount) === p ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                }`}
              >
                {cur.symbol}
                {p}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              setAmount("");
              setTimeout(() => inputRef.current?.focus(), 0);
            }}
            className={`tap mt-2 w-full rounded-xl py-2 text-sm font-semibold ${
              isCustom ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
            }`}
          >
            Custom amount
          </button>
        </div>

        <Card className="mt-4 space-y-2.5 text-sm">
          <Row label="You pay" value={money(cur.code, q.amount)} />
          <Row label="Interbank rate" value={`${cur.symbol}1 = ₪${q.interbank.toFixed(3)}`} muted />
          <Row label="Conversion cost" value={money(cur.code, q.fee)} muted />
          <Row label="Shekk rate" value={`${cur.symbol}1 = ₪${q.rate.toFixed(3)}`} muted />
          <div className="border-t border-border pt-2.5">
            <Row label="Shekels you receive" value={ils(q.shekels)} bold />
          </div>
        </Card>

        <p className="mt-3 flex items-start gap-2 px-1 text-[11px] leading-relaxed text-muted-foreground">
          <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
          Your shekel account, payments and FX are provided by Airwallex, Shekk's regulated payment partner. Shekels are credited only once
          they confirm your payment has settled.{" "}
          <Link to="/terms" className="font-semibold underline">
            Terms
          </Link>
        </p>

        <SupportRow className="mt-3" />


        <div className="mt-auto space-y-2 pt-6">
          <PrimaryButton
            disabled={value <= 0 || Boolean(blocked)}
            onClick={() => setSheet("apple")}
            className="flex items-center justify-center gap-2"
          >
            <Apple className="size-5" /> Pay {money(cur.code, q.amount)}
          </PrimaryButton>
          <button
            disabled={value <= 0 || Boolean(blocked)}
            onClick={() => setSheet("bank")}
            className="tap flex w-full items-center justify-center gap-2 rounded-2xl bg-muted py-3.5 text-sm font-semibold disabled:opacity-40"
          >
            <Building2 className="size-4" /> Bank transfer instead
          </button>
        </div>
      </div>

      {sheet ? (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-neutral-950/45">
          <div className="animate-fade-in mx-auto w-full max-w-md rounded-t-3xl bg-card p-6 pb-8">
            <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-border" />
            <div className="flex items-center gap-2 text-lg font-semibold">
              {sheet === "apple" ? (
                <>
                  <Apple className="size-5" /> Apple Pay
                </>
              ) : (
                <>
                  <Building2 className="size-5" /> Bank transfer
                </>
              )}
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <Row label="Shekk" value={money(cur.code, q.amount)} />
              <Row
                label={sheet === "apple" ? "Card" : "From"}
                value={sheet === "apple" ? "Your Apple Pay card" : `${cur.code} account`}
                muted
              />
              <Row label="You receive" value={ils(q.shekels)} bold />
            </div>
            {error ? (
              <p className="mt-4 rounded-2xl bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
                {error}
              </p>
            ) : (
              <p className="mt-4 text-xs text-muted-foreground">
                Handled by Shekk's payment partner. Your balance updates when they confirm the payment.
              </p>
            )}

            {phase === "collecting" && intent ? (
              <div className="mt-4 max-h-[55vh] overflow-y-auto">
                <AirwallexDropIn
                  intentId={intent.intentId}
                  clientSecret={intent.clientSecret}
                  currency={intent.currency}
                  environment={partner?.environment ?? "sandbox"}
                  onSubmitted={() => {
                    markSubmitted();
                    setSheet(null);
                  }}
                  onError={failFunding}
                />
              </div>
            ) : null}

            <div className="mt-5 space-y-2">
              {phase === "collecting" ? null : (
                <PrimaryButton
                  disabled={phase === "starting"}
                  onClick={() => void fund(source, q.amount)}
                >
                  {phase === "starting"
                    ? "Starting payment…"
                    : sheet === "apple"
                      ? "Continue to payment"
                      : "Continue to payment"}
                </PrimaryButton>
              )}

              <button
                onClick={() => {
                  resetFunding();
                  setSheet(null);
                }}
                className="tap w-full rounded-2xl bg-muted py-3.5 text-sm font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </FocusScreen>
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
