/**
 * One paperwork app — Visa, Army, Lone soldier or Uni.
 *
 * Each of those mini apps is the same shape: the written track, the member's
 * own saved checklist, the documents that track keeps asking for, and links
 * across to its sibling apps.
 */

import { useMemo, useState } from "react";
import { Link, type LinkProps } from "@tanstack/react-router";
import { CalendarClock, Check, Clock, Paperclip } from "lucide-react";
import { AppShell, ScreenHeader } from "@/components/AppShell";
import { DocumentVault } from "@/components/official/DocumentVault";
import { GuideBlockView } from "@/lib/guide-blocks";
import { useGuidePrefs } from "@/lib/guide-prefs";
import { TRACKS, docCategory, type DocCategoryId, type OfficialTrack, type TrackId } from "@/lib/official-content";
import { useOfficial } from "@/lib/useOfficial";

/** Where each track lives now that they're separate apps. */
export const TRACK_ROUTES: Record<TrackId, LinkProps["to"]> = {
  visa: "/explore/visa",
  army: "/explore/army",
  "lone-soldier": "/explore/lone-soldier",
  university: "/explore/uni",
};

function fmtMonth(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

export function TrackApp({ track }: { track: OfficialTrack }) {
  const { prefs, toggleCheck } = useGuidePrefs();
  const { tasks, saveTask, clearTask } = useOfficial();
  const [openStep, setOpenStep] = useState<string | null>(null);

  const byKey = useMemo(() => {
    const map = new Map<string, (typeof tasks)[number]>();
    for (const t of tasks) if (t.track === track.id) map.set(t.stepKey, t);
    return map;
  }, [tasks, track.id]);

  const docCategories = useMemo(() => {
    const set: DocCategoryId[] = [];
    for (const s of track.steps) if (s.needsDoc && !set.includes(s.needsDoc)) set.push(s.needsDoc);
    if (!set.includes("other")) set.push("other");
    return set;
  }, [track.steps]);

  const doneCount = track.steps.filter((s) => byKey.get(s.key)?.done).length;
  const others = TRACKS.filter((t) => t.id !== track.id);

  return (
    <AppShell>
      <ScreenHeader title={track.name} />

      <article className="px-5 pt-2">
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
                      <p
                        className={`text-[13.5px] font-semibold leading-snug ${
                          done ? "text-muted-foreground line-through" : ""
                        }`}
                      >
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
                      {row ? (
                        <button
                          type="button"
                          onClick={() => {
                            clearTask.mutate({ track: track.id, stepKey: step.key });
                            setOpenStep(null);
                          }}
                          className="tap-flat text-[12px] font-semibold text-destructive"
                        >
                          Reset step
                        </button>
                      ) : null}
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

      {/* The paperwork this track keeps asking for. */}
      <section className="mt-9 px-4">
        <h2 className="px-1 text-[17px] font-bold leading-tight tracking-tight">Your documents</h2>
        <p className="mb-3 mt-1 px-1 text-[12.5px] leading-snug text-muted-foreground">
          Private to your account. Have the file on you before you walk into an office.
        </p>
        <DocumentVault categories={docCategories} />
        <Link to="/explore/documents" className="tap-flat mt-3 inline-block px-1 text-[12px] font-semibold text-primary">
          Open the full vault
        </Link>
      </section>

      <section className="mt-9 px-5">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Also useful</h2>
        <div className="mt-1 divide-y divide-border">
          {others.map((t) => (
            <Link key={t.id} to={TRACK_ROUTES[t.id]} className="tap-flat flex items-start gap-3 py-4">
              <span className="text-lg leading-none">{t.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold leading-tight">{t.name}</p>
                <p className="mt-0.5 line-clamp-1 text-[12px] text-muted-foreground">{t.tagline}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="pb-12" />
    </AppShell>
  );
}
