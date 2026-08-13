export const MID_MARKET_RATE = 3.68; // ILS per USD (internal reference only — never shown)
export const SPREAD_PCT = 0.03; // ~3% spread, built into the rate. Not itemised to users.

/** The single public number: Shekk's own rate, ~3% below mid-market. */
export const SHEKK_RATE = +(MID_MARKET_RATE * (1 - SPREAD_PCT)).toFixed(4);

export function quoteTopUp(usd: number) {
  const credits = +(usd * SHEKK_RATE).toFixed(2);
  return { usd, credits, rate: SHEKK_RATE };
}


export const ils = (n: number) =>
  `₪${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const usd = (n: number) =>
  `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const usdRef = (shekels: number) => usd(+(shekels / MID_MARKET_RATE).toFixed(2));

export const PROGRAMS = [
  { id: "aish", name: "Aish HaTorah", city: "Old City, Jerusalem" },
  { id: "ohr", name: "Ohr Somayach", city: "Maalot Dafna, Jerusalem" },
  { id: "meor", name: "Meor", city: "Jerusalem" },
  { id: "michlala", name: "Michlala", city: "Bayit VeGan, Jerusalem" },
  { id: "other", name: "Other / not listed", city: "Israel" },
];

export type Txn = {
  id: string;
  merchant: string;
  category: string;
  amount: number; // negative = spend, positive = credits added
  date: string;
  icon: string;
};

export const SEED_TXNS: Txn[] = [];

export const FRIENDS: { id: string; name: string; program: string; initials: string; photo: string }[] = [];

export const friendPhoto = (name: string) => FRIENDS.find((f) => f.name === name)?.photo ?? null;


export const MINI_PROGRAMS = [
  { id: "transit", label: "Transit", emoji: "🚌", blurb: "Bus, rail & Rav-Kav", to: "/explore/transit" },
  { id: "rides", label: "Rides", emoji: "🚕", blurb: "Book a taxi", to: "/explore/rides" },
  { id: "food", label: "Food", emoji: "🥙", blurb: "Kosher delivery", to: "/explore/food" },
  { id: "reserve", label: "Reserve", emoji: "🍽️", blurb: "Tables & Shabbatons", to: "/explore/reserve" },
  { id: "events", label: "Events", emoji: "🎟️", blurb: "Shiurim & tiyulim", to: "/explore/events" },
  { id: "housing", label: "Housing", emoji: "🏠", blurb: "Dorms & roommates", to: "/explore/housing" },
  { id: "health", label: "Health", emoji: "🩺", blurb: "Insurance & clinics", to: "/explore/health" },
  { id: "admin", label: "Visa", emoji: "🛂", blurb: "Status & paperwork", to: "/explore/visa" },
  { id: "shops", label: "Shops", emoji: "🏷️", blurb: "Student discounts", to: "/explore/shops" },
];

export const EVENTS = [
  { id: "e1", name: "Shabbaton in Tzfat", host: "Aish Gap Year", when: "Fri 24 Jan · 2 nights", price: 180, emoji: "🕯️", spots: 12 },
  { id: "e2", name: "Tiyul: Ein Gedi + Masada sunrise", host: "Israel Experience", when: "Tue 21 Jan · 04:00", price: 145, emoji: "🏜️", spots: 6 },
  { id: "e3", name: "Shiur: Rabbi Zeff on Emunah", host: "Ohr Somayach", when: "Mon 20 Jan · 20:30", price: 0, emoji: "📖", spots: 40 },
  { id: "e4", name: "Thursday night at HaTachana", host: "Group J26", when: "Thu 23 Jan · 22:00", price: 55, emoji: "🎶", spots: 25 },
];

export const FEED: { id: string; who: string; what: string; when: string; emoji: string }[] = [];

export const COHORT_THREAD: { id: string; who: string; text: string; when: string; me: boolean }[] = [];
