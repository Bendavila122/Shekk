import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bookmark,
  BookmarkCheck,
  Columns3,
  Filter,
  LoaderCircle,
  MapPin,
  Navigation,
  RefreshCw,
  Search,
  Star,
  X,
} from "lucide-react";
import { AppShell, Card, ScreenHeader } from "@/components/AppShell";
import { LOCATION_CITIES, useLocation } from "@/lib/location";
import {
  ACTIVITY_TYPES,
  DEFAULT_FILTERS,
  FACILITIES,
  STAY_OPTIONS,
  countActiveFilters,
  distanceLabel,
  effectiveMonthly,
  filterVenues,
  shekels,
  stayOption,
  type FitnessFilters,
  type FitnessVenue,
} from "@/lib/fitness";
import { useFitnessShortlist, useFitnessVenues, useVenuesByIds } from "@/lib/useFitness";
import { useOnboardedGate } from "@/lib/useOnboardedGate";
import { haptic } from "@/lib/foryou-prefs";

export const Route = createFileRoute("/explore/fitness/")({
  head: () => ({
    meta: [
      { title: "Fitness · Shekk" },
      {
        name: "description",
        content:
          "Find gyms, classes, pools, studios and courts near you in Israel — with real prices, contract lengths and short-stay options for your year here.",
      },
      { property: "og:title", content: "Fitness · Shekk" },
      {
        property: "og:description",
        content: "Gyms, pools, studios and courts near you, with prices that suit how long you're staying.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Fitness,
});

const RADII = [
  { label: "1 km", value: 1000 },
  { label: "3 km", value: 3000 },
  { label: "5 km", value: 5000 },
  { label: "15 km", value: 15000 },
];

const PRICE_STEPS = [100, 150, 200, 250, 300, 400];

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
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function VenueRow({
  venue,
  stayMonths,
  saved,
  comparing,
  onSave,
  onCompare,
}: {
  venue: FitnessVenue;
  stayMonths: number;
  saved: boolean;
  comparing: boolean;
  onSave: () => void;
  onCompare: () => void;
}) {
  const monthly = effectiveMonthly(venue.extras, stayMonths);
  return (
    <Card className="space-y-3">
      <div className="flex items-start gap-3">
        <Link
          to="/explore/fitness/$id"
          params={{ id: venue.id }}
          className="tap min-w-0 flex-1"
        >
          <p className="truncate font-display text-base font-bold">{venue.name}</p>
          <p className="truncate text-xs text-muted-foreground">{venue.address}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {venue.rating !== null && (
              <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                <Star className="size-3.5 fill-current" />
                {venue.rating.toFixed(1)}
                {venue.reviews ? <span className="font-normal text-muted-foreground">({venue.reviews})</span> : null}
              </span>
            )}
            {venue.distanceKm !== undefined && <span>{distanceLabel(venue.distanceKm)} away</span>}
            {venue.openNow !== null && (
              <span className={venue.openNow ? "font-semibold text-success" : ""}>
                {venue.openNow ? "Open now" : "Closed"}
              </span>
            )}
          </div>
        </Link>
        <button
          type="button"
          aria-label={saved ? `Remove ${venue.name} from saved` : `Save ${venue.name}`}
          onClick={() => {
            haptic();
            onSave();
          }}
          className="tap shrink-0 rounded-full bg-muted p-2 text-foreground"
        >
          {saved ? <BookmarkCheck className="size-4 text-primary" /> : <Bookmark className="size-4" />}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {venue.extras.chain && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
            {venue.extras.chain}
          </span>
        )}
        {monthly !== null && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold">
            ~{shekels(monthly)}/mo
          </span>
        )}
        {venue.extras.dayPassIls !== undefined && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-[11px]">
            Day pass {shekels(venue.extras.dayPassIls)}
          </span>
        )}
        {venue.extras.minContractMonths !== undefined && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-[11px]">
            {venue.extras.minContractMonths <= 1 ? "Rolling monthly" : `${venue.extras.minContractMonths}-month min`}
          </span>
        )}
        {venue.extras.offer && (
          <span className="rounded-full bg-notice-soft px-2 py-0.5 text-[11px] font-semibold text-notice-foreground">
            Shekk offer
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={() => {
          haptic();
          onCompare();
        }}
        className={`tap w-full rounded-xl border px-3 py-2 text-xs font-semibold ${
          comparing ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
        }`}
      >
        {comparing ? "In compare" : "Add to compare"}
      </button>
    </Card>
  );
}

function CompareTable({ ids, onClose }: { ids: string[]; onClose: () => void }) {
  const { venues, loading } = useVenuesByIds(ids);
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <p className="font-display text-lg font-bold">Compare</p>
        <button type="button" aria-label="Close compare" onClick={onClose} className="tap rounded-full bg-muted p-2">
          <X className="size-5" />
        </button>
      </header>
      <div className="flex-1 overflow-auto p-4">
        {loading && <p className="text-sm text-muted-foreground">Loading your shortlist…</p>}
        <div className="flex gap-3">
          {venues.map((v) => (
            <div key={v.id} className="w-52 shrink-0 space-y-2 rounded-2xl border border-border bg-card p-3">
              <p className="font-display text-sm font-bold leading-tight">{v.name}</p>
              <p className="text-[11px] text-muted-foreground">{v.address}</p>
              <dl className="space-y-1.5 text-xs">
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Rating</dt>
                  <dd className="font-semibold">{v.rating !== null ? v.rating.toFixed(1) : "—"}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Distance</dt>
                  <dd className="font-semibold">{distanceLabel(v.distanceKm) || "—"}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Monthly</dt>
                  <dd className="font-semibold">
                    {v.extras.monthlyIls !== undefined ? `~${shekels(v.extras.monthlyIls)}` : "Ask them"}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Day pass</dt>
                  <dd className="font-semibold">
                    {v.extras.dayPassIls !== undefined ? shekels(v.extras.dayPassIls) : "—"}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Contract</dt>
                  <dd className="font-semibold">
                    {v.extras.minContractMonths !== undefined
                      ? v.extras.minContractMonths <= 1
                        ? "Rolling"
                        : `${v.extras.minContractMonths} mo`
                      : "Ask them"}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Short stay</dt>
                  <dd className="font-semibold">{v.extras.shortStay ? "Yes" : "Ask them"}</dd>
                </div>
              </dl>
              <div className="flex flex-wrap gap-1">
                {(v.extras.facilities ?? []).map((f) => (
                  <span key={f} className="rounded-full bg-muted px-2 py-0.5 text-[10px]">
                    {FACILITIES.find((x) => x.id === f)?.label ?? f}
                  </span>
                ))}
              </div>
              <Link
                to="/explore/fitness/$id"
                params={{ id: v.id }}
                onClick={onClose}
                className="tap block rounded-xl bg-primary px-3 py-2 text-center text-xs font-semibold text-primary-foreground"
              >
                Open
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Fitness() {
  const ready = useOnboardedGate();
  const { place, status, loading: locating, detect, setCity } = useLocation();
  const [query, setQuery] = useState("");
  const [radiusM, setRadiusM] = useState(5000);
  const [filters, setFilters] = useState<FitnessFilters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [tab, setTab] = useState<"discover" | "saved">("discover");

  const { venues, loading, error, refetch, mapsReady } = useFitnessVenues({
    activity: filters.activity,
    query,
    radiusM,
  });
  const { saved, savedIds, compare, toggleSaved, toggleCompare, clearCompare } = useFitnessShortlist();
  const savedVenues = useVenuesByIds(tab === "saved" ? saved.map((s) => s.id) : []);

  const stayMonths = stayOption(filters.stay).months;
  const shown = useMemo(() => filterVenues(venues, filters), [venues, filters]);
  const activeCount = countActiveFilters(filters);

  const set = <K extends keyof FitnessFilters>(key: K, value: FitnessFilters[K]) =>
    setFilters((f) => ({ ...f, [key]: value }));

  if (!ready)
    return (
      <AppShell>
        <div className="p-6 text-sm text-muted-foreground">Loading…</div>
      </AppShell>
    );

  return (
    <AppShell>
      <ScreenHeader title="Fitness" subtitle="Gyms, classes, pools & courts" />

      <div className="space-y-4 px-4 py-4">
        {/* location + search */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <MapPin className="size-4 shrink-0 text-muted-foreground" />
            <span className="font-semibold">{place ? place.area ?? place.city : "No location yet"}</span>
            <button type="button" onClick={detect} className="tap inline-flex items-center gap-1 text-primary">
              {locating ? <LoaderCircle className="size-3.5 animate-spin" /> : <Navigation className="size-3.5" />}
              Use my location
            </button>
            <select
              value={place?.city ?? ""}
              onChange={(e) => e.target.value && setCity(e.target.value)}
              className="ml-auto rounded-full border border-border bg-card px-2 py-1 text-xs"
              aria-label="Pick a city"
            >
              <option value="">Pick a city</option>
              {LOCATION_CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-3 text-sm">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search gym, pool, krav maga, a street or city…"
              className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
            />
            {query && (
              <button type="button" aria-label="Clear search" onClick={() => setQuery("")} className="tap">
                <X className="size-4 text-muted-foreground" />
              </button>
            )}
          </label>
        </div>

        {/* activity chips */}
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          <Chip active={filters.activity === "all"} onClick={() => set("activity", "all")}>
            All
          </Chip>
          {ACTIVITY_TYPES.map((a) => (
            <Chip key={a.id} active={filters.activity === a.id} onClick={() => set("activity", a.id)}>
              {a.emoji} {a.label}
            </Chip>
          ))}
        </div>

        {/* tabs + filter toggle */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-full bg-muted p-1 text-xs font-semibold">
            {(["discover", "saved"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`tap rounded-full px-3 py-1.5 capitalize ${tab === t ? "bg-card shadow-card" : "text-muted-foreground"}`}
              >
                {t === "saved" ? `Saved${saved.length ? ` (${saved.length})` : ""}` : "Discover"}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className={`tap ml-auto inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${
              activeCount ? "border-primary text-primary" : "border-border text-foreground"
            }`}
          >
            <Filter className="size-3.5" />
            Filters{activeCount ? ` · ${activeCount}` : ""}
          </button>
          <button
            type="button"
            aria-label="Refresh results"
            onClick={() => void refetch()}
            className="tap rounded-full border border-border p-1.5"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {showFilters && (
          <Card className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">How long are you here?</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {STAY_OPTIONS.map((s) => (
                  <Chip key={s.id} active={filters.stay === s.id} onClick={() => set("stay", s.id)}>
                    {s.label}
                  </Chip>
                ))}
              </div>
              <p className="mt-1.5 text-[11px] text-muted-foreground">{stayOption(filters.stay).hint}</p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Monthly budget</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Chip active={filters.maxPriceIls === null} onClick={() => set("maxPriceIls", null)}>
                  Any
                </Chip>
                {PRICE_STEPS.map((p) => (
                  <Chip key={p} active={filters.maxPriceIls === p} onClick={() => set("maxPriceIls", p)}>
                    ≤ {shekels(p)}
                  </Chip>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Distance</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Chip active={filters.maxDistanceKm === null} onClick={() => set("maxDistanceKm", null)}>
                  Any
                </Chip>
                {[1, 2, 5, 10].map((km) => (
                  <Chip key={km} active={filters.maxDistanceKm === km} onClick={() => set("maxDistanceKm", km)}>
                    Within {km} km
                  </Chip>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Facilities</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {FACILITIES.map((f) => (
                  <Chip
                    key={f.id}
                    active={filters.facilities.includes(f.id)}
                    onClick={() =>
                      set(
                        "facilities",
                        filters.facilities.includes(f.id)
                          ? filters.facilities.filter((x) => x !== f.id)
                          : [...filters.facilities, f.id],
                      )
                    }
                  >
                    {f.emoji} {f.label}
                  </Chip>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Chip active={filters.openNow} onClick={() => set("openNow", !filters.openNow)}>
                Open now
              </Chip>
              <Chip active={filters.partnerOnly} onClick={() => set("partnerOnly", !filters.partnerOnly)}>
                Shekk offers only
              </Chip>
              <Chip active={false} onClick={() => setFilters(DEFAULT_FILTERS)}>
                Reset
              </Chip>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Search radius</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {RADII.map((r) => (
                  <Chip key={r.value} active={radiusM === r.value} onClick={() => setRadiusM(r.value)}>
                    {r.label}
                  </Chip>
                ))}
              </div>
            </div>
          </Card>
        )}

        {mapsReady === false && (
          <Card className="space-y-1">
            <p className="font-display text-base font-bold">Fitness search isn't switched on yet</p>
            <p className="text-sm text-muted-foreground">
              Venue data comes from Google Maps. Once the Google Maps connection is linked to Shekk, nearby gyms,
              pools and studios appear here automatically.
            </p>
          </Card>
        )}

        {tab === "discover" ? (
          <>
            {error && (
              <Card className="text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">Couldn't load venues</p>
                <p className="mt-1">{error}</p>
              </Card>
            )}

            {!place && !query && mapsReady !== false && (
              <Card className="text-sm text-muted-foreground">
                Share your location or pick a city above and Shekk will list what's around you — or just search a
                place name.
              </Card>
            )}

            {loading && shown.length === 0 && (
              <Card className="flex items-center gap-2 text-sm text-muted-foreground">
                <LoaderCircle className="size-4 animate-spin" /> Looking for places near you…
              </Card>
            )}

            {!loading && shown.length === 0 && (place || query) && mapsReady && !error && (
              <Card className="text-sm text-muted-foreground">
                Nothing matched. Try a wider radius, fewer filters, or search a city.
              </Card>
            )}

            <div className="space-y-3">
              {shown.map((v) => (
                <VenueRow
                  key={v.id}
                  venue={v}
                  stayMonths={stayMonths}
                  saved={savedIds.has(v.id)}
                  comparing={compare.includes(v.id)}
                  onSave={() => toggleSaved(v)}
                  onCompare={() => toggleCompare(v.id)}
                />
              ))}
            </div>
          </>
        ) : (
          <>
            {saved.length === 0 && (
              <Card className="text-sm text-muted-foreground">
                Nothing saved yet. Tap the bookmark on a place and it lands here so you can compare before you sign
                anything.
              </Card>
            )}
            {savedVenues.loading && saved.length > 0 && (
              <Card className="flex items-center gap-2 text-sm text-muted-foreground">
                <LoaderCircle className="size-4 animate-spin" /> Opening your shortlist…
              </Card>
            )}
            <div className="space-y-3">
              {savedVenues.venues.map((v) => (
                <VenueRow
                  key={v.id}
                  venue={v}
                  stayMonths={stayMonths}
                  saved
                  comparing={compare.includes(v.id)}
                  onSave={() => toggleSaved(v)}
                  onCompare={() => toggleCompare(v.id)}
                />
              ))}
            </div>
          </>
        )}

        <p className="pb-4 text-[11px] leading-relaxed text-muted-foreground">
          Prices are typical list prices students report, shown to help you compare — always confirm at the desk.
          Venue details, ratings and travel times come from Google Maps.
        </p>
      </div>

      {compare.length > 0 && (
        <div className="fixed bottom-[72px] left-1/2 z-40 flex w-[calc(100%-2rem)] max-w-[398px] -translate-x-1/2 items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2 shadow-card">
          <Columns3 className="size-4 text-primary" />
          <span className="text-xs font-semibold">{compare.length} to compare</span>
          <button type="button" onClick={clearCompare} className="tap ml-auto text-xs text-muted-foreground">
            Clear
          </button>
          <button
            type="button"
            onClick={() => setShowCompare(true)}
            className="tap rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
          >
            Compare
          </button>
        </div>
      )}

      {showCompare && <CompareTable ids={compare} onClose={() => setShowCompare(false)} />}
    </AppShell>
  );
}
