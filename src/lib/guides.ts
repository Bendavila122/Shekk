/**
 * Guides — the reference app inside Shekk. Content is authored here in code so
 * it loads instantly, works offline, and can't drift out of sync with a
 * database. Each guide is a short, opinionated answer to a real question a
 * gap-year student asks in their first month.
 *
 * Prices and phone numbers were correct at the `updated` date on each guide.
 */

export type GuideBlock =
  /** Plain prose. */
  | { kind: "p"; text: string }
  /** An ordered how-to. Rendered with numbered chips. */
  | { kind: "steps"; items: string[] }
  /** A tickable list. `id` keeps ticks stable across content edits. */
  | { kind: "checklist"; id: string; items: string[] }
  /** A highlighted aside. */
  | { kind: "note"; tone: "tip" | "warn" | "money"; title: string; text: string }
  /** Two-column facts: costs, hours, numbers. */
  | { kind: "facts"; rows: { label: string; value: string }[] }
  /** What to say, in Hebrew, and how to say it. */
  | { kind: "hebrew"; rows: { en: string; he: string; say: string }[] }
  /** Jump straight into the part of Shekk that does the thing. */
  | { kind: "link"; label: string; sub: string; to: string; params?: Record<string, string> };

export type GuideSection = { heading: string; blocks: GuideBlock[] };

export type GuideCategoryId =
  | "getting-around"
  | "money"
  | "settling-in"
  | "jewish-life"
  | "health-safety"
  | "official"
  | "trips";

export type Guide = {
  id: string;
  emoji: string;
  /** Category id — also the label shown as the kicker. */
  category: GuideCategoryId;
  title: string;
  blurb: string;
  readMins: number;
  /** ISO date the facts in here were last checked. */
  updated: string;
  /** Extra search terms — what students actually type. */
  tags: string[];
  /** The answer, before the article. */
  tldr: string[];
  intro: string;
  sections: GuideSection[];
};

export const GUIDE_CATEGORIES: { id: GuideCategoryId; label: string; emoji: string }[] = [
  { id: "getting-around", label: "Getting around", emoji: "🚌" },
  { id: "money", label: "Money", emoji: "💳" },
  { id: "settling-in", label: "Settling in", emoji: "🧳" },
  { id: "jewish-life", label: "Jewish life", emoji: "🕯️" },
  { id: "health-safety", label: "Health & safety", emoji: "🩺" },
  { id: "official", label: "Admin & official", emoji: "🛂" },
  { id: "trips", label: "Trips", emoji: "🥾" },
];

export function categoryLabel(id: GuideCategoryId) {
  return GUIDE_CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

export const GUIDES: Guide[] = [
  /* ─────────────────────────── Getting around ─────────────────────────── */
  {
    id: "rav-kav",
    emoji: "🚌",
    category: "getting-around",
    title: "Rav-Kav, end to end",
    blurb: "Getting a personal card, the 50% student discount, and what to do when the reader beeps red.",
    readMins: 4,
    updated: "2026-07-20",
    tags: ["rav kav", "ravkav", "bus card", "student discount", "hofshi chodshi", "moovit"],
    tldr: [
      "Anonymous card works today; a personal card halves almost every fare.",
      "Load value or a monthly Hofshi Chodshi from your phone, then validate to collect it.",
      "Red beep almost always means an uncollected load, not an empty card.",
    ],
    intro:
      "One card runs the buses, the light rail and most trains. Getting the personal version in your first week is the single biggest money saver of your year.",
    sections: [
      {
        heading: "Anonymous vs personal",
        blocks: [
          {
            kind: "p",
            text: "An anonymous card is sold at any station machine and works the moment you load it — but it carries no discount profile, so you pay full fare all year. A personal card is printed with your photo and carries your student or youth profile.",
          },
          {
            kind: "facts",
            rows: [
              { label: "Anonymous card", value: "About ₪5, instant, full fare" },
              { label: "Personal card", value: "Free, ~10 min at a service centre" },
              { label: "Student profile", value: "Roughly 50% off most fares" },
              { label: "Under 18 profile", value: "Discounted without a student letter" },
            ],
          },
        ],
      },
      {
        heading: "Getting the personal card",
        blocks: [
          {
            kind: "steps",
            items: [
              "Find a Rav-Kav service centre — central bus stations, big light-rail stops, and some post offices.",
              "Bring your passport, your program letter, and your Israeli phone number.",
              "Ask for a personal card with the student (or youth) profile applied.",
              "They photograph you on the spot and print the card while you wait.",
              "Load a small amount before you leave and validate it at the machine to check the profile took.",
            ],
          },
          {
            kind: "note",
            tone: "warn",
            title: "Check the profile before you walk out",
            text: "If the discount wasn't applied, the card looks identical and you'll only notice when you're paying full fare a week later. Ask them to show you the profile on screen.",
          },
        ],
      },
      {
        heading: "Loading from your phone",
        blocks: [
          {
            kind: "p",
            text: "You can load value or a monthly pass without going near a machine. The load is issued instantly but sits in the cloud until the card 'collects' it at a validator.",
          },
          {
            kind: "steps",
            items: [
              "Top up your Shekk balance first.",
              "Open Transit in Shekk and choose value or a monthly Hofshi Chodshi.",
              "Hold the card to the back of your phone if it supports NFC, or tap the card at any station validator within a day.",
            ],
          },
          {
            kind: "link",
            label: "Open Transit",
            sub: "Load a card or check a route",
            to: "/explore/transit",
          },
        ],
      },
      {
        heading: "Which pass is worth it",
        blocks: [
          {
            kind: "p",
            text: "Hofshi Chodshi is a monthly unlimited pass tied to a set of zones. If you ride more than roughly twice a day inside your city, it pays for itself; if you mostly walk and take an occasional intercity bus, stored value is cheaper.",
          },
          {
            kind: "note",
            tone: "money",
            title: "Free transfers",
            text: "A single fare already covers 90 minutes of transfers inside the same zone, so a bus-then-light-rail hop is usually one payment, not two. Validate every leg anyway.",
          },
        ],
      },
      {
        heading: "When the reader beeps red",
        blocks: [
          {
            kind: "p",
            text: "In order of likelihood: an online load you haven't collected, a card that's out of balance, or a profile that expired. None of them require a new card.",
          },
          {
            kind: "steps",
            items: [
              "Step off at the next stop rather than arguing with the driver — they can't fix loads.",
              "Tap the card on a station validator or a light-rail machine to pull the load down.",
              "Re-board and validate. If it still fails, a service centre can read the card's history and fix it.",
            ],
          },
          {
            kind: "hebrew",
            rows: [
              { en: "Can you check my card?", he: "אפשר לבדוק לי את הכרטיס?", say: "Efshar livdok li et ha-kartis?" },
              { en: "I loaded it on the app", he: "טענתי באפליקציה", say: "Ta'anti ba-aplikatzia" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "buses-trains-sherut",
    emoji: "🚆",
    category: "getting-around",
    title: "Buses, trains and monit sherut",
    blurb: "Which one to take between cities, what each costs, and the shared taxi nobody explains.",
    readMins: 4,
    updated: "2026-07-20",
    tags: ["bus", "train", "rakevet", "sherut", "monit", "egged", "dan", "intercity", "moovit"],
    tldr: [
      "Train for Tel Aviv–Haifa and the airport; bus for almost everything else.",
      "Monit sherut is a shared taxi on a fixed route, pay the driver in cash.",
      "Check the last departure before you leave, especially on Friday.",
    ],
    intro:
      "Israel is small enough that nearly every trip is under three hours. Picking the right mode is mostly about the day and the hour, not the distance.",
    sections: [
      {
        heading: "The quick rule",
        blocks: [
          {
            kind: "facts",
            rows: [
              { label: "Tel Aviv ↔ Jerusalem", value: "Fast train, ~35 min underground" },
              { label: "Coastal cities", value: "Train — Haifa, Netanya, Ashkelon" },
              { label: "Jerusalem hills, Negev, Golan", value: "Bus, often the only option" },
              { label: "Inside a city, late night", value: "Sherut or a ride app" },
            ],
          },
          {
            kind: "p",
            text: "Everything above takes the same Rav-Kav, so you rarely need to plan payment — just plan the timing.",
          },
        ],
      },
      {
        heading: "Buses",
        blocks: [
          {
            kind: "p",
            text: "Intercity buses leave from the central station (tachana merkazit) and board at numbered platforms. Long-distance routes fill up; on Sunday mornings and Thursday evenings expect to stand if you arrive at the last minute.",
          },
          {
            kind: "note",
            tone: "tip",
            title: "Signal the driver",
            text: "Outside city centres buses don't stop unless someone waves. Stand at the pole and put your arm out as it approaches.",
          },
        ],
      },
      {
        heading: "Trains",
        blocks: [
          {
            kind: "p",
            text: "Israel Railways is clean, punctual and the fastest link between the coast and Jerusalem. Validate your Rav-Kav at the gate on entry and again on exit — missing the exit tap can leave the journey open and overcharge you.",
          },
          {
            kind: "note",
            tone: "warn",
            title: "Security queue",
            text: "Every station has a bag check. Add ten minutes at Tel Aviv Savidor and Jerusalem Yitzhak Navon at rush hour.",
          },
        ],
      },
      {
        heading: "Monit sherut",
        blocks: [
          {
            kind: "p",
            text: "A ten-seat yellow van that runs a numbered bus route without a timetable — it leaves when it fills. It's the one thing that keeps moving on Friday afternoon and Saturday, and it's how locals get between Tel Aviv and Jerusalem cheaply after the buses stop.",
          },
          {
            kind: "steps",
            items: [
              "Find the sherut rank — usually beside the central bus station.",
              "Get in, pass your cash forward; change comes back down the row.",
              "Say 'nehag, atzor bevakasha' or press the buzzer to get off anywhere on the route.",
            ],
          },
          {
            kind: "hebrew",
            rows: [
              { en: "Driver, stop please", he: "נהג, עצור בבקשה", say: "Nehag, atzor bevakasha" },
              { en: "How much?", he: "כמה זה עולה?", say: "Kama ze oleh?" },
              { en: "Does it go to…?", he: "זה נוסע ל...?", say: "Ze nose'a le…?" },
            ],
          },
          {
            kind: "note",
            tone: "money",
            title: "Cash only",
            text: "Sherut drivers don't take Rav-Kav or card. Keep ₪50 in small notes if you're travelling late.",
          },
        ],
      },
      {
        heading: "Planning a trip",
        blocks: [
          {
            kind: "link",
            label: "Open Maps",
            sub: "Live routes, platforms and walking legs",
            to: "/explore/maps",
          },
          {
            kind: "link",
            label: "Read: getting around on Shabbat",
            sub: "What still runs from Friday afternoon",
            to: "/guides/$id",
            params: { id: "shabbat-transport" },
          },
        ],
      },
    ],
  },
  {
    id: "shabbat-transport",
    emoji: "🕰️",
    category: "getting-around",
    title: "Getting around on Shabbat",
    blurb: "What stops, what keeps running, and how not to get stranded in the wrong city.",
    readMins: 3,
    updated: "2026-07-20",
    tags: ["shabbat", "friday", "last bus", "sherut", "motzei shabbat", "stranded"],
    tldr: [
      "Public transport thins out ~3 hours before candle-lighting and stops about an hour before.",
      "Sherut vans and ride apps keep running, at a premium.",
      "Book your Saturday-night ride before Shabbat starts — prices spike the second phones come back on.",
    ],
    intro:
      "The single most common gap-year mistake is assuming the last bus is later than it is. Winter Fridays are brutally early.",
    sections: [
      {
        heading: "The Friday timeline",
        blocks: [
          {
            kind: "facts",
            rows: [
              { label: "~3 hrs before candle-lighting", value: "Intercity buses thin out fast" },
              { label: "~1 hr before", value: "Last realistic departure" },
              { label: "Winter reality", value: "Last useful Tel Aviv → Jerusalem bus can be early afternoon" },
              { label: "Restarts", value: "About 90 min after Shabbat ends" },
            ],
          },
          {
            kind: "note",
            tone: "warn",
            title: "Candle-lighting moves weekly",
            text: "It shifts by minutes every week and by an hour at the clock change. Check the time for your city on the day, not the time you remember from last month.",
          },
        ],
      },
      {
        heading: "What keeps running",
        blocks: [
          {
            kind: "p",
            text: "Sherut vans run through Shabbat on the main intercity corridors. Ride apps work everywhere, and buses run normally in Haifa and in some mixed cities.",
          },
          {
            kind: "note",
            tone: "money",
            title: "Motzei Shabbat surge",
            text: "The moment Shabbat ends, everyone opens the same app at once. Book before Shabbat comes in, or wait 45 minutes for prices to fall.",
          },
        ],
      },
      {
        heading: "If you're stuck",
        blocks: [
          {
            kind: "steps",
            items: [
              "Message your madrich or cohort thread before Shabbat — someone is usually driving your way.",
              "Check the sherut rank at the central station; they run later than you think.",
              "If nothing moves, stay put. Being a guest for Shabbat is normal here and costs nothing.",
            ],
          },
          {
            kind: "link",
            label: "Ask your cohort",
            sub: "Post in your program thread",
            to: "/social",
          },
        ],
      },
    ],
  },

  /* ───────────────────────────────  Money  ─────────────────────────────── */
  {
    id: "money-basics",
    emoji: "💳",
    category: "money",
    title: "Paying like a local",
    blurb: "Card, cash, Bit and tipping — and why the shuk still wants coins.",
    readMins: 4,
    updated: "2026-07-20",
    tags: ["cash", "card", "bit", "tip", "tipping", "shuk", "makolet", "split"],
    tldr: [
      "Card works nearly everywhere; keep ₪100 in small notes for the exceptions.",
      "Tip 10–12% sit-down, often in cash even when the bill goes on card.",
      "Splitting a bill several ways is normal — just ask.",
    ],
    intro:
      "Israel is close to cashless, but the exceptions are exactly the places students spend: market stalls, falafel counters and shared taxis.",
    sections: [
      {
        heading: "Where cash still rules",
        blocks: [
          {
            kind: "facts",
            rows: [
              { label: "Machane Yehuda & Carmel stalls", value: "Cash, sometimes Bit" },
              { label: "Falafel and shawarma counters", value: "Often cash under ₪30" },
              { label: "Monit sherut", value: "Cash only" },
              { label: "Small-town makolet", value: "Card, but minimum spend is common" },
            ],
          },
        ],
      },
      {
        heading: "Tipping",
        blocks: [
          {
            kind: "p",
            text: "Sit-down restaurants and cafés expect 10–12%. Service is rarely included, and staff usually prefer the tip in cash even when you pay the bill by card — many places can't add it to the terminal.",
          },
          {
            kind: "facts",
            rows: [
              { label: "Café or restaurant", value: "10–12%, cash preferred" },
              { label: "Taxi", value: "Round up, nothing more" },
              { label: "Delivery", value: "A few shekels, optional" },
              { label: "Bar", value: "A shekel or two a drink" },
            ],
          },
        ],
      },
      {
        heading: "Bit and local transfers",
        blocks: [
          {
            kind: "p",
            text: "Bit is the Israeli phone-to-phone payment everyone uses to square up. It's tied to an Israeli bank account, so most gap-year students can't send with it — but you can usually receive, and market stalls will happily take it from an Israeli friend who then collects from you.",
          },
          {
            kind: "note",
            tone: "tip",
            title: "Square up inside Shekk instead",
            text: "One person pays the whole bill, then everyone settles in Shekk from Social. No bank account, no exchange rate, no chasing.",
          },
          { kind: "link", label: "Split a bill", sub: "Send or request from your cohort", to: "/social" },
        ],
      },
      {
        heading: "Reading a bill",
        blocks: [
          {
            kind: "hebrew",
            rows: [
              { en: "The bill, please", he: "חשבון בבקשה", say: "Cheshbon bevakasha" },
              { en: "Can we split it?", he: "אפשר לחלק?", say: "Efshar lechalek?" },
              { en: "Is service included?", he: "השירות כלול?", say: "Ha-sherut kalul?" },
            ],
          },
          {
            kind: "note",
            tone: "money",
            title: "Tashlumim",
            text: "Card terminals ask how many payments you want to split a purchase into. For anything small, answer 'one' — 'ahat'.",
          },
        ],
      },
    ],
  },
  {
    id: "money-home",
    emoji: "🌍",
    category: "money",
    title: "Dollars in, shekels out",
    blurb: "How to move money from home without losing 6% to a bad rate.",
    readMins: 3,
    updated: "2026-07-20",
    tags: ["exchange", "fx", "dollars", "usd", "atm", "conversion", "dcc", "top up"],
    tldr: [
      "Always choose to be charged in shekels, never in dollars, at a terminal or ATM.",
      "Airport and hotel exchange desks are the worst rate you'll see all year.",
      "Fund your Shekk balance in one bigger transfer rather than many small ones.",
    ],
    intro:
      "Currency conversion is where a gap-year budget quietly leaks. Three habits keep almost all of it in your pocket.",
    sections: [
      {
        heading: "Never let a machine convert for you",
        blocks: [
          {
            kind: "p",
            text: "When an ATM or card terminal offers to charge you in dollars 'so you know the amount', that's dynamic currency conversion — the machine picks the rate and it is always worse. Choose shekels every time.",
          },
          {
            kind: "note",
            tone: "money",
            title: "The real cost",
            text: "DCC typically adds 3–6% invisibly. On a year of spending that's a flight home.",
          },
        ],
      },
      {
        heading: "Where to change money",
        blocks: [
          {
            kind: "facts",
            rows: [
              { label: "Best", value: "Fund Shekk directly, or an in-town change shop" },
              { label: "Fine", value: "Bank ATM withdrawing in shekels" },
              { label: "Avoid", value: "Airport desks, hotel desks, tourist-strip kiosks" },
            ],
          },
          {
            kind: "p",
            text: "In-town change shops in Jerusalem and Tel Aviv post their rates in the window and don't charge commission. Compare two before you hand anything over.",
          },
        ],
      },
      {
        heading: "Funding Shekk",
        blocks: [
          {
            kind: "p",
            text: "You fund your balance in dollars (or another home currency) and hold shekels. You see the rate before you confirm, so there's nothing hidden — but each transfer has a floor cost, so fewer, larger top-ups beat a dozen small ones.",
          },
          { kind: "link", label: "Check today's rate", sub: "Exchange, inside Shekk", to: "/exchange" },
          { kind: "link", label: "Top up", sub: "Add money to your balance", to: "/topup" },
        ],
      },
    ],
  },

  /* ───────────────────────────── Settling in ──────────────────────────── */
  {
    id: "first-week",
    emoji: "🧳",
    category: "settling-in",
    title: "Your first week, day by day",
    blurb: "Connectivity, transport, money and neighbourhood — in the order that actually works.",
    readMins: 5,
    updated: "2026-07-20",
    tags: ["arrival", "first week", "checklist", "sim", "rav kav", "settling", "day one"],
    tldr: [
      "Day 1 is a phone number — everything else depends on it.",
      "Day 2 is transport and money. Day 3 is your five-minute radius.",
      "By day 5 you should know your makolet, your pharmacy and your minyan.",
    ],
    intro:
      "Do these in order and week one stops feeling like admin. Do them out of order and you'll spend a Tuesday queueing for something you can't get yet.",
    sections: [
      {
        heading: "Day 1 — a phone number",
        blocks: [
          {
            kind: "p",
            text: "An Israeli number is the key to everything else: deliveries, ride apps, two-factor codes, and the service centre that wants to text you a confirmation. Sort it before you sort anything else.",
          },
          {
            kind: "link",
            label: "Read: SIM and eSIM",
            sub: "Which one, and what it costs",
            to: "/guides/$id",
            params: { id: "sim-and-esim" },
          },
        ],
      },
      {
        heading: "Day 2 — transport and money",
        blocks: [
          {
            kind: "steps",
            items: [
              "Get a personal Rav-Kav with the student profile — bring your passport and program letter.",
              "Top up your Shekk balance so you're not hunting an ATM on day three.",
              "Set your program and cohort in Me, so cohort threads and student pricing appear.",
            ],
          },
        ],
      },
      {
        heading: "Day 3 — your five-minute radius",
        blocks: [
          {
            kind: "p",
            text: "Find the four places you'll use every week and save them. Everything after this gets easier because you stop making decisions.",
          },
          {
            kind: "checklist",
            id: "radius",
            items: [
              "Makolet — the corner shop that's open when the supermarket isn't",
              "Pharmacy — ideally a Super-Pharm for the late hours",
              "Minyan or community you'd actually walk to",
              "Laundry, and whether your building has one",
              "The nearest cash machine that isn't in a tourist strip",
            ],
          },
        ],
      },
      {
        heading: "Day 4–5 — paperwork and people",
        blocks: [
          {
            kind: "checklist",
            id: "paperwork",
            items: [
              "Photograph your passport, visa stamp and insurance card, and store them somewhere you can reach without wifi",
              "Save your insurance policy number in Health",
              "Note your program office number and your madrich's number",
              "Add two friends in Social so splitting a bill doesn't need a group chat",
              "Learn your address in Hebrew well enough to say it to a driver",
            ],
          },
          { kind: "link", label: "Set up Health", sub: "Insurance card and hotlines, offline-ready", to: "/explore/health" },
        ],
      },
      {
        heading: "The mistakes everyone makes",
        blocks: [
          {
            kind: "note",
            tone: "warn",
            title: "Three to avoid",
            text: "Buying a full-fare anonymous Rav-Kav and never upgrading. Changing money at the airport. Arriving at the central bus station on Friday at 2pm and assuming there's a bus.",
          },
        ],
      },
    ],
  },
  {
    id: "sim-and-esim",
    emoji: "📱",
    category: "settling-in",
    title: "SIM, eSIM and staying connected",
    blurb: "What to buy, where, and why your home number still matters.",
    readMins: 3,
    updated: "2026-07-20",
    tags: ["sim", "esim", "phone", "data", "hot mobile", "partner", "cellcom", "pelephone", "number"],
    tldr: [
      "An eSIM bought before you fly gets you online at the gate.",
      "A physical Israeli SIM with a real number is worth it for a full year.",
      "Keep your home number alive for bank and 2FA codes.",
    ],
    intro:
      "Israeli mobile plans are cheap by American standards. The decision is really about whether you need an Israeli number or just data.",
    sections: [
      {
        heading: "eSIM vs physical SIM",
        blocks: [
          {
            kind: "facts",
            rows: [
              { label: "Travel eSIM", value: "Data only, no Israeli number, instant" },
              { label: "Israeli SIM", value: "Real number, cheap monthly, needs ID" },
              { label: "Typical monthly", value: "Low double-digit shekels for generous data" },
              { label: "Contract", value: "Ask for no commitment — 'lelo hitchaivut'" },
            ],
          },
          {
            kind: "note",
            tone: "warn",
            title: "Data-only isn't enough for a year",
            text: "Ride apps, deliveries and government services all text an Israeli number. Plan to get one in week one even if you land on an eSIM.",
          },
        ],
      },
      {
        heading: "Buying one here",
        blocks: [
          {
            kind: "steps",
            items: [
              "Bring your passport — you can't buy a registered SIM without it.",
              "Ask for a prepaid or no-commitment monthly plan, not a contract.",
              "Check the plan includes calls abroad if you'll call home.",
              "Test a call and a text in the shop before you leave.",
            ],
          },
        ],
      },
      {
        heading: "Keeping your home number",
        blocks: [
          {
            kind: "p",
            text: "Your home bank, your airline and most American two-factor systems will keep texting your old number. Keep it alive on a cheap plan, or move those accounts to an authenticator app before you fly.",
          },
          {
            kind: "note",
            tone: "tip",
            title: "Wifi calling",
            text: "Leaving your home SIM in the phone with wifi calling on means family can reach your old number without roaming charges.",
          },
        ],
      },
    ],
  },
  {
    id: "renting-a-room",
    emoji: "🔑",
    category: "settling-in",
    title: "Renting a room without getting burned",
    blurb: "What an Israeli lease actually says, what arnona is, and the scams to spot.",
    readMins: 5,
    updated: "2026-07-20",
    tags: ["rent", "dira", "apartment", "lease", "arnona", "vaad bayit", "deposit", "scam", "roommate"],
    tldr: [
      "Rent is almost never the whole cost — add arnona, va'ad bayit and bills.",
      "Never send a deposit for a flat you haven't stood inside.",
      "Get the check-out condition and the deposit-return terms in writing.",
    ],
    intro:
      "If you're moving out of program housing, the Israeli rental market moves fast and forgives nothing. Knowing four words puts you ahead of most first-year renters.",
    sections: [
      {
        heading: "The four words",
        blocks: [
          {
            kind: "facts",
            rows: [
              { label: "Dira", value: "Apartment" },
              { label: "Arnona", value: "Municipal tax, billed every two months, usually on you" },
              { label: "Va'ad bayit", value: "Building fee for cleaning, lift and stairwell" },
              { label: "Sochen", value: "Agent — often one month's rent as a fee" },
            ],
          },
          {
            kind: "note",
            tone: "money",
            title: "Budget the real number",
            text: "Rent plus arnona plus va'ad bayit plus electricity and water is typically well above the advertised figure. Ask for last winter's bills before you sign.",
          },
        ],
      },
      {
        heading: "Viewing",
        blocks: [
          {
            kind: "checklist",
            id: "viewing",
            items: [
              "Water pressure in the shower, with the tap fully open",
              "Mould in the corners and around windows — winter here is wet",
              "Heating and air conditioning, actually switched on",
              "Boiler type, and whether it's solar (dud shemesh)",
              "Mamad or the nearest shelter, and how long it takes to reach",
              "Phone signal inside the flat, not just at the door",
            ],
          },
        ],
      },
      {
        heading: "The contract",
        blocks: [
          {
            kind: "p",
            text: "Contracts are usually in Hebrew. You are entitled to take it away and have it translated — anyone pressuring you to sign on the spot is telling you something.",
          },
          {
            kind: "steps",
            items: [
              "Confirm the rent, the term, and exactly which bills you pay.",
              "Photograph every existing scratch and stain on the day you move in, and send them to the landlord.",
              "Agree in writing what condition the flat must be in for the deposit to come back.",
              "Check whether a guarantor or post-dated cheques are required — very common here.",
            ],
          },
        ],
      },
      {
        heading: "Scams to spot",
        blocks: [
          {
            kind: "note",
            tone: "warn",
            title: "Never pay before you've stood in the room",
            text: "The classic version: a great flat, a landlord 'currently abroad', and a request to wire a deposit to hold it. The flat isn't theirs. Photos are lifted from an old listing.",
          },
          {
            kind: "p",
            text: "Other flags: refusing a video call from inside the flat, a price well below everything comparable, and pressure to decide within the hour.",
          },
          { kind: "link", label: "Open Housing", sub: "Rooms and listings inside Shekk", to: "/explore/housing" },
        ],
      },
    ],
  },

  /* ───────────────────────────── Jewish life ──────────────────────────── */
  {
    id: "shabbat-timing",
    emoji: "🕯️",
    category: "jewish-life",
    title: "Planning around Shabbat",
    blurb: "Last orders, the Thursday-night shop, and how to make Friday calm.",
    readMins: 3,
    updated: "2026-07-20",
    tags: ["shabbat", "friday", "shopping", "wolt", "candle lighting", "motzei shabbat"],
    tldr: [
      "Shop Thursday night, not Friday morning.",
      "Delivery and restaurants stop hours before Shabbat, not at candle-lighting.",
      "Everything restarts about 90 minutes after Shabbat ends.",
    ],
    intro:
      "The whole country bends around Friday afternoon. Once you feel the rhythm, Shabbat stops being a logistics problem and becomes the best day of the week.",
    sections: [
      {
        heading: "The Thursday-night shop",
        blocks: [
          {
            kind: "p",
            text: "Friday supermarkets are genuinely chaotic — long queues, empty shelves, no delivery slots. Thursday after 9pm is quiet and fully stocked, and delivery windows are still open.",
          },
        ],
      },
      {
        heading: "Friday cut-offs",
        blocks: [
          {
            kind: "facts",
            rows: [
              { label: "Supermarkets", value: "Close 2–3 hrs before candle-lighting" },
              { label: "Delivery apps", value: "Last orders early afternoon" },
              { label: "Cafés", value: "Many close by mid-afternoon" },
              { label: "Buses and trains", value: "Stop about an hour before" },
            ],
          },
          {
            kind: "note",
            tone: "tip",
            title: "Check candle-lighting for your city",
            text: "Jerusalem lights 20–40 minutes earlier than Tel Aviv by custom. Your Home screen shows today's time for where you are.",
          },
        ],
      },
      {
        heading: "Motzei Shabbat",
        blocks: [
          {
            kind: "p",
            text: "Food and transport come back roughly 90 minutes after Shabbat ends, and the whole country goes out at once. Book the ride, the table or the ticket before Shabbat starts.",
          },
          { kind: "link", label: "Open Siddur", sub: "Havdalah, in your nusach", to: "/siddur" },
        ],
      },
    ],
  },
  {
    id: "chagim-calendar",
    emoji: "📅",
    category: "jewish-life",
    title: "The chagim, and what closes",
    blurb: "Which holidays shut the country, which just change the mood, and how to plan around Tishrei.",
    readMins: 4,
    updated: "2026-07-20",
    tags: ["chag", "chagim", "holiday", "yom kippur", "sukkot", "pesach", "chol hamoed", "yom hazikaron"],
    tldr: [
      "Yom Kippur closes everything, including the airport and every road.",
      "Chol HaMoed is a half-holiday: things open, but everywhere is packed.",
      "Pesach changes what's on the shelves for a week.",
    ],
    intro:
      "The Israeli year has a shape. Learning it in advance is the difference between a great Sukkot and being stuck with nothing open and nowhere booked.",
    sections: [
      {
        heading: "The full-stop days",
        blocks: [
          {
            kind: "facts",
            rows: [
              { label: "Yom Kippur", value: "Total stop — no shops, no transport, no flights" },
              { label: "Rosh Hashanah", value: "Two days, Shabbat-like closures" },
              { label: "First & last days of Sukkot and Pesach", value: "Shabbat-like closures" },
              { label: "Shavuot", value: "One day, Shabbat-like" },
            ],
          },
          {
            kind: "note",
            tone: "tip",
            title: "Yom Kippur is extraordinary",
            text: "Roads empty and cities fill with people walking and cycling. Whatever your practice, be outside for it at least once.",
          },
        ],
      },
      {
        heading: "Chol HaMoed",
        blocks: [
          {
            kind: "p",
            text: "The middle days of Sukkot and Pesach are working half-days for much of the country and school holidays for all of it. Every nature reserve, beach and attraction is full, and intercity roads crawl.",
          },
          {
            kind: "steps",
            items: [
              "Book trips and tickets two weeks ahead, not two days.",
              "Start any hike before 7am to get parking and shade.",
              "Expect shortened opening hours even where things are open.",
            ],
          },
        ],
      },
      {
        heading: "Pesach, practically",
        blocks: [
          {
            kind: "p",
            text: "For a week, supermarkets curtain off whole aisles and many restaurants change or close their menus. Stock what you need beforehand if you don't keep Pesach, and don't count on your usual lunch spot.",
          },
        ],
      },
      {
        heading: "The solemn days",
        blocks: [
          {
            kind: "p",
            text: "On Yom HaZikaron and Yom HaShoah a siren sounds and the entire country stops — people get out of their cars and stand. Nightlife closes the evening before Yom HaZikaron, and reopens into Yom HaAtzmaut, which is a genuine street party.",
          },
          { kind: "link", label: "Open Events", sub: "What's on around the chagim", to: "/explore/events" },
        ],
      },
    ],
  },

  /* ─────────────────────────── Health & safety ────────────────────────── */
  {
    id: "doctor-same-day",
    emoji: "🩺",
    category: "health-safety",
    title: "Seeing a doctor the same day",
    blurb: "Which door to knock on, what your travel insurance covers, and how to get reimbursed.",
    readMins: 4,
    updated: "2026-07-20",
    tags: ["doctor", "clinic", "terem", "insurance", "maccabi", "clalit", "pharmacy", "super pharm", "sick"],
    tldr: [
      "Terem and private walk-in clinics see you within hours for a flat fee.",
      "Take the receipt in your own name — no receipt, no reimbursement.",
      "Pharmacies here sell most of what you'd get at home under a different brand name.",
    ],
    intro:
      "Getting ill abroad is manageable once you know which door to knock on. The system is fast; the paperwork is what catches people out.",
    sections: [
      {
        heading: "Choosing where to go",
        blocks: [
          {
            kind: "facts",
            rows: [
              { label: "Pharmacy", value: "Minor things — pharmacists here advise properly" },
              { label: "Private walk-in clinic", value: "Same-day, flat fee, insurer-friendly receipt" },
              { label: "Terem urgent care", value: "Evenings and nights, stitches, X-rays" },
              { label: "Hospital ER", value: "Serious only — long waits, big bills" },
            ],
          },
          {
            kind: "note",
            tone: "warn",
            title: "Don't default to the ER",
            text: "An emergency room visit for something a clinic could handle can be an order of magnitude more expensive, and insurers question it.",
          },
        ],
      },
      {
        heading: "What to bring",
        blocks: [
          {
            kind: "checklist",
            id: "clinic-bag",
            items: [
              "Passport",
              "Insurance policy number and the insurer's phone number",
              "Your program's emergency contact",
              "A payment method — you usually pay and claim back",
            ],
          },
          { kind: "link", label: "Open Health", sub: "Your card and hotlines, ready at the desk", to: "/explore/health" },
        ],
      },
      {
        heading: "Getting reimbursed",
        blocks: [
          {
            kind: "steps",
            items: [
              "Call your insurer before the appointment if you can — some require pre-approval.",
              "Ask for the receipt (kabala) in your own name, with the diagnosis written on it.",
              "Photograph it before you leave the building.",
              "Submit within your policy's window; most are strict about it.",
            ],
          },
          {
            kind: "hebrew",
            rows: [
              { en: "I need a receipt, please", he: "אני צריך קבלה בבקשה", say: "Ani tzarich kabala bevakasha" },
              { en: "I have travel insurance", he: "יש לי ביטוח נסיעות", say: "Yesh li bituach nesi'ot" },
              { en: "Where's the nearest clinic?", he: "איפה המרפאה הקרובה?", say: "Eifo ha-mirpa'a ha-krova?" },
            ],
          },
        ],
      },
      {
        heading: "Pharmacies",
        blocks: [
          {
            kind: "p",
            text: "Super-Pharm is the big chain and stays open late. Search the active ingredient rather than the brand you know from home — paracetamol is usually sold as Acamol, ibuprofen as Nurofen or Advil.",
          },
        ],
      },
    ],
  },
  {
    id: "emergency-basics",
    emoji: "🚨",
    category: "health-safety",
    title: "Emergency numbers and sirens",
    blurb: "The three numbers to memorise, and what to actually do when an alert sounds.",
    readMins: 3,
    updated: "2026-07-20",
    tags: ["emergency", "101", "100", "102", "magen david adom", "police", "siren", "tzeva adom", "shelter", "mamad"],
    tldr: [
      "101 ambulance, 100 police, 102 fire. They answer in English.",
      "On an alert: get to the shelter or a protected stairwell, stay 10 minutes.",
      "Know your building's mamad or nearest shelter on day one, not on the night.",
    ],
    intro:
      "Almost certainly you'll never need this page. Read it once anyway, so that if you do, you're not reading it then.",
    sections: [
      {
        heading: "The numbers",
        blocks: [
          {
            kind: "facts",
            rows: [
              { label: "101", value: "Ambulance — Magen David Adom" },
              { label: "100", value: "Police" },
              { label: "102", value: "Fire and rescue" },
              { label: "104", value: "Home Front Command information" },
            ],
          },
          {
            kind: "note",
            tone: "tip",
            title: "Say where you are first",
            text: "Lead with the city and street, then what happened. If your Hebrew runs out, say 'English please' — dispatchers switch.",
          },
        ],
      },
      {
        heading: "If an alert sounds",
        blocks: [
          {
            kind: "steps",
            items: [
              "Go to the mamad (reinforced room), the building shelter, or an internal stairwell away from windows.",
              "If you're outdoors with no shelter, lie flat and cover your head.",
              "Stay put for ten minutes after the siren stops.",
              "Message your program and your family that you're fine — the news travels faster than you do.",
            ],
          },
          {
            kind: "note",
            tone: "warn",
            title: "Install the official alert app",
            text: "Home Front Command's app gives location-based alerts. Set it up in your first week and allow notifications.",
          },
        ],
      },
      {
        heading: "Everyday safety",
        blocks: [
          {
            kind: "p",
            text: "Israel is a safe country to walk around at night by most standards. The realistic risks are traffic, dehydration and phone theft in crowded nightlife areas. Keep your program's number saved and share your location with a friend on late nights.",
          },
          {
            kind: "link",
            label: "Read: closed areas on the map",
            sub: "Where not to go, and why",
            to: "/explore/map",
          },
        ],
      },
    ],
  },

  /* ────────────────────────── Admin & official ────────────────────────── */
  {
    id: "visa-extension",
    emoji: "🛂",
    category: "official",
    title: "Extending your visa",
    blurb: "The B/2 stamp, Misrad HaPnim, and starting early enough to avoid a border run.",
    readMins: 4,
    updated: "2026-07-20",
    tags: ["visa", "b2", "misrad hapnim", "population authority", "extension", "overstay", "passport"],
    tldr: [
      "A tourist entry is usually stamped for up to three months — check yours, don't assume.",
      "Start the extension two to three weeks before it expires.",
      "Your program letter is the document that makes the whole thing work.",
    ],
    intro:
      "Most gap-year students need at least one extension. It's routine, but the appointment system rewards people who start early.",
    sections: [
      {
        heading: "Know your date",
        blocks: [
          {
            kind: "p",
            text: "Your entry permit — usually a slip rather than a stamp — carries the date you must leave by. Photograph it at the airport and set a calendar reminder for a month before.",
          },
          {
            kind: "note",
            tone: "warn",
            title: "Overstaying is not a small thing",
            text: "It complicates future entries and can create problems on departure. Nobody is chasing you; the responsibility is entirely yours.",
          },
        ],
      },
      {
        heading: "What to bring",
        blocks: [
          {
            kind: "checklist",
            id: "visa-docs",
            items: [
              "Passport valid well past your intended stay",
              "Your entry permit slip",
              "A letter from your program on letterhead, with dates",
              "Passport photos",
              "Proof of address or where you're staying",
              "A payment method for the fee",
            ],
          },
        ],
      },
      {
        heading: "The appointment",
        blocks: [
          {
            kind: "steps",
            items: [
              "Book online through the Population and Immigration Authority — walk-ins are largely gone.",
              "Take the earliest slot you can, even if it's in another city.",
              "Arrive early; queues form before opening.",
              "Bring everything twice — copies as well as originals.",
            ],
          },
          {
            kind: "note",
            tone: "tip",
            title: "Ask your program office first",
            text: "Bigger programs process extensions in batches and will do most of it for you. Always check before booking your own slot.",
          },
        ],
      },
      {
        heading: "Useful Hebrew",
        blocks: [
          {
            kind: "hebrew",
            rows: [
              { en: "I'd like to extend my visa", he: "אני רוצה להאריך את הוויזה", say: "Ani rotze leha'arich et ha-viza" },
              { en: "I have an appointment", he: "יש לי תור", say: "Yesh li tor" },
              { en: "I'm a student on a program", he: "אני סטודנט בתוכנית", say: "Ani student be-tochnit" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "student-discounts",
    emoji: "🎓",
    category: "official",
    title: "Student ID and the discounts nobody tells you about",
    blurb: "Which card gets you what, from museums to bus fares to gym membership.",
    readMins: 3,
    updated: "2026-07-20",
    tags: ["student", "discount", "isic", "teudat student", "museum", "gym", "cinema"],
    tldr: [
      "Your program letter plus passport unlocks most things; an ISIC helps with the rest.",
      "Ask for the student price everywhere — it's often unadvertised.",
      "The Rav-Kav student profile is the biggest one by far.",
    ],
    intro:
      "There's a whole layer of student pricing here that only appears if you ask. The question costs nothing and works surprisingly often.",
    sections: [
      {
        heading: "The cards that count",
        blocks: [
          {
            kind: "facts",
            rows: [
              { label: "Program letter", value: "Accepted almost everywhere, keep a photo" },
              { label: "Rav-Kav student profile", value: "~50% off fares — the big one" },
              { label: "ISIC", value: "Useful for museums, some chains and flights" },
              { label: "Home university ID", value: "Often accepted, worth carrying" },
            ],
          },
        ],
      },
      {
        heading: "Where it works",
        blocks: [
          {
            kind: "p",
            text: "Museums and national parks, cinemas, some gyms and climbing walls, intercity buses and trains, and a surprising number of cafés near campuses. Nature reserve annual passes are excellent value if you'll do more than a few tiyulim.",
          },
          {
            kind: "hebrew",
            rows: [
              { en: "Is there a student price?", he: "יש מחיר סטודנט?", say: "Yesh mechir student?" },
              { en: "Here's my student letter", he: "הנה אישור הלימודים שלי", say: "Hine ishur ha-limudim sheli" },
            ],
          },
        ],
      },
      {
        heading: "Inside Shekk",
        blocks: [
          {
            kind: "p",
            text: "Member offers are negotiated for gap-year students specifically, so you don't need to prove anything at the till — the discount is already in the price.",
          },
          { kind: "link", label: "Browse benefits", sub: "Member offers on food, transport and gyms", to: "/benefits" },
        ],
      },
    ],
  },

  /* ──────────────────────────────  Trips  ─────────────────────────────── */
  {
    id: "tiyul-days",
    emoji: "🥾",
    category: "trips",
    title: "Doing a tiyul properly",
    blurb: "Water maths, start times, entrance fees and the trails that don't need a car.",
    readMins: 4,
    updated: "2026-07-20",
    tags: ["tiyul", "hike", "trail", "negev", "galil", "nature reserve", "water", "flash flood"],
    tldr: [
      "Three litres per person in summer. Reserves sell nothing past the gate.",
      "Start before 7am — southern trailheads close entry around midday.",
      "Never enter a wadi when rain is forecast anywhere upstream.",
    ],
    intro:
      "Half the country is reachable on a bus and a decent pair of shoes. The other half needs planning, and the desert punishes improvisation.",
    sections: [
      {
        heading: "Water and heat",
        blocks: [
          {
            kind: "facts",
            rows: [
              { label: "Summer", value: "3 litres per person, minimum" },
              { label: "Desert in summer", value: "4+ litres, and consider not going" },
              { label: "Inside a reserve", value: "Nothing is sold past the gate" },
              { label: "Best hours", value: "Sunrise to 10am, then again from 4pm" },
            ],
          },
          {
            kind: "note",
            tone: "warn",
            title: "Trailheads close",
            text: "Negev and Galil reserves stop admitting hikers around midday in summer, and rangers will turn you away. A 6am bus is the difference between a hike and a wasted day.",
          },
        ],
      },
      {
        heading: "Flash floods",
        blocks: [
          {
            kind: "p",
            text: "Between roughly October and April, rain in the hills sends water down dry desert wadis with no warning and no rain where you are. If flooding is forecast anywhere upstream, pick a different trail. This is the one rule with no exceptions.",
          },
        ],
      },
      {
        heading: "Getting there without a car",
        blocks: [
          {
            kind: "p",
            text: "Ein Gedi, Masada, the Galil trails around Tzfat and much of the Carmel are all reachable by intercity bus. Check the last bus back before you set off — desert routes can be four hours apart.",
          },
          {
            kind: "checklist",
            id: "tiyul-pack",
            items: [
              "Water, more than you think",
              "Hat, and sunscreen you'll actually reapply",
              "Salty snacks — plain water isn't enough in the heat",
              "Charged phone plus a battery pack",
              "Shoes with grip; the rock here is slick and sharp",
              "Cash for the reserve gate, in case the card reader is down",
            ],
          },
        ],
      },
      {
        heading: "Booking and paying",
        blocks: [
          {
            kind: "p",
            text: "Most nature reserves take card and many want an advance booking on chagim and Chol HaMoed. Booking through Shekk keeps the group on one ticket and applies student pricing where it exists.",
          },
          { kind: "link", label: "Open Maps", sub: "Trailheads, bus stops and drive times", to: "/explore/maps" },
          { kind: "link", label: "Been There", sub: "Mark off where you've travelled", to: "/explore/map" },
        ],
      },
    ],
  },
];

/** Long-form text of a guide, flattened — used for search. */
function guideText(g: Guide) {
  const blockText = (b: GuideBlock): string => {
    switch (b.kind) {
      case "p":
        return b.text;
      case "steps":
      case "checklist":
        return b.items.join(" ");
      case "note":
        return `${b.title} ${b.text}`;
      case "facts":
        return b.rows.map((r) => `${r.label} ${r.value}`).join(" ");
      case "hebrew":
        return b.rows.map((r) => `${r.en} ${r.say}`).join(" ");
      case "link":
        return `${b.label} ${b.sub}`;
    }
  };
  return [
    g.title,
    g.blurb,
    g.intro,
    categoryLabel(g.category),
    g.tags.join(" "),
    g.tldr.join(" "),
    g.sections.map((s) => `${s.heading} ${s.blocks.map(blockText).join(" ")}`).join(" "),
  ]
    .join(" ")
    .toLowerCase();
}

const TEXT = new Map(GUIDES.map((g) => [g.id, guideText(g)]));

export function guideKeywords(id: string) {
  return TEXT.get(id) ?? "";
}

export function getGuide(id: string) {
  return GUIDES.find((g) => g.id === id) ?? null;
}

/** The guide most people need first. */
export const FEATURED_GUIDE_ID = "first-week";

export function featuredGuide() {
  return getGuide(FEATURED_GUIDE_ID) ?? GUIDES[0];
}

export type GuideHit = { guide: Guide; section: string | null };

/** Search titles, tags and body text; names the section that matched. */
export function searchGuides(query: string): GuideHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/);

  return GUIDES.map((guide) => {
    const text = TEXT.get(guide.id) ?? "";
    if (!terms.every((t) => text.includes(t))) return null;
    const title = guide.title.toLowerCase();
    const inTitle = title.includes(q) || guide.tags.some((t) => t.includes(q));
    const section =
      guide.sections.find((s) =>
        `${s.heading}`.toLowerCase().includes(q) ||
        s.blocks.some((b) => JSON.stringify(b).toLowerCase().includes(q)),
      )?.heading ?? null;
    return { hit: { guide, section: inTitle ? null : section }, score: inTitle ? 0 : 1 };
  })
    .filter((x): x is { hit: GuideHit; score: number } => x !== null)
    .sort((a, b) => a.score - b.score)
    .map((x) => x.hit);
}
