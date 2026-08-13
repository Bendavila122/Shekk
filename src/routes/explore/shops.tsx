import { createFileRoute } from "@tanstack/react-router";
import { PlannedApp } from "@/components/PlannedApp";

export const Route = createFileRoute("/explore/shops")({
  head: () => ({
    meta: [
      { title: "Shops · Shekk" },
      {
        name: "description",
        content:
          "Student discounts that apply themselves. Planned on affiliate networks and direct chain agreements — see the plan and what it depends on.",
      },
      { property: "og:title", content: "Shops · Shekk" },
      { property: "og:description", content: "How Shekk will run student discounts, and what has to be signed first." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <PlannedApp id="shops" />,
});
