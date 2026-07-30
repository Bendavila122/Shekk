import { useState } from "react";
import { Card, PrimaryButton } from "@/components/AppShell";
import { Avatar } from "@/components/Avatar";
import { ils } from "@/lib/mock";
import { useFriends, useSplits } from "@/lib/useSocial";

/** Pick friends, set a total, split it evenly or by hand. */
export function SplitFlow() {
  const { data } = useFriends();
  const { create } = useSplits();
  const friends = data?.friends ?? [];

  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [picked, setPicked] = useState<string[]>([]);
  const [total, setTotal] = useState("");
  const [mode, setMode] = useState<"even" | "custom">("even");
  const [custom, setCustom] = useState<Record<string, string>>({});
  const [note, setNote] = useState("");

  const amount = Number(total) || 0;
  const people = picked.length + 1;
  const each = people > 0 ? Math.round((amount / people) * 100) / 100 : 0;

  const shares = picked.map((userId) => ({
    userId,
    amount: mode === "even" ? each : Number(custom[userId]) || 0,
  }));
  const asked = shares.reduce((sum, s) => sum + s.amount, 0);
  const valid = amount > 0 && shares.length > 0 && shares.every((s) => s.amount > 0) && asked <= amount + 0.01;

  const reset = () => {
    setStep(0);
    setPicked([]);
    setTotal("");
    setNote("");
    setCustom({});
  };

  return (
    <section>
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Start a split</h2>
      <Card className="space-y-4">
        {step === 0 && (
          <>
            <p className="text-sm font-semibold">Who's in?</p>
            {friends.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Add friends first — search a handle on the Friends tab and they'll show up here.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {friends.map((f) => (
                  <button
                    key={f.userId}
                    onClick={() =>
                      setPicked((p) => (p.includes(f.userId) ? p.filter((x) => x !== f.userId) : [...p, f.userId]))
                    }
                    className={`tap rounded-2xl border p-3 text-center ${
                      picked.includes(f.userId) ? "border-primary bg-primary-soft" : "border-border"
                    }`}
                  >
                    <Avatar
                      name={f.displayName}
                      src={f.avatarUrl}
                      className="mx-auto mb-1 size-9"
                      textClassName="text-xs"
                    />
                    <span className="block truncate text-[11px] font-semibold">{f.displayName.split(" ")[0]}</span>
                  </button>
                ))}
              </div>
            )}
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
                  className={`tap rounded-xl py-2 text-sm font-semibold ${
                    mode === m ? "bg-card shadow-card" : "text-muted-foreground"
                  }`}
                >
                  {m === "even" ? "Split evenly" : "Custom"}
                </button>
              ))}
            </div>

            {mode === "even" ? (
              <div className="rounded-2xl bg-muted p-3 text-sm">
                <p>
                  {people} people · <strong>{ils(each)}</strong> each. You cover your own share.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {picked.map((id) => {
                  const f = friends.find((x) => x.userId === id);
                  return (
                    <div key={id} className="flex items-center gap-2">
                      <Avatar name={f?.displayName ?? "Member"} className="size-8" textClassName="text-[10px]" />
                      <span className="min-w-0 flex-1 truncate text-sm">{f?.displayName}</span>
                      <input
                        inputMode="decimal"
                        value={custom[id] ?? ""}
                        onChange={(e) =>
                          setCustom((c) => ({ ...c, [id]: e.target.value.replace(/[^0-9.]/g, "") }))
                        }
                        placeholder="0"
                        className="w-24 rounded-xl border border-border px-3 py-2 text-right text-sm outline-none focus:border-primary"
                      />
                    </div>
                  );
                })}
                <p className="text-xs text-muted-foreground">
                  Asking for {ils(asked)} of {ils(amount)} — the rest is on you.
                </p>
              </div>
            )}

            {create.error && (
              <p className="text-xs font-semibold text-destructive">{(create.error as Error).message}</p>
            )}
            <PrimaryButton
              disabled={!valid || create.isPending}
              onClick={() =>
                create.mutate(
                  { note: note.trim() || "Split the bill", total: amount, mode, shares },
                  { onSuccess: () => setStep(2) },
                )
              }
            >
              {create.isPending ? "Sending…" : "Send requests"}
            </PrimaryButton>
          </>
        )}

        {step === 2 && (
          <div className="space-y-3 text-center">
            <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-success-soft text-2xl">
              📨
            </span>
            <p className="text-sm font-semibold">Requests sent{note ? ` for “${note}”` : ""}</p>
            <p className="text-xs text-muted-foreground">
              You'll see who has paid as they settle up — the money lands in your balance straight away.
            </p>
            <button onClick={reset} className="tap-flat text-sm font-semibold text-primary">
              Start another split
            </button>
          </div>
        )}
      </Card>
    </section>
  );
}
