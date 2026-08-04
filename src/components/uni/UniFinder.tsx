/**
 * Find Your University — the hero of the Universities category.
 *
 * Six questions, then a shortlist that explains every line of itself. This
 * lives inside /explore/uni rather than as its own mini app, so the category
 * opens on the tool and the written guidance sits underneath.
 */

import { ArrowLeft, ArrowRight, Bookmark, Check, RotateCcw, Sparkles, TriangleAlert } from "lucide-react";
import { Card } from "@/components/AppShell";
import { Chip, MicroLabel, ProgressBar, SectionHead } from "@/components/Kit";
import {
  QUESTIONS,
  answeredCount,
  type Answers,
  type FieldId,
  type Match,
  type UniId,
} from "@/lib/uni-finder";

export function UniQuestionnaire({
  answers,
  setAnswers,
  step,
  setStep,
  onFinish,
}: {
  answers: Answers;
  setAnswers: (next: Answers) => void;
  step: number;
  setStep: (n: number) => void;
  onFinish: () => void;
}) {
  const q = QUESTIONS[Math.min(step, QUESTIONS.length - 1)];
  const answered = answeredCount(answers);
  const value = answers[q.key];
  const canAdvance = q.multi ? (value as FieldId[]).length > 0 : value !== null;

  const advance = () => {
    if (step + 1 >= QUESTIONS.length) onFinish();
    else setStep(step + 1);
  };

  return (
    <section className="px-4 pb-12 pt-2">
      <div className="flex items-center justify-between px-1">
        <MicroLabel className="text-muted-foreground">
          Question {step + 1} of {QUESTIONS.length}
        </MicroLabel>
        <span className="text-[11.5px] font-bold text-muted-foreground">{answered} answered</span>
      </div>
      <ProgressBar value={(step + (canAdvance ? 1 : 0)) / QUESTIONS.length} className="mt-2" />

      <h2 className="mt-6 font-display text-[1.6rem] font-bold leading-tight tracking-tight">{q.title}</h2>
      <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{q.hint}</p>

      <div className={`mt-5 ${q.multi ? "flex flex-wrap gap-2" : "space-y-2"}`}>
        {q.options.map((opt) =>
          q.multi ? (
            <Chip
              key={opt.value}
              selected={(answers.fields as string[]).includes(opt.value)}
              onClick={() => {
                const list = answers.fields;
                const next = list.includes(opt.value as FieldId)
                  ? list.filter((x) => x !== opt.value)
                  : [...list, opt.value as FieldId].slice(-3);
                setAnswers({ ...answers, fields: next });
              }}
            >
              {opt.emoji} {opt.label}
            </Chip>
          ) : (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                setAnswers({ ...answers, [q.key]: opt.value } as Answers);
                window.setTimeout(advance, 180);
              }}
              className={`tap flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left ${
                (answers[q.key] as string | null) === opt.value
                  ? "border-primary bg-primary-soft"
                  : "border-border bg-card shadow-card"
              }`}
            >
              <span className="text-lg" aria-hidden>
                {opt.emoji}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13.5px] font-semibold">{opt.label}</span>
                {opt.sub ? (
                  <span className="mt-0.5 block text-[12px] leading-snug text-muted-foreground">{opt.sub}</span>
                ) : null}
              </span>
              {(answers[q.key] as string | null) === opt.value ? (
                <Check className="size-4 shrink-0 text-primary" />
              ) : null}
            </button>
          ),
        )}
      </div>

      <div className="mt-6 flex items-center gap-2.5">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="tap inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-3 text-[12.5px] font-semibold"
          >
            <ArrowLeft className="size-4" /> Back
          </button>
        ) : null}
        <button
          type="button"
          disabled={!canAdvance}
          onClick={advance}
          className="tap inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-primary py-3 text-[12.5px] font-bold text-primary-foreground disabled:opacity-40"
        >
          {step + 1 >= QUESTIONS.length ? (
            <>
              <Sparkles className="size-4" /> See my shortlist
            </>
          ) : (
            <>
              Next <ArrowRight className="size-4" />
            </>
          )}
        </button>
      </div>

      {answered >= 2 ? (
        <button type="button" onClick={onFinish} className="tap-flat mx-auto mt-4 block text-[12px] font-bold text-primary">
          Skip ahead and see what I've got so far →
        </button>
      ) : null}
    </section>
  );
}

export function UniShortlist({
  matches,
  saved,
  onToggleSave,
  onRetake,
}: {
  matches: Match[];
  saved: UniId[];
  onToggleSave: (id: UniId) => void;
  onRetake: () => void;
}) {
  const savedMatches = matches.filter((m) => saved.includes(m.uni.id));

  return (
    <div className="space-y-3 px-4 pb-8 pt-2">
      {savedMatches.length >= 2 ? (
        <section>
          <SectionHead title="Side by side" hint="The ones you saved, compared on what you told us." />
          <div className="-mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {savedMatches.map((m) => (
              <Card key={m.uni.id} className="w-[15rem] shrink-0">
                <p className="text-[13.5px] font-semibold leading-snug">
                  {m.uni.emoji} {m.uni.short}
                </p>
                <p className="mt-0.5 text-[11.5px] text-muted-foreground">{m.uni.city}</p>
                <ProgressBar value={m.score} className="mt-2" />
                <dl className="mt-2.5 space-y-1.5 text-[11.5px]">
                  {(
                    [
                      ["Match", `${Math.round(m.score * 100)}%`],
                      ["English", m.uni.english === "many" ? "Lots of options" : m.uni.english === "some" ? "Some options" : "Few options"],
                      ["Cost", m.uni.budget === "lean" ? "Cheaper city" : m.uni.budget === "middle" ? "Middling" : "Expensive"],
                      ["Feel", m.uni.campus === "campus" ? "Real campus" : m.uni.campus === "urban" ? "City-woven" : "Compact"],
                    ] as [string, string][]
                  ).map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-2">
                      <dt className="text-muted-foreground">{k}</dt>
                      <dd className="text-right font-semibold">{v}</dd>
                    </div>
                  ))}
                </dl>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      <SectionHead title="Why these, in order" hint="Every line comes from an answer you gave." />
      {matches.map((m, i) => {
        const isSaved = saved.includes(m.uni.id);
        return (
          <Card key={m.uni.id}>
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-muted text-lg" aria-hidden>
                {m.uni.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-[14px] font-semibold leading-snug">
                    {i + 1}. {m.uni.name}
                  </p>
                  <span className="shrink-0 text-[12px] font-bold text-primary">{Math.round(m.score * 100)}%</span>
                </div>
                <p className="mt-0.5 text-[12px] text-muted-foreground">
                  {m.uni.city} · {m.uni.character}
                </p>
                <ProgressBar value={m.score} className="mt-2.5" />
                <ul className="mt-3 space-y-1.5">
                  {m.reasons.map((r) => (
                    <li key={r} className="flex gap-2 text-[12.5px] leading-snug">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-success" />
                      <span>{r}</span>
                    </li>
                  ))}
                  {m.watch ? (
                    <li className="flex gap-2 text-[12.5px] leading-snug text-muted-foreground">
                      <TriangleAlert className="mt-0.5 size-3.5 shrink-0 text-warning" />
                      <span>{m.watch}</span>
                    </li>
                  ) : null}
                </ul>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {m.uni.notes.map((n) => (
                    <span key={n} className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold">
                      {n}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => onToggleSave(m.uni.id)}
                  className={`tap mt-3 inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-bold ${
                    isSaved ? "bg-primary-soft text-primary" : "border border-border bg-card"
                  }`}
                >
                  <Bookmark className={`size-3.5 ${isSaved ? "fill-current" : ""}`} />
                  {isSaved ? "On your shortlist" : "Save to shortlist"}
                </button>
              </div>
            </div>
          </Card>
        );
      })}

      <button
        type="button"
        onClick={onRetake}
        className="tap inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-border bg-card py-3 text-[12.5px] font-semibold"
      >
        <RotateCcw className="size-4" /> Change my answers
      </button>
    </div>
  );
}
