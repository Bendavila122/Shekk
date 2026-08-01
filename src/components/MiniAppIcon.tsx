import type { MiniApp } from "@/lib/mini-apps";

/**
 * A mini app's icon: an iOS-style squircle in the app's own gradient with a
 * single line glyph, plus the soft top sheen real app icons have.
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
  return (
    <span
      aria-hidden
      className={`relative isolate grid shrink-0 place-items-center overflow-hidden text-primary-foreground shadow-card ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.235,
        backgroundImage: app.grad,
      }}
    >
      <Icon
        style={{ width: size * 0.46, height: size * 0.46 }}
        strokeWidth={1.9}
        className="relative z-10 drop-shadow-sm"
      />
      {/* glass sheen across the top half, the way app icons catch light */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-primary-foreground/25 to-transparent"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-foreground/10"
      />
    </span>
  );
}
