import { useEffect, useRef, useState } from "react";
import { Camera, Check, Copy, QrCode, UserPlus, X } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { QRCode } from "@/components/QRCode";
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

type Detector = { detect: (source: CanvasImageSource) => Promise<Array<{ rawValue: string }>> };

function ScanSheet({ onClose }: { onClose: () => void }) {
  const { resolveCode, add } = useFriends();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [status, setStatus] = useState<"starting" | "live" | "unavailable">("starting");
  const [manual, setManual] = useState("");
  const [found, setFound] = useState<MemberCard | null>(null);
  const [error, setError] = useState<string | null>(null);

  const lookup = async (code: string) => {
    setError(null);
    const member = await resolveCode(code);
    if (!member) {
      setError("No Shekk member matches that code.");
      return;
    }
    setFound(member);
  };

  useEffect(() => {
    if (found) return;
    let stream: MediaStream | null = null;
    let timer: ReturnType<typeof setInterval> | null = null;
    let cancelled = false;

    const Ctor = (window as unknown as { BarcodeDetector?: new (o: { formats: string[] }) => Detector })
      .BarcodeDetector;

    (async () => {
      if (!Ctor || !navigator.mediaDevices?.getUserMedia) {
        setStatus("unavailable");
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (cancelled) return;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setStatus("live");
        const detector = new Ctor({ formats: ["qr_code"] });
        timer = setInterval(async () => {
          if (!videoRef.current) return;
          try {
            const hits = await detector.detect(videoRef.current);
            if (hits[0]?.rawValue) {
              if (timer) clearInterval(timer);
              await lookup(hits[0].rawValue);
            }
          } catch {
            /* keep scanning */
          }
        }, 500);
      } catch {
        setStatus("unavailable");
      }
    })();

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
      stream?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [found]);

  return (
    <Sheet title="Scan a Shekk code" onClose={onClose}>
      {found ? (
        <div className="space-y-4 text-center">
          <Avatar name={found.displayName} src={found.avatarUrl} className="mx-auto size-16" />
          <div>
            <p className="text-lg font-bold">{found.displayName}</p>
            <p className="text-sm text-muted-foreground">
              @{found.handle}
              {found.program ? ` · ${found.program}` : ""}
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
          <div className="relative aspect-square overflow-hidden rounded-3xl bg-ink">
            <video ref={videoRef} muted playsInline className="size-full object-cover" />
            {status !== "live" && (
              <p className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-ink-foreground/80">
                {status === "starting"
                  ? "Starting the camera…"
                  : "Camera scanning is not available on this device — type the tag below instead."}
              </p>
            )}
            <div className="pointer-events-none absolute inset-8 rounded-2xl border-2 border-white/70" />
          </div>

          <div className="flex gap-2">
            <input
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              placeholder="@handle or shekk:u/handle"
              className="flex-1 rounded-2xl border border-border px-4 py-3 text-sm outline-none focus:border-primary"
            />
            <button
              disabled={manual.trim().length < 3}
              onClick={() => lookup(manual)}
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
