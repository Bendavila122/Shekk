import { useEffect, useRef, useState } from "react";
import { MiniAppIcon } from "@/components/MiniAppIcon";
import { miniAppFor } from "@/lib/mini-apps";
import type { Service } from "@/lib/services";

const LOGO_TOKEN = import.meta.env.VITE_LOVABLE_CONNECTOR_LOGO_DEV_API_KEY as
  | string
  | undefined;

/** Retina-ready brand mark URL from Logo.dev. */
function logoUrl(domain: string, px: number) {
  if (!LOGO_TOKEN) return null;
  const size = Math.min(512, Math.max(128, Math.round(px * 3)));
  const params = new URLSearchParams({
    token: LOGO_TOKEN,
    size: String(size),
    format: "png",
    retina: "true",
    fallback: "404",
  });
  return `https://img.logo.dev/${domain}?${params.toString()}`;
}

/**
 * iOS-style app icon for a partner service: a squircle tile with a crisp,
 * correctly inset brand mark. Falls back to a tinted emoji tile.
 */
export function ServiceLogo({
  service,
  size = 40,
  className = "",
}: {
  service: Pick<Service, "name" | "emoji" | "domain"> & { to?: string };
  size?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const src = service.domain && !failed ? logoUrl(service.domain, size) : null;
  /* Shekk's own mini apps have real icons, not emoji — a gradient squircle with
     a line glyph, so they sit next to partner brand marks as equals. */
  const mini = !src && service.to ? miniAppFor(service.to) : null;

  // An image that errored before hydration never fires onError — catch it here.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, [src]);

  if (mini) return <MiniAppIcon app={mini} size={size} className={className} />;

  return (
    <span
      className={`relative isolate grid shrink-0 place-items-center overflow-hidden bg-card ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: className.includes("rounded") ? undefined : size * 0.235,
      }}
    >
      {src ? (
        <img
          ref={imgRef}
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="h-full w-full scale-[1.02] object-cover"
        />

      ) : (

        <span
          aria-hidden
          className="grid h-full w-full place-items-center bg-primary-soft leading-none"
          style={{ fontSize: Math.round(size * 0.44) }}
        >
          {service.emoji}
        </span>
      )}
      {/* hairline keeps white-on-white marks readable, iOS-style */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-foreground/10"
        style={{ borderRadius: "inherit" }}
      />
    </span>
  );
}
