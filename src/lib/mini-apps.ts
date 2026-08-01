/**
 * Mini apps are the little apps that live inside Shekk. Each one gets its own
 * launch screen and runs full-bleed — no Shekk tab bar, no Shekk top banner.
 */
export type MiniApp = {
  /** Route prefix that belongs to this mini app. */
  path: string;
  id: string;
  name: string;
  /** One line under the name on the launch screen. */
  tagline: string;
  emoji: string;
  /** Launch-screen surface, from the design tokens. */
  surface: string;
  /** Text colour that sits on that surface. */
  onSurface: string;
};

const MINI_APPS: MiniApp[] = [
  {
    path: "/explore/map",
    id: "been-there",
    name: "Been There",
    tagline: "Your map of Israel",
    emoji: "🗺️",
    surface: "bg-primary",
    onSurface: "text-primary-foreground",
  },
  {
    path: "/explore/fitness",
    id: "fitness",
    name: "Fitness",
    tagline: "Gyms, classes and courts near you",
    emoji: "🏋️",
    surface: "bg-ink",
    onSurface: "text-ink-foreground",
  },
  {
    path: "/explore/health",
    id: "health",
    name: "Health",
    tagline: "Your insurance card, ready at the clinic",
    emoji: "🩺",
    surface: "bg-primary",
    onSurface: "text-primary-foreground",
  },
  {
    path: "/explore/events",
    id: "events",
    name: "Events",
    tagline: "Nights out, tiyulim and Shabbatonim",
    emoji: "🎟️",
    surface: "bg-ink",
    onSurface: "text-ink-foreground",
  },
  {
    path: "/explore/food",
    id: "food",
    name: "Food",
    tagline: "Eat well, pay with Shekk",
    emoji: "🥙",
    surface: "bg-ink",
    onSurface: "text-ink-foreground",
  },
  {
    path: "/explore/rides",
    id: "rides",
    name: "Rides",
    tagline: "Get across town",
    emoji: "🚕",
    surface: "bg-ink",
    onSurface: "text-ink-foreground",
  },
  {
    path: "/explore/transit",
    id: "transit",
    name: "Transit",
    tagline: "Buses, trains and Rav-Kav",
    emoji: "🚌",
    surface: "bg-primary",
    onSurface: "text-primary-foreground",
  },
  {
    path: "/explore/housing",
    id: "housing",
    name: "Housing",
    tagline: "Rooms, dira hunting and deposits",
    emoji: "🏠",
    surface: "bg-ink",
    onSurface: "text-ink-foreground",
  },
  {
    path: "/explore/shops",
    id: "shops",
    name: "Shops",
    tagline: "Where your shekels go furthest",
    emoji: "🛍️",
    surface: "bg-ink",
    onSurface: "text-ink-foreground",
  },
  {
    path: "/explore/community",
    id: "community",
    name: "Community",
    tagline: "Your program, your people",
    emoji: "🤝",
    surface: "bg-primary",
    onSurface: "text-primary-foreground",
  },
  {
    path: "/explore/reserve",
    id: "reserve",
    name: "Reserve",
    tagline: "Book a table, a court or a slot",
    emoji: "📅",
    surface: "bg-ink",
    onSurface: "text-ink-foreground",
  },
  {
    path: "/siddur",
    id: "siddur",
    name: "Siddur",
    tagline: "Tefillah, brachot and Havdalah",
    emoji: "📖",
    surface: "bg-ink",
    onSurface: "text-ink-foreground",
  },
  {
    path: "/guides",
    id: "guides",
    name: "Guides",
    tagline: "Living here, explained",
    emoji: "🧭",
    surface: "bg-primary",
    onSurface: "text-primary-foreground",
  },
  {
    path: "/news",
    id: "news",
    name: "News",
    tagline: "Israel, right now",
    emoji: "📰",
    surface: "bg-ink",
    onSurface: "text-ink-foreground",
  },
  {
    path: "/tickets",
    id: "tickets",
    name: "Tickets",
    tagline: "Everything you're going to",
    emoji: "🎫",
    surface: "bg-primary",
    onSurface: "text-primary-foreground",
  },
  {
    path: "/exchange",
    id: "exchange",
    name: "Exchange",
    tagline: "Dollars in, shekels out",
    emoji: "💱",
    surface: "bg-ink",
    onSurface: "text-ink-foreground",
  },
];

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
