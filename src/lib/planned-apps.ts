/**
 * Mini apps we have designed but not yet integrated.
 *
 * Rather than shipping invented restaurants, bus times or listings, each of
 * these apps opens an honest page: what it will do, which partner or API it
 * depends on, what is still blocking it, and where it sits in the build order.
 */

export type PlannedApp = {
  /** Mini app id, matching src/lib/mini-apps.ts. */
  id: string;
  /** Screen title. */
  title: string;
  /** One line under the title. */
  promise: string;
  /** Concrete things the app will do once it is live. */
  capabilities: string[];
  /** Named partners and APIs, with what each one actually provides. */
  dependencies: { name: string; role: string }[];
  /** Honest one-liners on what is holding it up. */
  blockers: string[];
  /** Where it sits in the build order, as order of work — never dates. */
  sequencing: string;
};

export const PLANNED_APPS: PlannedApp[] = [
  {
    id: "food",
    title: "Food",
    promise: "Kosher-aware delivery and campus food, paid from your Shekk balance",
    capabilities: [
      "Order from the delivery platforms students already use, without leaving Shekk",
      "Kashrut filter on by default, with the hechsher shown on every place",
      "Friday orders capped before candle-lighting so nothing lands on Shabbat",
      "Pay from your Shekk balance and split the order with your room instantly",
    ],
    dependencies: [
      { name: "Wolt", role: "Merchant catalogue, menus and order placement across Israel" },
      { name: "10bis / Tenbis", role: "Campus and office food, the default for many programmes" },
      { name: "Kashrut data", role: "Rabbanut and Badatz certification per venue, shown on the listing" },
    ],
    blockers: [
      "Both platforms gate ordering behind a commercial merchant agreement — partner talks have not started",
      "Paying a partner order from a closed-loop balance needs the settlement side of the money platform finished first",
    ],
    sequencing:
      "After the financial platform is complete. Food is the first commerce integration we want, because it is the thing students spend on most — but it only makes sense once Shekk can settle a real partner order.",
  },
  {
    id: "shops",
    title: "Shops",
    promise: "Student discounts that apply themselves, no coupon app required",
    capabilities: [
      "A live list of member discounts at chains and shops near you",
      "Codes applied automatically at checkout instead of copy-pasted",
      "See what you have saved this month across every offer you used",
      "Offers filtered to your city and your programme",
    ],
    dependencies: [
      { name: "Affiliate networks", role: "Tracked links and commission reporting across many brands at once" },
      { name: "Direct chains", role: "Super-Pharm, Shufersal, Castro and similar — student pricing negotiated brand by brand" },
      { name: "Shekk admin catalogue", role: "Offers entered and moderated by us, so nothing is scraped or invented" },
    ],
    blockers: [
      "Every discount needs a signed affiliate or student-pricing agreement — we will not display an offer we cannot honour",
      "Automatic code application needs the partner's checkout to accept a Shekk-issued code",
    ],
    sequencing:
      "Alongside the affiliate marketplace, after eSIM and insurance partners are live. Those two prove the tracking and payout machinery; shops then reuses it.",
  },
  {
    id: "housing",
    title: "Housing",
    promise: "Rooms, dira hunting and deposits, with other students in the same boat",
    capabilities: [
      "Verified listings from students leaving a room mid-year",
      "Programme accommodation shown next to the private market",
      "What a fair rent, arnona bill and deposit look like for that neighbourhood",
      "Contract and deposit checklists so you know what you are signing",
    ],
    dependencies: [
      { name: "Programme accommodation lists", role: "Dorm and host-family placements, supplied by the programme through the Shekk admin console" },
      { name: "Student listing supply", role: "Shekk's own verified listings, posted by members with a confirmed account" },
      { name: "Israeli rental portals", role: "Market context for prices — reference data, not scraped listings" },
    ],
    blockers: [
      "A housing app is only useful with real supply, and supply comes from having members in cities first",
      "Verification matters more here than anywhere else — we will not run listings we cannot tie to a real account",
    ],
    sequencing:
      "After programme onboarding. Programmes bring cohorts, cohorts bring listings; until then the guides cover dira hunting properly.",
  },
  {
    id: "reserve",
    title: "Reserve",
    promise: "Book a table for two or a Shabbaton table for twenty",
    capabilities: [
      "Live availability at restaurants and halls, kosher-aware by default",
      "Group bookings sized for a Shabbaton, with the hold split across the group",
      "Friday bookings capped before candle-lighting automatically",
      "Your bookings sitting alongside your events and tickets",
    ],
    dependencies: [
      { name: "Ontopo", role: "Reservation inventory and availability at most Israeli restaurants" },
      { name: "Tabit", role: "The other major booking and table-management platform" },
      { name: "Shekk holds", role: "Group deposits held against your balance and released after the meal" },
    ],
    blockers: [
      "Both reservation platforms require API credentials issued under a partner agreement",
      "Group deposits depend on the holds and release side of the money platform",
    ],
    sequencing: "After Food. The same partner conversations and the same settlement work unlock both.",
  },
  {
    id: "transit",
    title: "Transit",
    promise: "Buses, trains and Rav-Kav, without three separate apps",
    capabilities: [
      "Real departure times for the stop you are standing at",
      "Route planning across bus, light rail and Israel Railways",
      "Rav-Kav balance and top-up from your Shekk balance",
      "Clear warnings before Shabbat and chagim, when service stops",
    ],
    dependencies: [
      { name: "Ministry of Transport GTFS", role: "The official national timetable feed for every operator" },
      { name: "GTFS-Realtime", role: "Live vehicle positions and delays on top of the timetable" },
      { name: "Rav-Kav Online", role: "Card balance reads and loading — the part that needs an operator agreement" },
      { name: "Moovit", role: "Fallback routing where the official feed is thin" },
    ],
    blockers: [
      "Timetable and live-arrival data is open and buildable now — it needs ingestion work, not a partner",
      "Rav-Kav top-up cannot be done unofficially; it needs an agreement with the card operator",
    ],
    sequencing:
      "First of the planned apps. Timetables and live arrivals can ship on open data without waiting for anyone; Rav-Kav loading follows once the operator agreement is in place.",
  },
  {
    id: "rides",
    title: "Rides",
    promise: "Order a taxi and let the fare settle from your Shekk balance",
    capabilities: [
      "Fare estimate before you book, in shekels",
      "Book, track the driver and cancel inside Shekk",
      "Fare charged to your Shekk balance instead of a foreign card",
      "Split the ride with whoever is in the car",
    ],
    dependencies: [
      { name: "Gett Business API", role: "Estimates, booking, live driver status and cancellation" },
      { name: "Yango", role: "Second supplier for coverage outside the big cities" },
    ],
    blockers: [
      "The booking flow is already built against Gett's API — it is waiting on live partner credentials, nothing else",
      "Charging a ride to a closed-loop balance needs the corporate billing side of the agreement",
    ],
    sequencing:
      "Ready to switch on. The moment Gett issues production credentials, this becomes a working app without new development.",
  },
];

export const plannedApp = (id: string) => PLANNED_APPS.find((a) => a.id === id) ?? null;

export const PLANNED_APP_IDS = new Set(PLANNED_APPS.map((a) => a.id));
