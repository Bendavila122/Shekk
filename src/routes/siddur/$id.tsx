import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Star, List, Minus, Plus, Languages, X, AlignJustify } from "lucide-react";
import { AppShell, ScreenHeader } from "@/components/AppShell";
import {
  NUSACHIM,
  findPrayer,
  loadPrayerText,
  sectionRefs,
  SIDDUR_CATEGORIES,
  type PrayerSection,
} from "@/lib/siddur";
import { TEXT_SIZES, useSiddurPrefs } from "@/lib/siddur-prefs";

export const Route = createFileRoute("/siddur/$id")({
  head: ({ params }) => {
    const prayer = findPrayer(params.id);
    const title = prayer ? `${prayer.title} · Siddur · Shekk` : "Siddur · Shekk";
    const description = prayer
      ? `${prayer.blurb} Hebrew with optional English, your nusach and your text size.`
      : "A nusach-aware siddur inside Shekk.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: PrayerReader,
});

function PrayerReader() {
  const { id } = Route.useParams();
  const prayer = findPrayer(id);
  const { prefs, hydrated, update, toggleFavourite, recordOpen, savePosition } = useSiddurPrefs();
  const [contentsOpen, setContentsOpen] = useState(false);
  const [resumeShown, setResumeShown] = useState(true);
  const [sections, setSections] = useState<PrayerSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const refs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    if (hydrated && prayer) recordOpen(prayer.id);
  }, [hydrated, prayer, recordOpen]);

  // Text is loaded on demand: one module per prayer + nusach.
  useEffect(() => {
    if (!prayer) return;
    let live = true;
    setLoading(true);
    loadPrayerText(prayer.id, prefs.nusach).then((loaded) => {
      if (!live) return;
      setSections(loaded);
      setLoading(false);
    });
    return () => {
      live = false;
    };
  }, [prayer, prefs.nusach]);

  const toc = useMemo(() => (prayer ? sectionRefs(prayer, prefs.nusach) : []), [prayer, prefs.nusach]);
  const available = prayer?.nusachim ?? [];
  const sibling = prayer?.variantOf ? findPrayer(prayer.variantOf) : undefined;

  const onVisible = useCallback(
    (sectionId: string) => {
      setCurrentId(sectionId);
      if (prayer) savePosition(prayer.id, sectionId);
    },
    [prayer, savePosition],
  );

  // Track which section is on screen: drives the sticky header and the resume point.
  useEffect(() => {
    if (!sections.length || typeof window === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible?.target instanceof HTMLElement && visible.target.dataset.section) {
          onVisible(visible.target.dataset.section);
        }
      },
      { rootMargin: "-15% 0px -70% 0px" },
    );
    sections.forEach((s) => {
      const el = refs.current[s.id];
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections, onVisible]);

  if (!prayer) {
    return (
      <AppShell>
        <ScreenHeader title="Siddur" back="/siddur" />
        <div className="px-5 py-8 text-sm text-muted-foreground">
          That prayer isn’t in the siddur yet.{" "}
          <Link to="/siddur" className="font-semibold text-primary">
            Back to the siddur
          </Link>
        </div>
      </AppShell>
    );
  }

  const category = SIDDUR_CATEGORIES.find((c) => c.id === prayer.categoryId);
  const isFav = prefs.favourites.includes(prayer.id);
  const savedSection = prefs.positions[prayer.id];
  const showResume =
    resumeShown && Boolean(savedSection) && toc.length > 1 && savedSection !== toc[0]?.id && !loading;

  const currentIndex = currentId ? toc.findIndex((s) => s.id === currentId) : -1;
  const current = currentIndex >= 0 ? toc[currentIndex] : undefined;
  const progress = toc.length > 1 && currentIndex >= 0 ? ((currentIndex + 1) / toc.length) * 100 : 0;

  const scrollTo = (sectionId: string) => {
    refs.current[sectionId]?.scrollIntoView({ behavior: "smooth", block: "start" });
    setContentsOpen(false);
    setResumeShown(false);
  };

  const sizeClass = TEXT_SIZES[Math.min(Math.max(prefs.textSize, 0), TEXT_SIZES.length - 1)];
  const leading = prefs.roomy ? "leading-[2.1]" : "leading-[1.6]";

  return (
    <AppShell>
      <ScreenHeader title={prayer.title} subtitle={category?.label} back="/siddur" />

      {/* Reading controls */}
      <div className="sticky top-[60px] z-20 border-b border-border bg-background/95 backdrop-blur lg:top-0">
        <div className="flex items-center gap-1.5 px-4 py-2">
          <button
            type="button"
            onClick={() => update({ display: prefs.display === "hebrew" ? "bilingual" : "hebrew" })}
            className="tap-flat flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-[11px] font-semibold"
          >
            <Languages className="size-3.5" />
            {prefs.display === "hebrew" ? "Hebrew only" : "Hebrew + English"}
          </button>
          <button
            type="button"
            aria-label="Decrease text size"
            onClick={() => update({ textSize: Math.max(0, prefs.textSize - 1) })}
            className="tap-flat rounded-full bg-muted p-1.5"
          >
            <Minus className="size-3.5" />
          </button>
          <button
            type="button"
            aria-label="Increase text size"
            onClick={() => update({ textSize: Math.min(TEXT_SIZES.length - 1, prefs.textSize + 1) })}
            className="tap-flat rounded-full bg-muted p-1.5"
          >
            <Plus className="size-3.5" />
          </button>
          <button
            type="button"
            aria-label="Toggle line spacing"
            onClick={() => update({ roomy: !prefs.roomy })}
            className={`tap-flat rounded-full p-1.5 ${prefs.roomy ? "bg-primary text-primary-foreground" : "bg-muted"}`}
          >
            <AlignJustify className="size-3.5" />
          </button>
          <div className="flex-1" />
          {toc.length > 1 ? (
            <button
              type="button"
              aria-label="Contents"
              onClick={() => setContentsOpen(true)}
              className="tap-flat rounded-full bg-muted p-1.5"
            >
              <List className="size-3.5" />
            </button>
          ) : null}
          <button
            type="button"
            aria-label={isFav ? "Remove favourite" : "Add favourite"}
            onClick={() => toggleFavourite(prayer.id)}
            className={`tap-flat rounded-full p-1.5 ${isFav ? "bg-primary text-primary-foreground" : "bg-muted"}`}
          >
            <Star className="size-3.5" fill={isFav ? "currentColor" : "none"} />
          </button>
        </div>

        {/* Where you are in a long service */}
        {current ? (
          <button
            type="button"
            onClick={() => setContentsOpen(true)}
            className="tap-flat flex w-full items-center gap-2 border-t border-border px-4 py-1.5 text-left"
          >
            <span className="min-w-0 flex-1 truncate text-[11px] font-semibold">
              {current.group ? <span className="text-muted-foreground">{current.group} · </span> : null}
              {current.heading}
            </span>
            <span className="shrink-0 text-[10px] text-muted-foreground">
              {currentIndex + 1}/{toc.length}
            </span>
          </button>
        ) : null}
        {progress > 0 ? (
          <div className="h-0.5 w-full bg-muted">
            <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
        ) : null}
      </div>

      {/* Weekday / Shabbat switch */}
      {sibling ? (
        <div className="flex gap-1 px-4 pt-3">
          <span className="flex-1 rounded-xl bg-primary px-3 py-2 text-center text-[11px] font-semibold text-primary-foreground">
            {prayer.variant === "shabbat" ? "Shabbat" : "Weekday"}
          </span>
          <Link
            to="/siddur/$id"
            params={{ id: sibling.id }}
            className="tap-flat flex-1 rounded-xl bg-muted px-3 py-2 text-center text-[11px] font-semibold text-muted-foreground"
          >
            {sibling.variant === "shabbat" ? "Shabbat" : "Weekday"}
          </Link>
        </div>
      ) : null}

      {showResume ? (
        <button
          type="button"
          onClick={() => scrollTo(savedSection)}
          className="tap-flat mx-4 mt-3 flex w-[calc(100%-2rem)] items-center justify-between rounded-2xl bg-muted px-4 py-2.5 text-left text-[12px]"
        >
          <span>
            Continue at{" "}
            <span className="font-semibold">
              {toc.find((s) => s.id === savedSection)?.heading ?? "your place"}
            </span>
          </span>
          <span className="text-[11px] font-semibold text-primary">Resume</span>
        </button>
      ) : null}

      <article className="px-5 pb-10 pt-5">
        {loading ? (
          <p className="py-8 text-sm text-muted-foreground">Loading the text…</p>
        ) : sections.length === 0 ? (
          <div className="space-y-3 py-8">
            <p className="text-sm font-semibold">This prayer is not yet available in your selected nusach.</p>
            <p className="text-[12px] leading-relaxed text-muted-foreground">
              We only show text we have in the nusach you chose — we never substitute another version.
              {available.length
                ? ` ${prayer.title} is currently available in ${available
                    .map((n) => NUSACHIM.find((x) => x.id === n)?.label)
                    .join(", ")}.`
                : ""}
            </p>
            {available.length ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {available.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => update({ nusach: n })}
                    className="tap rounded-full bg-primary px-3.5 py-2 text-[11px] font-semibold text-primary-foreground"
                  >
                    Switch to {NUSACHIM.find((x) => x.id === n)?.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="space-y-9">
            {sections.map((section) => (
              <section
                key={section.id}
                data-section={section.id}
                ref={(el) => {
                  refs.current[section.id] = el;
                }}
                className="scroll-mt-36"
              >
                <div className="mb-3">
                  {section.group ? (
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                      {section.group}
                    </p>
                  ) : null}
                  <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {section.heading}
                  </h2>
                </div>
                <div className="space-y-6">
                  {section.lines.map((line, i) =>
                    line.note ? (
                      <div key={i} className="rounded-xl bg-muted/60 px-3 py-2">
                        <p dir="rtl" lang="he" className="text-right text-[13px] italic text-muted-foreground">
                          {line.he}
                        </p>
                        {prefs.display === "bilingual" && line.en ? (
                          <p dir="ltr" className="mt-1 text-[11px] italic leading-relaxed text-muted-foreground">
                            {line.en}
                          </p>
                        ) : null}
                      </div>
                    ) : (
                      <div key={i} className="space-y-2">
                        <p dir="rtl" lang="he" className={`text-right font-medium ${sizeClass} ${leading}`}>
                          {line.he}
                        </p>
                        {prefs.display === "bilingual" && line.en ? (
                          <p dir="ltr" className="text-[13px] leading-relaxed text-muted-foreground">
                            {line.en}
                          </p>
                        ) : null}
                      </div>
                    ),
                  )}
                </div>
              </section>
            ))}

            <p className="border-t border-border pt-4 text-[10px] leading-relaxed text-muted-foreground">
              Text from Sefaria’s public Siddur library, reproduced unchanged. Versions used:{" "}
              {prayer.licences.join("; ")}.
            </p>
          </div>
        )}
      </article>

      {/* Contents sheet */}
      {contentsOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <button
            type="button"
            aria-label="Close contents"
            onClick={() => setContentsOpen(false)}
            className="absolute inset-0 bg-ink/40"
          />
          <div className="relative w-full max-w-[430px] rounded-t-3xl border border-border bg-card p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-lift">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold">Contents</p>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setContentsOpen(false)}
                className="tap-flat rounded-full bg-muted p-1.5"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {toc.map((s, i) => {
                const newGroup = s.group && s.group !== toc[i - 1]?.group;
                return (
                  <div key={s.id}>
                    {newGroup ? (
                      <p className="sticky top-0 bg-card pb-1 pt-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                        {s.group}
                      </p>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => scrollTo(s.id)}
                      className={`tap-flat flex w-full items-center justify-between border-b border-border py-2.5 text-left text-sm last:border-b-0 ${
                        currentId === s.id || savedSection === s.id ? "font-semibold text-primary" : ""
                      }`}
                    >
                      <span className="min-w-0 flex-1 truncate">{s.heading}</span>
                      <span className="shrink-0 pl-2 text-[10px] text-muted-foreground">{i + 1}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
