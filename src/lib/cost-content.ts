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

/* ────────────────────────── Budget planner ────────────────────────── */

export type BudgetLine = { id: string; label: string; amount: number };

export type BudgetPlan = {
  income: BudgetLine[];
  expenses: BudgetLine[];
  savingsTarget: number;
};

export const STARTER_PLAN: BudgetPlan = {
  income: [
    { id: "i-home", label: "Money from home", amount: 3000 },
    { id: "i-work", label: "Work or stipend", amount: 1500 },
  ],
  expenses: [
    { id: "e-rent", label: "Rent & bills", amount: 2600 },
    { id: "e-food", label: "Food", amount: 1400 },
    { id: "e-transport", label: "Transport", amount: 220 },
    { id: "e-fun", label: "Going out", amount: 600 },
  ],
  savingsTarget: 400,
};

export function planTotals(plan: BudgetPlan) {
  const income = plan.income.reduce((s, l) => s + (l.amount || 0), 0);
  const expenses = plan.expenses.reduce((s, l) => s + (l.amount || 0), 0);
  const remaining = income - expenses - (plan.savingsTarget || 0);
  return { income, expenses, remaining };
}

/** One honest sentence about the plan, so the tool takes a view. */
export function planVerdict(plan: BudgetPlan) {
  const { income, expenses, remaining } = planTotals(plan);
  if (income === 0) return "Add what's coming in and Shekk will tell you whether this works.";
  if (remaining < 0)
    return `You're ₪${Math.abs(remaining).toLocaleString()} short each month. Cut the biggest line or raise what's coming in.`;
  if (remaining < income * 0.05)
    return "This balances, but with nothing spare. One broken phone and the month is gone.";
  if (expenses > income * 0.85) return "It works, though most of what arrives goes straight back out.";
  return `Comfortable — ₪${remaining.toLocaleString()} spare on top of your savings target.`;
}
