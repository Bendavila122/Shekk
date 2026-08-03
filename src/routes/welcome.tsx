/**
 * First run.
 *
 * One route, two jobs: the front door for anyone without an account (one
 * sentence about what Shekk is, then straight into the real Supabase auth
 * screen), and a short staged setup for anyone who has just signed in.
 *
 * Every answer is written to the member's own server-side travel record as
 * soon as they tap Continue, so an interrupted setup resumes on any device.
 * Nothing sensitive is collected here — identity verification stays in the
 * existing KYC flow at /verify, which this screen only explains and links to.
 */

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Check,
  ChevronLeft,
  Loader2,
  MapPin,
  PartyPopper,
  Plane,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import { FocusScreen, PrimaryButton } from "@/components/AppShell";
import { Splash } from "@/components/Splash";
import { useApp } from "@/lib/store";
import { LOCATION_CITIES } from "@/lib/location";
import { CURRENCIES, type CurrencyCode } from "@/lib/currencies";
import { useProgramme, useTravel } from "@/lib/useProgramme";

export const Route = createFileRoute("/welcome")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Welcome to Shekk · finance, programme and Israel in one app" },
      {
        name: "description",
        content:
          "Shekk is the finance, programme and Israel companion for anyone spending an extended period in Israel. Set up in a few taps: how you're coming, your dates, your city and your funding currency.",
      },
      { property: "og:title", content: "Welcome to Shekk" },
      {
        property: "og:description",
        content: "Finance, programme and Israel — one app, set up before you fly.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { property: "og:url", content: "https://shekel-connect.lovable.app/welcome" },
    ],
    links: [{ rel: "canonical", href: "https://shekel-connect.lovable.app/welcome" }],
  }),
  component: Welcome,
});

const ONE_LINER =
  "Shekk is the finance, programme and Israel companion for anyone spending an extended period in Israel.";

const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "South Africa",
  "France",
  "Argentina",
  "Other",
];

const AREAS = [
  "Programme accommodation",
  "Dorms / campus",
  "Rented flat",
  "Family",
  "Not decided yet",
];

/** The staged setup, in order. The programme step is skipped for independents. */
const STEPS = [
  { id: "style", label: "You" },
  { id: "code", label: "Programme" },
  { id: "dates", label: "Dates" },
  { id: "money", label: "Money" },
  { id: "place", label: "Where" },
  { id: "verify", label: "Verify" },
  { id: "done", label: "Done" },
] as const;

type StepId = (typeof STEPS)[number]["id"];

function Welcome() {
  const { signedIn, authChecked } = useApp();

  if (!authChecked) return <Splash message="Opening Shekk…" />;
  if (!signedIn) return <Landing />;
  return <Setup />;
}

/* ─────────────────────────────── Landing ─────────────────────────────── */

function Landing() {
  return (
    <FocusScreen nav={false}>
      <div className="flex min-h-screen flex-col justify-between gap-8 px-6 py-14 sm:min-h-[860px]">
        <div className="space-y-6">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground">Shekk</p>
          <h1 className="font-display text-[2.1rem] font-extrabold leading-[1.1] tracking-tight">
            Everything you need for your time in Israel — in one app.
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground">{ONE_LINER}</p>

          <ul className="space-y-3 pt-2">
            {[
              { icon: Wallet, title: "Money that works on day one", body: "Add money in your home currency, spend in shekels." },
              { icon: Building2, title: "Your programme, live", body: "Timetable, contacts and checklists from your code." },
              { icon: Plane, title: "Before you fly", body: "The arrival admin, in the order it actually happens." },
            ].map((f) => (
              <li key={f.title} className="flex items-start gap-3">
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <f.icon className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{f.title}</span>
                  <span className="block text-[13px] leading-snug text-muted-foreground">{f.body}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <Link
            to="/auth"
            search={{ next: "/welcome" }}
            className="tap flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-4 text-base font-semibold text-primary-foreground shadow-card"
          >
            Get started <ArrowRight className="size-4" />
          </Link>
          <Link
            to="/auth"
            search={{ next: "/" }}
            className="tap block w-full rounded-2xl border border-border bg-card px-5 py-4 text-center text-base font-semibold shadow-card"
          >
            I already have an account
          </Link>
          <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
            Shekk is a shekel spending account for people coming to Israel from abroad. Identity
            verification is required before you can spend.
          </p>
        </div>
      </div>
    </FocusScreen>
  );
}

/* ──────────────────────────────── Setup ─────────────────────────────── */

function Setup() {
  const navigate = useNavigate();
  const { state, completeOnboarding } = useApp();
  const { travel, loading, fetched, save } = useTravel();
  const { join, joined, programme } = useProgramme();

  const [step, setStep] = useState<StepId | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [style, setStyle] = useState<"programme" | "independent">("programme");
  const [code, setCode] = useState("");
  const [arrival, setArrival] = useState("");
  const [departure, setDeparture] = useState("");
  const [homeCountry, setHomeCountry] = useState("");
  const [payCurrency, setPayCurrency] = useState<CurrencyCode>(state.settings.payCurrency);
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");

  /* Adopt whatever the server already knows, once. */
  useEffect(() => {
    if (!fetched || step !== null) return;
    if (travel.travelStyle !== "unknown") setStyle(travel.travelStyle);
    if (travel.arrivalDate) setArrival(travel.arrivalDate);
    if (travel.departureDate) setDeparture(travel.departureDate);
    if (travel.homeCountry) setHomeCountry(travel.homeCountry);
    if (travel.fundingCurrency) setPayCurrency(travel.fundingCurrency as CurrencyCode);
    if (travel.israelCity) setCity(travel.israelCity);
    if (travel.accommodationArea) setArea(travel.accommodationArea);
    const resumed = STEPS.find((s) => s.id === travel.onboardingStep)?.id;
    setStep(travel.onboardingCompletedAt ? "done" : (resumed ?? "style"));
  }, [fetched, step, travel]);

  /** Independents never see the programme step. */
  const flow = useMemo(
    () => STEPS.filter((s) => s.id !== "code" || style === "programme"),
    [style],
  );
  const index = Math.max(0, flow.findIndex((s) => s.id === step));

  if (loading || step === null) return <Splash message="Picking up where you left off…" />;

  async function persist(patch: Parameters<typeof save.mutateAsync>[0]) {
    try {
      await save.mutateAsync(patch);
      return true;
    } catch {
      setError("We couldn't save that just now. Check your connection and try again.");
      return false;
    }
  }

  function goto(id: StepId) {
    setError(null);
    setStep(id);
  }

  async function forward() {
    setError(null);
    const nextStep = flow[Math.min(index + 1, flow.length - 1)].id;

    if (step === "style") {
      setBusy(true);
      const ok = await persist({ travelStyle: style, onboardingStep: nextStep });
      setBusy(false);
      if (ok) goto(nextStep);
      return;
    }

    if (step === "code") {
      const clean = code.trim().toUpperCase();
      setBusy(true);
      if (clean.length >= 3 && !joined) {
        try {
          await join.mutateAsync(clean);
        } catch (e) {
          setBusy(false);
          setError(
            e instanceof Error
              ? e.message.replace(/^Error:\s*/, "")
              : "We couldn't find that code — check it with your programme, or skip for now.",
          );
          return;
        }
      }
      const ok = await persist({ onboardingStep: nextStep });
      setBusy(false);
      if (ok) goto(nextStep);
      return;
    }

    if (step === "dates") {
      if (arrival && departure && departure < arrival) {
        setError("Your departure date is before your arrival date.");
        return;
      }
      setBusy(true);
      const ok = await persist({
        arrivalDate: arrival || null,
        departureDate: departure || null,
        onboardingStep: nextStep,
      });
      setBusy(false);
      if (ok) goto(nextStep);
      return;
    }

    if (step === "money") {
      setBusy(true);
      const ok = await persist({
        homeCountry: homeCountry || null,
        fundingCurrency: payCurrency,
        onboardingStep: nextStep,
      });
      setBusy(false);
      if (ok) goto(nextStep);
      return;
    }

    if (step === "place") {
      setBusy(true);
      const ok = await persist({
        israelCity: city || null,
        accommodationArea: area || null,
        onboardingStep: nextStep,
      });
      setBusy(false);
      if (ok) goto(nextStep);
      return;
    }

    if (step === "verify") {
      setBusy(true);
      const ok = await persist({ onboardingStep: "done", onboardingComplete: true });
      setBusy(false);
      if (!ok) return;
      completeOnboarding({
        name: state.name,
        programId: state.programId,
        cohort: state.cohort,
        homeCountry,
        arrivalDateISO: arrival || null,
        city,
        appLanguage: state.settings.appLanguage,
        payCurrency,
      });
      goto("done");
      return;
    }

    void navigate({ to: "/" });
  }

  function back() {
    setError(null);
    if (index <= 0) {
      void navigate({ to: "/" });
      return;
    }
    setStep(flow[index - 1].id);
  }

  const canContinue =
    step === "money" ? Boolean(homeCountry) : step === "place" ? Boolean(city) : true;

  return (
    <FocusScreen nav={false}>
      <header className="sticky top-0 z-10 bg-background/90 px-5 pb-3 pt-6 backdrop-blur">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Go back"
            onClick={back}
            className="tap shrink-0 rounded-full bg-muted p-2"
          >
            <ChevronLeft className="size-5" />
          </button>
          <div className="flex flex-1 gap-1.5" role="progressbar" aria-valuenow={index + 1} aria-valuemin={1} aria-valuemax={flow.length}>
            {flow.map((s, i) => (
              <span
                key={s.id}
                className={`h-1 flex-1 rounded-full transition-colors ${i <= index ? "bg-primary" : "bg-border"}`}
                aria-hidden
              />
            ))}
          </div>
          <span className="shrink-0 text-[11px] font-semibold text-muted-foreground">
            {index + 1}/{flow.length}
          </span>
        </div>
      </header>

      <div className="px-5 pt-6">
        {step === "style" ? (
          <Stage
            icon={Sparkles}
            title="How are you coming to Israel?"
            blurb="This shapes your home screen, your checklist and what we show you first."
          >
            <div className="space-y-2">
              {(
                [
                  {
                    id: "programme",
                    label: "With a programme",
                    hint: "Gap year, seminary, yeshiva, MASA, study abroad",
                  },
                  {
                    id: "independent",
                    label: "Independently",
                    hint: "Working, volunteering, visiting family or travelling",
                  },
                ] as const
              ).map((o) => (
                <Option
                  key={o.id}
                  selected={style === o.id}
                  onClick={() => setStyle(o.id)}
                  label={o.label}
                  hint={o.hint}
                />
              ))}
            </div>
          </Stage>
        ) : null}

        {step === "code" ? (
          <Stage
            icon={Building2}
            title="Your programme code"
            blurb="If your programme uses Shekk they gave you a code. It unlocks your timetable, contacts and checklist."
          >
            {joined ? (
              <div className="rounded-2xl border border-success/30 bg-success/10 p-4">
                <p className="text-sm font-semibold">
                  Joined {programme.programmeName ?? "your programme"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {programme.cohortName ?? "You're all set — continue."}
                </p>
              </div>
            ) : (
              <Field label="Programme code">
                <input
                  autoFocus
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    setError(null);
                  }}
                  autoCapitalize="characters"
                  autoCorrect="off"
                  spellCheck={false}
                  enterKeyHint="go"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !busy) void forward();
                  }}
                  placeholder="e.g. SHEKKDEMO"
                  className="w-full rounded-2xl bg-muted px-4 py-3.5 text-base font-semibold uppercase tracking-wide outline-none"
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  No code yet? Skip — nothing else changes and you can join from the Programme tab
                  any time.
                </p>
              </Field>
            )}
          </Stage>
        ) : null}

        {step === "dates" ? (
          <Stage
            icon={CalendarDays}
            title="When are you in Israel?"
            blurb="We count down to your landing and line the arrival admin up around it. Rough dates are fine."
          >
            <Field label="Arrival date">
              <input
                type="date"
                value={arrival}
                onChange={(e) => setArrival(e.target.value)}
                className="w-full rounded-2xl bg-muted px-4 py-3.5 text-base outline-none"
              />
            </Field>
            <Field label="Departure date (optional)">
              <input
                type="date"
                value={departure}
                min={arrival || undefined}
                onChange={(e) => setDeparture(e.target.value)}
                className="w-full rounded-2xl bg-muted px-4 py-3.5 text-base outline-none"
              />
            </Field>
          </Stage>
        ) : null}

        {step === "money" ? (
          <Stage
            icon={Wallet}
            title="Where's your money coming from?"
            blurb="Your Shekk account is held in shekels. You add money in your home currency and see the rate before you confirm."
          >
            <Field label="Home country">
              <Choices options={COUNTRIES} value={homeCountry} onChange={setHomeCountry} />
            </Field>
            <Field label="Currency you'll add money in">
              <div className="grid grid-cols-3 gap-2">
                {CURRENCIES.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => setPayCurrency(c.code)}
                    className={`tap rounded-2xl px-3 py-3 text-sm font-semibold ${
                      payCurrency === c.code ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    {c.flag} {c.code}
                  </button>
                ))}
              </div>
            </Field>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Shekk accounts are for people coming to Israel from abroad — you can't open one as an
              Israeli resident.
            </p>
          </Stage>
        ) : null}

        {step === "place" ? (
          <Stage
            icon={MapPin}
            title="Where in Israel?"
            blurb="Weather, Shabbat times, transport and what's nearby all follow your base."
          >
            <Field label="City or area">
              <Choices options={LOCATION_CITIES} value={city} onChange={setCity} />
            </Field>
            <Field label="Where are you staying? (optional)">
              <Choices options={AREAS} value={area} onChange={setArea} />
            </Field>
          </Stage>
        ) : null}

        {step === "verify" ? (
          <Stage
            icon={ShieldCheck}
            title="One thing before you can spend"
            blurb="Shekk holds real money, so the law requires us to check who you are — once."
          >
            <ul className="space-y-2.5">
              {[
                "Your legal name, date of birth and home address",
                "A photo of your passport or ID, and a quick selfie check",
                "Roughly how much you expect to spend each month",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-success" />
                  <span className="text-muted-foreground">{t}</span>
                </li>
              ))}
            </ul>
            <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
              <p className="text-sm font-semibold">It takes about five minutes</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                You can do it now or later — everything else in Shekk works meanwhile. Your
                documents are stored privately and are only used for this check.
              </p>
              <Link
                to="/verify"
                className="tap mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
              >
                Start verification <ArrowRight className="size-4" />
              </Link>
            </div>
          </Stage>
        ) : null}

        {step === "done" ? (
          <Stage
            icon={PartyPopper}
            title="You're set up"
            blurb="Your home screen now follows your dates, your city and your programme."
          >
            <div className="space-y-2">
              {[
                { to: "/before-you-fly" as const, label: "Before you fly", hint: "The arrival admin, in order" },
                { to: "/programme" as const, label: "Your programme", hint: "Timetable, contacts, checklist" },
                { to: "/topup" as const, label: "Add money", hint: "Fund in your home currency" },
              ].map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="tap flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-card"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{l.label}</span>
                    <span className="block text-xs text-muted-foreground">{l.hint}</span>
                  </span>
                  <ArrowRight className="size-4 shrink-0 text-primary" />
                </Link>
              ))}
            </div>
          </Stage>
        ) : null}
      </div>

      <div className="px-5 pb-12 pt-8">
        {error ? (
          <p role="alert" className="mb-3 text-sm font-semibold text-destructive">
            {error}
          </p>
        ) : null}

        <PrimaryButton disabled={!canContinue || busy} onClick={() => void forward()}>
          {busy ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="size-4 animate-spin" /> Saving…
            </span>
          ) : step === "done" ? (
            "Go to my Shekk"
          ) : step === "verify" ? (
            "I'll verify later — finish setup"
          ) : step === "code" && !joined && code.trim().length < 3 ? (
            "Skip for now"
          ) : (
            "Continue"
          )}
        </PrimaryButton>

        {step !== "done" ? (
          <button
            type="button"
            onClick={() => void navigate({ to: "/" })}
            className="tap mt-3 block w-full text-center text-xs font-semibold text-muted-foreground underline"
          >
            Finish this later
          </button>
        ) : null}
      </div>
    </FocusScreen>
  );
}

/* ─────────────────────────────── Pieces ─────────────────────────────── */

function Stage({
  icon: Icon,
  title,
  blurb,
  children,
}: {
  icon: typeof Wallet;
  title: string;
  blurb: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div>
        <span className="flex size-11 items-center justify-center rounded-2xl bg-primary-soft text-primary">
          <Icon className="size-5" />
        </span>
        <h1 className="mt-4 font-display text-[1.75rem] font-bold leading-tight tracking-tight">
          {title}
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{blurb}</p>
      </div>
      {children}
    </div>
  );
}

function Option({
  selected,
  onClick,
  label,
  hint,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`tap flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3.5 text-left ${
        selected ? "bg-primary text-primary-foreground" : "bg-muted"
      }`}
    >
      <span className="min-w-0">
        <span className="block text-sm font-semibold">{label}</span>
        <span className="block text-xs opacity-70">{hint}</span>
      </span>
      {selected ? <Check className="size-4 shrink-0" /> : null}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      {children}
    </div>
  );
}

function Choices({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          aria-pressed={value === o}
          className={`tap rounded-full px-3.5 py-2 text-sm font-semibold ${
            value === o ? "bg-primary text-primary-foreground" : "bg-muted"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
