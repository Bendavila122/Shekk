import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, Card, PrimaryButton, ScreenHeader } from "@/components/AppShell";
import { useApp } from "@/lib/store";
import { ils } from "@/lib/mock";

export const Route = createFileRoute("/explore/reserve")({
  head: () => ({
    meta: [
      { title: "Reservations · Shekk" },
      { name: "description", content: "Book a table or a full Shabbaton group reservation, kosher-aware by default." },
      { property: "og:title", content: "Reservations · Shekk" },
      { property: "og:description", content: "Tables for two or Shabbaton tables for twenty." },
    ],
  }),
  component: Reserve,
});

const PLACES = [
  { id: "p1", name: "Hatzot Steakhouse", tag: "Meat · Rabbanut · Agrippas", emoji: "🥩" },
  { id: "p2", name: "Cafe Rimon", tag: "Dairy · Badatz · Ben Yehuda", emoji: "☕️" },
  { id: "p3", name: "Beit Shmuel Hall", tag: "Group Shabbaton · 20-60 seats", emoji: "🕯️" },
];

function Reserve() {
  const { spend } = useApp();
  const [openId, setOpenId] = useState<string | null>(null);
  const [size, setSize] = useState(4);
  const [when, setWhen] = useState("Tonight 20:00");
  const [confirmed, setConfirmed] = useState<string | null>(null);
  const place = PLACES.find((p) => p.id === openId);
  const isGroup = place?.id === "p3";
  const deposit = isGroup ? size * 45 : 0;

  return (
    <AppShell>
      <ScreenHeader title="Reservations" subtitle="Tables & Shabbaton bookings" />
      <div className="space-y-3 px-4 py-4">
        {confirmed && (
          <Card className="bg-success-soft text-sm">
            Booked · {confirmed}. Confirmation sent to your group thread.
          </Card>
        )}
        {PLACES.map((p) => (
          <button key={p.id} onClick={() => setOpenId(p.id)} className="tap w-full text-left">
            <Card className="flex items-center gap-3">
              <span className="flex size-12 items-center justify-center rounded-xl bg-muted text-2xl">{p.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{p.name}</p>
                <p className="truncate text-xs text-muted-foreground">{p.tag}</p>
              </div>
              <span className="text-xs font-semibold text-primary">Book</span>
            </Card>
          </button>
        ))}
        <Card className="text-xs text-muted-foreground">
          Friday bookings auto-cap at 90 minutes before candle-lighting. Nothing gets booked into Shabbat by accident.
        </Card>
      </div>

      {place && (
        <div className="absolute inset-0 z-30 flex flex-col justify-end bg-ink/60">
          <div className="space-y-4 rounded-t-3xl bg-card p-6 pb-8">
            <div className="mx-auto h-1 w-10 rounded-full bg-border" />
            <p className="text-xl font-bold">{place.name}</p>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Party size</p>
              <div className="flex gap-2">
                {[2, 4, 8, 20].map((n) => (
                  <button
                    key={n}
                    onClick={() => setSize(n)}
                    className={`tap flex-1 rounded-xl py-2 text-sm font-semibold ${
                      size === n ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">When</p>
              <div className="flex gap-2">
                {["Tonight 20:00", "Thu 21:30", "Motzei Shabbat"].map((w) => (
                  <button
                    key={w}
                    onClick={() => setWhen(w)}
                    className={`tap flex-1 rounded-xl px-2 py-2 text-xs font-semibold ${
                      when === w ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>
            {isGroup && (
              <p className="rounded-2xl bg-warning-soft p-3 text-xs text-warning-foreground">
                Group Shabbaton holds hold {ils(deposit)} from your balance ({size} × ₪45), split-able with your
                group afterwards.
              </p>
            )}
            <PrimaryButton
              onClick={() => {
                if (deposit > 0) spend(`${place.name} — Shabbaton hold`, "Reservations", deposit, place.emoji);
                setConfirmed(`${place.name} · ${size} people · ${when}`);
                setOpenId(null);
              }}
            >
              {deposit > 0 ? `Hold table · ${ils(deposit)}` : "Confirm reservation"}
            </PrimaryButton>
            <button onClick={() => setOpenId(null)} className="tap w-full rounded-2xl bg-muted py-3 text-sm font-semibold">
              Cancel
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
