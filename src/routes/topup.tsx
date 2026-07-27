import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Apple, Info, Check } from "lucide-react";
import { FocusScreen, PrimaryButton, Card } from "@/components/AppShell";
import { ils, quoteTopUp, usd } from "@/lib/mock";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/topup")({
  head: () => ({
    meta: [
      { title: "Top up credits · ShekelPay" },
      {
        name: "description",
        content: "Buy shekel credits with Apple Pay and see the rate, the fee and your final credit amount before you confirm.",
      },
      { property: "og:title", content: "Top up credits · ShekelPay" },
      { property: "og:description", content: "Transparent pricing on every credit purchase." },
    ],
  }),
  component: TopUp,
});

const PRESETS = [50, 100, 250, 500];

function TopUp() {
  const [amount, setAmount] = useState("100");
  const [sheet, setSheet] = useState(false);
  const [done, setDone] = useState(false);
  const { addCredits } = useApp();
  const navigate = useNavigate();

  const value = Math.max(0, Number(amount) || 0);
  const q = quoteTopUp(value);

  if (done) {
    return (
      <FocusScreen>
        <div className="flex min-h-screen flex-col justify-between px-6 pb-10 pt-24 sm:min-h-[860px]">
          <div className="text-center">
            <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-success-soft">
              <Check className="size-10 text-success" />
            </div>
            <h1 className="mt-6 text-3xl font-bold">{ils(q.credits)} credits added</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Paid {usd(q.usd)} with Apple Pay. Receipt is in your Activity.
            </p>
          </div>
          <div className="space-y-3">
            <PrimaryButton onClick={() => navigate({ to: "/" })}>Back to my wallet</PrimaryButton>
            <Link to="/explore" className="tap block rounded-2xl bg-muted py-4 text-center text-sm font-semibold">
              Explore mini-programs
            </Link>
          </div>
        </div>
      </FocusScreen>
    );
  }

  return (
    <FocusScreen>
      <div className="flex min-h-screen flex-col px-6 pb-10 pt-8 sm:min-h-[860px]">
        <Link to="/" className="text-sm font-semibold text-muted-foreground">
          Cancel
        </Link>
        <h1 className="mt-4 text-3xl font-bold">Add credits</h1>
        <p className="mt-1 text-sm text-muted-foreground">You pay in USD. You receive shekel credits.</p>

        <div className="mt-6 rounded-3xl border border-border bg-card p-5 shadow-card">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">You pay</span>
          <button
            type="button"
            onClick={() => inputRef.current?.focus()}
            className="mt-1 flex w-full items-baseline gap-2 text-left"
          >
            <span className="font-display text-4xl font-bold">$</span>
            <input
              ref={inputRef}
              inputMode="decimal"
              value={amount}
              onFocus={(e) => e.currentTarget.select()}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
              className="w-full bg-transparent font-display text-5xl font-bold outline-none"
            />
          </button>
          <p className="text-xs text-muted-foreground">Tap the amount to enter your own.</p>
          <div className="mt-4 grid grid-cols-4 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => setAmount(String(p))}
                className={`tap rounded-xl py-2 text-sm font-semibold ${
                  Number(amount) === p ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                }`}
              >
                ${p}
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
          <Row label="Amount paid" value={usd(q.usd)} />
          <Row label="ShekelPay rate" value={`$1 = ₪${q.rate.toFixed(3)}`} muted />
          <div className="border-t border-border pt-2.5">
            <Row label="Credits you receive" value={ils(q.credits)} bold />
          </div>
        </Card>


        <div className="mt-4 flex gap-2 rounded-2xl bg-warning-soft p-4 text-xs text-warning-foreground">
          <Info className="mt-0.5 size-4 shrink-0" />
          <p>
            This is a purchase of ShekelPay credits, not a deposit. Credits are non-refundable and non-withdrawable —
            when you order through a partner app inside ShekelPay, we pay them and deduct the token equivalent.{" "}
            <Link to="/terms" className="font-semibold underline">
              Terms & Conditions
            </Link>
            .
          </p>
        </div>

        <div className="mt-auto pt-6">
          <PrimaryButton disabled={value <= 0} onClick={() => setSheet(true)} className="flex items-center justify-center gap-2">
            <Apple className="size-5" /> Pay {usd(q.usd)}
          </PrimaryButton>
        </div>
      </div>

      {sheet && (
        <div className="absolute inset-0 z-30 flex flex-col justify-end bg-ink/60">
          <div className="rounded-t-3xl bg-card p-6 pb-8">
            <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-border" />
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Apple className="size-5" /> Apple Pay
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <Row label="ShekelPay" value={usd(q.usd)} />
              <Row label="Card" value="•••• 4417 · Visa" muted />
              <Row label="You receive" value={`${ils(q.credits)} credits`} bold />
            </div>
            <p className="mt-4 text-xs text-muted-foreground">Mock sheet — no real payment is processed.</p>
            <div className="mt-5 space-y-2">
              <PrimaryButton
                onClick={() => {
                  addCredits(q.credits, q.usd);
                  setSheet(false);
                  setDone(true);
                }}
              >
                Confirm with Face ID
              </PrimaryButton>
              <button onClick={() => setSheet(false)} className="tap w-full rounded-2xl bg-muted py-3.5 text-sm font-semibold">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
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
