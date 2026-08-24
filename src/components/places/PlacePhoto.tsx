/**
 * A Google Places photo.
 *
 * The URL is resolved on demand and the bytes are always served by Google —
 * Shekk never copies, caches or rehosts a Places image, and never retains a
 * photo resource name.
 *
 * Google requires the photographer's attribution to be shown with a full photo,
 * along with a way to open the photo on Google Maps. Two variants exist:
 *
 *  - `detail` (default for large displays): renders the author credit and the
 *    "View on Google Maps" link directly under the photo.
 *  - `thumb`: a compact card image with the Google Maps credit only. This is
 *    allowed because every card links to the place detail screen, where the
 *    same photo is shown with its full author attribution. If a thumbnail has
 *    an author credit and no detail screen is reachable, pass `detail`.
 */

import { usePlacePhoto, type PhotoRef } from "@/lib/places";
import { GoogleMapsWordmark, GooglePhotoCredit } from "./GoogleAttribution";

export function PhotoAttribution({ photo, className = "" }: { photo: PhotoRef; className?: string }) {
  const author = photo.authors[0];
  if (!author && !photo.googleMapsUri) return null;

  return (
    <div className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground ${className}`}>
      {author && (
        <span className="inline-flex items-center gap-1.5">
          {author.photoUri && (
            <img src={author.photoUri} alt="" aria-hidden className="size-4 rounded-full object-cover" />
          )}
          Photo by{" "}
          {author.uri ? (
            <a href={author.uri} target="_blank" rel="noreferrer" className="underline">
              {author.displayName}
            </a>
          ) : (
            author.displayName
          )}
        </span>
      )}
      {photo.googleMapsUri && (
        <a href={photo.googleMapsUri} target="_blank" rel="noreferrer" className="underline">
          View photo on <GoogleMapsWordmark />
        </a>
      )}
    </div>
  );
}

export function PlacePhoto({
  photo,
  alt,
  emoji = "📍",
  className = "",
  maxWidthPx = 800,
  variant = "detail",
}: {
  photo?: PhotoRef | undefined;
  alt: string;
  emoji?: string;
  className?: string;
  maxWidthPx?: number;
  variant?: "detail" | "thumb";
}) {
  const url = usePlacePhoto(photo?.name, maxWidthPx);

  if (!url || !photo)
    return (
      <div aria-hidden className={`flex items-center justify-center bg-muted text-2xl ${className}`}>
        {emoji}
      </div>
    );

  if (variant === "thumb")
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <img src={url} alt={alt} loading="lazy" className="size-full object-cover" />
        <GooglePhotoCredit className="absolute bottom-1 right-1 scale-[0.85] origin-bottom-right" />
      </div>
    );

  return (
    <figure className="space-y-1.5">
      <div className={`relative overflow-hidden ${className}`}>
        <img src={url} alt={alt} loading="lazy" className="size-full object-cover" />
        <GooglePhotoCredit className="absolute bottom-1 right-1" />
      </div>
      <figcaption>
        <PhotoAttribution photo={photo} />
      </figcaption>
    </figure>
  );
}
