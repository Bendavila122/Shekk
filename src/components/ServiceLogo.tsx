import { useState } from "react";
import type { Service } from "@/lib/services";

/**
 * Renders the partner's real logo when we know their domain, falling back to
 * the catalogue emoji for guides and generic entries.
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
  const showLogo = service.domain && !failed;

  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-card shadow-card ${className}`}
      style={{ width: size, height: size }}
    >
      {showLogo ? (
        <img
          src={`https://www.google.com/s2/favicons?domain=${service.domain}&sz=128`}
          alt={`${service.name} logo`}
          width={Math.round(size * 0.68)}
          height={Math.round(size * 0.68)}
          loading="lazy"
          className="object-contain"
          onError={() => setFailed(true)}
        />
      ) : (
        <span style={{ fontSize: Math.round(size * 0.46) }} className="leading-none">
          {service.emoji}
        </span>
      )}
    </span>
  );
}
