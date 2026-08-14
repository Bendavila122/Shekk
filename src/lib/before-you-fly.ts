/**
 * "Before you fly" — the guided pre-arrival journey.
 *
 * Copy and demo partner previews live here; live status is always computed
 * from real state (programme, profile, KYC, travel dates) in the route.
 */

export type StepId =
  | "programme"
  | "profile"
  | "kyc"
  | "money"
  | "card"
  | "esim"
  | "insurance"
  | "health"
  | "documents"
  | "arrival"
  | "packing"
  | "emergency";

export type StepTone = "finance" | "setup" | "life";

export type StepDef = {
  id: StepId;
  title: string;
  blurb: string;
  tone: StepTone;
  /** Where the step is actually completed. */
  href: string;
  cta: string;
};

export const BEFORE_YOU_FLY_STEPS: StepDef[] = [
  {
    id: "programme",
    title: "Join your programme",
    blurb: "Enter the code your programme gave you to unlock your timetable, contacts and documents.",
    tone: "setup",
    href: "/programme",
    cta: "Enter code",
  },
  {
    id: "profile",
    title: "Add your travel basics",
    blurb: "Your name, arrival and departure dates, home currency and where you'll be based.",
    tone: "setup",
    href: "/welcome",
    cta: "Add details",
  },
  {
    id: "kyc",
    title: "Verify your identity",
    blurb: "A one-off ID check. Required by our banking partner before you can spend.",
    tone: "finance",
    href: "/verify",
    cta: "Start verification",
  },
  {
    id: "money",
    title: "Prepare to add money",
    blurb: "Choose the currency you'll fund from and see the rate before you land.",
    tone: "finance",
    href: "/topup",
    cta: "See rates",
  },
  {
    id: "card",
    title: "Prepare your Shekk card",
    blurb: "Review your card settings. Card issuing is still being set up, so this is a preview.",
    tone: "finance",
    href: "/card",
    cta: "View card preview",
  },
  {
    id: "esim",
    title: "Sort an Israeli number",
    blurb: "Compare eSIM options so you land with data. Partner checkout is not live yet.",
    tone: "setup",
    href: "/before-you-fly/esim",
    cta: "Compare eSIMs",
  },
  {
    id: "insurance",
    title: "Check your travel insurance",
    blurb: "Most programmes require cover. Compare typical plans, then buy through your programme or insurer.",
    tone: "setup",
    href: "/before-you-fly/insurance",
    cta: "Compare cover",
  },
  {
    id: "health",
    title: "Store your health cover",
    blurb: "Save your kupah or insurance card in Shekk so a clinic can read your member number in seconds.",
    tone: "life",
    href: "/explore/health",
    cta: "Open health cover",
  },
  {
    id: "documents",
    title: "Upload your key documents",
    blurb: "Passport, visa, acceptance letter and insurance policy, private to you and available offline.",
    tone: "setup",
    href: "/explore/documents",
    cta: "Open documents",
  },
  {
    id: "arrival",
    title: "Read the arrival guide",
    blurb: "Ben Gurion, passport control, SIMs, Rav-Kav and getting to your accommodation.",
    tone: "life",
    href: "/guides",
    cta: "Open guides",
  },
  {
    id: "packing",
    title: "Pack the essentials",
    blurb: "What actually matters for an Israeli winter, summer and Shabbat.",
    tone: "life",
    href: "/guides",
    cta: "Open packing list",
  },
  {
    id: "emergency",
    title: "Save emergency details",
    blurb: "101 for ambulance, 100 for police, plus your programme's on-call contacts.",
    tone: "life",
    href: "/programme",
    cta: "Review contacts",
  },
];

/* ────────────────────── Neutral partner previews ────────────────────── */

export type OfferPreview = {
  id: string;
  name: string;
  headline: string;
  price: string;
  period: string;
  points: string[];
};

/** Illustrative only — no partner is signed and nothing here is purchasable. */
export const ESIM_PREVIEWS: OfferPreview[] = [
  {
    id: "esim-light",
    name: "Light data plan",
    headline: "Short programmes and taster trips",
    price: "≈ £10",
    period: "for 2 weeks",
    points: ["Around 5 GB of data", "Israeli mobile number", "Activate before you fly"],
  },
  {
    id: "esim-standard",
    name: "Standard data plan",
    headline: "The usual choice for a gap year",
    price: "≈ £18",
    period: "per month",
    points: ["Around 50 GB of data", "Israeli number and calls", "Top up from inside Shekk"],
  },
  {
    id: "esim-unlimited",
    name: "Heavy use plan",
    headline: "Hotspotting and video calls home",
    price: "≈ £28",
    period: "per month",
    points: ["Unlimited fair-use data", "Tethering included", "Keeps your home number active"],
  },
];

export const INSURANCE_PREVIEWS: OfferPreview[] = [
  {
    id: "ins-basic",
    name: "Essentials cover",
    headline: "Medical and repatriation only",
    price: "≈ £45",
    period: "per month",
    points: ["Emergency medical treatment", "Repatriation", "24/7 assistance line"],
  },
  {
    id: "ins-standard",
    name: "Programme cover",
    headline: "What most programmes ask for",
    price: "≈ £70",
    period: "per month",
    points: ["Medical and dental emergencies", "Baggage and documents", "Trip disruption"],
  },
  {
    id: "ins-plus",
    name: "Extended cover",
    headline: "Sport, tiyulim and longer stays",
    price: "≈ £95",
    period: "per month",
    points: ["Adventure activities", "Higher medical limits", "Gadget cover"],
  },
];
