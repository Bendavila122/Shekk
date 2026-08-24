/**
 * Commercial catalogue: providers, offers and the recommendation logic behind
 * the Services tab.
 *
 * Deliberately provider-agnostic. Nothing here knows about a specific partner —
 * an offer carries an optional `affiliate` block, and when we sign a partner we
 * fill it in (url + tracking id) and the CTA becomes a real affiliate link. Until
 * then the CTA opens the provider's own site and is labelled honestly.
 */

export type OfferKind = "esim" | "insurance" | "partner";

export type Provider = {
  id: string;
  name: string;
  /** Short line the user sees under the provider name. */
  blurb: string;
  /** Provider home page — the fallback when no affiliate link exists yet. */
  site: string;
  /** Optional logo path once we have partner assets. */
  logo?: string;
};

export type Affiliate = {
  /** Deep link template. `{sub}` is replaced with our tracking sub-id. */
  url: string;
  network?: string;
  trackingId?: string;
};

export type Offer = {
  id: string;
  kind: OfferKind;
  providerId: string;
  name: string;
  headline: string;
  /** Display price, e.g. "≈ £18". Indicative until a partner feed is live. */
  price: string;
  period: string;
  points: string[];
  /** Filled in when a partner deal is signed. */
  affiliate?: Affiliate;
  /** Matching hints used by the recommendation flows. */
  match?: {
    minDays?: number;
    maxDays?: number;
    dataNeed?: DataNeed[];
    needsNumber?: boolean;
    activities?: boolean;
    student?: boolean;
  };
  /** Marketing label on the winning card. */
  badge?: string;
};

export const PROVIDERS: Provider[] = [
  { id: "airalo", name: "Airalo", blurb: "Global eSIM marketplace, Israel plans from a few pounds", site: "https://www.airalo.com" },
  { id: "saily", name: "Saily", blurb: "eSIM from the NordVPN team, simple app and clear pricing", site: "https://saily.com" },
  { id: "holafly", name: "Holafly", blurb: "Unlimited-data eSIMs, good for hotspotting", site: "https://esim.holafly.com" },
  { id: "partner-il", name: "Israeli carrier", blurb: "A local SIM with an Israeli number, bought on arrival", site: "https://www.019mobile.co.il" },
  { id: "safetywing", name: "SafetyWing", blurb: "Monthly travel medical cover, cancel any time", site: "https://safetywing.com" },
  { id: "worldnomads", name: "World Nomads", blurb: "Adventure activities and longer trips", site: "https://www.worldnomads.com" },
  { id: "harel", name: "Harel", blurb: "Israeli insurer used by many programmes", site: "https://www.harel-group.co.il" },
];

export function provider(id: string): Provider | undefined {
  return PROVIDERS.find((p) => p.id === id);
}

export type DataNeed = "light" | "normal" | "heavy";

/* ───────────────────────────── eSIM ───────────────────────────── */

export const ESIM_OFFERS: Offer[] = [
  {
    id: "esim-short-data",
    kind: "esim",
    providerId: "airalo",
    name: "Short-trip data plan",
    headline: "Data only, install before you fly",
    price: "≈ £10",
    period: "2 weeks",
    points: ["Around 5 GB of data", "Works the moment you land", "Keeps your home number on your physical SIM"],
    match: { maxDays: 30, dataNeed: ["light", "normal"], needsNumber: false },
  },
  {
    id: "esim-gap-year",
    kind: "esim",
    providerId: "saily",
    name: "Gap-year data plan",
    headline: "The usual choice for a few months in Israel",
    price: "≈ £18",
    period: "per month",
    points: ["Around 50 GB a month", "Top up in the app", "No contract"],
    match: { minDays: 21, dataNeed: ["normal", "heavy"], needsNumber: false },
    badge: "Most chosen",
  },
  {
    id: "esim-unlimited",
    kind: "esim",
    providerId: "holafly",
    name: "Unlimited data plan",
    headline: "Hotspotting, video calls and maps all day",
    price: "≈ £28",
    period: "per month",
    points: ["Unlimited fair-use data", "Tethering included", "Simple flat price"],
    match: { dataNeed: ["heavy"], needsNumber: false },
  },
  {
    id: "sim-israeli-number",
    kind: "esim",
    providerId: "partner-il",
    name: "Israeli number + data",
    headline: "For deliveries, doctors, Rav-Kav and banks",
    price: "≈ ₪49",
    period: "per month",
    points: ["Real Israeli mobile number", "Calls and SMS to Israeli services", "Best for stays over three months"],
    match: { minDays: 60, needsNumber: true },
  },
];

export type SimAnswers = {
  days: number | null;
  needsNumber: boolean | null;
  data: DataNeed | null;
};

/* ───────────────────────────── Insurance ───────────────────────────── */

export const INSURANCE_OFFERS: Offer[] = [
  {
    id: "ins-essentials",
    kind: "insurance",
    providerId: "safetywing",
    name: "Essentials medical cover",
    headline: "Emergency treatment and repatriation",
    price: "≈ £45",
    period: "per month",
    points: ["Emergency medical and hospital", "Repatriation", "24/7 assistance line"],
    match: { maxDays: 120, activities: false },
  },
  {
    id: "ins-programme",
    kind: "insurance",
    providerId: "harel",
    name: "Programme-standard cover",
    headline: "What most gap-year programmes ask for",
    price: "≈ £70",
    period: "per month",
    points: ["Medical and dental emergencies", "Baggage and documents", "Accepted by Israeli clinics"],
    match: { minDays: 90, student: true },
    badge: "Meets most programme rules",
  },
  {
    id: "ins-extended",
    kind: "insurance",
    providerId: "worldnomads",
    name: "Extended and adventure cover",
    headline: "Tiyulim, sport and longer stays",
    price: "≈ £95",
    period: "per month",
    points: ["Adventure activities included", "Higher medical limits", "Gadget cover"],
    match: { activities: true },
  },
];

export type InsuranceAnswers = {
  days: number | null;
  activities: boolean | null;
  programmeCover: boolean | null;
  student: boolean | null;
};

/* ───────────────────────────── Partner offers ───────────────────────────── */

export const PARTNER_OFFERS: Offer[] = [
  {
    id: "offer-airport-transfer",
    kind: "partner",
    providerId: "partner-il",
    name: "Airport transfer",
    headline: "Fixed-price ride from Ben Gurion",
    price: "from ₪160",
    period: "per car",
    points: ["Book before you land", "Driver meets you at arrivals", "Cheaper shared options at night"],
  },
  {
    id: "offer-rav-kav-help",
    kind: "partner",
    providerId: "partner-il",
    name: "Student transport discount",
    headline: "Rav-Kav student rate, up to 50% off fares",
    price: "free to set up",
    period: "one-off",
    points: ["Bring your student card", "Set up at any station office", "Applies across buses and trains"],
  },
];

/* ───────────────────────────── Scoring ───────────────────────────── */

function daysFit(offer: Offer, days: number | null) {
  const m = offer.match;
  if (!m || days === null) return 0;
  if (m.minDays !== undefined && days < m.minDays) return -3;
  if (m.maxDays !== undefined && days > m.maxDays) return -2;
  return 2;
}

export function rankSimOffers(a: SimAnswers): Offer[] {
  return [...ESIM_OFFERS]
    .map((o) => {
      let score = daysFit(o, a.days);
      if (a.needsNumber !== null && o.match?.needsNumber !== undefined) {
        score += o.match.needsNumber === a.needsNumber ? 3 : -3;
      }
      if (a.data && o.match?.dataNeed?.includes(a.data)) score += 2;
      return { o, score };
    })
    .sort((x, y) => y.score - x.score)
    .map((x) => x.o);
}

export function rankInsuranceOffers(a: InsuranceAnswers): Offer[] {
  return [...INSURANCE_OFFERS]
    .map((o) => {
      let score = daysFit(o, a.days);
      if (a.activities !== null && o.match?.activities !== undefined) {
        score += o.match.activities === a.activities ? 3 : -2;
      }
      if (a.student && o.match?.student) score += 2;
      if (a.programmeCover) score -= o.id === "ins-programme" ? 1 : 0;
      return { o, score };
    })
    .sort((x, y) => y.score - x.score)
    .map((x) => x.o);
}

/**
 * Where the CTA goes. Once an affiliate deal exists the offer carries a URL
 * template and this becomes a tracked link; until then we send people to the
 * provider's own site so the journey never dead-ends.
 */
export function offerUrl(offer: Offer, sub = "shekk"): string {
  if (offer.affiliate?.url) return offer.affiliate.url.replace("{sub}", sub);
  return provider(offer.providerId)?.site ?? "#";
}

export function isAffiliate(offer: Offer) {
  return Boolean(offer.affiliate?.url);
}
