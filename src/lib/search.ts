import type { LinkProps } from "@tanstack/react-router";
import { SERVICE_CATEGORIES, ALL_SERVICES, serviceLinkProps, type Service } from "@/lib/services";

export type SearchResult = {
  id: string;
  kind: "service" | "category" | "page";
  title: string;
  subtitle: string;
  emoji?: string;
  service?: Service;
  to: LinkProps["to"];
  params?: Record<string, string>;
  keywords: string;
};

/** Every screen in Shekk, searchable by name and by what students call it. */
const PAGES: { title: string; subtitle: string; emoji: string; to: LinkProps["to"]; keywords: string }[] = [
  { title: "Home", subtitle: "Your app springboard and pay code", emoji: "🏠", to: "/", keywords: "home springboard qr pay code" },
  { title: "Top up", subtitle: "Buy credits with Apple Pay", emoji: "➕", to: "/topup", keywords: "top up topup add credits money buy apple pay balance exchange rate" },
  { title: "Activity", subtitle: "Every top-up, order and transfer", emoji: "🧾", to: "/activity", keywords: "activity history statement transactions spends receipts" },
  { title: "Explore", subtitle: "All apps, folders and guides", emoji: "🧭", to: "/explore", keywords: "explore apps catalogue services folders" },
  { title: "Social", subtitle: "Split a bill, cohort threads, feed", emoji: "👥", to: "/social", keywords: "social split bill friends cohort group chat feed pay friend" },
  { title: "Me", subtitle: "Profile, program, verification, settings", emoji: "🙋", to: "/me", keywords: "me profile settings account program cohort verification badge saved places photo" },
  { title: "Re-verify", subtitle: "Annual ID re-verification", emoji: "🪪", to: "/reverify", keywords: "reverify re-verify verification id passport annual kyc deadline" },
  { title: "Terms & Conditions", subtitle: "Credit terms in full", emoji: "📄", to: "/terms", keywords: "terms conditions t&c legal credits policy" },
  { title: "Help", subtitle: "Support and FAQs", emoji: "🛟", to: "/help", keywords: "help support faq contact problem question" },
];

const INDEX: SearchResult[] = [
  ...PAGES.map((p) => ({
    id: `page:${p.to}`,
    kind: "page" as const,
    title: p.title,
    subtitle: p.subtitle,
    emoji: p.emoji,
    to: p.to,
    keywords: `${p.title} ${p.subtitle} ${p.keywords}`.toLowerCase(),
  })),
  ...SERVICE_CATEGORIES.map((c) => ({
    id: `category:${c.id}`,
    kind: "category" as const,
    title: c.label,
    subtitle: c.tagline,
    emoji: c.emoji,
    to: "/explore/category/$id" as LinkProps["to"],
    params: { id: c.id },
    keywords: `${c.label} ${c.tagline} ${c.services.map((s) => s.name).join(" ")}`.toLowerCase(),
  })),
  ...ALL_SERVICES.map((s) => {
    const link = serviceLinkProps(s);
    return {
      id: `service:${s.id}`,
      kind: "service" as const,
      title: s.name,
      subtitle: s.blurb,
      service: s,
      to: link.to as LinkProps["to"],
      params: link.params,
      keywords: `${s.name} ${s.partner ?? ""} ${s.blurb} ${(s.detail ?? []).join(" ")}`.toLowerCase(),
    };
  }),
];

const RANK: Record<SearchResult["kind"], number> = { service: 0, page: 1, category: 2 };

/** Search everything in the app: apps, categories and screens. */
export function searchApp(query: string, limit = 12): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/);

  return INDEX.map((item) => {
    if (!terms.every((t) => item.keywords.includes(t))) return null;
    const title = item.title.toLowerCase();
    const score =
      (title.startsWith(q) ? 0 : title.includes(q) ? 1 : 2) * 10 + RANK[item.kind];
    return { item, score };
  })
    .filter((x): x is { item: SearchResult; score: number } => x !== null)
    .sort((a, b) => a.score - b.score)
    .slice(0, limit)
    .map((x) => x.item);
}
