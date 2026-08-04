import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import { AppShell, Notice, ScreenHeader } from "@/components/AppShell";
import { MicroLabel } from "@/components/Kit";
import { TrackGuidance } from "@/components/official/TrackGuidance";
import { UniQuestionnaire, UniShortlist } from "@/components/uni/UniFinder";
import { useLocalState } from "@/lib/local-state";
import { getTrack, type OfficialTrack } from "@/lib/official-content";
import { EMPTY_ANSWERS, answeredCount, recommend, type Answers, type UniId } from "@/lib/uni-finder";

export const Route = createFileRoute("/explore/uni")({
  head: () => ({
    meta: [
      { title: "Find your university in Israel · Shekk" },
      {
        name: "description",
        content:
          "Answer six questions about your degree, Hebrew, city, campus style, budget and religious preference, get a shortlist of Israeli universities that explains itself, then read the application guidance underneath.",
      },
      { property: "og:title", content: "Find your university in Israel · Shekk" },
      {
        property: "og:description",
        content: "Six questions, then a shortlist of Israeli universities that explains itself.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: UniApp,
});

type Saved = { answers: Answers; done: boolean; shortlist: UniId[] };

function UniApp() {
  const track = getTrack("university") as OfficialTrack;
  const { value: saved, update } = useLocalState<Saved>("shekk.unifinder.v2", {
    answers: EMPTY_ANSWERS,
    done: false,
    shortlist: [],
  });
  const [step, setStep] = useState(0);

  const { answers, done, shortlist } = saved;
  const matches = useMemo(() => recommend(answers).slice(0, 5), [answers]);
  const answered = answeredCount(answers);
  const top = matches[0];

  return (
    <AppShell>
      <ScreenHeader title="Universities" back="/israel" />

      <header className="px-4 pt-2">
        <div
          className="relative overflow-hidden rounded-[1.5rem] px-5 py-5 text-ink-foreground shadow-lift"
          style={{ backgroundImage: "var(--grad-discover)" }}
        >
          <span className="card-sheen pointer-events-none absolute inset-0" aria-hidden />
          <div className="relative">
            <MicroLabel className="opacity-70">{done ? "Best fit" : "Find your university"}</MicroLabel>
            {done ? (
              <>
                <p className="mt-2 font-display text-[1.9rem] font-bold leading-tight tracking-tight">
                  {top.uni.emoji} {top.uni.short}
                </p>
                <p className="mt-1.5 text-[12.5px] leading-relaxed opacity-85">{top.uni.character}</p>
                <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.12em] opacity-70">
                  {Math.round(top.score * 100)}% match on what you told us
                </p>
              </>
            ) : (
              <>
                <p className="mt-2 font-display text-[1.9rem] font-bold leading-tight tracking-tight">
                  Six questions. One shortlist.
                </p>
                <p className="mt-1.5 text-[12.5px] leading-relaxed opacity-85">
                  Degree, Hebrew, city, campus style, budget and how religious you want it. Every recommendation
                  explains which of your answers put it there.
                </p>
              </>
            )}
          </div>
        </div>
      </header>

      {done ? (
        <>
          <div className="px-4 pt-4">
            <Link
              to="/explore/money-planner"
              className="tap flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-[12.5px] font-bold text-primary-foreground"
            >
              <Sparkles className="size-4" /> Price up a month in {top.uni.city}
              <ArrowRight className="ml-auto size-4" />
            </Link>
          </div>

          <UniShortlist
            matches={matches}
            saved={shortlist}
            onToggleSave={(id) =>
              update({
                ...saved,
                shortlist: shortlist.includes(id) ? shortlist.filter((x) => x !== id) : [...shortlist, id].slice(-4),
              })
            }
            onRetake={() => {
              setStep(0);
              update({ ...saved, done: false });
            }}
          />

          <div className="px-4">
            <Notice title="One more step Shekk can't do for you">
              Admission depends on your grades, psychometric or SAT results and your Hebrew level. Use this shortlist
              to decide who to email first — then check entry requirements with each university directly.
            </Notice>
          </div>
        </>
      ) : (
        <>
          <UniQuestionnaire
            answers={answers}
            setAnswers={(next) => update({ ...saved, answers: next })}
            step={step}
            setStep={setStep}
            onFinish={() => update({ ...saved, done: true })}
          />
          {answered === 0 ? null : (
            <div className="px-4 pb-2">
              <MicroLabel className="text-muted-foreground">Your answers are saved as you go.</MicroLabel>
            </div>
          )}
        </>
      )}

      <TrackGuidance track={track} />
    </AppShell>
  );
}
