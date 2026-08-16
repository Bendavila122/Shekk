import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, RefreshCw } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useNews } from "@/lib/news";
import { NEWS_SOURCES, relativeTime, type NewsItem, type NewsSourceId } from "@/lib/news-types";

export const Route = createFileRoute("/news")({
  head: () => ({
    meta: [
      { title: "Israel news · Shekk" },
      {
        name: "description",
        content:
          "Live English headlines from Times of Israel, Jerusalem Post, Ynetnews and Arutz Sheva — the news your year in Israel actually runs on.",
      },
      { property: "og:title", content: "Israel news · Shekk" },
      {
        property: "og:description",
        content: "Live English-language Israeli headlines, merged from four sources and updated all day.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NewsPage,
});

function Headline({ item }: { item: NewsItem }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="tap-flat flex items-start gap-3 py-4"
    >
      {item.image ? (
        <img
          src={item.image}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          className="size-16 shrink-0 rounded-xl bg-muted object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      ) : null}
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {item.sourceName} · {relativeTime(item.publishedAt)}
          {item.urgent ? (
            <span className="ml-2 rounded-full bg-destructive/10 px-2 py-0.5 text-[9px] font-bold tracking-normal text-destructive">
              LIVE
            </span>
          ) : null}
        </p>
        <h2 className="mt-1 text-[15px] font-semibold leading-snug">{item.title}</h2>
      </div>
      <ExternalLink className="mt-6 size-3.5 shrink-0 text-muted-foreground" />
    </a>
  );
}

function NewsPage() {
  const news = useNews();
  const [source, setSource] = useState<NewsSourceId | "all">("all");

  const items = news.data?.items ?? [];
  const urgent = items.filter((n) => n.urgent).slice(0, 4);
  const filtered = source === "all" ? items : items.filter((n) => n.source === source);

  return (
    <AppShell>
      <header className="px-5 pt-7">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-display text-4xl font-bold tracking-tight">Israel news</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              English headlines from four Israeli newsrooms, newest first.
            </p>
          </div>
          <button
            onClick={() => news.refetch()}
            className="tap mt-1 rounded-full bg-muted p-2.5"
            aria-label="Refresh headlines"
          >
            <RefreshCw className={`size-4 ${news.isFetching ? "animate-spin" : ""}`} />
          </button>
        </div>
        {news.data ? (
          <p className="mt-2 text-[11px] text-muted-foreground">
            Updated {relativeTime(news.data.fetchedAt)}
            {news.data.failed.length ? ` · ${news.data.failed.length} source unavailable` : ""}
          </p>
        ) : null}
      </header>

      {urgent.length ? (
        <section className="px-5 pt-5">
          <div className="rounded-[1.25rem] border border-destructive/25 bg-destructive/5 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-destructive">Developing</p>
            <ul className="mt-2 space-y-2.5">
              {urgent.map((n) => (
                <li key={n.id}>
                  <a
                    href={n.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tap-flat block text-[13px] font-semibold leading-snug"
                  >
                    {n.title}
                    <span className="ml-1 text-[11px] font-normal text-muted-foreground">
                      {n.sourceName} · {relativeTime(n.publishedAt)}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[11px] leading-snug text-muted-foreground">
              Press coverage, not an official Home Front Command alert. Always follow Pikud HaOref and your madrichim.
            </p>
          </div>
        </section>
      ) : null}

      <div className="scrollbar-none mt-5 flex gap-2 overflow-x-auto px-5 pb-1">
        {[{ id: "all" as const, short: "All" }, ...NEWS_SOURCES].map((s) => (
          <button
            key={s.id}
            onClick={() => setSource(s.id as NewsSourceId | "all")}
            className={`tap shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold ${
              source === s.id ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
            }`}
          >
            {"name" in s ? s.name : s.short}
          </button>
        ))}
      </div>

      {news.isPending ? (
        <div className="space-y-3 px-5 pt-6">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="shimmer h-16 rounded-2xl bg-muted" />
          ))}
        </div>
      ) : news.isError ? (
        <div className="px-5 pt-6">
          <ErrorState
            body="We couldn't reach the news feeds just now."
            onRetry={() => void news.refetch()}
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="px-5 pt-8 text-sm text-muted-foreground">Nothing from this source right now.</div>
      ) : (
        <div className="divide-y divide-border px-5 pt-2">
          {filtered.map((n) => (
            <Headline key={n.id} item={n} />
          ))}
        </div>
      )}

      <p className="px-5 pt-6 text-[11px] leading-snug text-muted-foreground">
        Headlines link out to the original publishers. Shekk doesn't edit or host their articles.
      </p>

      <div className="pb-10" />
    </AppShell>
  );
}
