import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, MapPin, RotateCcw } from "lucide-react";
import { AppShell, Card, ScreenHeader } from "@/components/AppShell";
import { IsraelMap } from "@/components/map/IsraelMap";
import { KIND_META, MAP_PLACES, REGIONS, region } from "@/lib/israel-map";
import { useVisited } from "@/lib/israel-map-prefs";
import { haptic } from "@/lib/foryou-prefs";

export const Route = createFileRoute("/explore/map/")({
  head: () => ({
    meta: [
      { title: "Been There · Map of Israel · Shekk" },
      {
        name: "description",
        content:
          "Scratch off the parts of Israel you've been to, and tap pins like the Kotel, Masada or the Kinneret for history, photos and things to do.",
      },
      { property: "og:title", content: "Been There · Map of Israel" },
      {
        property: "og:description",
        content: "An interactive map of Israel: mark where you've been and see what's worth seeing next.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MapScreen,
});

function MapScreen() {
  const navigate = useNavigate();
  const { regions, places, toggleRegion, togglePlace, reset, regionPct } = useVisited();
  const [selected, setSelected] = useState<string | null>(null);

  const place = useMemo(() => MAP_PLACES.find((p) => p.id === selected) ?? null, [selected]);

  return (
    <AppShell>
      <ScreenHeader title="Been There" subtitle="Your map of Israel" />

      <div className="space-y-4 px-4 pb-6">
        <Card className="space-y-3">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-3xl font-bold leading-none">{regionPct}%</p>
              <p className="text-xs text-muted-foreground">
                {regions.length} of {REGIONS.length} areas · {places.length} of {MAP_PLACES.length} places
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                reset();
                setSelected(null);
              }}
              className="tap-flat flex items-center gap-1.5 rounded-full bg-muted px-3 py-2 text-xs font-semibold"
            >
              <RotateCcw className="size-3.5" /> Reset
            </button>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${regionPct}%` }} />
          </div>
          <p className="text-xs text-muted-foreground">
            Tap an area to fill it in. Tap a pin to open the place.
          </p>
        </Card>

        <Card className="p-2">
          <IsraelMap
            visitedRegions={regions}
            visitedPlaces={places}
            activePlace={selected}
            onRegion={(id) => {
              haptic();
              toggleRegion(id);
            }}
            onPlace={(id) => {
              haptic();
              setSelected(id);
            }}
          />
        </Card>

        {place ? (
          <Card className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {KIND_META[place.kind].emoji} {KIND_META[place.kind].label} ·{" "}
                  {region(place.region)?.name}
                </p>
                <h2 className="truncate text-lg font-semibold">{place.name}</h2>
                <p className="text-sm text-muted-foreground">{place.blurb}</p>
              </div>
              <button
                type="button"
                aria-label={places.includes(place.id) ? "Mark as not visited" : "Mark as visited"}
                onClick={() => {
                  haptic();
                  togglePlace(place.id);
                }}
                className={`tap-flat flex size-10 shrink-0 items-center justify-center rounded-full ${
                  places.includes(place.id)
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                <Check className="size-5" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => navigate({ to: "/explore/map/$id", params: { id: place.id } })}
              className="tap w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
            >
              History, photos & things to do
            </button>
          </Card>
        ) : null}

        <div>
          <h2 className="mb-2 px-1 text-sm font-semibold">Areas</h2>
          <div className="grid grid-cols-2 gap-2">
            {REGIONS.map((r) => {
              const on = regions.includes(r.id);
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    haptic();
                    toggleRegion(r.id);
                  }}
                  className={`tap-flat rounded-2xl border p-3 text-left ${
                    on ? "border-primary bg-primary/10" : "border-border bg-card"
                  }`}
                >
                  <p className="text-sm font-semibold">{r.name}</p>
                  <p className="text-[11px] text-muted-foreground">{r.hint}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className="mb-2 px-1 text-sm font-semibold">Places to see</h2>
          <div className="space-y-2">
            {MAP_PLACES.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => navigate({ to: "/explore/map/$id", params: { id: p.id } })}
                className="tap-flat flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-lg">
                  {KIND_META[p.kind].emoji}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{p.name}</span>
                  <span className="block truncate text-[11px] text-muted-foreground">{p.blurb}</span>
                </span>
                {places.includes(p.id) ? (
                  <span className="shrink-0 rounded-full bg-primary/10 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
                    Been
                  </span>
                ) : (
                  <MapPin className="size-4 shrink-0 text-muted-foreground" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
