import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Bookmark, BookmarkCheck, CalendarClock, Clock, ThumbsDown, ThumbsUp } from "lucide-react";
import { AppShell, ScreenHeader } from "@/components/AppShell";
import { GuideBlockView } from "@/lib/guide-blocks";
import { GUIDES, categoryLabel, getGuide, type Guide } from "@/lib/guides";
import { useGuidePrefs } from "@/lib/guide-prefs";

export const Route = createFileRoute("/guides/$id")({
  loader: ({ params }) => {
    const guide = getGuide(params.id);
    if (!guide) throw notFound();
    return { guide };
  },
  head: ({ loaderData }) => {
    const g = loaderData?.guide;
    const title = g ? `${g.title} · Shekk guides` : "Guide · Shekk";
    const description = g?.blurb ?? "A practical gap-year guide from Shekk.";
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
  component: GuideDetail,
});

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

function GuideDetail() {
  const { guide } = Route.useLoaderData() as { guide: Guide };
  const { prefs, toggleSaved, setProgress, toggleCheck, rate } = useGuidePrefs();
  const [pct, setPct] = useState(0);
  const bodyRef = useRef<HTMLDivElement>(null);

  const related = GUIDES.filter((g) => g.id !== guide.id && g.category === guide.category).slice(0, 3);
  const fallback = GUIDES.filter((g) => g.id !== guide.id).slice(0, 3);
  const more = related.length ? related : fallback;
  const saved = prefs.saved.includes(guide.id);
  const verdict = prefs.useful[guide.id];

  useEffect(() => {
    const onScroll = () => {
      const el = bodyRef.current;
      if (!el) return;
      const total = el.offsetTop + el.offsetHeight - window.innerHeight;
      const value = total <= 0 ? 1 : Math.min(1, Math.max(0, window.scrollY / total));
      setPct(value);
      setProgress(guide.id, value);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [guide.id, setProgress]);

  return (
    <AppShell>
      <div
        aria-hidden
        className="fixed left-0 top-0 z-50 h-0.5 bg-primary transition-[width] duration-150 lg:absolute"
        style={{ width: `${Math.round(pct * 100)}%` }}
      />
      <ScreenHeader title={guide.title} />

      <article ref={bodyRef} className="px-5 pt-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {categoryLabel(guide.category)}
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold leading-tight tracking-tight">
          <span className="mr-2">{guide.emoji}</span>
          {guide.title}
        </h1>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" /> {guide.readMins} min read
          </span>
          <span className="inline-flex items-center gap-1">
            <CalendarClock className="size-3.5" /> Checked {fmt(guide.updated)}
          </span>
          <button
            onClick={() => toggleSaved(guide.id)}
            className="tap-flat ml-auto inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 font-semibold text-foreground"
          >
            {saved ? <BookmarkCheck className="size-3.5 text-primary" /> : <Bookmark className="size-3.5" />}
            {saved ? "Saved" : "Save"}
          </button>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{guide.intro}</p>

        {/* TL;DR */}
        <div className="mt-5 rounded-2xl border border-border bg-card p-4 shadow-card">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            The short version
          </p>
          <ul className="mt-2 space-y-1.5">
            {guide.tldr.map((t) => (
              <li key={t} className="flex gap-2 text-[13px] leading-snug">
                <span className="text-primary">•</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Sections */}
        <div className="mt-8 space-y-8">
          {guide.sections.map((s, si) => (
            <section key={s.heading}>
              <h2 className="text-[17px] font-bold leading-tight tracking-tight">{s.heading}</h2>
              <div className="mt-3 space-y-3.5">
                {s.blocks.map((b, bi) => (
                  <GuideBlockView
                    key={`${si}-${bi}`}
                    block={b}
                    checked={b.kind === "checklist" ? prefs.checks[`${guide.id}:${b.id}`] ?? [] : undefined}
                    onCheck={
                      b.kind === "checklist"
                        ? (index) => toggleCheck(`${guide.id}:${b.id}`, index)
                        : undefined
                    }
                  />
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Useful? */}
        <div className="mt-9 flex items-center gap-3 rounded-2xl bg-muted px-4 py-3">
          <p className="flex-1 text-[12.5px] font-semibold">
            {verdict === "yes"
              ? "Glad it helped."
              : verdict === "no"
                ? "Noted — we'll rewrite this one."
                : "Was this useful?"}
          </p>
          <button
            onClick={() => rate(guide.id, "yes")}
            aria-label="Useful"
            className={`tap-flat rounded-full bg-card p-2 ${verdict === "yes" ? "text-primary" : "text-muted-foreground"}`}
          >
            <ThumbsUp className="size-4" />
          </button>
          <button
            onClick={() => rate(guide.id, "no")}
            aria-label="Not useful"
            className={`tap-flat rounded-full bg-card p-2 ${verdict === "no" ? "text-destructive" : "text-muted-foreground"}`}
          >
            <ThumbsDown className="size-4" />
          </button>
        </div>
      </article>

      <section className="mt-9 px-5">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {related.length ? `More on ${categoryLabel(guide.category).toLowerCase()}` : "More guides"}
        </h2>
        <div className="mt-1 divide-y divide-border">
          {more.map((g) => (
            <Link key={g.id} to="/guides/$id" params={{ id: g.id }} className="tap-flat flex items-start gap-3 py-4">
              <span className="text-lg leading-none">{g.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold leading-tight">{g.title}</p>
                <p className="mt-0.5 line-clamp-1 text-[12px] text-muted-foreground">{g.blurb}</p>
              </div>
            </Link>
          ))}
        </div>
        <Link to="/guides" className="tap-flat mt-4 inline-block text-[12px] font-semibold text-primary">
          All guides
        </Link>
      </section>

      <div className="pb-12" />
    </AppShell>
  );
}
