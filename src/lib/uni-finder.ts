/**
 * University Finder — a guided questionnaire, not a directory.
 *
 * Local content only. The scoring is deliberately transparent: every
 * recommendation has to be able to explain itself in the user's own words.
 */

export type UniId =
  | "huji"
  | "tau"
  | "technion"
  | "biu"
  | "bgu"
  | "reichman"
  | "haifa"
  | "ariel"
  | "bezalel"
  | "jct";

export type Uni = {
  id: UniId;
  name: string;
  short: string;
  city: string;
  emoji: string;
  /** One line of character, not marketing. */
  character: string;
  fields: FieldId[];
  english: "many" | "some" | "few";
  region: RegionId;
  campus: CampusId;
  budget: BudgetId;
  religious: ReligiousId;
  /** Short, factual notes shown on the result card. */
  notes: string[];
};

export type FieldId =
  | "business"
  | "cs"
  | "engineering"
  | "medicine"
  | "law"
  | "humanities"
  | "jewish-studies"
  | "arts"
  | "social-sciences";

export type RegionId = "jerusalem" | "centre" | "north" | "south" | "any";
export type CampusId = "urban" | "campus" | "compact" | "any";
export type BudgetId = "lean" | "middle" | "comfortable";
export type ReligiousId = "secular" | "mixed" | "religious" | "any";

export const FIELDS: { id: FieldId; label: string; emoji: string }[] = [
  { id: "business", label: "Business & economics", emoji: "📈" },
  { id: "cs", label: "Computer science", emoji: "💻" },
  { id: "engineering", label: "Engineering", emoji: "⚙️" },
  { id: "medicine", label: "Medicine & health", emoji: "🩺" },
  { id: "law", label: "Law", emoji: "⚖️" },
  { id: "humanities", label: "Humanities", emoji: "📚" },
  { id: "jewish-studies", label: "Jewish studies", emoji: "📜" },
  { id: "arts", label: "Art & design", emoji: "🎨" },
  { id: "social-sciences", label: "Social sciences", emoji: "🧠" },
];

export const UNIS: Uni[] = [
  {
    id: "huji",
    name: "Hebrew University of Jerusalem",
    short: "Hebrew U",
    city: "Jerusalem",
    emoji: "🏛️",
    character: "Israel's academic heavyweight, spread across three Jerusalem campuses.",
    fields: ["humanities", "jewish-studies", "law", "medicine", "social-sciences", "cs"],
    english: "many",
    region: "jerusalem",
    campus: "campus",
    budget: "middle",
    religious: "mixed",
    notes: [
      "Large international school with full degrees taught in English",
      "Mount Scopus is where most overseas students land",
      "Strongest choice if Jewish studies or humanities is the reason you came",
    ],
  },
  {
    id: "tau",
    name: "Tel Aviv University",
    short: "TAU",
    city: "Tel Aviv",
    emoji: "🌇",
    character: "Big, secular, and plugged straight into the Tel Aviv job market.",
    fields: ["business", "cs", "law", "social-sciences", "medicine", "arts"],
    english: "many",
    region: "centre",
    campus: "campus",
    budget: "comfortable",
    religious: "secular",
    notes: [
      "Ramat Aviv campus, twenty minutes from the centre",
      "Best internship access of any Israeli university",
      "Tel Aviv rent is the real cost of this choice",
    ],
  },
  {
    id: "technion",
    name: "Technion — Israel Institute of Technology",
    short: "Technion",
    city: "Haifa",
    emoji: "🔬",
    character: "Serious engineering school. Intense, technical, proud of it.",
    fields: ["engineering", "cs", "medicine"],
    english: "some",
    region: "north",
    campus: "campus",
    budget: "middle",
    religious: "mixed",
    notes: [
      "Self-contained hillside campus above Haifa",
      "Workload is genuinely heavy — plan around it",
      "Haifa costs meaningfully less than Tel Aviv",
    ],
  },
  {
    id: "biu",
    name: "Bar-Ilan University",
    short: "Bar-Ilan",
    city: "Ramat Gan",
    emoji: "📜",
    character: "Research university with a Jewish-studies core requirement for all students.",
    fields: ["jewish-studies", "law", "social-sciences", "cs", "humanities"],
    english: "some",
    region: "centre",
    campus: "campus",
    budget: "middle",
    religious: "religious",
    notes: [
      "Every degree includes Jewish studies credits",
      "Popular with students coming straight from a gap year",
      "Central location without central Tel Aviv rent",
    ],
  },
  {
    id: "bgu",
    name: "Ben-Gurion University of the Negev",
    short: "Ben-Gurion",
    city: "Be'er Sheva",
    emoji: "🏜️",
    character: "Desert university with the strongest student-town feel in Israel.",
    fields: ["engineering", "cs", "medicine", "social-sciences"],
    english: "some",
    region: "south",
    campus: "campus",
    budget: "lean",
    religious: "mixed",
    notes: [
      "Cheapest big-city student living in the country",
      "Very sociable — the city revolves around the university",
      "Further from family visits and airport runs",
    ],
  },
  {
    id: "reichman",
    name: "Reichman University",
    short: "Reichman",
    city: "Herzliya",
    emoji: "🌐",
    character: "Private, international, career-first. The most Anglo option.",
    fields: ["business", "cs", "law", "social-sciences"],
    english: "many",
    region: "centre",
    campus: "compact",
    budget: "comfortable",
    religious: "secular",
    notes: [
      "Raphael Recanati International School teaches fully in English",
      "Private tuition — the highest fees on this list",
      "Easiest soft landing if your Hebrew is beginner level",
    ],
  },
  {
    id: "haifa",
    name: "University of Haifa",
    short: "Haifa",
    city: "Haifa",
    emoji: "⛰️",
    character: "The most genuinely mixed student body in Israel, with a view to match.",
    fields: ["social-sciences", "humanities", "law", "cs"],
    english: "some",
    region: "north",
    campus: "campus",
    budget: "lean",
    religious: "mixed",
    notes: [
      "Diverse campus, strong social sciences",
      "Affordable rent and quick access to the north",
      "Quieter nightlife than the centre",
    ],
  },
  {
    id: "ariel",
    name: "Ariel University",
    short: "Ariel",
    city: "Ariel",
    emoji: "🏗️",
    character: "Younger university, practical degrees, lower fees and lower rent.",
    fields: ["engineering", "medicine", "business", "social-sciences"],
    english: "few",
    region: "centre",
    campus: "campus",
    budget: "lean",
    religious: "mixed",
    notes: [
      "Cheaper living than anywhere in the centre",
      "Mostly Hebrew-taught — plan on ulpan first",
      "Check how your programme and family feel about the location",
    ],
  },
  {
    id: "bezalel",
    name: "Bezalel Academy of Arts and Design",
    short: "Bezalel",
    city: "Jerusalem",
    emoji: "🎨",
    character: "Israel's art and design school. Portfolio matters more than grades.",
    fields: ["arts"],
    english: "few",
    region: "jerusalem",
    campus: "urban",
    budget: "middle",
    religious: "secular",
    notes: [
      "Admission is portfolio-led",
      "New campus in central Jerusalem",
      "Studio culture — expect long days on site",
    ],
  },
  {
    id: "jct",
    name: "Jerusalem College of Technology (Machon Lev)",
    short: "Machon Lev",
    city: "Jerusalem",
    emoji: "🕍",
    character: "Engineering and tech inside a religious framework, with separate tracks.",
    fields: ["engineering", "cs", "jewish-studies"],
    english: "few",
    region: "jerusalem",
    campus: "compact",
    budget: "middle",
    religious: "religious",
    notes: [
      "Torah study built into the timetable",
      "Separate men's and women's campuses",
      "Well-known route from yeshiva or seminary into tech",
    ],
  },
];

/* ────────────────────────── The questionnaire ────────────────────────── */

export type AnswerKey = "fields" | "english" | "region" | "campus" | "budget" | "religious";

export type Answers = {
  fields: FieldId[];
  english: "many" | "some" | "few" | null;
  region: RegionId | null;
  campus: CampusId | null;
  budget: BudgetId | null;
  religious: ReligiousId | null;
};

export const EMPTY_ANSWERS: Answers = {
  fields: [],
  english: null,
  region: null,
  campus: null,
  budget: null,
  religious: null,
};

export type Question = {
  key: AnswerKey;
  title: string;
  hint: string;
  multi?: boolean;
  options: { value: string; label: string; sub?: string; emoji?: string }[];
};

export const QUESTIONS: Question[] = [
  {
    key: "fields",
    title: "What do you want to study?",
    hint: "Pick up to three. This is weighted most heavily.",
    multi: true,
    options: FIELDS.map((f) => ({ value: f.id, label: f.label, emoji: f.emoji })),
  },
  {
    key: "english",
    title: "How's your Hebrew?",
    hint: "Be honest — it decides which degrees are actually open to you.",
    options: [
      { value: "few", label: "Beginner", sub: "I need my degree taught in English", emoji: "🇬🇧" },
      { value: "some", label: "Getting there", sub: "Some English courses plus ulpan", emoji: "📖" },
      { value: "many", label: "Comfortable", sub: "I could study in Hebrew", emoji: "🇮🇱" },
    ],
  },
  {
    key: "region",
    title: "Where do you want to live?",
    hint: "Where you sleep shapes the year more than the lecture hall does.",
    options: [
      { value: "jerusalem", label: "Jerusalem", sub: "History, community, quieter nights", emoji: "🕍" },
      { value: "centre", label: "Centre", sub: "Tel Aviv, Ramat Gan, Herzliya", emoji: "🌇" },
      { value: "north", label: "North", sub: "Haifa and the Galil", emoji: "⛰️" },
      { value: "south", label: "South", sub: "Be'er Sheva and the Negev", emoji: "🏜️" },
      { value: "any", label: "Open to anywhere", emoji: "🧭" },
    ],
  },
  {
    key: "campus",
    title: "What kind of campus?",
    hint: "Some campuses are a world, some are three buildings in a city.",
    options: [
      { value: "campus", label: "Proper campus", sub: "Lawns, libraries, campus life", emoji: "🌳" },
      { value: "urban", label: "In the city", sub: "The city is the campus", emoji: "🚇" },
      { value: "compact", label: "Small and close-knit", sub: "You'll know everyone", emoji: "🤝" },
      { value: "any", label: "Don't mind", emoji: "🤷" },
    ],
  },
  {
    key: "budget",
    title: "What's your budget like?",
    hint: "Tuition and rent together, not tuition alone.",
    options: [
      { value: "lean", label: "Tight", sub: "Cheapest realistic option wins", emoji: "🪙" },
      { value: "middle", label: "Middle", sub: "Public tuition, sensible rent", emoji: "⚖️" },
      { value: "comfortable", label: "Comfortable", sub: "Private tuition is on the table", emoji: "💳" },
    ],
  },
  {
    key: "religious",
    title: "Religious environment?",
    hint: "There's no wrong answer, but there is a wrong fit.",
    options: [
      { value: "religious", label: "Religious", sub: "Torah study in the timetable", emoji: "📜" },
      { value: "mixed", label: "Mixed", sub: "Both, side by side", emoji: "🤲" },
      { value: "secular", label: "Secular", sub: "Religion stays personal", emoji: "🎓" },
      { value: "any", label: "Doesn't matter", emoji: "🤷" },
    ],
  },
];

export type Match = {
  uni: Uni;
  /** 0–1 */
  score: number;
  /** Why this came out on top, in the user's terms. */
  reasons: string[];
  /** The honest caveat. */
  watch: string | null;
};

const FIELD_LABEL = new Map(FIELDS.map((f) => [f.id, f.label.toLowerCase()]));

export function recommend(answers: Answers): Match[] {
  const results: Match[] = UNIS.map((uni) => {
    let score = 0;
    let max = 0;
    const reasons: string[] = [];
    let watch: string | null = null;

    /* Degree interest — the heaviest signal. */
    max += 4;
    if (answers.fields.length) {
      const hits = answers.fields.filter((f) => uni.fields.includes(f));
      score += (hits.length / answers.fields.length) * 4;
      if (hits.length) {
        reasons.push(`Strong in ${hits.map((h) => FIELD_LABEL.get(h)).join(" and ")}`);
      } else {
        watch = "Not one of its strongest faculties for what you picked";
      }
    }

    /* Language of teaching. */
    max += 3;
    if (answers.english) {
      const rank = { few: 0, some: 1, many: 2 } as const;
      const need = rank[answers.english === "many" ? "few" : answers.english === "some" ? "some" : "many"];
      const has = rank[uni.english];
      if (answers.english === "few") {
        if (uni.english === "many") {
          score += 3;
          reasons.push("Full degrees taught in English");
        } else if (uni.english === "some") {
          score += 1.5;
          reasons.push("Some English-taught courses");
        } else {
          watch = "Mostly Hebrew-taught — you'd need ulpan first";
        }
      } else if (answers.english === "some") {
        score += uni.english === "few" ? 1.5 : 3;
        if (uni.english !== "few") reasons.push("English options while your Hebrew catches up");
      } else {
        score += 3;
      }
      void need;
      void has;
    }

    /* Location. */
    max += 2.5;
    if (answers.region) {
      if (answers.region === "any") score += 2.5;
      else if (uni.region === answers.region) {
        score += 2.5;
        reasons.push(`In ${uni.city}, where you said you want to be`);
      }
    }

    /* Campus style. */
    max += 1.5;
    if (answers.campus) {
      if (answers.campus === "any" || uni.campus === answers.campus) {
        score += 1.5;
        if (answers.campus !== "any") {
          reasons.push(
            uni.campus === "campus"
              ? "A real campus, not scattered buildings"
              : uni.campus === "urban"
                ? "The city is the campus"
                : "Small and close-knit",
          );
        }
      }
    }

    /* Budget. */
    max += 2.5;
    if (answers.budget) {
      const rank = { lean: 0, middle: 1, comfortable: 2 } as const;
      const gap = rank[uni.budget] - rank[answers.budget];
      if (gap <= 0) {
        score += 2.5;
        if (uni.budget === "lean") reasons.push("One of the cheapest places to live and study");
      } else if (gap === 1) {
        score += 1;
        watch = watch ?? "A stretch on the budget you gave";
      } else {
        watch = "Well above the budget you gave";
      }
    }

    /* Religious fit. */
    max += 2;
    if (answers.religious) {
      if (answers.religious === "any" || uni.religious === answers.religious) {
        score += 2;
        if (answers.religious !== "any") {
          reasons.push(
            uni.religious === "religious"
              ? "Religious framework built into student life"
              : uni.religious === "secular"
                ? "Secular campus culture"
                : "Genuinely mixed student body",
          );
        }
      } else if (uni.religious === "mixed" || answers.religious === "mixed") {
        score += 1;
      } else {
        watch = watch ?? "Campus culture may not be the environment you described";
      }
    }

    return { uni, score: max ? score / max : 0, reasons: reasons.slice(0, 3), watch };
  });

  return results.sort((a, b) => b.score - a.score);
}

export function answeredCount(answers: Answers) {
  let n = 0;
  if (answers.fields.length) n++;
  if (answers.english) n++;
  if (answers.region) n++;
  if (answers.campus) n++;
  if (answers.budget) n++;
  if (answers.religious) n++;
  return n;
}
