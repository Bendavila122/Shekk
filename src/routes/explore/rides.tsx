import { createFileRoute } from "@tanstack/react-router";
import { PartnerHandoff } from "@/components/PartnerHandoff";

export const Route = createFileRoute("/explore/rides")({
  head: () => ({
    meta: [
      { title: "Taxis and rides in Israel · Shekk" },
      {
        name: "description",
        content:
          "How taxis work in Israel: Gett, sherut, meters and typical fares. Booking and paying for rides through Shekk is not live yet.",
      },
      { property: "og:title", content: "Taxis and rides in Israel · Shekk" },
      {
        property: "og:description",
        content: "Gett, sherut taxis, meter rules and what a ride should actually cost.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RidesScreen,
});

function RidesScreen() {
  return (
    <PartnerHandoff
      title="Taxis & rides"
      headline="You can't book and pay for a ride in Shekk yet"
      blurb="Paying for taxis from your Shekk balance is in progress with our payment partner. Until it genuinely works, book in Gett — and use the fare guidance below so you don't get overcharged."
      partners={[
        {
          name: "Gett",
          emoji: "🚕",
          blurb: "The standard taxi app in Israel. Fixed price up front, card or cash.",
          cost: "₪25+ in-city",
          url: "https://gett.com/il/",
        },
        {
          name: "Yango",
          emoji: "🚙",
          blurb: "Often cheaper at busy times. Widely used in Tel Aviv and the centre.",
          url: "https://yango.com/en_il/",
        },
        {
          name: "Sherut (shared taxi)",
          emoji: "🚐",
          blurb: "Fixed-route minibuses. The only thing running on Shabbat in several cities.",
          cost: "From ₪7",
          url: "https://moovitapp.com/",
        },
      ]}
      tips={[
        "In a street taxi, ask for the meter — \"moneh, bevakasha\". A flat price offered before you get in is usually higher.",
        "There is a legal surcharge at night, on Shabbat and for luggage. It appears on the meter automatically.",
        "Ben Gurion to Jerusalem is roughly ₪280–₪350 by taxi; the train plus light rail is under ₪30.",
        "Airport taxis must use the official rank. Anyone approaching you inside the terminal is not it.",
      ]}
    />
  );
}
