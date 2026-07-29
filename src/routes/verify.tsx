import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Camera,
  Check,
  Clock,
  IdCard,
  Loader2,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { FocusScreen, PrimaryButton, Card, Notice } from "@/components/AppShell";
import { useApp } from "@/lib/store";
import { useProfile, type DocKind, type ProfileDraft } from "@/lib/useProfile";
import { PROGRAMS } from "@/lib/mock";

export const Route = createFileRoute("/verify")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Verify your identity · Shekk" },
      {
        name: "description",
        content:
          "Finish opening your Shekk shekel account: legal details, address, ID photo and a selfie check, handled by our regulated payment partner.",
      },
      { property: "og:title", content: "Verify your identity · Shekk" },
      { property: "og:description", content: "A few minutes now, spending for the whole year." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Verify,
});

const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "South Africa",
  "France",
  "Argentina",
  "Israel",
  "Other",
];

const SOURCES = [
  "Family support / parents",
  "Savings",
  "Salary or part-time work",
  "Scholarship or grant",
  "Programme stipend",
];

const OCCUPATIONS = ["Student", "Gap-year participant", "Employed", "Self-employed", "Other"];

const STEPS = ["Legal you", "Address", "ID document", "About your money", "Review"] as const;

const FIELD = "w-full rounded-2xl border border-border bg-background px-4 py-3.5 text-base";
const LABEL = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className={LABEL}>{label}</span>
      {children}
    </label>
  );
}

function Verify() {
  const { signedIn } = useApp();
  const { profile, missing, status, loading, save, submit, upload } = useProfile();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<ProfileDraft>({});
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Seed the form from the saved record once it lands.
  useEffect(() => {
    if (!profile) return;
    setDraft((d) => ({
      legalFirstName: profile.legalFirstName ?? "",
      legalMiddleName: profile.legalMiddleName ?? "",
      legalLastName: profile.legalLastName ?? "",
      dateOfBirth: profile.dateOfBirth ?? "",
      nationality: profile.nationality ?? "",
      phoneCountryCode: profile.phoneCountryCode ?? "+1",
      phoneNumber: profile.phoneNumber ?? "",
      addressLine1: profile.addressLine1 ?? "",
      addressLine2: profile.addressLine2 ?? "",
      addressCity: profile.addressCity ?? "",
      addressState: profile.addressState ?? "",
      addressPostcode: profile.addressPostcode ?? "",
      addressCountry: profile.addressCountry ?? "",
      ilAddressLine1: profile.ilAddressLine1 ?? "",
      ilAddressCity: profile.ilAddressCity ?? "",
      ilAddressPostcode: profile.ilAddressPostcode ?? "",
      idDocumentType: (profile.idDocumentType as ProfileDraft["idDocumentType"]) ?? "passport",
      idDocumentNumber: profile.idDocumentNumber ?? "",
      idIssuingCountry: profile.idIssuingCountry ?? "",
      idExpiry: profile.idExpiry ?? "",
      taxCountry: profile.taxCountry ?? "",
      taxId: profile.taxId ?? "",
      occupation: profile.occupation ?? "",
      sourceOfFunds: profile.sourceOfFunds ?? "",
      expectedMonthlyIls: profile.expectedMonthlyIls ?? 2000,
      isPep: profile.isPep,
      isUsPerson: profile.isUsPerson,
      program: profile.program ?? "",
      cohort: profile.cohort ?? "",
      city: profile.city ?? "",
      arrivalDate: profile.arrivalDate ?? "",
      acceptTerms: Boolean(profile.termsAcceptedAt),
      ...d,
    }));
  }, [profile]);

  const uploaded = useMemo(
    () => new Set((profile?.documents ?? []).map((d) => d.kind)),
    [profile],
  );

  function set<K extends keyof ProfileDraft>(key: K, value: ProfileDraft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  async function next() {
    await save.mutateAsync(clean(draft));
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  async function pick(kind: DocKind, file: File | null) {
    if (!file) return;
    setUploadError(null);
    if (file.size > 10_000_000) return setUploadError("That file is over 10 MB — try a photo.");
    try {
      await upload.mutateAsync({ kind, file });
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed.");
    }
  }

  if (!signedIn) {
    return (
      <Shell title="Verify your identity">
        <Card className="space-y-3">
          <p className="text-sm">Sign in first — verification is tied to your Shekk account.</p>
          <Link to="/auth" search={{ next: "/verify" }} className="tap block">
            <PrimaryButton>Sign in or create an account</PrimaryButton>
          </Link>
        </Card>
      </Shell>
    );
  }

  if (loading) {
    return (
      <Shell title="Verify your identity">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading your details…
        </div>
      </Shell>
    );
  }

  if (status === "verified") {
    return (
      <Shell title="You're verified">
        <Card className="space-y-3 text-center">
          <BadgeCheck className="mx-auto size-12 text-success" />
          <p className="text-lg font-bold">Identity confirmed</p>
          <p className="text-sm text-muted-foreground">
            Your shekel account is open. Add money, spend anywhere and order your Shekk card.
          </p>
          <Link to="/topup" className="block">
            <PrimaryButton>Add money</PrimaryButton>
          </Link>
        </Card>
      </Shell>
    );
  }

  if (status === "in_review" || status === "submitted") {
    return (
      <Shell title="Checks in progress">
        <Card className="space-y-3 text-center">
          <Clock className="mx-auto size-12 text-notice-foreground" />
          <p className="text-lg font-bold">We're reviewing your application</p>
          <p className="text-sm text-muted-foreground">
            Airwallex is running the standard identity and sanctions checks. Most are done
            within minutes, some take up to one working day. We'll email you the moment it clears.
          </p>
          <Link to="/wallet" className="block">
            <PrimaryButton>Back to my wallet</PrimaryButton>
          </Link>
        </Card>
      </Shell>
    );
  }

  return (
    <Shell title="Open your shekel account">
      <div className="flex gap-1.5">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-border"}`}
          />
        ))}
      </div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Step {step + 1} of {STEPS.length} · {STEPS[step]}
      </p>

      {status === "rejected" && profile?.kycRejectionReason && (
        <Notice title="Needs another look">{profile.kycRejectionReason}</Notice>
      )}

      {step === 0 && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Exactly as printed on your passport — the checks fail on nicknames.
          </p>
          <Field label="Legal first name">
            <input
              className={FIELD}
              value={draft.legalFirstName ?? ""}
              onChange={(e) => set("legalFirstName", e.target.value)}
            />
          </Field>
          <Field label="Middle name (optional)">
            <input
              className={FIELD}
              value={draft.legalMiddleName ?? ""}
              onChange={(e) => set("legalMiddleName", e.target.value)}
            />
          </Field>
          <Field label="Legal last name">
            <input
              className={FIELD}
              value={draft.legalLastName ?? ""}
              onChange={(e) => set("legalLastName", e.target.value)}
            />
          </Field>
          <Field label="Date of birth">
            <input
              type="date"
              className={FIELD}
              value={draft.dateOfBirth ?? ""}
              onChange={(e) => set("dateOfBirth", e.target.value)}
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              You must be 16 or over. Under 18, lower limits apply.
            </p>
          </Field>
          <Field label="Nationality">
            <select
              className={FIELD}
              value={draft.nationality ?? ""}
              onChange={(e) => set("nationality", e.target.value)}
            >
              <option value="">Choose…</option>
              {COUNTRIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-[5.5rem_1fr] gap-2">
            <Field label="Code">
              <input
                className={FIELD}
                value={draft.phoneCountryCode ?? ""}
                onChange={(e) => set("phoneCountryCode", e.target.value)}
              />
            </Field>
            <Field label="Mobile number">
              <input
                inputMode="tel"
                className={FIELD}
                value={draft.phoneNumber ?? ""}
                onChange={(e) => set("phoneNumber", e.target.value)}
              />
            </Field>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Your permanent home address first — that's the one on your bank statements.
          </p>
          <Field label="Home address">
            <input
              className={FIELD}
              value={draft.addressLine1 ?? ""}
              onChange={(e) => set("addressLine1", e.target.value)}
            />
          </Field>
          <Field label="Apartment / line 2 (optional)">
            <input
              className={FIELD}
              value={draft.addressLine2 ?? ""}
              onChange={(e) => set("addressLine2", e.target.value)}
            />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="City">
              <input
                className={FIELD}
                value={draft.addressCity ?? ""}
                onChange={(e) => set("addressCity", e.target.value)}
              />
            </Field>
            <Field label="State / region">
              <input
                className={FIELD}
                value={draft.addressState ?? ""}
                onChange={(e) => set("addressState", e.target.value)}
              />
            </Field>
            <Field label="Post / ZIP code">
              <input
                className={FIELD}
                value={draft.addressPostcode ?? ""}
                onChange={(e) => set("addressPostcode", e.target.value)}
              />
            </Field>
            <Field label="Country">
              <select
                className={FIELD}
                value={draft.addressCountry ?? ""}
                onChange={(e) => set("addressCountry", e.target.value)}
              >
                <option value="">Choose…</option>
                {COUNTRIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
          </div>

          <p className="pt-2 text-sm font-semibold">Where you're staying in Israel</p>
          <Field label="Address in Israel (optional for now)">
            <input
              className={FIELD}
              placeholder="Yeshiva, seminary or apartment"
              value={draft.ilAddressLine1 ?? ""}
              onChange={(e) => set("ilAddressLine1", e.target.value)}
            />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="City">
              <input
                className={FIELD}
                value={draft.ilAddressCity ?? ""}
                onChange={(e) => set("ilAddressCity", e.target.value)}
              />
            </Field>
            <Field label="Post code">
              <input
                className={FIELD}
                value={draft.ilAddressPostcode ?? ""}
                onChange={(e) => set("ilAddressPostcode", e.target.value)}
              />
            </Field>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <Field label="Document type">
            <select
              className={FIELD}
              value={draft.idDocumentType ?? "passport"}
              onChange={(e) =>
                set("idDocumentType", e.target.value as ProfileDraft["idDocumentType"])
              }
            >
              <option value="passport">Passport</option>
              <option value="national_id">National ID card</option>
              <option value="drivers_licence">Driver's licence</option>
            </select>
          </Field>
          <Field label="Document number">
            <input
              className={FIELD}
              value={draft.idDocumentNumber ?? ""}
              onChange={(e) => set("idDocumentNumber", e.target.value)}
            />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Issuing country">
              <select
                className={FIELD}
                value={draft.idIssuingCountry ?? ""}
                onChange={(e) => set("idIssuingCountry", e.target.value)}
              >
                <option value="">Choose…</option>
                {COUNTRIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Expiry date">
              <input
                type="date"
                className={FIELD}
                value={draft.idExpiry ?? ""}
                onChange={(e) => set("idExpiry", e.target.value)}
              />
            </Field>
          </div>

          <Uploader
            kind="id_front"
            title="Photo page of your ID"
            hint="Flat, all four corners visible, no glare."
            icon={<IdCard className="size-5" />}
            done={uploaded.has("id_front")}
            busy={upload.isPending}
            onPick={pick}
          />
          <Uploader
            kind="id_back"
            title="Back of the card (ID cards and licences only)"
            hint="Skip this if you're using a passport."
            icon={<IdCard className="size-5" />}
            done={uploaded.has("id_back")}
            busy={upload.isPending}
            onPick={pick}
          />
          <Uploader
            kind="selfie"
            title="Selfie check"
            hint="A clear photo of your face, no hat or sunglasses."
            icon={<Camera className="size-5" />}
            done={uploaded.has("selfie")}
            busy={upload.isPending}
            onPick={pick}
          />
          <Uploader
            kind="proof_of_address"
            title="Proof of address (optional)"
            hint="Bank statement or utility bill from the last 3 months."
            icon={<IdCard className="size-5" />}
            done={uploaded.has("proof_of_address")}
            busy={upload.isPending}
            onPick={pick}
          />
          {uploadError && <p className="text-sm font-medium text-destructive">{uploadError}</p>}
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="size-3.5" /> Documents go straight into private storage. Only the
            verification team and our payment partner can open them.
          </p>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3">
          <Field label="Tax residency">
            <select
              className={FIELD}
              value={draft.taxCountry ?? ""}
              onChange={(e) => set("taxCountry", e.target.value)}
            >
              <option value="">Choose…</option>
              {COUNTRIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Tax ID / SSN (optional)">
            <input
              className={FIELD}
              value={draft.taxId ?? ""}
              onChange={(e) => set("taxId", e.target.value)}
            />
          </Field>
          <Field label="Occupation">
            <select
              className={FIELD}
              value={draft.occupation ?? ""}
              onChange={(e) => set("occupation", e.target.value)}
            >
              <option value="">Choose…</option>
              {OCCUPATIONS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </Field>
          <Field label="Where your money comes from">
            <select
              className={FIELD}
              value={draft.sourceOfFunds ?? ""}
              onChange={(e) => set("sourceOfFunds", e.target.value)}
            >
              <option value="">Choose…</option>
              {SOURCES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Roughly how much will you spend a month (₪)">
            <input
              inputMode="numeric"
              className={FIELD}
              value={String(draft.expectedMonthlyIls ?? "")}
              onChange={(e) => set("expectedMonthlyIls", Number(e.target.value) || 0)}
            />
          </Field>
          <Field label="Programme">
            <select
              className={FIELD}
              value={draft.program ?? ""}
              onChange={(e) => set("program", e.target.value)}
            >
              <option value="">Choose…</option>
              {PROGRAMS.map((p) => (
                <option key={p.id}>{p.name}</option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="City in Israel">
              <input
                className={FIELD}
                value={draft.city ?? ""}
                onChange={(e) => set("city", e.target.value)}
              />
            </Field>
            <Field label="Arrival date">
              <input
                type="date"
                className={FIELD}
                value={draft.arrivalDate ?? ""}
                onChange={(e) => set("arrivalDate", e.target.value)}
              />
            </Field>
          </div>

          <Card className="space-y-3 text-sm">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                className="mt-0.5 size-5"
                checked={Boolean(draft.isUsPerson)}
                onChange={(e) => set("isUsPerson", e.target.checked)}
              />
              <span>I'm a US citizen or US tax resident.</span>
            </label>
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                className="mt-0.5 size-5"
                checked={Boolean(draft.isPep)}
                onChange={(e) => set("isPep", e.target.checked)}
              />
              <span>
                I, or a close family member, hold a senior public position (a politically exposed
                person).
              </span>
            </label>
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                className="mt-0.5 size-5"
                checked={Boolean(draft.acceptTerms)}
                onChange={(e) => set("acceptTerms", e.target.checked)}
              />
              <span>
                Everything here is true, the account is for me alone, and I accept the{" "}
                <Link to="/terms" className="font-semibold underline">
                  Terms &amp; Conditions
                </Link>
                .
              </span>
            </label>
          </Card>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-3">
          <Card className="space-y-2 text-sm">
            <Row label="Name" value={fullName(draft)} />
            <Row label="Date of birth" value={draft.dateOfBirth} />
            <Row label="Nationality" value={draft.nationality} />
            <Row
              label="Mobile"
              value={`${draft.phoneCountryCode ?? ""} ${draft.phoneNumber ?? ""}`.trim()}
            />
            <Row
              label="Home address"
              value={[draft.addressLine1, draft.addressCity, draft.addressCountry]
                .filter(Boolean)
                .join(", ")}
            />
            <Row label="ID" value={`${draft.idDocumentType} · ${draft.idDocumentNumber ?? ""}`} />
            <Row label="Tax residency" value={draft.taxCountry} />
            <Row label="Source of funds" value={draft.sourceOfFunds} />
            <Row label="Documents" value={`${uploaded.size} uploaded`} />
          </Card>

          {missing.length > 0 && (
            <Notice title="Still needed">
              <ul className="list-disc pl-4">
                {missing.map((m) => (
                  <li key={m.field}>{m.label}</li>
                ))}
              </ul>
            </Notice>
          )}

          <Notice title="What happens next">
            We hand your details to Airwallex, our regulated payment partner, who runs the identity and
            sanctions checks and opens your shekel account. Nothing is charged, and you can add
            money the moment it clears.
          </Notice>

          <PrimaryButton
            disabled={submit.isPending || save.isPending}
            onClick={async () => {
              await save.mutateAsync(clean(draft));
              await submit.mutateAsync();
            }}
          >
            {submit.isPending ? "Submitting…" : "Submit for verification"}
          </PrimaryButton>
        </div>
      )}

      {step < 4 && (
        <div className="flex gap-2">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="tap rounded-2xl border border-border px-5 py-4 text-base font-semibold"
            >
              Back
            </button>
          )}
          <PrimaryButton onClick={next} disabled={save.isPending}>
            {save.isPending ? "Saving…" : "Continue"}
          </PrimaryButton>
        </div>
      )}

      <p className="flex items-center justify-center gap-1.5 pb-6 text-center text-xs text-muted-foreground">
        <ShieldCheck className="size-3.5" /> Saved as you go — you can close the app and come back.
      </p>
    </Shell>
  );
}

function fullName(d: ProfileDraft) {
  return [d.legalFirstName, d.legalMiddleName, d.legalLastName].filter(Boolean).join(" ");
}

/** Empty strings mean "not answered", so strip them before saving. */
function clean(d: ProfileDraft): ProfileDraft {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(d)) {
    if (typeof v === "string" && v.trim() === "") continue;
    out[k] = v;
  }
  return out as ProfileDraft;
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value || "—"}</span>
    </div>
  );
}

function Uploader({
  kind,
  title,
  hint,
  icon,
  done,
  busy,
  onPick,
}: {
  kind: DocKind;
  title: string;
  hint: string;
  icon: React.ReactNode;
  done: boolean;
  busy: boolean;
  onPick: (kind: DocKind, file: File | null) => void;
}) {
  return (
    <label
      className={`tap flex cursor-pointer items-center gap-3 rounded-2xl border p-4 ${
        done ? "border-success bg-success-soft" : "border-dashed border-border bg-card"
      }`}
    >
      <span className="shrink-0">{done ? <Check className="size-5 text-success" /> : icon}</span>
      <span className="flex-1">
        <span className="block text-sm font-semibold">{title}</span>
        <span className="block text-xs text-muted-foreground">{done ? "Uploaded" : hint}</span>
      </span>
      {busy && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="hidden"
        onChange={(e) => onPick(kind, e.target.files?.[0] ?? null)}
      />
    </label>
  );
}

function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <FocusScreen>
      <div className="space-y-4 px-5 pb-10 pt-8">
        <Link to="/wallet" className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <ArrowLeft className="size-4" /> Wallet
        </Link>
        <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
        {children}
      </div>
    </FocusScreen>
  );
}
