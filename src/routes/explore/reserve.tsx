import { createFileRoute } from "@tanstack/react-router";
import { PartnerHandoff } from "@/components/PartnerHandoff";

export const Route = createFileRoute("/explore/reserve")({
  head: () => ({
    meta: [
      { title: "Booking restaurants in Israel · Shekk" },
      {
        name: "description",
        content:
          "How to book restaurants and Shabbat meals in Israel, which apps take reservations, and what deposits to expect. Booking is not part of Shekk yet.",
      },
      { property: "og:title", content: "Booking restaurants in Israel · Shekk" },
      {
        property: "og:description",
        content: "Reservation apps, deposits and Shabbat timing for eating out in Israel.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ReserveScreen,
});

function ReserveScreen() {
  return (
    <PartnerHandoff
      title="Table booking"
      headline="Shekk can't hold a table for you yet"
      blurb="Restaurant reservations and deposits are handled by the restaurants' own systems. We would rather point you at the real thing than take a deposit we can't honour."
      partners={[
        {
          name: "Ontopo",
          emoji: "📅",
          blurb: "The main Israeli reservation platform. Most good Tel Aviv and Jerusalem places are on it.",
          cost: "Free",
          url: "https://ontopo.com/en/il",
        },
        {
          name: "Tabit",
          emoji: "🍷",
          blurb: "Used by many chains and hotel restaurants, and for pre-ordering at the table.",
          url: "https://tabitisrael.co.il/",
        },
        {
          name: "Google Maps",
          emoji: "📍",
          blurb: "For everything smaller, the phone number on the listing is still the fastest route.",
          url: "https://maps.google.com/",
        },
      ]}
      tips={[
        "Large groups for Thursday night or Motzei Shabbat need a week's notice in Jerusalem.",
        "Some restaurants take a card deposit per head for groups over eight — ask before you commit the group.",
        "Service is often not included. 12% is normal, 15% for a big group that stayed a while.",
        "Check kashrut on the restaurant's own page; aggregator badges go out of date.",
      ]}
    />
  );
}
