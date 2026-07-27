/** "For You" widget catalogue — content + relevance scoring. */
import type { ReactNode } from "react";
import { EVENTS, FEED, BUS_LINES, RESTAURANTS, SHOPS, SHULS, ils } from "./mock";
import { pick, rand, type UserContext } from "./personalise";

export type WidgetCta = { label: string; to: string };

export type WidgetRow = { icon: string; label: string; value?: string };

export type WidgetContent = {
  headline: string;
  sub?: string;
  rows: WidgetRow[];
  hero?: ReactNode;
  ctas: WidgetCta[];
};

export type WidgetDef = {
  id: string;
  title: string;
  emoji: string;
  gradient: string;
  relevance: (ctx: UserContext) => number;
  build: (ctx: UserContext) => WidgetContent;
};

const nearbyByCity: Record<string, string[]> = {
  Jerusalem: ["Rooftop party, Mamilla", "Thursday night cholent, Nachlaot", "Live music at HaMachtesh", "Student meetup, Emek Refaim"],
  "Tel Aviv": ["Rooftop party, Rothschild", "Beach bonfire, Gordon", "Live set at HaTachana", "Student meetup, Florentin"],
  Israel: ["Cohort bonfire", "Thursday night cholent", "Live music downtown", "Student meetup"],
};

const discoverByCity: Record<string, WidgetRow[]> = {
  Jerusalem: [
    { icon: "☕️", label: "Cafe Kadosh", value: "4 min walk" },
    { icon: "🍽", label: "New: Hummus Ben Sira", value: "Opened this week" },
    { icon: "🏛", label: "Tower of David night show", value: "Student ₪35" },
    { icon: "🤝", label: "Pantry Packers volunteering", value: "Sun 09:00" },
  ],
  "Tel Aviv": [
    { icon: "☕️", label: "Cafe Xoho", value: "6 min walk" },
    { icon: "🍽", label: "New: Miznon Ibn Gvirol", value: "Opened this week" },
    { icon: "🏖", label: "Old Jaffa port walk", value: "Free" },
    { icon: "🤝", label: "Leket Israel packing", value: "Mon 10:00" },
  ],
  Israel: [
    { icon: "☕️", label: "Local cafe pick", value: "Nearby" },
    { icon: "🍽", label: "New restaurant nearby", value: "This week" },
    { icon: "🗺", label: "Nearby attraction", value: "Student rate" },
    { icon: "🤝", label: "Volunteering slot", value: "This week" },
  ],
};

const HEADLINES = [
  { icon: "🚆", label: "Rail works: Navon–TLV runs at 20-min gaps Sunday" },
  { icon: "🎓", label: "Student Rav-Kav renewals open at post offices" },
  { icon: "🏖", label: "Public holiday next Thursday — most offices closed" },
  { icon: "🌧", label: "Weather alert: heavy rain in the north tonight" },
  { icon: "🚌", label: "New night bus line links Jerusalem to Modiin" },
  { icon: "🏥", label: "Kupot clinics extend evening hours this month" },
  { icon: "📶", label: "Nationwide test of the emergency alert system, 10:05" },
  { icon: "🥬", label: "Produce prices down ahead of the chag" },
];

const clamp = (n: number) => Math.max(0, Math.min(100, n));

export const WIDGETS: WidgetDef[] = [
  {
    id: "today",
    title: "Today",
    emoji: "🌤",
    gradient: "grad-sky",
    relevance: (c) => clamp(52 + (c.timeOfDay === "morning" ? 40 : c.timeOfDay === "early" ? 30 : 6) + (c.weather.rain > 50 ? 15 : 0)),
    build: (c) => ({
      headline: `${c.weather.temp}° ${c.weather.condition}`,
      sub: `${c.city} · feels ${c.weather.feels}° · H ${c.weather.high}° / L ${c.weather.low}°`,
      rows: c.isFriday
        ? [
            { icon: "🕯", label: "Candle lighting", value: c.zmanim.candle },
            { icon: "🍷", label: "Havdalah (tomorrow)", value: c.zmanim.havdalah },
            { icon: "☂️", label: "Rain chance", value: `${c.weather.rain}%` },
            { icon: "🫁", label: "Air quality", value: `AQI ${c.weather.aqi}` },
          ]
        : [
            { icon: "🌅", label: "Sunrise", value: c.zmanim.sunrise },
            { icon: "🌇", label: "Sunset", value: c.zmanim.sunset },
            { icon: "🔆", label: "UV index", value: `${c.weather.uv}` },
            { icon: "☂️", label: "Rain chance", value: `${c.weather.rain}%` },
            { icon: "🫁", label: "Air quality", value: `AQI ${c.weather.aqi}` },
          ],
      ctas: [{ label: "View forecast", to: "/explore" }],
    }),
  },
  {
    id: "wallet",
    title: "Wallet",
    emoji: "💳",
    gradient: "grad-wallet",
    relevance: (c) => clamp(58 + (c.signals.pendingSplits ? 22 : 0) + (c.timeOfDay === "morning" ? 12 : 0)),
    build: (c) => ({
      headline: "Your Shekk",
      sub: `Spent ${ils(c.signals.spentThisWeek)} this week`,
      rows: [
        { icon: "💰", label: "Cashback earned", value: ils(c.signals.cashback) },
        { icon: "👥", label: "Pending split requests", value: `${c.signals.pendingSplits}` },
        { icon: "🏷", label: "Promo codes available", value: "3" },
      ],
      ctas: [
        { label: "Add Credits", to: "/topup" },
        { label: "Split Bill", to: "/social" },
        { label: "View Activity", to: "/activity" },
      ],
    }),
  },
  {
    id: "jewish",
    title: "Jewish Life",
    emoji: "🕍",
    gradient: "grad-jewish",
    relevance: (c) =>
      clamp(
        30 +
          (c.isErevShabbat ? 60 : 0) +
          (c.isFriday ? 25 : 0) +
          (c.jewishDay ? (c.jewishDay.kind === "fast" ? 55 : 45) : 0) +
          (c.isShabbat ? 20 : 0),
      ),
    build: (c) => {
      if (c.jewishDay?.kind === "fast") {
        return {
          headline: c.jewishDay.label,
          sub: c.jewishDay.blurb,
          rows: [
            { icon: "🌑", label: "Fast begins", value: c.zmanim.sunrise },
            { icon: "✨", label: "Fast ends", value: c.zmanim.havdalah },
            { icon: "🕍", label: SHULS[0].name, value: "Kinot 09:00" },
          ],
          ctas: [{ label: "View Details", to: "/explore/community" }],
        };
      }
      if (c.jewishDay) {
        return {
          headline: c.jewishDay.label,
          sub: c.jewishDay.blurb,
          rows: [
            { icon: "🎉", label: "Nearby events", value: `${EVENTS.length} listed` },
            { icon: "📖", label: "Holiday guide", value: "5 min read" },
            { icon: "🕯", label: "Candle lighting", value: c.zmanim.candle },
          ],
          ctas: [{ label: "View Details", to: "/explore/community" }],
        };
      }
      return {
        headline: c.isFriday ? "Erev Shabbat" : "This week",
        sub: c.isFriday ? `Candles ${c.zmanim.candle} in ${c.city}` : `Minyanim and meals near ${c.city}`,
        rows: [
          { icon: "🕯", label: "Candle lighting", value: c.zmanim.candle },
          { icon: "🍽", label: "Friday night meals nearby", value: "7 open" },
          ...SHULS.slice(0, 2).map((s) => ({ icon: s.emoji, label: s.name, value: undefined })),
        ],
        ctas: [{ label: "View Details", to: "/explore/community" }],
      };
    },
  },
  {
    id: "travel",
    title: "Travel",
    emoji: "🚍",
    gradient: "grad-travel",
    relevance: (c) => clamp(40 + (c.timeOfDay === "morning" ? 38 : c.timeOfDay === "afternoon" ? 18 : 4) + (c.signals.ravKavLow ? 18 : 0)),
    build: (c) => {
      const rail = BUS_LINES.find((b) => b.line.startsWith("Rail")) ?? BUS_LINES[0];
      const bus = BUS_LINES[0];
      return {
        headline: `Next train in ${rail.mins + 23} min`,
        sub: rail.dest,
        rows: [
          { icon: "🚌", label: `Line ${bus.line} · ${bus.dest}`, value: `${bus.mins} min` },
          c.signals.ravKavLow
            ? { icon: "💳", label: "Rav-Kav balance is low", value: "Top up" }
            : { icon: "💳", label: "Rav-Kav balance", value: ils(c.signals.lastTransitSpend) },
          { icon: "🚗", label: "Traffic to Tel Aviv", value: rand(`${c.signals.seed}|traffic`) > 0.5 ? "Heavy" : "Clear" },
          { icon: "🚕", label: "Taxi prices right now", value: rand(`${c.signals.seed}|taxi`) > 0.5 ? "Cheaper" : "Normal" },
        ],
        ctas: [{ label: "Plan Journey", to: "/explore/transit" }],
      };
    },
  },
  {
    id: "deals",
    title: "Deals For You",
    emoji: "🍔",
    gradient: "grad-deals",
    relevance: (c) => clamp(34 + (c.timeOfDay === "afternoon" ? 42 : c.timeOfDay === "evening" ? 26 : 6)),
    build: (c) => {
      const favRestaurant = RESTAURANTS.find((r) => c.signals.topCategory.toLowerCase().includes("food")) ?? RESTAURANTS[0];
      return {
        headline: `Because you love ${c.signals.favouriteMerchant}`,
        sub: `Picked from your ${c.signals.topCategory.toLowerCase()} spending`,
        rows: [
          { icon: favRestaurant.emoji, label: `20% off ${favRestaurant.name}`, value: "Today" },
          { icon: "🎓", label: `${SHOPS[0].name} — ${SHOPS[0].promo}`, value: "Nearby" },
          { icon: "🛵", label: "Free delivery tonight on Wolt", value: "Until 23:00" },
          { icon: "🏷", label: `${SHOPS[1].name} — ${SHOPS[1].promo}`, value: "This week" },
        ],
        ctas: [{ label: "See deals", to: "/explore/shops" }],
      };
    },
  },
  {
    id: "nearby",
    title: "Happening Nearby",
    emoji: "🎉",
    gradient: "grad-events",
    relevance: (c) => clamp(32 + (c.timeOfDay === "evening" ? 44 : c.timeOfDay === "late" ? 30 : 8) + (c.dayOfWeek === 4 ? 12 : 0)),
    build: (c) => ({
      headline: `Tonight in ${c.city}`,
      sub: "Picked for your cohort",
      rows: (nearbyByCity[c.city] ?? nearbyByCity.Israel).map((label, i) => ({
        icon: ["🎊", "🍲", "🎸", "🧑‍🎓"][i % 4],
        label,
        value: undefined,
      })),
      ctas: [{ label: "View Events", to: "/explore/events" }],
    }),
  },
  {
    id: "social",
    title: "Social",
    emoji: "👥",
    gradient: "grad-social",
    relevance: (c) => clamp(30 + (c.signals.pendingSplits ? 30 : 0) + (c.timeOfDay === "evening" ? 16 : 0)),
    build: (c) => ({
      headline: c.signals.pendingSplits ? `${c.signals.pendingSplits} split requests waiting` : "Your cohort",
      sub: "From friends on Shekk",
      rows: [
        ...FEED.slice(0, 3).map((f) => ({ icon: f.emoji, label: `${f.who} ${f.what}`, value: f.when })),
        { icon: "📣", label: "Programme announcement from your madrich", value: "New" },
      ],
      ctas: [{ label: "Open", to: "/social" }],
    }),
  },
  {
    id: "discover",
    title: "Discover",
    emoji: "📍",
    gradient: "grad-discover",
    relevance: (c) => clamp(26 + (c.timeOfDay === "afternoon" ? 22 : 10)),
    build: (c) => ({
      headline: `Around ${c.city}`,
      sub: "Places students near you are going",
      rows: discoverByCity[c.city] ?? discoverByCity.Israel,
      ctas: [{ label: "Explore", to: "/explore" }],
    }),
  },
  {
    id: "news",
    title: "Israel Today",
    emoji: "📰",
    gradient: "grad-news",
    relevance: (c) => clamp(24 + (c.timeOfDay === "morning" ? 22 : 8)),
    build: (c) => {
      const start = Math.floor(rand(`${c.signals.seed}|news`) * HEADLINES.length);
      const rows = Array.from({ length: 4 }, (_, i) => HEADLINES[(start + i) % HEADLINES.length]);
      return {
        headline: "What's going on",
        sub: `Practical updates for ${c.city}`,
        rows,
        ctas: [{ label: "Read More", to: "/help" }],
      };
    },
  },
];

export const WIDGET_BY_ID = Object.fromEntries(WIDGETS.map((w) => [w.id, w])) as Record<string, WidgetDef>;

/** Extra flavour so identical contexts still differ per student. */
export function jitter(ctx: UserContext, id: string) {
  return rand(`${ctx.signals.seed}|${id}`) * 8;
}

export function orderWidgets(ctx: UserContext, pinned: string[], hidden: string[]): WidgetDef[] {
  const pinnedDefs = pinned.map((id) => WIDGET_BY_ID[id]).filter(Boolean).filter((w) => !hidden.includes(w.id));
  const rest = WIDGETS.filter((w) => !pinned.includes(w.id) && !hidden.includes(w.id)).sort(
    (a, b) => b.relevance(ctx) + jitter(ctx, b.id) - (a.relevance(ctx) + jitter(ctx, a.id)),
  );
  return [...pinnedDefs, ...rest];
}

export const sampleTip = (ctx: UserContext) =>
  pick(["Updated just now", "Personalised for you", "Based on your week", "Live for your area"], ctx.signals.seed);
