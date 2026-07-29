import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, Check } from "lucide-react";
import { FocusScreen, PrimaryButton } from "@/components/AppShell";
import { useApp } from "@/lib/store";
import { PROGRAMS } from "@/lib/mock";
import { LOCATION_CITIES } from "@/lib/location";
import { CURRENCIES } from "@/lib/currencies";
import type { Settings } from "@/lib/store";

const LANGUAGES: { code: Settings["appLanguage"]; label: string }[] = [
  { code: "en", label: "English" },
  { code: "he", label: "עברית" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "ru", label: "Русский" },
];

export const Route = createFileRoute("/welcome")({
  head: () => ({
    meta: [
      { title: "Welcome to Shekk · Shekk" },
      {
        name: "description",
        content:
          "Set up your Shekk account in a minute: your name, where you're coming from, when you land, your programme, language and spending currency.",
      },
      { property: "og:title", content: "Welcome to Shekk" },
      { property: "og:description", content: "Your first week in Israel, sorted before you land." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Welcome,
});

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

const STEPS = ["You", "Arrival", "Programme", "Preferences"] as const;

function Welcome() {
  const navigate = useNavigate();
  const { state, completeOnboarding } = useApp();
  const [step, setStep] = useState(0);

  const [name, setName] = useState(state.name);
  const [homeCountry, setHomeCountry] = useState(state.profile.homeCountry);
  const [arrival, setArrival] = useState(state.profile.arrivalDateISO ?? "");
  const [city, setCity] = useState(state.profile.city);
  const [programId, setProgramId] = useState(state.programId);
  const [cohort, setCohort] = useState(state.cohort);
  const [language, setLanguage] = useState(state.settings.appLanguage);
  const [payCurrency, setPayCurrency] = useState(state.settings.payCurrency);

  const canContinue = step === 0 ? name.trim().length > 1 : true;

  function next() {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
      return;
    }
    completeOnboarding({
      name: name.trim(),
      programId,
      cohort,
      homeCountry,
      arrivalDateISO: arrival || null,
      city,
      appLanguage: language,
      payCurrency,
    });
    navigate({ to: "/" });
  }

  return (
    <FocusScreen nav={false}>
      <header className="px-5 pt-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Go back"
            onClick={() => (step === 0 ? navigate({ to: "/" }) : setStep((s) => s - 1))}
            className="tap shrink-0 rounded-full bg-muted p-2"
          >
            <ChevronLeft className="size-5" />
          </button>
          <div className="flex flex-1 gap-1.5">
            {STEPS.map((s, i) => (
              <span
                key={s}
                className={`h-1 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-border"}`}
                aria-hidden
              />
            ))}
          </div>
        </div>
      </header>

      <div className="px-5 pt-8">
        {step === 0 ? (
          <Step title="Welcome to Shekk" blurb="The financial and lifestyle OS for your year in Israel.">
            <Field label="What should we call you?">
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ari Feldman"
                className="w-full rounded-2xl bg-muted px-4 py-3.5 text-base outline-none"
              />
            </Field>
            <Field label="Where are you coming from?">
              <Choices options={COUNTRIES} value={homeCountry} onChange={setHomeCountry} />
            </Field>
          </Step>
        ) : null}

        {step === 1 ? (
          <Step title="When do you land?" blurb="We'll line up your Rav-Kav, SIM and first Shabbat around it.">
            <Field label="Arrival date">
              <input
                type="date"
                value={arrival}
                onChange={(e) => setArrival(e.target.value)}
                className="w-full rounded-2xl bg-muted px-4 py-3.5 text-base outline-none"
              />
            </Field>
            <Field label="Which city are you based in?">
              <Choices options={LOCATION_CITIES} value={city} onChange={setCity} />
            </Field>
          </Step>
        ) : null}

        {step === 2 ? (
          <Step title="Your programme" blurb="This shapes your cohort thread, offers and local recommendations.">
            <Field label="Programme or institution">
              <div className="space-y-2">
                {PROGRAMS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setProgramId(p.id)}
                    className={`tap flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-left ${
                      programId === p.id ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    <span>
                      <span className="block text-sm font-semibold">{p.name}</span>
                      <span className="block text-xs opacity-70">{p.city}</span>
                    </span>
                    {programId === p.id ? <Check className="size-4 shrink-0" /> : null}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Cohort">
              <input
                value={cohort}
                onChange={(e) => setCohort(e.target.value)}
                placeholder="J26 · Fall–Spring"
                className="w-full rounded-2xl bg-muted px-4 py-3.5 text-base outline-none"
              />
            </Field>
          </Step>
        ) : null}

        {step === 3 ? (
          <Step title="How you like it" blurb="Change any of this later in Settings.">
            <Field label="App language">
              <Choices
                options={LANGUAGES.map((l) => l.label)}
                value={LANGUAGES.find((l) => l.code === language)?.label ?? "English"}
                onChange={(label) => {
                  const found = LANGUAGES.find((l) => l.label === label);
                  if (found) setLanguage(found.code);
                }}
              />
            </Field>
            <Field label="Currency you'll add money in">
              <div className="grid grid-cols-3 gap-2">
                {CURRENCIES.map((c) => (
                  <button
                    key={c.code}
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
              Your Shekk account is held in shekels. You add money in your home currency and we convert it at a rate
              close to interbank.
            </p>
          </Step>
        ) : null}
      </div>

      <div className="px-5 pb-10 pt-8">
        <PrimaryButton disabled={!canContinue} onClick={next}>
          {step === STEPS.length - 1 ? "Open my Shekk account" : "Continue"}
        </PrimaryButton>
      </div>
    </FocusScreen>
  );
}

function Step({ title, blurb, children }: { title: string; blurb: string; children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold leading-tight tracking-tight">{title}</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">{blurb}</p>
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
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
          onClick={() => onChange(o)}
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
