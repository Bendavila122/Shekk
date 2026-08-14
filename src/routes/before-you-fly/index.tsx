import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Circle, Clock, GraduationCap, PlaneTakeoff, Sparkles } from "lucide-react";
import { AppShell, Card, Notice, ScreenHeader } from "@/components/AppShell";
import { Milestone } from "@/components/Kit";
import { useApp } from "@/lib/store";
import { useProfile } from "@/lib/useProfile";
import { useProgramme, useTravel } from "@/lib/useProgramme";
import { useHealth } from "@/lib/useHealth";
import { useOfficial } from "@/lib/useOfficial";
import { BEFORE_YOU_FLY_STEPS, type StepDef, type StepId } from "@/lib/before-you-fly";

export const Route = createFileRoute("/before-you-fly/")({
  head: () => ({
    meta: [
      { title: "Before you fly · Shekk" },
      {
        name: "description",
        content:
          "A guided pre-arrival checklist for Israel: join your programme, verify your identity, prepare money and your card, sort an eSIM and insurance, and read the arrival guide.",
      },
      { property: "og:title", content: "Before you fly · Shekk" },
      {
        property: "og:description",
        content: "Everything to sort in the weeks before you land in Israel, in one guided checklist.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BeforeYouFly,
});

type Status = "done" | "todo" | "preview";

const TONE_LABEL: Record<StepDef["tone"], string> = {
  finance: "Money",
  setup: "Israel setup",
  life: "Daily life",
};

function BeforeYouFly() {
  const { state, signedIn } = useApp();
  const profile = useProfile();
  const { joined } = useProgramme();
  const { travel, daysToArrival } = useTravel();

  const hasTravelBasics = Boolean(
    (state.name?.trim() || profile.profile?.legalFirstName) &&
      (travel.arrivalDate || state.profile.arrivalDateISO),
  );

  const status: Record<StepId, Status> = {
    programme: joined ? "done" : "todo",
    profile: hasTravelBasics ? "done" : "todo",
    kyc: profile.verified ? "done" : "todo",
    money: state.balance > 0 ? "done" : "todo",
    card: "preview",
    esim: "preview",
    insurance: "preview",
    health: cards.length > 0 ? "done" : "todo",
    documents: documents.length > 0 ? "done" : "todo",
    arrival: "todo",
    packing: "todo",
    emergency: "todo",
  };

  const trackable = BEFORE_YOU_FLY_STEPS.filter((s) => status[s.id] !== "preview");
  const done = trackable.filter((s) => status[s.id] === "done").length;
  const pct = trackable.length ? Math.round((done / trackable.length) * 100) : 0;
  /* The one thing worth doing now: the earliest step Shekk can still see is open. */
  const next = BEFORE_YOU_FLY_STEPS.find((s) => status[s.id] === "todo") ?? null;
  const complete = trackable.length > 0 && done === trackable.length;

  return (
    <AppShell>
      <ScreenHeader title="Before you fly" subtitle="Your pre-arrival checklist" back="/israel" />


      <header className="px-5 pt-5">
        <div className="grad-balance relative overflow-hidden rounded-[1.5rem] px-5 py-5 text-ink-foreground shadow-lift">
          <span className="card-sheen pointer-events-none absolute inset-0" aria-hidden />
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-foreground/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest">
              <PlaneTakeoff className="size-3" /> Before you fly
            </span>
            <p className="mt-2.5 font-display text-3xl font-bold leading-tight tracking-tight">
              {daysToArrival === null
                ? "Get ready for Israel"
                : daysToArrival > 0
                  ? `${daysToArrival} ${daysToArrival === 1 ? "day" : "days"} to go`
                  : "You're in Israel"}
            </p>
            <p className="mt-1 text-[12px] opacity-75">
              {done} of {trackable.length} steps done
            </p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink-foreground/20">
              <div className="h-full rounded-full bg-ink-foreground/80" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>
      </header>

      {!signedIn ? (
        <div className="px-4 pt-4">
          <Notice title="Sign in to track your progress">
            You can read every step now.{" "}
            <Link to="/auth"
                search={{ next: "/before-you-fly" }} className="font-semibold underline">
              Sign in
            </Link>{" "}
            to have Shekk tick them off as you go.
          </Notice>
        </div>
      ) : null}

      <div className="space-y-2.5 px-4 pb-10 pt-5">
        {BEFORE_YOU_FLY_STEPS.map((step, i) => {
          const s = status[step.id];
          return (
            <Link key={step.id} to={step.href} className="tap block">
              <Card className="flex items-start gap-3">
                <span className="mt-0.5 shrink-0">
                  {s === "done" ? (
                    <CheckCircle2 className="size-5 text-success" />
                  ) : s === "preview" ? (
                    <Clock className="size-5 text-muted-foreground" />
                  ) : (
                    <Circle className="size-5 text-muted-foreground" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Step {i + 1} · {TONE_LABEL[step.tone]}
                    </span>
                    {s === "preview" ? (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                        Preview
                      </span>
                    ) : null}
                  </span>
                  <span
                    className={`mt-1 block text-sm font-semibold ${s === "done" ? "text-muted-foreground" : ""}`}
                  >
                    {step.title}
                  </span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                    {step.blurb}
                  </span>
                  <span className="mt-1.5 block text-xs font-semibold text-primary">
                    {s === "done" ? "Done · review" : step.cta} →
                  </span>
                </span>
              </Card>
            </Link>
          );
        })}

        <Notice title="Why some steps say Preview">
          Card issuing, eSIM and insurance checkout are not live yet. Those screens show what's coming and what
          the options usually cost, so nothing pretends to be a finished purchase.
        </Notice>
      </div>
    </AppShell>
  );
}
