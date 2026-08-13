import { createFileRoute } from "@tanstack/react-router";
import { PlannedApp } from "@/components/PlannedApp";

export const Route = createFileRoute("/explore/transit")({
  head: () => ({
    meta: [
      { title: "Transit · Shekk" },
      {
        name: "description",
        content:
          "Buses, trains and Rav-Kav in one app. Planned on the Ministry of Transport GTFS feeds and Rav-Kav Online — see the plan.",
      },
      { property: "og:title", content: "Transit · Shekk" },
      { property: "og:description", content: "How Shekk will bring live bus times and Rav-Kav top-up into one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <PlannedApp id="transit" />,
});
