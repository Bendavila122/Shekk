import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Minus, Plus, Crosshair } from "lucide-react";
import {
  KIND_META,
  MAP_HEIGHT,
  MAP_PLACES,
  MAP_WIDTH,
  REGIONS,
  TERRITORY_OUTLINES,
  placeEmoji,
  project,
  territoryOf,
} from "@/lib/israel-map";
import { tileZoom, tilesForRect } from "@/lib/map-tiles";

export type MapPoint = { x: number; y: number };

const MIN_K = 0.4;
/** Deep enough to read individual streets and see the hills in relief. */
const MAX_K = 90;
const PAD = 12;


/** Pins whose labels stay on screen even when zoomed all the way out. */
const ANCHOR_PINS = new Set([
  "kotel",
  "tel-aviv",
  "haifa",
  "tzfat",
  "kinneret",
  "beer-sheva",
  "masada",
  "eilat",
  "dead-sea",
  "mitzpe-ramon",
]);

type View = { k: number; x: number; y: number };

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));


export function IsraelMap({
  visitedRegions,
  visitedPlaces,
  activePlace,
  activeRegion,
  onRegion,
  onPlace,
  onClear,
}: {
  visitedRegions: string[];
  visitedPlaces: string[];
  activePlace?: string | null;
  activeRegion?: string | null;
  onRegion: (id: string, at: MapPoint) => void;
  onPlace: (id: string, at: MapPoint) => void;
  onClear: () => void;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [view, setView] = useState<View>({ k: 1, x: 0, y: 0 });
  const fitRef = useRef<View>({ k: 1, x: 0, y: 0 });
  const viewRef = useRef(view);
  viewRef.current = view;

  /* ------------------------------------------------------------- fit to box */
  useLayoutEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry!.contentRect;
      setSize({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useLayoutEffect(() => {
    if (!size.w || !size.h) return;
    const k = Math.min((size.w - PAD * 2) / MAP_WIDTH, (size.h - PAD * 2) / MAP_HEIGHT);
    const fit = {
      k,
      x: (size.w - MAP_WIDTH * k) / 2,
      y: (size.h - MAP_HEIGHT * k) / 2,
    };
    fitRef.current = fit;
    setView((prev) => (prev.k === 1 && prev.x === 0 && prev.y === 0 ? fit : prev));
  }, [size.w, size.h]);

  const zoomAt = useCallback((factor: number, px: number, py: number) => {
    setView((prev) => {
      const fit = fitRef.current;
      const next = clamp(prev.k * factor, fit.k * MIN_K, fit.k * MAX_K);
      const ratio = next / prev.k;
      return { k: next, x: px - (px - prev.x) * ratio, y: py - (py - prev.y) * ratio };
    });
  }, []);

  /* ------------------------------------------------------------ wheel zoom */
  const zoomRef = useRef(zoomAt);
  zoomRef.current = zoomAt;

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
      const rect = el.getBoundingClientRect();
      zoomRef.current(Math.exp(-dy * 0.0018), e.clientX - rect.left, e.clientY - rect.top);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  /* -------------------------------------------------- drag pan & pinch zoom */
  const pointers = useRef(new Map<number, MapPoint>());
  const pinch = useRef<{ dist: number } | null>(null);
  const moved = useRef(0);
  /** Pan deltas are batched into one state update per frame. */
  const panPending = useRef({ x: 0, y: 0 });
  const panFrame = useRef<number | null>(null);
  useEffect(() => () => {
    if (panFrame.current !== null) cancelAnimationFrame(panFrame.current);
  }, []);

  const local = (e: React.PointerEvent) => {
    const rect = wrap.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    pointers.current.set(e.pointerId, local(e));
    moved.current = 0;
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = { dist: Math.hypot(a!.x - b!.x, a!.y - b!.y) };
    }
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    const now = local(e);
    pointers.current.set(e.pointerId, now);
    const dx = now.x - prev.x;
    const dy = now.y - prev.y;
    moved.current += Math.hypot(dx, dy);

    if (pointers.current.size >= 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a!.x - b!.x, a!.y - b!.y);
      if (pinch.current.dist > 0) {
        zoomAt(dist / pinch.current.dist, (a!.x + b!.x) / 2, (a!.y + b!.y) / 2);
      }
      pinch.current = { dist };
      return;
    }
    panPending.current.x += dx;
    panPending.current.y += dy;
    if (panFrame.current === null) {
      panFrame.current = requestAnimationFrame(() => {
        panFrame.current = null;
        const { x, y } = panPending.current;
        panPending.current = { x: 0, y: 0 };
        setView((p) => ({ ...p, x: p.x + x, y: p.y + y }));
      });
    }
  };

  const endPointer = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
  };


  const tapped = () => moved.current < 8;

  const onRegionRef = useRef(onRegion);
  onRegionRef.current = onRegion;

  /** Stable handler so the heavy land layer never re-renders while panning. */
  const onRegionTap = useCallback((id: string, e: React.MouseEvent) => {
    if (moved.current >= 8) return;
    e.stopPropagation();
    const rect = wrap.current!.getBoundingClientRect();
    onRegionRef.current(id, { x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);


  const toScreen = (mx: number, my: number): MapPoint => ({
    x: mx * view.k + view.x,
    y: my * view.k + view.y,
  });

  const rel = view.k / (fitRef.current.k || 1);
  const showAllLabels = rel > 1.35;

  /* Real aerial imagery fades in as you zoom past the stylised overview, so the
     hills, wadis and dunes show up in actual relief. Quantised so the heavy land
     layer only re-renders a handful of times across the whole zoom range. */
  const sat = Math.round(clamp((rel - 1.15) / 1.15, 0, 1) * 4) / 4;
  const onImagery = sat >= 0.5;

  const tiles = useMemo(() => {
    if (!sat || !size.w || !size.h) return [];
    const z = tileZoom(view.k);
    const rect = {
      x0: (0 - view.x) / view.k,
      y0: (0 - view.y) / view.k,
      x1: (size.w - view.x) / view.k,
      y1: (size.h - view.y) / view.k,
    };
    return tilesForRect(rect, z);
  }, [sat, size.w, size.h, view.k, view.x, view.y]);



  /** Pins in map space, ordered so the headline places win any collision. */
  const projected = useMemo(
    () =>
      MAP_PLACES.map((p) => {
        const [mx, my] = project(p.lon, p.lat);
        return { place: p, mx, my, anchor: ANCHOR_PINS.has(p.id) };
      }).sort((a, b) => Number(b.anchor) - Number(a.anchor)),
    [],
  );

  /* Spread the pins out: at low zoom, drop anything that would sit on top of a
     pin already drawn, so the map breathes instead of turning into a blob. */
  const gap = rel > 3.2 ? 0 : rel > 2 ? 18 : rel > 1.3 ? 28 : 36;
  const drawn: MapPoint[] = [];
  const pins = projected
    .map((p) => ({ ...p, s: toScreen(p.mx, p.my) }))
    .filter(({ s, place }) => {
      if (s.x < -60 || s.y < -40 || s.x > size.w + 60 || s.y > size.h + 40) return false;
      if (activePlace === place.id || gap === 0) {
        drawn.push(s);
        return true;
      }
      if (drawn.some((d) => Math.hypot(d.x - s.x, d.y - s.y) < gap)) return false;
      drawn.push(s);
      return true;
    });

  /** Label boxes already placed, so no two names ever collide. */
  const boxes: [number, number, number, number][] = [];
  const hits = (b: [number, number, number, number]) =>
    boxes.some((o) => b[0] < o[2] && o[0] < b[2] && b[1] < o[3] && o[1] < b[3]) ||
    pins.some(({ s }) => s.x - 8 < b[2] && b[0] < s.x + 8 && s.y - 8 < b[3] && b[1] < s.y + 8);

  return (
    <div
      ref={wrap}
      className="relative h-full w-full touch-none overflow-hidden"
      style={{ background: "var(--map-sea)" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endPointer}
      onPointerCancel={endPointer}
      onClick={() => {
        if (tapped()) onClear();
      }}
    >
      {/* Aerial imagery, in the same map space and moved by the same transform. */}
      {tiles.length ? (
        <div
          className="pointer-events-none absolute left-0 top-0"
          style={{
            width: MAP_WIDTH,
            height: MAP_HEIGHT,
            transformOrigin: "0 0",
            transform: `translate3d(${view.x}px, ${view.y}px, 0) scale(${view.k})`,
            opacity: sat,
            willChange: "transform, opacity",
            transition: "opacity 200ms linear",
          }}
        >
          {tiles.map((t) => (
            <img
              key={t.key}
              src={t.url}
              alt=""
              draggable={false}
              loading="lazy"
              decoding="async"
              style={{
                position: "absolute",
                left: t.left,
                top: t.top,
                width: t.width,
                height: t.height,
              }}
            />
          ))}
        </div>
      ) : null}

      {/* Land gets its own SVG, moved with a CSS transform: panning then stays on
          the compositor instead of re-rasterising thousands of path segments. */}

      <svg
        width={MAP_WIDTH}
        height={MAP_HEIGHT}
        className="absolute left-0 top-0 select-none"
        style={{
          transformOrigin: "0 0",
          transform: `translate3d(${view.x}px, ${view.y}px, 0) scale(${view.k})`,
          willChange: "transform",
        }}
      >
        <defs>
          {/* the country's terrain, north to south */}
          <linearGradient
            id="terrain"
            gradientUnits="userSpaceOnUse"
            x1={0}
            y1={0}
            x2={MAP_WIDTH * 0.35}
            y2={MAP_HEIGHT}
          >
            <stop offset="0" style={{ stopColor: "var(--map-green)" }} />
            <stop offset="0.16" style={{ stopColor: "var(--map-hills)" }} />
            <stop offset="0.3" style={{ stopColor: "var(--map-plain)" }} />
            <stop offset="0.42" style={{ stopColor: "var(--map-steppe)" }} />
            <stop offset="0.55" style={{ stopColor: "var(--map-sand)" }} />
            <stop offset="0.78" style={{ stopColor: "var(--map-desert)" }} />
            <stop offset="1" style={{ stopColor: "var(--map-arava)" }} />
          </linearGradient>
          {/* the east always runs drier than the coast */}
          <linearGradient
            id="terrain-dry"
            gradientUnits="userSpaceOnUse"
            x1={MAP_WIDTH * 0.25}
            y1={0}
            x2={MAP_WIDTH}
            y2={0}
          >
            <stop offset="0" style={{ stopColor: "var(--map-dry)", stopOpacity: 0 }} />
            <stop offset="1" style={{ stopColor: "var(--map-dry)", stopOpacity: 0.6 }} />
          </linearGradient>
        </defs>

        <LandLayer
          visitedRegions={visitedRegions}
          activeRegion={activeRegion ?? null}
          onRegionTap={onRegionTap}
          k={view.k}
          sat={sat}
        />

      </svg>

      {/* names and pins, in screen space */}
      <svg
        width={size.w}
        height={size.h}
        className="pointer-events-none absolute left-0 top-0 block select-none"
      >




        {/* area names, in screen space so they stay legible at any zoom */}
        {rel > 1.1
          ? REGIONS.map((r) => {
              const p = toScreen(r.label[0], r.label[1]);
              if (p.x < -40 || p.y < -20 || p.x > size.w + 40 || p.y > size.h + 20) return null;
              return (
                <text
                  key={`l-${r.id}`}
                  x={p.x}
                  y={p.y}
                  textAnchor="middle"
                  className="pointer-events-none fill-ink/55"
                  fontSize={9.5}
                  fontWeight={700}
                  letterSpacing={0.5}
                >
                  {r.name.toUpperCase()}
                </text>
              );
            })
          : null}

        {/* territory captions */}
        {rel > 0.9
          ? TERRITORY_OUTLINES.map((t) => {
              const box = t.id === "gaza" ? toScreen(30, 430) : toScreen(210, 250);
              if (box.x < -60 || box.x > size.w + 60) return null;
              return (
                <text
                  key={`t-${t.id}`}
                  x={box.x}
                  y={box.y}
                  textAnchor="middle"
                  className="pointer-events-none fill-ink/45"
                  fontSize={8.5}
                  fontWeight={700}
                  letterSpacing={0.8}
                >
                  {t.label.toUpperCase()}
                </text>
              );
            })
          : null}

        {/* pins */}
        {pins.map(({ place: p, s }) => {
          const been = visitedPlaces.includes(p.id);
          const active = activePlace === p.id;
          const flip = s.x > size.w * 0.62;
          const wantLabel = showAllLabels || ANCHOR_PINS.has(p.id) || active;
          const w = p.name.length * 5.9 + 6;
          const box: [number, number, number, number] = flip
            ? [s.x - 13 - w, s.y - 7, s.x - 11, s.y + 7]
            : [s.x + 11, s.y - 7, s.x + 13 + w, s.y + 7];
          const label = wantLabel && !hits(box);
          if (label) boxes.push(box);
          return (
            <g
              key={p.id}
              role="button"
              tabIndex={0}
              aria-label={`${p.name} — ${KIND_META[p.kind].label}`}
              onClick={(e) => {
                if (!tapped()) return;
                e.stopPropagation();
                const rect = wrap.current!.getBoundingClientRect();
                onPlace(p.id, { x: e.clientX - rect.left, y: e.clientY - rect.top });
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onPlace(p.id, s);
                }
              }}
              className="pointer-events-auto cursor-pointer outline-none"
            >
              <circle cx={s.x} cy={s.y} r={16} fill="transparent" />
              {active ? <circle cx={s.x} cy={s.y} r={16} className="fill-primary/20" /> : null}
              <circle
                cx={s.x}
                cy={s.y}
                r={active ? 12 : 9.5}
                className={`${been ? "fill-primary stroke-primary" : "fill-card stroke-ink/25"}`}
                strokeWidth={1.2}
              />
              <text
                x={s.x}
                y={s.y}
                textAnchor="middle"
                dominantBaseline="central"
                className="pointer-events-none"
                fontSize={active ? 13 : 10.5}
              >
                {placeEmoji(p)}
              </text>
              {label ? (
                <text
                  x={flip ? s.x - 13 : s.x + 13}
                  y={s.y + 3.4}
                  textAnchor={flip ? "end" : "start"}
                  className={active ? "fill-primary" : "fill-foreground"}
                  fontSize={10.5}
                  fontWeight={650}
                  paintOrder="stroke"
                  stroke="var(--card)"
                  strokeWidth={3.5}
                  strokeOpacity={0.85}
                >
                  {p.name}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>


      {/* zoom controls */}
      <div className="absolute bottom-4 right-3 flex flex-col gap-2">
        <button
          type="button"
          aria-label="Zoom in"
          onClick={() => zoomAt(1.6, size.w / 2, size.h / 2)}
          className="tap flex size-10 items-center justify-center rounded-full border border-border bg-card shadow-lift"
        >
          <Plus className="size-4" />
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          onClick={() => zoomAt(1 / 1.6, size.w / 2, size.h / 2)}
          className="tap flex size-10 items-center justify-center rounded-full border border-border bg-card shadow-lift"
        >
          <Minus className="size-4" />
        </button>
        <button
          type="button"
          aria-label="Fit map"
          onClick={() => setView(fitRef.current)}
          className="tap flex size-10 items-center justify-center rounded-full border border-border bg-card shadow-lift"
        >
          <Crosshair className="size-4" />
        </button>
      </div>
    </div>
  );
}

/**
 * Land, terrain wash and disputed borders. Memoised: the geometry is thousands of
 * path segments, so it must never re-render while panning or zooming — only the
 * parent <g transform> changes, which the browser handles on the compositor.
 */
const LandLayer = memo(function LandLayer({
  visitedRegions,
  activeRegion,
  onRegionTap,
  k,
  sat,
}: {
  visitedRegions: string[];
  activeRegion: string | null;
  onRegionTap: (id: string, e: React.MouseEvent) => void;
  k: number;
  /** 0 = stylised terrain only, 1 = real imagery showing through. */
  sat: number;
}) {
  const visited = useMemo(() => new Set(visitedRegions), [visitedRegions]);
  /* The SVG is scaled with CSS, so strokes are pre-divided to keep hairlines. */
  const hair = 0.8 / k;
  const bold = 2.2 / k;
  const dash = `${5 / k} ${4 / k}`;
  /* Over imagery the wash thins right out so the real relief reads through. */
  const landFill = 1 - sat * 0.92;
  const visitedFill = 1 - sat * 0.55;
  return (
    <>
      {/* land, painted with the terrain gradient */}
      <g>
        {REGIONS.map((r) => {
          const been = visited.has(r.id);
          const active = activeRegion === r.id;
          const disputed = territoryOf(r.id) !== "israel";
          return r.paths.map((d, i) => (
            <path
              key={`${r.id}-${i}`}
              d={d}
              role={i === 0 ? "button" : undefined}
              aria-label={i === 0 ? `${r.name}${been ? " — visited" : ""}` : undefined}
              onClick={(e) => onRegionTap(r.id, e)}
              fill={been ? undefined : "url(#terrain)"}
              fillOpacity={been ? visitedFill : landFill}
              className={`cursor-pointer outline-none ${been ? "fill-primary" : ""} ${
                active ? "stroke-ink" : disputed ? "stroke-ink/35" : "stroke-ink/15"
              }`}
              style={
                sat >= 0.5 && !active
                  ? { stroke: "rgba(255,255,255,0.7)" }
                  : undefined
              }
              strokeWidth={active ? bold : hair}
              strokeDasharray={disputed && !active ? `${3 / k} ${2.5 / k}` : undefined}
            />

          ));
        })}
      </g>


      {/* the east always runs drier than the coast */}
      <g className="pointer-events-none" opacity={1 - sat}>
        {REGIONS.filter((r) => !visited.has(r.id)).map((r) =>
          r.paths.map((d, i) => (
            <path key={`dry-${r.id}-${i}`} d={d} fill="url(#terrain-dry)" opacity={0.5} />
          )),
        )}
      </g>


      {/* disputed territory borders, dotted — white once they sit over imagery */}
      <g
        className="pointer-events-none"
        fill="none"
        style={{ stroke: sat >= 0.5 ? "#ffffff" : "var(--ink)" }}
      >
        {TERRITORY_OUTLINES.map((t) => (
          <path
            key={t.id}
            d={t.d}
            strokeWidth={bold}
            strokeDasharray={dash}
            strokeLinejoin="round"
            opacity={0.85}
          />
        ))}
        {REGIONS.filter((r) => r.id === "golan").map((r) =>
          r.paths.map((d, i) => (
            <path
              key={`golan-${i}`}
              d={d}
              strokeWidth={bold}
              strokeDasharray={dash}
              strokeLinejoin="round"
              opacity={0.8}
            />
          )),
        )}
      </g>


    </>
  );
});
