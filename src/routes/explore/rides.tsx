import { createFileRoute } from "@tanstack/react-router";
import { PlannedApp } from "@/components/PlannedApp";

export const Route = createFileRoute("/explore/rides")({
  head: () => ({
    meta: [
      { title: "Rides · Shekk" },
      {
        name: "description",
        content:
          "Taxis paid from your Shekk balance. The booking flow is built against Gett's API and waiting on live partner credentials.",
      },
      { property: "og:title", content: "Rides · Shekk" },
      { property: "og:description", content: "How Shekk will let you order a taxi and pay from your balance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <PlannedApp id="rides" />,
});
