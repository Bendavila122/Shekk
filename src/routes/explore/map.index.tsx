import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Check, RotateCcw, X } from "lucide-react";
import { AppShell, ScreenHeader } from "@/components/AppShell";
import { IsraelMap, type MapPoint } from "@/components/map/IsraelMap";
import {
  CLOSED_AREA,
  KIND_META,
  TERRITORY_NOTE,
  MAP_PLACES,
  REGIONS,
  findMapPlace,
  placesInRegion,
  region as findRegion,
  regionOfPlace,
  placeEmoji,
  territoryOf,
} from "@/lib/israel-map";
import { useWikiInfo } from "@/lib/useWikiInfo";
import { useVisited } from "@/lib/israel-map-prefs";
import { haptic } from "@/lib/foryou-prefs";

export const Route = createFileRoute("/explore/map/")({
  head: () => ({
    meta: [
      { title: "Been There · Map of Israel · Shekk" },
      {
        name: "description",
        content:
          "Zoom around a real map of Israel, fill in the areas you've been to, and tap pins like the Kotel, Masada or the Kinneret for history, photos and things to do.",
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

type Sel =
  | { kind: "region"; id: string; at: MapPoint }
  | { kind: "place"; id: string; at: MapPoint }
  | null;

const CARD_W = 250;

function MapScreen() {
  const navigate = useNavigate();
  const { regions, places, toggleRegion, togglePlace, reset, regionPct } = useVisited();
  const [sel, setSel] = useState<Sel>(null);

  const place = sel?.kind === "place" ? findMapPlace(sel.id) : null;
  const area =
    sel?.kind === "region"
      ? sel.id === CLOSED_AREA.id
        ? CLOSED_AREA
        : findRegion(sel.id)
      : null;
  const closed = area?.id === CLOSED_AREA.id;
  const wiki = useWikiInfo(place ? [place.wiki] : []);
  const photo = place ? (wiki.data[place.wiki]?.image ?? null) : null;
  const areaPlaces = useMemo(() => (area ? placesInRegion(area.id) : []), [area]);

  const pop = sel
    ? {
        left: Math.max(10, Math.min(sel.at.x - CARD_W / 2, 10000)),
        top: Math.max(10, sel.at.y + 18),
      }
    : null;

  return (
    <AppShell>
      <ScreenHeader title="Been There" subtitle="Your map of Israel" />

      <div className="relative h-[calc(100dvh-4rem)] w-full overflow-hidden border-y border-border lg:h-[calc(100vh-13rem)]">
        <IsraelMap
          visitedRegions={regions}
          visitedPlaces={places}
          activePlace={place?.id ?? null}
          activeRegion={area?.id ?? null}
          onRegion={(id, at) => {
            haptic();
            setSel({ kind: "region", id, at });
          }}
          onPlace={(id, at) => {
            haptic();
            setSel({ kind: "place", id, at });
          }}
          onClear={() => setSel(null)}
        />

        {/* analytics, in the corner */}
        <div className="pointer-events-auto absolute left-3 top-3 w-[148px] rounded-2xl border border-border bg-card/95 p-3 shadow-lift backdrop-blur">
          <p className="font-display text-2xl font-bold leading-none">{regionPct}%</p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            of Israel
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${regionPct}%` }} />
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            {regions.length}/{REGIONS.length} areas · {places.length}/{MAP_PLACES.length} pins
          </p>
          <button
            type="button"
            onClick={() => {
              reset();
              setSel(null);
            }}
            className="tap-flat mt-2 flex w-full items-center justify-center gap-1 rounded-full bg-muted px-2 py-1.5 text-[11px] font-semibold"
          >
            <RotateCcw className="size-3" /> Reset
          </button>
        </div>

        {/* info box, floating where you tapped */}
        {sel && pop ? (
          <div
            className="absolute z-20 rounded-2xl border border-border bg-card p-3 shadow-lift"
            style={{
              width: CARD_W,
              left: `min(${pop.left}px, calc(100% - ${CARD_W + 10}px))`,
              top: `min(${pop.top}px, calc(100% - 280px))`,
            }}
          >
            <button
              type="button"
              aria-label="Close"
              onClick={() => setSel(null)}
              className="tap-flat absolute right-2 top-2 rounded-full bg-muted p-1 text-muted-foreground"
            >
              <X className="size-3.5" />
            </button>

            {place ? (
              <>
                <div className="relative mb-2 h-24 w-full overflow-hidden rounded-xl bg-muted">
                  {photo ? (
                    <img
                      src={photo}
                      alt={place.name}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl">
                      {placeEmoji(place)}
                    </div>
                  )}
                </div>
                <p className="pr-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {placeEmoji(place)} {KIND_META[place.kind].label} ·{" "}
                  {regionOfPlace(place)?.name}
                </p>
                <h2 className="mt-0.5 text-base font-semibold leading-tight">{place.name}</h2>
                <p className="mt-1 line-clamp-3 text-xs text-muted-foreground">{place.blurb}</p>
                <button
                  type="button"
                  onClick={() => navigate({ to: "/explore/map/$id", params: { id: place.id } })}
                  className="tap-flat mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-full bg-ink px-2 py-2 text-xs font-semibold text-white"
                >
                  History, photos & getting there <ArrowRight className="size-3.5" />
                </button>
              </>
            ) : area ? (
              <>
                <p className="pr-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {closed ? "Closed area" : "Area"}
                </p>
                <h2 className="mt-0.5 text-base font-semibold leading-tight">{area.name}</h2>
                <p className="mt-1 text-xs text-muted-foreground">{area.hint}</p>
                {closed ? (
                  <p className="mt-2.5 rounded-lg border border-destructive/40 bg-destructive/10 px-2 py-1.5 text-[11px] font-semibold text-destructive">
                    Off limits — nothing to mark here.
                  </p>
                ) : (
                  <>
                    {TERRITORY_NOTE[territoryOf(area.id)] ? (
                      <p className="mt-1.5 rounded-lg bg-muted px-2 py-1 text-[10px] font-semibold text-muted-foreground">
                        {TERRITORY_NOTE[territoryOf(area.id)]}
                      </p>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => {
                        haptic();
                        toggleRegion(area.id);
                      }}
                      className={`tap-flat mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-full px-2 py-2 text-xs font-semibold ${
                        regions.includes(area.id)
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      <Check className="size-3.5" />
                      {regions.includes(area.id) ? "Been here" : "Mark as been"}
                    </button>
                  </>
                )}

                {areaPlaces.length ? (
                  <div className="mt-2 max-h-28 space-y-1 overflow-y-auto">
                    {areaPlaces.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => navigate({ to: "/explore/map/$id", params: { id: p.id } })}
                        className="tap-flat flex w-full items-center gap-2 rounded-xl bg-muted/60 px-2 py-1.5 text-left"
                      >
                        <span className="text-sm">{placeEmoji(p)}</span>
                        <span className="min-w-0 flex-1 truncate text-[11px] font-semibold">{p.name}</span>
                        {places.includes(p.id) ? (
                          <Check className="size-3 shrink-0 text-primary" />
                        ) : null}
                      </button>
                    ))}
                  </div>
                ) : null}
              </>
            ) : null}
          </div>
        ) : null}

        {/* first-run hint */}
        {!sel && regions.length === 0 && places.length === 0 ? (
          <p className="pointer-events-none absolute inset-x-0 bottom-4 mx-auto w-fit rounded-full bg-ink/85 px-3 py-1.5 text-[11px] font-medium text-white">
            Pinch or scroll to zoom · tap an area to fill it in
          </p>
        ) : null}
      </div>
    </AppShell>
  );
}
