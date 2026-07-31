import { useEffect, useState } from "react";

export type WikiInfo = {
  title: string;
  extract: string;
  image: string | null;
  url: string | null;
};

const cache = new Map<string, WikiInfo | null>();

async function fetchWiki(title: string): Promise<WikiInfo | null> {
  if (cache.has(title)) return cache.get(title) ?? null;
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}?redirect=true`,
      { headers: { Accept: "application/json" } },
    );
    if (!res.ok) throw new Error(String(res.status));
    const json = (await res.json()) as {
      title?: string;
      extract?: string;
      thumbnail?: { source?: string };
      originalimage?: { source?: string };
      content_urls?: { desktop?: { page?: string } };
    };
    const info: WikiInfo = {
      title: json.title ?? title.replace(/_/g, " "),
      extract: json.extract ?? "",
      image: json.originalimage?.source ?? json.thumbnail?.source ?? null,
      url: json.content_urls?.desktop?.page ?? null,
    };
    cache.set(title, info);
    return info;
  } catch {
    cache.set(title, null);
    return null;
  }
}

/** Live photos and summaries for a place, straight from Wikipedia. */
export function useWikiInfo(titles: string[]) {
  const key = titles.join("|");
  const [data, setData] = useState<Record<string, WikiInfo>>({});
  const [loading, setLoading] = useState(titles.length > 0);

  useEffect(() => {
    let alive = true;
    const list = key ? key.split("|") : [];
    if (list.length === 0) {
      setLoading(false);
      return;
    }
    setLoading(true);
    void Promise.all(list.map((t) => fetchWiki(t).then((info) => [t, info] as const))).then(
      (pairs) => {
        if (!alive) return;
        const next: Record<string, WikiInfo> = {};
        for (const [t, info] of pairs) if (info) next[t] = info;
        setData(next);
        setLoading(false);
      },
    );
    return () => {
      alive = false;
    };
  }, [key]);

  return { data, loading };
}
