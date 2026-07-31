/**
 * SkyScene — an illustrated, always-moving weather backdrop for the Today tile.
 * Pure CSS motion (no video files): drifting clouds, a breathing sun, falling
 * rain, twinkling stars, hamsin dust. Kind is derived from live conditions.
 */
export type SkyKind = "clear-day" | "clear-night" | "partly" | "cloud" | "rain" | "storm" | "haze";

export function skyKind(opts: {
  condition?: string | null;
  rain?: number | null;
  isDay?: boolean | null;
  night?: boolean;
}): SkyKind {
  const cond = (opts.condition ?? "").toLowerCase();
  const night = opts.night ?? opts.isDay === false;
  if (/thunder|storm/.test(cond)) return "storm";
  if (/rain|drizzle|shower/.test(cond) || (opts.rain ?? 0) > 55) return "rain";
  if (/hamsin|haze|dust|fog|mist/.test(cond)) return "haze";
  if (night) return "clear-night";
  if (/overcast|cloudy/.test(cond) && !/partly|mostly sunny/.test(cond)) return "cloud";
  if (/partly|few|mostly/.test(cond)) return "partly";
  if (/clear|sun/.test(cond)) return "clear-day";
  return "partly";
}

const Cloud = ({ className, style }: { className: string; style?: React.CSSProperties }) => (
  <div className={`sky-cloud ${className}`} style={style} aria-hidden>
    <span />
    <span />
    <span />
  </div>
);

export function SkyScene({ kind, dense = false }: { kind: SkyKind; dense?: boolean }) {
  const night = kind === "clear-night";
  const wet = kind === "rain" || kind === "storm";

  return (
    <div className={`sky-scene sky-${kind} pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden`} aria-hidden>
      <div className="sky-wash absolute inset-0" />

      {night ? (
        <>
          <div className="sky-stars absolute inset-0" />
          <div className="sky-moon absolute" />
        </>
      ) : null}

      {(kind === "clear-day" || kind === "partly" || kind === "haze") && <div className="sky-sun absolute" />}
      {kind === "haze" ? <div className="sky-dust absolute inset-0" /> : null}

      {kind !== "clear-night" && kind !== "clear-day" ? (
        <>
          <Cloud className="sky-cloud-a" />
          <Cloud className="sky-cloud-b" />
          {(kind === "cloud" || wet || dense) && <Cloud className="sky-cloud-c" />}
        </>
      ) : null}

      {wet ? (
        <div className="sky-rain absolute inset-0">
          {Array.from({ length: dense ? 30 : 18 }).map((_, i) => (
            <span
              key={i}
              style={{
                left: `${(i * 97) % 100}%`,
                animationDelay: `${((i * 137) % 100) / 100}s`,
                animationDuration: `${0.7 + (((i * 53) % 40) / 100)}s`,
              }}
            />
          ))}
        </div>
      ) : null}

      {kind === "storm" ? <div className="sky-flash absolute inset-0" /> : null}

      <div className="sky-vignette absolute inset-0 rounded-[inherit]" />
    </div>
  );
}
