/**
 * A Google Places photo.
 *
 * The URL is resolved on demand and the bytes are served by Google — Shekk
 * never copies, caches or rehosts a Places image. When there is no photo (or
 * the connection isn't configured) we fall back to a category emoji tile, so
 * the layout never collapses.
 */

import { usePlacePhoto } from "@/lib/places";
import { GooglePhotoCredit } from "./GoogleAttribution";

export function PlacePhoto({
  photoName,
  alt,
  emoji = "📍",
  className = "",
  maxWidthPx = 800,
}: {
  photoName?: string | undefined;
  alt: string;
  emoji?: string;
  className?: string;
  maxWidthPx?: number;
}) {
  const url = usePlacePhoto(photoName, maxWidthPx);

  if (!url)
    return (
      <div
        aria-hidden
        className={`flex items-center justify-center bg-muted text-2xl ${className}`}
      >
        {emoji}
      </div>
    );

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img src={url} alt={alt} loading="lazy" className="size-full object-cover" />
      <GooglePhotoCredit className="absolute bottom-1 right-1" />
    </div>
  );
}
