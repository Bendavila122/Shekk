import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Upload, ShieldCheck } from "lucide-react";
import { PhoneFrame, PrimaryButton, Card } from "@/components/AppShell";
import { PROGRAMS } from "@/lib/mock";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Get started · ShekelPay" },
      {
        name: "description",
        content: "Sign up, pick your program, accept the credit terms and verify your passport — takes two minutes.",
      },
      { property: "og:title", content: "Get started · ShekelPay" },
      { property: "og:description", content: "Onboarding for gap-year students landing in Israel." },
    ],
  }),
  component: Onboarding,
});

const STEPS = ["Welcome", "Sign up", "Program", "Terms", "ID check"];

function Onboarding() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [programId, setProgramId] = useState("aish");
  const [agreed, setAgreed] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const { completeOnboarding } = useApp();
  const navigate = useNavigate();

  const next = () => setStep((s) => s + 1);

  return (
    <PhoneFrame>
      <div className="flex min-h-screen flex-col px-6 pb-10 pt-8 sm:min-h-[860px]">
        {step > 0 && (
          <div className="mb-6 flex gap-1.5">
            {STEPS.map((_, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-muted"}`} />
            ))}
          </div>
        )}

        {step === 0 && (
          <div className="flex flex-1 flex-col justify-between">
            <div className="pt-14">
              <p className="font-display text-sm font-semibold uppercase tracking-[0.3em] text-accent">ShekelPay</p>
              <h1 className="mt-4 text-5xl font-bold leading-[1.05]">
                One code.
                <br />
                One wallet.
                <br />
                Your whole year.
              </h1>
              <p className="mt-5 text-base text-muted-foreground">
                Built for gap-year students in Israel. Buy shekel credits with Apple Pay, then pay the makolet, the
                Rav-Kav, the tiyul and the pizza run — without juggling fifteen apps.
              </p>
              <ul className="mt-6 space-y-2 text-sm">
                {[
                  "Credits, not a bank account — no wires, no Israeli ID needed",
                  "Kosher and Shabbat-aware by default",
                  "Split with your cohort in one tap",
                ].map((t) => (
                  <li key={t} className="flex gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-success" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <PrimaryButton onClick={next}>Get started</PrimaryButton>
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-1 flex-col justify-between">
            <div>
              <h1 className="text-3xl font-bold">Create your account</h1>
              <p className="mt-2 text-sm text-muted-foreground">Use the email your program has on file.</p>
              <div className="mt-6 space-y-4">
                <Field label="Full name (as on passport)" value={name} onChange={setName} placeholder="Shua Berman" />
                <Field label="Email" value={email} onChange={setEmail} placeholder="you@school.edu" />
                <Field label="US phone" value="" onChange={() => {}} placeholder="+1 (555) 018-2244" />
              </div>
            </div>
            <PrimaryButton onClick={next} disabled={!name.trim()}>
              Continue
            </PrimaryButton>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-1 flex-col justify-between">
            <div>
              <h1 className="text-3xl font-bold">Where are you learning?</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                This sets your cohort thread, madrich announcements and campus defaults.
              </p>
              <div className="mt-6 space-y-2">
                {PROGRAMS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setProgramId(p.id)}
                    className={`tap flex w-full items-center justify-between rounded-2xl border p-4 text-left ${
                      programId === p.id ? "border-primary bg-primary-soft" : "border-border bg-card"
                    }`}
                  >
                    <span>
                      <span className="block text-sm font-semibold">{p.name}</span>
                      <span className="block text-xs text-muted-foreground">{p.city}</span>
                    </span>
                    {programId === p.id && <Check className="size-5 text-primary" />}
                  </button>
                ))}
              </div>
            </div>
            <PrimaryButton onClick={next}>Continue</PrimaryButton>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-1 flex-col justify-between">
            <div className="min-h-0">
              <h1 className="text-3xl font-bold">Terms & Conditions</h1>
              <p className="mt-2 text-sm text-muted-foreground">Short version. Scroll it, then tick the box.</p>
              <div className="no-scrollbar mt-4 h-[19rem] overflow-y-auto rounded-2xl border border-border bg-card p-4 text-sm leading-relaxed">
                <TermsSummary />
              </div>
              <label className="mt-4 flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 size-5 accent-[var(--primary)]"
                />
                <span>
                  I've read and accept the{" "}
                  <Link to="/terms" className="font-semibold text-primary underline">
                    full Terms & Conditions
                  </Link>
                  , including that credits are non-refundable and non-withdrawable.
                </span>
              </label>
            </div>
            <PrimaryButton onClick={next} disabled={!agreed} className="mt-4">
              Agree and continue
            </PrimaryButton>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-1 flex-col justify-between">
            <div>
              <h1 className="text-3xl font-bold">Verify your ID</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Passport photo page + a selfie. Required once a year to keep your account active.
              </p>
              <button
                onClick={() => setUploaded(true)}
                className={`tap mt-6 flex w-full flex-col items-center gap-2 rounded-3xl border-2 border-dashed p-10 ${
                  uploaded ? "border-success bg-success-soft" : "border-border bg-card"
                }`}
              >
                {uploaded ? <ShieldCheck className="size-10 text-success" /> : <Upload className="size-10 text-primary" />}
                <span className="text-sm font-semibold">
                  {uploaded ? "passport_page.jpg uploaded" : "Upload passport photo page"}
                </span>
                <span className="text-xs text-muted-foreground">Mock upload — nothing leaves this prototype</span>
              </button>
              <Card className="mt-4 text-xs text-muted-foreground">
                Review usually finishes in a few minutes. You can top up right away; spending unlocks once verified.
              </Card>
            </div>
            <PrimaryButton
              disabled={!uploaded}
              onClick={() => {
                completeOnboarding({ name: name.trim(), programId });
                navigate({ to: "/topup" });
              }}
            >
              Finish and add credits
            </PrimaryButton>
          </div>
        )}
      </div>
    </PhoneFrame>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-border bg-card px-4 py-3.5 text-base outline-none focus:border-primary"
      />
    </label>
  );
}

export function TermsSummary() {
  return (
    <div className="space-y-3">
      <p className="font-semibold">The short version</p>
      <p>
        <strong>1. You're buying credits.</strong> Each top up is a purchase of shekel-denominated ShekelPay credits,
        not a deposit into a bank account. We don't hold currency for you.
      </p>
      <p>
        <strong>2. Credits are non-refundable and non-withdrawable.</strong> They can be spent in the app or with
        partner merchants. They can't be cashed out or transferred off-platform.
      </p>
      <p>
        <strong>3. You always see the price before you confirm.</strong> Every top up shows the amount paid, the
        mid-market reference rate, our fee/spread and the exact credits you receive.
      </p>
      <p>
        <strong>4. Annual re-verification.</strong> Every 12 months we ask you to re-confirm your ID. You get an email
        and an in-app countdown with 30 days to complete it.
      </p>
      <p>
        <strong>5. Account status.</strong> If re-verification lapses, the account moves to limited status: no new top
        ups and no new spends until you re-verify. Existing credits stay on the account.
      </p>
      <p>
        <strong>6. Fair use.</strong> One account per student, personal use only, no reselling credits.
      </p>
      <p className="text-muted-foreground">Prototype placeholder text — not legal advice.</p>
    </div>
  );
}
