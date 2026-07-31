import { KIND_META, MAP_HEIGHT, MAP_PLACES, MAP_WIDTH, OUTLINE, REGIONS, project, ringToPath } from "@/lib/israel-map";

export function IsraelMap({
  visitedRegions,
  visitedPlaces,
  activePlace,
  onRegion,
  onPlace,
}: {
  visitedRegions: string[];
  visitedPlaces: string[];
  activePlace?: string | null;
  onRegion: (id: string) => void;
  onPlace: (id: string) => void;
}) {
  return (
    <svg
      viewBox={`-8 -8 ${MAP_WIDTH + 16} ${MAP_HEIGHT + 16}`}
      className="h-auto w-full touch-manipulation select-none"
      role="group"
      aria-label="Interactive map of Israel"
    >
      <defs>
        <linearGradient id="visitedFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.85" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.55" />
        </linearGradient>
      </defs>

      {REGIONS.map((r) => {
        const visited = visitedRegions.includes(r.id);
        return (
          <path
            key={r.id}
            d={ringToPath(r.ring)}
            role="button"
            tabIndex={0}
            aria-label={`${r.name}${visited ? " — visited" : ""}`}
            onClick={() => onRegion(r.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onRegion(r.id);
              }
            }}
            className="cursor-pointer outline-none transition-[fill,opacity] duration-200"
            fill={visited ? "url(#visitedFill)" : "hsl(var(--muted))"}
            stroke="hsl(var(--card))"
            strokeWidth={1.4}
          />
        );
      })}

      <path
        d={ringToPath(OUTLINE)}
        fill="none"
        stroke="hsl(var(--foreground))"
        strokeOpacity={0.35}
        strokeWidth={1.6}
        pointerEvents="none"
      />

      {MAP_PLACES.map((p) => {
        const [x, y] = project(p.lon, p.lat);
        const been = visitedPlaces.includes(p.id);
        const active = activePlace === p.id;
        return (
          <g
            key={p.id}
            role="button"
            tabIndex={0}
            aria-label={`${p.name} — ${KIND_META[p.kind].label}`}
            onClick={() => onPlace(p.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onPlace(p.id);
              }
            }}
            className="cursor-pointer outline-none"
          >
            <circle cx={x} cy={y} r={11} fill="transparent" />
            <circle
              cx={x}
              cy={y}
              r={active ? 6 : 4.2}
              fill={been ? "hsl(var(--success, var(--primary)))" : "hsl(var(--card))"}
              stroke="hsl(var(--foreground))"
              strokeWidth={1.6}
            />
            <text
              x={x + 7}
              y={y + 3}
              className="pointer-events-none"
              fontSize={9}
              fontWeight={600}
              fill="hsl(var(--foreground))"
            >
              {p.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
