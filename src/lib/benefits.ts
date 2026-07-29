/**
 * Shekk Benefits — the Amex-style offers marketplace behind Explore.
 * Every offer is a mock partner deal with a real Israeli brand domain so the
 * logo lookup resolves.
 */

export type BenefitCategoryId = "food" | "transport" | "lifestyle" | "travel" | "education";

export type Benefit = {
  id: string;
  category: BenefitCategoryId;
  brand: string;
  /** Domain used for the brand mark. */
  domain?: string;
  emoji: string;
  headline: string;
  detail: string;
  location: string;
  discount: string;
  /** Premium members only. */
  premium?: boolean;
  /** How it is redeemed once tapped. */
  redemption: string;
  expires: string;
};

export const BENEFIT_CATEGORIES: {
  id: BenefitCategoryId;
  label: string;
  emoji: string;
  blurb: string;
}[] = [
  { id: "food", label: "Food", emoji: "🍽️", blurb: "Restaurants, cafés and kosher spots" },
  { id: "transport", label: "Transport", emoji: "🚆", blurb: "Gett, Rav-Kav and the railway" },
  { id: "lifestyle", label: "Lifestyle", emoji: "🏋️", blurb: "Gyms, shopping and experiences" },
  { id: "travel", label: "Travel", emoji: "🏜️", blurb: "Hotels, tours and weekend trips" },
  { id: "education", label: "Education", emoji: "📚", blurb: "Hebrew lessons and courses" },
];

export const BENEFITS: Benefit[] = [
  // Food
  {
    id: "wolt-first",
    category: "food",
    brand: "Wolt",
    domain: "wolt.com",
    emoji: "🛵",
    headline: "₪30 off your first three Wolt orders",
    detail: "Applies to any kosher-filtered restaurant on Wolt when you pay with Shekk.",
    location: "Nationwide",
    discount: "₪30 × 3",
    redemption: "Auto-applied at Wolt checkout inside Shekk.",
    expires: "Ongoing",
  },
  {
    id: "rimon",
    category: "food",
    brand: "Café Rimon",
    domain: "rimon.net.co.il",
    emoji: "☕️",
    headline: "20% off breakfast before 11:00",
    detail: "Sit-down breakfast at the Mamilla and Ben Yehuda branches, weekdays only.",
    location: "Jerusalem · 2 branches",
    discount: "20%",
    redemption: "Show the Shekk code at the till.",
    expires: "31 Dec",
  },
  {
    id: "marzipan",
    category: "food",
    brand: "Marzipan Bakery",
    emoji: "🥐",
    domain: "marzipanbakery.co.il",
    headline: "Free rugelach box over ₪60",
    detail: "The Machane Yehuda classic — one box per member per week.",
    location: "Machane Yehuda, Jerusalem",
    discount: "Free item",
    redemption: "Scan your Shekk code in store.",
    expires: "Ongoing",
  },
  {
    id: "ontopo",
    category: "food",
    brand: "Ontopo",
    domain: "ontopo.com",
    emoji: "📖",
    headline: "Members-only tables at 40+ Tel Aviv restaurants",
    detail: "Held tables released to Shekk+ at 18:00 the day before.",
    location: "Tel Aviv · Jerusalem",
    discount: "Priority booking",
    premium: true,
    redemption: "Book through Reserve inside Shekk.",
    expires: "Ongoing",
  },

  // Transport
  {
    id: "gett-rides",
    category: "transport",
    brand: "Gett",
    domain: "gett.com",
    emoji: "🚕",
    headline: "25% off your first five Gett rides",
    detail: "Capped at ₪20 per ride, anywhere in Israel.",
    location: "Nationwide",
    discount: "25%",
    redemption: "Applied automatically when you book in Shekk.",
    expires: "First 30 days",
  },
  {
    id: "ravkav-student",
    category: "transport",
    brand: "Rav-Kav",
    domain: "ravkavonline.co.il",
    emoji: "🎫",
    headline: "Student profile loaded free",
    detail: "We handle the student discount registration so your fares drop by half.",
    location: "Nationwide",
    discount: "Up to 50% fares",
    redemption: "Start from Transit inside Shekk.",
    expires: "Ongoing",
  },
  {
    id: "rail-weekend",
    category: "transport",
    brand: "Israel Railways",
    domain: "rail.co.il",
    emoji: "🚆",
    headline: "15% off intercity tickets on Sundays and Thursdays",
    detail: "The two days everyone travels — Jerusalem, Tel Aviv, Haifa, Be'er Sheva.",
    location: "Nationwide",
    discount: "15%",
    premium: true,
    redemption: "Discount shown at ticket selection.",
    expires: "Ongoing",
  },
  {
    id: "goto",
    category: "transport",
    brand: "Go-To",
    domain: "go-to.global",
    emoji: "🚙",
    headline: "60 free minutes on car and scooter sharing",
    detail: "Split however you like across your first month.",
    location: "Tel Aviv · Jerusalem · Haifa",
    discount: "60 min free",
    redemption: "Credited when you link Go-To in Shekk.",
    expires: "First month",
  },

  // Lifestyle
  {
    id: "holmes",
    category: "lifestyle",
    brand: "Holmes Place",
    domain: "holmesplace.co.il",
    emoji: "🏋️",
    headline: "15% off your first month at selected gyms",
    detail: "No joining fee and a month-to-month contract for gap-year students.",
    location: "12 branches nationwide",
    discount: "15%",
    redemption: "Generate a member voucher in Shekk.",
    expires: "31 Mar",
  },
  {
    id: "castro",
    category: "lifestyle",
    brand: "Castro",
    domain: "castro.com",
    emoji: "🛍️",
    headline: "10% off in store and online",
    detail: "Stacks with seasonal sales — the one discount that usually does.",
    location: "Nationwide",
    discount: "10%",
    redemption: "Show the Shekk code at the till.",
    expires: "Ongoing",
  },
  {
    id: "cinemacity",
    category: "lifestyle",
    brand: "Cinema City",
    domain: "cinema-city.co.il",
    emoji: "🎬",
    headline: "Two tickets for ₪60 on motzei Shabbat",
    detail: "Includes the Jerusalem and Rishon branches.",
    location: "Jerusalem · Rishon LeZion",
    discount: "2 for ₪60",
    premium: true,
    redemption: "Book through Events inside Shekk.",
    expires: "Ongoing",
  },
  {
    id: "eventbuzz",
    category: "lifestyle",
    brand: "Eventbuzz",
    domain: "eventbuzz.co.il",
    emoji: "🎫",
    headline: "Member pricing on Shabbatonim and city nights",
    detail: "Typically ₪40–₪90 below public tickets on partner events.",
    location: "Nationwide",
    discount: "Member rate",
    premium: true,
    redemption: "Member price shows automatically at checkout.",
    expires: "Ongoing",
  },

  // Travel
  {
    id: "isrotel",
    category: "travel",
    brand: "Isrotel",
    domain: "isrotel.com",
    emoji: "🏨",
    headline: "12% off midweek stays in Eilat and the Dead Sea",
    detail: "Sunday to Thursday, breakfast included, two rooms per booking.",
    location: "Eilat · Dead Sea",
    discount: "12%",
    premium: true,
    redemption: "Member rate code issued in Shekk.",
    expires: "Low season",
  },
  {
    id: "abraham",
    category: "travel",
    brand: "Abraham Tours",
    domain: "abrahamtours.com",
    emoji: "🏜️",
    headline: "₪75 off Masada sunrise and Negev day trips",
    detail: "The tiyul everyone does, minus the queue at the desk.",
    location: "Departs Jerusalem & Tel Aviv",
    discount: "₪75",
    redemption: "Book with your Shekk member code.",
    expires: "Ongoing",
  },
  {
    id: "hostels",
    category: "travel",
    brand: "Israel Hostels",
    domain: "hostels.org.il",
    emoji: "🛏️",
    headline: "10% off weekend beds in Tzfat and the north",
    detail: "For cohort trips — group bookings of four or more.",
    location: "Tzfat · Galilee · Golan",
    discount: "10%",
    redemption: "Show your member card at check-in.",
    expires: "Ongoing",
  },

  // Education
  {
    id: "ulpan",
    category: "education",
    brand: "Ulpan La-Inyan",
    domain: "ulpan.com",
    emoji: "🗣️",
    headline: "First month of Hebrew lessons half price",
    detail: "Evening classes and online tracks, beginner through intermediate.",
    location: "Jerusalem · Tel Aviv · Online",
    discount: "50%",
    redemption: "Enrol with the Shekk member code.",
    expires: "Rolling intake",
  },
  {
    id: "nefesh",
    category: "education",
    brand: "Aliyah advice",
    domain: "nbn.org.il",
    emoji: "📋",
    headline: "Free one-to-one session on studying and staying",
    detail: "Visas, student status, army deferral and the paperwork order of operations.",
    location: "Online · Jerusalem",
    discount: "Free session",
    redemption: "Book a slot from your Shekk membership page.",
    expires: "Ongoing",
  },
  {
    id: "coursera",
    category: "education",
    brand: "Skill courses",
    domain: "coursera.org",
    emoji: "💻",
    headline: "Two months of course access on Shekk",
    detail: "For members building a CV while they're out here.",
    location: "Online",
    discount: "2 months free",
    premium: true,
    redemption: "Redeem the code from your membership page.",
    expires: "While stocks last",
  },
];

export const benefitsIn = (category: BenefitCategoryId) => BENEFITS.filter((b) => b.category === category);
export const benefit = (id: string) => BENEFITS.find((b) => b.id === id);
