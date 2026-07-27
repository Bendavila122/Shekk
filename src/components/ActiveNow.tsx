import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { useApp } from "@/lib/store";
import { QRCode } from "@/components/QRCode";

type LiveItem = {
  id: string;
  emoji: string;
  label: string;
  title: string;
  sub: string;
  meta?: string;
  gradient: string;
  cta: string;
  to?: string;
  qr?: string;
};

function fmtCountdown(ms: number) {
  if (ms <= 0) return "now";
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"}`;
  const h = Math.floor(mins / 60);
  return `${h}h ${mins % 60}m`;
}

/** Deterministic-ish "live" offsets anchored to the current session. */
function useAnchors() {
  const [anchor] = useState(() => Date.now());
  return useMemo(
    () => ({
      ticket: anchor + 102 * 60000,
      train: anchor + 18 * 60000,
      gett: anchor + 3 * 60000,
    }),
    [anchor],
  );
}

export function ActiveNow() {
  const { state, hydrated } = useApp();
  const anchors = useAnchors();
  const [now, setNow] = useState(() => Date.now());
  const [qr, setQr] = useState<LiveItem | null>(null);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(t);
  }, []);

  const pendingSplit = state.splits.find((s) => !s.paid);

  const items = useMemo<LiveItem[]>(() => {
    const list: LiveItem[] = [
      {
        id: "ticket",
        emoji: "🎟️",
        label: "Tonight's ticket",
        title: "Rooftop Party · Florentin",
        sub: `Starts in ${fmtCountdown(anchors.ticket - now)}`,
        meta: "2 tickets · Gate B",
        gradient: "from-[oklch(0.46_0.19_320)] to-[oklch(0.34_0.16_300)]",
        cta: "View QR",
        qr: "shekk-ticket:rooftop-party:2",
      },
      {
        id: "train",
        emoji: "🚆",
        label: "Current journey",
        title: "Jerusalem → Tel Aviv",
        sub: `Arriving in ${fmtCountdown(anchors.train - now)}`,
        meta: "Platform 4 · Israel Railways",
        gradient: "from-[oklch(0.48_0.15_250)] to-[oklch(0.34_0.13_255)]",
        cta: "View QR",
        qr: "shekk-rail:jer-tlv",
      },
      {
        id: "gett",
        emoji: "🚕",
        label: "Gett ride",
        title: "Amir · Škoda Octavia",
        sub: `Arriving in ${fmtCountdown(anchors.gett - now)}`,
        meta: "48-392-71 · ₪31 fare",
        gradient: "from-[oklch(0.55_0.16_75)] to-[oklch(0.42_0.14_55)]",
        cta: "Track ride",
        to: "/service/gett",
      },
      {
        id: "ravkav",
        emoji: "🚌",
        label: "Rav-Kav",
        title: "Balance ₪14.20",
        sub: "Low balance — 2 rides left",
        meta: "Anonymous card · 0498",
        gradient: "from-[oklch(0.48_0.13_190)] to-[oklch(0.35_0.11_200)]",
        cta: "Top up",
        to: "/topup",
      },
      {
        id: "booking",
        emoji: "🏠",
        label: "Current booking",
        title: "Airbnb · Nachlaot studio",
        sub: "Check-in today from 3:00pm",
        meta: "Host Maya · 2 nights",
        gradient: "from-[oklch(0.46_0.14_150)] to-[oklch(0.34_0.12_160)]",
        cta: "Open booking",
        to: "/explore",
      },
      {
        id: "event",
        emoji: "🎫",
        label: "Upcoming event",
        title: "Friday Night Dinner",
        sub: "Tomorrow · 7:30pm",
        meta: "Katamon · 40 going",
        gradient: "from-[oklch(0.44_0.16_285)] to-[oklch(0.32_0.14_290)]",
        cta: "View QR",
        qr: "shekk-event:friday-night-dinner",
      },
    ];

    if (pendingSplit) {
      list.unshift({
        id: `split-${pendingSplit.id}`,
        emoji: "💸",
        label: "Pending split",
        title: `${pendingSplit.from.split(" ")[0]} requested ₪${pendingSplit.amount.toFixed(2)}`,
        sub: pendingSplit.reason,
        meta: "Waiting on you",
        gradient: "from-[oklch(0.5_0.19_25)] to-[oklch(0.36_0.16_20)]",
        cta: "Pay now",
        to: "/social",
      });
    }

    return list;
  }, [anchors, now, pendingSplit]);

  if (!hydrated || items.length === 0) return null;

  return (
    <section className="pt-6">
      <div className="flex items-baseline justify-between px-5">
        <h2 className="font-display text-base font-bold tracking-tight">Active now</h2>
        <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-70" />
            <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
          </span>
          Live
        </span>
      </div>

      <div className="no-scrollbar mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1">
        {items.map((item) => {
          const inner = (
            <>
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-white/15 text-sm backdrop-blur">
                  {item.emoji}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/75">{item.label}</span>
              </div>
              <div className="mt-3 rounded-2xl bg-white/12 p-3 backdrop-blur">
                <p className="line-clamp-1 text-[15px] font-bold leading-tight text-white">{item.title}</p>
                <p className="mt-1 line-clamp-1 text-[12px] font-medium text-white/85">{item.sub}</p>
                {item.meta ? <p className="mt-0.5 line-clamp-1 text-[11px] text-white/65">{item.meta}</p> : null}
              </div>
              <span className="mt-3 inline-flex w-fit rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-neutral-900">
                {item.cta}
              </span>
            </>
          );

          const className = `tap widget-tile flex min-h-[168px] w-[15.5rem] shrink-0 snap-start flex-col rounded-[1.5rem] bg-gradient-to-br ${item.gradient} p-3.5 text-left`;

          return item.to ? (
            <Link key={item.id} to={item.to} className={className}>
              {inner}
            </Link>
          ) : (
            <button key={item.id} type="button" onClick={() => setQr(item)} className={className}>
              {inner}
            </button>
          );
        })}
      </div>

      {qr ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-neutral-950/45 p-4 animate-fade-in"
          onClick={() => setQr(null)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-card p-5 shadow-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{qr.label}</p>
                <p className="mt-1 text-sm font-bold">{qr.title}</p>
                <p className="text-xs text-muted-foreground">{qr.sub}</p>
              </div>
              <button
                type="button"
                onClick={() => setQr(null)}
                className="tap-icon rounded-full bg-muted p-1.5"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="mt-4 flex flex-col items-center rounded-2xl bg-muted p-4">
              <QRCode value={qr.qr || qr.id} className="h-44 w-44" />
              <p className="mt-2 text-center text-[11px] text-muted-foreground">
                Show this at the door — staff scan it to check you in.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
