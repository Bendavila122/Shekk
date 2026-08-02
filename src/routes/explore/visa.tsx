import { createFileRoute } from "@tanstack/react-router";
import { TrackApp } from "@/components/official/TrackApp";
import { getTrack, type OfficialTrack } from "@/lib/official-content";

export const Route = createFileRoute("/explore/visa")({
  head: () => ({
    meta: [
      { title: "Visa & status · Shekk" },
      {
        name: "description",
        content:
          "The A/2 student visa, B/2 entry, extensions at Misrad HaPnim, fees, what to bring and what happens if you overstay.",
      },
      { property: "og:title", content: "Visa & status · Shekk" },
      {
        property: "og:description",
        content: "Student visas, extensions and re-entry for a gap year in Israel, step by step.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: VisaApp,
});

function VisaApp() {
  return <TrackApp track={getTrack("visa") as OfficialTrack} />;
}
