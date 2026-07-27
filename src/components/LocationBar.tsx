import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, LoaderCircle, MapPin, Navigation } from "lucide-react";
import { LOCATION_CITIES, useLocation } from "@/lib/location";
import { useApp } from "@/lib/store";
import { haptic } from "@/lib/foryou-prefs";

/**
 * Current-location strip for the top of Home: asks the browser once,
 * falls back to a manual city picker whenever permission is refused.
 */
export function LocationBar() {
  const { status, place, loading, detect, setCity } = useLocation();
  const { setSetting } = useApp();
  const [picking, setPicking] = useState(false);
  const [asked, setAsked] = useState(false);

  // Ask once per session when we have nothing saved yet.
  useEffect(() => {
    if (asked || place || status !== "idle") return;
    setAsked(true);
    detect();
  }, [asked, place, status, detect]);

  // Keep weather / Shabbat times in step with where the student actually is.
  const syncedCity = useRef<string | null>(null);
  useEffect(() => {
    const city = place?.city;
    if (!city || syncedCity.current === city) return;
    syncedCity.current = city;
    setSetting("homeCity", city);
    // setSetting identity is not stable; the ref guard keeps this to one write per city.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [place?.city]);

  const label = place ? place.city : loading ? "Finding you…" : "Set your location";
  const sub = place?.area
    ? place.area
    : status === "denied"
      ? "Location off — pick a city"
      : status === "unavailable"
        ? "Location unavailable — pick a city"
        : place
          ? "Current location"
          : "Tap to choose";

  return (
    <div className="px-5 pt-3">
      <button
        onClick={() => {
          haptic();
          setPicking((v) => !v);
        }}
        className="tap-flat flex w-full items-center gap-2 text-left"
      >
        <span className="flex size-7 items-center justify-center rounded-full bg-primary-soft text-primary">
          {loading ? (
            <LoaderCircle className="size-3.5 animate-spin" />
          ) : (
            <MapPin className="size-3.5" />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold leading-tight">{label}</span>
          <span className="block truncate text-[11px] leading-tight text-muted-foreground">{sub}</span>
        </span>
        <ChevronDown
          className={`size-4 shrink-0 text-muted-foreground transition-transform ${picking ? "rotate-180" : ""}`}
        />
      </button>

      {picking ? (
        <div className="mt-2 overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          <button
            onClick={() => {
              haptic();
              detect();
            }}
            className="tap-flat flex w-full items-center gap-2 border-b border-border px-4 py-3 text-left text-sm font-semibold text-primary"
          >
            <Navigation className="size-4" />
            Use my current location
          </button>
          <div className="max-h-64 overflow-y-auto">
            {LOCATION_CITIES.map((c) => (
              <button
                key={c}
                onClick={() => {
                  haptic();
                  setCity(c);
                  setPicking(false);
                }}
                className="tap-flat flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm"
              >
                <span className="flex-1">{c}</span>
                {place?.city === c ? <Check className="size-4 text-primary" /> : null}
              </button>
            ))}
          </div>
          {status === "denied" ? (
            <p className="border-t border-border px-4 py-2.5 text-[11px] text-muted-foreground">
              Location is blocked for Shekk in your browser settings — choose a city above instead.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
