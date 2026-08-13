import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { Card } from "@/components/AppShell";
import { PlannedApp } from "@/components/PlannedApp";
import { useLocation } from "@/lib/location";
import { useJewish } from "@/lib/live";

export const Route = createFileRoute("/explore/community")({
  head: () => ({
    meta: [
      { title: "Community · Shekk" },
      {
        name: "description",
        content:
          "Live candle lighting, Shabbat end and this week's parasha for your city — plus how Shekk's shul directory will work.",
      },
      { property: "og:title", content: "Community · Shekk" },
      { property: "og:description", content: "Real zmanim wherever you are, and the plan for the shul directory." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Community,
});

/** Live zmanim from the same Hebcal source the Jewish Life widget uses. */
function Zmanim() {
  const { place } = useLocation();
  const { data, isPending } = useJewish(place);

  const cells = [
    { l: "Candle lighting", v: data?.candle ?? null },
    { l: "Shabbat ends", v: data?.havdalah ?? null },
    { l: "Parasha", v: data?.sedra ?? null },
  ];

  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between px-1">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">This week</h2>
        <span className="text-[11px] text-muted-foreground">{place?.city ?? "Set your city"}</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {cells.map((z) => (
          <Card key={z.l} className="text-center">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{z.l}</p>
            <p className="font-display text-lg font-bold">
              {isPending ? "…" : (z.v ?? "—")}
            </p>
          </Card>
        ))}
      </div>
      {data?.hebrewDate ? (
        <p className="mt-2 px-1 text-[11px] text-muted-foreground">
          {data.hebrewDate}
          {data.schemeNote ? ` · ${data.schemeNote}` : ""}
        </p>
      ) : null}

      <Link to="/siddur" className="tap mt-3 block">
        <Card className="flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-muted text-xl">📖</span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Siddur</p>
            <p className="truncate text-xs text-muted-foreground">
              Nusach Ashkenaz · Sephard · Edot HaMizrach — Hebrew &amp; English
            </p>
          </div>
          <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
        </Card>
      </Link>
    </section>
  );
}

function Community() {
  return (
    <PlannedApp id="community">
      <Zmanim />
    </PlannedApp>
  );
}
