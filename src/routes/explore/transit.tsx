import { createFileRoute } from "@tanstack/react-router";
import { PartnerHandoff } from "@/components/PartnerHandoff";

export const Route = createFileRoute("/explore/transit")({
  head: () => ({
    meta: [
      { title: "Buses, trains and Rav-Kav · Shekk" },
      {
        name: "description",
        content:
          "How public transport works in Israel: Rav-Kav, student discounts, intercity trains and the apps that sell tickets. Ticketing is not part of Shekk yet.",
      },
      { property: "og:title", content: "Buses, trains and Rav-Kav · Shekk" },
      {
        property: "og:description",
        content: "Rav-Kav, student fares and the transport apps to install before you land.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TransitScreen,
});

function TransitScreen() {
  return (
    <PartnerHandoff
      title="Buses & trains"
      headline="Shekk doesn't sell transport tickets yet"
      blurb="Israeli fares are tied to your Rav-Kav account, which we can't top up on your behalf today. Here is exactly how to set it up and pay, plus the student discount most people miss."
      partners={[
        {
          name: "Rav-Kav Online",
          emoji: "💳",
          blurb: "Official app: load your Rav-Kav, buy monthly passes and check your balance.",
          cost: "Free app",
          url: "https://ravkavonline.co.il/en/",
        },
        {
          name: "Moovit",
          emoji: "🧭",
          blurb: "Best live bus and light rail times. What locals actually plan journeys with.",
          cost: "Free",
          url: "https://moovitapp.com/",
        },
        {
          name: "Israel Railways",
          emoji: "🚆",
          blurb: "Intercity trains — Jerusalem to Tel Aviv in about 30 minutes.",
          cost: "From ₪16",
          url: "https://www.rail.co.il/en",
        },
      ]}
      tips={[
        "Get a personalised Rav-Kav with your photo. Anonymous cards can't hold student or monthly discounts.",
        "A single fare is usually ₪5.50–₪12 and includes 90 minutes of transfers on the same journey.",
        "Students on a recognised programme can often register for a 50% discount — ask your madrich for the paperwork.",
        "Nothing runs from Friday afternoon to Saturday night except sherut taxis in some cities.",
      ]}
    />
  );
}
