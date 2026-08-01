import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Compass,
  ExternalLink,
  Footprints,
  LoaderCircle,
  MapPin,
  Navigation,
  Phone,
  Search,
  Star,
  TrainFront,
  X,
} from "lucide-react";
import { AppShell, Card, ScreenHeader } from "@/components/AppShell";
import { BROWSER_KEY, GoogleMapCanvas } from "@/components/GoogleMapCanvas";
import { distanceKm, useLocation } from "@/lib/location";
import {
  MAPS_CATEGORIES,
  PRICE_LABEL,
  RADII,
  categoryEmoji,
  directionsUrl,
  kmLabel,
  mapsCategory,
  type MapsPlace,
} from "@/lib/maps";
import { mapsNearby, mapsSearch, mapsStatus, mapsTravel } from "@/lib/maps.functions";
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

function Chip({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
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
  const [category, setCategory] = useState("food");
  const [radiusM, setRadiusM] = useState(1500);
  const [term, setTerm] = useState("");
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  const config = useQuery({ queryKey: ["maps", "status"], queryFn: () => mapsStatus() });
  const configured = config.data?.configured ?? false;

  useEffect(() => {
    if (status === "idle" && !locating) detect();
  }, [status, locating, detect]);

  const cat = mapsCategory(category);
  const centre = here ?? { city: "Jerusalem", lat: 31.7683, lon: 35.2137 };

  const results = useQuery({
    queryKey: ["maps", "results", query, category, radiusM, centre.lat, centre.lon, configured],
    enabled: configured,
    staleTime: 60_000,
    queryFn: () =>
      query
        ? mapsSearch({ data: { query, lat: centre.lat, lon: centre.lon } })
        : mapsNearby({
            data: { lat: centre.lat, lon: centre.lon, radiusM, placeTypes: cat.placeTypes },
          }),
  });

  const places = useMemo(() => {
    const list = results.data ?? [];
    return list
      .map((p) => ({ p, km: distanceKm(centre.lat, centre.lon, p.lat, p.lon) }))
      .sort((a, b) => a.km - b.km);
  }, [results.data, centre.lat, centre.lon]);

  const active = places.find(({ p }) => p.id === activeId)?.p ?? null;

  return (
    <AppShell>
      <ScreenHeader title="Maps" subtitle={here ? `${here.city}${here.area ? ` · ${here.area}` : ""}` : "Israel"} />

      <div className="space-y-3 px-4 pb-6">
        {/* search */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setQuery(term.trim());
            setActiveId(null);
          }}
          className="flex items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2"
        >
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search a place, street or city"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {query ? (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                setTerm("");
                setQuery("");
              }}
              className="tap-flat rounded-full bg-muted p-1 text-muted-foreground"
            >
              <X className="size-3.5" />
            </button>
          ) : null}
        </form>

        {/* categories */}
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          {MAPS_CATEGORIES.map((c) => (
            <Chip
              key={c.id}
              active={!query && c.id === category}
              onClick={() => {
                haptic();
                setQuery("");
                setTerm("");
                setCategory(c.id);
                setActiveId(null);
              }}
            >
              {c.emoji} {c.label}
            </Chip>
          ))}
        </div>

        {/* the map itself */}
        <div className="relative h-[46dvh] w-full overflow-hidden rounded-3xl border border-border bg-muted">
          {BROWSER_KEY ? (
            <GoogleMapCanvas
              centre={{ lat: centre.lat, lon: centre.lon }}
              places={places.map(({ p }) => p)}
              activeId={activeId}
              onSelect={setActiveId}
              className="h-full w-full"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
              <Compass className="size-6 text-muted-foreground" />
              <p className="text-sm font-semibold">Live map isn't switched on yet</p>
              <p className="text-xs text-muted-foreground">
                Connect Google Maps and the map draws itself here. Everything below still works from the list.
              </p>
            </div>
          )}

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

        {/* radius, for nearby mode */}
        {!query ? (
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4">
            {RADII.map((r) => (
              <Chip key={r.value} active={r.value === radiusM} onClick={() => setRadiusM(r.value)}>
                {r.label}
              </Chip>
            ))}
          </div>
        ) : null}

        {/* results */}
        {!configured ? (
          <Card className="space-y-1">
            <p className="text-sm font-semibold">Google Maps isn't connected</p>
            <p className="text-xs text-muted-foreground">
              Once the Google Maps connection is linked, search, nearby places and travel times go live here — no other
              changes needed.
            </p>
          </Card>
        ) : results.isPending ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <LoaderCircle className="size-5 animate-spin" />
          </div>
        ) : results.isError ? (
          <Card className="space-y-1">
            <p className="text-sm font-semibold">Couldn't load places</p>
            <p className="text-xs text-muted-foreground">{(results.error as Error).message}</p>
          </Card>
        ) : places.length === 0 ? (
          <Card>
            <p className="text-sm text-muted-foreground">
              Nothing {query ? "matched that search" : `within ${kmLabel(radiusM / 1000)}`}. Try a wider radius or a
              different search.
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {query ? `Results for "${query}"` : `${cat.emoji} ${cat.label} near you`}
            </p>
            {places.map(({ p, km }) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  haptic();
                  setActiveId(p.id);
                }}
                className={`tap-flat flex w-full items-start gap-3 rounded-2xl border p-3 text-left ${
                  activeId === p.id ? "border-primary bg-primary-soft" : "border-border bg-card"
                }`}
              >
                <span className="text-lg leading-none">{categoryEmoji(p)}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{p.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">{p.address}</span>
                  <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                      <MapPin className="size-3.5" /> {kmLabel(km)}
                    </span>
                    {p.rating !== null ? (
                      <span className="inline-flex items-center gap-1">
                        <Star className="size-3.5 fill-current" /> {p.rating.toFixed(1)}
                        {p.reviews ? ` (${p.reviews})` : ""}
                      </span>
                    ) : null}
                    {p.priceLevel !== null ? <span>{PRICE_LABEL[p.priceLevel]}</span> : null}
                    {p.openNow !== null ? (
                      <span className={p.openNow ? "font-semibold text-success" : ""}>
                        {p.openNow ? "Open now" : "Closed"}
                      </span>
                    ) : null}
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {active ? <PlaceSheet place={active} from={centre} onClose={() => setActiveId(null)} /> : null}
    </AppShell>
  );
}

function PlaceSheet({
  place,
  from,
  onClose,
}: {
  place: MapsPlace;
  from: { lat: number; lon: number };
  onClose: () => void;
}) {
  const travel = useQuery({
    queryKey: ["maps", "travel", place.id, from.lat, from.lon],
    staleTime: 5 * 60_000,
    queryFn: () =>
      mapsTravel({
        data: { fromLat: from.lat, fromLon: from.lon, toLat: place.lat, toLon: place.lon },
      }),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-ink/40" />
      <div className="relative z-10 w-full max-w-[430px] space-y-3 rounded-t-3xl border border-border bg-card p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-lift">
        <div className="flex items-start gap-3">
          <span className="text-2xl leading-none">{categoryEmoji(place)}</span>
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

        <div className="flex gap-2">
          {travel.isPending ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <LoaderCircle className="size-3.5 animate-spin" /> Working out how to get there
            </div>
          ) : (
            <>
              {travel.data?.walk ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-semibold">
                  <Footprints className="size-3.5" /> {travel.data.walk.minutes} min walk
                </span>
              ) : null}
              {travel.data?.transit ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-semibold">
                  <TrainFront className="size-3.5" /> {travel.data.transit.minutes} min bus
                </span>
              ) : null}
              {travel.data?.drive ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-semibold">
                  🚕 {travel.data.drive.minutes} min
                </span>
              ) : null}
            </>
          )}
        </div>

        {place.hours?.length ? (
          <p className="text-xs text-muted-foreground">{place.hours.join(" · ")}</p>
        ) : null}

        <div className="flex gap-2">
          <a
            href={directionsUrl(place)}
            target="_blank"
            rel="noreferrer"
            className="tap flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
          >
            <Navigation className="size-4" /> Directions
          </a>
          {place.phone ? (
            <a
              href={`tel:${place.phone}`}
              aria-label={`Call ${place.name}`}
              className="tap flex size-12 shrink-0 items-center justify-center rounded-2xl bg-muted"
            >
              <Phone className="size-4" />
            </a>
          ) : null}
          {place.website ? (
            <a
              href={place.website}
              target="_blank"
              rel="noreferrer"
              aria-label={`${place.name} website`}
              className="tap flex size-12 shrink-0 items-center justify-center rounded-2xl bg-muted"
            >
              <ExternalLink className="size-4" />
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
