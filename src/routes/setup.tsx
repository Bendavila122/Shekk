import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Circle,
  CircleCheck,
  Lock,
  Sparkles,
} from "lucide-react";
import { AppShell, Card, Notice, ScreenHeader } from "@/components/AppShell";
import { MicroLabel, Milestone, PreviewBadge, ProgressBar, SectionHead } from "@/components/Kit";
import { useApp } from "@/lib/store";
import { useJourney } from "@/lib/useJourney";

export const Route = createFileRoute("/setup")({
  head: () => ({
    meta: [
      { title: "Israel Setup · Shekk" },
      {
        name: "description",
        content:
          "One adaptive preparation journey for your move to Israel: before you fly, money, programme, phone, insurance, packing, arrival and your first week — with the next step always chosen for you.",
      },
      { property: "og:title", content: "Israel Setup · Shekk" },
      {
        property: "og:description",
        content: "Everything to sort before and just after you land, in the order it actually matters.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: IsraelSetup,
});

function IsraelSetup() {
  const { signedIn } = useApp();
  const [open, setOpen] = useState<string | null>(null);

  /* One journey model for the whole app — see src/lib/useJourney.ts. */
  const {
    sections,
    total,
    done: doneTotal,
    pct,
    complete,
    next,
    isDone,
    toggle,
    daysToArrival,
  } = useJourney();

  const headline = complete
    ? "You are ready"
    : daysToArrival === null
      ? "Let's get you ready"
      : daysToArrival > 0
        ? `${daysToArrival} ${daysToArrival === 1 ? "day" : "days"} to go`
        : "You're in Israel";


  return (
    <AppShell>
      <ScreenHeader title="Israel Setup" back="/israel" />

      <header className="px-4 pt-2">
        <div className="grad-balance relative overflow-hidden rounded-[1.5rem] px-5 py-5 text-ink-foreground shadow-lift">
          <span className="card-sheen pointer-events-none absolute inset-0" aria-hidden />
          <div className="relative">
            <MicroLabel className="opacity-70">Your preparation</MicroLabel>
            <p className="mt-2 font-display text-[2rem] font-bold leading-tight tracking-tight">{headline}</p>
            <p className="mt-1 text-[12.5px] opacity-80">
              {doneTotal} of {total} things sorted across {sections.length} areas
            </p>
            <ProgressBar value={total ? doneTotal / total : 0} tone="onDark" className="mt-3.5" />
          </div>
        </div>
      </header>

      {complete ? (
        <div className="px-4 pt-4">
          <Milestone
            title="Setup complete"
            body="Every area is sorted. Nothing left to prepare — go and have the year."
            actionLabel="Open Israel"
            actionTo="/israel"
          />
        </div>
      ) : next ? (
        <section className="px-4 pt-4">
          <div className="rounded-[1.5rem] border border-primary/25 bg-primary-soft p-4">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
              <Sparkles className="size-3.5" /> Do this next
            </span>
            <p className="mt-2 text-[15px] font-semibold leading-snug">{next.item.title}</p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">{next.item.blurb}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {next.item.href ? (
                <Link
                  to={next.item.href}
                  className="tap inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[12.5px] font-bold text-primary-foreground"
                >
                  {next.item.cta ?? "Open"} <ArrowRight className="size-3.5" />
                </Link>
              ) : null}
              {!next.item.auto ? (
                <button
                  type="button"
                  onClick={() => toggle(next.item.id)}
                  className="tap-flat inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-[12.5px] font-semibold"
                >
                  <Check className="size-3.5" /> Mark done
                </button>
              ) : null}
              <span className="text-[11.5px] font-semibold text-muted-foreground">
                {next.section.title} · {next.section.timing}
              </span>
            </div>
          </div>
        </section>
      ) : null}

      {!signedIn ? (
        <div className="px-4 pt-4">
          <Notice title="Sign in to keep this">
            Ticks stay on this phone until you sign in.{" "}
            <Link to="/auth" search={{ next: "/setup" }} className="font-semibold underline">
              Sign in
            </Link>{" "}
            and Shekk fills in your verification, programme and money steps for you.
          </Notice>
        </div>
      ) : null}

      <div className="px-4 pb-12 pt-6">
        <SectionHead title="Every area" hint="Open one to work through it. Progress saves as you go." />
        <div className="space-y-2.5">
          {sections.map(({ section, done, total: n, pct }) => {
            const expanded = open === section.id;
            return (
              <div
                key={section.id}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-card"
              >
                <button
                  type="button"
                  onClick={() => setOpen(expanded ? null : section.id)}
                  aria-expanded={expanded}
                  className="tap-flat flex w-full items-center gap-3 p-3.5 text-left"
                >
                  <span
                    className="flex size-11 shrink-0 items-center justify-center rounded-2xl text-ink-foreground"
                    style={{ backgroundImage: section.grad }}
                  >
                    <section.Icon className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-[14px] font-semibold">{section.title}</span>
                      {done === n ? <CircleCheck className="size-4 shrink-0 text-success" /> : null}
                    </span>
                    <span className="mt-0.5 block text-[12px] leading-snug text-muted-foreground">
                      {section.purpose}
                    </span>
                    <span className="mt-2 flex items-center gap-2">
                      <ProgressBar value={pct} className="flex-1" tone={done === n ? "success" : "primary"} />
                      <span className="shrink-0 text-[11px] font-bold text-muted-foreground">
                        {done}/{n}
                      </span>
                    </span>
                  </span>
                  <ChevronDown
                    className={`size-4 shrink-0 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`}
                  />
                </button>

                {expanded ? (
                  <ul className="border-t border-border">
                    {section.items.map((item) => {
                      const done_ = isDone(item);
                      return (
                        <li key={item.id} className="flex items-start gap-3 border-b border-border/60 p-3.5 last:border-b-0">
                          {item.auto ? (
                            <span className="mt-0.5 shrink-0" title="Shekk fills this in for you">
                              {done_ ? (
                                <CircleCheck className="size-[22px] text-success" />
                              ) : (
                                <Lock className="size-[22px] text-muted-foreground" />
                              )}
                            </span>
                          ) : (
                            <button
                              type="button"
                              aria-label={done_ ? `Mark ${item.title} not done` : `Mark ${item.title} done`}
                              onClick={() => toggle(item.id)}
                              className={`tap-flat mt-0.5 grid size-[22px] shrink-0 place-items-center rounded-[7px] border transition-colors ${
                                done_ ? "border-success bg-success text-success-foreground" : "border-border bg-card"
                              }`}
                            >
                              {done_ ? <Check className="size-3.5" /> : <Circle className="size-2 opacity-0" />}
                            </button>
                          )}
                          <div className="min-w-0 flex-1">
                            <p
                              className={`text-[13.5px] font-semibold leading-snug ${done_ ? "text-muted-foreground line-through" : ""}`}
                            >
                              {item.title}
                            </p>
                            <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">{item.blurb}</p>
                            <div className="mt-1.5 flex flex-wrap items-center gap-2">
                              {item.href ? (
                                <Link to={item.href} className="text-[12px] font-bold text-primary">
                                  {item.cta ?? "Open"} →
                                </Link>
                              ) : null}
                              {item.preview ? <PreviewBadge /> : null}
                              {item.auto && !done_ ? (
                                <span className="text-[11.5px] text-muted-foreground">
                                  Ticks itself once you've done it
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="mt-6 space-y-2.5">
          <SectionHead title="Tools that do the work" hint="Assistants, not articles." />
          <Card className="grid grid-cols-2 gap-2.5">
            {[
              { to: "/explore/budget", label: "Budget planner", emoji: "🧮" },
              { to: "/explore/cost-of-living", label: "Cost calculator", emoji: "🏠" },
              { to: "/explore/ulpan", label: "Ulpan", emoji: "🗣️" },
              { to: "/explore/uni-finder", label: "Uni finder", emoji: "🎓" },
            ].map((t) => (
              <Link
                key={t.to}
                to={t.to}
                className="tap flex items-center gap-2 rounded-xl bg-muted px-3 py-2.5 text-[12.5px] font-semibold"
              >
                <span aria-hidden>{t.emoji}</span>
                {t.label}
              </Link>
            ))}
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
