import type { LinkProps } from "@tanstack/react-router";
import { SERVICE_CATEGORIES, ALL_SERVICES, serviceLinkProps, type Service } from "@/lib/services";
import { GUIDES, categoryLabel, guideKeywords } from "@/lib/guides";
import { TRACKS, trackKeywords } from "@/lib/official-content";
import { TRACK_ROUTES } from "@/components/official/TrackApp";


export type SearchResult = {
  id: string;
  kind: "service" | "category" | "page" | "guide";
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
  { title: "Health cover", subtitle: "Insurance card, member number, hotlines", emoji: "🩺", to: "/explore/health", keywords: "health cover insurance card maccabi clalit meuhedet leumit harel yedidim passportcard cigna geoblue kupah kupat holim doctor clinic terem hospital member number policy emergency 101 ambulance dentist" },
  { title: "Been There", subtitle: "Interactive scratch map of Israel", emoji: "🗺️", to: "/explore/map", keywords: "been there map israel scratch scratch-off skratch visited travel places pins city cities kotel western wall masada dead sea ein gedi tzfat safed kinneret galilee golan haifa akko caesarea tel aviv jaffa eilat negev mitzpe ramon beer sheva chevron hebron ashkelon beit shemesh history things to do sightseeing" },
  { title: "Fitness", subtitle: "Gyms, classes, pools & courts near you", emoji: "🏋️", to: "/explore/fitness", keywords: "fitness gym gyms workout exercise class classes pool swim swimming studio pilates yoga spinning crossfit weights martial arts krav maga boxing climbing bouldering basketball football court pitch sports club country club holmes place icon gymbox go active membership day pass short term contract" },
  { title: "Siddur", subtitle: "Prayers, your nusach, Hebrew & English", emoji: "📖", to: "/siddur", keywords: "siddur prayer tefilla tefillah davening daven shema shacharit mincha maariv bentching birkat hamazon brachot bracha havdalah tefilat haderech nusach ashkenaz sephard edot hamizrach" },

  { title: "Visa & status", subtitle: "A/2 student visa, extensions, re-entry", emoji: "🛂", to: "/explore/visa", keywords: "visa a2 b2 student visa misrad hapnim piba extension overstay biometric entry stamp re-entry status paperwork aliyah teudat zehut" },
  { title: "Army & service", subtitle: "Mahal, Garin Tzabar, tzav rishon", emoji: "🎖️", to: "/explore/army", keywords: "army idf service mahal garin tzabar hesder mechina nefesh b'nefesh tzav rishon gius draft medical profile enlistment" },
  { title: "Lone soldier support", subtitle: "Chayal boded rights and help", emoji: "🪖", to: "/explore/lone-soldier", keywords: "lone soldier chayal boded lone soldier center michael levin base fidf rights payments housing laundry food chagim regila leave family visit mental health" },
  { title: "Uni & study", subtitle: "Masa, mechina, credits and transcripts", emoji: "🎓", to: "/explore/uni", keywords: "university uni study masa mechina ulpan hebrew university tau reichman idc international school credit transfer transcript tuition student status" },
  { title: "Documents", subtitle: "Passport, visa, letters and policies", emoji: "🗂️", to: "/explore/documents", keywords: "documents vault upload passport visa acceptance letter insurance policy army papers transcripts storage" },
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
  ...TRACKS.map((t) => ({
    id: `official:${t.id}`,
    kind: "guide" as const,
    title: t.name,
    subtitle: t.tagline,
    emoji: t.emoji,
    to: TRACK_ROUTES[t.id],
    keywords: trackKeywords(t.id),
  })),
  ...GUIDES.map((g) => ({
    id: `guide:${g.id}`,
    kind: "guide" as const,
    title: g.title,
    subtitle: `${categoryLabel(g.category)} guide · ${g.readMins} min`,
    emoji: g.emoji,
    to: "/guides/$id" as LinkProps["to"],
    params: { id: g.id },
    keywords: guideKeywords(g.id),
  })),
];

const RANK: Record<SearchResult["kind"], number> = { service: 0, page: 1, guide: 2, category: 3 };


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
