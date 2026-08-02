import { createFileRoute } from "@tanstack/react-router";
import { TrackApp } from "@/components/official/TrackApp";
import { getTrack, type OfficialTrack } from "@/lib/official-content";

export const Route = createFileRoute("/explore/lone-soldier")({
  head: () => ({
    meta: [
      { title: "Lone soldier support · Shekk" },
      {
        name: "description",
        content:
          "Chayal boded rights and payments, housing, laundry and food, chagim, leave, family visits and the help lines that answer in English.",
      },
      { property: "og:title", content: "Lone soldier support · Shekk" },
      {
        property: "og:description",
        content: "What a chayal boded is entitled to, and who to call for it.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LoneSoldierApp,
});

function LoneSoldierApp() {
  return <TrackApp track={getTrack("lone-soldier") as OfficialTrack} />;
}
