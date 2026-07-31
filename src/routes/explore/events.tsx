import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Ticket } from "lucide-react";
import { AppShell, Card, ScreenHeader } from "@/components/AppShell";
import { EVENT_KIND_LABEL, dayLabel, eventWhen, useEvents } from "@/lib/useEvents";
import { ils } from "@/lib/mock";

export const Route = createFileRoute("/explore/events")({
  head: () => ({
    meta: [
      { title: "Events & tickets · Shekk" },
      {
        name: "description",
        content:
          "Shabbatons, tiyulim, shiurim and club nights — booked and paid for straight from your Shekk balance.",
      },
      { property: "og:title", content: "Events & tickets · Shekk" },
      { property: "og:description", content: "Grab a spot on the next tiyul, Shabbaton or Thursday night." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Events,
});

const KIND_FILTERS = ["shabbaton", "tiyul", "club", "shiur", "chesed"] as const;

function Events() {
  const { data, isLoading, error } = useEvents();
  const [kind, setKind] = useState<string | null>(null);
  const [city, setCity] = useState<string | null>(null);

  const events = data ?? [];

  const cities = useMemo(
    () => [...new Set(events.map((e) => e.city).filter((c): c is string => Boolean(c)))].sort(),
    [events],
  );

  const shown = events.filter(
    (e) => (kind ? e.kind === kind : true) && (city ? e.city === city : true),
  );

  const days = useMemo(() => {
    const groups: { label: string; items: typeof shown }[] = [];
    for (const e of shown) {
      const label = dayLabel(e.startsAt);
      const last = groups[groups.length - 1];
      if (last && last.label === label) last.items.push(e);
      else groups.push({ label, items: [e] });
    }
    return groups;
  }, [shown]);

  return (
    <AppShell>
      <ScreenHeader title="Events & tickets" subtitle="Shabbatons · tiyulim · shiurim · nights out" />

      <div className="px-4 py-4">
        <Link
          to="/tickets"
          className="tap mb-4 flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-card"
        >
          <Ticket className="size-5 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">My tickets</p>
            <p className="text-xs text-muted-foreground">Show your QR at the bus or the door</p>
          </div>
        </Link>

        <div className="mb-4 flex flex-wrap gap-2">
          <Chip active={!kind && !city} onClick={() => { setKind(null); setCity(null); }}>
            All
          </Chip>
          {KIND_FILTERS.map((k) => (
            <Chip key={k} active={kind === k} onClick={() => setKind(kind === k ? null : k)}>
              {EVENT_KIND_LABEL[k]}
            </Chip>
          ))}
          {cities.map((c) => (
            <Chip key={c} active={city === c} onClick={() => setCity(city === c ? null : c)}>
              {c}
            </Chip>
          ))}
        </div>

        {isLoading && (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        )}

        {error && (
          <Card className="text-sm text-muted-foreground">
            Events couldn&apos;t load just now. Pull back in a moment.
          </Card>
        )}

        {!isLoading && !error && events.length === 0 && (
          <Card className="space-y-1.5 text-center">
            <p className="text-3xl">🎟️</p>
            <p className="text-sm font-semibold">No events on sale yet</p>
            <p className="text-xs text-muted-foreground">
              Shabbatons, tiyulim and club nights land here as programs and venues come online. Ask your madrich
              to list theirs.
            </p>
          </Card>
        )}

        {!isLoading && !error && events.length > 0 && shown.length === 0 && (
          <Card className="text-center text-sm text-muted-foreground">
            Nothing matches that filter yet.
          </Card>
        )}

        <div className="space-y-5">
          {days.map((group) => (
            <div key={group.label} className="space-y-2">
              <p className="px-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {group.label}
              </p>
              {group.items.map((e) => (
                <Link
                  key={e.id}
                  to="/explore/event/$id"
                  params={{ id: e.id }}
                  className="tap block"
                >
                  <Card className="flex items-center gap-3">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-muted text-2xl">
                      {e.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{e.title}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {e.host} · {eventWhen(e.startsAt)}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {EVENT_KIND_LABEL[e.kind]}
                        {e.city ? ` · ${e.city}` : ""}
                        {e.remaining !== null
                          ? e.remaining === 0
                            ? " · Sold out"
                            : ` · ${e.remaining} left`
                          : ""}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-bold">
                      {e.price === 0 ? "Free" : ils(e.price)}
                    </span>
                  </Card>
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

function Chip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`tap rounded-full px-3 py-1.5 text-xs font-semibold ${
        active ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
