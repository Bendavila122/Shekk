import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, X, Star, ChevronRight, BookOpen, Clock } from "lucide-react";
import { AppShell, ScreenHeader } from "@/components/AppShell";
import {
  PRAYERS,
  SIDDUR_CATEGORIES,
  NUSACHIM,
  findPrayer,
  sectionCount,
  searchPrayers,
  type NusachId,
  type Prayer,
} from "@/lib/siddur";
import { useSiddurPrefs } from "@/lib/siddur-prefs";

export const Route = createFileRoute("/siddur/")({
  head: () => ({
    meta: [
      { title: "Siddur · Shekk" },
      {
        name: "description",
        content:
          "A complete, nusach-aware siddur inside Shekk: Shacharit, Mincha, Maariv, Shabbat, bedtime Shema, Tefilat HaDerech, Birkat Hamazon, brachot and Havdalah.",
      },
      { property: "og:title", content: "Siddur · Shekk" },
      { property: "og:description", content: "Hebrew and English, your nusach, your text size — always in your pocket." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SiddurHome,
});

function PrayerRow({ prayer, trailing }: { prayer: Prayer; trailing?: string }) {
  const category = SIDDUR_CATEGORIES.find((c) => c.id === prayer.categoryId);
  return (
    <Link
      to="/siddur/$id"
      params={{ id: prayer.id }}
      className="tap-flat flex items-center gap-3 border-b border-border px-1 py-3 last:border-b-0"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-muted text-lg">
        {category?.emoji ?? "📖"}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold">{prayer.title}</span>
        <span className="block truncate text-[11px] text-muted-foreground">
          {trailing ?? prayer.blurb}
        </span>
      </span>
      <span dir="rtl" className="shrink-0 text-sm text-muted-foreground">
        {prayer.hebrewTitle}
      </span>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
    </Link>
  );
}

function subtitleFor(prayer: Prayer, nusach: NusachId) {
  const count = sectionCount(prayer, nusach);
  if (!count) return "Not yet in your selected nusach";
  return count > 1 ? `${prayer.blurb} · ${count} sections` : prayer.blurb;
}


function SiddurHome() {
  const { prefs, hydrated, update } = useSiddurPrefs();
  const [query, setQuery] = useState("");
  const results = useMemo(() => (query.trim() ? searchPrayers(query) : null), [query]);

  const continuePrayer = hydrated && prefs.lastPrayerId ? findPrayer(prefs.lastPrayerId) : undefined;
  const favourites = hydrated
    ? prefs.favourites.map(findPrayer).filter((p): p is Prayer => Boolean(p))
    : [];
  const recents = hydrated
    ? prefs.recents
        .map(findPrayer)
        .filter((p): p is Prayer => Boolean(p))
        .filter((p) => p.id !== continuePrayer?.id)
    : [];

  return (
    <AppShell>
      <ScreenHeader title="Siddur" subtitle="Tefillah, your nusach" back="/explore" />

      <div className="space-y-8 px-5 py-5">
        {/* Search */}
        <label className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-3 text-sm">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search prayers — Shema, bentching, Havdalah…"
            aria-label="Search prayers"
            className="w-full min-w-0 bg-transparent outline-none placeholder:text-muted-foreground"
          />
          {query ? (
            <button onClick={() => setQuery("")} aria-label="Clear search" className="tap-flat shrink-0 text-muted-foreground">
              <X className="size-4" />
            </button>
          ) : null}
        </label>

        {results ? (
          <section>
            <h2 className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {results.length} result{results.length === 1 ? "" : "s"}
            </h2>
            {results.length === 0 ? (
              <p className="py-3 text-sm text-muted-foreground">Nothing matches “{query.trim()}” yet.</p>
            ) : (
              <div>
                {results.map((p) => (
                  <PrayerRow key={p.id} prayer={p} />
                ))}
              </div>
            )}
          </section>
        ) : (
          <>
            {/* Nusach */}
            <section>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Your nusach
              </h2>
              <div className="flex gap-1 rounded-2xl bg-muted p-1">
                {NUSACHIM.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => update({ nusach: n.id })}
                    className={`tap-flat flex-1 rounded-xl px-2 py-2 text-[11px] font-semibold ${
                      prefs.nusach === n.id ? "bg-card shadow-card" : "text-muted-foreground"
                    }`}
                  >
                    {n.label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                {NUSACHIM.find((n) => n.id === prefs.nusach)?.hint}
              </p>
            </section>

            {/* Continue reading */}
            {continuePrayer ? (
              <section>
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Continue reading
                </h2>
                <Link
                  to="/siddur/$id"
                  params={{ id: continuePrayer.id }}
                  className="tap flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 shadow-card"
                >
                  <BookOpen className="size-5 shrink-0 text-primary" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{continuePrayer.title}</span>
                    <span className="block truncate text-[11px] text-muted-foreground">
                      {prefs.positions[continuePrayer.id]
                        ? "Pick up where you left off"
                        : continuePrayer.when}
                    </span>
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </Link>
              </section>
            ) : null}

            {/* Favourites */}
            {favourites.length ? (
              <section>
                <h2 className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  <Star className="size-3.5" /> Favourites
                </h2>
                <div>
                  {favourites.map((p) => (
                    <PrayerRow key={p.id} prayer={p} />
                  ))}
                </div>
              </section>
            ) : null}

            {/* Recently opened */}
            {recents.length ? (
              <section>
                <h2 className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  <Clock className="size-3.5" /> Recently opened
                </h2>
                <div>
                  {recents.map((p) => (
                    <PrayerRow key={p.id} prayer={p} />
                  ))}
                </div>
              </section>
            ) : null}

            {/* All prayers, by part of the day */}
            {SIDDUR_CATEGORIES.map((cat) => {
              const items = PRAYERS.filter((p) => p.categoryId === cat.id);
              if (!items.length) return null;
              return (
                <section key={cat.id}>
                  <h2 className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {cat.emoji} {cat.label}
                  </h2>
                  <div>
                    {items.map((p) => (
                      <PrayerRow key={p.id} prayer={p} trailing={subtitleFor(p, prefs.nusach)} />
                    ))}
                  </div>
                </section>
              );
            })}

            <p className="pb-2 text-center text-[11px] leading-relaxed text-muted-foreground">
              Liturgy from Sefaria’s public Siddur library, reproduced unchanged. Nothing here is abridged or
              rewritten — where a nusach has no source text we say so rather than substituting another version.
            </p>

          </>
        )}
      </div>
    </AppShell>
  );
}
