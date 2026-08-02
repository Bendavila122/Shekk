/**
 * JewishScene — illustrated backdrop for the Jewish Life widget.
 *
 * One coherent Old City view: Judean hills behind, the city wall across the
 * front, and the landmarks a student actually recognises — the Dome of the Rock
 * on its platform, the Hurva dome, the Tower of David — all sitting on a single
 * baseline. Shabbat candles rest on the wall ledge; stars appear once it is
 * genuinely dark for the user's location. Pure CSS + inline SVG.
 */
export type JewishSceneKind = "erev" | "shabbat" | "chag" | "fast" | "day" | "night";

export function jewishSceneKind(opts: {
  isErevShabbat?: boolean;
  isShabbat?: boolean;
  dayKind?: string | null;
  /** ISO instant of nightfall for this location, when known. */
  tzeitAt?: string | null;
  sunsetAt?: string | null;
  now?: Date;
}): JewishSceneKind {
  const now = opts.now ?? new Date();
  const dark = (() => {
    const mark = opts.tzeitAt ?? opts.sunsetAt;
    if (!mark) return null;
    const t = new Date(mark).getTime();
    if (!Number.isFinite(t)) return null;
    // Dark from nightfall until roughly dawn the next morning.
    return now.getTime() >= t && now.getTime() - t < 11 * 3600_000;
  })();

  if (opts.dayKind === "fast") return "fast";
  if (opts.dayKind) return "chag";
  if (opts.isShabbat) return "shabbat";
  if (opts.isErevShabbat) return "erev";
  if (dark === true) return "night";
  return "day";
}

/** Should candles be burning in this scene? */
const hasCandles = (k: JewishSceneKind) => k === "erev" || k === "shabbat" || k === "chag";
/** Is the sky dark enough for stars? */
const hasStars = (k: JewishSceneKind) => k === "shabbat" || k === "chag" || k === "night";

/** Distant Judean hills — the layer that grounds everything else. */
const Hills = () => (
  <svg className="jl-hills" viewBox="0 0 320 60" preserveAspectRatio="none" aria-hidden>
    <path d="M0 60V38c26-13 44-6 66 2 20 7 34-9 58-14 25-5 38 9 62 10 22 1 40-12 62-9 20 3 52 14 72 9v24z" fill="currentColor" />
  </svg>
);

/**
 * The Old City itself, drawn as one silhouette so nothing floats:
 * wall + crenellations along the bottom, landmarks rising out of it.
 */
const OldCity = () => (
  <svg className="jl-skyline" viewBox="0 0 320 120" preserveAspectRatio="none" aria-hidden>
    <g fill="currentColor">
      {/* Cypress trees, left */}
      <path d="M16 96c0-14 3-24 5-24s5 10 5 24z" />
      <path d="M28 96c0-11 2-19 4-19s4 8 4 19z" />

      {/* Tower of David: square keep with a tapered tower */}
      <path d="M44 96V64h26v32z" />
      <path d="M50 64V54h14v10z" />
      <path d="M55 54V40h4v14z" />
      <circle cx="57" cy="38" r="2.6" />

      {/* Stone rooftops with small domes, the Jewish Quarter */}
      <path d="M78 96V72h22v24z" />
      <path d="M89 72a11 8 0 0 1 0 0z" />
      <path d="M78 72c0-6 5-10 11-10s11 4 11 10z" />
      <path d="M104 96V78h18v18z" />
      <path d="M104 78c0-5 4-8 9-8s9 3 9 8z" />

      {/* Hurva synagogue: drum, dome, lantern */}
      <path d="M128 96V70h30v26z" />
      <path d="M132 70c0-12 5-19 11-19s11 7 11 19z" />
      <path d="M141 51V44h4v7z" />
      <circle cx="143" cy="42" r="2.2" />

      {/* Low arcaded rooftops leading to the Temple Mount platform */}
      <path d="M162 96V80h20v16z" />
      <path d="M186 96V84h16v12z" />

      {/* Temple Mount platform + Dome of the Rock on its octagonal drum */}
      <path d="M204 96V86h74v10z" />
      <path d="M222 86V66h34v20z" />
      <path d="M224 66c0-15 7-24 15-24s15 9 15 24z" />
      <path d="M237 42v-8h4v8z" />
      <circle cx="239" cy="32" r="2.8" />

      {/* Al-Aqsa's lower silver dome, to the right of the platform */}
      <path d="M262 86V76h16v10z" />
      <path d="M262 76c0-7 4-12 8-12s8 5 8 12z" />

      {/* Eastern rooftops + cypresses */}
      <path d="M282 96V80h16v16z" />
      <path d="M302 96c0-13 3-22 5-22s5 9 5 22z" />

      {/* City wall across the front, with crenellations */}
      <path d="M0 120v-22h320v22z" />
      <path d="M0 98v-7h10v7zm20 0v-7h10v7zm20 0v-7h10v7zm20 0v-7h10v7zm20 0v-7h10v7zm20 0v-7h10v7zm20 0v-7h10v7zm20 0v-7h10v7zm20 0v-7h10v7zm20 0v-7h10v7zm20 0v-7h10v7zm20 0v-7h10v7zm20 0v-7h10v7zm20 0v-7h10v7zm20 0v-7h10v7zm20 0v-7h10v7z" />
    </g>
  </svg>
);

export function JewishScene({ kind, dense }: { kind: JewishSceneKind; dense?: boolean }) {
  return (
    <div
      className={`jl-scene jl-${kind} ${dense ? "jl-dense" : ""} pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]`}
      aria-hidden
    >
      <div className="jl-wash absolute inset-0" />
      <div className="jl-glow absolute inset-0" />
      {hasStars(kind) ? <div className="jl-stars absolute inset-0" /> : null}
      {kind === "day" ? <div className="jl-haze absolute inset-0" /> : null}

      <div className="jl-hillband absolute inset-x-0 bottom-0">
        <Hills />
      </div>

      <div className="jl-city absolute inset-x-0 bottom-0">
        <OldCity />
      </div>

      {hasCandles(kind) ? (
        <div className="jl-candles absolute">
          <span className="jl-candle">
            <i className="jl-flame" />
          </span>
          <span className="jl-candle">
            <i className="jl-flame" />
          </span>
          <span className="jl-candlelight" />
        </div>
      ) : null}

      <div className="jl-vignette absolute inset-0 rounded-[inherit]" />
    </div>
  );
}
