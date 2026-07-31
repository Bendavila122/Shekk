import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Minus, Plus, Crosshair } from "lucide-react";
import { KIND_META, MAP_HEIGHT, MAP_PLACES, MAP_WIDTH, REGIONS, project } from "@/lib/israel-map";

export type MapPoint = { x: number; y: number };

const MIN_K = 0.4;
const MAX_K = 14;
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
    setView((p) => ({ ...p, x: p.x + dx, y: p.y + dy }));
  };

  const endPointer = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
  };

  const tapped = () => moved.current < 8;

  const toScreen = (mx: number, my: number): MapPoint => ({
    x: mx * view.k + view.x,
    y: my * view.k + view.y,
  });

  const rel = view.k / (fitRef.current.k || 1);
  const showAllLabels = rel > 1.35;

  return (
    <div
      ref={wrap}
      className="relative h-full w-full touch-none overflow-hidden bg-secondary"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endPointer}
      onPointerCancel={endPointer}
    >
      <svg width={size.w} height={size.h} className="block select-none">
        {/* sea */}
        <rect
          width={size.w}
          height={size.h}
          className="fill-secondary"
          onClick={() => {
            if (tapped()) onClear();
          }}
        />

        <g transform={`translate(${view.x} ${view.y}) scale(${view.k})`}>
          {REGIONS.map((r) => {
            const visited = visitedRegions.includes(r.id);
            const active = activeRegion === r.id;
            return (
              <g key={r.id}>
                {r.paths.map((d, i) => (
                  <path
                    key={i}
                    d={d}
                    role={i === 0 ? "button" : undefined}
                    aria-label={i === 0 ? `${r.name}${visited ? " — visited" : ""}` : undefined}
                    onClick={(e) => {
                      if (!tapped()) return;
                      const rect = wrap.current!.getBoundingClientRect();
                      onRegion(r.id, { x: e.clientX - rect.left, y: e.clientY - rect.top });
                    }}
                    className={`cursor-pointer outline-none transition-colors ${
                      visited ? "fill-primary/85" : "fill-card"
                    } ${active ? "stroke-ink" : "stroke-border"}`}
                    strokeWidth={(active ? 2 : 0.8) / view.k}
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
              </g>
            );
          })}
        </g>

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
                  className="pointer-events-none fill-muted-foreground"
                  fontSize={10}
                  fontWeight={700}
                  letterSpacing={0.4}
                >
                  {r.name.toUpperCase()}
                </text>
              );
            })
          : null}

        {/* pins */}
        {MAP_PLACES.map((p) => {
          const [mx, my] = project(p.lon, p.lat);
          const s = toScreen(mx, my);
          if (s.x < -60 || s.y < -40 || s.x > size.w + 60 || s.y > size.h + 40) return null;
          const been = visitedPlaces.includes(p.id);
          const active = activePlace === p.id;
          const label = showAllLabels || ANCHOR_PINS.has(p.id);
          const flip = s.x > size.w * 0.62;
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
              className="cursor-pointer outline-none"
            >
              <circle cx={s.x} cy={s.y} r={14} fill="transparent" />
              {active ? (
                <circle cx={s.x} cy={s.y} r={12} className="fill-primary/25" />
              ) : null}
              <circle
                cx={s.x}
                cy={s.y}
                r={active ? 6.5 : 4.5}
                className={`stroke-ink ${been ? "fill-primary" : "fill-card"}`}
                strokeWidth={1.6}
              />
              {label ? (
                <text
                  x={flip ? s.x - 9 : s.x + 9}
                  y={s.y + 3.4}
                  textAnchor={flip ? "end" : "start"}
                  className={active ? "fill-primary" : "fill-foreground"}
                  fontSize={10.5}
                  fontWeight={650}
                  paintOrder="stroke"
                  stroke="white"
                  strokeWidth={3}
                  strokeOpacity={0.8}
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
