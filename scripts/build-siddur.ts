/**
 * Shekk Siddur content generator.
 *
 * Run manually (not part of the app build):
 *   bun run scripts/build-siddur.ts
 *
 * Pulls liturgy from Sefaria's public Siddur texts and writes one module per
 * prayer into src/lib/siddur-content/. Nothing is invented: every line comes
 * from the source text, and where a nusach has no source we simply omit it.
 *
 * Licences of the source versions are recorded per prayer and surfaced in the
 * reader (Metsudah = CC-BY, Sefaria Community Translation = CC0).
 */

import { mkdir, writeFile, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

type NusachId = "ashkenaz" | "sephard" | "edot";

type Selector = {
  /** Ref prefix; every leaf beneath it is included, in schema order. */
  prefix: string;
  /** Leaf refs containing any of these fragments are skipped. */
  exclude?: string[];
  /** Only include leaves containing one of these fragments. */
  only?: string[];
};

type PrayerSpec = {
  id: string;
  categoryId: string;
  title: string;
  hebrewTitle: string;
  blurb: string;
  when: string;
  /** Sibling prayer for the weekday/Shabbat switch. */
  variant?: "weekday" | "shabbat";
  variantOf?: string;
  sources: Partial<Record<NusachId, Selector[]>>;
};

const BOOKS: Record<NusachId, string> = {
  ashkenaz: "Siddur Ashkenaz",
  sephard: "Siddur Sefard",
  edot: "Siddur Edot HaMizrach",
};

const SPECS: PrayerSpec[] = [
  {
    id: "shacharit",
    categoryId: "shacharit",
    title: "Shacharit",
    hebrewTitle: "שַׁחֲרִית",
    blurb: "The full weekday morning service, from Modeh Ani through Aleinu.",
    when: "From dawn until a third of the day",
    variant: "weekday",
    variantOf: "shacharit-shabbat",
    sources: {
      ashkenaz: [
        {
          prefix: "Siddur Ashkenaz, Weekday, Shacharit",
          exclude: ["Post Service", "Korbanot (Israel)", "Laws of Sacrifices", "Order of the Temple Service"],
        },
      ],
      sephard: [
        { prefix: "Siddur Sefard, Upon Arising" },
        { prefix: "Siddur Sefard, Weekday Shacharit" },
      ],
      edot: [{ prefix: "Siddur Edot HaMizrach, Preparatory Prayers" }, { prefix: "Siddur Edot HaMizrach, Weekday Shacharit" }],
    },
  },
  {
    id: "shacharit-shabbat",
    categoryId: "shacharit",
    title: "Shacharit for Shabbat",
    hebrewTitle: "שַׁחֲרִית לְשַׁבָּת",
    blurb: "Shabbat morning: the longer Pesukei DeZimra, Nishmat and the Shabbat Amidah.",
    when: "Shabbat morning",
    variant: "shabbat",
    variantOf: "shacharit",
    sources: {
      ashkenaz: [
        {
          prefix: "Siddur Ashkenaz, Shabbat, Shacharit",
          exclude: ["Laws of Sacrifices", "Order of the Temple Service"],
        },
      ],
      sephard: [{ prefix: "Siddur Sefard, Shabbat Morning Services" }],
      edot: [{ prefix: "Siddur Edot HaMizrach, Shabbat Shacharit" }],
    },
  },
  {
    id: "mincha",
    categoryId: "mincha",
    title: "Mincha",
    hebrewTitle: "מִנְחָה",
    blurb: "Ashrei, the weekday Amidah, Tachanun and Aleinu.",
    when: "From half an hour after midday until sunset",
    variant: "weekday",
    variantOf: "mincha-shabbat",
    sources: {
      ashkenaz: [{ prefix: "Siddur Ashkenaz, Weekday, Minchah" }],
      sephard: [{ prefix: "Siddur Sefard, Weekday Mincha" }],
      edot: [{ prefix: "Siddur Edot HaMizrach, Weekday Mincha" }],
    },
  },
  {
    id: "mincha-shabbat",
    categoryId: "mincha",
    title: "Mincha for Shabbat",
    hebrewTitle: "מִנְחָה לְשַׁבָּת",
    blurb: "The Shabbat afternoon service.",
    when: "Shabbat afternoon",
    variant: "shabbat",
    variantOf: "mincha",
    sources: {
      ashkenaz: [{ prefix: "Siddur Ashkenaz, Shabbat, Minchah" }],
      sephard: [{ prefix: "Siddur Sefard, Shabbat Mincha", exclude: ["Pirkei Avot"] }],
      edot: [{ prefix: "Siddur Edot HaMizrach, Shabbat Mincha" }],
    },
  },
  {
    id: "maariv",
    categoryId: "maariv",
    title: "Maariv",
    hebrewTitle: "מַעֲרִיב",
    blurb: "The weekday evening service: Shema with its blessings and the Amidah.",
    when: "From nightfall",
    variant: "weekday",
    variantOf: "maariv-shabbat",
    sources: {
      ashkenaz: [
        {
          prefix: "Siddur Ashkenaz, Weekday, Maariv",
          exclude: ["Keri'at Shema al Hamita", "Birkat HaLevana"],
        },
      ],
      sephard: [{ prefix: "Siddur Sefard, Weekday Maariv" }],
      edot: [{ prefix: "Siddur Edot HaMizrach, Weekday Arvit" }],
    },
  },
  {
    id: "maariv-shabbat",
    categoryId: "maariv",
    title: "Maariv for Shabbat",
    hebrewTitle: "מַעֲרִיב לְשַׁבָּת",
    blurb: "Friday night: Veshamru, the Shabbat Amidah, Vay'chulu and Me'ein Sheva.",
    when: "Friday night, after Kabbalat Shabbat",
    variant: "shabbat",
    variantOf: "maariv",
    sources: {
      ashkenaz: [{ prefix: "Siddur Ashkenaz, Shabbat, Maariv" }],
      sephard: [{ prefix: "Siddur Sefard, Shabbat Eve Maariv" }],
      edot: [{ prefix: "Siddur Edot HaMizrach, Shabbat Arvit" }],
    },
  },
  {
    id: "shema-al-hamita",
    categoryId: "shema-sleep",
    title: "Shema before sleeping",
    hebrewTitle: "קְרִיאַת שְׁמַע עַל הַמִּטָּה",
    blurb: "Hareini mochel, the Shema, HaMalach HaGoel and HaMapil.",
    when: "Before going to sleep",
    sources: {
      ashkenaz: [{ prefix: "Siddur Ashkenaz, Weekday, Maariv, Keri'at Shema al Hamita" }],
      sephard: [{ prefix: "Siddur Sefard, Bedtime Shema" }],
      edot: [{ prefix: "Siddur Edot HaMizrach, Bedtime Shema" }],
    },
  },
  {
    id: "tefilat-haderech",
    categoryId: "tefilat-haderech",
    title: "Tefilat HaDerech",
    hebrewTitle: "תְּפִלַּת הַדֶּרֶךְ",
    blurb: "The traveller's prayer — said once on any journey outside the city.",
    when: "On the road — buses, trains, sherut, flights",
    sources: {
      ashkenaz: [{ prefix: "Siddur Ashkenaz, Berachot, Tefillat HaDerech" }],
      sephard: [{ prefix: "Siddur Sefard, Blessings, Traveler's Prayer" }, { prefix: "Siddur Sefard, Blessings, Air Traveler's Prayer" }],
      edot: [{ prefix: "Siddur Edot HaMizrach, Assorted Blessings and Prayers, Traveler's Prayer" }],
    },
  },
  {
    id: "birkat-hamazon",
    categoryId: "birkat-hamazon",
    title: "Birkat Hamazon",
    hebrewTitle: "בִּרְכַּת הַמָּזוֹן",
    blurb: "Bentching in full — all four brachot, the zimun and the Harachaman verses.",
    when: "After a meal with bread",
    sources: {
      ashkenaz: [{ prefix: "Siddur Ashkenaz, Berachot, Birkat HaMazon" }],
      sephard: [{ prefix: "Siddur Sefard, Birchat HaMazon, Birchat HaMazon" }],
      edot: [{ prefix: "Siddur Edot HaMizrach, Post Meal Blessing" }],
    },
  },
  {
    id: "brachot",
    categoryId: "brachot",
    title: "Common brachot",
    hebrewTitle: "בְּרָכוֹת",
    blurb: "Blessings on food, drink, smells, thunder, rainbows and new things.",
    when: "Whenever you eat, drink or see something new",
    sources: {
      ashkenaz: [
        { prefix: "Siddur Ashkenaz, Berachot, Birkat Hanehenin" },
        { prefix: "Siddur Ashkenaz, Berachot, Blessings of Praise" },
        { prefix: "Siddur Ashkenaz, Berachot, Me'ein Shalosh" },
      ],
      sephard: [{ prefix: "Siddur Sefard, Blessings", exclude: ["Traveler's Prayer"] }, { prefix: "Siddur Sefard, Mealtime Blessings" }],
      edot: [
        { prefix: "Siddur Edot HaMizrach, Blessings on Enjoyments" },
        { prefix: "Siddur Edot HaMizrach, Al Hamihya" },
      ],
    },
  },
  {
    id: "havdalah",
    categoryId: "havdalah",
    title: "Havdalah",
    hebrewTitle: "הַבְדָּלָה",
    blurb: "Hinei Kel Yeshuati, the four brachot, and the motzei Shabbat songs.",
    when: "Motzei Shabbat, after nightfall",
    sources: {
      ashkenaz: [{ prefix: "Siddur Ashkenaz, Shabbat, Havdalah" }],
      sephard: [{ prefix: "Siddur Sefard, Motzaei Shabbat , Havdala" }, { prefix: "Siddur Sefard, Motzaei Shabbat , Hamavdil" }],
      edot: [
        { prefix: "Siddur Edot HaMizrach, Havdalah, Before Havdalah" },
        { prefix: "Siddur Edot HaMizrach, Havdalah, Havdala" },
      ],
    },
  },
];

/* ------------------------------------------------------------------ fetch */

const CACHE = path.join(process.cwd(), ".siddur-cache");
const OUT = path.join(process.cwd(), "src/lib/siddur-content");

async function cached<T>(key: string, fn: () => Promise<T>): Promise<T> {
  await mkdir(CACHE, { recursive: true });
  const file = path.join(CACHE, key.replace(/[^a-z0-9]+/gi, "_").slice(0, 180) + ".json");
  if (existsSync(file)) return JSON.parse(await readFile(file, "utf8")) as T;
  const value = await fn();
  await writeFile(file, JSON.stringify(value));
  return value;
}

async function api<T>(url: string): Promise<T> {
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(url, { headers: { accept: "application/json" } });
    if (res.ok) return (await res.json()) as T;
    await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
  }
  throw new Error("failed " + url);
}

type IndexNode = { title?: string; nodes?: IndexNode[] };

/** Every leaf ref of a book, in schema order. */
async function leafRefs(book: string): Promise<string[]> {
  const idx = await cached("index_" + book, () =>
    api<{ schema: IndexNode }>("https://www.sefaria.org/api/index/" + encodeURIComponent(book.replace(/ /g, "_"))),
  );
  const out: string[] = [];
  const walk = (node: IndexNode, trail: string[]) => {
    const next = node.title ? [...trail, node.title] : trail;
    if (node.nodes) node.nodes.forEach((c) => walk(c, next));
    else out.push([book, ...next].join(", "));
  };
  (idx.schema.nodes ?? []).forEach((n) => walk(n, []));
  return out;
}

type V3 = {
  versions?: { language?: string; versionTitle?: string; license?: string; text?: unknown }[];
};

function flatten(value: unknown, acc: string[] = []): string[] {
  if (typeof value === "string") acc.push(value);
  else if (Array.isArray(value)) value.forEach((v) => flatten(v, acc));
  return acc;
}

const NOTE_RE = /<small>|<i>|<em>/i;

function clean(html: string) {
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

type Line = { he: string; en?: string; note?: boolean };

async function fetchRef(ref: string): Promise<{ lines: Line[]; licences: string[] }> {
  const data = await cached(
    "text_" + ref,
    () =>
      api<V3>(
        "https://www.sefaria.org/api/v3/texts/" +
          encodeURIComponent(ref) +
          "?version=primary&version=translation&return_format=default",
      ),
  );
  const versions = data.versions ?? [];
  const he = versions.find((v) => v.language === "he");
  const en = versions.find((v) => v.language === "en");
  const heRaw = flatten(he?.text);
  const enRaw = flatten(en?.text);
  const lines: Line[] = [];
  heRaw.forEach((raw, i) => {
    const text = clean(raw);
    if (!text) return;
    const translation = clean(enRaw[i] ?? "");
    lines.push({
      he: text,
      ...(translation ? { en: translation } : {}),
      ...(NOTE_RE.test(raw) && text.length < 400 ? { note: true } : {}),
    });
  });
  const licences = [he, en]
    .filter(Boolean)
    .map((v) => `${v!.versionTitle} (${v!.license})`)
    .filter((v, i, a) => a.indexOf(v) === i);
  return { lines, licences };
}

/* ----------------------------------------------------------------- build */

function headingFor(ref: string, prefix: string) {
  const rest = ref.slice(prefix.length).replace(/^,\s*/, "");
  return rest || prefix.split(", ").pop() || prefix;
}

function slug(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const manifest: Record<string, unknown>[] = [];

  for (const spec of SPECS) {
    const text: Record<string, unknown> = {};
    const licences = new Set<string>();
    const available: NusachId[] = [];

    for (const nusach of Object.keys(spec.sources) as NusachId[]) {
      const book = BOOKS[nusach];
      const all = await leafRefs(book);
      const selectors = spec.sources[nusach]!;
      const refs: string[] = [];
      for (const sel of selectors) {
        for (const ref of all) {
          if (ref !== sel.prefix && !ref.startsWith(sel.prefix + ",")) continue;
          if (sel.exclude?.some((x) => ref.includes(x))) continue;
          if (sel.only && !sel.only.some((x) => ref.includes(x))) continue;
          if (!refs.includes(ref)) refs.push(ref);
        }
      }
      const sections: unknown[] = [];
      const seen = new Set<string>();
      for (const ref of refs) {
        const sel = selectors.find((s) => ref === s.prefix || ref.startsWith(s.prefix + ","))!;
        let res: { lines: Line[]; licences: string[] };
        try {
          res = await fetchRef(ref);
        } catch {
          console.warn("  skipped (fetch failed):", ref);
          continue;
        }
        if (!res.lines.length) continue;
        res.licences.forEach((l) => licences.add(l));
        const heading = headingFor(ref, sel.prefix);
        let id = slug(heading);
        while (seen.has(id)) id += "-x";
        seen.add(id);
        sections.push({ id, heading, lines: res.lines });
      }
      if (sections.length) {
        text[nusach] = sections;
        available.push(nusach);
      }
      console.log(`${spec.id}/${nusach}: ${sections.length} sections`);
    }

    const body = `// Generated by scripts/build-siddur.ts — do not edit by hand.\nimport type { PrayerText } from "../siddur";\n\nconst text: PrayerText = ${JSON.stringify(text)};\n\nexport default text;\n`;
    await writeFile(path.join(OUT, `${spec.id}.ts`), body);

    manifest.push({
      id: spec.id,
      categoryId: spec.categoryId,
      title: spec.title,
      hebrewTitle: spec.hebrewTitle,
      blurb: spec.blurb,
      when: spec.when,
      variant: spec.variant ?? null,
      variantOf: spec.variantOf ?? null,
      nusachim: available,
      sections: Object.fromEntries(
        Object.entries(text).map(([k, v]) => [k, (v as { id: string; heading: string }[]).map((s) => ({ id: s.id, heading: s.heading }))]),
      ),
      licences: [...licences],
    });
  }

  await writeFile(path.join(OUT, "manifest.json"), JSON.stringify(manifest, null, 2));
  console.log("done");
}

main();
