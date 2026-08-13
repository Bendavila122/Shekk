/**
 * Lone soldier — the interactive half of the app.
 *
 * RightsCheck asks four questions. Dossier turns the answers into the specific
 * claims this soldier is owed, each with the person who signs it off and the
 * Hebrew sentence to say to them, and tracks whether it's been asked for and
 * approved. YomSiddurim turns the monthly errand day into an ordered plan.
 * SupportDirectory and HelpCard are the human fallbacks.
 */

import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, ChevronDown, Copy, MapPin, Phone } from "lucide-react";
import { Chip, MicroLabel, ProgressBar, SectionHead } from "@/components/Kit";
import { useLocalState } from "@/lib/local-state";
import {
  ERRANDS,
  HELP_LINES,
  QUESTIONS,
  SUPPORT_ORGS,
  entitlementsFor,
  planFor,
  type Answers,
  type Entitlement,
} from "@/lib/lone-soldier";
import { useOfficial } from "@/lib/useOfficial";

/* ─────────────────────────────── rights check ─────────────────────────────── */

export function RightsCheck({
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
  const current = answers[q.key];

  return (
    <section className="px-4 pt-4">
      <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
        <div className="flex items-center gap-3">
          <MicroLabel className="text-muted-foreground">
            Question {step + 1} of {QUESTIONS.length}
          </MicroLabel>
          <ProgressBar value={step / QUESTIONS.length} className="flex-1" />
        </div>

        <h2 className="mt-3 font-display text-[1.25rem] font-bold leading-tight tracking-tight">{q.title}</h2>
        <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">{q.hint}</p>

        <div className="mt-3.5 space-y-2">
          {q.options.map((o) => {
            const selected = current === o.value;
            return (
              <button
                key={o.value}
                type="button"
                aria-pressed={selected}
                onClick={() => {
                  setAnswers({ ...answers, [q.key]: o.value } as Answers);
                  if (step + 1 >= QUESTIONS.length) onFinish();
                  else setStep(step + 1);
                }}
                className={`tap-flat flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition-colors ${
                  selected ? "border-primary bg-primary-soft" : "border-border bg-card hover:bg-muted"
                }`}
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-muted text-lg">{o.emoji}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13.5px] font-semibold leading-snug">{o.label}</span>
                  <span className="mt-0.5 block text-[12px] leading-snug text-muted-foreground">{o.sub}</span>
                </span>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
              </button>
            );
          })}
        </div>

        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="tap-flat mt-3 text-[12.5px] font-semibold text-muted-foreground"
          >
            ← Back
          </button>
        ) : null}
      </div>
    </section>
  );
}

/* ─────────────────────────────── claim dossier ─────────────────────────────── */

type ClaimState = "todo" | "asked" | "done";

const CLAIM_LABEL: Record<ClaimState, string> = {
  todo: "Not asked yet",
  asked: "Asked — waiting",
  done: "Sorted",
};

function stateOf(note: string | null | undefined, done: boolean): ClaimState {
  if (done) return "done";
  return note === "asked" ? "asked" : "todo";
}

function ClaimCard({
  item,
  state,
  onSetState,
}: {
  item: Entitlement;
  state: ClaimState;
  onSetState: (next: ClaimState) => void;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  return (
    <div
      className={`overflow-hidden rounded-2xl border bg-card shadow-card ${
        state === "done" ? "border-success/40" : "border-border"
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="tap-flat flex w-full items-start gap-3 p-3.5 text-left"
      >
        <span
          className={`mt-0.5 grid size-[22px] shrink-0 place-items-center rounded-[7px] border ${
            state === "done"
              ? "border-success bg-success text-ink-foreground"
              : state === "asked"
                ? "border-primary bg-primary-soft text-primary"
                : "border-border bg-card"
          }`}
        >
          {state === "done" ? <Check className="size-3.5" /> : state === "asked" ? "…" : null}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13.5px] font-semibold leading-snug">{item.name}</span>
          <span className="mt-0.5 block text-[12px] leading-snug text-muted-foreground">{item.what}</span>
          <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-bold text-primary">
              {item.worth}
            </span>
            {item.expires ? (
              <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-bold text-destructive">
                Time-sensitive
              </span>
            ) : null}
          </span>
        </span>
        <ChevronDown
          className={`mt-1 size-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <div className="space-y-3 border-t border-border p-3.5">
          <div>
            <MicroLabel className="text-muted-foreground">Who signs it off</MicroLabel>
            <p className="mt-1 text-[12.5px] leading-relaxed">{item.approver}</p>
          </div>

          <div>
            <MicroLabel className="text-muted-foreground">Bring</MicroLabel>
            <ul className="mt-1 space-y-1">
              {item.bring.map((b) => (
                <li key={b} className="text-[12.5px] leading-snug text-muted-foreground">
                  • {b}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl bg-muted p-3">
            <MicroLabel className="text-muted-foreground">Say this</MicroLabel>
            <p className="mt-1 text-[12.5px] font-semibold leading-snug">{item.ask.en}</p>
            <p dir="rtl" className="mt-1.5 text-[13.5px] leading-snug">
              {item.ask.he}
            </p>
            <button
              type="button"
              onClick={() => {
                void navigator.clipboard?.writeText(item.ask.he);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1600);
              }}
              className="tap-flat mt-2 inline-flex items-center gap-1.5 text-[12px] font-bold text-primary"
            >
              <Copy className="size-3.5" /> {copied ? "Copied" : "Copy the Hebrew"}
            </button>
          </div>

          {item.expires ? (
            <p className="text-[12px] font-semibold leading-snug text-destructive">{item.expires}</p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            {(["todo", "asked", "done"] as ClaimState[]).map((s) => (
              <Chip key={s} selected={state === s} onClick={() => onSetState(s)}>
                {CLAIM_LABEL[s]}
              </Chip>
            ))}
          </div>

          {item.doc ? (
            <Link to="/explore/documents" className="tap-flat inline-flex items-center gap-1.5 text-[12px] font-bold text-primary">
              Keep the paperwork in your documents <ArrowRight className="size-3.5" />
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function Dossier({ answers, onRetake }: { answers: Answers; onRetake: () => void }) {
  const items = useMemo(() => entitlementsFor(answers), [answers]);
  const { tasks, saveTask } = useOfficial();

  const byKey = useMemo(() => {
    const map = new Map<string, (typeof tasks)[number]>();
    for (const t of tasks) if (t.track === "lone-soldier") map.set(t.stepKey, t);
    return map;
  }, [tasks]);

  const states = items.map((i) => {
    const row = byKey.get(`right:${i.id}`);
    return stateOf(row?.note, Boolean(row?.done));
  });
  const doneCount = states.filter((s) => s === "done").length;

  return (
    <section className="px-4 pt-4">
      <SectionHead
        title="What you're owed"
        hint="Ticks save to your account. Work down the list — each one is a single conversation."
      />

      <div className="mb-3 rounded-2xl border border-border bg-card p-3.5 shadow-card">
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-semibold">
            {doneCount} of {items.length} sorted
          </p>
          <button type="button" onClick={onRetake} className="tap-flat text-[12px] font-bold text-primary">
            Change answers
          </button>
        </div>
        <ProgressBar value={items.length ? doneCount / items.length : 0} tone="success" className="mt-2.5" />
      </div>

      <div className="space-y-2.5">
        {items.map((item, idx) => (
          <ClaimCard
            key={item.id}
            item={item}
            state={states[idx]}
            onSetState={(next) =>
              saveTask.mutate({
                track: "lone-soldier",
                stepKey: `right:${item.id}`,
                title: item.name,
                done: next === "done",
                dueOn: byKey.get(`right:${item.id}`)?.dueOn ?? null,
                note: next,
              })
            }
          />
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────── yom siddurim planner ─────────────────────────── */

export function YomSiddurim() {
  const { value, update } = useLocalState<{ picked: string[] }>("shekk.lonesoldier.siddurim.v1", { picked: [] });
  const picked = value.picked;
  const plan = useMemo(() => planFor(picked), [picked]);

  return (
    <section className="px-4 pt-6">
      <SectionHead
        title="Plan your yom siddurim"
        hint="Pick what you need to do. Shekk orders it so nothing shuts before you get there."
      />

      <div className="flex flex-wrap gap-2">
        {ERRANDS.map((e) => (
          <Chip
            key={e.id}
            selected={picked.includes(e.id)}
            onClick={() =>
              update({ picked: picked.includes(e.id) ? picked.filter((x) => x !== e.id) : [...picked, e.id] })
            }
          >
            {e.emoji} {e.label}
          </Chip>
        ))}
      </div>

      {plan.length === 0 ? (
        <p className="mt-3 text-[12.5px] leading-relaxed text-muted-foreground">
          Government offices shut around lunchtime and everything else stays open late — that's the whole trick to the
          day. Pick two or three and Shekk will put them in the right order.
        </p>
      ) : (
        <ol className="mt-3 space-y-2.5">
          {plan.map((e, i) => (
            <li key={e.id} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-card">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-[12px] font-bold text-primary-foreground">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-semibold leading-snug">
                  {e.emoji} {e.label}
                </p>
                <p className="mt-0.5 text-[12px] leading-snug text-muted-foreground">{e.why}</p>
                <p className="mt-1.5 text-[12px] leading-snug">
                  <span className="font-semibold">Hours: </span>
                  {e.hours}
                </p>
                <p className="mt-1 text-[12px] leading-snug">
                  <span className="font-semibold">Bring: </span>
                  {e.bring.join(", ")}
                </p>
                <p className="mt-1.5 text-[12px] font-semibold leading-snug text-primary">{e.tip}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

/* ──────────────────────────── support directory ──────────────────────────── */

export function SupportDirectory() {
  const [city, setCity] = useState<string>("all");
  const cities = useMemo(() => {
    const set = new Set<string>();
    for (const o of SUPPORT_ORGS) for (const c of o.cities) set.add(c);
    return ["all", ...Array.from(set)];
  }, []);
  const shown = SUPPORT_ORGS.filter((o) => city === "all" || o.cities.includes(city));

  return (
    <section className="px-4 pt-6">
      <SectionHead title="People whose job is helping you" hint="What each one is actually good for, and what to ask." />

      <div className="mb-3 flex flex-wrap gap-2">
        {cities.map((c) => (
          <Chip key={c} selected={city === c} onClick={() => setCity(c)}>
            {c === "all" ? "Everywhere" : c}
          </Chip>
        ))}
      </div>

      <div className="space-y-2.5">
        {shown.map((o) => (
          <div key={o.id} className="rounded-2xl border border-border bg-card p-3.5 shadow-card">
            <p className="text-[13.5px] font-semibold leading-snug">
              {o.emoji} {o.name}
            </p>
            <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{o.what}</p>
            <p className="mt-1.5 text-[12px] leading-snug">
              <span className="font-semibold">Ask them about: </span>
              {o.ask}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
                {o.cities.join(" · ")}
              </span>
              {o.maps ? (
                <Link
                  to="/explore/maps"
                  search={{ q: o.maps } as never}
                  className="tap-flat inline-flex items-center gap-1.5 text-[12px] font-bold text-primary"
                >
                  <MapPin className="size-3.5" /> Find it
                </Link>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────── hard week ─────────────────────────────── */

export function HelpCard() {
  return (
    <section className="px-4 pt-4">
      <div className="rounded-2xl border border-destructive/25 bg-destructive/5 p-4">
        <MicroLabel className="text-destructive">If this week is hard</MicroLabel>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">
          Being far from your family is the part nobody prepares you for. Asking is normal and it is confidential.
        </p>
        <ul className="mt-3 space-y-2">
          {HELP_LINES.map((h) => (
            <li key={h.id} className="flex items-start gap-3">
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-semibold leading-snug">{h.label}</span>
                <span className="mt-0.5 block text-[12px] leading-snug text-muted-foreground">{h.detail}</span>
              </span>
              {h.number ? (
                <a
                  href={`tel:${h.number.replace(/[^0-9+]/g, "")}`}
                  className="tap-flat inline-flex shrink-0 items-center gap-1.5 rounded-full bg-destructive px-3 py-1.5 text-[12px] font-bold text-ink-foreground"
                >
                  <Phone className="size-3.5" /> {h.number}
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
