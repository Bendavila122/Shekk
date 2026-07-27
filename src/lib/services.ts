/**
 * The ShekelPay service catalogue.
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
    tagline: "One Rav-Kav, one fare, one balance.",
    services: [
      { id: "ravkav", name: "Rav-Kav", partner: "Rav-Kav Online", emoji: "🎫", blurb: "Load your travel card with tokens", status: "live", featured: true, to: "/explore/transit", detail: ["Top up any Rav-Kav from your credit balance", "Student profile discounts applied automatically", "Balance shown next to your ShekelPay credits"] },
      { id: "moovit", name: "Moovit", partner: "Moovit", emoji: "🧭", blurb: "Live bus, light rail & sherut times", status: "live", to: "/explore/transit", detail: ["Real-time departures embedded in the Transit screen", "Line alerts for chagim and Shabbat timetables"] },
      { id: "rail", name: "Israel Railways", partner: "Rakevet Israel", emoji: "🚆", blurb: "Book intercity train tickets", status: "live", featured: true, to: "/explore/transit", detail: ["Jerusalem ↔ Tel Aviv ↔ Haifa ↔ Be'er Sheva", "Ticket lives in your wallet as a QR"] },
      { id: "gett", name: "Gett", partner: "Gett", emoji: "🚕", blurb: "Order a taxi, pay with tokens", status: "live", featured: true, to: "/explore/rides", detail: ["The real Gett booking flow, running inside ShekelPay", "Fare settles straight from your token balance"] },
      { id: "goto", name: "Go-To", partner: "Go To Global", emoji: "🚙", blurb: "Car & scooter sharing by the minute", status: "live", featured: true, to: "/explore/rides", detail: ["Unlock a Go-To car or scooter without leaving ShekelPay", "Minutes billed to your token balance"] },
      { id: "waze", name: "Waze", partner: "Waze", emoji: "📍", blurb: "Navigate, with in-app handoff", status: "integrating" },
      { id: "gmaps", name: "Google Maps", partner: "Google", emoji: "🗺️", blurb: "Places, routes and hotspot map", status: "integrating" },
      { id: "pango", name: "Pango", partner: "Pango", emoji: "🅿️", blurb: "Street parking, paid by the minute", status: "integrating" },
      { id: "carrental", name: "Car rental", partner: "Shlomo Sixt · Eldan", emoji: "🚗", blurb: "Under-25 friendly rentals", status: "integrating" },
      { id: "flights", name: "Flights", partner: "Kiwi", emoji: "✈️", blurb: "Chagim flights home and back", status: "integrating" },
    ],
  },
  {
    id: "eat",
    label: "Eating & going out",
    emoji: "🥙",
    tagline: "Platforms, not one-by-one venue signups.",
    services: [
      { id: "wolt", name: "Wolt", partner: "Wolt", emoji: "🛵", blurb: "Full delivery catalogue, kosher filter on", status: "live", featured: true, to: "/explore/food", detail: ["Every Wolt restaurant, ordered without leaving ShekelPay", "Kosher / Badatz / dairy-meat filters", "Erev Shabbat cut-off reminders"] },
      { id: "cibus", name: "Cibus", partner: "Cibus", emoji: "🍱", blurb: "Meal credit at thousands of spots", status: "integrating" },
      { id: "10bis", name: "Tenbis", partner: "10bis", emoji: "🍽️", blurb: "Lunch ordering and pickup", status: "integrating" },
      { id: "reserve", name: "Table reservations", partner: "Ontopo", emoji: "📖", blurb: "Book restaurants, bars & cafés", status: "live", to: "/explore/reserve" },
      { id: "supermarkets", name: "Supermarkets", partner: "Shufersal · Rami Levy", emoji: "🛒", blurb: "Grocery delivery to your dira", status: "integrating" },
      { id: "shuk", name: "Shuk guide", emoji: "🍅", blurb: "Machane Yehuda & Carmel, how to haggle", status: "guide", detail: ["Best days and hours to go", "What a fair price looks like", "Which stalls take card vs cash only"] },
    ],
  },
  {
    id: "nightlife",
    label: "Nightlife & things to do",
    emoji: "🎟️",
    tagline: "Ticketing platforms cover the individual venues.",
    services: [
      { id: "events", name: "Events & tickets", partner: "Eventbuzz", emoji: "🎫", blurb: "Shabbatonim, tiyulim, concerts", status: "live", to: "/explore/events" },
      { id: "secrettlv", name: "Secret TLV", partner: "Secret Tel Aviv", emoji: "🌃", blurb: "What's on tonight, curated", status: "integrating" },
      { id: "clubs", name: "Clubs & bars", partner: "via ticketing partners", emoji: "🎧", blurb: "Guest lists and entry through partner platforms", status: "integrating" },
      { id: "thingstodo", name: "Things to do", emoji: "🏜️", blurb: "Tiyulim, hikes, day trips", status: "guide" },
      { id: "map", name: "Hotspot map", emoji: "🗺️", blurb: "Destinations students actually go", status: "integrating" },
      { id: "gyms", name: "Gyms & fitness", partner: "Holmes Place · Icon", emoji: "🏋️", blurb: "Short-term memberships and day passes", status: "integrating" },
      { id: "volunteer", name: "Volunteering", partner: "Yad Sarah · Leket", emoji: "🤝", blurb: "Chesed shifts near your program", status: "guide" },
    ],
  },
  {
    id: "living",
    label: "Living here",
    emoji: "🏠",
    tagline: "From a week in a hostel to a year-long dira.",
    services: [
      { id: "housing", name: "Rentals & house shares", partner: "Yad2", emoji: "🏘️", blurb: "Long-term diras and roommates", status: "live", to: "/explore/housing" },
      { id: "airbnb", name: "Airbnb", partner: "Airbnb", emoji: "🛏️", blurb: "Short stays for bein hazmanim", status: "integrating" },
      { id: "hotels", name: "Hotels & hostels", partner: "Booking.com", emoji: "🏨", blurb: "Book a bed anywhere in the country", status: "integrating" },
      { id: "bills", name: "Utility bills", partner: "IEC · Hot · Bezeq", emoji: "💡", blurb: "Electric, water, internet from credits", status: "integrating" },
      { id: "arnona", name: "Arnona & taxes", partner: "Municipality", emoji: "🧾", blurb: "Council tax and student exemptions", status: "guide" },
      { id: "sim", name: "SIM cards", partner: "Partner · Cellcom · Pelephone", emoji: "📱", blurb: "eSIM in minutes, no Israeli ID needed", status: "integrating" },
      { id: "shops", name: "Shops & discounts", partner: "student network", emoji: "🏷️", blurb: "Promo codes and where to find things", status: "live", to: "/explore/shops" },
      { id: "cash", name: "Cash & exchange", emoji: "💵", blurb: "How to get cash, what a fair rate is", status: "guide", detail: ["ShekelPay rate vs street changers", "Which ATMs skip the double conversion", "Where cash is still king (shuk, sherut, monit)"] },
    ],
  },
  {
    id: "health",
    label: "Health & safety",
    emoji: "🩺",
    tagline: "The stuff you hope you never need, one tap away.",
    services: [
      { id: "hospitalcard", name: "Hospital card", partner: "Harel · Clal", emoji: "🪪", blurb: "Insurance card in your wallet", status: "live", to: "/explore/health" },
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
      { id: "visa", name: "Visa guides", partner: "Misrad HaPnim", emoji: "🛂", blurb: "A/2 student visa, extensions, overstays", status: "live", to: "/explore/admin" },
      { id: "army", name: "Army info", partner: "IDF · Nefesh B'Nefesh", emoji: "🎖️", blurb: "Draft, Mahal, Garin Tzabar", status: "guide" },
      { id: "lonesoldier", name: "Lone soldier support", partner: "LSC", emoji: "🪖", blurb: "Rights, benefits, care packages", status: "guide" },
      { id: "uni", name: "Uni & school help", emoji: "🎓", blurb: "Applications, credits transfer, tuition", status: "guide" },
      { id: "translation", name: "Translation", emoji: "🔤", blurb: "Photograph any Hebrew form", status: "integrating" },
      { id: "weather", name: "Weather", emoji: "🌤️", blurb: "Sharav, rain, hiking conditions", status: "integrating" },
    ],
  },
  {
    id: "community",
    label: "Jewish life",
    emoji: "🕍",
    tagline: "Zmanim, shuls and your program's calendar.",
    services: [
      { id: "community", name: "Shuls & minyanim", partner: "Aish · Chabad", emoji: "🕍", blurb: "Minyan times near you", status: "live", to: "/explore/community" },
      { id: "programs", name: "Yeshivas, sems & schools", emoji: "📚", blurb: "Program directory and open shiurim", status: "guide" },
      { id: "siddur", name: "Siddur & Tikkun", emoji: "📖", blurb: "Nusach-aware siddur, offline", status: "live", to: "/explore/community" },
      { id: "chagim", name: "Chagim & national holidays", emoji: "🕯️", blurb: "What closes, when, and where to be", status: "guide", detail: ["Public transport stops before Shabbat and chag", "Yom HaZikaron / Yom HaAtzmaut siren times", "Chol HaMoed opening hours"] },
    ],
  },
  {
    id: "money",
    label: "Money",
    emoji: "💳",
    tagline: "Credits in, credits out to friends and partners.",
    services: [
      { id: "bit", name: "Bit", partner: "Bit", emoji: "🇮🇱", blurb: "Israelis pay you, you pay them", status: "integrating", detail: ["Accept a Bit request straight into credits", "Settle a landlord or madrich without cash"] },
      { id: "split", name: "Split a bill", emoji: "👥", blurb: "Split evenly or custom with your cohort", status: "live", to: "/social" },
      { id: "topup", name: "Add credits", emoji: "➕", blurb: "Buy shekel credits with Apple Pay", status: "live", to: "/topup" },
      { id: "promos", name: "Promo codes", emoji: "🎁", blurb: "Student discounts across partners", status: "live", to: "/explore/shops" },
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
