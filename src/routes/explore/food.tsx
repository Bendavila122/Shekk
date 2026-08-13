import { createFileRoute } from "@tanstack/react-router";
import { PlannedApp } from "@/components/PlannedApp";

export const Route = createFileRoute("/explore/food")({
  head: () => ({
    meta: [
      { title: "Food · Shekk" },
      {
        name: "description",
        content:
          "Kosher-aware delivery inside Shekk, paid from your balance. Planned on Wolt and 10bis — see what it will do and what it depends on.",
      },
      { property: "og:title", content: "Food · Shekk" },
      { property: "og:description", content: "How Shekk will integrate kosher food delivery, and what it depends on." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <PlannedApp id="food" />,
});
