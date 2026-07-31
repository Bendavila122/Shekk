import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bookmark,
  BookmarkCheck,
  Bus,
  Clock,
  ExternalLink,
  Footprints,
  LoaderCircle,
  MapPin,
  Phone,
  Star,
} from "lucide-react";
import { AppShell, Card, PrimaryButton, ScreenHeader } from "@/components/AppShell";
import {
  FACILITIES,
  STAY_OPTIONS,
  distanceLabel,
  effectiveMonthly,
  shekels,
} from "@/lib/fitness";
import { useFitnessShortlist, useFitnessVenue } from "@/lib/useFitness";
import { haptic } from "@/lib/foryou-prefs";

export const Route = createFileRoute("/explore/fitness/$id")({
  head: () => ({
    meta: [
      { title: "Fitness venue · Shekk" },
      {
        name: "description",
        content:
          "Opening hours, travel time, typical membership prices and contract length for a gym, pool or studio in Israel.",
      },
      { property: "og:title", content: "Fitness venue · Shekk" },
      {
        property: "og:description",
        content: "Hours, travel time and what a membership actually costs.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Venue,
});

function Venue() {
  const { id } = Route.useParams();
  const { venue, loading, error, travel, mapsReady } = useFitnessVenue(id);
  const { isSaved, toggleSaved, compare, toggleCompare } = useFitnessShortlist();

  if (loading || (mapsReady === null && !venue))
    return (
      <AppShell>
        <ScreenHeader title="Fitness" back="/explore/fitness" />
        <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
          <LoaderCircle className="size-4 animate-spin" /> Opening this place…
        </div>
      </AppShell>
    );

  if (!venue)
    return (
      <AppShell>
        <ScreenHeader title="Fitness" back="/explore/fitness" />
        <div className="p-4">
          <Card className="space-y-2 text-sm text-muted-foreground">
            <p className="font-display text-base font-bold text-foreground">We couldn't open this place</p>
            <p>{error ?? "It may have closed or moved. Try searching again."}</p>
            <Link to="/explore/fitness" className="tap inline-block font-semibold text-primary">
              Back to Fitness
            </Link>
          </Card>
        </div>
      </AppShell>
    );

  const saved = isSaved(venue.id);
  const extras = venue.extras;

  return (
    <AppShell>
      <ScreenHeader title={venue.name} subtitle={extras.chain ?? "Fitness"} back="/explore/fitness" />

      <div className="space-y-4 px-4 py-4">
        <Card className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="font-display text-2xl font-bold leading-tight">{venue.name}</h2>
              <p className="mt-1 flex items-start gap-1.5 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 size-4 shrink-0" />
                {venue.address}
              </p>
            </div>
            <button
              type="button"
              aria-label={saved ? "Remove from saved" : "Save this place"}
              onClick={() => {
                haptic();
                toggleSaved(venue);
              }}
              className="tap shrink-0 rounded-full bg-muted p-2.5"
            >
              {saved ? <BookmarkCheck className="size-5 text-primary" /> : <Bookmark className="size-5" />}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            {venue.rating !== null && (
              <span className="inline-flex items-center gap-1 font-semibold">
                <Star className="size-4 fill-current" />
                {venue.rating.toFixed(1)}
                {venue.reviews ? (
                  <span className="font-normal text-muted-foreground">· {venue.reviews} reviews</span>
                ) : null}
              </span>
            )}
            {venue.openNow !== null && (
              <span className={venue.openNow ? "font-semibold text-success" : "text-muted-foreground"}>
                {venue.openNow ? "Open now" : "Closed right now"}
              </span>
            )}
            {venue.distanceKm !== undefined && (
              <span className="text-muted-foreground">{distanceLabel(venue.distanceKm)} away</span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {venue.phone && (
              <a
                href={`tel:${venue.phone.replace(/\s/g, "")}`}
                className="tap inline-flex items-center gap-1.5 rounded-xl bg-muted px-3 py-2 text-xs font-semibold"
              >
                <Phone className="size-3.5" /> Call
              </a>
            )}
            {venue.mapsUri && (
              <a
                href={venue.mapsUri}
                target="_blank"
                rel="noreferrer"
                className="tap inline-flex items-center gap-1.5 rounded-xl bg-muted px-3 py-2 text-xs font-semibold"
              >
                <MapPin className="size-3.5" /> Directions
              </a>
            )}
            {venue.website && (
              <a
                href={venue.website}
                target="_blank"
                rel="noreferrer"
                className="tap inline-flex items-center gap-1.5 rounded-xl bg-muted px-3 py-2 text-xs font-semibold"
              >
                <ExternalLink className="size-3.5" /> Website
              </a>
            )}
          </div>
        </Card>

        {(travel?.walk || travel?.transit) && (
          <Card className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Getting there</p>
            <div className="flex flex-wrap gap-4 text-sm">
              {travel.walk && (
                <span className="inline-flex items-center gap-1.5">
                  <Footprints className="size-4 text-muted-foreground" /> {travel.walk.minutes} min walk
                </span>
              )}
              {travel.transit && (
                <span className="inline-flex items-center gap-1.5">
                  <Bus className="size-4 text-muted-foreground" /> {travel.transit.minutes} min by bus
                </span>
              )}
            </div>
          </Card>
        )}

        <Card className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            What it costs for your stay
          </p>
          <div className="grid grid-cols-2 gap-3">
            {STAY_OPTIONS.filter((s) => s.id !== "unsure").map((s) => {
              const monthly = effectiveMonthly(extras, s.months);
              return (
                <div key={s.id} className="rounded-xl bg-muted p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{s.label}</p>
                  <p className="mt-1 font-display text-lg font-bold">
                    {monthly !== null ? `~${shekels(monthly)}/mo` : "Ask them"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{s.hint}</p>
                </div>
              );
            })}
          </div>
          <dl className="space-y-1.5 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Day pass</dt>
              <dd className="font-semibold">
                {extras.dayPassIls !== undefined ? shekels(extras.dayPassIls) : "Ask at the desk"}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Shortest contract</dt>
              <dd className="font-semibold">
                {extras.minContractMonths !== undefined
                  ? extras.minContractMonths <= 1
                    ? "Rolling monthly"
                    : `${extras.minContractMonths} months`
                  : "Ask at the desk"}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Short-stay option</dt>
              <dd className="font-semibold">{extras.shortStay ? "Yes" : "Ask at the desk"}</dd>
            </div>
          </dl>
          {extras.note && <p className="text-xs text-muted-foreground">{extras.note}</p>}
          {extras.offer && (
            <div className="rounded-xl border border-notice-border bg-notice-soft p-3 text-sm text-notice-foreground">
              <p className="font-semibold">Shekk offer</p>
              <p className="text-xs opacity-90">{extras.offer}</p>
            </div>
          )}
        </Card>

        {(extras.facilities?.length ?? 0) > 0 && (
          <Card className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Facilities</p>
            <div className="flex flex-wrap gap-2">
              {extras.facilities!.map((f) => {
                const meta = FACILITIES.find((x) => x.id === f);
                return (
                  <span key={f} className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                    {meta?.emoji} {meta?.label ?? f}
                  </span>
                );
              })}
            </div>
          </Card>
        )}

        {venue.hours?.length ? (
          <Card className="space-y-2">
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Clock className="size-3.5" /> Opening hours
            </p>
            <ul className="space-y-1 text-sm">
              {venue.hours.map((line) => (
                <li key={line} className="text-muted-foreground">
                  {line}
                </li>
              ))}
            </ul>
          </Card>
        ) : null}

        <PrimaryButton
          onClick={() => {
            haptic();
            toggleCompare(venue.id);
          }}
        >
          {compare.includes(venue.id) ? "In your compare list" : "Add to compare"}
        </PrimaryButton>

        <p className="pb-4 text-[11px] leading-relaxed text-muted-foreground">
          Prices shown are typical list prices to help you compare and aren't a quote. Venue details, hours and
          travel times come from Google Maps. Booking and Shekk memberships are coming here next.
        </p>
      </div>
    </AppShell>
  );
}
