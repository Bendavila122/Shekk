export type GuideSection = { heading: string; body: string };

export type Guide = {
  id: string;
  emoji: string;
  kicker: string;
  title: string;
  blurb: string;
  readMins: number;
  intro: string;
  sections: GuideSection[];
};

export const GUIDES: Guide[] = [
  {
    id: "rav-kav",
    emoji: "🚌",
    kicker: "Getting around",
    title: "Rav-Kav without the queue",
    blurb: "Load your card from the app, and what to do when the driver's reader beeps red.",
    readMins: 3,
    intro:
      "The Rav-Kav is the one card that runs every bus, light rail and most trains. Here's how gap-year students actually use it.",
    sections: [
      {
        heading: "Anonymous vs personal",
        body: "An anonymous card works instantly but gets no student discount. A personal card takes ten minutes at a service centre with your passport and program letter, and cuts most fares by 50%.",
      },
      {
        heading: "Loading from Shekk",
        body: "Top up your Shekk credits, open Rav-Kav in Explore, and load a value or a monthly Hofshi Chodshi. Loads land within a minute — hold the card to your phone if your reader supports NFC.",
      },
      {
        heading: "When the reader beeps red",
        body: "Usually it means the load hasn't been collected yet. Tap again at a station validator or a light-rail machine to pull it down, then re-board.",
      },
    ],
  },
  {
    id: "shabbat-timing",
    emoji: "🕯️",
    kicker: "Jewish life",
    title: "Planning around Shabbat",
    blurb: "Last buses, last Wolt orders and the Thursday-night shop that saves your Friday.",
    readMins: 2,
    intro:
      "Everything in Israel bends around Friday afternoon. Get the rhythm right and Shabbat stops being stressful.",
    sections: [
      {
        heading: "Transport cuts off early",
        body: "Intercity buses thin out roughly three hours before candle-lighting and stop entirely about an hour before. In winter that can mean a 1:30pm last realistic bus from Tel Aviv to Jerusalem.",
      },
      {
        heading: "Shop Thursday night",
        body: "Friday supermarkets are chaos. Thursday after 9pm is quiet, and most delivery slots are still open.",
      },
      {
        heading: "Motzei Shabbat",
        body: "Food and transport restart about 90 minutes after Shabbat ends. Book your Saturday-night ride before Shabbat comes in — surge pricing spikes the moment everyone's phone switches on.",
      },
    ],
  },
  {
    id: "money-basics",
    emoji: "💳",
    kicker: "Money",
    title: "Paying like a local",
    blurb: "Cash vs card vs Bit, tipping norms, and why the shuk still wants coins.",
    readMins: 3,
    intro: "Israel is close to cashless, but the exceptions are the ones that catch students out.",
    sections: [
      {
        heading: "Where cash still rules",
        body: "Machane Yehuda stalls, some falafel counters, sherut taxis and small-town makolets. Keep ₪100 in small notes.",
      },
      {
        heading: "Tipping",
        body: "Sit-down restaurants: 10–12% and often cash, even when you pay the bill by card. Taxis and delivery: rounding up is normal, nothing more expected.",
      },
      {
        heading: "Splitting a bill",
        body: "Most places will happily split a card payment several ways. If they won't, one person pays and the rest square up in Shekk from the Social tab.",
      },
    ],
  },
  {
    id: "first-week",
    emoji: "🧳",
    kicker: "Settling in",
    title: "Your first week checklist",
    blurb: "SIM, Rav-Kav, bank-free spending and the five apps to set up on day one.",
    readMins: 4,
    intro: "Do these in order and week one stops feeling like admin and starts feeling like a gap year.",
    sections: [
      {
        heading: "Day 1 — connectivity",
        body: "Grab an Israeli eSIM before you land, or a physical SIM at the airport. Everything else — deliveries, rides, two-factor codes — assumes an Israeli number.",
      },
      {
        heading: "Day 2 — transport and spending",
        body: "Pick up a Rav-Kav, top up Shekk credits, and set your program and cohort in the Me tab so cohort threads and student pricing show up.",
      },
      {
        heading: "Day 3 — your neighbourhood",
        body: "Find your makolet, your pharmacy, your minyan and your laundry. Save them in Shekk so they surface in For You.",
      },
    ],
  },
  {
    id: "health-admin",
    emoji: "🩺",
    kicker: "Health & admin",
    title: "Doctors, pharmacies and visas",
    blurb: "What travel insurance actually covers here, and how to see a doctor same-day.",
    readMins: 3,
    intro: "Getting sick abroad is manageable once you know which door to knock on.",
    sections: [
      {
        heading: "Same-day care",
        body: "Private walk-in clinics see students within a couple of hours for a flat fee, and issue receipts your insurer accepts. Terem operates late-night urgent care in most cities.",
      },
      {
        heading: "Pharmacies",
        body: "Super-Pharm carries most over-the-counter equivalents under different brand names — search the active ingredient, not the name you know from home.",
      },
      {
        heading: "Visa extensions",
        body: "A B/2 tourist entry is usually stamped for three months. Extensions go through the Population Authority and need a program letter, so start two weeks before you expire.",
      },
    ],
  },
  {
    id: "tiyul-days",
    emoji: "🥾",
    kicker: "Trips",
    title: "Doing a tiyul properly",
    blurb: "Water, timing, entrance fees and the trails that don't need a car.",
    readMins: 2,
    intro: "Half the country is reachable on a bus and a good pair of shoes. The other half needs planning.",
    sections: [
      {
        heading: "Water maths",
        body: "Three litres per person in summer, minimum. Nature reserves sell nothing once you're past the gate.",
      },
      {
        heading: "Start stupidly early",
        body: "Trailheads in the Negev and Galil close entry around midday in summer. A 6am bus is the difference between a hike and a turnaround.",
      },
      {
        heading: "Paying for entry",
        body: "Most reserves take card. Book tickets through Explore so student pricing and your group booking stay in one place.",
      },
    ],
  },
];

export function getGuide(id: string) {
  return GUIDES.find((g) => g.id === id) ?? null;
}
