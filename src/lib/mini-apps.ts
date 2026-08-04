/**
 * Mini apps are the little apps that live inside Shekk. Each one gets its own
 * launch screen and runs full-bleed — no Shekk tab bar, no Shekk top banner,
 * just a small back button.
 *
 * Every mini app also owns a real app icon: a squircle in its own gradient with
 * a single line glyph, so the icons read as a family instead of a row of emoji.
 */
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeftRight,
  BookOpenText,
  Calculator,
  Languages,
  PiggyBank,
  Radar,
  School,
  BusFront,
  CalendarCheck,
  CarFront,
  Compass,
  Dumbbell,
  FolderLock,
  GraduationCap,
  Handshake,
  House,
  Medal,

  MapPin,
  Map as MapIcon,
  Newspaper,
  PartyPopper,
  ShieldCheck,
  ShoppingBag,
  Stamp,
  Stethoscope,
  Ticket,
  UtensilsCrossed,
} from "lucide-react";

export type MiniApp = {
  /** Route prefix that belongs to this mini app. */
  path: string;
  id: string;
  name: string;
  /** One line under the name on the launch screen. */
  tagline: string;
  emoji: string;
  /** Line glyph at the centre of the app icon. */
  Icon: LucideIcon;
  /** Optical size of the glyph as a fraction of the icon. Default 0.44. */
  iconScale?: number;
  /** Glyph stroke width. Default 1.8. */
  iconStroke?: number;
  /** Icon gradient, from the design tokens in styles.css. */
  grad: string;
  /** Launch-screen surface, from the design tokens. */
  surface: string;
  /** Text colour that sits on that surface. */
  onSurface: string;
};


export const MINI_APPS: MiniApp[] = [
  {
    path: "/explore/maps",
    id: "maps",
    name: "Maps",
    tagline: "Everything around you, on one map",
    emoji: "📍",
    Icon: MapPin,
    iconScale: 0.44,
    grad: "var(--grad-travel)",
    surface: "bg-ink",
    onSurface: "text-ink-foreground",
  },
  {
    path: "/explore/map",
    id: "been-there",
    name: "Been There",
    tagline: "Your map of Israel",
    emoji: "🗺️",
    Icon: MapIcon,
    iconScale: 0.46,
    grad: "var(--grad-discover)",
    surface: "bg-primary",
    onSurface: "text-primary-foreground",
  },
  {
    path: "/explore/fitness",
    id: "fitness",
    name: "Fitness",
    tagline: "Gyms, classes and courts near you",
    emoji: "🏋️",
    Icon: Dumbbell,
    iconScale: 0.48,
    grad: "var(--grad-alert)",
    surface: "bg-ink",
    onSurface: "text-ink-foreground",
  },
  {
    path: "/explore/health",
    id: "health",
    name: "Health",
    tagline: "Your insurance card, ready at the clinic",
    emoji: "🩺",
    Icon: Stethoscope,
    iconScale: 0.44,
    grad: "var(--grad-social)",
    surface: "bg-primary",
    onSurface: "text-primary-foreground",
  },
  {
    path: "/explore/events",
    id: "events",
    name: "Events",
    tagline: "Nights out, tiyulim and Shabbatonim",
    emoji: "🎟️",
    Icon: PartyPopper,
    iconScale: 0.45,
    grad: "var(--grad-events)",
    surface: "bg-ink",
    onSurface: "text-ink-foreground",
  },
  {
    path: "/explore/food",
    id: "food",
    name: "Food",
    tagline: "Eat well, pay with Shekk",
    emoji: "🥙",
    Icon: UtensilsCrossed,
    iconScale: 0.42,
    grad: "var(--grad-deals)",
    surface: "bg-ink",
    onSurface: "text-ink-foreground",
  },
  {
    path: "/explore/rides",
    id: "rides",
    name: "Rides",
    tagline: "Get across town",
    emoji: "🚕",
    Icon: CarFront,
    iconScale: 0.46,
    grad: "var(--grad-sun)",
    surface: "bg-ink",
    onSurface: "text-ink-foreground",
  },
  {
    path: "/explore/transit",
    id: "transit",
    name: "Transit",
    tagline: "Buses, trains and Rav-Kav",
    emoji: "🚌",
    Icon: BusFront,
    iconScale: 0.44,
    grad: "var(--grad-partly)",
    surface: "bg-primary",
    onSurface: "text-primary-foreground",
  },
  {
    path: "/explore/housing",
    id: "housing",
    name: "Housing",
    tagline: "Rooms, dira hunting and deposits",
    emoji: "🏠",
    Icon: House,
    iconScale: 0.44,
    grad: "var(--grad-haze)",
    surface: "bg-ink",
    onSurface: "text-ink-foreground",
  },
  {
    path: "/explore/shops",
    id: "shops",
    name: "Shops",
    tagline: "Where your shekels go furthest",
    emoji: "🛍️",
    Icon: ShoppingBag,
    iconScale: 0.43,
    grad: "var(--grad-chag)",
    surface: "bg-ink",
    onSurface: "text-ink-foreground",
  },
  {
    path: "/explore/community",
    id: "community",
    name: "Community",
    tagline: "Your program, your people",
    emoji: "🤝",
    Icon: Handshake,
    iconScale: 0.47,
    grad: "var(--grad-sky)",
    surface: "bg-primary",
    onSurface: "text-primary-foreground",
  },
  {
    path: "/explore/reserve",
    id: "reserve",
    name: "Reserve",
    tagline: "Book a table, a court or a slot",
    emoji: "📅",
    Icon: CalendarCheck,
    iconScale: 0.44,
    grad: "var(--grad-wallet)",
    surface: "bg-ink",
    onSurface: "text-ink-foreground",
  },
  {
    path: "/siddur",
    id: "siddur",
    name: "Siddur",
    tagline: "Tefillah, brachot and Havdalah",
    emoji: "📖",
    Icon: BookOpenText,
    iconScale: 0.45,
    grad: "var(--grad-jewish)",
    surface: "bg-ink",
    onSurface: "text-ink-foreground",
  },
  {
    path: "/explore/visa",
    id: "visa",
    name: "Visa",
    tagline: "Your status, sorted",
    emoji: "🛂",
    Icon: Stamp,
    iconScale: 0.44,
    grad: "var(--grad-haze)",
    surface: "bg-ink",
    onSurface: "text-ink-foreground",
  },
  {
    path: "/explore/army",
    id: "army",
    name: "Explore the IDF",
    tagline: "Branches, units and pathways",
    emoji: "🎖️",
    Icon: Radar,
    iconScale: 0.45,
    grad: "var(--grad-alert)",
    surface: "bg-ink",
    onSurface: "text-ink-foreground",
  },

  {
    path: "/explore/lone-soldier",
    id: "lone-soldier",
    name: "Lone Soldier",
    tagline: "Chayal boded rights and help",
    emoji: "🪖",
    Icon: ShieldCheck,
    iconScale: 0.45,
    grad: "var(--grad-social)",
    surface: "bg-primary",
    onSurface: "text-primary-foreground",
  },
  {
    path: "/explore/uni",
    id: "uni",
    name: "Universities",
    tagline: "Find your university in Israel",
    emoji: "🎓",
    Icon: School,
    iconScale: 0.46,
    grad: "var(--grad-discover)",
    surface: "bg-primary",
    onSurface: "text-primary-foreground",
  },

  {
    path: "/explore/documents",
    id: "documents",
    name: "Documents",
    tagline: "Your papers, private and ready",
    emoji: "🗂️",
    Icon: FolderLock,
    iconScale: 0.44,
    grad: "var(--grad-wallet)",
    surface: "bg-ink",
    onSurface: "text-ink-foreground",
  },
  {
    path: "/explore/ulpan",
    id: "ulpan",
    name: "Ulpan",
    tagline: "Hebrew you'll actually use",
    emoji: "🗣️",
    Icon: Languages,
    iconScale: 0.45,
    grad: "var(--grad-sky)",
    surface: "bg-primary",
    onSurface: "text-primary-foreground",
  },
  {
    path: "/explore/money-planner",
    id: "money-planner",
    name: "Money Planner",
    tagline: "The month, the landing, the buffer",
    emoji: "🧮",
    Icon: Calculator,
    iconScale: 0.44,
    grad: "var(--grad-wallet)",
    surface: "bg-ink",
    onSurface: "text-ink-foreground",
  },



  {
    path: "/guides",
    id: "guides",
    name: "Guides",
    tagline: "Living here, explained",
    emoji: "🧭",
    Icon: Compass,
    iconScale: 0.45,
    grad: "var(--grad-discover)",
    surface: "bg-primary",
    onSurface: "text-primary-foreground",
  },
  {
    path: "/news",
    id: "news",
    name: "News",
    tagline: "Israel, right now",
    emoji: "📰",
    Icon: Newspaper,
    iconScale: 0.44,
    grad: "var(--grad-news)",
    surface: "bg-ink",
    onSurface: "text-ink-foreground",
  },
  {
    path: "/tickets",
    id: "tickets",
    name: "Tickets",
    tagline: "Everything you're going to",
    emoji: "🎫",
    Icon: Ticket,
    iconScale: 0.45,
    grad: "var(--grad-events)",
    surface: "bg-primary",
    onSurface: "text-primary-foreground",
  },
  {
    path: "/exchange",
    id: "exchange",
    name: "Exchange",
    tagline: "Dollars in, shekels out",
    emoji: "💱",
    Icon: ArrowLeftRight,
    iconScale: 0.42,
    grad: "var(--grad-wallet)",
    surface: "bg-ink",
    onSurface: "text-ink-foreground",
  },
];

/** Every mini app Shekk owns, in launch order. */
export function miniApps(): MiniApp[] {
  return MINI_APPS;
}

/** Which mini app, if any, owns this route. */
export function miniAppFor(pathname: string): MiniApp | null {

  const clean = pathname.replace(/\/$/, "") || "/";
  let best: MiniApp | null = null;
  for (const app of MINI_APPS) {
    if (clean === app.path || clean.startsWith(`${app.path}/`)) {
      if (!best || app.path.length > best.path.length) best = app;
    }
  }
  return best;
}
