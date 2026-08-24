import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, GraduationCap, PlaneTakeoff, Sparkles, Wallet } from "lucide-react";
import { toast } from "sonner";
import { AppShell, Card, Notice, ScreenHeader } from "@/components/AppShell";
import { Milestone, MicroLabel, ProgressBar, SectionHead } from "@/components/Kit";
import { useApp } from "@/lib/store";
import { useTravel } from "@/lib/useProgramme";
import { useSetup } from "@/lib/useSetup";
import { SETUP_TASKS, type SetupPhase } from "@/lib/setup-checklist";
import { getJourney } from "@/lib/journey-phase";

export const Route = createFileRoute("/before-you-fly/")({
  head: () => ({
    meta: [
      { title: "Your Israel setup · Shekk" },
      {
        name: "description",
        content:
          "A guided checklist for moving to Israel: Israeli SIM, travel and medical cover, programme link, paperwork, arrival day and your first week.",
      },
      { property: "og:title", content: "Your Israel setup · Shekk" },
      {
        property: "og:description",
        content: "Everything to sort before you fly, on arrival day and in your first week — in one checklist.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SetupChecklist,
});

const PHASES: { id: SetupPhase; title: string; hint: string }[] = [
  { id: "before", title: "Before you fly", hint: "Sort these from home" },
  { id: "arrival", title: "Arrival day", hint: "Airport to front door" },
  { id: "first-week", title: "Your first week", hint: "Settling in properly" },
];

function SetupChecklist() {
  const { signedIn } = useApp();
  const { travel, daysToArrival } = useTravel();
  const journey = getJourney(travel);
  const setup = useSetup();

  const tick = (key: string, done: boolean) => {
    if (!signedIn) {
      toast.error("Sign in to save your progress");
      return;
    }
    setup.toggle.mutate(
      { key, done },
      { onError: (e) => toast.error(e instanceof Error ? e.message : "Couldn't save that") },
    );
  };

  return (
    <AppShell>
      <ScreenHeader title="Your Israel setup" subtitle="Everything, in order" back="/" />

      <header className="px-4 pt-5">
        <div className="grad-balance relative overflow-hidden rounded-[1.5rem] px-5 py-5 text-ink-foreground shadow-lift">
          <span className="card-sheen pointer-events-none absolute inset-0" aria-hidden />
          <div className="relative">
            <MicroLabel className="opacity-70">
              <span className="inline-flex items-center gap-1.5">
                <PlaneTakeoff className="size-3" /> Israel setup
              </span>
            </MicroLabel>
            <p className="mt-2 font-display text-3xl font-bold leading-tight tracking-tight">
              {daysToArrival === null
                ? "Get ready for Israel"
                : daysToArrival > 0
                  ? `${daysToArrival} ${daysToArrival === 1 ? "day" : "days"} to go`
                  : journey.chip ?? "You're in Israel"}
            </p>
            <p className="mt-1 text-[12px] opacity-75">
              {setup.done} of {setup.total} things sorted
            </p>
            <ProgressBar value={setup.total ? setup.done / setup.total : 0} tone="onDark" className="mt-3" />
          </div>
        </div>
      </header>

      {setup.complete ? (
        <div className="px-4 pt-4">
          <Milestone
            title="You're set up"
            body="Every step on your list is done. Nothing left to prepare — go and have the year."
            actionLabel="Open Explore"
            actionTo="/israel"
          />
        </div>
      ) : setup.next ? (
        <section className="px-4 pt-4">
          <div className="rounded-[1.5rem] border border-primary/25 bg-primary-soft p-4">
            <MicroLabel className="text-primary">
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="size-3.5" /> Do this next
              </span>
            </MicroLabel>
            <p className="mt-2 text-[15px] font-semibold leading-snug">{setup.next.title}</p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">{setup.next.blurb}</p>
            <Link
              to={setup.next.href}
              className="tap mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[12.5px] font-bold text-primary-foreground"
            >
              {setup.next.cta} <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </section>
      ) : null}

      {!signedIn ? (
        <div className="px-4 pt-4">
          <Notice title="Sign in to track your progress">
            You can read every step now.{" "}
            <Link to="/auth" search={{ next: "/before-you-fly" }} className="font-semibold underline">
              Sign in
            </Link>{" "}
            to have Shekk tick them off as you go.
          </Notice>
        </div>
      ) : null}

      <div className="space-y-7 px-4 pb-10 pt-6">
        {PHASES.map((phase) => {
          const tasks = SETUP_TASKS.filter((t) => t.phase === phase.id);
          if (tasks.length === 0) return null;
          const phaseDone = tasks.filter((t) => setup.isDone(t.key)).length;
          return (
            <section key={phase.id}>
              <SectionHead title={phase.title} hint={`${phase.hint} · ${phaseDone}/${tasks.length} done`} />
              <div className="space-y-2.5">
                {tasks.map((task) => {
                  const done = setup.isDone(task.key);
                  const derived = setup.isDerived(task.key);
                  return (
                    <Card key={task.key} className="flex items-start gap-3">
                      <button
                        type="button"
                        aria-label={done ? `Mark ${task.title} as not done` : `Mark ${task.title} as done`}
                        aria-pressed={done}
                        disabled={derived}
                        onClick={() => tick(task.key, !done)}
                        className={`tap mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border-2 transition-colors ${
                          done ? "border-success bg-success text-success-foreground" : "border-border"
                        } ${derived ? "opacity-70" : ""}`}
                      >
                        {done ? <Check className="size-3.5" strokeWidth={3} /> : null}
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground/70">
                            <task.Icon className="size-4" />
                          </span>
                          <span
                            className={`text-sm font-semibold leading-snug ${done ? "text-muted-foreground" : ""}`}
                          >
                            {task.title}
                          </span>
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{task.blurb}</p>
                        <div className="mt-1.5 flex items-center gap-3">
                          <Link to={task.href} className="tap-flat text-xs font-semibold text-primary">
                            {done ? "Review" : task.cta} →
                          </Link>
                          {derived ? (
                            <span className="text-[11px] text-muted-foreground">Shekk ticked this for you</span>
                          ) : null}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </section>
          );
        })}

        <Link to="/programme" className="tap block">
          <Card className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-muted">
              <GraduationCap className="size-5 text-muted-foreground" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">Your programme</span>
              <span className="block text-xs text-muted-foreground">
                Timetable, announcements, documents and on-call contacts
              </span>
            </span>
            <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
          </Card>
        </Link>

        <Link to="/money" className="tap block">
          <Card className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-muted">
              <Wallet className="size-5 text-muted-foreground" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">Money in Israel</span>
              <span className="block text-xs text-muted-foreground">
                What things cost, how to pay — and Shekk Money early access
              </span>
            </span>
            <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
          </Card>
        </Link>
      </div>
    </AppShell>
  );
}
