import { useState } from "react";
import { Camera, Check, Copy, QrCode, UserPlus, X } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { QRCode } from "@/components/QRCode";
import { QrScanner } from "@/components/QrScanner";
import { useFriends, useMyHandle } from "@/lib/useSocial";
import type { MemberCard } from "@/lib/social.server";

export const payCodeFor = (handle: string) => `shekk:u/${handle}`;

/** "Show my code" and "Scan" — the two ways to add a friend without typing. */
export function FriendCodes() {
  const [sheet, setSheet] = useState<"none" | "mine" | "scan">("none");

  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setSheet("mine")}
          className="tap flex items-center justify-center gap-2 rounded-2xl bg-ink py-3 text-sm font-semibold text-ink-foreground"
        >
          <QrCode className="size-4" /> Show my code
        </button>
        <button
          onClick={() => setSheet("scan")}
          className="tap flex items-center justify-center gap-2 rounded-2xl bg-muted py-3 text-sm font-semibold"
        >
          <Camera className="size-4" /> Scan a code
        </button>
      </div>

      {sheet === "mine" && <MyCodeSheet onClose={() => setSheet("none")} />}
      {sheet === "scan" && <ScanSheet onClose={() => setSheet("none")} />}
    </>
  );
}

function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50">
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default" />
      <div className="relative max-h-[88vh] w-full overflow-y-auto rounded-t-3xl bg-card p-5 shadow-lift">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-base font-bold">{title}</p>
          <button aria-label="Close" onClick={onClose} className="tap rounded-full bg-muted p-2">
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function MyCodeSheet({ onClose }: { onClose: () => void }) {
  const { me, loading } = useMyHandle();
  const [copied, setCopied] = useState(false);

  return (
    <Sheet title="My Shekk tag" onClose={onClose}>
      {loading || !me ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Loading your code…</p>
      ) : (
        <div className="space-y-4 text-center">
          <div className="mx-auto w-fit rounded-3xl bg-card p-4 shadow-card">
            <QRCode value={payCodeFor(me.handle)} className="h-56 w-56" />
          </div>
          <div>
            <p className="text-lg font-bold">{me.displayName}</p>
            <p className="text-sm font-semibold text-primary">@{me.handle}</p>
          </div>
          <button
            onClick={() => {
              navigator.clipboard?.writeText(`@${me.handle}`);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            className="tap mx-auto flex items-center gap-2 rounded-full bg-muted px-4 py-2.5 text-sm font-semibold"
          >
            {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
            {copied ? "Copied" : "Copy my tag"}
          </button>
          <p className="text-xs text-muted-foreground">
            Friends scan this code — or search your tag — to add you and send you shekels.
          </p>
        </div>
      )}
    </Sheet>
  );
}

function ScanSheet({ onClose }: { onClose: () => void }) {
  const { resolveCode, add } = useFriends();
  const [found, setFound] = useState<MemberCard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manual, setManual] = useState("");
  const [looking, setLooking] = useState(false);

  const lookup = async (code: string) => {
    setError(null);
    setLooking(true);
    try {
      const member = await resolveCode(code);
      if (!member) {
        setError("No Shekk member matches that code.");
        return;
      }
      setFound(member);
    } catch {
      setError("Could not look that code up. Try again.");
    } finally {
      setLooking(false);
    }
  };

  return (
    <Sheet title="Scan a Shekk code" onClose={onClose}>
      {found ? (
        <div className="space-y-4 text-center">
          <Avatar name={found.displayName} src={found.avatarUrl} className="mx-auto size-16" />
          <div>
            <p className="text-lg font-bold">{found.displayName}</p>
            <p className="text-sm text-muted-foreground">
              @{found.handle}
              {found.program ? ` \u00b7 ${found.program}` : ""}
            </p>
          </div>
          <button
            disabled={add.isPending}
            onClick={() => add.mutate(found.userId, { onSuccess: onClose })}
            className="tap flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground disabled:opacity-50"
          >
            <UserPlus className="size-4" /> Send friend request
          </button>
          <button onClick={() => setFound(null)} className="tap-flat text-sm font-semibold text-muted-foreground">
            Scan someone else
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <QrScanner paused={looking} onResult={(value) => void lookup(value)} />

          <div className="flex gap-2">
            <input
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              placeholder="@handle or shekk:u/handle"
              className="flex-1 rounded-2xl border border-border px-4 py-3 text-sm outline-none focus:border-primary"
            />
            <button
              disabled={manual.trim().length < 3 || looking}
              onClick={() => void lookup(manual)}
              className="tap rounded-2xl bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              Find
            </button>
          </div>
          {error && <p className="text-xs font-semibold text-destructive">{error}</p>}
        </div>
      )}
    </Sheet>
  );
}
