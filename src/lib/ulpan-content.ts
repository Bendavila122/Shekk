/**
 * Ulpan content — local, structured, no external API.
 *
 * Everything a student actually needs to say in their first months: the
 * taxi, the makolet, the restaurant, the pharmacy, and the small talk in
 * between. Transliteration is the friendly kind students already use.
 */

export type Phrase = {
  id: string;
  he: string;
  translit: string;
  en: string;
  /** One short, useful note — when to say it, or what not to say. */
  tip?: string;
};

export type UlpanCategoryId = "taxi" | "restaurant" | "shopping" | "emergency" | "everyday";

export type UlpanCategory = {
  id: UlpanCategoryId;
  name: string;
  emoji: string;
  blurb: string;
  grad: string;
  phrases: Phrase[];
};

export const ULPAN_CATEGORIES: UlpanCategory[] = [
  {
    id: "taxi",
    name: "Taxi",
    emoji: "🚕",
    blurb: "Get in, get the meter on, get out",
    grad: "var(--grad-sun)",
    phrases: [
      { id: "t1", he: "אפשר מונית?", translit: "Efshar monit?", en: "Can I get a taxi?" },
      {
        id: "t2",
        he: "תפעיל מונה בבקשה",
        translit: "Taf'il moneh bevakasha",
        en: "Please put the meter on",
        tip: "The single most useful sentence you will learn. Say it before you set off.",
      },
      { id: "t3", he: "כמה זה יעלה?", translit: "Kama ze ya'aleh?", en: "How much will it cost?" },
      { id: "t4", he: "קח אותי ל...", translit: "Kach oti le...", en: "Take me to..." },
      { id: "t5", he: "אני ממהר", translit: "Ani memaher", en: "I'm in a hurry" },
      { id: "t6", he: "עצור כאן בבקשה", translit: "Atzor kan bevakasha", en: "Stop here please" },
      { id: "t7", he: "אפשר לשלם באשראי?", translit: "Efshar leshalem be'ashrai?", en: "Can I pay by card?" },
      { id: "t8", he: "זה יותר מדי", translit: "Ze yoter midai", en: "That's too much", tip: "Polite but firm. Then ask for the meter." },
      { id: "t9", he: "אני צריך קבלה", translit: "Ani tzarich kabala", en: "I need a receipt" },
    ],
  },
  {
    id: "restaurant",
    name: "Restaurant",
    emoji: "🥙",
    blurb: "Order, ask what's in it, split the bill",
    grad: "var(--grad-deals)",
    phrases: [
      { id: "r1", he: "שולחן לשניים", translit: "Shulchan lishnayim", en: "A table for two" },
      { id: "r2", he: "מה אתם ממליצים?", translit: "Ma atem mamlitzim?", en: "What do you recommend?" },
      { id: "r3", he: "אני צמחוני", translit: "Ani tzimchoni", en: "I'm vegetarian" },
      { id: "r4", he: "יש בזה חלב?", translit: "Yesh baze chalav?", en: "Does this have dairy in it?" },
      { id: "r5", he: "בלי חריף בבקשה", translit: "Bli charif bevakasha", en: "No spicy please" },
      { id: "r6", he: "עוד פיתה בבקשה", translit: "Od pita bevakasha", en: "Another pita please" },
      {
        id: "r7",
        he: "חשבון בבקשה",
        translit: "Cheshbon bevakasha",
        en: "The bill please",
        tip: "Service isn't always included — around 12% tip is normal.",
      },
      { id: "r8", he: "אפשר לחלק את החשבון?", translit: "Efshar lechalek et hacheshbon?", en: "Can we split the bill?" },
      { id: "r9", he: "מים בבקשה", translit: "Mayim bevakasha", en: "Water please" },
      { id: "r10", he: "זה היה טעים", translit: "Ze haya ta'im", en: "That was delicious" },
    ],
  },
  {
    id: "shopping",
    name: "Shopping",
    emoji: "🛍️",
    blurb: "Makolet, shuk and the pharmacy",
    grad: "var(--grad-chag)",
    phrases: [
      { id: "s1", he: "כמה זה עולה?", translit: "Kama ze oleh?", en: "How much is this?" },
      { id: "s2", he: "יש הנחה לסטודנטים?", translit: "Yesh hanacha lestudentim?", en: "Is there a student discount?" },
      { id: "s3", he: "אני רק מסתכל", translit: "Ani rak mistakel", en: "I'm just looking" },
      { id: "s4", he: "יש את זה במידה אחרת?", translit: "Yesh et ze bemida acheret?", en: "Do you have this in another size?" },
      {
        id: "s5",
        he: "אפשר יותר בזול?",
        translit: "Efshar yoter bezol?",
        en: "Can it be cheaper?",
        tip: "Fine in the shuk, especially near closing. Not in a supermarket.",
      },
      { id: "s6", he: "חצי קילו בבקשה", translit: "Chatzi kilo bevakasha", en: "Half a kilo please" },
      { id: "s7", he: "אפשר שקית?", translit: "Efshar sakit?", en: "Can I have a bag?" },
      { id: "s8", he: "איפה הקופה?", translit: "Eifo hakupa?", en: "Where's the till?" },
      { id: "s9", he: "יש לכם משחת שיניים?", translit: "Yesh lachem mishchat shinayim?", en: "Do you have toothpaste?" },
    ],
  },
  {
    id: "emergency",
    name: "Emergency",
    emoji: "🚨",
    blurb: "The sentences you hope you never need",
    grad: "var(--grad-alert)",
    phrases: [
      { id: "e1", he: "עזרה!", translit: "Ezra!", en: "Help!" },
      {
        id: "e2",
        he: "תתקשרו לאמבולנס",
        translit: "Titkashru le'ambulans",
        en: "Call an ambulance",
        tip: "Ambulance 101 · Police 100 · Fire 102.",
      },
      { id: "e3", he: "אני צריך רופא", translit: "Ani tzarich rofe", en: "I need a doctor" },
      { id: "e4", he: "כואב לי כאן", translit: "Ko'ev li kan", en: "It hurts here" },
      { id: "e5", he: "יש לי אלרגיה ל...", translit: "Yesh li alergya le...", en: "I'm allergic to..." },
      { id: "e6", he: "איפה בית החולים?", translit: "Eifo beit hacholim?", en: "Where is the hospital?" },
      { id: "e7", he: "אני לא מרגיש טוב", translit: "Ani lo margish tov", en: "I don't feel well" },
      { id: "e8", he: "איבדתי את הדרכון שלי", translit: "Ibadeti et hadarkon sheli", en: "I lost my passport" },
      { id: "e9", he: "אני לא מדבר עברית טוב", translit: "Ani lo medaber ivrit tov", en: "I don't speak Hebrew well" },
    ],
  },
  {
    id: "everyday",
    name: "Everyday",
    emoji: "☀️",
    blurb: "Hello, thank you, Shabbat shalom",
    grad: "var(--grad-sky)",
    phrases: [
      { id: "d1", he: "בוקר טוב", translit: "Boker tov", en: "Good morning" },
      { id: "d2", he: "מה קורה?", translit: "Ma kore?", en: "What's up?", tip: "How everyone your age actually says hello." },
      { id: "d3", he: "תודה רבה", translit: "Toda raba", en: "Thank you very much" },
      { id: "d4", he: "סליחה", translit: "Slicha", en: "Sorry / excuse me", tip: "Does the work of three English words. Use it constantly." },
      { id: "d5", he: "אין בעיה", translit: "Ein be'aya", en: "No problem" },
      { id: "d6", he: "אני לא מבין", translit: "Ani lo mevin", en: "I don't understand" },
      { id: "d7", he: "אפשר לדבר לאט?", translit: "Efshar ledaber le'at?", en: "Can you speak slowly?" },
      { id: "d8", he: "איפה השירותים?", translit: "Eifo hasherutim?", en: "Where's the bathroom?" },
      { id: "d9", he: "שבת שלום", translit: "Shabbat shalom", en: "Shabbat shalom" },
      { id: "d10", he: "נתראה אחר כך", translit: "Nitra'e achar kach", en: "See you later" },
    ],
  },
];

/** Single words for the Daily Word card — short, high-frequency, memorable. */
export const DAILY_WORDS: Phrase[] = [
  { id: "w1", he: "בסדר", translit: "Beseder", en: "Okay / fine", tip: "Answers half the questions you'll be asked." },
  { id: "w2", he: "יאללה", translit: "Yalla", en: "Let's go / come on", tip: "Borrowed from Arabic, used by everyone." },
  { id: "w3", he: "חבל", translit: "Chaval", en: "What a shame" },
  { id: "w4", he: "מגניב", translit: "Magniv", en: "Cool" },
  { id: "w5", he: "כפרה", translit: "Kapara", en: "Term of affection (mate, love)" },
  { id: "w6", he: "פיצוץ", translit: "Pitzutz", en: "Amazing (literally: explosion)" },
  { id: "w7", he: "תכל'ס", translit: "Tachles", en: "Bottom line / get to the point" },
  { id: "w8", he: "סבבה", translit: "Sababa", en: "All good" },
  { id: "w9", he: "אחשלי", translit: "Achi / achshali", en: "Bro" },
  { id: "w10", he: "בקטנה", translit: "Biktana", en: "No big deal / easy" },
  { id: "w11", he: "לאט לאט", translit: "Le'at le'at", en: "Slowly, bit by bit" },
  { id: "w12", he: "דווקא", translit: "Davka", en: "Actually / precisely (often ironic)" },
  { id: "w13", he: "מסטול", translit: "Mastul", en: "Out of it / spaced out" },
  { id: "w14", he: "פדיחה", translit: "Fadicha", en: "An embarrassment" },
  { id: "w15", he: "כל הכבוד", translit: "Kol hakavod", en: "Well done" },
  { id: "w16", he: "תכף", translit: "Techef", en: "In a moment", tip: "In Israel this can mean anything from a minute to an hour." },
];

export function allPhrases(): Phrase[] {
  return ULPAN_CATEGORIES.flatMap((c) => c.phrases);
}

export function categoryOf(id: string): UlpanCategory | null {
  return ULPAN_CATEGORIES.find((c) => c.id === id) ?? null;
}

export function findPhrase(id: string): Phrase | null {
  return [...allPhrases(), ...DAILY_WORDS].find((p) => p.id === id) ?? null;
}

/** Deterministic daily pick — same all day, moves on tomorrow. */
export function pickForDay<T>(list: T[], day: number, offset = 0): T {
  return list[Math.abs(day + offset) % list.length];
}

export type QuizQuestion = {
  phrase: Phrase;
  /** English options, one of which is correct. */
  options: string[];
};

/** Build a quiz from a deck, seeded so a round is stable while you play it. */
export function buildQuiz(deck: Phrase[], count = 8, seed = Date.now()): QuizQuestion[] {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  const pool = [...deck];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const chosen = pool.slice(0, Math.min(count, pool.length));
  return chosen.map((phrase) => {
    const wrong = deck
      .filter((p) => p.id !== phrase.id)
      .sort(() => rand() - 0.5)
      .slice(0, 3)
      .map((p) => p.en);
    const options = [phrase.en, ...wrong].sort(() => rand() - 0.5);
    return { phrase, options };
  });
}
