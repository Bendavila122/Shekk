import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, Card, PrimaryButton, ScreenHeader } from "@/components/AppShell";
import { ils } from "@/lib/mock";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/explore/rides")({
  head: () => ({
    meta: [
      { title: "Rides · Shekk" },
      { name: "description", content: "Book and track a taxi across Jerusalem and pay with your credits." },
      { property: "og:title", content: "Rides · Shekk" },
      { property: "og:description", content: "In-app taxi booking with no cash at the curb." },
    ],
  }),
  component: Rides,
});

const OPTIONS = [
  { id: "o1", name: "Standard", eta: "3 min", price: 34.5, emoji: "🚕" },
  { id: "o2", name: "XL (5 seats)", eta: "6 min", price: 52.0, emoji: "🚐" },
  { id: "o3", name: "Share with cohort", eta: "8 min", price: 19.0, emoji: "👥" },
];

function Rides() {
  const { spend } = useApp();
  const [dest, setDest] = useState("Machane Yehuda Market");
  const [pick, setPick] = useState(OPTIONS[0].id);
  const [stage, setStage] = useState<"book" | "tracking">("book");
  const opt = OPTIONS.find((o) => o.id === pick)!;

  return (
    <AppShell>
      <ScreenHeader title="Rides" subtitle="Pickup: dorm entrance" />
      <div className="space-y-4 px-4 py-4">
        <div className="flex h-40 items-center justify-center rounded-2xl bg-muted text-sm text-muted-foreground">
          🗺️ Live map (mock)
        </div>
        {stage === "book" ? (
          <>
            <input
              value={dest}
              onChange={(e) => setDest(e.target.value)}
              className="w-full rounded-2xl border border-border bg-card px-4 py-3.5 text-sm outline-none focus:border-primary"
            />
            <Card className="divide-y divide-border p-0">
              {OPTIONS.map((o) => (
                <button
                  key={o.id}
                  onClick={() => setPick(o.id)}
                  className={`tap flex w-full items-center gap-3 p-4 text-left ${pick === o.id ? "bg-primary-soft" : ""}`}
                >
                  <span className="text-xl">{o.emoji}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{o.name}</p>
                    <p className="text-xs text-muted-foreground">{o.eta} away</p>
                  </div>
                  <span className="text-sm font-semibold">{ils(o.price)}</span>
                </button>
              ))}
            </Card>
            <PrimaryButton
              onClick={() => {
                spend(`Ride · ${dest}`, "Rides", opt.price, "🚕");
                setStage("tracking");
              }}
            >
              Book {opt.name} · {ils(opt.price)}
            </PrimaryButton>
          </>
        ) : (
          <Card className="space-y-2 text-center">
            <p className="text-3xl">🚕</p>
            <p className="text-lg font-bold">Moshe is 2 minutes away</p>
            <p className="text-sm text-muted-foreground">White Skoda · 42-193-71 · heading to {dest}</p>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full w-2/3 animate-pulse rounded-full bg-primary" />
            </div>
            <p className="text-xs text-muted-foreground">Paid {ils(opt.price)} from credits — nothing owed in the car.</p>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
