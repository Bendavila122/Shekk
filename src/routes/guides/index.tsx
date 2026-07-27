import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { GUIDES } from "@/lib/guides";

export const Route = createFileRoute("/guides/")({
  head: () => ({
    meta: [
      { title: "Guides & tips · Shekk" },
      {
        name: "description",
        content:
          "Short, practical gap-year guides: Rav-Kav, Shabbat timing, paying like a local, first-week admin, health and tiyulim.",
      },
      { property: "og:title", content: "Guides & tips · Shekk" },
      { property: "og:description", content: "Practical how-tos for your year in Israel, written for students." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: GuidesIndex,
});

function GuidesIndex() {
  return (
    <AppShell>
      <header className="px-5 pt-7">
        <h1 className="font-display text-4xl font-bold tracking-tight">Guides & tips</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Two-minute reads on the stuff nobody explains before you land.
        </p>
      </header>

      <div className="divide-y divide-border px-5 pt-6">
        {GUIDES.map((g) => (
          <Link
            key={g.id}
            to="/guides/$id"
            params={{ id: g.id }}
            className="tap-flat flex items-start gap-3 py-5"
          >
            <span className="mt-0.5 text-xl leading-none">{g.emoji}</span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {g.kicker} · {g.readMins} min read
              </p>
              <h2 className="mt-0.5 text-[15px] font-bold leading-tight">{g.title}</h2>
              <p className="mt-1 text-[12px] leading-snug text-muted-foreground">{g.blurb}</p>
            </div>
            <ArrowRight className="mt-6 size-4 shrink-0 text-muted-foreground" />
          </Link>
        ))}
      </div>

      <div className="pb-10" />
    </AppShell>
  );
}
