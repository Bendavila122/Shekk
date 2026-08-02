import { createFileRoute } from "@tanstack/react-router";
import { TrackApp } from "@/components/official/TrackApp";
import { getTrack, type OfficialTrack } from "@/lib/official-content";

export const Route = createFileRoute("/explore/uni")({
  head: () => ({
    meta: [
      { title: "Uni & study · Shekk" },
      {
        name: "description",
        content:
          "Masa, mechina and one-year programs, international schools, credit transfer home, transcripts, ulpan levels and tuition timing.",
      },
      { property: "og:title", content: "Uni & study · Shekk" },
      {
        property: "og:description",
        content: "Studying in Israel and getting the credits to count back home.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: UniApp,
});

function UniApp() {
  return <TrackApp track={getTrack("university") as OfficialTrack} />;
}
