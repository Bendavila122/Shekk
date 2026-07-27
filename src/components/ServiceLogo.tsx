import { useState } from "react";
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
  service: Pick<Service, "name" | "emoji" | "domain">;
  size?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const src = service.domain && !failed ? logoUrl(service.domain, size) : null;

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
          src={src}
          alt={`${service.name} app icon`}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="h-full w-full object-contain"
          style={{ padding: Math.max(2, Math.round(size * 0.14)) }}
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
