/**
 * Where am I? — the shared location control.
 *
 * Every location-aware mini app uses this so permission states, the manual
 * city fallback and the "use my location" affordance behave identically. GPS is
 * always optional: picking a city is a first-class path, not a consolation.
 */

import { LoaderCircle, MapPin, Navigation } from "lucide-react";
import { LOCATION_CITIES, useLocation } from "@/lib/location";

export function LocationBar({ className = "" }: { className?: string }) {
  const { place, status, loading, error, detect, setCity } = useLocation();

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center gap-2 text-xs">
        <MapPin className="size-4 shrink-0 text-muted-foreground" />
        <span className="truncate font-semibold">
          {place ? (place.area ? `${place.area}, ${place.city}` : place.city) : "No location yet"}
        </span>
        <button
          type="button"
          onClick={detect}
          className="tap inline-flex shrink-0 items-center gap-1 font-semibold text-primary"
        >
          {loading ? (
            <LoaderCircle className="size-3.5 animate-spin" />
          ) : (
            <Navigation className="size-3.5" />
          )}
          {place ? "Update" : "Use my location"}
        </button>
        <select
          value={place?.city ?? ""}
          onChange={(e) => e.target.value && setCity(e.target.value)}
          className="ml-auto shrink-0 rounded-full border border-border bg-card px-2 py-1 text-xs"
          aria-label="Pick a city instead"
        >
          <option value="">Pick a city</option>
          {LOCATION_CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {status === "denied" && (
        <p className="text-[11px] text-muted-foreground">
          Location is blocked for Shekk in your browser settings — pick a city above instead.
        </p>
      )}
      {status === "unavailable" && error && (
        <p className="text-[11px] text-muted-foreground">{error} Pick a city above instead.</p>
      )}
      {place?.source === "manual" && (
        <p className="text-[11px] text-muted-foreground">
          Showing {place.city}. Tap “Use my location” for distances from exactly where you are.
        </p>
      )}
    </div>
  );
}
