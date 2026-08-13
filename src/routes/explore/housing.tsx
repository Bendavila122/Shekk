import { createFileRoute } from "@tanstack/react-router";
import { PlannedApp } from "@/components/PlannedApp";

export const Route = createFileRoute("/explore/housing")({
  head: () => ({
    meta: [
      { title: "Housing · Shekk" },
      {
        name: "description",
        content:
          "Rooms, dira hunting and deposits for students in Israel. See how Shekk will source verified listings and what it depends on.",
      },
      { property: "og:title", content: "Housing · Shekk" },
      { property: "og:description", content: "How Shekk will run verified student housing listings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <PlannedApp id="housing" />,
});
