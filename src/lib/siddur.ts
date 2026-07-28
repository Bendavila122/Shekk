/**
 * Shekk Siddur — Tier 1 native tool.
 *
 * Content policy:
 * - Every word of liturgy comes from Sefaria's public Siddur texts
 *   (Siddur Ashkenaz, Siddur Sefard, Siddur Edot HaMizrach), pulled by
 *   scripts/build-siddur.ts and bundled into src/lib/siddur-content/.
 * - Nothing is invented, abridged or presented as a nusach it is not.
 * - Where a nusach has no source text the reader says so plainly.
 * - Source versions and their licences are shown at the foot of the reader.
 */

import manifest from "./siddur-content/manifest.json";

export type NusachId = "ashkenaz" | "sephard" | "edot";

export const NUSACHIM: { id: NusachId; label: string; hint: string }[] = [
  { id: "ashkenaz", label: "Ashkenaz", hint: "Most yeshivas & sems, Anglo shuls" },
  { id: "sephard", label: "Sephard", hint: "Chassidic / Nusach Sfard" },
  { id: "edot", label: "Edot HaMizrach", hint: "Sephardi & Mizrachi communities" },
];

export type PrayerLine = {
  he: string;
  en?: string;
  /** Rubric / instruction rather than liturgy — rendered quietly. */
  note?: boolean;
};

export type PrayerSection = {
  id: string;
  heading: string;
  /** Where the section sits in the service, e.g. "Pesukei Dezimra". */
  group?: string;
  lines: PrayerLine[];
};

/** Lightweight table of contents entry, available without loading the text. */
export type SectionRef = { id: string; heading: string; group: string | null };

export type Prayer = {
  id: string;
  categoryId: string;
  title: string;
  hebrewTitle: string;
  blurb: string;
  when: string;
  /** Weekday / Shabbat pair, when one exists. */
  variant: "weekday" | "shabbat" | null;
  variantOf: string | null;
  nusachim: NusachId[];
  sections: Partial<Record<NusachId, SectionRef[]>>;
  licences: string[];
};

export type SiddurCategory = {
  id: string;
  label: string;
  emoji: string;
  blurb: string;
};

export const SIDDUR_CATEGORIES: SiddurCategory[] = [
  { id: "shacharit", label: "Shacharit", emoji: "🌅", blurb: "Morning service" },
  { id: "mincha", label: "Mincha", emoji: "🌤️", blurb: "Afternoon service" },
  { id: "maariv", label: "Maariv", emoji: "🌙", blurb: "Evening service" },
  { id: "shema-sleep", label: "Shema before sleeping", emoji: "🛏️", blurb: "Krias Shema al hamita" },
  { id: "tefilat-haderech", label: "Tefilat HaDerech", emoji: "🧭", blurb: "The traveller's prayer" },
  { id: "birkat-hamazon", label: "Birkat Hamazon", emoji: "🍞", blurb: "Grace after meals" },
  { id: "brachot", label: "Common brachot", emoji: "🍇", blurb: "Everyday blessings" },
  { id: "havdalah", label: "Havdalah", emoji: "🕯️", blurb: "Ending Shabbat" },
];

export const PRAYERS: Prayer[] = manifest as Prayer[];

/* --------------------------------------------------------------- loading */

/** One lazily-loaded module per prayer + nusach, so the app bundle stays small. */
const MODULES = import.meta.glob<{ default: PrayerSection[] }>("./siddur-content/*.*.ts");

export async function loadPrayerText(prayerId: string, nusach: NusachId): Promise<PrayerSection[]> {
  const loader = MODULES[`./siddur-content/${prayerId}.${nusach}.ts`];
  if (!loader) return [];
  const mod = await loader();
  return mod.default;
}

/* ---------------------------------------------------------------- lookup */

export function findPrayer(id: string): Prayer | undefined {
  return PRAYERS.find((p) => p.id === id);
}

export function prayersInCategory(categoryId: string): Prayer[] {
  return PRAYERS.filter((p) => p.categoryId === categoryId);
}

export function nusachAvailability(prayer: Prayer): NusachId[] {
  return prayer.nusachim;
}

/** Table of contents for the chosen nusach, no text download required. */
export function sectionRefs(prayer: Prayer, nusach: NusachId): SectionRef[] {
  return prayer.sections[nusach] ?? [];
}

export function sectionCount(prayer: Prayer, nusach: NusachId): number {
  return sectionRefs(prayer, nusach).length;
}

const KEYWORDS: Record<string, string> = {
  shacharit: "morning davening shema amidah shemoneh esrei pesukei dezimra ashrei aleinu tachanun",
  "shacharit-shabbat": "shabbat morning nishmat shabbos davening musaf torah reading",
  mincha: "afternoon davening amidah ashrei tachanun",
  "mincha-shabbat": "shabbat afternoon davening",
  maariv: "evening arvit night davening shema amidah",
  "maariv-shabbat": "friday night arvit shabbos evening veshamru",
  "shema-al-hamita": "bedtime shema night hamapil hamalach sleep",
  "tefilat-haderech": "travellers prayer journey bus train flight derech road",
  "birkat-hamazon": "bentching benching grace after meals zimun harachaman",
  brachot: "blessings bracha hamotzi mezonot shehakol borei nefashot shehecheyanu food",
  havdalah: "motzei shabbat besamim candle wine end of shabbos",
};

/** Search prayers by title, blurb, section headings and student vocabulary. */
export function searchPrayers(query: string): Prayer[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return PRAYERS.filter((p) => {
    const headings = Object.values(p.sections)
      .flat()
      .map((s) => `${s?.group ?? ""} ${s?.heading ?? ""}`)
      .join(" ");
    return [
      p.title,
      p.hebrewTitle,
      p.blurb,
      p.when,
      KEYWORDS[p.id] ?? "",
      SIDDUR_CATEGORIES.find((c) => c.id === p.categoryId)?.label ?? "",
      headings,
    ]
      .join(" ")
      .toLowerCase()
      .includes(q);
  });
}
