import { createFileRoute, Link } from "@tanstack/react-router";
import { PlaneTakeoff } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { GlobalSearch } from "@/components/GlobalSearch";
import { MiniAppIcon } from "@/components/MiniAppIcon";
import { MINI_APPS } from "@/lib/mini-apps";
import { useTravel } from "@/lib/useProgramme";

export const Route = createFileRoute("/israel")({
  head: () => ({
    meta: [
      { title: "Israel · Shekk" },
      {
        name: "description",
        content:
          "Everything you need for living in Israel, in the order you need it: arrival and paperwork, getting around, daily life, going out and longer-term tracks.",
      },
      { property: "og:title", content: "Israel · Shekk" },
      {
        property: "og:description",
        content: "Arrival, transport, food, health, events and paperwork — organised around your stay.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: IsraelHub,
});

type Group = { title: string; hint: string; ids: string[] };

const GROUPS: Group[] = [
  {
    title: "Arrival and paperwork",
    hint: "Sort this before and just after you land",
    ids: ["guides", "visa", "documents"],
  },
  {
    title: "Getting around",
    hint: "Buses, trains, taxis and maps",
    ids: ["transit", "rides", "maps", "been-there"],
  },
  {
    title: "Everyday life",
    hint: "Food, shopping, health and where you live",
    ids: ["food", "shops", "health", "housing", "fitness"],
  },
  {
    title: "Going out",
    hint: "Events, tickets and places to book",
    ids: ["events", "tickets", "reserve", "community"],
  },
  {
    title: "Jewish life and news",
    hint: "Tefillah, times and what's happening",
    ids: ["siddur", "news"],
  },
  {
    title: "Staying longer",
    hint: "Army, university and lone soldier tracks",
    ids: ["army", "uni", "lone-soldier"],
  },
];

function byId(id: string) {
  return MINI_APPS.find((a) => a.id === id) ?? null;
}

function AppTile({ id }: { id: string }) {
  const app = byId(id);
  if (!app) return null;
  return (
    <Link to={app.path} className="tap-icon flex flex-col items-center gap-1.5">
      <MiniAppIcon app={app} size={58} />
      <span className="line-clamp-2 text-center text-[11px] font-medium leading-tight">{app.name}</span>
    </Link>
  );
}

function IsraelHub() {
  const { daysToArrival } = useTravel();
  const preArrival = daysToArrival !== null && daysToArrival > 0;

  return (
    <AppShell>
      <header className="px-5 pt-7">
        <h1 className="font-display text-4xl font-bold tracking-tight">Israel</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {preArrival
            ? `Everything for your stay — you land in ${daysToArrival} ${daysToArrival === 1 ? "day" : "days"}.`
            : "Everything for your stay, grouped the way you'll actually need it."}
        </p>
      </header>

      <div className="px-4 pt-4">
        <GlobalSearch />
      </div>

      <div className="px-4 pt-4">
        <Link
          to="/before-you-fly"
          className="tap flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-card"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <PlaneTakeoff className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold">Before you fly</span>
            <span className="block text-xs text-muted-foreground">
              The guided checklist for the weeks before you land
            </span>
          </span>
          <span className="text-sm font-semibold text-primary">→</span>
        </Link>
      </div>

      <div className="space-y-7 px-4 pb-10 pt-7">
        {GROUPS.map((g) => (
          <section key={g.title}>
            <div className="mb-3 px-1">
              <h2 className="font-display text-lg font-bold leading-tight tracking-tight">{g.title}</h2>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{g.hint}</p>
            </div>
            <div className="grid grid-cols-4 gap-x-2 gap-y-5">
              {g.ids.map((id) => (
                <AppTile key={id} id={id} />
              ))}
            </div>
          </section>
        ))}

        <Link
          to="/explore"
          className="tap block rounded-2xl border border-border bg-card p-4 text-center text-sm font-semibold shadow-card"
        >
          See every Shekk app →
        </Link>
      </div>
    </AppShell>
  );
}
