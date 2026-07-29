import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgeCheck, AlertTriangle, ChevronRight, Bookmark, Receipt, Settings, FileText, Camera, Crown, CreditCard, Sparkles } from "lucide-react";
import { AppShell, Card, ReverifyBanner } from "@/components/AppShell";
import { PROGRAMS, ils } from "@/lib/mock";
import { refIn } from "@/lib/currencies";
import { useApp } from "@/lib/store";
import { useOnboardedGate } from "@/lib/useOnboardedGate";
import { useProfile } from "@/lib/useProfile";

export const Route = createFileRoute("/me")({
  head: () => ({
    meta: [
      { title: "Me · Shekk" },
      {
        name: "description",
        content: "Verification badge, program and cohort details, order history and plain-language credit terms.",
      },
      { property: "og:title", content: "Me · Shekk" },
      { property: "og:description", content: "Your Shekk account, verification status and credit terms." },
    ],
  }),
  component: Me,
});

function Me() {
  const ready = useOnboardedGate();
  const { state, verification, daysLeft, setAvatar, isPremium } = useApp();
  const kyc = useProfile();
  const program = PROGRAMS.find((p) => p.id === state.programId);

  const onPickPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(String(reader.result));
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  if (!ready) return <AppShell><div className="p-6 text-sm text-muted-foreground">Loading…</div></AppShell>;

  const badge =
    verification === "verified"
      ? { label: "Verified", cls: "bg-success-soft text-success", Icon: BadgeCheck }
      : verification === "expiring"
        ? { label: "Expiring soon", cls: "bg-warning-soft text-warning-foreground", Icon: AlertTriangle }
        : { label: "Needs update", cls: "bg-warning-soft text-warning-foreground", Icon: AlertTriangle };

  return (
    <AppShell>
      <header className="bg-ink px-5 pb-8 pt-7 text-ink-foreground">
        <div className="flex items-center gap-4">
          <label className="tap relative cursor-pointer">
            {state.avatar ? (
              <img
                src={state.avatar}
                alt="Your profile photo"
                className="size-16 rounded-2xl object-cover"
              />
            ) : (
              <span className="flex size-16 items-center justify-center rounded-2xl bg-accent text-2xl font-bold text-accent-foreground">
                {(state.name || "S").slice(0, 1).toUpperCase()}
              </span>
            )}
            <span className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-card">
              <Camera className="size-3.5" />
            </span>
            <input type="file" accept="image/*" className="hidden" onChange={onPickPhoto} />
          </label>
          <div>
            <h1 className="text-2xl font-bold">{state.name || "Student"}</h1>
            <p className="text-sm opacity-70">
              {program?.name} · {state.cohort}
            </p>
            <p className="mt-1 text-xs opacity-60">
              {state.avatar ? "Friends see this photo when you pay" : "Add a photo so friends recognise you"}
              {state.avatar && (
                <button onClick={() => setAvatar(null)} className="ml-2 underline">
                  Remove
                </button>
              )}
            </p>
          </div>
        </div>

        {kyc.verified ? (
          <div className={`mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${badge.cls}`}>
            <badge.Icon className="size-4" /> {badge.label}
            {daysLeft !== null && <span>· {daysLeft} days left</span>}
          </div>
        ) : (
          <Link
            to="/verify"
            className="tap mt-4 flex items-center justify-between gap-3 rounded-2xl bg-accent px-4 py-3 text-accent-foreground"
          >
            <span>
              <span className="block text-sm font-bold">
                {kyc.pending ? "Identity checks in progress" : "Finish opening your account"}
              </span>
              <span className="block text-xs opacity-80">
                {kyc.pending
                  ? "We'll email you the moment it clears."
                  : "ID, address and a selfie — about three minutes."}
              </span>
            </span>
            <ChevronRight className="size-5 shrink-0" />
          </Link>
        )}

      </header>

      <div className="space-y-4 px-4 py-5">
        <ReverifyBanner />

        <Card>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Credit balance</p>
          <p className="font-display text-3xl font-bold">{ils(state.balance)}</p>
          <p className="text-xs text-muted-foreground">≈ {refIn(state.settings.payCurrency, state.balance)} reference</p>
        </Card>

        <Card className="p-0">
          <RowLink to="/membership" Icon={Crown} label="Shekk Membership" hint={isPremium ? "Premium" : "Free — see Premium"} />
          <RowLink to="/card" Icon={CreditCard} label="Shekk Card" hint={state.card.issued ? `•••• ${state.card.last4}` : "Not issued yet"} />
          <RowLink to="/activity" Icon={Receipt} label="Order & payment history" hint={`${state.txns.length} records`} />
          <RowLink to="/explore/shops" Icon={Bookmark} label="Saved places & discounts" hint="7 saved" />
          <RowLink to="/explore/admin" Icon={FileText} label="Program documents & visa" hint="Student visa A/2" />
          <RowLink to="/settings" Icon={Settings} label="App settings" hint="Currency, theme, alerts" />
          <RowLink to="/welcome" Icon={Sparkles} label="Redo account setup" hint="Programme, city, currency" />
          <RowLink to="/terms" Icon={FileText} label="Full Terms & Conditions" hint="" />
        </Card>

        <Card className="space-y-2">
          <h2 className="text-base font-semibold">How your Shekk account works</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Your shekel account is a real, regulated payment account provided by Shekk&rsquo;s payments partner — not app credits.</li>
            <li>• You add money with Apple Pay or a bank transfer and your balance lands in shekels, ready to spend.</li>
            <li>• Order through a partner app inside Shekk and <span className="font-medium text-foreground">we pay them</span> — your card is never charged at checkout.</li>
            <li>• We then deduct that order from your shekel balance.</li>
            <li>• Every time you add money you see the rate and the exact shekels you get before you confirm.</li>
            <li>• You must be 18 or over, opening the account for yourself, with valid ID — our partner runs the identity checks and makes the decision.</li>
            <li>• Keep your details and ID current; our partner can ask for updated documents at any time.</li>
            <li>• The full account terms live in the <span className="font-medium text-foreground">Terms & Conditions</span>.</li>
          </ul>

          <Link to="/terms" className="inline-block pt-1 text-sm font-semibold text-primary">
            Read the full terms →
          </Link>
        </Card>

      </div>
    </AppShell>
  );
}

function RowLink({
  to,
  Icon,
  label,
  hint,
}: {
  to: string;
  Icon: typeof Receipt;
  label: string;
  hint: string;
}) {
  return (
    <Link to={to} className="tap flex items-center gap-3 border-b border-border p-4 last:border-0">
      <Icon className="size-5 text-primary" />
      <span className="flex-1 text-sm font-semibold">{label}</span>
      <span className="text-xs text-muted-foreground">{hint}</span>
      <ChevronRight className="size-4 text-muted-foreground" />
    </Link>
  );
}
