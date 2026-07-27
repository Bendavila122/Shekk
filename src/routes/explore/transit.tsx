import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, Card, PrimaryButton, ScreenHeader } from "@/components/AppShell";
import { BUS_LINES, ils } from "@/lib/mock";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/explore/transit")({
  head: () => ({
    meta: [
      { title: "Transit · Shekk" },
      { name: "description", content: "Live bus and rail times, in-app ticket purchase and Rav-Kav top-up." },
      { property: "og:title", content: "Transit · Shekk" },
      { property: "og:description", content: "Buy a bus ticket or load your Rav-Kav with credits." },
    ],
  }),
  component: Transit,
});

function Transit() {
  const { spend, state } = useApp();
  const [selected, setSelected] = useState<(typeof BUS_LINES)[number] | null>(null);
  const [ticket, setTicket] = useState<string | null>(null);
  const [ravkav, setRavkav] = useState(50);
  const [ravkavDone, setRavkavDone] = useState(false);

  return (
    <AppShell>
      <ScreenHeader title="Transit" subtitle="Jerusalem · live times" />
      <div className="space-y-4 px-4 py-4">
        <Card className="bg-primary-soft text-sm">
          Shekk: <strong>{ils(state.balance)}</strong> · we pay the operator, then deduct the Shekk.
        </Card>

        {ticket ? (
          <Card className="space-y-2 text-center">
            <p className="text-4xl">🎫</p>
            <p className="text-lg font-bold">Ticket active</p>
            <p className="text-sm text-muted-foreground">{ticket}</p>
            <p className="text-xs text-muted-foreground">Valid 90 minutes · show the animated code to the driver</p>
            <div className="mx-auto h-2 w-40 animate-pulse rounded-full bg-success" />
            <button onClick={() => setTicket(null)} className="tap pt-2 text-sm font-semibold text-primary">
              Done
            </button>
          </Card>
        ) : (
          <section>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Arriving now</h2>
            <Card className="divide-y divide-border p-0">
              {BUS_LINES.map((b) => (
                <button
                  key={b.line}
                  onClick={() => setSelected(b)}
                  className="tap flex w-full items-center gap-3 p-4 text-left"
                >
                  <span className="flex size-11 items-center justify-center rounded-xl bg-ink text-xs font-bold text-ink-foreground">
                    {b.line}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{b.dest}</p>
                    <p className="text-xs text-muted-foreground">{ils(b.price)} single ride</p>
                  </div>
                  <span className="text-sm font-bold text-success">{b.mins} min</span>
                </button>
              ))}
            </Card>
          </section>
        )}

        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Rav-Kav top-up</h2>
          <Card className="space-y-3">
            <p className="text-sm">Card •••• 8821 · balance ₪12.80</p>
            <div className="grid grid-cols-4 gap-2">
              {[30, 50, 100, 200].map((v) => (
                <button
                  key={v}
                  onClick={() => setRavkav(v)}
                  className={`tap rounded-xl py-2 text-sm font-semibold ${
                    ravkav === v ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  ₪{v}
                </button>
              ))}
            </div>
            {ravkavDone ? (
              <p className="text-sm font-semibold text-success">Loaded ✓ tap your card at any validator</p>
            ) : (
              <PrimaryButton
                onClick={() => {
                  spend("Rav-Kav top-up", "Transit", ravkav, "🚌");
                  setRavkavDone(true);
                }}
              >
                Load {ils(ravkav)} from credits
              </PrimaryButton>
            )}
          </Card>
        </section>
      </div>

      {selected && (
        <div className="absolute inset-0 z-30 flex flex-col justify-end bg-ink/60">
          <div className="rounded-t-3xl bg-card p-6 pb-8">
            <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-border" />
            <p className="text-lg font-semibold">Line {selected.line}</p>
            <p className="text-sm text-muted-foreground">{selected.dest}</p>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Single ride</span>
                <span className="font-semibold">{ils(selected.price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Paid from</span>
                <span className="font-semibold">Shekk credits</span>
              </div>
            </div>
            <div className="mt-5 space-y-2">
              <PrimaryButton
                onClick={() => {
                  spend(`Egged ${selected.line} — ${selected.dest}`, "Transit", selected.price, "🚌");
                  setTicket(`Line ${selected.line} · ${selected.dest}`);
                  setSelected(null);
                }}
              >
                Buy ticket · {ils(selected.price)}
              </PrimaryButton>
              <button onClick={() => setSelected(null)} className="tap w-full rounded-2xl bg-muted py-3.5 text-sm font-semibold">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
