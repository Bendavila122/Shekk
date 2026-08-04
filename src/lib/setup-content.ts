/**
 * Israel Setup — the flagship preparation hub.
 *
 * Sections in the order life happens: before you fly, money, programme,
 * phone, insurance, packing, arrival, first week. Some items are computed
 * from real account state ("auto"); the rest are things only the member can
 * confirm, ticked on the device.
 */
import type { LucideIcon } from "lucide-react";
import {
  Banknote,
  BedDouble,
  Luggage,
  PlaneLanding,
  PlaneTakeoff,
  Shield,
  Smartphone,
  Users,
} from "lucide-react";

/** Items whose state Shekk already knows. */
export type AutoKey = "programme" | "profile" | "kyc" | "money";

export type SetupItem = {
  id: string;
  title: string;
  blurb: string;
  /** Where the item is actually completed, if anywhere. */
  href?: string;
  cta?: string;
  /** Derived from account state instead of a tick. */
  auto?: AutoKey;
  /** Honest labelling for things not live yet. */
  preview?: boolean;
};

export type SetupSection = {
  id: string;
  title: string;
  /** What this section is for, in one line. */
  purpose: string;
  Icon: LucideIcon;
  grad: string;
  /** Roughly when it matters — shown as a timing chip. */
  timing: string;
  items: SetupItem[];
};

export const SETUP_SECTIONS: SetupSection[] = [
  {
    id: "before-you-fly",
    title: "Before you fly",
    purpose: "The handful of things that are painful to fix once you've landed.",
    Icon: PlaneTakeoff,
    grad: "var(--grad-travel)",
    timing: "4–6 weeks out",
    items: [
      {
        id: "bf-passport",
        title: "Check your passport has 6+ months left",
        blurb: "Renew now if it's close. Programmes and airlines both check this.",
      },
      {
        id: "bf-details",
        title: "Add your travel basics to Shekk",
        blurb: "Arrival date, home currency and the city you'll be based in.",
        href: "/welcome",
        cta: "Add details",
        auto: "profile",
      },
      {
        id: "bf-copies",
        title: "Store copies of your documents",
        blurb: "Passport, insurance, programme letter — in your private Shekk vault.",
        href: "/explore/documents",
        cta: "Open vault",
      },
      {
        id: "bf-checklist",
        title: "Walk the full pre-arrival checklist",
        blurb: "The long version, step by step, with everything ticked off as you go.",
        href: "/before-you-fly",
        cta: "Open checklist",
      },
    ],
  },
  {
    id: "money",
    title: "Money",
    purpose: "So you land able to pay for a taxi, not stuck at an ATM.",
    Icon: Banknote,
    grad: "var(--grad-wallet)",
    timing: "2–3 weeks out",
    items: [
      {
        id: "m-kyc",
        title: "Verify your identity",
        blurb: "A one-off ID check. Required before you can spend.",
        href: "/verify",
        cta: "Start verification",
        auto: "kyc",
      },
      {
        id: "m-topup",
        title: "Add your first money",
        blurb: "Fund in your home currency and see the rate before you commit.",
        href: "/topup",
        cta: "Add money",
        auto: "money",
      },
      {
        id: "m-budget",
        title: "Plan your monthly budget",
        blurb: "What's coming in, what's going out, what's actually left.",
        href: "/explore/budget",
        cta: "Open planner",
      },
      {
        id: "m-cost",
        title: "Price up your city",
        blurb: "Rent, food, transport and going out, adjusted to your plans.",
        href: "/explore/cost-of-living",
        cta: "Open calculator",
      },
      {
        id: "m-card",
        title: "Review your Shekk card",
        blurb: "Card issuing is still being set up, so this is a preview.",
        href: "/card",
        cta: "View card",
        preview: true,
      },
    ],
  },
  {
    id: "programme",
    title: "Programme",
    purpose: "Your timetable, contacts and documents, all in one place.",
    Icon: Users,
    grad: "var(--grad-discover)",
    timing: "As soon as you have the code",
    items: [
      {
        id: "p-join",
        title: "Join your programme with its code",
        blurb: "Unlocks your schedule, announcements, contacts and documents.",
        href: "/programme",
        cta: "Enter code",
        auto: "programme",
      },
      {
        id: "p-contacts",
        title: "Save your madrich's number",
        blurb: "In your phone, not only in the app. Save the emergency line too.",
        href: "/programme",
        cta: "See contacts",
      },
      {
        id: "p-forms",
        title: "Send back every form they asked for",
        blurb: "Medical, consent and flight details. Programmes chase these for weeks.",
      },
    ],
  },
  {
    id: "phone",
    title: "Phone",
    purpose: "Land with data. Everything else in Israel depends on it.",
    Icon: Smartphone,
    grad: "var(--grad-sky)",
    timing: "1 week out",
    items: [
      {
        id: "ph-unlock",
        title: "Check your phone is unlocked",
        blurb: "Ask your carrier now — it can take a few days.",
      },
      {
        id: "ph-esim",
        title: "Compare eSIM options",
        blurb: "See what a month of data typically costs. Checkout isn't live yet.",
        href: "/before-you-fly/esim",
        cta: "Compare",
        preview: true,
      },
      {
        id: "ph-whatsapp",
        title: "Decide what happens to your home number",
        blurb: "Most people keep it for WhatsApp and add an Israeli number for calls.",
      },
      {
        id: "ph-hebrew",
        title: "Learn ten words before you land",
        blurb: "Beseder, slicha, kama ze oleh. Ten words changes how you're treated.",
        href: "/explore/ulpan",
        cta: "Open Ulpan",
      },
    ],
  },
  {
    id: "insurance",
    title: "Insurance",
    purpose: "Almost every programme requires cover before you board.",
    Icon: Shield,
    grad: "var(--grad-social)",
    timing: "3 weeks out",
    items: [
      {
        id: "in-compare",
        title: "See what cover usually costs",
        blurb: "Typical plan shapes and prices. Buying through Shekk isn't live yet.",
        href: "/before-you-fly/insurance",
        cta: "Compare cover",
        preview: true,
      },
      {
        id: "in-buy",
        title: "Buy cover through your programme or insurer",
        blurb: "Check it covers the whole trip, including any tiyulim and sport.",
      },
      {
        id: "in-card",
        title: "Save your insurance card in Shekk",
        blurb: "Member number and hotline, ready at the clinic desk.",
        href: "/explore/health",
        cta: "Add card",
      },
    ],
  },
  {
    id: "packing",
    title: "Packing",
    purpose: "What actually matters, rather than a list of forty items.",
    Icon: Luggage,
    grad: "var(--grad-deals)",
    timing: "Final week",
    items: [
      {
        id: "pk-adapters",
        title: "Two Israeli plug adapters",
        blurb: "Type H. Buy two — one always disappears in the first month.",
      },
      {
        id: "pk-meds",
        title: "Prescriptions plus a doctor's note",
        blurb: "Enough for the first months, in original packaging.",
      },
      {
        id: "pk-shabbat",
        title: "One set of Shabbat clothes",
        blurb: "You will need it in week one, whatever your programme is.",
      },
      {
        id: "pk-layers",
        title: "Layers for a Jerusalem winter",
        blurb: "It genuinely gets cold, and stone buildings hold it.",
      },
      {
        id: "pk-cards",
        title: "A backup bank card, packed separately",
        blurb: "Never in the same bag as your main one.",
      },
    ],
  },
  {
    id: "arrival",
    title: "Arrival day",
    purpose: "Ben Gurion to your bed, without a panic.",
    Icon: PlaneLanding,
    grad: "var(--grad-haze)",
    timing: "Landing day",
    items: [
      {
        id: "ar-entry",
        title: "Keep your entry slip safe",
        blurb: "The blue paper card replaces a passport stamp. Photograph it too.",
      },
      {
        id: "ar-transfer",
        title: "Know your route out of the airport",
        blurb: "Programme transfer, train, sherut or taxi — decide before you land.",
        href: "/explore/transit",
        cta: "See transport",
      },
      {
        id: "ar-first-spend",
        title: "Make your first payment with Shekk",
        blurb: "Water and a sim at the airport is the easiest first test.",
        href: "/wallet",
        cta: "Open wallet",
      },
      {
        id: "ar-checkin",
        title: "Tell home you've landed",
        blurb: "Before the jetlag wins. Everybody forgets this one.",
      },
    ],
  },
  {
    id: "first-week",
    title: "First week",
    purpose: "The small admin that makes the rest of the year easy.",
    Icon: BedDouble,
    grad: "var(--grad-chag)",
    timing: "Days 1–7",
    items: [
      {
        id: "fw-ravkav",
        title: "Get a personal Rav-Kav",
        blurb: "Student discounts only work on a registered card.",
        href: "/explore/transit",
        cta: "How to",
      },
      {
        id: "fw-clinic",
        title: "Find your nearest clinic and pharmacy",
        blurb: "Do it while you're well, not at 2am when you aren't.",
        href: "/explore/health",
        cta: "Find care",
      },
      {
        id: "fw-friends",
        title: "Add your programme friends on Shekk",
        blurb: "Splitting a taxi four ways is the whole point.",
        href: "/social",
        cta: "Add friends",
      },
      {
        id: "fw-routine",
        title: "Set one weekly routine",
        blurb: "A gym, a shiur, a Friday shuk run. It's what makes it feel like living here.",
        href: "/israel",
        cta: "Explore",
      },
    ],
  },
];

export const AUTO_ITEM_IDS = SETUP_SECTIONS.flatMap((s) =>
  s.items.filter((i) => i.auto).map((i) => i.id),
);

export function allSetupItems() {
  return SETUP_SECTIONS.flatMap((s) => s.items);
}
