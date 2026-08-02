import type { MiniApp } from "@/lib/mini-apps";

/**
 * Background motif drawn behind the glyph, on a 100x100 viewBox. Each mini app
 * gets its own quiet pattern so the icons read as a family of distinct apps
 * rather than one squircle with interchangeable glyphs.
 */
function Motif({ id }: { id: string }) {
  const stroke = "currentColor";
  const common = {
    fill: "none",
    stroke,
    strokeWidth: 2,
    vectorEffect: "non-scaling-stroke" as const,
  };
  switch (id) {
    case "maps":
    case "rides":
      return (
        <>
          <circle cx="50" cy="50" r="18" {...common} />
          <circle cx="50" cy="50" r="32" {...common} />
          <circle cx="50" cy="50" r="46" {...common} />
        </>
      );
    case "been-there":
    case "guides":
      return (
        <>
          <path d="M-6 74 C 22 52, 44 88, 74 62 S 100 40, 112 48" {...common} />
          <path d="M-6 92 C 22 70, 44 106, 74 80 S 100 58, 112 66" {...common} />
          <path d="M-6 56 C 22 34, 44 70, 74 44 S 100 22, 112 30" {...common} />
        </>
      );
    case "transit":
    case "reserve":
      return (
        <>
          {[16, 38, 60, 82].map((v) => (
            <line key={`v${v}`} x1={v} y1="-6" x2={v} y2="106" {...common} />
          ))}
          {[16, 38, 60, 82].map((h) => (
            <line key={`h${h}`} x1="-6" y1={h} x2="106" y2={h} {...common} />
          ))}
        </>
      );
    case "events":
    case "tickets":
      return (
        <>
          {[0, 30, 60, 90, 120, 150].map((a) => (
            <line
              key={a}
              x1="50"
              y1="50"
              x2={50 + 70 * Math.cos((a * Math.PI) / 180)}
              y2={50 + 70 * Math.sin((a * Math.PI) / 180)}
              {...common}
            />
          ))}
        </>
      );
    case "food":
    case "shops":
      return (
        <>
          {[-40, 0, 40, 80].map((x) => (
            <line key={x} x1={x} y1="-10" x2={x + 60} y2="110" {...common} />
          ))}
        </>
      );
    case "health":
    case "fitness":
      return (
        <path
          d="M-6 56 H 22 L 30 34 L 40 74 L 50 44 L 58 62 H 106"
          {...common}
          strokeLinejoin="round"
        />
      );
    case "housing":
      return (
        <>
          {[20, 46, 72].map((y) => (
            <line key={y} x1="-6" y1={y} x2="106" y2={y} {...common} />
          ))}
          <line x1="34" y1="-6" x2="34" y2="106" {...common} />
          <line x1="68" y1="-6" x2="68" y2="106" {...common} />
        </>
      );
    case "exchange":
      return (
        <>
          <circle cx="26" cy="30" r="20" {...common} />
          <circle cx="74" cy="70" r="20" {...common} />
          <line x1="26" y1="30" x2="74" y2="70" {...common} />
        </>
      );
    case "news":
      return (
        <>
          {[24, 38, 52, 66, 80].map((y) => (
            <line key={y} x1="16" y1={y} x2={y % 28 === 0 ? 68 : 84} y2={y} {...common} />
          ))}
        </>
      );
    case "siddur":
      return (
        <>
          <path d="M50 -6 V 106" {...common} />
          <path d="M18 10 Q 50 40, 18 70" {...common} />
          <path d="M82 10 Q 50 40, 82 70" {...common} />
        </>
      );
    case "community":
      return (
        <>
          <circle cx="24" cy="24" r="14" {...common} />
          <circle cx="76" cy="24" r="14" {...common} />
          <circle cx="24" cy="76" r="14" {...common} />
          <circle cx="76" cy="76" r="14" {...common} />
          <line x1="24" y1="24" x2="76" y2="76" {...common} />
          <line x1="76" y1="24" x2="24" y2="76" {...common} />
        </>
      );
    default:
      return (
        <>
          <circle cx="50" cy="50" r="24" {...common} />
          <circle cx="50" cy="50" r="44" {...common} />
        </>
      );
  }
}

/**
 * A mini app's icon: a layered squircle in the app's own gradient with a quiet
 * background motif, a single line glyph, and the light behaviour real app icons
 * have — top sheen, corner highlight, inner hairline and a soft bottom shade.
 */
export function MiniAppIcon({
  app,
  size = 60,
  className = "",
}: {
  app: MiniApp;
  size?: number;
  className?: string;
}) {
  const { Icon } = app;
  const glyph = size * (app.iconScale ?? 0.44);
  return (
    <span
      aria-hidden
      className={`relative isolate grid shrink-0 place-items-center overflow-hidden text-white shadow-card ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.235,
        backgroundImage: app.grad,
      }}
    >
      {/* quiet per-app pattern, sitting under the glyph */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.18]"
      >
        <Motif id={app.id} />
      </svg>

      <Icon
        style={{ width: glyph, height: glyph }}
        strokeWidth={app.iconStroke ?? 1.8}
        className="relative z-10 drop-shadow-sm"
      />

      {/* light: soft corner highlight, then the sheen across the top half */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 18% 4%, color-mix(in oklab, white 34%, transparent), transparent 62%)",
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/[0.18] to-transparent"
      />
      {/* soft shade along the bottom so the tile reads as glass, not flat fill */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/18 to-transparent"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/20"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-foreground/10"
      />
    </span>
  );
}
