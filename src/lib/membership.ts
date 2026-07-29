/** Shekk Membership — Free and Premium, in the Amex benefits idiom. */

export type TierId = "free" | "premium";

export type Tier = {
  id: TierId;
  name: string;
  price: string;
  cadence: string;
  tagline: string;
  perks: { icon: string; title: string; detail: string }[];
};

export const TIERS: Tier[] = [
  {
    id: "free",
    name: "Shekk",
    price: "Free",
    cadence: "forever",
    tagline: "Land in Israel with the basics sorted.",
    perks: [
      { icon: "🇮🇱", title: "Israel guides", detail: "Rav-Kav, banking, visas, Shabbat — written for newcomers." },
      { icon: "🧭", title: "Explore", detail: "Every Israeli app you need, in one place." },
      { icon: "👥", title: "Community", detail: "Cohort threads, friends and split-a-bill." },
      { icon: "🎟️", title: "Basic offers", detail: "A rotating handful of partner discounts." },
      { icon: "₪", title: "Shekk account", detail: "Hold shekels, add money and pay friends." },
    ],
  },
  {
    id: "premium",
    name: "Shekk+",
    price: "£9.99",
    cadence: "per month",
    tagline: "The card, the benefits and someone to call.",
    perks: [
      { icon: "💳", title: "Shekk Card", detail: "Mastercard for Israel, in Apple Pay from day one." },
      { icon: "🏷️", title: "Full benefits marketplace", detail: "Every partner offer unlocked, including members-only rates." },
      { icon: "💱", title: "Better conversion", detail: "Member rates when you add money in another currency." },
      { icon: "🎫", title: "Member events", detail: "Shabbatonim, tiyulim and city nights at member pricing." },
      { icon: "🎓", title: "Student deals", detail: "Gyms, courses, Hebrew lessons and travel at student rates." },
      { icon: "☎️", title: "Concierge", detail: "A real person for landlord, doctor and bureaucracy problems." },
    ],
  },
];

export const tier = (id: TierId) => TIERS.find((t) => t.id === id) ?? TIERS[0];

/** Headline comparison rows for the tier table. */
export const COMPARISON: { label: string; free: string; premium: string }[] = [
  { label: "Shekk shekel account", free: "Included", premium: "Included" },
  { label: "Shekk Mastercard", free: "—", premium: "Included" },
  { label: "Apple Pay & Google Wallet", free: "—", premium: "Included" },
  { label: "Currency conversion margin", free: "3.0%", premium: "1.2%" },
  { label: "Partner offers", free: "Basic", premium: "Everything" },
  { label: "Member events", free: "Public pricing", premium: "Member pricing" },
  { label: "Concierge support", free: "—", premium: "7 days a week" },
];
