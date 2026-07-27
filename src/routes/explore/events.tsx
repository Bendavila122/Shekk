import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, Card, PrimaryButton, ScreenHeader } from "@/components/AppShell";
import { QRCode } from "@/components/QRCode";
import { EVENTS, ils } from "@/lib/mock";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/explore/events")({
  head: () => ({
    meta: [
      { title: "Events & tickets · ShekelPay" },
      { name: "description", content: "Shabbatons, tiyulim, shiurim and Thursday nights — booked and paid in-app." },
      { property: "og:title", content: "Events & tickets · ShekelPay" },
      { property: "og:description", content: "Grab a spot on the next tiyul or Shabbaton." },
    ],
  }),
  component: Events,
});

function Events() {
  const { spend, state } = useApp();
  const [openId, setOpenId] = useState<string | null>(null);
  const [ticketFor, setTicketFor] = useState<string | null>(null);

  const ev = EVENTS.find((e) => e.id === openId);
  const ticket = EVENTS.find((e) => e.id === ticketFor);

  if (ticket) {
    return (
      <AppShell>
        <ScreenHeader title="Your ticket" subtitle={ticket.name} onBack={() => { setTicketFor(null); setOpenId(null); }} />
        <div className="px-4 py-6">
          <Card className="flex flex-col items-center gap-3 text-center">
            <span className="text-3xl">{ticket.emoji}</span>
            <p className="text-lg font-bold">{ticket.name}</p>
            <p className="text-xs text-muted-foreground">
              {ticket.host} · {ticket.when}
            </p>
            <QRCode value={`ticket:${ticket.id}:${state.name}`} className="h-52 w-52" />
            <p className="text-xs text-muted-foreground">
              1 admission · {state.name || "Student"} · show at the bus / door
            </p>
          </Card>
          <Card className="mt-4 text-xs text-muted-foreground">
            Bring water, a hoodie for Tzfat nights, and your teudat zehut/passport copy. Madrich contact is in the
            cohort thread.
          </Card>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <ScreenHeader title="Events & tickets" subtitle="Shiurim · Shabbatons · tiyulim · nightlife" />
      <div className="space-y-3 px-4 py-4">
        {EVENTS.map((e) => (
          <button key={e.id} onClick={() => setOpenId(e.id)} className="tap w-full text-left">
            <Card className="flex items-center gap-3">
              <span className="flex size-12 items-center justify-center rounded-xl bg-muted text-2xl">{e.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{e.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {e.host} · {e.when}
                </p>
                <p className="text-xs text-warning-foreground">{e.spots} spots left</p>
              </div>
              <span className="text-sm font-bold">{e.price === 0 ? "Free" : ils(e.price)}</span>
            </Card>
          </button>
        ))}
      </div>

      {ev && (
        <div className="absolute inset-0 z-30 flex flex-col justify-end bg-ink/60">
          <div className="rounded-t-3xl bg-card p-6 pb-8">
            <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-border" />
            <p className="text-xl font-bold">{ev.name}</p>
            <p className="text-sm text-muted-foreground">
              {ev.host} · {ev.when}
            </p>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ticket</span>
                <span className="font-semibold">{ev.price === 0 ? "Free" : ils(ev.price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Includes</span>
                <span className="font-semibold">Transport + meals</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Paid from</span>
                <span className="font-semibold">ShekelPay credits</span>
              </div>
            </div>
            <div className="mt-5 space-y-2">
              <PrimaryButton
                onClick={() => {
                  if (ev.price > 0) spend(ev.name, "Events", ev.price, ev.emoji);
                  setTicketFor(ev.id);
                  setOpenId(null);
                }}
              >
                {ev.price === 0 ? "Reserve my spot" : `Book · ${ils(ev.price)}`}
              </PrimaryButton>
              <button onClick={() => setOpenId(null)} className="tap w-full rounded-2xl bg-muted py-3.5 text-sm font-semibold">
                Not now
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
