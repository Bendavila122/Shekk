/**
 * Secondary guidance for a category hub.
 *
 * The hero of Universities and Army is now a tool, not an article — so the
 * written track sits underneath, collapsed, as the thing you open when the
 * tool has raised a question. Steps still save to the account.
 */

import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, ChevronDown, FolderLock } from "lucide-react";
import { SectionHead } from "@/components/Kit";
import { GuideBlockView } from "@/lib/guide-blocks";
import { useGuidePrefs } from "@/lib/guide-prefs";
import type { OfficialTrack } from "@/lib/official-content";
import { useOfficial } from "@/lib/useOfficial";

function Fold({
  title,
  hint,
  badge,
  children,
}: {
  title: string;
  hint?: string;
  badge?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="tap-flat flex w-full items-center gap-3 p-3.5 text-left"
      >
        <span className="min-w-0 flex-1">
          <span className="block text-[13.5px] font-semibold leading-snug">{title}</span>
          {hint ? (
            <span className="mt-0.5 block text-[12px] leading-snug text-muted-foreground">{hint}</span>
          ) : null}
        </span>
        {badge ? (
          <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
            {badge}
          </span>
        ) : null}
        <ChevronDown
          className={`size-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open ? <div className="border-t border-border p-3.5">{children}</div> : null}
    </div>
  );
}

export function TrackGuidance({ track, showSteps = true }: { track: OfficialTrack; showSteps?: boolean }) {
  const { prefs, toggleCheck } = useGuidePrefs();
  const { tasks, saveTask } = useOfficial();

  const byKey = useMemo(() => {
    const map = new Map<string, (typeof tasks)[number]>();
    for (const t of tasks) if (t.track === track.id) map.set(t.stepKey, t);
    return map;
  }, [tasks, track.id]);

  const doneCount = track.steps.filter((s) => byKey.get(s.key)?.done).length;

  return (
    <section className="px-4 pb-12 pt-2">
      <SectionHead title="Supporting guidance" hint="Open a section when the tool above raises a question." />

      <div className="space-y-2.5">
        {showSteps ? (
        <Fold
          title="Your steps"
          hint="Ticks save to your account, not this phone."
          badge={`${doneCount}/${track.steps.length}`}
        >
          <ul className="space-y-2.5">
            {track.steps.map((step) => {
              const row = byKey.get(step.key);
              const done = Boolean(row?.done);
              return (
                <li key={step.key} className="flex items-start gap-3">
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
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-[13px] font-semibold leading-snug ${
                        done ? "text-muted-foreground line-through" : ""
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className="mt-0.5 text-[11.5px] leading-snug text-muted-foreground">{step.detail}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </Fold>
        ) : null}

        {track.sections.map((s, si) => (
          <Fold key={s.heading} title={s.heading}>
            <div className="space-y-3.5">
              {s.blocks.map((b, bi) => (
                <GuideBlockView
                  key={`${si}-${bi}`}
                  block={b}
                  checked={b.kind === "checklist" ? prefs.checks[`official:${track.id}:${b.id}`] ?? [] : undefined}
                  onCheck={
                    b.kind === "checklist" ? (index) => toggleCheck(`official:${track.id}:${b.id}`, index) : undefined
                  }
                />
              ))}
            </div>
          </Fold>
        ))}
      </div>

      <Link
        to="/explore/documents"
        className="tap mt-3 flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-card"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">
          <FolderLock className="size-4.5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13.5px] font-semibold">Your documents</span>
          <span className="mt-0.5 block text-[12px] text-muted-foreground">
            Private to your account. Upload once, have it on you.
          </span>
        </span>
        <span className="shrink-0 text-sm font-semibold text-primary">→</span>
      </Link>
    </section>
  );
}
