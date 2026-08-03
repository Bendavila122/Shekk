import { createFileRoute } from "@tanstack/react-router";
import { PartnerHandoff } from "@/components/PartnerHandoff";

export const Route = createFileRoute("/explore/shops")({
  head: () => ({
    meta: [
      { title: "Student discounts in Israel · Shekk" },
      {
        name: "description",
        content:
          "Where student discounts actually exist in Israel and how to claim them. Shekk does not apply discounts to purchases yet.",
      },
      { property: "og:title", content: "Student discounts in Israel · Shekk" },
      {
        property: "og:description",
        content: "The student discounts worth asking for in Israel, and how to prove you qualify.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Shops,
});

function Shops() {
  return (
    <PartnerHandoff
      title="Student discounts"
      headline="Shekk doesn't apply discounts at checkout yet"
      blurb="A partner discount programme is on the roadmap. Until it exists we won't show codes we can't honour — but these are the discounts genuinely available to programme participants in Israel."
      partners={[
        {
          name: "ISIC Israel",
          emoji: "🎫",
          blurb: "International student card, accepted at museums, some transport and chains.",
          cost: "~₪90/year",
          url: "https://www.isic.org/",
        },
        {
          name: "Rav-Kav student fare",
          emoji: "🚌",
          blurb: "Up to 50% off buses and trains once your programme status is registered.",
          url: "https://ravkavonline.co.il/en/",
        },
        {
          name: "Israel Nature & Parks",
          emoji: "🏞️",
          blurb: "Annual pass pays for itself in about three tiyulim.",
          cost: "From ₪150",
          url: "https://www.parks.org.il/en/",
        },
      ]}
      tips={[
        "Always ask: \"Yesh hanacha le'studentim?\" — many places have a discount that is never advertised.",
        "Your programme's own letter is often accepted where a foreign student card is not. Keep a photo of it in Documents.",
        "Museums in Jerusalem are frequently free or half price on specific weekdays — check before you pay full price.",
      ]}
    />
  );
}
