import { createFileRoute, Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { AppShell, Card } from "@/components/AppShell";
import { MINI_PROGRAMS, EVENTS, ils } from "@/lib/mock";
import { useOnboardedGate } from "@/lib/useOnboardedGate";

export const Route = createFileRoute("/explore/")({
  head: () => ({
    meta: [
      { title: "Explore · ShekelPay" },
      {
        name: "description",
        content: "Mini-programs for transit, kosher food delivery, rides, events, housing, health, visa admin and community.",
      },
      { property: "og:title", content: "Explore · ShekelPay" },
      { property: "og:description", content: "Every gap-year errand, booked inside one app." },
    ],
  }),
  component: Explore,
});

function Explore() {
  const ready = useOnboardedGate();
  if (!ready) return <AppShell><div className="p-6 text-sm text-muted-foreground">Loading…</div></AppShell>;

  return (
    <AppShell>
      <header className="px-5 pt-7">
        <h1 className="text-3xl font-bold">Explore</h1>
        <p className="text-sm text-muted-foreground">Everything you'd otherwise need 15 apps for.</p>
        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">
          <Search className="size-4" /> Search mini-programs, merchants, tiyulim…
        </div>
      </header>

      <section className="px-4 py-5">
        <div className="grid grid-cols-4 gap-2">
          {MINI_PROGRAMS.map((m) => (
            <Link
              key={m.id}
              to={m.to}
              className="tap flex flex-col items-center gap-1.5 rounded-2xl bg-card p-3 text-center shadow-card"
            >
              <span className="flex size-11 items-center justify-center rounded-2xl bg-primary-soft text-xl">
                {m.emoji}
              </span>
              <span className="text-[11px] font-semibold leading-tight">{m.label}</span>
            </Link>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <Link to="/explore/transit" className="tap rounded-2xl bg-ink p-4 text-ink-foreground shadow-card">
            <p className="text-2xl">🚌</p>
            <p className="mt-2 text-sm font-semibold">Bus 74 in 3 min</p>
            <p className="text-xs opacity-70">Buy a single ride · ₪6.40</p>
          </Link>
          <Link to="/explore/food" className="tap rounded-2xl bg-accent p-4 text-accent-foreground shadow-card">
            <p className="text-2xl">🥙</p>
            <p className="mt-2 text-sm font-semibold">Kosher delivery</p>
            <p className="text-xs opacity-80">Order before 14:00 erev Shabbat</p>
          </Link>
        </div>

        <h2 className="mb-2 mt-6 text-base font-semibold">This week</h2>
        <div className="space-y-2">
          {EVENTS.slice(0, 3).map((e) => (
            <Link key={e.id} to="/explore/events">
              <Card className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-xl bg-muted text-xl">{e.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{e.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {e.host} · {e.when}
                  </p>
                </div>
                <span className="text-sm font-semibold">{e.price === 0 ? "Free" : ils(e.price)}</span>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
