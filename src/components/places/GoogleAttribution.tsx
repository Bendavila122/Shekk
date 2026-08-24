/**
 * Google Maps attribution.
 *
 * Google requires visible attribution wherever Google-derived content appears
 * on its own (outside a Google map canvas). Text attribution is acceptable when
 * the logo is not used, and the exact string must be "Google Maps", not
 * translated, at normal weight and at least 12px, inside the same visual
 * container as the content it credits.
 *
 * Shekk-owned content — prices, contract lengths, partner offers, our notes —
 * is NEVER credited to Google. That lives in its own panel with its own label.
 */

/** The exact required string, never translated and never restyled bold. */
export function GoogleMapsWordmark({ className = "" }: { className?: string }) {
  return (
    <span translate="no" className={`text-xs font-normal not-italic ${className}`}>
      Google Maps
    </span>
  );
}

/**
 * Standalone attribution for a block of Google-derived content. `what` names the
 * content being credited; it must only ever list Google-derived facts.
 */
export function GoogleAttribution({
  className = "",
  what = "Places, ratings, opening hours and travel times",
}: {
  className?: string;
  what?: string;
}) {
  return (
    <p className={`text-xs font-normal leading-snug text-muted-foreground ${className}`}>
      {what}: <GoogleMapsWordmark />
    </p>
  );
}

/** Compact credit pinned inside a Google-derived photo or card image. */
export function GooglePhotoCredit({ className = "" }: { className?: string }) {
  return (
    <span
      className={`rounded-full bg-ink/70 px-1.5 py-0.5 text-ink-foreground ${className}`}
    >
      <GoogleMapsWordmark />
    </span>
  );
}
