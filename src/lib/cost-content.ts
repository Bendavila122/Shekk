/**
 * Cost of living + budget planner content.
 *
 * City baselines are rough monthly shekel figures for a student sharing a
 * flat — deliberately presented as starting points you then adjust, not as
 * quoted prices.
 */

export type CityId = "jerusalem" | "tel-aviv" | "haifa" | "beer-sheva" | "netanya" | "tzfat";

export type CityBaseline = {
  id: CityId;
  name: string;
  emoji: string;
  note: string;
  /** Monthly shekels, sharing a flat. */
  rent: number;
  food: number;
  transport: number;
  fun: number;
};

export const CITIES: CityBaseline[] = [
  {
    id: "jerusalem",
    name: "Jerusalem",
    emoji: "🕍",
    note: "Cheaper than the coast, but Nachlaot and the centre are not.",
    rent: 2600,
    food: 1400,
    transport: 220,
    fun: 700,
  },
  {
    id: "tel-aviv",
    name: "Tel Aviv",
    emoji: "🌇",
    note: "The most expensive rent in the country by a wide margin.",
    rent: 3900,
    food: 1700,
    transport: 250,
    fun: 1100,
  },
  {
    id: "haifa",
    name: "Haifa",
    emoji: "⛰️",
    note: "Student city prices with a sea view.",
    rent: 2000,
    food: 1300,
    transport: 200,
    fun: 550,
  },
  {
    id: "beer-sheva",
    name: "Be'er Sheva",
    emoji: "🏜️",
    note: "The cheapest big-city option in Israel.",
    rent: 1700,
    food: 1200,
    transport: 180,
    fun: 500,
  },
  {
    id: "netanya",
    name: "Netanya",
    emoji: "🏖️",
    note: "Big Anglo community, coastal prices without Tel Aviv rent.",
    rent: 3000,
    food: 1500,
    transport: 230,
    fun: 700,
  },
  {
    id: "tzfat",
    name: "Tzfat",
    emoji: "🏔️",
    note: "Low rent, fewer jobs, and you'll spend on buses out.",
    rent: 1800,
    food: 1250,
    transport: 260,
    fun: 400,
  },
];

export function cityOf(id: string): CityBaseline {
  return CITIES.find((c) => c.id === id) ?? CITIES[0];
}

export type CostInputs = {
  city: CityId;
  rent: number;
  food: number;
  transport: number;
  fun: number;
  /** Extras students always forget. */
  phone: number;
  laundry: number;
  travel: number;
};

export function baselineInputs(city: CityId): CostInputs {
  const c = cityOf(city);
  return {
    city,
    rent: c.rent,
    food: c.food,
    transport: c.transport,
    fun: c.fun,
    phone: 60,
    laundry: 120,
    travel: 300,
  };
}

export const COST_LINES: { key: keyof Omit<CostInputs, "city">; label: string; emoji: string; max: number; step: number; hint: string }[] = [
  { key: "rent", label: "Rent & bills", emoji: "🏠", max: 7000, step: 50, hint: "Your share, including arnona and utilities" },
  { key: "food", label: "Food & makolet", emoji: "🥙", max: 4000, step: 50, hint: "Shopping plus the falafel you swear you won't buy" },
  { key: "transport", label: "Transport", emoji: "🚌", max: 1200, step: 10, hint: "Rav-Kav, trains and the odd taxi" },
  { key: "fun", label: "Going out", emoji: "🎶", max: 3000, step: 50, hint: "Bars, tickets and Thursday nights" },
  { key: "phone", label: "Phone & data", emoji: "📱", max: 400, step: 10, hint: "An Israeli SIM is cheap — around ₪50–₪80" },
  { key: "laundry", label: "Laundry & household", emoji: "🧺", max: 600, step: 10, hint: "Machines, cleaning, the small stuff" },
  { key: "travel", label: "Tiyulim & trips", emoji: "🏜️", max: 2500, step: 50, hint: "Shabbatonim, the north, Eilat once" },
];

export function totalCost(inputs: CostInputs) {
  return COST_LINES.reduce((sum, line) => sum + (inputs[line.key] || 0), 0);
}

/* ──────────────────────── Money Planner (merged) ────────────────────────
 * One plan covers the three money questions a student actually has:
 * what does a month cost, what does landing cost, and how much should sit
 * untouched in case something goes wrong.
 * ------------------------------------------------------------------------ */

export type BudgetLine = { id: string; label: string; amount: number };

export type ArrivalKey =
  | "deposit"
  | "firstRent"
  | "bedding"
  | "kitchen"
  | "sim"
  | "ravkav"
  | "insurance"
  | "visa";

export const ARRIVAL_LINES: {
  key: ArrivalKey;
  label: string;
  emoji: string;
  max: number;
  step: number;
  hint: string;
}[] = [
  { key: "deposit", label: "Flat deposit", emoji: "🔑", max: 12000, step: 100, hint: "Usually one to two months, sometimes a cheque" },
  { key: "firstRent", label: "First month's rent", emoji: "🏠", max: 7000, step: 100, hint: "Paid up front, on top of the deposit" },
  { key: "bedding", label: "Bedding & towels", emoji: "🛏️", max: 1500, step: 25, hint: "Nobody arrives with a duvet" },
  { key: "kitchen", label: "Kitchen basics", emoji: "🍳", max: 1500, step: 25, hint: "Pan, kettle, plates, the first big shop" },
  { key: "sim", label: "Israeli SIM", emoji: "📱", max: 400, step: 10, hint: "First month plus the SIM itself" },
  { key: "ravkav", label: "Rav-Kav & first travel", emoji: "🚌", max: 800, step: 20, hint: "Card, first load, airport transfer" },
  { key: "insurance", label: "Insurance up front", emoji: "🩺", max: 4000, step: 50, hint: "Often billed for the whole stay at once" },
  { key: "visa", label: "Visa & paperwork", emoji: "📄", max: 1500, step: 25, hint: "Fees, photos, apostilles, translations" },
];

export type MoneyPlan = {
  city: CityId;
  /** Recurring monthly outgoings. */
  monthly: CostInputs;
  /** What arrives each month. */
  income: BudgetLine[];
  savingsTarget: number;
  /** One-off costs in the first fortnight. */
  arrival: Record<ArrivalKey, number>;
  /** How many months of outgoings you want untouched. */
  bufferMonths: number;
};

export function arrivalDefaults(city: CityId): Record<ArrivalKey, number> {
  const c = cityOf(city);
  return {
    deposit: Math.round(c.rent * 1.5),
    firstRent: c.rent,
    bedding: 450,
    kitchen: 400,
    sim: 120,
    ravkav: 200,
    insurance: 1200,
    visa: 350,
  };
}

export function starterMoneyPlan(city: CityId = "jerusalem"): MoneyPlan {
  return {
    city,
    monthly: baselineInputs(city),
    income: [
      { id: "i-home", label: "Money from home", amount: 3000 },
      { id: "i-work", label: "Work or stipend", amount: 1500 },
    ],
    savingsTarget: 300,
    arrival: arrivalDefaults(city),
    bufferMonths: 2,
  };
}

/** Re-baseline the plan for a new city, keeping what the user typed themselves. */
export function retargetCity(plan: MoneyPlan, city: CityId): MoneyPlan {
  return { ...plan, city, monthly: baselineInputs(city), arrival: arrivalDefaults(city) };
}

export function monthlyOut(plan: MoneyPlan) {
  return totalCost(plan.monthly);
}

export function monthlyIn(plan: MoneyPlan) {
  return plan.income.reduce((s, l) => s + (l.amount || 0), 0);
}

export function monthlyLeft(plan: MoneyPlan) {
  return monthlyIn(plan) - monthlyOut(plan) - (plan.savingsTarget || 0);
}

export function arrivalTotal(plan: MoneyPlan) {
  return ARRIVAL_LINES.reduce((s, l) => s + (plan.arrival[l.key] || 0), 0);
}

export function bufferTarget(plan: MoneyPlan) {
  return Math.round(monthlyOut(plan) * plan.bufferMonths);
}

/** What you need in hand before you fly: landing costs plus the buffer. */
export function beforeYouFlyTotal(plan: MoneyPlan) {
  return arrivalTotal(plan) + bufferTarget(plan);
}

export type PlanTone = "good" | "tight" | "short";

export function monthlyVerdict(plan: MoneyPlan): { tone: PlanTone; line: string } {
  const inc = monthlyIn(plan);
  const out = monthlyOut(plan);
  const left = monthlyLeft(plan);
  if (inc === 0)
    return { tone: "tight", line: "Add what's coming in and Shekk will tell you whether this month works." };
  if (left < 0)
    return {
      tone: "short",
      line: `You're ₪${Math.abs(left).toLocaleString()} short each month. Cut your biggest line or raise what arrives.`,
    };
  if (left < inc * 0.05)
    return { tone: "tight", line: "It balances, but with nothing spare. One broken phone and the month is gone." };
  if (out > inc * 0.85)
    return { tone: "tight", line: "This works, though most of what arrives goes straight back out." };
  return { tone: "good", line: `Comfortable — ₪${left.toLocaleString()} spare on top of what you're keeping.` };
}

export function bufferVerdict(plan: MoneyPlan): string {
  const target = bufferTarget(plan);
  if (plan.bufferMonths < 1)
    return "No buffer at all. A flight home or a lost phone becomes a phone call to your parents.";
  if (plan.bufferMonths < 2)
    return `₪${target.toLocaleString()} covers one bad month — enough for a deposit dispute, not a flight home.`;
  if (plan.bufferMonths <= 3)
    return `₪${target.toLocaleString()} is the sensible range: a flight home, a medical bill, or a month between flats.`;
  return `₪${target.toLocaleString()} is generous. Money sitting still is money you could be using — three months is plenty.`;
}

