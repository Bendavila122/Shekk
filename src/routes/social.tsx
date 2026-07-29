import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { AppShell, Card, PrimaryButton } from "@/components/AppShell";
import { ils } from "@/lib/mock";
import { Avatar } from "@/components/Avatar";
import { useApp } from "@/lib/store";
import { useOnboardedGate } from "@/lib/useOnboardedGate";

export const Route = createFileRoute("/social")({
  head: () => ({
    meta: [
      { title: "Social · Shekk" },
      {
        name: "description",
        content: "Split a bill with your cohort, follow an opt-in activity feed and keep up with your program thread.",
      },
      { property: "og:title", content: "Social · Shekk" },
      { property: "og:description", content: "Split the bill and stay in the loop with your cohort." },
    ],
  }),
  component: Social,
});

type Tab = "split" | "thread" | "feed";

function Social() {
  const ready = useOnboardedGate();
  const [tab, setTab] = useState<Tab>("split");
  const { state, payFriend, setFeedOptIn } = useApp();

  if (!ready) return <AppShell><div className="p-6 text-sm text-muted-foreground">Loading…</div></AppShell>;

  return (
    <AppShell>
      <header className="px-5 pt-7">
        <h1 className="text-3xl font-bold">Social</h1>
        <p className="text-sm text-muted-foreground">Nobody chases anybody for ₪18 again.</p>
      </header>

      <div className="mx-5 mt-4 grid grid-cols-3 gap-1 rounded-2xl bg-muted p-1">
        {(
          [
            ["split", "Split"],
            ["thread", "Cohort"],
            ["feed", "Feed"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`tap rounded-xl py-2 text-sm font-semibold ${
              tab === k ? "bg-card shadow-card" : "text-muted-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="px-5 py-5">
        {tab === "split" && (
          <div className="space-y-5">
            <section>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Requests for you
              </h2>
              <Card className="divide-y divide-border p-0">
                {state.splits.length === 0 && (
                  <p className="p-4 text-sm text-muted-foreground">
                    No one is waiting on you. Requests from friends land here.
                  </p>
                )}
                {state.splits.map((r) => (
                  <div key={r.id} className="flex items-center gap-3 p-4">
                    <Avatar name={r.from} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{r.from}</p>
                      <p className="truncate text-xs text-muted-foreground">{r.reason}</p>
                    </div>
                    {r.paid ? (
                      <span className="flex items-center gap-1 text-xs font-semibold text-success">
                        <Check className="size-4" /> Paid
                      </span>
                    ) : (
                      <button
                        onClick={() => payFriend(r.id)}
                        className="tap rounded-full bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground"
                      >
                        Pay {ils(r.amount)}
                      </button>
                    )}
                  </div>
                ))}
              </Card>
            </section>
            <SplitFlow />
          </div>
        )}

        {tab === "thread" && <CohortThread />}

        {tab === "feed" && (
          <div className="space-y-3">
            <Card className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Share my activity</p>
                <p className="text-xs text-muted-foreground">Opt-in. Amounts are never shown to friends.</p>
              </div>
              <button
                onClick={() => setFeedOptIn(!state.feedOptIn)}
                className={`tap h-7 w-12 rounded-full p-1 ${state.feedOptIn ? "bg-success" : "bg-border"}`}
              >
                <span
                  className={`block size-5 rounded-full bg-card transition-transform ${
                    state.feedOptIn ? "translate-x-5" : ""
                  }`}
                />
              </button>
            </Card>
            {state.feedOptIn ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Nothing yet. When friends you add start booking and splitting, it shows up here.
              </p>
            ) : (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Feed is off. Flip the switch to see what your cohort is up to.
              </p>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function CohortThread() {
  const { state, sendCohortMessage } = useApp();
  const [draft, setDraft] = useState("");

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    sendCohortMessage(text);
    setDraft("");
  };

  return (
    <div className="space-y-3">
      <Card className="bg-primary-soft">
        <p className="text-sm font-semibold">{state.cohort ? `Cohort ${state.cohort}` : "Your cohort"}</p>
        <p className="text-xs text-muted-foreground">
          {state.cohort ? "Announcements from your madrichim land here." : "Join a program to unlock your cohort thread."}
        </p>
      </Card>
      {state.cohortMessages.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">No messages yet — say something first.</p>
      )}
      {state.cohortMessages.map((m) => (
        <div key={m.id} className={`flex ${m.me ? "justify-end" : "justify-start"}`}>
          <div
            className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
              m.me ? "bg-primary text-primary-foreground" : "bg-card shadow-card"
            }`}
          >
            {!m.me && <p className="mb-1 text-xs font-semibold text-primary">{m.who}</p>}
            <p>{m.text}</p>
            <p className={`mt-1 text-[10px] ${m.me ? "opacity-70" : "text-muted-foreground"}`}>{m.when}</p>
          </div>
        </div>
      ))}
      <div className="flex gap-2 pt-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Message your cohort…"
          className="flex-1 rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
        />
        <button onClick={send} className="tap rounded-2xl bg-primary px-4 text-sm font-semibold text-primary-foreground">
          Send
        </button>
      </div>
    </div>
  );
}

function SplitFlow() {
  const { state, addSplit, addFriend } = useApp();
  const [newFriend, setNewFriend] = useState("");
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [picked, setPicked] = useState<string[]>([]);
  const [total, setTotal] = useState("");
  const [mode, setMode] = useState<"even" | "custom">("even");
  const [note, setNote] = useState("");

  const amount = Number(total) || 0;
  const people = picked.length + 1;
  const each = people > 0 ? +(amount / people).toFixed(2) : 0;

  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  return (
    <section>
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Start a split</h2>
      <Card className="space-y-4">
        {step === 0 && (
          <>
            <p className="text-sm font-semibold">Who's in?</p>
            {state.friends.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No friends yet. Add someone by name to split with them.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {state.friends.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => toggle(f.id)}
                    className={`tap rounded-2xl border p-3 text-center ${
                      picked.includes(f.id) ? "border-primary bg-primary-soft" : "border-border"
                    }`}
                  >
                    <Avatar name={f.name} className="mx-auto mb-1 size-9" textClassName="text-xs" />
                    <span className="block truncate text-[11px] font-semibold">{f.name.split(" ")[0]}</span>
                  </button>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                value={newFriend}
                onChange={(e) => setNewFriend(e.target.value)}
                placeholder="Add a friend by name"
                className="flex-1 rounded-2xl border border-border px-4 py-3 text-sm outline-none focus:border-primary"
              />
              <button
                onClick={() => {
                  if (!newFriend.trim()) return;
                  addFriend(newFriend);
                  setNewFriend("");
                }}
                className="tap flex items-center gap-1 rounded-2xl bg-muted px-3 text-sm font-semibold"
              >
                <Plus className="size-4" /> Add
              </button>
            </div>
            <PrimaryButton disabled={picked.length === 0} onClick={() => setStep(1)}>
              Next · {picked.length} friend{picked.length === 1 ? "" : "s"}
            </PrimaryButton>
          </>
        )}

        {step === 1 && (
          <>
            <label className="block text-sm font-semibold">Total bill (₪)</label>
            <input
              inputMode="decimal"
              value={total}
              onChange={(e) => setTotal(e.target.value.replace(/[^0-9.]/g, ""))}
              className="w-full rounded-2xl border border-border px-4 py-3 font-display text-2xl font-bold outline-none focus:border-primary"
            />
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What's it for?"
              className="w-full rounded-2xl border border-border px-4 py-3 text-sm outline-none focus:border-primary"
            />
            <div className="grid grid-cols-2 gap-1 rounded-2xl bg-muted p-1">
              {(["even", "custom"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`tap rounded-xl py-2 text-sm font-semibold ${mode === m ? "bg-card shadow-card" : "text-muted-foreground"}`}
                >
                  {m === "even" ? "Split evenly" : "Custom"}
                </button>
              ))}
            </div>
            <div className="rounded-2xl bg-muted p-3 text-sm">
              {mode === "even" ? (
                <p>
                  {people} people · <strong>{ils(each)}</strong> each
                </p>
              ) : (
                <p className="text-muted-foreground">
                  Custom: everyone gets {ils(each)} pre-filled — tap a name in the request to adjust.
                </p>
              )}
            </div>
            <PrimaryButton disabled={amount <= 0} onClick={() => setStep(2)}>
              Send requests
            </PrimaryButton>
          </>
        )}

        {step === 2 && (
          <div className="space-y-3 text-center">
            <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-success-soft text-2xl">
              📨
            </span>
            <p className="text-sm font-semibold">Requests sent for “{note}”</p>
            <p className="text-xs text-muted-foreground">
              {picked.length} friend{picked.length === 1 ? "" : "s"} asked for {ils(each)} each. They can pay in one tap.
            </p>
            <PrimaryButton
              onClick={() => {
                addSplit({
                  id: `sp${Date.now()}`,
                  from: state.friends.find((f) => f.id === picked[0])?.name ?? "Friend",
                  reason: `${note} (their share)`,
                  amount: each,
                  paid: false,
                });
                setStep(3);
              }}
            >
              Simulate a friend splitting back
            </PrimaryButton>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3 text-center">
            <p className="text-sm font-semibold">New request added above ↑</p>
            <button onClick={() => { setStep(0); setPicked([]); }} className="tap text-sm font-semibold text-primary">
              Start another split
            </button>
          </div>
        )}
      </Card>
    </section>
  );
}
