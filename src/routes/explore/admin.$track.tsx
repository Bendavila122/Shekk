import { useMemo, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CalendarClock, Check, ChevronLeft, Clock, Paperclip } from "lucide-react";
import { AppShell, ScreenHeader } from "@/components/AppShell";
import { GuideBlockView } from "@/lib/guide-blocks";
import { useGuidePrefs } from "@/lib/guide-prefs";
import { TRACKS, docCategory, getTrack, type OfficialTrack } from "@/lib/official-content";
import { useOfficial } from "@/lib/useOfficial";

export const Route = createFileRoute("/explore/admin/$track")({
  loader: ({ params }) => {
    const track = getTrack(params.track);
    if (!track) throw notFound();
    return { track };
  },
  head: ({ loaderData }) => {
    const t = loaderData?.track;
    const title = t ? `${t.name} · Shekk Official` : "Official · Shekk";
    const description = t?.blurb ?? "Paperwork for a gap year in Israel, explained.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  errorComponent: () => (
    <AppShell>
      <ScreenHeader title="Official" />
      <div className="px-5 py-10 text-center text-sm text-muted-foreground">
        We couldn't open that track.{" "}
        <Link to="/explore/admin" className="font-semibold text-primary">
          Back to Official
        </Link>
      </div>
    </AppShell>
  ),
  notFoundComponent: () => (
    <AppShell>
      <ScreenHeader title="Official" />
      <div className="px-5 py-10 text-center text-sm text-muted-foreground">
        That track doesn't exist.{" "}
        <Link to="/explore/admin" className="font-semibold text-primary">
          Back to Official
        </Link>
      </div>
    </AppShell>
  ),
  component: TrackScreen,
});

function fmtMonth(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

function TrackScreen() {
  const { track } = Route.useLoaderData() as { track: OfficialTrack };
  const { prefs, toggleCheck } = useGuidePrefs();
  const { tasks, saveTask, clearTask } = useOfficial();
  const [openStep, setOpenStep] = useState<string | null>(null);

  const byKey = useMemo(() => {
    const map = new Map<string, (typeof tasks)[number]>();
    for (const t of tasks) if (t.track === track.id) map.set(t.stepKey, t);
    return map;
  }, [tasks, track.id]);

  const doneCount = track.steps.filter((s) => byKey.get(s.key)?.done).length;
  const others = TRACKS.filter((t) => t.id !== track.id);

  return (
    <AppShell>
      <ScreenHeader title={track.name} />

      <article className="px-5 pt-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Official</p>
        <h1 className="mt-1 font-display text-3xl font-bold leading-tight tracking-tight">
          <span className="mr-2">{track.emoji}</span>
          {track.name}
        </h1>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" /> {track.readMins} min read
          </span>
          <span className="inline-flex items-center gap-1">
            <CalendarClock className="size-3.5" /> Checked {fmtMonth(track.updated)}
          </span>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{track.intro}</p>

        <div className="mt-5 rounded-2xl border border-border bg-card p-4 shadow-card">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            The short version
          </p>
          <ul className="mt-2 space-y-1.5">
            {track.tldr.map((t) => (
              <li key={t} className="flex gap-2 text-[13px] leading-snug">
                <span className="text-primary">•</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Your own checklist, saved to your account. */}
        <section className="mt-7">
          <div className="flex items-end justify-between gap-3">
            <h2 className="text-[17px] font-bold leading-tight tracking-tight">Your steps</h2>
            <span className="text-[11.5px] font-semibold text-muted-foreground">
              {doneCount}/{track.steps.length} done
            </span>
          </div>
          <p className="mt-1 text-[12.5px] leading-snug text-muted-foreground">
            Ticks and dates are saved to your account, not this phone.
          </p>

          <ul className="mt-3 space-y-2">
            {track.steps.map((step) => {
              const row = byKey.get(step.key);
              const done = Boolean(row?.done);
              const open = openStep === step.key;
              return (
                <li key={step.key} className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
                  <div className="flex items-start gap-3 p-3.5">
                    <button
                      type="button"
                      aria-label={done ? `Mark ${step.title} not done` : `Mark ${step.title} done`}
                      onClick={() =>
                        saveTask.mutate({
                          track: track.id,
                          stepKey: step.key,
                          title: step.title,
                          done: !done,
                          dueOn: row?.dueOn ?? null,
                          note: row?.note ?? null,
                        })
                      }
                      className={`mt-0.5 grid size-[22px] shrink-0 place-items-center rounded-[7px] border transition-colors ${
                        done ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"
                      }`}
                    >
                      {done ? <Check className="size-3.5" /> : null}
                    </button>
                    <button
                      type="button"
                      onClick={() => setOpenStep(open ? null : step.key)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <p className={`text-[13.5px] font-semibold leading-snug ${done ? "text-muted-foreground line-through" : ""}`}>
                        {step.title}
                      </p>
                      <p className="mt-0.5 text-[12px] leading-snug text-muted-foreground">{step.detail}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        {row?.dueOn ? (
                          <span className="rounded-full bg-warning-soft px-2 py-0.5 text-[10.5px] font-semibold text-warning-foreground">
                            Due {new Date(row.dueOn).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                          </span>
                        ) : null}
                        {step.needsDoc ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10.5px] font-semibold text-muted-foreground">
                            <Paperclip className="size-3" />
                            {docCategory(step.needsDoc).label}
                          </span>
                        ) : null}
                        {row?.note ? (
                          <span className="truncate text-[11px] italic text-muted-foreground">{row.note}</span>
                        ) : null}
                      </div>
                    </button>
                  </div>

                  {open ? (
                    <div className="space-y-2.5 border-t border-border bg-muted/50 p-3.5">
                      <label className="block">
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Due date
                        </span>
                        <input
                          type="date"
                          value={row?.dueOn ?? ""}
                          onChange={(e) =>
                            saveTask.mutate({
                              track: track.id,
                              stepKey: step.key,
                              title: step.title,
                              done,
                              dueOn: e.target.value || null,
                              note: row?.note ?? null,
                            })
                          }
                          className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-2 text-[13px]"
                        />
                      </label>
                      <label className="block">
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Note
                        </span>
                        <input
                          type="text"
                          maxLength={500}
                          defaultValue={row?.note ?? ""}
                          placeholder="Appointment time, reference number, who you spoke to"
                          onBlur={(e) =>
                            saveTask.mutate({
                              track: track.id,
                              stepKey: step.key,
                              title: step.title,
                              done,
                              dueOn: row?.dueOn ?? null,
                              note: e.target.value,
                            })
                          }
                          className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-2 text-[13px]"
                        />
                      </label>
                      <div className="flex items-center gap-3">
                        {step.needsDoc ? (
                          <Link
                            to="/explore/admin/documents"
                            search={{ category: step.needsDoc }}
                            className="tap-flat text-[12px] font-semibold text-primary"
                          >
                            Upload the {docCategory(step.needsDoc).label.toLowerCase()} file
                          </Link>
                        ) : null}
                        {row ? (
                          <button
                            type="button"
                            onClick={() => {
                              clearTask.mutate({ track: track.id, stepKey: step.key });
                              setOpenStep(null);
                            }}
                            className="tap-flat ml-auto text-[12px] font-semibold text-destructive"
                          >
                            Reset step
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>

        {/* The written track. */}
        <div className="mt-9 space-y-8">
          {track.sections.map((s, si) => (
            <section key={s.heading}>
              <h2 className="text-[17px] font-bold leading-tight tracking-tight">{s.heading}</h2>
              <div className="mt-3 space-y-3.5">
                {s.blocks.map((b, bi) => (
                  <GuideBlockView
                    key={`${si}-${bi}`}
                    block={b}
                    checked={b.kind === "checklist" ? prefs.checks[`official:${track.id}:${b.id}`] ?? [] : undefined}
                    onCheck={
                      b.kind === "checklist"
                        ? (index) => toggleCheck(`official:${track.id}:${b.id}`, index)
                        : undefined
                    }
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </article>

      <section className="mt-9 px-5">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Other tracks</h2>
        <div className="mt-1 divide-y divide-border">
          {others.map((t) => (
            <Link
              key={t.id}
              to="/explore/admin/$track"
              params={{ track: t.id }}
              className="tap-flat flex items-start gap-3 py-4"
            >
              <span className="text-lg leading-none">{t.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold leading-tight">{t.name}</p>
                <p className="mt-0.5 line-clamp-1 text-[12px] text-muted-foreground">{t.tagline}</p>
              </div>
            </Link>
          ))}
        </div>
        <Link to="/explore/admin" className="tap-flat mt-4 inline-flex items-center gap-1 text-[12px] font-semibold text-primary">
          <ChevronLeft className="size-3.5" /> All of Official
        </Link>
      </section>

      <div className="pb-12" />
    </AppShell>
  );
}
