import { useState } from "react";
import { AtSign, Check, Copy, Pencil } from "lucide-react";
import { Card } from "@/components/AppShell";
import { useMyHandle } from "@/lib/useSocial";

/** The member's Shekk tag — the @name friends use to find and pay them. */
export function ShekkTagCard() {
  const { me, loading, save } = useMyHandle();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [copied, setCopied] = useState(false);

  if (loading) {
    return (
      <Card>
        <p className="text-sm text-muted-foreground">Loading your Shekk tag…</p>
      </Card>
    );
  }
  if (!me) return null;

  return (
    <Card className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
          <AtSign className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Your Shekk tag</p>
          <p className="truncate font-display text-xl font-bold">@{me.handle}</p>
        </div>
        <button
          aria-label="Copy Shekk tag"
          onClick={() => {
            navigator.clipboard?.writeText(`@${me.handle}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="tap rounded-full bg-muted p-2.5"
        >
          {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
        </button>
        <button
          aria-label="Edit Shekk tag"
          onClick={() => {
            setDraft(me.handle);
            setEditing((v) => !v);
          }}
          className="tap rounded-full bg-muted p-2.5"
        >
          <Pencil className="size-4" />
        </button>
      </div>

      {editing ? (
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="flex flex-1 items-center gap-1 rounded-2xl border border-border px-3">
              <span className="text-sm font-semibold text-muted-foreground">@</span>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                className="w-full bg-transparent py-3 text-sm outline-none"
              />
            </div>
            <button
              disabled={draft.length < 3 || draft === me.handle || save.isPending}
              onClick={() => save.mutate({ handle: draft }, { onSuccess: () => setEditing(false) })}
              className="tap rounded-2xl bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              Save
            </button>
          </div>
          {save.error && <p className="text-xs font-semibold text-destructive">{(save.error as Error).message}</p>}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          Friends search this tag — or scan your code in Social — to add you and send you shekels.
        </p>
      )}
    </Card>
  );
}
