import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, ChevronRight } from "lucide-react";
import { AppShell, Card } from "@/components/AppShell";
import { EVENTS, ils } from "@/lib/mock";
import { SERVICE_CATEGORIES, STATUS_LABEL, type Service } from "@/lib/services";
import { useOnboardedGate } from "@/lib/useOnboardedGate";

export const Route = createFileRoute("/explore/")({
  head: () => ({
    meta: [
      { title: "Explore · ShekelPay" },
      {
        name: "description",
        content:
          "Wolt, Gett, Moovit, Rav-Kav, Israel Railways, Bit, Pango and more — every gap-year service integrated inside one app.",
      },
      { property: "og:title", content: "Explore · ShekelPay" },
      { property: "og:description", content: "Every gap-year errand, booked inside one app." },
    ],
  }),
  component: Explore,
});

function StatusChip({ status }: { status: Service["status"] }) {
  const tone =
    status === "live"
      ? "bg-primary-soft text-primary"
      : status === "integrating"
        ? "bg-muted text-muted-foreground"
        : "bg-accent/20 text-accent-foreground";
  return (
    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${tone}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}

function ServiceRow({ service }: { service: Service }) {
  return (
    <Link
      to="/explore/service/$id"
      params={{ id: service.id }}
      className="tap flex items-center gap-3 rounded-2xl bg-card p-3 shadow-card"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-lg">
        {service.emoji}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{service.name}</p>
        <p className="truncate text-xs text-muted-foreground">{service.blurb}</p>
      </div>
      <StatusChip status={service.status} />
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
    </Link>
  );
}

function Explore() {
  const ready = useOnboardedGate();
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return SERVICE_CATEGORIES.flatMap((c) => c.services).filter((s) =>
      [s.name, s.blurb, s.partner ?? ""].join(" ").toLowerCase().includes(q),
    );
  }, [query]);

  if (!ready)
    return (
      <AppShell>
        <div className="p-6 text-sm text-muted-foreground">Loading…</div>
      </AppShell>
    );

  return (
    <AppShell>
      <header className="px-5 pt-7">
        <h1 className="text-3xl font-bold">Explore</h1>
        <p className="text-sm text-muted-foreground">
          We integrate the platforms — Wolt, Gett, Moovit, Rav-Kav, Bit — so you never sign up venue by venue.
        </p>
        <label className="mt-4 flex items-center gap-2 rounded-2xl bg-muted px-4 py-3 text-sm">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Wolt, Rav-Kav, visa, shuk, Bit…"
            className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </label>
      </header>

      {results ? (
        <section className="space-y-2 px-4 py-5">
          <p className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {results.length} result{results.length === 1 ? "" : "s"}
          </p>
          {results.map((s) => (
            <ServiceRow key={s.id} service={s} />
          ))}
          {results.length === 0 ? (
            <Card className="text-sm text-muted-foreground">
              Not integrated yet. Tell us what you're missing and we'll chase the partner.
            </Card>
          ) : null}
        </section>
      ) : (
        <section className="px-4 py-5">
          <div className="grid grid-cols-2 gap-3">
            <Link to="/explore/transit" className="tap rounded-2xl bg-ink p-4 text-ink-foreground shadow-card">
              <p className="text-2xl">🚌</p>
              <p className="mt-2 text-sm font-semibold">Bus 74 in 3 min</p>
              <p className="text-xs opacity-70">Rav-Kav · Moovit · Rakevet</p>
            </Link>
            <Link to="/explore/food" className="tap rounded-2xl bg-accent p-4 text-accent-foreground shadow-card">
              <p className="text-2xl">🛵</p>
              <p className="mt-2 text-sm font-semibold">Wolt, kosher filter on</p>
              <p className="text-xs opacity-80">Order before 14:00 erev Shabbat</p>
            </Link>
          </div>

          {SERVICE_CATEGORIES.map((cat) => (
            <div key={cat.id} className="mt-7">
              <div className="mb-2 flex items-baseline gap-2 px-1">
                <span className="text-lg">{cat.emoji}</span>
                <h2 className="text-base font-semibold">{cat.label}</h2>
              </div>
              <p className="mb-3 px-1 text-xs text-muted-foreground">{cat.tagline}</p>
              <div className="space-y-2">
                {cat.services.map((s) => (
                  <ServiceRow key={s.id} service={s} />
                ))}
              </div>
            </div>
          ))}

          <h2 className="mb-2 mt-7 px-1 text-base font-semibold">This week</h2>
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
      )}
    </AppShell>
  );
}
