/**
 * The Shekk service catalogue.
 *
 * Principle: we integrate PLATFORMS and NETWORKS (Wolt, Gett, Moovit, Rav-Kav,
 * Israel Railways, Bit, Pango…), not individual venues. Restaurants, clubs,
 * hostels and shops arrive through their platform, so nobody has to sign up
 * merchant-by-merchant.
 */

import type { LinkProps } from "@tanstack/react-router";

export type ServiceStatus = "live" | "integrating" | "guide";

export type Service = {
  id: string;
  name: string;
  partner?: string;
  emoji: string;
  /** Real brand domain — used to render the partner's actual logo. */
  domain?: string;
  blurb: string;
  status: ServiceStatus;
  featured?: boolean; // one of the definitive five apps
  to?: LinkProps["to"]; // in-app deep flow when status === "live"
  detail?: string[];
};

export type ServiceCategory = {
  id: string;
  label: string;
  emoji: string;
  tagline: string;
  services: Service[];
};

export const STATUS_LABEL: Record<ServiceStatus, string> = {
  live: "Live in app",
  integrating: "Integrating",
  guide: "Guide",
};

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: "transit",
    label: "Getting around",
    emoji: "🚌",
    tagline: "Book a ride and pay from your Shekk balance.",
    services: [
      { id: "gett", name: "Gett", partner: "Gett", emoji: "🚕", domain: "gett.com", blurb: "Order a taxi, pay with Shekk", status: "live", featured: true, to: "/explore/rides", detail: ["The real Gett booking flow, running inside Shekk", "Fare settles straight from your Shekk balance"] },
    ],
  },
  {
    id: "eat",
    label: "Eating & going out",
    emoji: "🥙",
    tagline: "What to know until the ordering platforms are live.",
    services: [
      { id: "shuk", name: "Shuk guide", emoji: "🍅", blurb: "Machane Yehuda & Carmel, how to haggle", status: "guide", detail: ["Best days and hours to go", "What a fair price looks like", "Which stalls take card vs cash only"] },
    ],
  },
  {
    id: "nightlife",
    label: "Things to do",
    emoji: "🎟️",
    tagline: "Tiyulim, chesed and where students actually go.",
    services: [
      { id: "thingstodo", name: "Things to do", emoji: "🏜️", blurb: "Tiyulim, hikes, day trips", status: "guide" },
      { id: "fitness", name: "Fitness", emoji: "🏋️", blurb: "Gyms, classes, pools & courts near you", status: "live", featured: true, to: "/explore/fitness", detail: ["Nearby gyms, studios, pools, courts and clubs", "Typical prices, contract lengths and short-stay options", "Save a shortlist and compare before you sign"] },
      { id: "volunteer", name: "Volunteering", partner: "Yad Sarah · Leket", emoji: "🤝", blurb: "Chesed shifts near your program", status: "guide" },
    ],
  },
  {
    id: "living",
    label: "Living here",
    emoji: "🏠",
    tagline: "The boring stuff nobody explains to you.",
    services: [
      { id: "beenthere", name: "Been There", emoji: "🗺️", blurb: "Scratch-off map of Israel", status: "live", featured: true, to: "/explore/map", detail: ["Tap each area of the country to fill it in as visited", "Pins on the Kotel, Masada, Kinneret, Eilat and more", "History, photos and things to do for every place"] },
      { id: "maps", name: "Maps", emoji: "📍", blurb: "Everything around you, on one map", status: "live", featured: true, to: "/explore/maps", detail: ["Search any place, street or city in Israel", "Nearby food, coffee, pharmacies, cash, transit and sights", "Walking, bus and taxi times from where you're standing"] },
      { id: "arnona", name: "Arnona & taxes", partner: "Municipality", emoji: "🧾", blurb: "Council tax and student exemptions", status: "guide" },
      { id: "cash", name: "Cash & exchange", emoji: "💵", blurb: "How to get cash, what a fair rate is", status: "guide", detail: ["Shekk rate vs street changers", "Which ATMs skip the double conversion", "Where cash is still king (shuk, sherut, monit)"] },
    ],
  },
  {
    id: "health",
    label: "Health & safety",
    emoji: "🩺",
    tagline: "The stuff you hope you never need, one tap away.",
    services: [
      { id: "insurance", name: "Health cover", emoji: "🩺", blurb: "Your insurance card, one tap away", status: "live", featured: true, to: "/explore/health", detail: ["Maccabi, Harel, PassportCard, Cigna and more", "Member number in big type for the clinic desk", "Assistance line and 101 / 100 / 102 one tap away"] },
      { id: "hospitals", name: "Hospitals & clinics", partner: "Terem · Meuhedet", emoji: "🏥", blurb: "Nearest English-speaking care", status: "guide" },

      { id: "emergency", name: "Emergency services", partner: "MDA · Hatzalah", emoji: "🚨", blurb: "101 / 100 / 102, one tap", status: "guide", detail: ["MDA ambulance — 101", "Police — 100", "Fire — 102", "United Hatzalah — 1221"] },
      { id: "helplines", name: "Help lines", partner: "ERAN · Crisis Center", emoji: "☎️", blurb: "Mental health, in English", status: "guide" },
      { id: "safety", name: "Safety guides", emoji: "🛡️", blurb: "Sirens, shelters, what to do", status: "guide" },
      { id: "borders", name: "Border & area info", emoji: "🧱", blurb: "Checkpoints, closed areas, travel advice", status: "guide" },
    ],
  },
  {
    id: "admin",
    label: "Admin & official",
    emoji: "🛂",
    tagline: "Visas, army, and every form nobody explained.",
    services: [
      { id: "visa", name: "Visa & status", partner: "Misrad HaPnim", emoji: "🛂", blurb: "A/2 student visa, extensions, overstays", status: "live", featured: true, to: "/explore/visa", detail: ["A/2 student visa and B/2 entry, step by step", "Extensions at Misrad HaPnim: fees, hours, what to bring", "Your own checklist with due dates, saved to your account"] },
      { id: "army", name: "Army & service", partner: "IDF · Nefesh B'Nefesh", emoji: "🎖️", blurb: "Draft, Mahal, Garin Tzabar", status: "live", to: "/explore/army", detail: ["Mahal, Garin Tzabar, Hesder and mechina compared", "Tzav rishon, gius dates and the medical profile", "What a gap year does and doesn't commit you to"] },
      { id: "lonesoldier", name: "Lone soldier support", partner: "LSC", emoji: "🪖", blurb: "Rights, benefits, care packages", status: "live", to: "/explore/lone-soldier", detail: ["Chayal boded payments, housing and leave", "Lone Soldier Center, Michael Levin Base, FIDF", "Help lines that answer in English"] },
      { id: "uni", name: "Uni & study", emoji: "🎓", blurb: "Applications, credits transfer, tuition", status: "live", to: "/explore/uni", detail: ["Masa, mechina and one-year programs", "Credit transfer and transcripts for home", "Tuition timing and paying from Shekk"] },
      { id: "documents", name: "Documents", emoji: "🗂️", blurb: "Passport, visa and letters, private", status: "live", to: "/explore/documents", detail: ["Private storage only your account can open", "Passport page, visa sticker, acceptance letter, policy", "One tap away when an office asks"] },
    ],
  },
  {
    id: "community",
    label: "Jewish life",
    emoji: "🕍",
    tagline: "Your siddur, plus what's worth knowing.",
    services: [
      { id: "siddur", name: "Siddur", emoji: "📖", blurb: "Nusach-aware siddur, Hebrew & English", status: "live", featured: true, to: "/siddur", detail: ["Shacharit, Mincha, Maariv, bedtime Shema", "Tefilat HaDerech, Birkat Hamazon, brachot, Havdalah", "Pick your nusach, text size and translation"] },
      { id: "programs", name: "Yeshivas, sems & schools", emoji: "📚", blurb: "Program directory and open shiurim", status: "guide" },
      { id: "chagim", name: "Chagim & national holidays", emoji: "🕯️", blurb: "What closes, when, and where to be", status: "guide", detail: ["Public transport stops before Shabbat and chag", "Yom HaZikaron / Yom HaAtzmaut siren times", "Chol HaMoed opening hours"] },
    ],
  },
  {
    id: "money",
    label: "Money",
    emoji: "💳",
    tagline: "Your shekels, in and out.",
    services: [
      { id: "topup", name: "Add money", emoji: "➕", blurb: "Add shekels with Apple Pay or a card", status: "live", featured: true, to: "/topup" },
      { id: "split", name: "Split a bill", emoji: "👥", blurb: "Split evenly or custom with your cohort", status: "live", to: "/social" },
    ],
  },
];


export const FEATURED_SERVICES: Service[] = SERVICE_CATEGORIES.flatMap((c) => c.services).filter(
  (s) => s.featured,
);

export const ALL_SERVICES: Service[] = SERVICE_CATEGORIES.flatMap((c) => c.services);

export function findService(id: string) {
  for (const category of SERVICE_CATEGORIES) {
    const service = category.services.find((s) => s.id === id);
    if (service) return { service, category };
  }
  return null;
}

/** Direct-open link for a service: partner apps open straight into their flow. */
export function serviceLinkProps(service: Service): {
  to: string;
  params?: Record<string, string>;
} {
  return service.to
    ? { to: service.to }
    : { to: "/explore/service/$id", params: { id: service.id } };
}

/**
 * The Shekk home screen — a springboard of the Israeli apps a student
 * actually opens, grouped like pages on a phone.
 */
const HOME_LAYOUT: { label: string; hint: string; ids: string[] }[] = [
  {
    label: "Live in Shekk",
    hint: "What's wired up today. More partners as their APIs land.",
    ids: ["gett", "siddur", "insurance", "fitness", "topup", "split"],
  },
  {
    label: "Good to know",
    hint: "Practical guides for your year here.",
    ids: ["beenthere", "visa", "emergency", "cash", "shuk", "thingstodo", "chagim"],
  },
];


export const HOME_SECTIONS = HOME_LAYOUT.map((section) => ({
  label: section.label,
  hint: section.hint,
  services: section.ids
    .map((id) => ALL_SERVICES.find((s) => s.id === id))
    .filter((s): s is Service => Boolean(s)),
}));
