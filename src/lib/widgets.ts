/** "For You" widget catalogue — content + relevance scoring. */
import type { ReactNode } from "react";
import { EVENTS, BUS_LINES, RESTAURANTS, SHOPS, SHULS, ils } from "./mock";
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
  /** Content-reactive gradient (e.g. sunny = gold, rainy = slate). */
  gradientFor?: (ctx: UserContext) => string;
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
    gradientFor: (c) => {
      const night = c.timeOfDay === "late" || c.hour >= 20 || c.hour < 5;
      if (night) return "grad-night";
      if (c.weather.rain > 50 || c.weather.condition === "Light rain") return "grad-rain";
      switch (c.weather.condition) {
        case "Clear":
          return "grad-sun";
        case "Mostly sunny":
          return c.weather.temp >= 30 ? "grad-sun" : "grad-partly";
        case "Partly cloudy":
          return "grad-cloud";
        case "Hamsin haze":
          return "grad-haze";
        default:
          return "grad-partly";
      }
    },
    relevance: (c) => clamp(52 + (c.timeOfDay === "morning" ? 40 : c.timeOfDay === "early" ? 30 : 6) + (c.weather.rain > 50 ? 15 : 0)),
    build: (c) => ({
      headline: `${c.weather.temp}° ${c.weather.condition}`,
      sub: `${c.weatherCity} · feels ${c.weather.feels}° · H ${c.weather.high}° / L ${c.weather.low}°`,
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
      ctas: [],
    }),
  },
  {
    id: "jewish",
    title: "Jewish Life",
    emoji: "🕍",
    gradient: "grad-jewish",
    gradientFor: (c) =>
      c.jewishDay?.kind === "fast" ? "grad-fast" : c.jewishDay ? "grad-chag" : c.isErevShabbat || c.isShabbat ? "grad-night" : "grad-jewish",
    relevance: (c) =>
      clamp(
        45 +
          (c.isErevShabbat ? 55 : 0) +
          (c.isFriday ? 25 : 0) +
          (c.jewishDay ? (c.jewishDay.kind === "fast" ? 45 : 35) : 0) +
          (c.isShabbat ? 20 : 0),
      ),
    build: (c) => {
      const base = [
        { icon: "📜", label: "This week's sedra", value: `Parashat ${c.sedra}` },
        { icon: "🗓", label: "Today", value: c.hebrewDate },
      ];
      if (c.jewishDay?.kind === "fast") {
        return {
          headline: c.jewishDay.label,
          sub: c.hebrewDate,
          rows: [
            ...base,
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
          sub: c.hebrewDate,
          rows: [
            ...base,
            { icon: "🎉", label: "Nearby events", value: `${EVENTS.length} listed` },
            { icon: "🕯", label: "Candle lighting", value: c.zmanim.candle },
          ],
          ctas: [{ label: "View Details", to: "/explore/community" }],
        };
      }
      return {
        headline: `Parashat ${c.sedra}`,
        sub: c.hebrewDate,
        rows: [
          ...base,
          { icon: "🕯", label: "Candle lighting", value: c.zmanim.candle },
          { icon: "🍷", label: "Havdalah", value: c.zmanim.havdalah },
          { icon: "🍽", label: "Friday night meals nearby", value: "7 open" },
          ...SHULS.slice(0, 2).map((s) => ({ icon: s.emoji, label: s.name, value: undefined })),
        ],
        ctas: [{ label: "View Details", to: "/explore/community" }],
      };
    },
  },
  {
    id: "promo-event",
    title: "Featured Event",
    emoji: "🎟",
    gradient: "grad-events",
    relevance: (c) => clamp(62 + (c.timeOfDay === "evening" ? 18 : 8) + (c.dayOfWeek === 0 || c.dayOfWeek === 1 ? 10 : 0)),
    build: (c) => {
      const e = EVENTS[0];
      const promo = Math.round(e.price * 0.7);
      return {
        headline: `${e.name} — ₪${promo}`,
        sub: `30% off with Shekk · was ${ils(e.price)}`,
        rows: [
          { icon: e.emoji, label: e.name, value: `₪${promo}` },
          { icon: "🏫", label: e.host, value: e.when },
          { icon: "🎫", label: "Spots left", value: `${e.spots}` },
          { icon: "🏷", label: "Code SHEKK30 applied at checkout", value: "Ends Thu" },
          { icon: "📍", label: `Buses leave ${c.city} 13:30`, value: "Included" },
        ],
        ctas: [
          { label: "Get ticket", to: "/explore/events" },
          { label: "All events", to: "/explore/events" },
        ],
      };
    },
  },
  {
    id: "deals",
    title: "Food Deal",
    emoji: "🍕",
    gradient: "grad-deals",
    relevance: (c) => clamp(50 + (c.timeOfDay === "afternoon" ? 32 : c.timeOfDay === "evening" ? 30 : 8)),
    build: (c) => {
      const r = RESTAURANTS[0];
      const item = r.items[0];
      const deal = Math.round(item.price * 0.5);
      return {
        headline: `2 for 1 at ${r.name}`,
        sub: `${item.name} ₪${deal} each tonight · ${r.eta}`,
        rows: [
          { icon: r.emoji, label: `${item.name} — was ₪${item.price}`, value: `₪${deal}` },
          { icon: "🛵", label: "Free delivery over ₪60", value: "Until 23:00" },
          { icon: "🥙", label: `${RESTAURANTS[1].name} — 20% student discount`, value: "Today" },
          { icon: "🏷", label: `Because you love ${c.signals.favouriteMerchant}`, value: "Picked" },
        ],
        ctas: [
          { label: "Order now", to: "/explore/food" },
          { label: "More deals", to: "/explore/shops" },
        ],
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
    title: "Requests",
    emoji: "👥",
    gradient: "grad-social",
    gradientFor: (c) => (c.signals.pendingSplits ? "grad-alert" : "grad-social"),
    relevance: (c) => clamp(40 + (c.signals.pendingSplits ? 38 : 0) + (c.timeOfDay === "evening" ? 12 : 0)),
    build: (c) => ({
      headline: c.signals.pendingSplits ? `${ils(c.signals.requestedTotal)} requested` : "All settled",
      sub: c.signals.pendingSplits
        ? `${c.signals.pendingSplits} friend${c.signals.pendingSplits > 1 ? "s" : ""} waiting to be paid back`
        : "No one is waiting on you",
      rows: [
        ...c.signals.requests.map((r) => ({ icon: "🙋", label: `${r.from} · ${r.reason}`, value: ils(r.amount) })),
      ],
      ctas: [{ label: "Pay back", to: "/social" }],
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
    gradientFor: (c) => (c.weather.rain > 60 ? "grad-alert" : "grad-news"),
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
