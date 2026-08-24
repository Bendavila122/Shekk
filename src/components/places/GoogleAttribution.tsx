/**
 * Google attribution.
 *
 * Anywhere Shekk renders Google-derived place data — names, addresses, ratings,
 * hours, photos, travel times — Google's terms require a visible credit. This
 * component is the single place that wording lives.
 */

export function GoogleAttribution({
  className = "",
  what = "Places, ratings and travel times",
}: {
  className?: string;
  what?: string;
}) {
  return (
    <p className={`text-[11px] leading-snug text-muted-foreground ${className}`}>
      {what} from Google. Opening hours and prices can change — always check with the venue.
    </p>
  );
}

/** Compact inline credit for a card footer or a photo corner. */
export function GooglePhotoCredit({ className = "" }: { className?: string }) {
  return (
    <span
      className={`rounded-full bg-ink/60 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-ink-foreground ${className}`}
    >
      Google
    </span>
  );
}
