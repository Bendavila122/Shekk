import { useState } from "react";
import { X } from "lucide-react";
import { Card, PrimaryButton } from "@/components/AppShell";
import { Avatar } from "@/components/Avatar";
import { ils } from "@/lib/mock";
import { useApp } from "@/lib/store";
import { useSendMoney } from "@/lib/useSocial";
import type { MemberCard } from "@/lib/social.server";

/** Send shekels to one friend. The server owns the balance; we only ask. */
export function SendMoneySheet({
  member,
  conversationId,
  onClose,
}: {
  member: MemberCard;
  conversationId?: string;
  onClose: () => void;
}) {
  const { available } = useApp();
  const send = useSendMoney();
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [done, setDone] = useState(false);

  const value = Number(amount) || 0;
  const tooMuch = value > available;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-6">
      <Card className="w-full max-w-md space-y-4 rounded-b-none sm:rounded-3xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar name={member.displayName} src={member.avatarUrl} />
            <div>
              <p className="text-sm font-semibold">{member.displayName}</p>
              <p className="text-xs text-muted-foreground">@{member.handle}</p>
            </div>
          </div>
          <button aria-label="Close" onClick={onClose} className="tap rounded-full bg-muted p-2">
            <X className="size-4" />
          </button>
        </div>

        {done ? (
          <div className="space-y-3 py-4 text-center">
            <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-success-soft text-2xl">
              ✅
            </span>
            <p className="text-sm font-semibold">
              Sent {ils(value)} to {member.displayName.split(" ")[0]}
            </p>
            <PrimaryButton onClick={onClose}>Done</PrimaryButton>
          </div>
        ) : (
          <>
            <div>
              <label className="mb-1 block text-sm font-semibold">Amount (₪)</label>
              <input
                inputMode="decimal"
                autoFocus
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                className="w-full rounded-2xl border border-border px-4 py-3 font-display text-3xl font-bold outline-none focus:border-primary"
              />
              <p className="mt-1 text-xs text-muted-foreground">{ils(available)} available to spend</p>
            </div>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What's it for?"
              className="w-full rounded-2xl border border-border px-4 py-3 text-sm outline-none focus:border-primary"
            />
            {tooMuch && <p className="text-xs font-semibold text-destructive">That's more than you have right now.</p>}
            {send.error && <p className="text-xs font-semibold text-destructive">{(send.error as Error).message}</p>}
            <PrimaryButton
              disabled={value <= 0 || tooMuch || send.isPending}
              onClick={() =>
                send.mutate(
                  { toUserId: member.userId, amount: value, note: note.trim() || null, ...(conversationId ? { conversationId } : {}) } as never,
                  { onSuccess: () => setDone(true) },
                )
              }
            >
              {send.isPending ? "Sending…" : `Send ${value > 0 ? ils(value) : "shekels"}`}
            </PrimaryButton>
          </>
        )}
      </Card>
    </div>
  );
}
