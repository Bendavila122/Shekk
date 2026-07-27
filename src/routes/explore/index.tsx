import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { AppShell, Card } from "@/components/AppShell";
import { EVENTS, ils } from "@/lib/mock";
import { SERVICE_CATEGORIES, serviceLinkProps, type Service } from "@/lib/services";
import { ServiceLogo } from "@/components/ServiceLogo";
import { recordServiceUse } from "@/lib/recents";
import { useOnboardedGate } from "@/lib/useOnboardedGate";

export const Route = createFileRoute("/explore/")({
  head: () => ({
    meta: [
      { title: "Explore · Shekk" },
      {
        name: "description",
        content:
          "Wolt, Gett, Moovit, Rav-Kav, Israel Railways, Bit, Pango and more — every gap-year service integrated inside one app.",
      },
      { property: "og:title", content: "Explore · Shekk" },
      { property: "og:description", content: "Every gap-year errand, booked inside one app." },
    ],
  }),
  component: Explore,
});

/** One app icon, iPhone-home-screen scale. */
function AppTile({ service, size = 60 }: { service: Service; size?: number }) {
  return (
    <Link {...serviceLinkProps(service)} onClick={() => recordServiceUse(service.id)} className="tap flex flex-col items-center gap-2">
      <span className="relative">
        <ServiceLogo service={service} size={size} className="rounded-[1.2rem] shadow-card" />
        {service.status !== "live" ? (
          <span className="absolute -right-1 -top-1 rounded-full bg-ink px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-ink-foreground">
            {service.status === "integrating" ? "soon" : "info"}
          </span>
        ) : null}
      </span>
      <span className="line-clamp-2 text-center text-[11px] font-medium leading-tight">{service.name}</span>
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
        <h1 className="font-display text-4xl font-bold tracking-tight">Explore</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every Israeli app you need, sorted into folders. Tap one and it opens inside Shekk.
        </p>
        <label className="mt-4 flex items-center gap-2 rounded-2xl bg-muted px-4 py-3 text-sm">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Wolt, Rav-Kav, visa, shuk, Bit…"
            className="w-full min-w-0 bg-transparent outline-none placeholder:text-muted-foreground"
          />
          {query ? (
            <button onClick={() => setQuery("")} className="tap shrink-0 text-muted-foreground">
              <X className="size-4" />
            </button>
          ) : null}
        </label>
      </header>

      {results ? (
        <section className="px-4 py-6">
          <p className="mb-4 px-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {results.length} result{results.length === 1 ? "" : "s"}
          </p>
          {results.length === 0 ? (
            <Card className="text-sm text-muted-foreground">
              Not integrated yet. Tell us what you're missing and we'll chase the partner.
            </Card>
          ) : (
            <div className="grid grid-cols-4 gap-x-3 gap-y-6 sm:grid-cols-5 lg:grid-cols-8">
              {results.map((s) => (
                <AppTile key={s.id} service={s} />
              ))}
            </div>
          )}
        </section>
      ) : (
        <section className="space-y-8 px-4 py-6">
          {/* Category folders — one big icon each */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {SERVICE_CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                to="/explore/category/$id"
                params={{ id: cat.id }}
                className="tap flex flex-col items-center gap-3 rounded-[1.75rem] bg-muted/70 px-3 py-6 text-center"
              >
                <span className="flex size-20 items-center justify-center rounded-[1.6rem] bg-card text-4xl shadow-card">
                  {cat.emoji}
                </span>
                <span className="text-sm font-semibold leading-tight">{cat.label}</span>
                <span className="text-[11px] text-muted-foreground">{cat.services.length} apps</span>
              </Link>
            ))}
          </div>



          <p className="px-1 text-center text-[11px] text-muted-foreground">
            We integrate platforms, not individual venues — restaurants, bars and shops arrive through Wolt, Ontopo and
            friends. Apps marked “soon” open a guide for now.
          </p>
        </section>
      )}
    </AppShell>
  );
}
