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
  { id: "admin", label: "Admin", emoji: "🛂", blurb: "Visa & documents", to: "/explore/admin" },
  { id: "community", label: "Community", emoji: "🕍", blurb: "Shuls & zmanim", to: "/explore/community" },
  { id: "shops", label: "Shops", emoji: "🏷️", blurb: "Student discounts", to: "/explore/shops" },
];

export const BUS_LINES = [
  { line: "74", dest: "Har Nof → Central Station", mins: 3, price: 6.4 },
  { line: "18", dest: "Malcha → Ramot", mins: 7, price: 6.4 },
  { line: "Rail R1", dest: "Yitzhak Navon → Tel Aviv", mins: 12, price: 24.5 },
  { line: "Light Rail", dest: "Ammunition Hill → Mount Herzl", mins: 2, price: 6.4 },
];

export const RESTAURANTS = [
  { id: "r1", name: "Pizza Kefar", tag: "Dairy · Badatz", eta: "20-30 min", emoji: "🍕", kosher: true, closedShabbat: true, items: [
    { id: "i1", name: "Personal margherita", price: 42 },
    { id: "i2", name: "Garlic focaccia", price: 18 },
    { id: "i3", name: "Iced coffee", price: 14 },
  ] },
  { id: "r2", name: "Shawarma Hameyuchad", tag: "Meat · Rabbanut", eta: "15-25 min", emoji: "🥙", kosher: true, closedShabbat: true, items: [
    { id: "i4", name: "Laffa shawarma", price: 58 },
    { id: "i5", name: "Half portion + chips", price: 39 },
    { id: "i6", name: "Limonana", price: 12 },
  ] },
  { id: "r3", name: "Green Bowl", tag: "Vegan · Kosher", eta: "25-35 min", emoji: "🥗", kosher: true, closedShabbat: false, items: [
    { id: "i7", name: "Falafel power bowl", price: 46 },
    { id: "i8", name: "Matcha", price: 19 },
  ] },
  { id: "r4", name: "Burger Bar TLV", tag: "Meat · not certified", eta: "30-40 min", emoji: "🍔", kosher: false, closedShabbat: false, items: [
    { id: "i9", name: "Classic burger", price: 62 },
  ] },
];

export const EVENTS = [
  { id: "e1", name: "Shabbaton in Tzfat", host: "Aish Gap Year", when: "Fri 24 Jan · 2 nights", price: 180, emoji: "🕯️", spots: 12 },
  { id: "e2", name: "Tiyul: Ein Gedi + Masada sunrise", host: "Israel Experience", when: "Tue 21 Jan · 04:00", price: 145, emoji: "🏜️", spots: 6 },
  { id: "e3", name: "Shiur: Rabbi Zeff on Emunah", host: "Ohr Somayach", when: "Mon 20 Jan · 20:30", price: 0, emoji: "📖", spots: 40 },
  { id: "e4", name: "Thursday night at HaTachana", host: "Group J26", when: "Thu 23 Jan · 22:00", price: 55, emoji: "🎶", spots: 25 },
];

export const HOUSING = [
  { id: "h1", title: "Room in Nachlaot 3BR", price: "₪2,400 / mo", tag: "Girls · furnished", emoji: "🏠" },
  { id: "h2", title: "Dorm swap — Maalot Dafna", price: "₪1,150 / mo", tag: "Guys · 5 min to yeshiva", emoji: "🛏️" },
  { id: "h3", title: "Roommate wanted, Katamon", price: "₪1,900 / mo", tag: "Mixed program housing", emoji: "🔑" },
];

export const SHOPS = [
  { id: "s1", name: "Machane Yehuda Market", promo: "10% student Tues", emoji: "🍇" },
  { id: "s2", name: "Steimatzky Books", promo: "15% off seforim", emoji: "📚" },
  { id: "s3", name: "Golan Telecom", promo: "Student SIM ₪39", emoji: "📱" },
  { id: "s4", name: "Kikar Laundry", promo: "Wash + fold ₪25", emoji: "🧺" },
];

export const SHULS = [
  { id: "sh1", name: "Kotel — Western Wall", detail: "Minyan every 20 min · 24/6", emoji: "🕍" },
  { id: "sh2", name: "Chabad of Rechavia", detail: "Shabbat meals — sign up in app", emoji: "🕎" },
  { id: "sh3", name: "Aish HaTorah Beit Midrash", detail: "Mincha 13:45 · Maariv 20:15", emoji: "📿" },
];

export const FEED: { id: string; who: string; what: string; when: string; emoji: string }[] = [];

export const COHORT_THREAD: { id: string; who: string; text: string; when: string; me: boolean }[] = [];
