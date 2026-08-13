import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, X, Tag, ChevronRight, Newspaper } from "lucide-react";
import { AppShell, Card } from "@/components/AppShell";
import { LoadingBlocks } from "@/components/Kit";

import { serviceLinkProps, type Service, type ServiceCategory } from "@/lib/services";
import { ServiceLogo } from "@/components/ServiceLogo";
import { MiniAppIcon } from "@/components/MiniAppIcon";
import { miniApps } from "@/lib/mini-apps";
import { recordServiceUse } from "@/lib/recents";
import { useOnboardedGate } from "@/lib/useOnboardedGate";
import { GUIDES } from "@/lib/guides";
import { GuideStrip } from "@/components/GuideStrip";
import { useCatalogue, useVisibleBenefits } from "@/lib/admin";

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

/** Section label with an optional link on the right, used to set the rhythm. */
function SectionHead({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3 px-1">
      <div className="min-w-0">
        <h2 className="font-display text-lg font-bold leading-tight tracking-tight">{title}</h2>
        {hint ? <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p> : null}
      </div>
      {action}
    </div>
  );
}

/** One app icon, iPhone-home-screen scale. */
function AppTile({ service, size = 60 }: { service: Service; size?: number }) {
  return (
    <Link
      {...serviceLinkProps(service)}
      onClick={() => recordServiceUse(service.id)}
      className="tap-icon flex flex-col items-center gap-2"
    >
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

/** Shekk mini apps, grouped the way the Israel hub groups them. */
const MINI_GROUPS: { title: string; hint: string; ids: string[] }[] = [
  { title: "Arrival and paperwork", hint: "Sort this before and just after you land", ids: ["guides", "visa", "documents"] },
  { title: "Getting around", hint: "Buses, trains, taxis and maps", ids: ["transit", "rides", "maps", "been-there"] },
  { title: "Everyday life", hint: "Food, shopping, health and where you live", ids: ["food", "shops", "health", "housing", "fitness"] },
  { title: "Going out", hint: "Events, tickets and places to book", ids: ["events", "tickets", "reserve", "community"] },
  { title: "Jewish life and news", hint: "Tefillah, times and what's happening", ids: ["siddur", "news"] },
  { title: "Staying longer", hint: "Army, university and lone soldier tracks", ids: ["army", "uni", "lone-soldier"] },
  { title: "Money and planning", hint: "Budgeting, exchange and learning Hebrew", ids: ["money-planner", "exchange", "ulpan"] },
];

function Explore() {
  const ready = useOnboardedGate();
  const [query, setQuery] = useState("");
  const catalogue = useCatalogue();
  const benefits = useVisibleBenefits();
  const apps = miniApps();

  /** Grouped mini apps, with anything ungrouped appended so nothing disappears. */
  const miniGroups = useMemo(() => {
    const byId = new Map(apps.map((a) => [a.id, a]));
    const groups = MINI_GROUPS.map((g) => ({
      title: g.title,
      hint: g.hint,
      apps: g.ids.map((id) => byId.get(id)).filter((a): a is NonNullable<typeof a> => Boolean(a)),
    })).filter((g) => g.apps.length > 0);
    const placed = new Set(MINI_GROUPS.flatMap((g) => g.ids));
    const rest = apps.filter((a) => !placed.has(a.id));
    if (rest.length) groups.push({ title: "More from Shekk", hint: "Everything else we build in-house", apps: rest });
    return groups;
  }, [apps]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return catalogue.flatMap((c) => c.services).filter((s) =>
      [s.name, s.blurb, s.partner ?? ""].join(" ").toLowerCase().includes(q),
    );
  }, [query, catalogue]);

  if (!ready)
    return (
      <AppShell>
        <LoadingBlocks rows={3} />
      </AppShell>
    );

  return (
    <AppShell>
      <header className="px-5 pt-7">
        <h1 className="font-display text-4xl font-bold tracking-tight">Explore</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every Israeli app you need, sorted into folders. Tap one and it opens inside Shekk.
        </p>
      </header>

      {/* search sticks to the top so it's always a thumb away */}
      <div className="sticky top-0 z-30 -mt-1 bg-background/85 px-5 pb-3 pt-4 backdrop-blur-xl">
        <label className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-3 text-sm shadow-card">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Wolt, Rav-Kav, visa, shuk, Bit…"
            className="w-full min-w-0 bg-transparent outline-none placeholder:text-muted-foreground"
          />
          {query ? (
            <button onClick={() => setQuery("")} className="tap-flat shrink-0 text-muted-foreground">
              <X className="size-4" />
            </button>
          ) : null}
        </label>
      </div>

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
        <section className="space-y-10 px-4 py-5">
          {/* Featured rail — one card geometry, room for more later */}
          <div>
            <SectionHead title="Featured" hint="Handpicked for gap-year life right now" />
            <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <Link
                to="/benefits"
                className="tap block w-[78%] shrink-0 snap-start sm:w-[19rem]"
              >
                <div className="grad-premium relative h-full overflow-hidden rounded-[1.5rem] p-4 text-ink-foreground shadow-lift">
                  <span className="card-sheen pointer-events-none absolute inset-0" aria-hidden />
                  <div className="relative flex h-full flex-col gap-3">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-ink-foreground/15">
                      <Tag className="size-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold">Benefits marketplace</p>
                      <p className="mt-0.5 text-xs opacity-85">
                        {benefits.length} member offers on food, transport, gyms, trips and courses.
                      </p>
                    </div>
                    <span className="mt-auto flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide opacity-90">
                      Browse offers <ChevronRight className="size-3.5" />
                    </span>
                  </div>
                </div>
              </Link>

              <Link to="/news" className="tap block w-[78%] shrink-0 snap-start sm:w-[19rem]">
                <div className="relative h-full overflow-hidden rounded-[1.5rem] border border-border bg-card p-4 shadow-card">
                  <div className="relative flex h-full flex-col gap-3">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-muted">
                      <Newspaper className="size-5 text-foreground/70" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold">Israel news</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Live English headlines from Times of Israel, JPost, Ynet and Arutz Sheva.
                      </p>
                    </div>
                    <span className="mt-auto flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
                      Read now <ChevronRight className="size-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Shekk's own mini apps, grouped so nothing is hidden behind a tap */}
          <div className="space-y-7">
            <SectionHead title="Shekk apps" hint="Built by us, open instantly" />
            {miniGroups.map((g) => (
              <section key={g.title}>
                <div className="mb-3 px-1">
                  <h2 className="font-display text-base font-bold leading-tight tracking-tight">{g.title}</h2>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{g.hint}</p>
                </div>
                <div className="grid grid-cols-4 gap-x-3 gap-y-5 sm:grid-cols-6 lg:grid-cols-9">
                  {g.apps.map((app) => (
                    <Link key={app.id} to={app.path} className="tap-icon flex flex-col items-center gap-2">
                      <MiniAppIcon app={app} size={58} />
                      <span className="line-clamp-2 text-center text-[11px] font-medium leading-tight">
                        {app.name}
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Partner apps, laid out in full under each category */}
          <div className="space-y-7">
            <SectionHead title="Partner apps" hint="Israeli apps, opened inside Shekk" />
            {catalogue.map((cat) => (
              <section key={cat.id}>
                <div className="mb-3 px-1">
                  <h2 className="font-display text-base font-bold leading-tight tracking-tight">
                    {cat.emoji ? <span className="mr-1.5">{cat.emoji}</span> : null}
                    {cat.label}
                  </h2>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{cat.tagline}</p>
                </div>
                <div className="grid grid-cols-4 gap-x-3 gap-y-5 sm:grid-cols-6 lg:grid-cols-8">
                  {cat.services.map((s) => (
                    <AppTile key={s.id} service={s} />
                  ))}
                </div>
              </section>
            ))}
          </div>


          {/* Guides & tips */}
          <div>
            <SectionHead
              title="Guides & tips"
              hint="Living here, explained in plain English"
              action={
                <Link to="/guides" className="tap-flat text-[12px] font-semibold text-primary">
                  All guides
                </Link>
              }
            />
            <div className="grid auto-rows-min grid-cols-2 gap-3">
              {GUIDES.slice(0, 4).map((g, i) => (
                <GuideStrip key={g.id} guide={g} index={i} />
              ))}
            </div>
          </div>

          <p className="px-1 text-center text-[11px] leading-relaxed text-muted-foreground">
            We integrate platforms, not individual venues — restaurants, bars and shops arrive through Wolt, Ontopo and
            friends. Apps marked “soon” open a guide for now.
          </p>
        </section>
      )}
    </AppShell>
  );
}
