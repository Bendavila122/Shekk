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
      viewBox={`-10 -10 ${MAP_WIDTH + 110} ${MAP_HEIGHT + 20}`}
      className="h-auto w-full touch-manipulation select-none"
      role="group"
      aria-label="Interactive map of Israel"
    >
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
            className={`cursor-pointer stroke-card outline-none transition-all duration-200 ${
              visited ? "fill-primary opacity-90" : "fill-muted"
            }`}
            strokeWidth={1.4}
          />
        );
      })}

      <path
        d={ringToPath(OUTLINE)}
        className="fill-none stroke-foreground/40"
        strokeWidth={1.6}
        pointerEvents="none"
      />

      {MAP_PLACES.map((p) => {
        const [x, y] = project(p.lon, p.lat);
        const been = visitedPlaces.includes(p.id);
        const active = activePlace === p.id;
        const flip = x > MAP_WIDTH * 0.62;
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
            {/* Generous transparent hit area over the dot and its label. */}
            <rect
              x={flip ? x - 10 - p.name.length * 5.2 : x - 10}
              y={y - 9}
              width={p.name.length * 5.2 + 20}
              height={18}
              fill="transparent"
            />

            <circle
              cx={x}
              cy={y}
              r={active ? 6 : 4}
              className={`stroke-foreground ${been ? "fill-primary" : "fill-card"}`}
              strokeWidth={1.5}
            />
            <text
              x={flip ? x - 8 : x + 8}
              y={y + 3.2}
              textAnchor={flip ? "end" : "start"}
              className={active ? "fill-primary" : "fill-foreground"}

              fontSize={9}
              fontWeight={600}
              paintOrder="stroke"
              stroke="white"
              strokeWidth={2.6}
              strokeOpacity={0.75}
            >
              {p.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
