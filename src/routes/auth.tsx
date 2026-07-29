import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { FocusScreen, PrimaryButton, Card } from "@/components/AppShell";

function safeNext(value: unknown): string {
  if (typeof value !== "string") return "/";
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

export const Route = createFileRoute("/auth")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({ next: safeNext(s.next) }),
  head: () => ({
    meta: [
      { title: "Join Shekk · one wallet for your year in Israel" },
      {
        name: "description",
        content:
          "Create your Shekk account: shekels, a Shekk card, split bills and your programme in one app. Sign up with Google or email in under a minute.",
      },
      { property: "og:title", content: "Join Shekk" },
      { property: "og:description", content: "One wallet for your year in Israel." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Auth,
});

const PROMISES = [
  "Shekels you can spend the day you land",
  "A Shekk card, virtual straight away",
  "Split Shabbaton, tiyul and taxi bills in a tap",
];

function Auth() {
  const { next } = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function social(provider: "google" | "apple") {
    const label = provider === "google" ? "Google" : "Apple";
    setBusy(true);
    setError(null);
    const result = await lovable.auth.signInWithOAuth(provider, {
      redirect_uri: window.location.origin,
      ...(provider === "google" ? { extraParams: { prompt: "select_account" } } : {}),
    });
    if (result.error) {
      setBusy(false);
      return setError(result.error.message ?? `${label} sign-in failed. Try email instead.`);
    }
    if (result.redirected) return;
    setBusy(false);
    window.location.href = next === "/" ? "/verify" : next;
  }


  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);

    if (mode === "forgot") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      setBusy(false);
      if (error) return setError(error.message);
      return setNotice("Check your email for a link to set a new password.");
    }

    if (mode === "signup") {
      if (!accepted) {
        setBusy(false);
        return setError("Please accept the Terms & Conditions to continue.");
      }
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/verify` },
      });
      setBusy(false);
      if (error) return setError(error.message);
      setNotice("Check your email to confirm your account, then sign in to finish verification.");
      setMode("signin");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return setError(error.message);
    window.location.href = next === "/" ? "/verify" : next;
  }

  return (
    <FocusScreen nav={false}>
      <div className="flex min-h-screen flex-col justify-center gap-6 px-6 py-14 sm:min-h-[860px]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Shekk</p>
          <h1 className="mt-2 text-3xl font-extrabold leading-tight tracking-tight">
            {mode === "signup"
              ? "Your year in Israel, one wallet."
              : mode === "signin"
                ? "Welcome back."
                : "Reset your password."}
          </h1>
          {mode === "signup" && (
            <ul className="mt-4 space-y-1.5">
              {PROMISES.map((p) => (
                <li key={p} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="mt-0.5 size-4 shrink-0 text-success" />
                  {p}
                </li>
              ))}
            </ul>
          )}
        </div>

        {mode !== "forgot" && (
          <>
            <button
              type="button"
              onClick={() => social("google")}
              disabled={busy}
              className="tap flex w-full items-center justify-center gap-3 rounded-2xl border border-border bg-card px-5 py-4 text-base font-semibold shadow-card disabled:opacity-50"
            >
              <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8Z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1A12 12 0 0 0 12 24Z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.4 14.4a7.2 7.2 0 0 1 0-4.6V6.7H1.4a12 12 0 0 0 0 10.7l4-3Z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.8c1.8 0 3.4.6 4.6 1.8l3.4-3.4A11.5 11.5 0 0 0 12 0 12 12 0 0 0 1.4 6.7l4 3.1C6.3 6.9 8.9 4.8 12 4.8Z"
                />
              </svg>
              Continue with Google
            </button>
            <button
              type="button"
              onClick={() => social("apple")}
              disabled={busy}
              className="tap -mt-3 flex w-full items-center justify-center gap-3 rounded-2xl border border-border bg-card px-5 py-4 text-base font-semibold shadow-card disabled:opacity-50"
            >
              <svg viewBox="0 0 24 24" className="size-5 fill-foreground" aria-hidden="true">
                <path d="M16.4 12.7c0-2.4 2-3.6 2.1-3.6-1.1-1.7-2.9-1.9-3.6-1.9-1.5-.2-3 .9-3.7.9-.8 0-2-.9-3.2-.8-1.7 0-3.2 1-4 2.5-1.7 3-.4 7.4 1.2 9.8.8 1.2 1.8 2.5 3 2.5 1.2 0 1.7-.8 3.1-.8 1.5 0 1.9.8 3.2.7 1.3 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8 0 0-2.4-.9-2.4-3.6ZM14.1 5.1c.7-.8 1.1-2 1-3.1-1 0-2.2.7-2.9 1.5-.6.7-1.2 1.9-1 3 1.1.1 2.2-.6 2.9-1.4Z" />
              </svg>
              Continue with Apple
            </button>
            <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-muted-foreground">
              <span className="h-px flex-1 bg-border" /> or email <span className="h-px flex-1 bg-border" />
            </div>
          </>

        )}

        <form onSubmit={submit} className="space-y-3">
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-2xl border border-border bg-background px-4 py-3.5 text-base"
          />
          {mode !== "forgot" && (
            <input
              type="password"
              required
              minLength={8}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (8+ characters)"
              className="w-full rounded-2xl border border-border bg-background px-4 py-3.5 text-base"
            />
          )}

          {mode === "signup" && (
            <Card className="space-y-3">
              <div className="max-h-28 overflow-y-auto rounded-xl bg-muted/50 p-3 text-xs leading-relaxed text-muted-foreground">
                <p className="font-semibold text-foreground">The short version</p>
                <p className="mt-1">
                  Shekk is a shekel spending account. You add money from your own card or bank in
                  your home currency; it is converted to shekels at the rate shown before you
                  confirm, with the conversion cost always displayed. Money is held with our
                  regulated payment partner, not by Shekk.
                </p>
                <p className="mt-1">
                  You must be 16 or over, verify your identity before spending, and use the account
                  yourself — never for someone else. We check your identity again every 12 months.
                  Unspent shekels can be returned to you on closure to a source in your own name.
                </p>
              </div>
              <label className="flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                  className="mt-0.5 size-5 rounded border-border"
                />
                <span>
                  I accept the{" "}
                  <Link to="/terms" className="font-semibold underline">
                    Terms &amp; Conditions
                  </Link>{" "}
                  and privacy notice. I confirm I am 18 or over and opening this account for myself, and I consent to electronic records and to identity checks run by Shekk&rsquo;s regulated payments partner.
                </span>
              </label>
            </Card>
          )}

          {error && (
            <p role="alert" className="text-sm font-medium text-destructive">
              {error}
            </p>
          )}
          {notice && <p className="text-sm text-muted-foreground">{notice}</p>}

          <PrimaryButton type="submit" disabled={busy}>
            {busy ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="size-4 animate-spin" /> Please wait…
              </span>
            ) : mode === "signup" ? (
              "Create my account"
            ) : mode === "signin" ? (
              "Sign in"
            ) : (
              "Email me a reset link"
            )}
          </PrimaryButton>
        </form>

        <div className="space-y-2 text-center text-sm">
          <button
            type="button"
            onClick={() => {
              setError(null);
              setNotice(null);
              setMode(mode === "signup" ? "signin" : "signup");
            }}
            className="text-muted-foreground underline"
          >
            {mode === "signup" ? "Already have an account? Sign in" : "New here? Create an account"}
          </button>
          {mode !== "forgot" && (
            <div>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setNotice(null);
                  setMode("forgot");
                }}
                className="text-xs text-muted-foreground underline"
              >
                Forgot your password?
              </button>
            </div>
          )}
        </div>

        <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
          <ShieldCheck className="size-3.5" /> Identity checks are run by our regulated payment
          partner.
        </p>
        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          className="text-center text-sm text-muted-foreground"
        >
          Back to Shekk
        </button>
      </div>
    </FocusScreen>
  );
}
