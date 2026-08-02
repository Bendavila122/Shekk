import { createFileRoute } from "@tanstack/react-router";
import { TrackApp } from "@/components/official/TrackApp";
import { getTrack, type OfficialTrack } from "@/lib/official-content";

export const Route = createFileRoute("/explore/army")({
  head: () => ({
    meta: [
      { title: "Army & service · Shekk" },
      {
        name: "description",
        content:
          "Mahal, Garin Tzabar, Hesder and mechina, tzav rishon, gius dates and what a gap year does and doesn't commit you to.",
      },
      { property: "og:title", content: "Army & service · Shekk" },
      {
        property: "og:description",
        content: "The honest map of IDF service tracks for students on a gap year in Israel.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ArmyApp,
});

function ArmyApp() {
  return <TrackApp track={getTrack("army") as OfficialTrack} />;
}
