/**
 * Lone soldier — a rights engine, not a checklist.
 *
 * Four questions decide which of the eleven entitlements actually apply to this
 * soldier, in the order worth chasing, each with who signs it off and the Hebrew
 * sentence to say. Underneath: the monthly errand-day planner, the organisations
 * whose job is helping, the hard-week card, and the written guidance last.
 */

import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Notice, ScreenHeader } from "@/components/AppShell";
import { MicroLabel } from "@/components/Kit";
import { Dossier, HelpCard, RightsCheck, SupportDirectory, YomSiddurim } from "@/components/lone-soldier/LoneSoldier";
import { TrackGuidance } from "@/components/official/TrackGuidance";
import { useLocalState } from "@/lib/local-state";
import { EMPTY_ANSWERS, answeredCount, entitlementsFor, headline, type Answers } from "@/lib/lone-soldier";
import { getTrack, type OfficialTrack } from "@/lib/official-content";

export const Route = createFileRoute("/explore/lone-soldier")({
  head: () => ({
    meta: [
      { title: "Lone soldier rights and support · Shekk" },
      {
        name: "description",
        content:
          "Answer four questions and get the chayal boded rights that actually apply to you — recognition, rent grant, yom siddurim, flight home, discharge grant — with who approves each one and the Hebrew to say to them.",
      },
      { property: "og:title", content: "Lone soldier rights and support · Shekk" },
      {
        property: "og:description",
        content: "Your chayal boded rights, who signs them off, and the Hebrew sentence that gets them moving.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LoneSoldierApp,
});

type Saved = { answers: Answers; done: boolean };

function LoneSoldierApp() {
  const track = getTrack("lone-soldier") as OfficialTrack;
  const { value: saved, update } = useLocalState<Saved>("shekk.lonesoldier.v1", {
    answers: EMPTY_ANSWERS,
    done: false,
  });
  const [step, setStep] = useState(0);

  const { answers, done } = saved;
  const answered = answeredCount(answers);
  const items = useMemo(() => entitlementsFor(answers), [answers]);
  const lead = useMemo(() => headline(answers), [answers]);

  return (
    <AppShell>
      <ScreenHeader title="Lone soldier" back="/israel" />

      <header className="px-4 pt-2">
        <div
          className="relative overflow-hidden rounded-[1.5rem] px-5 py-5 text-ink-foreground shadow-lift"
          style={{ backgroundImage: "var(--grad-deals)" }}
        >
          <span className="card-sheen pointer-events-none absolute inset-0" aria-hidden />
          <div className="relative">
            <MicroLabel className="opacity-70">{done ? "Your dossier" : "Chayal boded"}</MicroLabel>
            {done ? (
              <>
                <p className="mt-2 font-display text-[1.9rem] font-bold leading-tight tracking-tight">{lead.title}</p>
                <p className="mt-1.5 text-[12.5px] leading-relaxed opacity-85">{lead.body}</p>
                <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.12em] opacity-70">
                  {items.length} rights apply to you
                </p>
              </>
            ) : (
              <>
                <p className="mt-2 font-display text-[1.9rem] font-bold leading-tight tracking-tight">
                  Four questions. Every right you're owed.
                </p>
                <p className="mt-1.5 text-[12.5px] leading-relaxed opacity-85">
                  Nobody hands a lone soldier a list. Tell Shekk your route, your stage and where you sleep, and it
                  will tell you what to claim, who signs it off, and exactly what to say to them in Hebrew.
                </p>
              </>
            )}
          </div>
        </div>
      </header>

      {done ? (
        <>
          <Dossier
            answers={answers}
            onRetake={() => {
              setStep(0);
              update({ ...saved, done: false });
            }}
          />
          <YomSiddurim />
          <HelpCard />
          <SupportDirectory />
          <div className="px-4 pt-4">
            <Notice title="Rates change, rights don't">
              Army payments are set yearly, so Shekk gives honest ranges instead of a figure that goes stale. Your
              mashakit tash has the current number — the point of this list is knowing to ask her at all.
            </Notice>
          </div>
        </>
      ) : (
        <>
          <RightsCheck
            answers={answers}
            setAnswers={(next) => update({ ...saved, answers: next })}
            step={step}
            setStep={setStep}
            onFinish={(next) => update({ answers: next, done: true })}
          />
          {answered === 0 ? null : (
            <div className="px-4 pb-2">
              <MicroLabel className="text-muted-foreground">Your answers are saved as you go.</MicroLabel>
            </div>
          )}
          <HelpCard />
        </>
      )}

      <TrackGuidance track={track} showSteps={false} />
    </AppShell>
  );
}
