/**
 * The shared results list, plus the states every location screen needs.
 *
 * A location screen has exactly five outcomes: not switched on, no location
 * yet, still loading, failed, or nothing matched. Keeping them here means every
 * mini app says the same honest thing instead of inventing its own copy.
 */

import type { ReactNode } from "react";
import { LoaderCircle, MapPin } from "lucide-react";
import { Card } from "@/components/AppShell";
import { PlaceCard } from "./PlaceCard";
import { GoogleAttribution } from "./GoogleAttribution";
import type { Place } from "@/lib/places";

export function PlacesNotConfigured({ what = "This finder" }: { what?: string }) {
  return (
    <Card className="space-y-1">
      <p className="font-display text-base font-bold">{what} isn't switched on yet</p>
      <p className="text-sm text-muted-foreground">
        Venue data comes from Google Maps. Once the Google Maps connection is linked to Shekk, places near you
        appear here automatically. Nothing is made up in the meantime.
      </p>
    </Card>
  );
}

export function NeedsLocation({ hint }: { hint?: string }) {
  return (
    <Card className="flex items-start gap-2 text-sm text-muted-foreground">
      <MapPin className="mt-0.5 size-4 shrink-0" />
      <span>{hint ?? "Share your location or pick a city above — or just search a place name."}</span>
    </Card>
  );
}

export function PlacesLoading({ label = "Looking for places near you…" }: { label?: string }) {
  return (
    <Card className="flex items-center gap-2 text-sm text-muted-foreground">
      <LoaderCircle className="size-4 animate-spin" /> {label}
    </Card>
  );
}

export function PlacesError({ message }: { message: string }) {
  return (
    <Card className="text-sm text-muted-foreground">
      <p className="font-semibold text-foreground">Couldn't load places</p>
      <p className="mt-1">{message}</p>
    </Card>
  );
}

export function PlacesEmpty({ hint }: { hint?: string }) {
  return (
    <Card className="text-sm text-muted-foreground">
      {hint ?? "Nothing matched. Try a wider radius, fewer filters, or search a city."}
    </Card>
  );
}

export function PlaceList({
  places,
  activeId,
  savedIds,
  onSelect,
  onSave,
  footerFor,
  attribution = true,
}: {
  places: Place[];
  activeId?: string | null;
  savedIds?: Set<string>;
  onSelect?: (place: Place) => void;
  onSave?: (place: Place) => void;
  footerFor?: (place: Place) => ReactNode;
  attribution?: boolean;
}) {
  if (!places.length) return null;
  return (
    <div className="space-y-3">
      {places.map((place) => (
        <PlaceCard
          key={place.id}
          place={place}
          active={activeId === place.id}
          {...(savedIds ? { saved: savedIds.has(place.id) } : {})}
          {...(onSelect ? { onSelect: () => onSelect(place) } : {})}
          {...(onSave ? { onSave: () => onSave(place) } : {})}
          {...(footerFor ? { footer: footerFor(place) } : {})}
        />
      ))}
      {attribution && <GoogleAttribution className="px-1 pt-1" />}
    </div>
  );
}
