/**
 * Learning paths — the "what will I be able to do" spine of Ulpan.
 *
 * A path is a promise ("get out of the airport without English"), broken into
 * stages of five-ish phrases. A stage completes when every phrase in it is
 * marked learned, which is what pays out the XP.
 */

import { useState } from "react";
import { Check, ChevronDown, Lock, Volume2 } from "lucide-react";
import { Card } from "@/components/AppShell";
import { MicroLabel, ProgressBar, SectionHead } from "@/components/Kit";
import { PATHS, pathStagePhrases, type Phrase } from "@/lib/ulpan-content";

function speak(phrase: Phrase) {
  try {
    const u = new SpeechSynthesisUtterance(phrase.he);
    u.lang = "he-IL";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch {
    /* no speech synthesis — the transliteration is still there */
  }
}

export function PathsView({
  learned,
  onLearn,
}: {
  learned: string[];
  onLearn: (id: string) => void;
}) {
  const [openStage, setOpenStage] = useState<string | null>(PATHS[0].stages[0].id);

  return (
    <div className="space-y-7 px-4 pb-12 pt-5">
      {PATHS.map((path) => {
        const all = path.stages.flatMap((s) => s.phraseIds);
        const knownAll = all.filter((id) => learned.includes(id)).length;
        const complete = knownAll === all.length;

        return (
          <section key={path.id}>
            <div
              className="relative overflow-hidden rounded-[1.25rem] px-4 py-4 text-ink-foreground shadow-lift"
              style={{ backgroundImage: path.grad }}
            >
              <span className="card-sheen pointer-events-none absolute inset-0" aria-hidden />
              <div className="relative">
                <MicroLabel className="opacity-70">{complete ? "Path complete" : "Learning path"}</MicroLabel>
                <p className="mt-1.5 font-display text-[1.35rem] font-bold leading-tight tracking-tight">
                  {path.emoji} {path.name}
                </p>
                <p className="mt-1 text-[12.5px] leading-relaxed opacity-85">{path.promise}</p>
                <ProgressBar value={knownAll / all.length} tone="onDark" className="mt-3" />
                <p className="mt-1.5 text-[11px] font-bold uppercase tracking-[0.12em] opacity-70">
                  {knownAll} of {all.length} phrases
                </p>
              </div>
            </div>

            <div className="mt-3 space-y-2">
              {path.stages.map((stage, si) => {
                const phrases = pathStagePhrases(stage);
                const known = phrases.filter((p) => learned.includes(p.id)).length;
                const stageDone = known === phrases.length;
                const prev = path.stages[si - 1];
                const prevDone = !prev || prev.phraseIds.every((id) => learned.includes(id));
                const open = openStage === stage.id;

                return (
                  <div
                    key={stage.id}
                    className={`overflow-hidden rounded-2xl border bg-card shadow-card ${
                      stageDone ? "border-success/40" : "border-border"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenStage(open ? null : stage.id)}
                      aria-expanded={open}
                      className="tap-flat flex w-full items-center gap-3 p-3.5 text-left"
                    >
                      <span
                        className={`grid size-9 shrink-0 place-items-center rounded-xl text-[12.5px] font-bold ${
                          stageDone
                            ? "bg-success-soft text-success"
                            : prevDone
                              ? "bg-primary-soft text-primary"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {stageDone ? <Check className="size-4" /> : prevDone ? si + 1 : <Lock className="size-3.5" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13.5px] font-semibold leading-snug">{stage.title}</span>
                        <span className="mt-0.5 block text-[11.5px] leading-snug text-muted-foreground">
                          {stage.blurb}
                        </span>
                      </span>
                      <span className="shrink-0 text-[11.5px] font-bold text-muted-foreground">
                        {known}/{phrases.length}
                      </span>
                      <ChevronDown
                        className={`size-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
                      />
                    </button>

                    {open ? (
                      <ul className="divide-y divide-border border-t border-border">
                        {phrases.map((p) => {
                          const isKnown = learned.includes(p.id);
                          return (
                            <li key={p.id} className="flex items-center gap-3 p-3.5">
                              <button
                                type="button"
                                aria-label={`Hear ${p.translit}`}
                                onClick={() => speak(p)}
                                className="tap-flat grid size-9 shrink-0 place-items-center rounded-full bg-muted text-foreground/70"
                              >
                                <Volume2 className="size-4" />
                              </button>
                              <div className="min-w-0 flex-1">
                                <p dir="rtl" className="text-[16px] font-bold leading-tight">
                                  {p.he}
                                </p>
                                <p className="text-[12.5px] font-semibold text-primary">{p.translit}</p>
                                <p className="text-[11.5px] leading-snug text-muted-foreground">{p.en}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => onLearn(p.id)}
                                aria-label={isKnown ? `Unlearn ${p.translit}` : `Mark ${p.translit} learned`}
                                className={`tap grid size-9 shrink-0 place-items-center rounded-full ${
                                  isKnown
                                    ? "bg-success-soft text-success"
                                    : "border border-border bg-card text-muted-foreground"
                                }`}
                              >
                                <Check className="size-4" />
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      <Card>
        <SectionHead title="Why paths, not lessons" />
        <p className="text-[12.5px] leading-relaxed text-muted-foreground">
          Each path is one real situation you'll be in during your first month. Finish a stage and you can do that
          thing — not "cover" it.
        </p>
      </Card>
    </div>
  );
}
