/**
 * Live Israeli news headlines.
 *
 * Four public English RSS feeds are fetched in parallel, parsed with a tiny
 * dependency-free reader (the edge worker has no XML parser and Node-only
 * libraries are off-limits), de-duplicated and merged newest-first.
 *
 * Only headline + source + link + timestamp are kept — no article text.
 */
import { isUrgentHeadline, NEWS_SOURCE_NAME, type NewsFeed, type NewsItem, type NewsSourceId } from "./news-types";

type Source = { id: NewsSourceId; url: string; fallback?: string };

const SOURCES: Source[] = [
  {
    id: "toi",
    url: "https://www.timesofisrael.com/feed/",
    // Times of Israel sits behind Cloudflare for datacentre IPs; Google News
    // republishes the same headlines and links.
    fallback: "https://news.google.com/rss/search?q=site:timesofisrael.com+when:1d&hl=en-IL&gl=IL&ceid=IL:en",
  },
  { id: "jpost", url: "https://www.jpost.com/rss/rssfeedsfrontpage.aspx" },
  { id: "ynet", url: "https://www.ynetnews.com/Integration/StoryRss3082.xml" },
  { id: "inn", url: "https://www.israelnationalnews.com/Rss.aspx" },
];

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

async function fetchText(url: string, timeoutMs = 7000): Promise<string> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { accept: "application/rss+xml, application/xml;q=0.9, */*;q=0.8", "user-agent": UA },
    });
    if (!res.ok) throw new Error(`Upstream ${res.status}`);
    const body = await res.text();
    if (!/<(rss|feed|rdf:RDF)/i.test(body)) throw new Error("Not an RSS document");
    return body;
  } finally {
    clearTimeout(timer);
  }
}

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  hellip: "…",
  mdash: "—",
  ndash: "–",
  rsquo: "’",
  lsquo: "‘",
  ldquo: "“",
  rdquo: "”",
};

function decode(raw: string): string {
  return raw
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]*>/g, "")
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, name: string) => ENTITIES[name.toLowerCase()] ?? m)
    .replace(/\s+/g, " ")
    .trim();
}

function tagValue(block: string, tag: string): string | null {
  const m = block.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "i"));
  return m ? decode(m[1]) : null;
}

/** Atom entries put the URL on <link href="..."/>. */
function linkValue(block: string): string | null {
  const direct = tagValue(block, "link");
  if (direct && /^https?:/i.test(direct)) return direct;
  const href = block.match(/<link[^>]*href=["']([^"']+)["']/i);
  return href ? decode(href[1]) : null;
}

/** Feeds attach art via media:content, media:thumbnail, enclosure or an <img> in the summary. */
function imageValue(block: string): string | undefined {
  const patterns = [
    /<media:content[^>]*url=["']([^"']+)["']/i,
    /<media:thumbnail[^>]*url=["']([^"']+)["']/i,
    /<enclosure[^>]*url=["']([^"']+)["'][^>]*type=["']image/i,
    /<enclosure[^>]*type=["']image[^>]*url=["']([^"']+)["']/i,
    /<image[^>]*>\s*<url>([^<]+)<\/url>/i,
    /&lt;img[^&]*src=["']([^"']+)["']/i,
    /<img[^>]*src=["']([^"']+)["']/i,
  ];
  for (const re of patterns) {
    const m = block.match(re);
    const url = m?.[1]?.trim();
    // Arutz Sheva ships a shared placeholder enclosure on every item.
    const placeholder = /\/pictures\/0\/0\.jpg$/i.test(url ?? "");
    if (url && !placeholder && /^https?:\/\//i.test(url) && !/\.(svg|gif)(\?|$)/i.test(url)) {
      return url.replace(/&amp;/g, "&");
    }
  }
  return undefined;
}

function parseDate(block: string): string {
  const raw = tagValue(block, "pubDate") ?? tagValue(block, "updated") ?? tagValue(block, "published") ?? "";
  const d = new Date(raw);
  return Number.isFinite(d.getTime()) ? d.toISOString() : new Date().toISOString();
}

/** Google News appends " - Publication" to every headline. */
function cleanTitle(title: string, id: NewsSourceId): string {
  const suffix = ` - ${NEWS_SOURCE_NAME[id]}`;
  return title.endsWith(suffix) ? title.slice(0, -suffix.length).trim() : title;
}

function parseFeed(xml: string, id: NewsSourceId): NewsItem[] {
  const blocks = xml.match(/<(item|entry)(?:\s[^>]*)?>[\s\S]*?<\/\1>/gi) ?? [];
  const out: NewsItem[] = [];
  for (const block of blocks) {
    const title = tagValue(block, "title");
    const url = linkValue(block);
    if (!title || !url) continue;
    const clean = cleanTitle(title, id);
    out.push({
      id: `${id}:${tagValue(block, "guid") ?? url}`,
      title: clean,
      url,
      source: id,
      sourceName: NEWS_SOURCE_NAME[id],
      publishedAt: parseDate(block),
      urgent: isUrgentHeadline(clean),
      image: imageValue(block),
    });
  }
  return out.slice(0, 25);
}

const normalise = (t: string) =>
  t
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, "")
    .replace(/\s+/g, " ")
    .trim();

export async function fetchIsraelNews(): Promise<NewsFeed> {
  const failed: NewsSourceId[] = [];

  const results = await Promise.all(
    SOURCES.map(async (src) => {
      try {
        return parseFeed(await fetchText(src.url), src.id);
      } catch {
        if (src.fallback) {
          try {
            return parseFeed(await fetchText(src.fallback), src.id);
          } catch {
            /* fall through */
          }
        }
        failed.push(src.id);
        return [] as NewsItem[];
      }
    }),
  );

  const seen = new Set<string>();
  const items = results
    .flat()
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .filter((item) => {
      const key = normalise(item.title);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 60);

  return { items, failed, fetchedAt: new Date().toISOString() };
}
