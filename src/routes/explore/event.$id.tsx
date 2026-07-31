import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { AlertCircle, CalendarDays, MapPin, Minus, Plus, Ticket } from "lucide-react";
import { AppShell, Card, PrimaryButton, ScreenHeader } from "@/components/AppShell";
import { EVENT_KIND_LABEL, eventWhen, useBuyTicket, useEvent } from "@/lib/useEvents";
import { ils } from "@/lib/mock";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/explore/event/$id")({
  head: () => ({
    meta: [
      { title: "Event · Shekk" },
      { name: "description", content: "Book your spot and pay from your Shekk balance." },
      { property: "og:title", content: "Event · Shekk" },
      { property: "og:description", content: "Book your spot and pay from your Shekk balance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EventDetail,
});

function EventDetail() {
  const { id } = useParams({ from: "/explore/event/$id" });
  const navigate = useNavigate();
  const { data, isLoading, error } = useEvent(id);
  const { available } = useApp();
  const buy = useBuyTicket();
  const [qty, setQty] = useState(1);
  const [done, setDone] = useState<{ code: string; quantity: number; amount: number } | null>(null);

  const event = data?.event ?? null;
  const mine = data?.mine ?? 0;

  if (isLoading) {
    return (
      <AppShell>
        <ScreenHeader title="Event" back="/explore/events" />
        <div className="space-y-3 px-4 py-4">
          <div className="h-40 animate-pulse rounded-2xl bg-muted" />
          <div className="h-24 animate-pulse rounded-2xl bg-muted" />
        </div>
      </AppShell>
    );
  }

  if (error || !event) {
    return (
      <AppShell>
        <ScreenHeader title="Event" back="/explore/events" />
        <div className="px-4 py-4">
          <Card className="space-y-2 text-center">
            <p className="text-3xl">🎟️</p>
            <p className="text-sm font-semibold">This event isn&apos;t available</p>
            <p className="text-xs text-muted-foreground">
              It may have been taken off sale. Have a look at what else is on.
            </p>
            <Link to="/explore/events" className="tap inline-block text-sm font-semibold text-primary">
              Back to events
            </Link>
          </Card>
        </div>
      </AppShell>
    );
  }

  const soldOut = event.remaining !== null && event.remaining === 0;
  const leftForMe = Math.max(0, event.perPersonLimit - mine);
  const maxQty = Math.max(1, Math.min(leftForMe, event.remaining ?? event.perPersonLimit));
  const total = +(event.price * qty).toFixed(2);
  const shortBy = +(total - available).toFixed(2);
  const canAfford = shortBy <= 0;

  if (done) {
    return (
      <AppShell>
        <ScreenHeader title="You're in" back="/explore/events" />
        <div className="space-y-4 px-4 py-6 text-center">
          <p className="text-5xl">{event.emoji}</p>
          <div>
            <h2 className="text-xl font-bold">{event.title}</h2>
            <p className="text-sm text-muted-foreground">
              {done.quantity} {done.quantity === 1 ? "spot" : "spots"} ·{" "}
              {done.amount === 0 ? "Free" : ils(done.amount)}
            </p>
          </div>
          <Card className="space-y-1">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Ticket code</p>
            <p className="font-mono text-lg font-bold tracking-widest">{done.code}</p>
          </Card>
          <PrimaryButton onClick={() => navigate({ to: "/tickets" })}>Show my ticket</PrimaryButton>
          <button
            onClick={() => navigate({ to: "/explore/events" })}
            className="tap w-full text-sm font-semibold text-muted-foreground"
          >
            Back to events
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <ScreenHeader title={event.title} subtitle={event.host} back="/explore/events" />

      <div className="space-y-4 px-4 py-4">
        {event.coverUrl ? (
          <img
            src={event.coverUrl}
            alt={event.title}
            loading="lazy"
            className="h-44 w-full rounded-2xl object-cover"
          />
        ) : (
          <div className="flex h-44 w-full items-center justify-center rounded-2xl bg-muted text-6xl">
            {event.emoji}
          </div>
        )}

        <Card className="space-y-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {EVENT_KIND_LABEL[event.kind]}
            </p>
            <h2 className="text-lg font-bold">{event.title}</h2>
          </div>
          <div className="space-y-1.5 text-sm">
            <p className="flex items-center gap-2">
              <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
              {eventWhen(event.startsAt)}
            </p>
            {event.venue || event.city ? (
              <p className="flex items-center gap-2">
                <MapPin className="size-4 shrink-0 text-muted-foreground" />
                {[event.venue, event.city].filter(Boolean).join(" · ")}
              </p>
            ) : null}
            <p className="flex items-center gap-2">
              <Ticket className="size-4 shrink-0 text-muted-foreground" />
              {event.price === 0 ? "Free" : `${ils(event.price)} per person`}
              {event.remaining !== null ? ` · ${event.remaining} of ${event.capacity} left` : ""}
            </p>
          </div>
          {event.description ? (
            <p className="whitespace-pre-line text-sm text-muted-foreground">{event.description}</p>
          ) : null}
          {event.includes ? (
            <div className="rounded-xl bg-muted p-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                What&apos;s included
              </p>
              <p className="mt-1 whitespace-pre-line text-sm">{event.includes}</p>
            </div>
          ) : null}
        </Card>

        {mine > 0 ? (
          <Link to="/tickets" className="tap block">
            <Card className="flex items-center gap-3 border-primary/30">
              <Ticket className="size-5 shrink-0 text-primary" />
              <p className="flex-1 text-sm font-semibold">
                You already have {mine} {mine === 1 ? "spot" : "spots"} — view ticket
              </p>
            </Card>
          </Link>
        ) : null}

        {soldOut ? (
          <Card className="text-center text-sm font-semibold text-muted-foreground">Sold out</Card>
        ) : leftForMe === 0 ? (
          <Card className="text-center text-sm text-muted-foreground">
            You&apos;ve reached the limit of {event.perPersonLimit} per person for this one.
          </Card>
        ) : (
          <>
            <Card className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">How many spots?</p>
                <div className="flex items-center gap-3">
                  <button
                    aria-label="One fewer"
                    onClick={() => setQty((n) => Math.max(1, n - 1))}
                    disabled={qty <= 1}
                    className="tap rounded-full bg-muted p-2 disabled:opacity-40"
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="w-6 text-center text-lg font-bold">{qty}</span>
                  <button
                    aria-label="One more"
                    onClick={() => setQty((n) => Math.min(maxQty, n + 1))}
                    disabled={qty >= maxQty}
                    className="tap rounded-full bg-muted p-2 disabled:opacity-40"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-lg font-bold">{total === 0 ? "Free" : ils(total)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Paid from your Shekk balance ({ils(available)} available). Tickets aren&apos;t refundable or
                transferable.
              </p>
            </Card>

            {buy.error ? (
              <Card className="flex items-start gap-2 border-destructive/30 text-sm text-destructive">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>{(buy.error as Error).message}</span>
              </Card>
            ) : null}

            {canAfford ? (
              <PrimaryButton
                disabled={buy.isPending}
                onClick={() =>
                  buy.mutate(
                    { eventId: event.id, quantity: qty },
                    { onSuccess: (res) => setDone(res) },
                  )
                }
              >
                {buy.isPending
                  ? "Getting your spot…"
                  : total === 0
                    ? "Get my spot"
                    : `Pay ${ils(total)}`}
              </PrimaryButton>
            ) : (
              <div className="space-y-2">
                <Card className="text-center text-sm text-muted-foreground">
                  You&apos;re {ils(shortBy)} short — top up and come back.
                </Card>
                <PrimaryButton onClick={() => navigate({ to: "/top-up" })}>Top up</PrimaryButton>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
