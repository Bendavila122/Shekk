import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Navigation, X } from "lucide-react";
import { AppShell, ScreenHeader } from "@/components/AppShell";
import {
  GettingThere,
  LocationBar,
  NeedsLocation,
  PlaceActions,
  PlaceFacts,
  PlaceHours,
  PlaceList,
  PlaceMap,
  PlacePhoto,
  PlacesEmpty,
  PlacesError,
  PlacesLoading,
  PlacesNotConfigured,
} from "@/components/places";
import { useLocation } from "@/lib/location";
import {
  PLACE_CATEGORIES,
  categorySet,
  emojiFor,
  usePlacesFeed,
  useTravelTo,
  type Place,
  type PlaceCategoryId,
} from "@/lib/places";
import { haptic } from "@/lib/foryou-prefs";

export const Route = createFileRoute("/explore/maps")({
  head: () => ({
    meta: [
      { title: "Maps · Shekk" },
      {
        name: "description",
        content:
          "One map for everything around you in Israel — food, coffee, pharmacies, cash, transit and sights, with walking and bus times from where you are.",
      },
      { property: "og:title", content: "Maps · Shekk" },
      {
        property: "og:description",
        content: "Search anywhere in Israel, see what's nearby by category, and get walking or transit times.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MapsApp,
});

const RADII = [
  { label: "500 m", value: 500 },
  { label: "1.5 km", value: 1500 },
  { label: "5 km", value: 5000 },
  { label: "15 km", value: 15000 },
];

function Chip({ active, onClick, children }: { active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`tap shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
        active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function MapsApp() {
  const { place: here, status, loading: locating, detect } = useLocation();
  const [category, setCategory] = useState<PlaceCategoryId>("food");
  const [radiusM, setRadiusM] = useState(1500);
  const [term, setTerm] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "idle" && !locating) detect();
  }, [status, locating, detect]);

  const feed = usePlacesFeed({ categories: categorySet([category]), query: term, radiusM });
  const active = feed.places.find((p) => p.id === activeId) ?? null;

  return (
    <AppShell>
      <ScreenHeader title="Maps" subtitle={here ? `${here.city}${here.area ? ` · ${here.area}` : ""}` : "Israel"} />

      <div className="space-y-3 px-4 pb-6">
        <LocationBar />

        <label className="flex items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2">
          <span className="sr-only">Search a place</span>
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search a place, street or city"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {term && (
            <button type="button" aria-label="Clear search" onClick={() => setTerm("")} className="tap-flat">
              <X className="size-4 text-muted-foreground" />
            </button>
          )}
        </label>

        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          {PLACE_CATEGORIES.map((c) => (
            <Chip
              key={c.id}
              active={!term && c.id === category}
              onClick={() => {
                haptic();
                setTerm("");
                setCategory(c.id);
                setActiveId(null);
              }}
            >
              {c.emoji} {c.label}
            </Chip>
          ))}
        </div>

        <div className="relative">
          <PlaceMap centre={feed.at} places={feed.places} activeId={activeId} onSelect={setActiveId} />
          <button
            type="button"
            onClick={() => {
              haptic();
              detect();
            }}
            className="tap absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-card/95 px-3 py-2 text-xs font-semibold shadow-lift backdrop-blur"
          >
            <Navigation className={`size-3.5 ${locating ? "animate-pulse" : ""}`} /> Recentre
          </button>
        </div>

        {!term && (
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4">
            {RADII.map((r) => (
              <Chip key={r.value} active={r.value === radiusM} onClick={() => setRadiusM(r.value)}>
                {r.label}
              </Chip>
            ))}
          </div>
        )}

        {feed.ready === false && <PlacesNotConfigured what="Maps" />}
        {!feed.at && !term && feed.ready !== false && (
          <NeedsLocation hint="Share your location or pick a city above to see what's nearby — or search a place by name." />
        )}
        {feed.error && <PlacesError message={feed.error} />}
        {feed.loading && feed.places.length === 0 && <PlacesLoading />}
        {!feed.loading && feed.places.length === 0 && feed.ready && !feed.error && <PlacesEmpty />}

        <PlaceList places={feed.places} activeId={activeId} onSelect={(p) => setActiveId(p.id)} />
      </div>

      {active && <PlaceSheet place={active} onClose={() => setActiveId(null)} />}
    </AppShell>
  );
}

function PlaceSheet({ place, onClose }: { place: Place; onClose: () => void }) {
  const { travel } = useTravelTo({ lat: place.lat, lon: place.lon });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-ink/40" />
      <div className="relative z-10 max-h-[85vh] w-full max-w-[430px] space-y-3 overflow-y-auto rounded-t-3xl border border-border bg-card p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-lift">
        <div className="flex items-start gap-3">
          <span className="text-2xl leading-none">{emojiFor(place.types)}</span>
          <div className="min-w-0 flex-1">
            <h2 className="truncate font-display text-lg font-bold">{place.name}</h2>
            <p className="truncate text-xs text-muted-foreground">{place.address}</p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="tap-flat rounded-full bg-muted p-1.5 text-muted-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
        {place.photos[0] && (
          <PlacePhoto
            photo={place.photos[0]}
            alt={place.name}
            emoji={emojiFor(place.types)}
            className="h-40 w-full rounded-2xl"
            variant="detail"
          />
        )}
        <PlaceFacts place={place} />
        <GettingThere travel={travel} />
        <PlaceHours place={place} />
        <PlaceActions place={place} />
      </div>
    </div>
  );
}
