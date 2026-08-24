import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeftRight, CreditCard, Split, Send, Wallet, Check, Sparkles } from "lucide-react";
import { AppShell, ScreenHeader, Notice } from "@/components/AppShell";
import { Chip, MicroLabel, SectionHead } from "@/components/Kit";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/lib/store";
import { track } from "@/lib/analytics";
import { toast } from "sonner";

export const Route = createFileRoute("/money")({
  head: () => ({
    meta: [
      { title: "Shekk Money — coming soon" },
      {
        name: "description",
        content:
          "Shekk Money is the next chapter: hold pounds, dollars and euros, convert to shekels at a fair rate, spend with a Shekk card and split bills with friends. Join early access.",
      },
      { property: "og:title", content: "Shekk Money — coming soon" },
      {
        property: "og:description",
        content: "Spend in Israel without the fees. Join the Shekk Money early access list.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MoneyPreview,
});

const FEATURES = [
  { Icon: Wallet, title: "Hold your money in shekels", body: "Move money in before you fly and spend it here without a daily FX surprise." },
  { Icon: ArrowLeftRight, title: "Convert GBP, USD and EUR", body: "One clear rate, one clear fee, shown before you convert." },
  { Icon: CreditCard, title: "A Shekk card", body: "Tap in Israel, no foreign transaction fee, freeze it from the app." },
  { Icon: Send, title: "Send money to friends", body: "Pay back the person who covered the taxi, instantly." },
  { Icon: Split, title: "Split bills", body: "Split a shared Shabbat dinner or an apartment bill without a spreadsheet." },
];

const INTERESTS = ["Spending in shekels", "A Shekk card", "Cheap currency exchange", "Sending money to friends", "Splitting bills"];

function MoneyPreview() {
  const { signedIn } = useApp();
  const [picked, setPicked] = useState<string[]>([]);
  const [joined, setJoined] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    track("money_preview_viewed");
  }, []);

  useEffect(() => {
    if (!signedIn) return;
    void (async () => {
      const { data } = await supabase.from("money_waitlist").select("id").limit(1);
      if (data && data.length > 0) setJoined(true);
    })();
  }, [signedIn]);

  const toggle = (v: string) =>
    setPicked((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));

  const join = async () => {
    setBusy(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const user = session.session?.user;
      if (!user) {
        toast.error("Sign in first so we can save your place");
        return;
      }
      const { error } = await supabase
        .from("money_waitlist")
        .insert({ user_id: user.id, email: user.email ?? null, interests: picked });
      if (error) throw error;
      setJoined(true);
      track("money_early_access_joined", { interests: picked.length });
      toast.success("You're on the list — we'll be in touch first");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save your place");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell>
      <ScreenHeader title="Shekk Money" subtitle="Coming after launch" back="/" />

      <header className="px-4 pt-5">
        <div className="grad-balance relative overflow-hidden rounded-[1.5rem] px-5 py-6 text-ink-foreground shadow-lift">
          <span className="card-sheen pointer-events-none absolute inset-0" aria-hidden />
          <div className="relative">
            <MicroLabel className="opacity-70">Next chapter</MicroLabel>
            <h1 className="mt-2 font-display text-[1.8rem] font-bold leading-tight tracking-tight">
              Shekk Money
            </h1>
            <p className="mt-2 max-w-[22rem] text-[13px] leading-relaxed opacity-85">
              One balance for your year in Israel: hold your home currency, convert to shekels at a fair rate, and spend
              with a Shekk card. We're building it with a regulated partner, so it lands properly or not at all.
            </p>
          </div>
        </div>
      </header>

      <div className="space-y-6 px-4 pb-10 pt-6">
        <section>
          <SectionHead title="What it will do" hint="Being built now, not live yet" />
          <div className="space-y-2.5">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-card">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <f.Icon className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[13.5px] font-semibold leading-snug">{f.title}</span>
                  <span className="mt-0.5 block text-[12px] leading-snug text-muted-foreground">{f.body}</span>
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[1.25rem] border border-primary/25 bg-primary-soft p-4">
          <MicroLabel className="text-primary">
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="size-3.5" /> Early access
            </span>
          </MicroLabel>
          {joined ? (
            <>
              <p className="mt-2 flex items-center gap-2 text-[15px] font-semibold">
                <Check className="size-4 text-success" /> You're on the list
              </p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">
                We'll invite early-access members before anyone else, starting with the features people asked for most.
              </p>
            </>
          ) : (
            <>
              <p className="mt-2 text-[15px] font-semibold leading-snug">Join Shekk Money early access</p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">
                Tell us what you'd use most and we'll invite you first.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {INTERESTS.map((i) => (
                  <Chip key={i} selected={picked.includes(i)} onClick={() => toggle(i)}>
                    {i}
                  </Chip>
                ))}
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={join}
                className="tap mt-3.5 inline-flex w-full items-center justify-center rounded-full bg-primary px-4 py-3 text-[13px] font-bold text-primary-foreground disabled:opacity-60"
              >
                {busy ? "Saving…" : signedIn ? "Join early access" : "Sign in to join"}
              </button>
            </>
          )}
        </section>

        <section>
          <SectionHead title="Until then" hint="What's genuinely useful today" />
          <div className="space-y-2.5">
            <Link to="/explore/money-planner" className="tap flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-card">
              <span className="min-w-0 flex-1">
                <span className="block text-[13.5px] font-semibold">Money planner</span>
                <span className="block text-[12px] text-muted-foreground">
                  What a month in Israel really costs, and a budget you can hold to
                </span>
              </span>
              <span className="shrink-0 text-sm font-semibold text-primary">→</span>
            </Link>
            <Link to="/guides" className="tap flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-card">
              <span className="min-w-0 flex-1">
                <span className="block text-[13.5px] font-semibold">Paying for things in Israel</span>
                <span className="block text-[12px] text-muted-foreground">
                  Cards, cash, Bit, tipping and the fees to avoid
                </span>
              </span>
              <span className="shrink-0 text-sm font-semibold text-primary">→</span>
            </Link>
          </div>
        </section>

        <Notice title="Why nothing here moves money yet">
          Wallet, exchange and card screens exist inside Shekk as engineering previews while we finish the regulated
          work with our partner. We'd rather show you nothing than a balance you can't trust.
        </Notice>
      </div>
    </AppShell>
  );
}
