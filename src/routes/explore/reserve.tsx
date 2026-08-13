import { createFileRoute } from "@tanstack/react-router";
import { PlannedApp } from "@/components/PlannedApp";

export const Route = createFileRoute("/explore/reserve")({
  head: () => ({
    meta: [
      { title: "Reserve · Shekk" },
      {
        name: "description",
        content:
          "Tables and Shabbaton bookings inside Shekk, planned on Ontopo and Tabit. See what it will do and what it depends on.",
      },
      { property: "og:title", content: "Reserve · Shekk" },
      { property: "og:description", content: "How Shekk will handle restaurant and Shabbaton reservations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <PlannedApp id="reserve" />,
});
