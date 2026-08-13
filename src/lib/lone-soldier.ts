/**
 * Lone soldier — the data behind the rights check, the claim tracker, the yom
 * siddurim planner and the support directory.
 *
 * Every entitlement here says who signs it off and what to say to them, because
 * the hard part of being a chayal boded is not knowing what exists — it's the
 * conversation that turns it into money, housing or a flight home.
 *
 * Amounts are deliberately ranges. Army rates change yearly and a confidently
 * wrong shekel figure is worse than an honest "confirm with your mashakit tash".
 */

import type { DocCategoryId } from "@/lib/official-content";

/* ─────────────────────────────── the four answers ─────────────────────────────── */

export type RouteId = "olim" | "mahal" | "tzabar" | "israeli";
export type StageId = "pre" | "basic" | "serving" | "final";
export type LivingId = "kibbutz" | "family" | "lsc" | "rental" | "base";
export type RecognisedId = "yes" | "no" | "unsure";

export type Answers = {
  route: RouteId | null;
  stage: StageId | null;
  living: LivingId | null;
  recognised: RecognisedId | null;
};

export const EMPTY_ANSWERS: Answers = { route: null, stage: null, living: null, recognised: null };

export type Question = {
  key: keyof Answers;
  title: string;
  hint: string;
  options: { value: string; label: string; sub: string; emoji: string }[];
};

export const QUESTIONS: Question[] = [
  {
    key: "route",
    title: "How did you get here?",
    hint: "Your route decides which rights package the army applies to you.",
    options: [
      { value: "olim", label: "Made Aliyah", sub: "Oleh chadash, parents abroad", emoji: "✈️" },
      { value: "mahal", label: "Mahal volunteer", sub: "Serving without Aliyah", emoji: "🎖️" },
      { value: "tzabar", label: "Garin Tzabar", sub: "Kibbutz garin and adoptive family", emoji: "🌾" },
      { value: "israeli", label: "Israeli without family support", sub: "Recognised through a welfare assessment", emoji: "🏠" },
    ],
  },
  {
    key: "stage",
    title: "Where are you up to?",
    hint: "Some rights only open once you have a gius date or a unit.",
    options: [
      { value: "pre", label: "Before gius", sub: "Tzav rishon done or coming", emoji: "📋" },
      { value: "basic", label: "Basic training", sub: "Tironut, first months", emoji: "🥾" },
      { value: "serving", label: "Serving", sub: "In a unit, past tironut", emoji: "🪖" },
      { value: "final", label: "Last six months", sub: "Thinking about discharge", emoji: "🎓" },
    ],
  },
  {
    key: "living",
    title: "Where do you sleep on leave?",
    hint: "The housing grant is different for each of these, and one of them cancels it.",
    options: [
      { value: "lsc", label: "Lone-soldier apartment", sub: "Run by a support organisation", emoji: "🔑" },
      { value: "rental", label: "Your own rental", sub: "Dira with roommates or alone", emoji: "🏢" },
      { value: "kibbutz", label: "Kibbutz placement", sub: "Garin Tzabar or similar", emoji: "🌾" },
      { value: "family", label: "Adoptive family", sub: "A family who took you in", emoji: "🫂" },
      { value: "base", label: "Nowhere yet", sub: "Base, sofas, still working it out", emoji: "🎒" },
    ],
  },
  {
    key: "recognised",
    title: "Is your lone-soldier status recognised?",
    hint: "Recognition by your mashakit tash is the gate every other right sits behind.",
    options: [
      { value: "yes", label: "Yes, it's approved", sub: "It shows on your pay or paperwork", emoji: "✅" },
      { value: "no", label: "Not yet", sub: "Nobody has confirmed it", emoji: "⏳" },
      { value: "unsure", label: "I don't know", sub: "Someone mentioned it once", emoji: "🤷" },
    ],
  },
];

export function answeredCount(a: Answers) {
  return Object.values(a).filter((v) => v !== null).length;
}

export function isComplete(a: Answers): boolean {
  return answeredCount(a) === QUESTIONS.length;
}

/* ─────────────────────────────── entitlements ─────────────────────────────── */

export type Entitlement = {
  id: string;
  name: string;
  /** One line: what this actually is. */
  what: string;
  /** Honest range or description — never a hard figure. */
  worth: string;
  /** Who signs it off. */
  approver: string;
  bring: string[];
  ask: { en: string; he: string };
  /** Shown as a red flag when true: this one can be lost by waiting. */
  expires?: string;
  /** Which routes it applies to. */
  routes: RouteId[];
  /** Which stages it's worth doing now. */
  stages: StageId[];
  /** Housing situations it applies to, when housing-dependent. */
  living?: LivingId[];
  /** Document category this claim usually needs. */
  doc?: DocCategoryId;
  /** Priority: lower sorts first. */
  order: number;
};

export const ENTITLEMENTS: Entitlement[] = [
  {
    id: "recognition",
    name: "Chayal boded recognition",
    what: "The status itself. Nothing else on this page pays out until your file says chayal boded.",
    worth: "Unlocks every right below",
    approver: "Mashakit tash (unit welfare NCO)",
    bring: ["Passport or teudat zehut", "Proof parents live abroad, or your welfare assessment", "Enlistment paperwork"],
    ask: {
      en: "I have no immediate family in Israel. I need my lone-soldier status opened in my file.",
      he: "אין לי משפחה בארץ. אני צריך לפתוח תיק חייל בודד.",
    },
    routes: ["olim", "mahal", "tzabar", "israeli"],
    stages: ["pre", "basic", "serving", "final"],
    order: 0,
  },
  {
    id: "salary",
    name: "Increased salary",
    what: "Lone soldiers are paid meaningfully above the standard conscript rate, automatically once recognised.",
    worth: "Several hundred shekels a month above standard pay",
    approver: "Paid automatically once your file is updated",
    bring: ["Israeli bank account details", "Your recognition confirmation"],
    ask: {
      en: "My status is approved — can you check the lone-soldier rate is on my pay?",
      he: "המצב שלי אושר — אפשר לבדוק שהתשלום של חייל בודד נכנס למשכורת?",
    },
    routes: ["olim", "mahal", "tzabar", "israeli"],
    stages: ["basic", "serving", "final"],
    doc: "financial",
    order: 1,
  },
  {
    id: "rent-grant",
    name: "Rent and living grant",
    what: "A monthly housing payment for lone soldiers who keep their own home rather than living on a kibbutz or with an adoptive family.",
    worth: "A four-figure monthly contribution towards rent and bills",
    approver: "Mashakit tash, with your registered address",
    bring: ["Signed lease with your name on it", "Arnona or vaad bayit bill", "Bank details"],
    ask: {
      en: "I rent my own apartment — I need my address registered so the rent grant starts.",
      he: "אני גר בדירה בשכירות — אני צריך לרשום את הכתובת כדי שדמי הקיום יתחילו.",
    },
    expires: "Backdating is limited — register the address the month you move in",
    routes: ["olim", "mahal", "israeli"],
    stages: ["basic", "serving", "final"],
    living: ["lsc", "rental"],
    doc: "financial",
    order: 2,
  },
  {
    id: "yom-siddurim",
    name: "Yom siddurim",
    what: "One day a month off, on top of leave, to do the paperwork a parent would otherwise do for you.",
    worth: "12 days a year you would otherwise lose from leave",
    approver: "Your commander, coordinated by the mashakit tash",
    bring: ["Nothing — but bring a plan for the day"],
    ask: {
      en: "I'd like to use my yom siddurim this month — I have bank and Misrad HaPnim to do.",
      he: "אני רוצה לנצל יום סידורים החודש — יש לי בנק ומשרד הפנים.",
    },
    expires: "Unused days do not roll over. Book one every month.",
    routes: ["olim", "mahal", "tzabar", "israeli"],
    stages: ["basic", "serving", "final"],
    order: 3,
  },
  {
    id: "extra-leave",
    name: "Extra leave and the annual block",
    what: "Additional leave days, plus a block of consecutive days each year intended for a trip home.",
    worth: "Around a month of extra days across a service",
    approver: "Commander, via the mashakit tash",
    bring: ["Dates you want, in writing, as early as you can"],
    ask: {
      en: "I'd like to plan my lone-soldier leave block for flying home.",
      he: "אני רוצה לתכנן את החופשה המרוכזת של חייל בודד כדי לטוס הביתה.",
    },
    expires: "Popular windows go months ahead — ask early, not in the month you want",
    routes: ["olim", "mahal", "tzabar", "israeli"],
    stages: ["serving", "final"],
    order: 4,
  },
  {
    id: "flight",
    name: "Flight home",
    what: "A funded or heavily subsidised ticket home once during service, through the army or a supporting organisation.",
    worth: "Most or all of one long-haul return ticket",
    approver: "Mashakit tash, or FIDF / Nefesh B'Nefesh depending on your route",
    bring: ["Passport", "Approved leave dates", "Proof of family abroad"],
    ask: {
      en: "I'd like to use my funded flight home — who submits the request?",
      he: "אני רוצה לנצל את הטיסה הביתה — מי מגיש את הבקשה?",
    },
    expires: "Once per service. Don't burn it on a cheap month.",
    routes: ["olim", "mahal", "tzabar"],
    stages: ["serving", "final"],
    doc: "passport",
    order: 5,
  },
  {
    id: "chagim",
    name: "Chagim placement",
    what: "A formal host family for Rosh Hashana, Yom Kippur, Pesach and Shabbatot if you want one.",
    worth: "Somewhere to be on the nights that hurt most",
    approver: "Lone Soldier Center, or your mashakit tash",
    bring: ["Which chag, and whether you want religious or secular"],
    ask: {
      en: "Can you place me with a family for the chagim? I have nowhere to go.",
      he: "אפשר לסדר לי משפחה מאמצת לחגים? אין לי לאן ללכת.",
    },
    expires: "Hosting fills up a month ahead of each chag",
    routes: ["olim", "mahal", "tzabar", "israeli"],
    stages: ["pre", "basic", "serving", "final"],
    order: 6,
  },
  {
    id: "food-laundry",
    name: "Food, laundry and a stocked apartment",
    what: "Grocery vouchers, laundry, furniture and equipment through the support organisations rather than the army.",
    worth: "Hundreds of shekels a month you stop spending",
    approver: "Lone Soldier Center or Michael Levin Base coordinator",
    bring: ["Your soldier ID", "What you're actually missing — be specific"],
    ask: {
      en: "I've just moved into an apartment and I have nothing in it. What can you help with?",
      he: "עברתי לדירה ואין לי כלום. במה אתם יכולים לעזור?",
    },
    routes: ["olim", "mahal", "israeli"],
    stages: ["basic", "serving", "final"],
    living: ["lsc", "rental", "base"],
    order: 7,
  },
  {
    id: "kibbutz-support",
    name: "Kibbutz and adoptive-family support",
    what: "Your garin, kibbutz or adoptive family is your formal support structure — housing, meals and laundry come through them instead of a grant.",
    worth: "Housing and meals covered in place of the rent grant",
    approver: "Garin coordinator or the family's contact at Garin Tzabar",
    bring: ["Nothing — but ask what is and isn't covered, in writing"],
    ask: {
      en: "What exactly does the kibbutz cover for me, and what happens if I move out?",
      he: "מה בדיוק הקיבוץ מכסה לי, ומה קורה אם אני עובר דירה?",
    },
    routes: ["tzabar", "olim", "israeli"],
    stages: ["pre", "basic", "serving", "final"],
    living: ["kibbutz", "family"],
    order: 8,
  },
  {
    id: "bank",
    name: "Israeli bank account",
    what: "Not a right, but the plumbing every payment above runs through. Open it before basic training, not during.",
    worth: "Without it, nothing pays out",
    ask: {
      en: "I'm a lone soldier — I need to open a soldier account with no fees.",
      he: "אני חייל בודד — אני צריך לפתוח חשבון חייל בלי עמלות.",
    },
    approver: "Any Israeli bank branch — Leumi, Hapoalim, Discount and Mizrahi all run soldier accounts",
    bring: ["Passport", "Teudat zehut if you have one", "Enlistment or recognition paperwork"],
    routes: ["olim", "mahal", "tzabar", "israeli"],
    stages: ["pre", "basic", "serving", "final"],
    doc: "financial",
    order: 9,
  },
  {
    id: "discharge",
    name: "Discharge grant and post-army rights",
    what: "The pikadon (discharge deposit), extra lone-soldier top-ups, and study or rent benefits after service.",
    worth: "A five-figure deposit, plus study funding",
    approver: "Chativat HaMiluim / discharge office, with Nefesh B'Nefesh for olim",
    bring: ["Discharge paperwork", "Bank details", "Study plans if you're using it for tuition"],
    ask: {
      en: "I'm discharging soon — can you walk me through the pikadon and the lone-soldier top-up?",
      he: "אני משתחרר בקרוב — אפשר להסביר לי על הפיקדון ותוספת חייל בודד?",
    },
    expires: "Some post-army benefits have deadlines counted from your discharge date",
    routes: ["olim", "mahal", "tzabar", "israeli"],
    stages: ["final"],
    doc: "army",
    order: 10,
  },
];

/** The entitlements that apply to one set of answers, in the order to chase them. */
export function entitlementsFor(a: Answers): Entitlement[] {
  return ENTITLEMENTS.filter((e) => {
    if (a.route && !e.routes.includes(a.route)) return false;
    if (a.stage && !e.stages.includes(a.stage)) return false;
    if (e.living && a.living && !e.living.includes(a.living)) return false;
    if (e.id === "recognition" && a.recognised === "yes") return false;
    return true;
  }).sort((x, y) => x.order - y.order);
}

/** One line of honest context under the hero, based on what they told us. */
export function headline(a: Answers): { title: string; body: string } {
  if (a.recognised !== "yes") {
    return {
      title: "Start with recognition",
      body: "Until your file says chayal boded, none of the money below moves. It is one conversation with your mashakit tash.",
    };
  }
  if (a.living === "rental" || a.living === "lsc") {
    return {
      title: "The rent grant is the big one",
      body: "It is the largest single payment you're owed, and it only starts once your address is registered with the army.",
    };
  }
  if (a.living === "base") {
    return {
      title: "Housing first",
      body: "A registered address turns into a monthly grant. Until then you're paying for sofas with your own leave.",
    };
  }
  if (a.stage === "final") {
    return {
      title: "Claim before you discharge",
      body: "The flight home, the leave block and the discharge grant all get harder to chase once you're a civilian.",
    };
  }
  return {
    title: "Chase these in order",
    body: "Everything here goes through one person. Bring the paperwork with you and ask for one thing at a time.",
  };
}

/* ─────────────────────────── yom siddurim planner ─────────────────────────── */

export type Errand = {
  id: string;
  label: string;
  emoji: string;
  why: string;
  hours: string;
  bring: string[];
  tip: string;
  /** Lower goes earlier in the day. */
  order: number;
};

export const ERRANDS: Errand[] = [
  {
    id: "misrad",
    label: "Misrad HaPnim",
    emoji: "🪪",
    why: "Teudat zehut, visa status, address changes",
    hours: "Sun–Thu, mornings only. Most branches close to the public around 12:30–13:00.",
    bring: ["Passport", "Teudat zehut", "Army ID", "Any letter they sent you"],
    tip: "Book the appointment online days before. Walk-ins lose the whole morning.",
    order: 0,
  },
  {
    id: "bank",
    label: "Bank branch",
    emoji: "🏦",
    why: "Open the account, fix a blocked card, sign for a grant",
    hours: "Sun–Thu, typically 08:30–13:00, with one or two late afternoons a week.",
    bring: ["Passport", "Teudat zehut", "Recognition or enlistment paperwork"],
    tip: "Ask for the branch's soldier account — no fees, and they know the forms.",
    order: 1,
  },
  {
    id: "bituach",
    label: "Bituach Leumi",
    emoji: "🧾",
    why: "National insurance registration and grant paperwork",
    hours: "Sun–Thu mornings, appointment strongly preferred.",
    bring: ["Teudat zehut", "Bank details", "Army paperwork"],
    tip: "Most of this can be done online now — check before you spend the trip.",
    order: 2,
  },
  {
    id: "kupat",
    label: "Kupat cholim / doctor",
    emoji: "🩺",
    why: "Civilian health fund, prescriptions, dentist",
    hours: "Long hours, often into the evening. Do it after the offices shut.",
    bring: ["Health fund card", "Army medical paperwork if it's service-related"],
    tip: "Army medicine covers you while serving — use civilian slots for dentistry and anything they refuse.",
    order: 5,
  },
  {
    id: "phone",
    label: "Phone or internet",
    emoji: "📱",
    why: "SIM, plan change, a bill you can't fix in the app",
    hours: "Mall hours, usually 10:00–21:00.",
    bring: ["Teudat zehut", "The account holder's details"],
    tip: "Soldier plans exist and are cheap. Ask specifically for the chayal rate.",
    order: 6,
  },
  {
    id: "post",
    label: "Post office",
    emoji: "📮",
    why: "Packages from home, official letters, some payments",
    hours: "Sun–Thu with a long lunch closure, plus Friday mornings.",
    bring: ["Teudat zehut", "The collection slip"],
    tip: "Packages are held for a limited window before they're returned. Check the date on the slip.",
    order: 3,
  },
  {
    id: "lsc",
    label: "Lone Soldier Center",
    emoji: "🫂",
    why: "Grants, furniture, food, chagim, someone to talk to",
    hours: "Afternoons and evenings, and they want to see you.",
    bring: ["Nothing. Bring a list of what you need."],
    tip: "End the day here. It's the only stop where nobody is trying to close the counter on you.",
    order: 7,
  },
  {
    id: "laundry",
    label: "Laundry and groceries",
    emoji: "🧺",
    why: "The things that quietly eat your leave",
    hours: "Anytime. Supermarkets shut early Friday.",
    bring: ["Vouchers if your centre gave you any"],
    tip: "Do this last, so you're not carrying it around Misrad HaPnim.",
    order: 8,
  },
];

/** Errands ordered into a plan for the day: closing-time first. */
export function planFor(ids: string[]): Errand[] {
  return ERRANDS.filter((e) => ids.includes(e.id)).sort((a, b) => a.order - b.order);
}

/* ──────────────────────────── support directory ──────────────────────────── */

export type SupportOrg = {
  id: string;
  name: string;
  emoji: string;
  what: string;
  ask: string;
  cities: string[];
  /** Search term for the Maps mini app, when there's a physical place to walk into. */
  maps?: string;
  phone?: string;
};

export const SUPPORT_ORGS: SupportOrg[] = [
  {
    id: "lsc",
    name: "Lone Soldier Center in Memory of Michael Levin",
    emoji: "🏠",
    what: "Apartments, furniture, Shabbat meals, chagim placement, social events and a coordinator who knows your name.",
    ask: "Housing, anything you need for an apartment, and somewhere to be on chagim.",
    cities: ["Jerusalem", "Tel Aviv", "Haifa", "Beersheva"],
    maps: "Lone Soldier Center",
  },
  {
    id: "base",
    name: "The Michael Levin Base",
    emoji: "🛏️",
    what: "Jerusalem drop-in centre: hot food, laundry, a bed, wifi and quiet. Walk in on leave, no appointment.",
    ask: "A bed for the night, a washing machine, and a hot meal on leave.",
    cities: ["Jerusalem"],
    maps: "Michael Levin Base Jerusalem",
  },
  {
    id: "nbn",
    name: "Nefesh B'Nefesh Lone Soldiers Program",
    emoji: "✈️",
    what: "Pre-Aliyah through discharge: advisors, grants, employment and post-army planning for olim.",
    ask: "Grants, your flight home, and what to do with the discharge deposit.",
    cities: ["Jerusalem", "Nationwide"],
  },
  {
    id: "fidf",
    name: "FIDF",
    emoji: "🎗️",
    what: "Funds lone-soldier programs, flights home and welfare grants, largely through the army's own welfare channels.",
    ask: "Ask your mashakit tash to submit to FIDF rather than approaching them directly.",
    cities: ["Nationwide"],
  },
  {
    id: "tzabar",
    name: "Garin Tzabar",
    emoji: "🌾",
    what: "Kibbutz placement, an adoptive family, group housing and a coordinator, from pre-Aliyah through service.",
    ask: "Your kibbutz's obligations, and what changes if you move off it.",
    cities: ["Kibbutzim nationwide"],
  },
  {
    id: "yad",
    name: "Yad L'Chayal / Chayal el Chayal",
    emoji: "🎒",
    what: "Equipment, food packages, apartment kits and regional help, often faster than the bigger organisations.",
    ask: "Kit and food, especially in the first month after moving in.",
    cities: ["Jerusalem", "Regional"],
  },
];

/* ─────────────────────────── when it's hard ─────────────────────────── */

export const HELP_LINES: { id: string; label: string; detail: string; number?: string }[] = [
  {
    id: "mashakit",
    label: "Mashakit tash",
    detail: "First call for anything welfare, money or family. Keep her number in your phone.",
  },
  {
    id: "mental",
    label: "Unit mental health officer",
    detail: "Confidential. Asking does not end a combat career — untreated problems do.",
  },
  { id: "eran", label: "ERAN", detail: "Emotional first aid, 24/7, with English-speaking volunteers.", number: "1201" },
  { id: "natal", label: "Natal", detail: "Trauma and war-related support for soldiers and families.", number: "1-800-363-363" },
];
