import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { searchApp } from "@/lib/search";
import { ServiceLogo } from "@/components/ServiceLogo";
import { recordServiceUse } from "@/lib/recents";

/** App-wide search: apps, folders and screens, from anywhere. */
export function GlobalSearch({ placeholder = "Search apps, guides and services" }: { placeholder?: string }) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchApp(query), [query]);
  const open = query.trim().length > 0;

  return (
    <div className="relative">
      <label className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm shadow-card">
        <Search className="size-4 shrink-0 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          aria-label="Search Shekk"
          className="w-full min-w-0 bg-transparent outline-none placeholder:text-muted-foreground"
        />
        {open ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => setQuery("")}
            className="tap-flat shrink-0 text-muted-foreground"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </label>

      {open ? (
        <div className="absolute inset-x-0 top-full z-30 mt-2 max-h-[60vh] overflow-y-auto rounded-2xl border border-border bg-card shadow-lift">
          {results.length === 0 ? (
            <p className="px-4 py-4 text-sm text-muted-foreground">
              Nothing matches “{query.trim()}” yet.
            </p>
          ) : (
            results.map((r) => (
              <Link
                key={r.id}
                to={r.to}
                params={r.params as never}
                onClick={() => {
                  if (r.service) recordServiceUse(r.service.id);
                  setQuery("");
                }}
                className="tap-flat flex items-center gap-3 border-b border-border px-3 py-2.5 last:border-b-0"
              >
                {r.service ? (
                  <ServiceLogo service={r.service} size={36} className="rounded-xl" />
                ) : (
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-lg">
                    {r.emoji}
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{r.title}</span>
                  <span className="block truncate text-[11px] text-muted-foreground">{r.subtitle}</span>
                </span>
                <span className="shrink-0 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                  {r.kind === "page" ? "screen" : r.kind === "category" ? "section" : "app"}
                </span>
              </Link>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
