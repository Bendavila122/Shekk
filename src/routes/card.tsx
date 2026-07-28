import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Apple,
  Snowflake,
  Eye,
  EyeOff,
  Wifi,
  Globe,
  Banknote,
  ShieldCheck,
  Sparkles,
  Check,
  Loader2,
  Bell,
} from "lucide-react";
import { AppShell, Card, ScreenHeader, PrimaryButton } from "@/components/AppShell";
import { ShekkCardFace } from "@/components/ShekkCard";
import { useApp } from "@/lib/store";
import { useOnboardedGate } from "@/lib/useOnboardedGate";
import { ils } from "@/lib/mock";
import { issueCard, provisionToWallet, PARTNERS } from "@/lib/banking";

export const Route = createFileRoute("/card")({
  head: () => ({
    meta: [
      { title: "Shekk Card · Shekk" },
      {
        name: "description",
        content:
          "The Shekk Mastercard: spend anywhere in Israel, add it to Apple Pay, freeze it instantly and set your own spending limits.",
      },
      { property: "og:title", content: "Shekk Card · Shekk" },
      { property: "og:description", content: "A Mastercard built for your year in Israel." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CardScreen,
});

const FEATURES = [
  { Icon: Globe, title: "Spend anywhere in Israel", detail: "Accepted wherever Mastercard is — shuk stalls included." },
  { Icon: Apple, title: "Apple Pay & Google Wallet", detail: "Tap to pay from the moment the card is issued." },
  { Icon: Bell, title: "Instant notifications", detail: "Every authorisation lands on your phone in a second." },
  { Icon: Banknote, title: "Low-cost conversion", detail: "Convert at a rate close to interbank, not airport rates." },
  { Icon: Sparkles, title: "Student benefits", detail: "Partner offers apply automatically when you pay with the card." },
];

function CardScreen() {
  const ready = useOnboardedGate();
  const { state, setCard, isPremium } = useApp();
  const [reveal, setReveal] = useState(false);
  const [issuing, setIssuing] = useState(false);
  const [walletBusy, setWalletBusy] = useState(false);

  if (!ready) {
    return (
      <AppShell>
        <div className="p-6 text-sm text-muted-foreground">Loading…</div>
      </AppShell>
    );
  }

  const firstName = (state.name || "Shekk member").split(" ")[0];
  const card = state.card;

  async function issue() {
    setIssuing(true);
    const res = await issueCard();
    setCard({ issued: true, last4: res.last4, expiry: res.expiry, frozen: false });
    setIssuing(false);
  }

  async function addToWallet() {
    setWalletBusy(true);
    await provisionToWallet("apple");
    setCard({ inAppleWallet: true });
    setWalletBusy(false);
  }

  return (
    <AppShell>
      <ScreenHeader title="Shekk Card" subtitle="Mastercard, powered by our issuing partner" back="/wallet" />

      <section className="px-5 pt-5">
        <ShekkCardFace
          name={firstName}
          last4={card.last4}
          expiry={card.expiry}
          balance={state.balance}
          frozen={card.frozen}
          showNumber={reveal}
          className={card.issued ? "" : "opacity-60 blur-[1px]"}
        />

        {card.issued ? (
          <div className="mt-4 grid grid-cols-3 gap-2">
            <button
              onClick={addToWallet}
              disabled={card.inAppleWallet || walletBusy}
              className="tap flex flex-col items-center gap-1.5 rounded-2xl bg-ink px-2 py-3 text-[11px] font-semibold text-ink-foreground disabled:opacity-60"
            >
              {walletBusy ? (
                <Loader2 className="size-5 animate-spin" />
              ) : card.inAppleWallet ? (
                <Check className="size-5" />
              ) : (
                <Apple className="size-5" />
              )}
              {card.inAppleWallet ? "In Apple Wallet" : "Add to Apple Wallet"}
            </button>
            <button
              onClick={() => setCard({ frozen: !card.frozen })}
              className={`tap flex flex-col items-center gap-1.5 rounded-2xl px-2 py-3 text-[11px] font-semibold ${
                card.frozen ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
              }`}
            >
              <Snowflake className="size-5" />
              {card.frozen ? "Unfreeze" : "Freeze card"}
            </button>
            <button
              onClick={() => setReveal((v) => !v)}
              className="tap flex flex-col items-center gap-1.5 rounded-2xl bg-muted px-2 py-3 text-[11px] font-semibold"
            >
              {reveal ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              {reveal ? "Hide details" : "View details"}
            </button>
          </div>
        ) : (
          <div className="mt-4">
            {isPremium ? (
              <PrimaryButton onClick={issue} disabled={issuing}>
                {issuing ? "Issuing your card…" : "Issue my Shekk Card"}
              </PrimaryButton>
            ) : (
              <Link
                to="/membership"
                className="tap block rounded-2xl bg-primary px-5 py-4 text-center text-base font-semibold text-primary-foreground"
              >
                Unlock with Shekk Premium
              </Link>
            )}
          </div>
        )}

        {card.frozen ? (
          <p className="mt-3 rounded-2xl border border-notice-border bg-notice-soft px-4 py-3 text-xs text-notice-foreground">
            Card frozen. Nothing will authorise until you unfreeze — your balance is untouched.
          </p>
        ) : null}
      </section>

      {/* Controls */}
      {card.issued ? (
        <section className="px-4 pt-5">
          <h2 className="mb-2 px-1 font-display text-lg font-bold tracking-tight">Controls</h2>
          <Card className="divide-y divide-border p-0">
            <Toggle
              Icon={Wifi}
              label="Contactless"
              detail="Tap to pay in shops"
              on={card.contactless}
              onChange={(v) => setCard({ contactless: v })}
            />
            <Toggle
              Icon={Globe}
              label="Online payments"
              detail="Wolt, Gett, ticketing sites"
              on={card.online}
              onChange={(v) => setCard({ online: v })}
            />
            <Toggle
              Icon={Banknote}
              label="ATM withdrawals"
              detail="Cash for the shuk"
              on={card.atm}
              onChange={(v) => setCard({ atm: v })}
            />
            <div className="p-4">
              <div className="flex items-baseline justify-between">
                <p className="text-sm font-semibold">Monthly spending limit</p>
                <p className="font-display text-lg font-bold">{ils(card.monthlyLimit)}</p>
              </div>
              <input
                type="range"
                min={500}
                max={15000}
                step={500}
                value={card.monthlyLimit}
                onChange={(e) => setCard({ monthlyLimit: Number(e.target.value) })}
                className="mt-3 w-full accent-primary"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Anything above this is declined until you raise the limit.
              </p>
            </div>
          </Card>
        </section>
      ) : null}

      {/* What the card does */}
      <section className="px-4 pt-5">
        <h2 className="mb-2 px-1 font-display text-lg font-bold tracking-tight">What it does</h2>
        <Card className="divide-y divide-border p-0">
          {FEATURES.map(({ Icon, title, detail }) => (
            <div key={title} className="flex items-start gap-3 p-4">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <Icon className="size-[18px]" />
              </span>
              <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="text-xs text-muted-foreground">{detail}</p>
              </div>
            </div>
          ))}
        </Card>
      </section>

      {/* Who does what */}
      <section className="px-4 pb-10 pt-5">
        <Card className="p-4">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <ShieldCheck className="size-4 text-primary" /> Who provides what
          </p>
          <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
            {Object.values(PARTNERS).map((p) => (
              <li key={p.name} className="flex items-start justify-between gap-3">
                <span>
                  <span className="font-semibold text-foreground">{p.name}</span> — {p.role}
                </span>
                <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                  Coming soon
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            Shekk is not a bank. Card issuing and payments are simulated in this prototype.{" "}
            <Link to="/terms" className="font-semibold underline">
              Terms
            </Link>
          </p>
        </Card>
      </section>
    </AppShell>
  );
}

function Toggle({
  Icon,
  label,
  detail,
  on,
  onChange,
}: {
  Icon: typeof Wifi;
  label: string;
  detail: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button onClick={() => onChange(!on)} className="tap-flat flex w-full items-center gap-3 p-4 text-left">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted">
        <Icon className="size-[18px] text-muted-foreground" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{label}</span>
        <span className="block text-xs text-muted-foreground">{detail}</span>
      </span>
      <span
        className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${on ? "bg-primary" : "bg-border"}`}
      >
        <span
          className={`absolute top-0.5 size-5 rounded-full bg-card shadow-card transition-all ${
            on ? "left-[1.125rem]" : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}
