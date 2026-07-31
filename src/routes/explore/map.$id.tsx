import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { Check, ExternalLink, LoaderCircle } from "lucide-react";
import { AppShell, Card, ScreenHeader } from "@/components/AppShell";
import { KIND_META, findMapPlace, regionOfPlace } from "@/lib/israel-map";
import { useVisited } from "@/lib/israel-map-prefs";
import { useWikiInfo } from "@/lib/useWikiInfo";
import { haptic } from "@/lib/foryou-prefs";

export const Route = createFileRoute("/explore/map/$id")({
  loader: ({ params }) => {
    const place = findMapPlace(params.id);
    if (!place) throw notFound();
    return { name: place.name, blurb: place.blurb };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.name ?? "Place"} · Been There · Shekk` },
      { name: "description", content: loaderData?.blurb ?? "A place worth seeing in Israel." },
      { property: "og:title", content: `${loaderData?.name ?? "Place"} · Been There` },
      { property: "og:description", content: loaderData?.blurb ?? "A place worth seeing in Israel." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PlaceScreen,
});

function PlaceScreen() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const place = findMapPlace(id);
  const { places, togglePlace } = useVisited();
  const titles = place ? [place.wiki, ...place.gallery.map((g) => g.wiki)] : [];
  const { data, loading } = useWikiInfo(Array.from(new Set(titles)));

  if (!place) {
    return (
      <AppShell>
        <ScreenHeader title="Not found" back="/explore/map" />
        <p className="px-4 text-sm text-muted-foreground">We don't have that place on the map yet.</p>
      </AppShell>
    );
  }

  const hero = data[place.wiki];
  const been = places.includes(place.id);
  const gallery = place.gallery.filter((g) => data[g.wiki]?.image);

  return (
    <AppShell>
      <ScreenHeader
        title={place.name}
        subtitle={regionOfPlace(place)?.name}
        back="/explore/map"
        onBack={() => navigate({ to: "/explore/map" })}
      />

      <div className="space-y-4 px-4 pb-6">
        <div className="overflow-hidden rounded-3xl border border-border bg-muted shadow-card">
          {hero?.image ? (
            <img
              src={hero.image}
              alt={`${place.name}, Israel`}
              loading="lazy"
              className="h-48 w-full object-cover"
            />
          ) : (
            <div className="flex h-48 w-full items-center justify-center text-4xl">
              {loading ? (
                <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
              ) : (
                KIND_META[place.kind].emoji
              )}
            </div>
          )}
          <div className="space-y-2 bg-card p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {KIND_META[place.kind].emoji} {KIND_META[place.kind].label}
              {place.hebrew ? ` · ${place.hebrew}` : ""}
            </p>
            <h2 className="text-xl font-semibold">{place.name}</h2>
            <p className="text-sm text-muted-foreground">{place.blurb}</p>
            <button
              type="button"
              onClick={() => {
                haptic();
                togglePlace(place.id);
              }}
              className={`tap flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold ${
                been ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
              }`}
            >
              <Check className="size-4" />
              {been ? "Been there" : "Mark as visited"}
            </button>
          </div>
        </div>

        <Card className="space-y-2">
          <h3 className="text-sm font-semibold">History</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{place.history}</p>
          {hero?.extract ? (
            <p className="text-sm leading-relaxed text-muted-foreground">{hero.extract}</p>
          ) : null}
          {hero?.url ? (
            <a
              href={hero.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary"
            >
              Read more <ExternalLink className="size-3.5" />
            </a>
          ) : null}
        </Card>

        <Card className="space-y-2">
          <h3 className="text-sm font-semibold">Things to do & see</h3>
          <ul className="space-y-2">
            {place.todo.map((t) => (
              <li key={t} className="flex gap-2 text-sm text-muted-foreground">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </Card>

        {gallery.length > 0 ? (
          <div>
            <h3 className="mb-2 px-1 text-sm font-semibold">Photos</h3>
            <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2">
              {gallery.map((g) => (
                <figure key={g.wiki} className="w-56 shrink-0 snap-start">
                  <img
                    src={data[g.wiki]!.image!}
                    alt={`${g.label}, Israel`}
                    loading="lazy"
                    className="h-36 w-full rounded-2xl border border-border object-cover"
                  />
                  <figcaption className="mt-1.5 text-[11px] text-muted-foreground">{g.label}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        ) : null}

        <a
          href={`https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lon}`}
          target="_blank"
          rel="noreferrer"
          className="tap block rounded-2xl border border-border bg-card px-4 py-3 text-center text-sm font-semibold"
        >
          Open in Maps
        </a>
      </div>
    </AppShell>
  );
}
