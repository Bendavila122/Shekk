import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, Card, ScreenHeader } from "@/components/AppShell";
import { QRCode } from "@/components/QRCode";
import { EVENT_KIND_LABEL, eventWhen, useMyTickets } from "@/lib/useEvents";
import { ils } from "@/lib/mock";

export const Route = createFileRoute("/tickets")({
  head: () => ({
    meta: [
      { title: "My tickets · Shekk" },
      {
        name: "description",
        content: "Every Shabbaton, tiyul and club night you're booked on — QR ticket ready at the door.",
      },
      { property: "og:title", content: "My tickets · Shekk" },
      { property: "og:description", content: "Your QR tickets for Shabbatons, tiyulim and nights out." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Tickets,
});

function Tickets() {
  const { data, isLoading, error } = useMyTickets();
  const [openId, setOpenId] = useState<string | null>(null);

  const tickets = data ?? [];
  const now = Date.now();
  const upcoming = tickets.filter(
    (t) => !t.event.cancelled && t.status === "valid" && new Date(t.event.startsAt).getTime() > now - 6 * 3600_000,
  );
  const past = tickets.filter((t) => !upcoming.includes(t));

  return (
    <AppShell>
      <ScreenHeader title="My tickets" subtitle="Show the QR at the door" back="/explore/events" />

      <div className="space-y-5 px-4 py-4">
        {isLoading && (
          <div className="space-y-3">
            {[0, 1].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        )}

        {error && (
          <Card className="text-sm text-muted-foreground">
            Your tickets couldn&apos;t load just now. Try again in a moment.
          </Card>
        )}

        {!isLoading && !error && tickets.length === 0 && (
          <Card className="space-y-1.5 text-center">
            <p className="text-3xl">🎟️</p>
            <p className="text-sm font-semibold">No tickets yet</p>
            <p className="text-xs text-muted-foreground">
              Book a Shabbaton, tiyul or a Thursday night and it&apos;ll live here.
            </p>
            <Link to="/explore/events" className="tap inline-block text-sm font-semibold text-primary">
              Browse events
            </Link>
          </Card>
        )}

        {upcoming.length > 0 && (
          <Section title="Coming up">
            {upcoming.map((t) => (
              <TicketCard
                key={t.id}
                ticket={t}
                open={openId === t.id}
                onToggle={() => setOpenId(openId === t.id ? null : t.id)}
              />
            ))}
          </Section>
        )}

        {past.length > 0 && (
          <Section title="Past & cancelled">
            {past.map((t) => (
              <TicketCard
                key={t.id}
                ticket={t}
                dim
                open={openId === t.id}
                onToggle={() => setOpenId(openId === t.id ? null : t.id)}
              />
            ))}
          </Section>
        )}
      </div>
    </AppShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="px-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{title}</p>
      {children}
    </div>
  );
}

type Ticket = NonNullable<ReturnType<typeof useMyTickets>["data"]>[number];

function TicketCard({
  ticket,
  open,
  onToggle,
  dim = false,
}: {
  ticket: Ticket;
  open: boolean;
  onToggle: () => void;
  dim?: boolean;
}) {
  const cancelled = ticket.event.cancelled || ticket.status === "cancelled";
  return (
    <Card className={dim ? "opacity-70" : ""}>
      <button onClick={onToggle} className="tap flex w-full items-center gap-3 text-left">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-muted text-2xl">
          {ticket.event.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{ticket.event.title}</p>
          <p className="truncate text-xs text-muted-foreground">
            {ticket.event.host} · {eventWhen(ticket.event.startsAt)}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {EVENT_KIND_LABEL[ticket.event.kind]} · {ticket.quantity}{" "}
            {ticket.quantity === 1 ? "spot" : "spots"} ·{" "}
            {ticket.amount === 0 ? "Free" : ils(ticket.amount)}
          </p>
        </div>
        {cancelled ? (
          <span className="shrink-0 rounded-full bg-muted px-2 py-1 text-[11px] font-semibold text-muted-foreground">
            Cancelled
          </span>
        ) : ticket.status === "used" ? (
          <span className="shrink-0 rounded-full bg-muted px-2 py-1 text-[11px] font-semibold text-muted-foreground">
            Used
          </span>
        ) : (
          <span className="shrink-0 text-xs font-semibold text-primary">{open ? "Hide" : "Show"}</span>
        )}
      </button>

      {open && !cancelled ? (
        <div className="mt-4 flex flex-col items-center gap-2 border-t border-border pt-4">
          <div className="rounded-2xl bg-white p-3">
            <QRCode value={`shekk:ticket:${ticket.code}`} size={180} />
          </div>
          <p className="font-mono text-sm font-bold tracking-widest">{ticket.code}</p>
          <p className="text-center text-xs text-muted-foreground">
            {ticket.event.venue || ticket.event.city
              ? [ticket.event.venue, ticket.event.city].filter(Boolean).join(" · ")
              : null}
          </p>
          <p className="text-center text-[11px] text-muted-foreground">
            Not refundable or transferable.
          </p>
        </div>
      ) : null}
    </Card>
  );
}
