import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { AppShell, Card, ScreenHeader } from "@/components/AppShell";
import { SHULS } from "@/lib/mock";

export const Route = createFileRoute("/explore/community")({
  head: () => ({
    meta: [
      { title: "Community · Shekk" },
      { name: "description", content: "Shul finder, candle-lighting times, Chabad and Aish calendars, and the Shekk siddur." },
      { property: "og:title", content: "Community · Shekk" },
      { property: "og:description", content: "Zmanim, shuls and community events wherever you are in Israel." },
    ],
  }),
  component: Community,
});

function Community() {
  return (
    <AppShell>
      <ScreenHeader title="Community" subtitle="Jerusalem · today" />
      <div className="space-y-4 px-4 py-4">
        <div className="grid grid-cols-3 gap-2">
          {[
            { l: "Candle lighting", v: "16:38" },
            { l: "Shabbat ends", v: "17:52" },
            { l: "Parsha", v: "Bo" },
          ].map((z) => (
            <Card key={z.l} className="text-center">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{z.l}</p>
              <p className="font-display text-lg font-bold">{z.v}</p>
            </Card>
          ))}
        </div>

        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Near you</h2>
          <div className="space-y-2">
            {SHULS.map((s) => (
              <Card key={s.id} className="flex items-center gap-3">
                <span className="text-2xl">{s.emoji}</span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{s.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{s.detail}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <Link to="/siddur" className="tap block">
          <Card className="flex items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-muted text-xl">📖</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">Siddur</p>
              <p className="truncate text-xs text-muted-foreground">
                Nusach Ashkenaz · Sephard · Edot HaMizrach — Hebrew & English
              </p>
            </div>
            <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
          </Card>
        </Link>
      </div>
    </AppShell>
  );
}
