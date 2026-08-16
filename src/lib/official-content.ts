/**
 * Official — the paperwork app inside Shekk.
 *
 * Four tracks: visas and status, army and service, lone soldier support, and
 * university and study. Content is authored here in code so it opens instantly
 * and can't drift out of sync with a database.
 *
 * Fees, phone numbers and office hours were correct at each track's `updated`
 * date. Nothing here is legal advice — every track says who to actually call.
 */

import type { GuideBlock, GuideSection } from "@/lib/guides";

export type TrackId = "visa" | "army" | "lone-soldier" | "university";

/** One step in a member's own checklist for a track. */
export type TrackStep = {
  key: string;
  title: string;
  detail: string;
  /** Document category this step is satisfied by, if any. */
  needsDoc?: DocCategoryId;
};

export type OfficialTrack = {
  id: TrackId;
  emoji: string;
  name: string;
  tagline: string;
  blurb: string;
  readMins: number;
  updated: string;
  tags: string[];
  tldr: string[];
  intro: string;
  sections: GuideSection[];
  steps: TrackStep[];
};

export type DocCategoryId =
  | "passport"
  | "visa"
  | "program"
  | "insurance"
  | "army"
  | "university"
  | "financial"
  | "other";

export const DOC_CATEGORIES: { id: DocCategoryId; label: string; emoji: string; hint: string }[] = [
  { id: "passport", label: "Passport", emoji: "🛂", hint: "Photo page, and the entry stamp or blue B/2 slip" },
  { id: "visa", label: "Visa & status", emoji: "🪪", hint: "A/2 sticker, extension receipts, Misrad HaPnim forms" },
  { id: "program", label: "Program", emoji: "🎓", hint: "Acceptance letter, program contract, cohort dates" },
  { id: "insurance", label: "Insurance", emoji: "🩺", hint: "Policy PDF, cover summary, claim forms" },
  { id: "army", label: "Army", emoji: "🎖️", hint: "Tzav rishon, gius order, profile letter, discharge papers" },
  { id: "university", label: "University", emoji: "📚", hint: "Transcripts, enrolment letter, ulpan placement" },
  { id: "financial", label: "Money & tax", emoji: "💳", hint: "Bank letters, scholarship award, tuition receipts" },
  { id: "other", label: "Other", emoji: "📄", hint: "Anything else you'd hate to lose" },
];

export function docCategory(id: string) {
  return DOC_CATEGORIES.find((c) => c.id === id) ?? DOC_CATEGORIES[DOC_CATEGORIES.length - 1]!;
}

const p = (text: string): GuideBlock => ({ kind: "p", text });

/* ══════════════════════════════ Visas & status ══════════════════════════════ */

const VISA: OfficialTrack = {
  id: "visa",
  emoji: "🛂",
  name: "Visas & status",
  tagline: "Getting in, staying legal, extending",
  blurb:
    "B/2 on arrival, the A/2 student visa, extensions at Misrad HaPnim, and what to do if your stamp is about to run out.",
  readMins: 8,
  updated: "2026-07-25",
  tags: [
    "visa",
    "a2",
    "a/2",
    "b2",
    "student visa",
    "misrad hapnim",
    "ministry of interior",
    "population authority",
    "extension",
    "overstay",
    "entry stamp",
    "blue slip",
    "biometric",
    "aliyah",
    "teudat zehut",
  ],
  tldr: [
    "Most gap-year students land on a B/2 tourist entry and convert to an A/2 student visa once the program's paperwork is in.",
    "You don't get a passport stamp any more — you get a blue paper slip at the airport. Photograph it and keep the original.",
    "A/2 is issued for the length of your program, usually up to a year, and is extended at Misrad HaPnim before it expires, not after.",
    "Book the Misrad HaPnim appointment online weeks ahead. Walk-ins mostly don't work.",
    "Overstaying is a real problem for future entries and for Aliyah paperwork — deal with it early, through your program.",
  ],
  intro:
    "Almost every gap-year student in Israel is in one of two states: on a tourist entry that a program is about to convert, or on an A/2 student visa that will need extending mid-year. This track walks both, in the order the offices actually ask for things.",
  sections: [
    {
      heading: "What you actually get at the airport",
      blocks: [
        p(
          "Israel stopped stamping most passports. At Ben Gurion you're given a small blue paper slip — the B/2 entry permit — printed from the kiosk or handed over at passport control. It is your proof of legal entry, and clinics, banks, Misrad HaPnim and your program will all ask for it.",
        ),
        {
          kind: "steps",
          items: [
            "Take a photo of the blue slip before you leave the terminal, front and back.",
            "Upload it to your Shekk document vault under Passport, so you have it when the original goes through the wash.",
            "Keep the paper original with your passport, not in your wallet.",
            "Check the date on it. Standard tourist entry is up to three months, but the officer can write less.",
          ],
        },
        {
          kind: "note",
          tone: "warn",
          title: "The date on the slip is the date that counts",
          text: "Not three months from landing — whatever the officer wrote. People get caught out by a 30-day entry they never read. Check it the day you land.",
        },
      ],
    },
    {
      heading: "B/2 tourist vs A/2 student",
      blocks: [
        {
          kind: "facts",
          rows: [
            { label: "B/2 tourist", value: "What you land on. Up to 3 months. No study or work rights. Free." },
            {
              label: "A/2 student",
              value: "For a recognised program or institution. Issued for the study period, usually up to 12 months. Multi-entry.",
            },
            { label: "A/2 fee", value: "Roughly ₪175 for the visa, plus around ₪175 per extension. Cash or card at the office." },
            {
              label: "Who applies",
              value: "Most yeshivot, midrashot and Masa programs file the A/2 for their whole cohort. Ask your madrich before doing it alone.",
            },
            { label: "Work rights", value: "A/2 does not give you the right to work. Volunteering inside your program is a different thing to a paid job." },
            { label: "Leaving and returning", value: "A/2 is multi-entry — you can fly to Greece for a break and come back. A B/2 that has expired cannot." },
          ],
        },
        {
          kind: "note",
          tone: "tip",
          title: "Let the program do it",
          text: "A cohort application handled by your program's administrator is faster, cheaper and far less painful than turning up alone. Your only job is getting them clean documents on time.",
        },
      ],
    },
    {
      heading: "Applying for the A/2",
      blocks: [
        {
          kind: "steps",
          items: [
            "Get the official invitation or enrolment letter from your program on their letterhead, in Hebrew or with a Hebrew translation.",
            "Passport valid for at least six months beyond the end of the program — check this before you fly, not after.",
            "Two passport photos, white background. Any photo shop in Israel does these for about ₪30.",
            "Proof of health insurance valid in Israel for the whole period.",
            "Proof you can support yourself, or a letter from the program saying room and board are covered.",
            "The blue entry slip.",
            "Book an appointment at the Misrad HaPnim (Population and Immigration Authority) branch for your city and bring the whole file.",
            "Pay the fee at the office, hand in the passport, collect the visa sticker when they tell you.",
          ],
        },
        {
          kind: "checklist",
          id: "a2-file",
          items: [
            "Passport valid 6+ months past program end",
            "Program invitation / enrolment letter",
            "Two passport photos",
            "Health insurance certificate",
            "Blue entry slip (original + photo)",
            "Proof of funds or program support letter",
            "Appointment booked and in your calendar",
          ],
        },
      ],
    },
    {
      heading: "Misrad HaPnim, without the horror stories",
      blocks: [
        p(
          "The Population and Immigration Authority runs appointment-only branches. The online system is Hebrew-first and releases slots in waves, so if there is nothing today, look again at 07:00 tomorrow.",
        ),
        {
          kind: "facts",
          rows: [
            { label: "Book online", value: "piba.gov.il — Population Authority appointments. Slots open weeks ahead." },
            { label: "Phone", value: "*3450 from an Israeli number. Hebrew, with limited English." },
            { label: "Hours", value: "Typically Sun–Thu mornings, closed Friday and Shabbat. Some branches close early two days a week." },
            { label: "Bring", value: "Every original plus a photocopy of every original. They will ask." },
            { label: "Payment", value: "Card usually works. Bring a backup — readers go down." },
          ],
        },
        {
          kind: "hebrew",
          rows: [
            { en: "I have an appointment at ten", he: "יש לי תור בעשר", say: "yesh li tor be-eser" },
            { en: "I'm a student, this is my program letter", he: "אני סטודנט, זה המכתב מהתוכנית", say: "ani student, ze ha-michtav me-ha-tochnit" },
            { en: "I want to extend my visa", he: "אני רוצה להאריך את האשרה", say: "ani rotze le-ha'arich et ha-ashra" },
            { en: "Do you speak English?", he: "אתה מדבר אנגלית?", say: "ata medaber anglit?" },
            { en: "When will it be ready?", he: "מתי זה יהיה מוכן?", say: "matai ze yihiyeh muchan?" },
          ],
        },
        {
          kind: "note",
          tone: "tip",
          title: "Go early and go with someone Israeli",
          text: "First appointment of the day beats the queue. A Hebrew speaker — a madrich, a host family member, an older student — turns an hour of confusion into ten minutes.",
        },
        { kind: "link", label: "Find your branch", sub: "Open Misrad HaPnim in Maps", to: "/explore/maps" },
      ],
    },
    {
      heading: "Extending mid-year",
      blocks: [
        p(
          "Extensions are the thing people get wrong. You apply before the current visa expires — ideally three to four weeks before. Applying after it has lapsed turns a routine extension into an overstay conversation.",
        ),
        {
          kind: "steps",
          items: [
            "Put the expiry date in your calendar with a 30-day warning the day you receive the visa.",
            "Ask your program whether they file the extension as a cohort. Most do for the spring semester.",
            "If you're filing yourself, book the appointment as soon as the reminder fires.",
            "Bring an updated letter from the program confirming you're still enrolled and the new end date.",
            "Bring proof your insurance also runs to the new date — this is the one that catches people.",
            "Pay the extension fee and keep the receipt in your vault.",
          ],
        },
        {
          kind: "note",
          tone: "money",
          title: "Budget for it",
          text: "Visa plus one extension plus photos and photocopies lands around ₪400 across the year. Keep it in your Shekk balance so it isn't a surprise in February.",
        },
      ],
    },
    {
      heading: "If something has gone wrong",
      blocks: [
        {
          kind: "facts",
          rows: [
            {
              label: "Overstayed by days",
              value: "Usually fixable. Go through your program's administrator first — they have a direct line the public queue does not.",
            },
            {
              label: "Overstayed by months",
              value: "Get help before you fly. An unresolved overstay can be flagged on future entries and complicates Aliyah later.",
            },
            { label: "Lost passport", value: "Report to the police, then to your embassy for an emergency document, then to Misrad HaPnim to re-issue the visa." },
            { label: "Lost blue slip", value: "Take your photo of it plus your boarding pass to Misrad HaPnim. This is why you photograph it on day one." },
            { label: "US embassy / consulate", value: "Branch in Jerusalem and a branch office in Tel Aviv. Appointment only, passport services separate from visas." },
          ],
        },
        {
          kind: "note",
          tone: "warn",
          title: "Nobody here is your lawyer",
          text: "This track is what students consistently report works. Anything unusual — a criminal record question, a previous deportation, a dual-national draft question — needs a real Israeli immigration lawyer, not a group chat.",
        },
      ],
    },
    {
      heading: "Aliyah, and when it changes everything",
      blocks: [
        p(
          "If you make Aliyah during or after the year, the visa track ends and a completely different one begins: teudat oleh at the airport, teudat zehut within days, a Misrad HaKlita file, and — for men under the age limit — an army obligation that a student visa never created.",
        ),
        {
          kind: "checklist",
          id: "aliyah-thinking",
          items: [
            "Spoken to Nefesh B'Nefesh or the Jewish Agency, not just friends",
            "Understood how Aliyah changes your army status",
            "Understood how it changes your US tax and student-loan position",
            "Know your rights window: sal klita payments, ulpan, tax breaks",
            "Told your program — it affects your visa file either way",
          ],
        },
        {
          kind: "note",
          tone: "tip",
          title: "Aliyah is not a paperwork shortcut",
          text: "Some students consider Aliyah purely to skip visa runs. It's a life decision with a draft obligation attached. Read the Army track before you go near it.",
        },
      ],
    },
  ],
  steps: [
    { key: "entry-slip", title: "Save your blue entry slip", detail: "Photograph it and upload it the day you land.", needsDoc: "passport" },
    { key: "passport-validity", title: "Check passport validity", detail: "Six months past the end of your program.", needsDoc: "passport" },
    { key: "program-letter", title: "Get the program letter", detail: "Official invitation or enrolment letter for the visa file.", needsDoc: "program" },
    { key: "photos", title: "Two passport photos", detail: "White background, from any Israeli photo shop." },
    { key: "insurance-proof", title: "Insurance certificate", detail: "Valid in Israel for the whole study period.", needsDoc: "insurance" },
    { key: "appointment", title: "Book Misrad HaPnim", detail: "Appointment only. Book weeks ahead at piba.gov.il." },
    { key: "a2-issued", title: "A/2 visa issued", detail: "Collect the passport and photograph the sticker.", needsDoc: "visa" },
    { key: "expiry-reminder", title: "Diarise the expiry", detail: "Set a reminder 30 days before the visa runs out." },
    { key: "extension", title: "File the extension", detail: "Before it expires, not after. Bring an updated program letter.", needsDoc: "visa" },
  ],
};

/* ══════════════════════════════ Army & service ══════════════════════════════ */

const ARMY: OfficialTrack = {
  id: "army",
  emoji: "🎖️",
  name: "Army & service",
  tagline: "Mahal, Garin Tzabar, tzav rishon, the honest map",
  blurb:
    "What a gap year does and doesn't commit you to, the real service tracks for people from abroad, and who to call before you sign anything.",
  readMins: 9,
  updated: "2026-07-25",
  tags: [
    "army",
    "idf",
    "tzahal",
    "mahal",
    "garin tzabar",
    "lone soldier",
    "tzav rishon",
    "gius",
    "draft",
    "profile",
    "hesder",
    "mechina",
    "nefesh b'nefesh",
    "service",
    "enlist",
  ],
  tldr: [
    "A gap year on a student visa creates no army obligation. Aliyah does.",
    "Mahal is the volunteer track for non-Israelis: around 18 months, no Aliyah required, strict age limits.",
    "Garin Tzabar is the structured Aliyah-and-serve track with a kibbutz group, Hebrew, and a family behind you.",
    "Tzav rishon is the first screening day — medical, Hebrew, psychotechnic. It's an assessment, not an enlistment.",
    "Your medical profile shapes which units are open to you far more than anything you say in an interview.",
  ],
  intro:
    "Every year students spend the whole of Elul arguing about the army from half-remembered stories. This track is the boring, accurate version: what each track actually is, what it costs you, and where the official answer lives.",
  sections: [
    {
      heading: "Does a gap year commit you to anything?",
      blocks: [
        p(
          "No. A student on an A/2 visa has no service obligation, no tzav rishon, and no draft file. What changes it is status — becoming a citizen, through Aliyah, creates an obligation depending on your age and gender at the time.",
        ),
        {
          kind: "facts",
          rows: [
            { label: "A/2 student", value: "No obligation. You are a foreign national studying here." },
            { label: "Oleh chadash (male, under 22ish)", value: "Full service obligation, though shortened by age at Aliyah." },
            { label: "Oleh chadash (older)", value: "Obligation shrinks with age and can reach exemption. The exact bands change — get it in writing." },
            { label: "Ben/bat meharer — child of Israelis", value: "You may already have a file even if you've never lived here. Check before you land." },
            { label: "Toshav chozer / returning resident", value: "Different rules again. This one genuinely needs advice." },
          ],
        },
        {
          kind: "note",
          tone: "warn",
          title: "Children of Israeli citizens: check early",
          text: "If either parent is an Israeli citizen you may hold citizenship you never claimed, and with it a draft file. Find out from the Israeli consulate in your home country before a long visit, not at passport control.",
        },
      ],
    },
    {
      heading: "The tracks, side by side",
      blocks: [
        {
          kind: "facts",
          rows: [
            {
              label: "Mahal",
              value: "Volunteer service for Jewish non-Israelis. Around 18 months. No Aliyah, no citizenship. Age caps apply and are enforced.",
            },
            {
              label: "Garin Tzabar",
              value: "Aliyah plus service, in a group, based on a kibbutz with an adoptive family. Full service length. Hebrew and integration built in.",
            },
            {
              label: "Individual Aliyah then draft",
              value: "You make Aliyah alone and go through the normal lishkat gius process. Most freedom, least scaffolding.",
            },
            { label: "Hesder", value: "Yeshiva study combined with service, around five years total. For men, through an Israeli yeshiva framework." },
            { label: "Mechina", value: "A pre-army leadership year. Not service itself, but the standard on-ramp for many Israelis and some olim." },
            { label: "Sherut Leumi", value: "National service, mostly for women, in hospitals, schools and community organisations." },
          ],
        },
        {
          kind: "note",
          tone: "tip",
          title: "Pick the track for your life, not the unit",
          text: "Students choose a track hoping for a specific unit and are then miserable. Choose based on citizenship, family, Hebrew and how long you want to be here. The unit is decided by your profile and the army's needs.",
        },
      ],
    },
    {
      heading: "Tzav rishon: the first order",
      blocks: [
        p(
          "Tzav rishon is a screening day at a lishkat gius (recruitment office). It is not enlistment. You'll do a medical, a Hebrew assessment, a psychotechnic test (the dapar), and an interview about your background and preferences.",
        ),
        {
          kind: "steps",
          items: [
            "Bring your teudat zehut, passport and any medical records that matter — translated if they're in English.",
            "Medical: height, weight, hearing, eyes, blood, and a doctor's interview. Declare real conditions; hiding them backfires later.",
            "Dapar: a timed reasoning test in Hebrew. There are practice sets; doing a few genuinely helps.",
            "Hebrew level test if you're an oleh — it sets your ulpan and unit options.",
            "Interview: they ask what you want. Say it plainly; also say what you'd accept.",
            "Weeks later you get your profile and, eventually, a gius date.",
          ],
        },
        {
          kind: "facts",
          rows: [
            { label: "Profile 97", value: "Top medical profile. Everything is open, including the most physical combat roles." },
            { label: "Profile 82 / 72", value: "Most combat roles open, some restrictions." },
            { label: "Profile 64 / 45", value: "Non-combat. Plenty of meaningful roles, including intelligence and technical." },
            { label: "Profile 21", value: "Exempt from service on medical grounds." },
            { label: "Appeals", value: "Profiles can be appealed with new medical evidence. It is slow but it works." },
          ],
        },
        {
          kind: "hebrew",
          rows: [
            { en: "First screening order", he: "צו ראשון", say: "tzav rishon" },
            { en: "Recruitment office", he: "לשכת גיוס", say: "lishkat gius" },
            { en: "Draft date", he: "תאריך גיוס", say: "ta'arich gius" },
            { en: "Medical profile", he: "פרופיל רפואי", say: "profil refu'i" },
            { en: "I don't understand, slowly please", he: "אני לא מבין, לאט בבקשה", say: "ani lo mevin, le'at bevakasha" },
          ],
        },
      ],
    },
    {
      heading: "Who to actually call",
      blocks: [
        {
          kind: "facts",
          rows: [
            { label: "Mahal", value: "Mahal-IDF-Volunteers — the recognised program office. They screen, place and shepherd you through." },
            { label: "Garin Tzabar", value: "Run by the Israeli Scouts. Applications open a year ahead with interviews and a seminar." },
            { label: "Nefesh B'Nefesh", value: "Aliyah plus a dedicated service advisor. Free. The single best first phone call for Americans." },
            { label: "Your program's rabbi or madrich", value: "They have watched fifty students do this. Ask them who to speak to, not what to do." },
            { label: "Lone Soldier Center", value: "Even before you serve — they run info evenings and know every track's real timeline." },
          ],
        },
        {
          kind: "note",
          tone: "warn",
          title: "Don't take the deciding advice from a group chat",
          text: "Age limits, obligation lengths and exemption bands change. Anything that determines whether you serve, and for how long, gets confirmed by the official body in writing.",
        },
        { kind: "link", label: "Lone soldier support", sub: "Rights, housing and who pays for what", to: "/explore/lone-soldier" },
      ],
    },
    {
      heading: "Money and the year before",
      blocks: [
        p(
          "The gap between deciding and enlisting is usually six to eighteen months, and it costs money: flights home, ulpan, a mechina year, living costs while you wait for a gius date.",
        ),
        {
          kind: "note",
          tone: "money",
          title: "Plan the waiting period",
          text: "Most people underestimate the wait, not the service. Keep a separate cushion in Shekk for the months between tzav rishon and gius.",
        },
        { kind: "link", label: "Move dollars into shekels", sub: "See the rate before you commit", to: "/exchange" },
      ],
    },
  ],
  steps: [
    { key: "status", title: "Confirm your status", detail: "Student, oleh, or child of an Israeli citizen — it decides everything." },
    { key: "advisor", title: "Speak to an advisor", detail: "Nefesh B'Nefesh, Mahal or Garin Tzabar. One real conversation." },
    { key: "track", title: "Choose a track", detail: "Mahal, Garin Tzabar, individual Aliyah, Hesder or Sherut Leumi." },
    { key: "documents", title: "Gather documents", detail: "Passport, birth certificate, proof of Judaism, medical records.", needsDoc: "army" },
    { key: "medical", title: "Collect medical records", detail: "Translated, for anything that could affect your profile." },
    { key: "tzav-rishon", title: "Tzav rishon", detail: "Screening day at the lishkat gius.", needsDoc: "army" },
    { key: "profile", title: "Receive your profile", detail: "Appeal it with new evidence if it's wrong." },
    { key: "gius", title: "Gius date", detail: "Enlistment order arrives. Book flights and tell your program.", needsDoc: "army" },
  ],
};

/* ═════════════════════════════ Lone soldier ═════════════════════════════ */

const LONE: OfficialTrack = {
  id: "lone-soldier",
  emoji: "🫂",
  name: "Lone soldier support",
  tagline: "Rights, housing, chagim and the people who help",
  blurb:
    "What a chayal boded is entitled to, who runs the support network, and how to use it without feeling like you're asking for charity.",
  readMins: 7,
  updated: "2026-07-25",
  tags: [
    "lone soldier",
    "chayal boded",
    "lone soldier center",
    "michael levin",
    "fidf",
    "nefesh b'nefesh",
    "yom siddurim",
    "regila",
    "housing",
    "apartment",
    "chagim",
    "leave",
    "support",
  ],
  tldr: [
    "A chayal boded is a soldier with no immediate family in Israel — including olim, Mahal volunteers and Israelis estranged from family.",
    "The status carries real, funded rights: higher pay, rent support, a monthly day off for errands, and extra leave.",
    "The Lone Soldier Center in Memory of Michael Levin is the practical hub: apartments, meals, chagim, advice.",
    "Yom siddurim — a day a month for banks, Misrad HaPnim and paperwork — exists precisely because you have no parent to do it.",
    "Ask early. Every organisation here would rather help in month one than in a crisis in month nine.",
  ],
  intro:
    "Being a lone soldier is not just serving away from home — it's an official status with a budget attached. This track lists what you're owed, who administers it, and the network of people whose actual job is to make it survivable.",
  sections: [
    {
      heading: "Who counts as a lone soldier",
      blocks: [
        {
          kind: "facts",
          rows: [
            { label: "Olim serving", value: "Made Aliyah, parents abroad. The largest group." },
            { label: "Mahal volunteers", value: "Serving without Aliyah. Recognised, with a slightly different rights package." },
            { label: "Israelis without family support", value: "Recognised through a welfare officer's assessment." },
            { label: "Orphans and estranged soldiers", value: "Recognised, with additional welfare support." },
            { label: "Who decides", value: "Your unit's mashakit tash — the welfare NCO. She is the single most important person in this process." },
          ],
        },
        {
          kind: "note",
          tone: "tip",
          title: "Find your mashakit tash in week one",
          text: "Every right on this page flows through her. Introduce yourself, explain your situation, and keep her number. Nothing gets approved that she doesn't know about.",
        },
      ],
    },
    {
      heading: "What you're entitled to",
      blocks: [
        {
          kind: "facts",
          rows: [
            { label: "Increased salary", value: "Lone soldiers receive a meaningfully higher monthly payment than the standard rate." },
            { label: "Rent assistance", value: "A monthly housing grant if you live alone or with other lone soldiers rather than on a kibbutz or with an adoptive family." },
            { label: "Yom siddurim", value: "One day a month, on top of leave, for banks, Misrad HaPnim, doctors and paperwork." },
            { label: "Extra leave", value: "Additional days, and a block of leave each year to fly home." },
            { label: "Flight home", value: "A subsidised or funded ticket home once during service, through the army or a supporting organisation." },
            { label: "Chagim", value: "Formal placement with a host family for Rosh Hashana, Pesach and Yom Kippur if you want it." },
            { label: "Food and laundry", value: "Grocery vouchers, laundry services and stocked apartments through the support organisations." },
          ],
        },
        {
          kind: "note",
          tone: "money",
          title: "The money arrives in an Israeli account",
          text: "Open the bank account early — army pay, rent support and grants all land there, and setting one up during basic training is miserable. Bring passport, teudat zehut and your enlistment paperwork.",
        },
      ],
    },
    {
      heading: "The organisations, and what each is for",
      blocks: [
        {
          kind: "facts",
          rows: [
            {
              label: "Lone Soldier Center in Memory of Michael Levin",
              value: "Apartments, furniture, Shabbat meals, chagim, social events, and someone to call. Branches in Jerusalem, Tel Aviv, Haifa and Beersheva.",
            },
            { label: "The Michael Levin Base", value: "Jerusalem drop-in centre: food, laundry, a bed, wifi and quiet. Walk in on leave." },
            { label: "FIDF", value: "Funds lone-soldier programs, flights home and welfare grants, largely through the army's own channels." },
            { label: "Nefesh B'Nefesh Lone Soldiers Program", value: "Pre-Aliyah through discharge: advisors, grants, and post-army planning." },
            { label: "Garin Tzabar", value: "If you came through Garin Tzabar, the kibbutz and adoptive family are your support structure — use them." },
            { label: "Yad L'Chayal / Hayal el Hayal", value: "Equipment, food packages, and help in specific regions." },
          ],
        },
        { kind: "link", label: "Find a centre near you", sub: "Open it in Maps", to: "/explore/maps" },
      ],
    },
    {
      heading: "Housing, in practice",
      blocks: [
        {
          kind: "steps",
          items: [
            "Decide between kibbutz placement, an adoptive family, or a lone-soldier apartment. Each has a different rent grant.",
            "Apply through the Lone Soldier Center for a subsidised apartment — they run whole buildings in Jerusalem and Tel Aviv.",
            "Never sign an Israeli lease you can't read. Get a Hebrew speaker to check the exit clause and the deposit terms.",
            "Ask specifically who pays arnona (city tax) and vaad bayit (building fees) — they're often on the tenant and they add up.",
            "Register your address with the army so your rent grant is actually paid.",
          ],
        },
        {
          kind: "note",
          tone: "warn",
          title: "Deposits disappear",
          text: "Photograph every room, wall and appliance the day you move in, timestamped. This is the single most common way lone soldiers lose ₪4,000.",
        },
        { kind: "link", label: "Housing guide", sub: "Dira hunting, deposits and contracts", to: "/explore/housing" },
      ],
    },
    {
      heading: "When it's hard",
      blocks: [
        p(
          "Most lone soldiers hit a wall somewhere around month four to six: the Hebrew is exhausting, the family is eight time zones away, and everyone else goes home for Shabbat. This is normal and it is planned for.",
        ),
        {
          kind: "facts",
          rows: [
            { label: "Mashakit tash", value: "First call for anything welfare, financial or family related." },
            { label: "Unit mental health officer", value: "Confidential. Asking does not end a combat career — untreated problems do." },
            { label: "ERAN", value: "1201 — emotional first aid, 24/7, has English-speaking volunteers." },
            { label: "Natal", value: "Trauma and war-related support, including for soldiers and families." },
            { label: "Lone Soldier Center", value: "Not just logistics — they run peer groups and know which social worker to call." },
          ],
        },
        {
          kind: "note",
          tone: "tip",
          title: "Build the Shabbat plan before you need it",
          text: "Line up two or three families who are happy to host you at short notice. The soldiers who do well are the ones with somewhere to go on a Friday, not the ones with the toughest week.",
        },
        { kind: "link", label: "Find your people", sub: "Cohort threads and friends in Shekk", to: "/social" },
      ],
    },
  ],
  steps: [
    { key: "recognition", title: "Get lone-soldier status recognised", detail: "Through your unit's mashakit tash, in week one." },
    { key: "bank", title: "Open an Israeli bank account", detail: "Salary, rent grant and flights all pay into it.", needsDoc: "financial" },
    { key: "housing", title: "Sort housing", detail: "Kibbutz, adoptive family, or a lone-soldier apartment." },
    { key: "rent-grant", title: "Register for the rent grant", detail: "Your address has to be registered with the army for it to pay." },
    { key: "center", title: "Register with a Lone Soldier Center", detail: "Meals, chagim, furniture, and a person to call.", needsDoc: "army" },
    { key: "chagim", title: "Book chagim hosting", detail: "Rosh Hashana and Pesach fill up. Ask a month ahead." },
    { key: "flight", title: "Claim your flight home", detail: "Once per service, through the army or a supporting organisation." },
    { key: "support", title: "Save the support numbers", detail: "Mashakit tash, ERAN 1201, and your centre's coordinator." },
  ],
};

/* ═════════════════════════════ University & study ═════════════════════════════ */

const UNIVERSITY: OfficialTrack = {
  id: "university",
  emoji: "📚",
  name: "University & study",
  tagline: "Masa, mechina, credit transfer, ulpan",
  blurb:
    "Getting a year here to count back home, the international schools, the paperwork universities actually want, and how tuition gets paid.",
  readMins: 8,
  updated: "2026-07-25",
  tags: [
    "university",
    "masa",
    "mechina",
    "hebrew university",
    "tel aviv university",
    "reichman",
    "idc",
    "bar ilan",
    "technion",
    "ulpan",
    "credit transfer",
    "transcript",
    "tuition",
    "scholarship",
    "student status",
  ],
  tldr: [
    "Credit transfer is decided by your home university, not by the Israeli one. Get it approved in writing before you enrol.",
    "Masa grants apply to a long list of programs and are worth real money — apply early, they're capped.",
    "The international schools at Hebrew U, TAU, Reichman and Bar-Ilan teach full degrees and semesters in English.",
    "Ulpan level is set by a placement test, not by how many years of day school you did.",
    "An official transcript has to travel institution-to-institution. A PDF you email yourself usually doesn't count.",
  ],
  intro:
    "A study year in Israel is worth far more if the credits land and the funding arrives. This track is the sequence that makes that happen, and the paperwork each stage asks for.",
  sections: [
    {
      heading: "Making the year count back home",
      blocks: [
        {
          kind: "steps",
          items: [
            "Ask your home university's registrar for their study-abroad credit policy in writing, before you commit.",
            "Send them the Israeli program's syllabi — contact hours, assessment, reading list. Vague descriptions get rejected.",
            "Get pre-approval per course, not for the program as a whole. Programs change; approvals per course survive.",
            "Confirm whether the grades transfer or only the credits. It changes how hard you push for an A.",
            "At the end, request an official transcript sent institution-to-institution, sealed or through a secure portal.",
            "Keep your own copy in the Shekk vault — you'll need it for grad school in five years.",
          ],
        },
        {
          kind: "note",
          tone: "warn",
          title: "Yeshiva and midrasha credit is a special case",
          text: "Some US universities award credit for a year in yeshiva through a partner institution; many award none. Find out which before you assume the year counts.",
        },
      ],
    },
    {
      heading: "The programs, honestly compared",
      blocks: [
        {
          kind: "facts",
          rows: [
            { label: "Masa Israel Journey", value: "An umbrella funding and framework body covering hundreds of programs, with grants and needs-based scholarships." },
            { label: "Mechina", value: "A preparatory year — leadership, Hebrew, volunteering — usually before army or university. Not academic credit." },
            { label: "Hebrew University Rothberg", value: "Jerusalem. The oldest international school; strong in Middle East studies, archaeology and Hebrew." },
            { label: "TAU International", value: "Tel Aviv. Semester and degree tracks, strong in business, innovation and social sciences." },
            { label: "Reichman (IDC) Raphael Recanati", value: "Herzliya. Full English-language degrees, business and government heavy, big international cohort." },
            { label: "Bar-Ilan International", value: "Ramat Gan. Jewish studies alongside general degrees, religious-friendly campus." },
            { label: "Technion / Weizmann", value: "Science and engineering, with English-language research programs at graduate level." },
          ],
        },
        {
          kind: "note",
          tone: "tip",
          title: "Visit before you choose",
          text: "Jerusalem, Tel Aviv and Herzliya are three different lives. Spend a Shabbat in each during the gap year — it's a better decision-maker than any brochure.",
        },
        { kind: "link", label: "Plan the visit", sub: "Trains and buses in Transit", to: "/explore/transit" },
      ],
    },
    {
      heading: "The paperwork universities want",
      blocks: [
        {
          kind: "checklist",
          id: "uni-file",
          items: [
            "Official high school transcript, sent by the school",
            "University transcript if you've already started a degree",
            "SAT/ACT or equivalent, where required",
            "English proficiency, if you're not from an English-language school",
            "Passport copy valid past graduation",
            "Two academic references",
            "Personal statement",
            "Proof of Jewish status, where a program requires it",
            "Financial proof for the student visa file",
          ],
        },
        {
          kind: "note",
          tone: "tip",
          title: "Order transcripts a month early",
          text: "US high schools are slow in July and closed in August. Request everything before you fly out for the year.",
        },
      ],
    },
    {
      heading: "Money: tuition, grants and timing",
      blocks: [
        {
          kind: "facts",
          rows: [
            { label: "Masa grant", value: "A flat grant against program fees, plus needs-based additions. Apply as early as applications open." },
            { label: "Program scholarships", value: "Most yeshivot, midrashot and universities have discretionary funds. Ask the office directly — they rarely advertise." },
            { label: "US federal aid", value: "Some Israeli institutions are approved for US federal student loans. Check before assuming." },
            { label: "Tuition currency", value: "Often quoted in dollars but charged in shekels. The rate on the day matters." },
            { label: "Payment timing", value: "Deposits in spring, balance before the semester. Late payment can block registration." },
          ],
        },
        {
          kind: "note",
          tone: "money",
          title: "Watch the conversion",
          text: "A dollar-quoted fee paid from a US card carries the bank's rate and a foreign-transaction fee. Move the money at a rate you chose and pay from shekels.",
        },
        { kind: "link", label: "See today's rate", sub: "Dollars in, shekels out", to: "/exchange" },
      ],
    },
    {
      heading: "Ulpan and Hebrew",
      blocks: [
        p(
          "Every institution places you by test. Day-school Hebrew usually reads well and speaks badly, so people land a level lower than they expect — which is fine, and better than drowning.",
        ),
        {
          kind: "facts",
          rows: [
            { label: "Levels", value: "Aleph through Vav. Aleph is beginner; Dalet is roughly the level universities want for Hebrew-language study." },
            { label: "Summer ulpan", value: "Intensive, before the academic year. The single highest-value month of a study year." },
            { label: "Olim ulpan", value: "Free through Misrad HaKlita if you've made Aliyah — separate from a university ulpan." },
            { label: "Placement test", value: "Reading, writing and a short conversation. Don't cram; be placed correctly." },
          ],
        },
        {
          kind: "hebrew",
          rows: [
            { en: "I'd like to register for the course", he: "אני רוצה להירשם לקורס", say: "ani rotze le-hirashem la-kurs" },
            { en: "Where is the student office?", he: "איפה המזכירות?", say: "eifo ha-mazkirut?" },
            { en: "I need an enrolment confirmation", he: "אני צריך אישור לימודים", say: "ani tzarich ishur limudim" },
            { en: "Can I get a student discount?", he: "יש הנחת סטודנט?", say: "yesh hanachat student?" },
          ],
        },
        {
          kind: "note",
          tone: "tip",
          title: "Ishur limudim opens doors",
          text: "The enrolment confirmation letter is what gets you the student Rav-Kav discount, gym rates and museum entry. Ask the mazkirut for two copies and keep one in your vault.",
        },
        { kind: "link", label: "Student Rav-Kav discount", sub: "How to get the 50% off", to: "/guides/$id", params: { id: "rav-kav" } },
      ],
    },
  ],
  steps: [
    { key: "credit-policy", title: "Get the credit policy in writing", detail: "From your home registrar, before you enrol.", needsDoc: "university" },
    { key: "course-approval", title: "Pre-approve each course", detail: "Send syllabi, get per-course approval." },
    { key: "transcripts", title: "Order official transcripts", detail: "School to school, a month before you need them.", needsDoc: "university" },
    { key: "masa", title: "Apply for Masa", detail: "Grants are capped — apply as soon as applications open.", needsDoc: "financial" },
    { key: "scholarship", title: "Ask about scholarships", detail: "Discretionary funds are rarely advertised. Ask the office." },
    { key: "acceptance", title: "Save the acceptance letter", detail: "You need it for the visa file too.", needsDoc: "program" },
    { key: "ulpan", title: "Book the placement test", detail: "Be placed correctly, not ambitiously." },
    { key: "ishur", title: "Collect your ishur limudim", detail: "Two copies. Student discounts run off it.", needsDoc: "university" },
    { key: "tuition", title: "Plan tuition payment", detail: "Move dollars at a rate you chose, pay in shekels.", needsDoc: "financial" },
  ],
};

export const TRACKS: OfficialTrack[] = [VISA, ARMY, LONE, UNIVERSITY];

export function getTrack(id: string): OfficialTrack | undefined {
  return TRACKS.find((t) => t.id === id);
}

/**
 * Guides and tracks are two halves of the same story — a guide explains a
 * thing, a track walks you through the paperwork for it. These maps keep them
 * cross-linked so neither reads like a separate product.
 */

/** A specific guide belongs to a specific track. */
const GUIDE_TRACK: Record<string, TrackId> = {
  "visa-extension": "visa",
  "student-discounts": "university",
};

/** Fallback: a whole guide category leans on one track. */
const CATEGORY_TRACK: Partial<Record<GuideCategoryId, TrackId>> = {
  official: "visa",
};

/** The track a guide should link across to, if any. */
export function trackForGuide(guide: { id: string; category: GuideCategoryId }): OfficialTrack | undefined {
  const id = GUIDE_TRACK[guide.id] ?? CATEGORY_TRACK[guide.category];
  return id ? getTrack(id) : undefined;
}

/** The guides worth reading alongside a track. */
export function guidesForTrack(trackId: TrackId): Guide[] {
  return GUIDES.filter((g) => trackForGuide(g)?.id === trackId);
}


/** Everything searchable about a track, flattened once. */
export function trackKeywords(id: string): string {
  const t = getTrack(id);
  if (!t) return "";
  const bits: string[] = [t.name, t.tagline, t.blurb, t.intro, ...t.tags, ...t.tldr];
  for (const s of t.sections) {
    bits.push(s.heading);
    for (const b of s.blocks) {
      if (b.kind === "p") bits.push(b.text);
      else if (b.kind === "steps" || b.kind === "checklist") bits.push(...b.items);
      else if (b.kind === "note") bits.push(b.title, b.text);
      else if (b.kind === "facts") bits.push(...b.rows.map((r) => `${r.label} ${r.value}`));
      else if (b.kind === "hebrew") bits.push(...b.rows.map((r) => `${r.en} ${r.say}`));
      else if (b.kind === "link") bits.push(b.label, b.sub);
    }
  }
  for (const s of t.steps) bits.push(s.title, s.detail);
  return bits.join(" ").toLowerCase();
}
