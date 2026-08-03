import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { GlobalSearch } from "@/components/GlobalSearch";
import { MiniAppIcon } from "@/components/MiniAppIcon";
import { MicroLabel, ProgressBar } from "@/components/Kit";
import { MINI_APPS } from "@/lib/mini-apps";
import { useTravel } from "@/lib/useProgramme";
import { useJourney } from "@/lib/useJourney";

export const Route = createFileRoute("/israel")({
  head: () => ({
    meta: [
      { title: "Israel · Shekk" },
      {
        name: "description",
        content:
          "The single hub for living in Israel: your preparation journey, Hebrew, tefillah, getting around, health, paperwork and longer-term tracks.",
      },
      { property: "og:title", content: "Israel · Shekk" },
      {
        property: "og:description",
        content: "Your preparation journey plus everything you need for daily life in Israel, in one place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: IsraelHub,
});

type Group = { title: string; hint: string; ids: string[] };

/* Core groups only. Everything experimental or low-priority lives behind
   "More", so this screen stays about what a member needs this week. */
const GROUPS: Group[] = [
  {
    title: "Paperwork and documents",
    hint: "Visa, official tasks and your document vault",
    ids: ["visa", "documents", "guides"],
  },
  {
    title: "Learning and tefillah",
    hint: "Hebrew that you'll use today, and the siddur",
    ids: ["ulpan", "siddur"],
  },
  {
    title: "Getting around",
    hint: "How transport and maps work here",
    ids: ["maps", "transit", "rides"],
  },
  {
    title: "Health and home",
    hint: "Your insurance card, doctors and where you live",
    ids: ["health", "housing"],
  },
  {
    title: "Planning your money here",
    hint: "What a month actually costs",
    ids: ["cost-of-living", "budget"],
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
  const journey = useJourney();
  const preArrival = daysToArrival !== null && daysToArrival > 0;

  return (
    <AppShell>
      <header className="px-5 pt-7">
        <h1 className="font-display text-4xl font-bold tracking-tight">Israel</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {preArrival
            ? `Everything for your stay — you land in ${daysToArrival} ${daysToArrival === 1 ? "day" : "days"}.`
            : "Your preparation journey, plus everything for daily life here."}
        </p>
      </header>

      <div className="px-4 pt-4">
        <GlobalSearch />
      </div>

      {/* The one preparation journey in the app. */}
      <div className="px-4 pt-4">
        <Link to="/setup" className="tap block">
          <div className="grad-balance relative overflow-hidden rounded-[1.5rem] px-5 py-5 text-ink-foreground shadow-lift">
            <span className="card-sheen pointer-events-none absolute inset-0" aria-hidden />
            <div className="relative">
              <MicroLabel className="opacity-70">Israel Setup</MicroLabel>
              <p className="mt-1.5 font-display text-2xl font-bold leading-tight tracking-tight">
                {journey.complete ? "You are ready" : journey.next ? journey.next.item.title : "Get started"}
              </p>
              <p className="mt-1 text-[12px] opacity-80">
                {journey.done} of {journey.total} things sorted
                {journey.next ? ` · next in ${journey.next.section.title}` : ""}
              </p>
              <ProgressBar value={journey.pct} tone="onDark" className="mt-3.5" />
              <span className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-bold">
                Open your journey <ArrowRight className="size-3.5" />
              </span>
            </div>
          </div>
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
          className="tap flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-card"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
            <Sparkles className="size-5 text-muted-foreground" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold">More & coming soon</span>
            <span className="block text-xs text-muted-foreground">
              Events, news, the map, fitness, army and university tracks
            </span>
          </span>
          <span className="text-sm font-semibold text-primary">→</span>
        </Link>
      </div>
    </AppShell>
  );
}
