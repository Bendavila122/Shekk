import { createFileRoute } from "@tanstack/react-router";
import { PartnerHandoff } from "@/components/PartnerHandoff";

export const Route = createFileRoute("/explore/food")({
  head: () => ({
    meta: [
      { title: "Food delivery in Israel · Shekk" },
      {
        name: "description",
        content:
          "How food delivery works in Israel, what it costs, and the apps students actually order with. Ordering is not part of Shekk yet.",
      },
      { property: "og:title", content: "Food delivery in Israel · Shekk" },
      {
        property: "og:description",
        content: "Delivery apps, typical prices and kashrut tips for students in Israel.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FoodScreen,
});

function FoodScreen() {
  return (
    <PartnerHandoff
      title="Food delivery"
      headline="You can't order food through Shekk yet"
      blurb="We are not going to fake a checkout. Ordering with your Shekk balance is planned, but for now here is what Israelis use, what it costs, and how to avoid the usual mistakes."
      partners={[
        {
          name: "Wolt",
          emoji: "🛴",
          blurb: "Widest coverage in Jerusalem and Tel Aviv. Clear kashrut labels and English menus.",
          cost: "₪10–20 delivery",
          url: "https://wolt.com/en/isr",
        },
        {
          name: "10bis",
          emoji: "🍽️",
          blurb: "The office and campus standard. Useful if your programme gives you a food card.",
          cost: "Varies",
          url: "https://www.10bis.co.il/",
        },
        {
          name: "Mishlocha",
          emoji: "🥙",
          blurb: "Stronger in smaller cities and religious neighbourhoods.",
          url: "https://www.mishloha.co.il/",
        },
      ]}
      tips={[
        "Delivery fees and a service charge are added at checkout — a ₪45 shawarma often lands closer to ₪60.",
        "Almost everything closes from Friday afternoon until Saturday night. Order Thursday if you want Shabbat food.",
        "Kosher certification is shown per restaurant, not per app. Check the badge on the restaurant page itself.",
        "Cash on delivery is still common outside the big cities — keep small notes.",
      ]}
    />
  );
}
