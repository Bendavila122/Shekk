import { createFileRoute, Link } from "@tanstack/react-router";
import { Apple, Banknote, Bell, Check, Clock, Globe, ShieldCheck, Sparkles } from "lucide-react";
import { AppShell, Card, ScreenHeader } from "@/components/AppShell";
import { LoadingBlocks, MicroLabel } from "@/components/Kit";
import { SupportRow } from "@/components/SupportRow";
import { ShekkCardFace } from "@/components/ShekkCard";
import { useApp } from "@/lib/store";
import { useOnboardedGate } from "@/lib/useOnboardedGate";
import { useLocalState } from "@/lib/local-state";
import { PARTNERS } from "@/lib/banking";

export const Route = createFileRoute("/card")({
  head: () => ({
    meta: [
      { title: "Shekk Card · coming soon" },
      {
        name: "description",
        content:
          "The Shekk Mastercard is not issued yet. See what it will do, who provides it, and get told the moment real cards go live.",
      },
      { property: "og:title", content: "Shekk Card · coming soon" },
      { property: "og:description", content: "A Mastercard built for your year in Israel — not live yet." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CardScreen,
});

const FEATURES = [
  { Icon: Globe, title: "Spend anywhere in Israel", detail: "Accepted wherever Mastercard is — shuk stalls included." },
  { Icon: Apple, title: "Apple Pay & Google Wallet", detail: "Tap to pay from the moment the card is issued." },
  { Icon: Bell, title: "Instant notifications", detail: "Every authorisation on your phone in a second." },
  { Icon: Banknote, title: "Low-cost conversion", detail: "Convert close to the interbank rate, not airport rates." },
  { Icon: Sparkles, title: "Student benefits", detail: "Partner offers applied when you pay with the card." },
];

/**
 * The card is deliberately a read-only preview.
 *
 * No issuing, no Apple Wallet provisioning, no freeze or limit controls: none
 * of that exists yet, and simulating it made members believe they had a usable
 * card. This screen sets expectations instead.
 */
function CardScreen() {
  const ready = useOnboardedGate();
  const { state } = useApp();
  const { value: waitlist, update } = useLocalState("shekk.card.waitlist.v1", { joined: false });

  if (!ready) {
    return (
      <AppShell>
        <LoadingBlocks rows={3} />
      </AppShell>
    );
  }

  const firstName = (state.name || "Shekk member").split(" ")[0];

  return (
    <AppShell>
      <ScreenHeader title="Shekk Card" subtitle="Coming soon" back="/wallet" />

      <section className="px-5 pt-4">
        <div className="rounded-2xl border border-notice-border bg-notice-soft px-4 py-4 text-notice-foreground">
          <MicroLabel className="inline-flex items-center gap-1.5 opacity-80">
            <Clock className="size-3.5" /> Not issued yet
          </MicroLabel>
          <p className="mt-1.5 text-[13px] font-bold">There is no Shekk card you can use today</p>
          <p className="mt-1 text-[12px] leading-relaxed">
            Card issuing is still being built with our payment partners. The card below is a design preview — it has
            no number, cannot be added to Apple Wallet, and nothing can be charged to it.
          </p>
        </div>
      </section>

      <section className="px-5 pt-5">
        <div className="pointer-events-none select-none opacity-55 blur-[1.5px]" aria-hidden>
          <ShekkCardFace name={firstName} last4="••••" expiry="••/••" />
        </div>

        <button
          type="button"
          onClick={() => update(() => ({ joined: true }))}
          disabled={waitlist.joined}
          className={`tap mt-5 flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-base font-semibold ${
            waitlist.joined ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground"
          }`}
        >
          {waitlist.joined ? (
            <>
              <Check className="size-4" /> We'll tell you when cards go live
            </>
          ) : (
            <>
              <Bell className="size-4" /> Tell me when the card is ready
            </>
          )}
        </button>
        <p className="mt-2 text-center text-[11.5px] text-muted-foreground">
          In the meantime, you can add money and pay other Shekk members.
        </p>
      </section>

      <section className="px-4 pt-6">
        <h2 className="mb-2 px-1 font-display text-lg font-bold tracking-tight">What it will do</h2>
        <Card className="divide-y divide-border p-0">
          {FEATURES.map(({ Icon, title, detail }) => (
            <div key={title} className="flex items-start gap-3 p-4">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
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

      <section className="px-4 pt-5">
        <Card className="p-4">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <ShieldCheck className="size-4 text-primary" /> Who will provide what
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
            Shekk is not a bank and does not issue cards itself.{" "}
            <Link to="/terms" className="font-semibold underline">
              Terms
            </Link>
          </p>
        </Card>
      </section>

      <div className="px-4 pb-10 pt-5">
        <SupportRow />
      </div>
    </AppShell>
  );
}
