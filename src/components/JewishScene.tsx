/**
 * JewishScene — illustrated backdrop for the Jewish Life widget: a Jerusalem
 * skyline at the right time of day, with flickering Shabbat candles on erev
 * Shabbat / chag and drifting stars once the sun is down. Pure CSS + inline SVG.
 */
export type JewishSceneKind = "erev" | "shabbat" | "chag" | "fast" | "day";

export function jewishSceneKind(opts: {
  isErevShabbat?: boolean;
  isShabbat?: boolean;
  dayKind?: string | null;
}): JewishSceneKind {
  if (opts.dayKind === "fast") return "fast";
  if (opts.dayKind) return "chag";
  if (opts.isErevShabbat) return "erev";
  if (opts.isShabbat) return "shabbat";
  return "day";
}

const Skyline = () => (
  <svg className="jl-skyline" viewBox="0 0 320 90" preserveAspectRatio="none" aria-hidden>
    <path
      d="M0 90V64h14v-8h6v8h10V50h8v14h12V42c0-7 6-12 13-12s13 5 13 12v22h10V56h7v8h13V34l10-8 10 8v30h9V48h8v16h12V38h6v26h14V52h8v12h12V44h7v20h12V58h6v6h14V48h8v16h12v-8h6v8h16v26z"
      fill="currentColor"
    />
    {/* Dome of the old city skyline */}
    <circle cx="103" cy="30" r="13" fill="currentColor" />
    <rect x="102" y="10" width="2" height="10" fill="currentColor" />
  </svg>
);

export function JewishScene({ kind }: { kind: JewishSceneKind }) {
  const candles = kind === "erev" || kind === "shabbat" || kind === "chag";
  const stars = kind !== "day";

  return (
    <div className={`jl-scene jl-${kind} pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]`} aria-hidden>
      <div className="jl-wash absolute inset-0" />
      <div className="jl-glow absolute inset-0" />
      {stars ? <div className="jl-stars absolute inset-0" /> : null}
      {kind === "day" ? <div className="jl-haze absolute inset-0" /> : null}

      <div className="jl-city absolute inset-x-0 bottom-0">
        <Skyline />
      </div>

      {candles ? (
        <div className="jl-candles absolute">
          <span className="jl-candle">
            <i className="jl-flame" />
          </span>
          <span className="jl-candle">
            <i className="jl-flame" />
          </span>
        </div>
      ) : null}

      <div className="jl-vignette absolute inset-0 rounded-[inherit]" />
    </div>
  );
}
