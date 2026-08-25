/**
 * Programme testing sandbox — server only, Shekk operators only.
 *
 * One clearly labelled programme (slug `shekk-test-programme`) exists so an
 * operator can exercise the real Programme V1 system end to end from their own
 * account: they become owner-staff AND participant of the test cohort, and the
 * cohort is filled with realistic content.
 *
 * Two hard rules:
 *  1. Nothing here touches a row that does not belong to the designated test
 *     programme. Every delete is scoped by the test cohort id.
 *  2. The caller is proved to hold the Shekk `admin` role by the server
 *     function that imports this file, before the service role is loaded.
 */

import { DEFAULT_CHECKLIST } from "./programme/logic";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Db = { from: (t: string) => any };
type Row = Record<string, any>;

export const TEST_PROGRAMME_SLUG = "shekk-test-programme";
export const TEST_PROGRAMME_NAME = "Shekk Test Programme";
export const TEST_COHORT_NAME = "Summer Test Cohort";
export const TEST_JOIN_CODE = "SHEKKTEST";

async function adminDb(): Promise<Db> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as unknown as Db;
}

/* ──────────────────────────────── Time helpers ───────────────────────────── */

function offsetHours(when: Date) {
  const name =
    new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Jerusalem", timeZoneName: "shortOffset" })
      .formatToParts(when)
      .find((p) => p.type === "timeZoneName")?.value ?? "GMT+3";
  const m = /GMT([+-]?\d+)/.exec(name);
  return m ? Number(m[1]) : 3;
}

/** An ISO instant for `hour:minute` Jerusalem time, `dayOffset` days from today. */
function at(dayOffset: number, hour: number, minute = 0) {
  const base = new Date();
  base.setUTCHours(12, 0, 0, 0);
  base.setUTCDate(base.getUTCDate() + dayOffset);
  const off = offsetHours(base);
  return new Date(
    Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate(), hour - off, minute, 0),
  ).toISOString();
}

const dayOnly = (dayOffset: number) => at(dayOffset, 12).slice(0, 10);

/**
 * PostgREST rejects a bulk insert whose objects don't share the same keys, so
 * every seeded row is padded out against one template.
 */
function uniform<T extends Row>(template: T, rows: Partial<T>[]): T[] {
  return rows.map((r) => ({ ...template, ...r }) as T);
}

/* ─────────────────────────── Programme + cohort shell ────────────────────── */

async function ensureProgramme(db: Db) {
  const { data: existing } = await db
    .from("programmes")
    .select("id")
    .eq("slug", TEST_PROGRAMME_SLUG)
    .maybeSingle();
  if (existing) return String((existing as Row)["id"]);

  const { data, error } = await db
    .from("programmes")
    .insert({
      name: TEST_PROGRAMME_NAME,
      slug: TEST_PROGRAMME_SLUG,
      organisation: "Shekk internal — sandbox",
      city: "Jerusalem",
      country: "Israel",
      description:
        "Internal Shekk sandbox programme. Every event, announcement and vote in here is test data and can be reset at any time.",
      programme_type: "gap_year",
      status: "active",
      is_demo: true,
    } as never)
    .select("id")
    .single();
  if (error) throw new Error(error.message || "Could not create the test programme");
  return String((data as Row)["id"]);
}

async function ensureCohort(db: Db, programmeId: string) {
  const { data: existing } = await db
    .from("programme_cohorts")
    .select("id, join_code")
    .eq("programme_id", programmeId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (existing) {
    const id = String((existing as Row)["id"]);
    let joinCode = String((existing as Row)["join_code"]);
    if (joinCode !== TEST_JOIN_CODE) {
      const { error } = await db
        .from("programme_cohorts")
        .update({ join_code: TEST_JOIN_CODE } as never)
        .eq("id", id);
      if (!error) joinCode = TEST_JOIN_CODE;
    }
    await db
      .from("programme_cohorts")
      .update({
        name: TEST_COHORT_NAME,
        status: "open",
        is_demo: true,
        starts_on: dayOnly(-3),
        ends_on: dayOnly(60),
      } as never)
      .eq("id", id);
    return { id, joinCode };
  }

  const { data, error } = await db
    .from("programme_cohorts")
    .insert({
      programme_id: programmeId,
      name: TEST_COHORT_NAME,
      year: String(new Date().getUTCFullYear()),
      join_code: TEST_JOIN_CODE,
      status: "open",
      is_demo: true,
      timezone: "Asia/Jerusalem",
      starts_on: dayOnly(-3),
      ends_on: dayOnly(60),
      welcome_message:
        "This is the Shekk sandbox cohort. Break it, delay things, cancel things — then reset it from the console.",
    } as never)
    .select("id, join_code")
    .single();
  if (error) throw new Error(error.message || "Could not create the test cohort");
  return { id: String((data as Row)["id"]), joinCode: String((data as Row)["join_code"]) };
}

/* ───────────────────────────────── Wipe (scoped) ─────────────────────────── */

/** Delete only content belonging to the test cohort. Children cascade. */
async function wipeCohort(db: Db, cohortId: string) {
  const tables = [
    "programme_notifications",
    "programme_acknowledgements",
    "programme_audiences",
    "programme_votes",
    "programme_announcements",
    "programme_events",
    "programme_checklist_items",
    "programme_documents",
    "programme_contacts",
    "programme_places",
    "programme_groups",
  ];
  for (const table of tables) {
    const { error } = await db.from(table).delete().eq("cohort_id", cohortId);
    if (error) throw new Error(`${table}: ${error.message}`);
  }
}

/* ────────────────────────────────── Seeding ──────────────────────────────── */

async function seedGroups(db: Db, cohortId: string, userId: string) {
  const { data, error } = await db
    .from("programme_groups")
    .insert([
      { cohort_id: cohortId, name: "Bus 1", description: "Test group — north bus", colour: "#2563eb", sort_order: 0 },
      { cohort_id: cohortId, name: "Bus 2", description: "Test group — south bus", colour: "#0f766e", sort_order: 1 },
      { cohort_id: cohortId, name: "Ulpan A", description: "Test group — beginners Hebrew", colour: "#b45309", sort_order: 2 },
    ] as never)
    .select("id, name");
  if (error) throw new Error(error.message);
  const groups = new Map<string, string>();
  for (const g of (data ?? []) as Row[]) groups.set(String(g["name"]), String(g["id"]));

  const mine = ["Bus 1", "Ulpan A"].map((name) => ({ group_id: groups.get(name), user_id: userId }));
  await db.from("programme_group_members").insert(mine as never);
  return groups;
}

async function seedEvents(db: Db, cohortId: string, userId: string, groups: Map<string, string>) {
  const rows = [
    {
      title: "Morning ulpan — Aleph",
      description: "Hebrew class in the merkaz. Bring your notebook.",
      starts_at: at(0, 8, 30),
      ends_at: at(0, 10, 30),
      location_label: "Merkaz, room 2",
      event_type: "class",
      mandatory: true,
      status: "scheduled",
    },
    {
      title: "Programme briefing — please confirm you've read it",
      description: "Safety, curfew and what to do if you miss the bus.",
      starts_at: at(0, 11, 0),
      ends_at: at(0, 11, 45),
      location_label: "Main hall",
      event_type: "meeting",
      mandatory: true,
      requires_ack: true,
      status: "confirmed",
    },
    {
      title: "Old City tiyul",
      description: "Walking tour of the Old City with a guide. Limited spots — RSVP.",
      starts_at: at(0, 14, 0),
      ends_at: at(0, 18, 0),
      location_label: "Jaffa Gate",
      meeting_point: "Outside Jaffa Gate, by the taxi rank",
      event_type: "trip",
      rsvp_enabled: true,
      capacity: 3,
      status: "scheduled",
    },
    {
      title: "Dinner at the merkaz",
      description: "Bus back from the tiyul is running late, so dinner moved 30 minutes.",
      starts_at: at(0, 20, 0),
      ends_at: at(0, 21, 0),
      original_starts_at: at(0, 19, 30),
      location_label: "Merkaz dining room",
      event_type: "meal",
      status: "delayed",
      status_note: "Delayed 30 minutes — bus back from the Old City is in traffic.",
      urgent: false,
    },
    {
      title: "Bus 1 hike — Ein Gedi",
      description: "Bus 1 only. Two litres of water minimum.",
      starts_at: at(1, 7, 0),
      ends_at: at(1, 15, 0),
      location_label: "Ein Gedi",
      meeting_point: "Merkaz car park, 06:45",
      event_type: "trip",
      mandatory: false,
      status: "scheduled",
      audience_kind: "groups",
    },
    {
      title: "Hebrew conversation workshop",
      starts_at: at(1, 17, 0),
      ends_at: at(1, 18, 30),
      location_label: "Merkaz, room 4",
      event_type: "class",
      status: "scheduled",
    },
    {
      title: "Shabbaton departure",
      description: "Bags on the bus fifteen minutes before we leave.",
      starts_at: at(2, 12, 0),
      ends_at: at(2, 13, 0),
      location_label: "Merkaz car park",
      event_type: "travel",
      mandatory: true,
      status: "confirmed",
    },
    {
      title: "Kabbalat Shabbat",
      starts_at: at(2, 18, 30),
      ends_at: at(2, 19, 30),
      location_label: "Beit knesset, Nachlaot",
      event_type: "shabbat",
      status: "scheduled",
    },
    {
      title: "Havdalah and madrich check-in",
      starts_at: at(3, 20, 30),
      ends_at: at(3, 21, 30),
      location_label: "Merkaz roof",
      event_type: "activity",
      status: "scheduled",
    },
    {
      title: "Volunteering morning — food packing",
      description: "Closed shoes. Counts towards your programme hours.",
      starts_at: at(4, 9, 0),
      ends_at: at(4, 12, 0),
      location_label: "Pantry warehouse, Talpiot",
      event_type: "activity",
      rsvp_enabled: true,
      capacity: 10,
      status: "scheduled",
    },
    {
      title: "Tel Aviv day trip — read the rules",
      description: "Free day in Tel Aviv. Confirm you've read the travel rules before we go.",
      starts_at: at(5, 9, 0),
      ends_at: at(5, 19, 0),
      location_label: "Tel Aviv",
      meeting_point: "Central Station, platform 4",
      event_type: "trip",
      requires_ack: true,
      status: "tentative",
    },
    {
      title: "Weekly cohort meeting",
      starts_at: at(6, 18, 0),
      ends_at: at(6, 19, 0),
      location_label: "Main hall",
      event_type: "meeting",
      status: "scheduled",
    },
  ];

  const eventRows = uniform(
    {
      cohort_id: cohortId,
      created_by: userId,
      timezone: "Asia/Jerusalem",
      title: "",
      description: null as string | null,
      starts_at: "",
      ends_at: null as string | null,
      original_starts_at: null as string | null,
      location_label: null as string | null,
      meeting_point: null as string | null,
      online_url: null as string | null,
      event_type: "activity",
      mandatory: false,
      status: "scheduled",
      status_note: null as string | null,
      audience_kind: "everyone",
      rsvp_enabled: false,
      capacity: null as number | null,
      requires_ack: false,
      urgent: false,
    },
    rows,
  );

  const { data, error } = await db.from("programme_events").insert(eventRows as never).select("id, title, status");
  if (error) throw new Error(error.message);
  const byTitle = new Map<string, string>();
  for (const e of (data ?? []) as Row[]) byTitle.set(String(e["title"]), String(e["id"]));

  // Bus 1 hike is group-targeted.
  const hikeId = byTitle.get("Bus 1 hike — Ein Gedi");
  const bus1 = groups.get("Bus 1");
  if (hikeId && bus1) {
    await db
      .from("programme_audiences")
      .insert({ cohort_id: cohortId, subject_type: "event", subject_id: hikeId, group_id: bus1 } as never);
  }

  // The delayed dinner needs its change history, the way a real delay would.
  const dinnerId = byTitle.get("Dinner at the merkaz");
  if (dinnerId) {
    await db.from("programme_event_changes").insert({
      cohort_id: cohortId,
      event_id: dinnerId,
      field: "starts_at",
      before_value: at(0, 19, 30),
      after_value: at(0, 20, 0),
      note: "Delayed 30 minutes — bus back from the Old City is in traffic.",
      notify_level: "notify",
      changed_by: userId,
    } as never);
  }

  return { count: eventRows.length, byTitle };
}

async function seedAnnouncements(db: Db, cohortId: string, userId: string, eventIds: Map<string, string>) {
  const rows = uniform(
    {
      cohort_id: cohortId,
      created_by: userId,
      title: "",
      body: null as string | null,
      priority: "normal",
      pinned: false,
      requires_ack: false,
      audience_kind: "everyone",
      event_id: null as string | null,
      link_url: null as string | null,
    },
    [
    {
      title: "Welcome to the Shekk Test Programme",
      body: "This cohort is a sandbox. Everything in it is fake and can be reset from the Shekk console at any time.",
      priority: "important",
      pinned: true,
    },
    {
      title: "Curfew tonight is 23:00 — confirm you've seen this",
      body: "Back at the merkaz by 23:00. Tap to acknowledge so your madrich knows you read it.",
      priority: "urgent",
      requires_ack: true,
      event_id: eventIds.get("Dinner at the merkaz") ?? null,
    },
    {
      title: "Laundry pickup moves to Thursday",
      body: "Bags outside your door by 08:00.",
      priority: "normal",
    },
    ],
  );
  const { error } = await db.from("programme_announcements").insert(rows as never);
  if (error) throw new Error(error.message);
  return rows.length;
}

async function seedVote(db: Db, cohortId: string, userId: string) {
  const { data, error } = await db
    .from("programme_votes")
    .insert({
      cohort_id: cohortId,
      question: "Where should Thursday's tiyul go?",
      description: "Pick one. Some options have limited places.",
      status: "open",
      anonymous: true,
      allow_change: true,
      results_visible: true,
      closes_at: at(2, 20, 0),
      created_by: userId,
    } as never)
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  const voteId = String((data as Row)["id"]);
  const { error: optErr } = await db.from("programme_vote_options").insert([
    { vote_id: voteId, label: "Ein Gedi and the Dead Sea", detail: "Long day, early start", capacity: 2, sort_order: 0 },
    { vote_id: voteId, label: "Tzfat and the Galilee", detail: "Artists' quarter and a hike", capacity: null, sort_order: 1 },
    { vote_id: voteId, label: "Golan jeep tour", detail: "Small group only", capacity: 1, sort_order: 2 },
  ] as never);
  if (optErr) throw new Error(optErr.message);
  return 1;
}

async function seedChecklist(db: Db, cohortId: string) {
  const rows = DEFAULT_CHECKLIST.map((d, i) => ({
    cohort_id: cohortId,
    item_key: d.itemKey,
    title: d.title,
    details: d.details,
    required: d.required,
    action_url: d.actionUrl,
    feature_key: d.featureKey,
    sort_order: i,
  }));
  rows.push({
    cohort_id: cohortId,
    item_key: "test-sandbox-item",
    title: "Send your flight details to the office",
    details: "Sandbox-only item so the checklist has something programme-specific in it.",
    required: false,
    action_url: null,
    feature_key: null,
    sort_order: rows.length,
  });
  const { error } = await db.from("programme_checklist_items").insert(rows as never);
  if (error) throw new Error(error.message);
  return rows.length;
}

async function seedContacts(db: Db, cohortId: string) {
  const rows = uniform(
    {
      cohort_id: cohortId,
      name: "",
      role: null as string | null,
      category: "other",
      phone: null as string | null,
      whatsapp: null as string | null,
      email: null as string | null,
      notes: null as string | null,
      availability: null as string | null,
      is_emergency: false,
      audience_kind: "everyone",
      sort_order: 0,
    },
    [
    {
      name: "Noa (madricha, Bus 1)",
      role: "Madricha",
      category: "madrich",
      phone: "+972500000001",
      whatsapp: "+972500000001",
      availability: "07:00–23:00",
      notes: "Test contact — do not call.",
      sort_order: 0,
    },
    {
      name: "Programme office",
      role: "Office",
      category: "office",
      phone: "+972500000002",
      email: "office@example.test",
      availability: "Sun–Thu 09:00–17:00",
      sort_order: 1,
    },
    {
      name: "24/7 emergency line",
      role: "Emergency",
      category: "emergency",
      phone: "+972500000003",
      is_emergency: true,
      notes: "Test contact — do not call.",
      sort_order: 2,
    },
    ],
  );
  const { error } = await db.from("programme_contacts").insert(rows as never);
  if (error) throw new Error(error.message);
  return rows.length;
}

async function seedDocuments(db: Db, cohortId: string, userId: string) {
  const rows = [
    {
      cohort_id: cohortId,
      label: "Programme handbook (sample link)",
      description: "Rules, curfew and what the programme covers.",
      link_url: "https://example.com/shekk-test-handbook",
      category: "handbook",
      sort_order: 0,
      created_by: userId,
    },
    {
      cohort_id: cohortId,
      label: "Packing list",
      description: "What to bring for the Shabbaton and the desert hike.",
      link_url: "https://example.com/shekk-test-packing-list",
      category: "other",
      sort_order: 1,
      created_by: userId,
    },
  ];
  const { error } = await db.from("programme_documents").insert(rows as never);
  if (error) throw new Error(error.message);
  return rows.length;
}

async function seedPlaces(db: Db, cohortId: string, userId: string) {
  const rows = uniform(
    {
      cohort_id: cohortId,
      created_by: userId,
      label: "",
      category: "other",
      notes: null as string | null,
      meeting_instructions: null as string | null,
      google_place_id: null as string | null,
      address: null as string | null,
      latitude: null as number | null,
      longitude: null as number | null,
      audience_kind: "everyone",
      sort_order: 0,
    },
    [
    {
      label: "The merkaz — home base",
      category: "campus",
      notes: "Classes, dinner and the madrichim office.",
      address: "Emek Refaim, Jerusalem",
      latitude: 31.7621,
      longitude: 35.2168,
      sort_order: 0,
      created_by: userId,
    },
    {
      label: "Jaffa Gate — bus pickup",
      category: "meeting_point",
      meeting_instructions: "Outside the gate by the taxi rank. Be there ten minutes early.",
      address: "Jaffa Gate, Old City, Jerusalem",
      latitude: 31.7767,
      longitude: 35.2277,
      sort_order: 1,
      created_by: userId,
    },
    {
      label: "Ulpan building",
      category: "other",
      notes: "Hebrew classes, second floor.",
      address: "King George St, Jerusalem",
      latitude: 31.7807,
      longitude: 35.2185,
      sort_order: 2,
    },
    ],
  );
  const { error } = await db.from("programme_places").insert(rows as never);
  if (error) throw new Error(error.message);
  return rows.length;
}

/* ───────────────────────────── Membership + staff ────────────────────────── */

async function ensureOperatorAccess(db: Db, programmeId: string, cohortId: string, userId: string) {
  const { data: staff } = await db
    .from("programme_staff")
    .select("id")
    .eq("programme_id", programmeId)
    .eq("user_id", userId)
    .maybeSingle();
  if (staff) {
    await db
      .from("programme_staff")
      .update({ role: "owner", permissions: [] } as never)
      .eq("id", String((staff as Row)["id"]));
  } else {
    const { error } = await db
      .from("programme_staff")
      .insert({ programme_id: programmeId, user_id: userId, role: "owner", permissions: [] } as never);
    if (error) throw new Error(error.message);
  }

  // One active membership per member: park any other one, then join the sandbox.
  await db
    .from("programme_memberships")
    .update({ status: "left" } as never)
    .eq("user_id", userId)
    .eq("status", "active")
    .neq("cohort_id", cohortId);

  const { data: mine } = await db
    .from("programme_memberships")
    .select("id")
    .eq("user_id", userId)
    .eq("cohort_id", cohortId)
    .maybeSingle();
  if (mine) {
    await db
      .from("programme_memberships")
      .update({ status: "active" } as never)
      .eq("id", String((mine as Row)["id"]));
  } else {
    const { error } = await db
      .from("programme_memberships")
      .insert({ user_id: userId, cohort_id: cohortId, status: "active" } as never);
    if (error) throw new Error(error.message);
  }
}

/* ──────────────────────────────── Entry points ───────────────────────────── */

export type TestProgrammeSummary = {
  programmeId: string;
  cohortId: string;
  programmeName: string;
  cohortName: string;
  joinCode: string;
  joinPath: string;
  seeded: {
    events: number;
    groups: number;
    announcements: number;
    votes: number;
    checklist: number;
    contacts: number;
    documents: number;
    places: number;
  };
};

/** Where the sandbox stands right now — used to show the console shortcuts. */
export async function testProgrammeStatus(): Promise<{
  exists: boolean;
  programmeId: string | null;
  cohortId: string | null;
  joinCode: string | null;
  joinPath: string | null;
  programmeName: string;
  cohortName: string;
}> {
  const db = await adminDb();
  const { data: programme } = await db
    .from("programmes")
    .select("id, name")
    .eq("slug", TEST_PROGRAMME_SLUG)
    .maybeSingle();
  if (!programme) {
    return {
      exists: false,
      programmeId: null,
      cohortId: null,
      joinCode: null,
      joinPath: null,
      programmeName: TEST_PROGRAMME_NAME,
      cohortName: TEST_COHORT_NAME,
    };
  }
  const programmeId = String((programme as Row)["id"]);
  const { data: cohort } = await db
    .from("programme_cohorts")
    .select("id, name, join_code")
    .eq("programme_id", programmeId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  const code = cohort ? String((cohort as Row)["join_code"]) : null;
  return {
    exists: true,
    programmeId,
    cohortId: cohort ? String((cohort as Row)["id"]) : null,
    joinCode: code,
    joinPath: code ? `/join/${code}` : null,
    programmeName: String((programme as Row)["name"]),
    cohortName: cohort ? String((cohort as Row)["name"]) : TEST_COHORT_NAME,
  };
}

/**
 * Create or reset the sandbox, with the calling operator as owner-staff AND
 * participant. Idempotent: safe to run over and over.
 */
export async function resetTestProgramme(adminUserId: string): Promise<TestProgrammeSummary> {
  const db = await adminDb();
  const programmeId = await ensureProgramme(db);
  const { id: cohortId, joinCode } = await ensureCohort(db, programmeId);

  await wipeCohort(db, cohortId);
  await ensureOperatorAccess(db, programmeId, cohortId, adminUserId);

  const groups = await seedGroups(db, cohortId, adminUserId);
  const events = await seedEvents(db, cohortId, adminUserId, groups);
  const announcements = await seedAnnouncements(db, cohortId, adminUserId, events.byTitle);
  const votes = await seedVote(db, cohortId, adminUserId);
  const checklist = await seedChecklist(db, cohortId);
  const contacts = await seedContacts(db, cohortId);
  const documents = await seedDocuments(db, cohortId, adminUserId);
  const places = await seedPlaces(db, cohortId, adminUserId);

  return {
    programmeId,
    cohortId,
    programmeName: TEST_PROGRAMME_NAME,
    cohortName: TEST_COHORT_NAME,
    joinCode,
    joinPath: `/join/${joinCode}`,
    seeded: {
      events: events.count,
      groups: groups.size,
      announcements,
      votes,
      checklist,
      contacts,
      documents,
      places,
    },
  };
}
