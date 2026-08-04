import { createFileRoute } from "@tanstack/react-router";
import { AppShell, ScreenHeader } from "@/components/AppShell";
import { IdfExplorer } from "@/components/army/IdfExplorer";
import { TrackGuidance } from "@/components/official/TrackGuidance";
import { getTrack, type OfficialTrack } from "@/lib/official-content";

export const Route = createFileRoute("/explore/army")({
  head: () => ({
    meta: [
      { title: "Explore the IDF · Shekk" },
      {
        name: "description",
        content:
          "Browse IDF branches and units, save the ones you want to compare, then read the service-track guidance underneath — Mahal, Garin Tzabar, Hesder, tzav rishon and gius.",
      },
      { property: "og:title", content: "Explore the IDF · Shekk" },
      {
        property: "og:description",
        content: "Branches, units and pathways you can actually explore — with the paperwork underneath.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ArmyApp,
});

function ArmyApp() {
  const track = getTrack("army") as OfficialTrack;
  return (
    <AppShell>
      <ScreenHeader title="Army" back="/israel" />
      <IdfExplorer />
      <div className="pt-8">
        <TrackGuidance track={track} />
      </div>
    </AppShell>
  );
}
