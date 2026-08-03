import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, RotateCcw, Sparkles, TriangleAlert } from "lucide-react";
import { AppShell, Card, Notice, ScreenHeader } from "@/components/AppShell";
import { Chip, MicroLabel, ProgressBar, SectionHead } from "@/components/Kit";
import { useLocalState } from "@/lib/local-state";
import {
  EMPTY_ANSWERS,
  QUESTIONS,
  answeredCount,
  recommend,
  type Answers,
  type FieldId,
} from "@/lib/uni-finder";

export const Route = createFileRoute("/explore/uni-finder")({
  head: () => ({
    meta: [
      { title: "University Finder · Shekk" },
      {
        name: "description",
        content:
          "Answer six questions about your degree, Hebrew level, city, campus style, budget and religious preference, and get Israeli universities matched to you with the reasons explained.",
      },
      { property: "og:title", content: "University Finder · Shekk" },
      {
        property: "og:description",
        content: "Six questions, then a shortlist of Israeli universities that explains itself.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: UniFinder,
});

function UniFinder() {
  const { value: saved, update } = useLocalState("shekk.unifinder.v1", { answers: EMPTY_ANSWERS });
  const [step, setStep] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const answers = saved.answers;
  const setAnswers = (next: Answers) => update({ answers: next });

  const q = QUESTIONS[Math.min(step, QUESTIONS.length - 1)];
  const matches = useMemo(() => recommend(answers).slice(0, 5), [answers]);
  const answered = answeredCount(answers);

  const value = answers[q.key];
  const canAdvance = q.multi ? (value as FieldId[]).length > 0 : value !== null;

  if (showResults) {
    const top = matches[0];
    return (
      <AppShell>
        <ScreenHeader title="Your shortlist" back="/israel" />

        <header className="px-4 pt-2">
          <div
            className="relative overflow-hidden rounded-[1.5rem] px-5 py-5 text-ink-foreground shadow-lift"
            style={{ backgroundImage: "var(--grad-discover)" }}
          >
            <span className="card-sheen pointer-events-none absolute inset-0" aria-hidden />
            <div className="relative">
              <MicroLabel className="opacity-70">Best fit</MicroLabel>
              <p className="mt-2 font-display text-[1.9rem] font-bold leading-tight tracking-tight">
                {top.uni.emoji} {top.uni.short}
              </p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed opacity-85">{top.uni.character}</p>
              <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.12em] opacity-70">
                {Math.round(top.score * 100)}% match on what you told us
              </p>
            </div>
          </div>
        </header>

        <div className="space-y-3 px-4 pb-12 pt-6">
          <SectionHead title="Why these, in order" hint="Every line comes from an answer you gave." />
          {matches.map((m, i) => (
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
                    <span className="shrink-0 text-[12px] font-bold text-primary">
                      {Math.round(m.score * 100)}%
                    </span>
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
                </div>
              </div>
            </Card>
          ))}

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => {
                setShowResults(false);
                setStep(0);
              }}
              className="tap inline-flex items-center justify-center gap-1.5 rounded-full border border-border bg-card py-3 text-[12.5px] font-semibold"
            >
              <RotateCcw className="size-4" /> Change answers
            </button>
            <Link
              to="/explore/cost-of-living"
              className="tap inline-flex items-center justify-center gap-1.5 rounded-full bg-primary py-3 text-[12.5px] font-bold text-primary-foreground"
            >
              Price up {matches[0].uni.city} <ArrowRight className="size-4" />
            </Link>
          </div>

          <Notice title="One more step Shekk can't do for you">
            Admission depends on your grades, psychometric or SAT results and your Hebrew level. Use this shortlist
            to decide who to email first — then check the entry requirements with each university directly.
          </Notice>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <ScreenHeader title="University Finder" back="/israel" />

      <div className="px-4 pt-2">
        <div className="flex items-center justify-between px-1">
          <MicroLabel className="text-muted-foreground">
            Question {step + 1} of {QUESTIONS.length}
          </MicroLabel>
          <span className="text-[11.5px] font-bold text-muted-foreground">{answered} answered</span>
        </div>
        <ProgressBar value={(step + (canAdvance ? 1 : 0)) / QUESTIONS.length} className="mt-2" />
      </div>

      <section className="px-4 pt-6">
        <h1 className="font-display text-[1.6rem] font-bold leading-tight tracking-tight">{q.title}</h1>
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
                  window.setTimeout(() => {
                    if (step + 1 >= QUESTIONS.length) setShowResults(true);
                    else setStep(step + 1);
                  }, 180);
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
            onClick={() => {
              if (step + 1 >= QUESTIONS.length) setShowResults(true);
              else setStep(step + 1);
            }}
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
          <button
            type="button"
            onClick={() => setShowResults(true)}
            className="tap-flat mx-auto mt-4 block text-[12px] font-bold text-primary"
          >
            Skip ahead and see what I've got so far →
          </button>
        ) : null}
      </section>
    </AppShell>
  );
}
