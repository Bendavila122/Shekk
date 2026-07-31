/**
 * Health cover catalogue.
 *
 * The insurers and kupot a gap-year student in Israel actually turns up with —
 * American travel-health plans, the international carriers programs buy in bulk,
 * and the Israeli kupot for anyone who ends up on a local plan.
 *
 * Hotlines are the publicly published assistance numbers; a member can always
 * overwrite them with whatever is printed on their own card.
 */

export type ProviderKind = "travel" | "international" | "kupah" | "urgent" | "other";

export type Provider = {
  id: string;
  name: string;
  kind: ProviderKind;
  /** Brand domain for the logo lookup. */
  domain?: string;
  emoji: string;
  /** Published 24/7 assistance line, prefilled when a member picks the provider. */
  hotline?: string;
  note?: string;
};

export const PROVIDERS: Provider[] = [
  // Travel-health plans students arrive with
  { id: "passportcard", name: "PassportCard", kind: "travel", domain: "passportcard.co.il", emoji: "💳", hotline: "+972-3-374-4444", note: "Pays the clinic directly with the card — no claim form." },
  { id: "harel", name: "Harel Yedidim", kind: "travel", domain: "harel-group.co.il", emoji: "🛡️", hotline: "+972-3-754-8888", note: "The plan most yeshivot and seminaries buy." },
  { id: "geoblue", name: "GeoBlue", kind: "travel", domain: "geobluetravelinsurance.com", emoji: "🌍", hotline: "+1-610-254-8771" },
  { id: "img", name: "IMG (Global)", kind: "travel", domain: "imglobal.com", emoji: "🧭", hotline: "+1-317-655-4500" },
  { id: "worldtrips", name: "WorldTrips", kind: "travel", domain: "worldtrips.com", emoji: "✈️", hotline: "+1-317-262-2132" },
  { id: "safetywing", name: "SafetyWing", kind: "travel", domain: "safetywing.com", emoji: "🪂" },

  // International carriers
  { id: "cigna", name: "Cigna Global", kind: "international", domain: "cignaglobal.com", emoji: "🏥", hotline: "+44-1475-492-193" },
  { id: "allianz", name: "Allianz Care", kind: "international", domain: "allianzcare.com", emoji: "🔷", hotline: "+353-1-630-1301" },
  { id: "aetna", name: "Aetna International", kind: "international", domain: "aetnainternational.com", emoji: "🩺", hotline: "+1-813-775-0190" },
  { id: "bupa", name: "Bupa Global", kind: "international", domain: "bupaglobal.com", emoji: "🔵", hotline: "+44-1273-323-563" },
  { id: "axa", name: "AXA", kind: "international", domain: "axa.com", emoji: "🟥", hotline: "+44-1892-556-274" },

  // Israeli kupot
  { id: "maccabi", name: "Maccabi", kind: "kupah", domain: "maccabi4u.co.il", emoji: "🟦", hotline: "*3555", note: "Card number is your Maccabi member number." },
  { id: "clalit", name: "Clalit", kind: "kupah", domain: "clalit.co.il", emoji: "💠", hotline: "*2700" },
  { id: "meuhedet", name: "Meuhedet", kind: "kupah", domain: "meuhedet.co.il", emoji: "🟩", hotline: "*3833" },
  { id: "leumit", name: "Leumit", kind: "kupah", domain: "leumit.co.il", emoji: "🟨", hotline: "*507" },

  // Urgent care memberships
  { id: "terem", name: "Terem urgent care", kind: "urgent", domain: "terem.co.il", emoji: "🚑", hotline: "*2003", note: "Walk-in, English-speaking, open 24/6." },
  { id: "bikur", name: "Bikur Rofe", kind: "urgent", domain: "bikurofe.co.il", emoji: "🩻", hotline: "*5445" },

  { id: "other", name: "Other provider", kind: "other", emoji: "📄", note: "Type the name exactly as it appears on the card." },
];

export const PROVIDER_KIND_LABEL: Record<ProviderKind, string> = {
  travel: "Travel health",
  international: "International",
  kupah: "Israeli kupah",
  urgent: "Urgent care",
  other: "Other",
};

export const provider = (id: string) => PROVIDERS.find((p) => p.id === id);

/** What reception and an ambulance actually ask for, in order. */
export const EMERGENCY_NUMBERS = [
  { label: "Ambulance (MDA)", number: "101", emoji: "🚑" },
  { label: "United Hatzalah", number: "1221", emoji: "🚨" },
  { label: "Police", number: "100", emoji: "👮" },
  { label: "Fire", number: "102", emoji: "🚒" },
];

/** The three lines every clinic desk in Israel asks for. */
export const CLINIC_CHECKLIST = [
  "Passport or teudat zehut — they will ask before anything else.",
  "Your insurer name and member number (tap to copy below).",
  "Call your assistance line first if the visit needs pre-approval.",
];
