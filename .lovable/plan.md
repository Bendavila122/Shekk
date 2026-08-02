## What's there now

`/explore/admin` is a placeholder: three hardcoded visa steps and four fake PDF names, no backend, no uploads. It isn't even registered in the mini-app catalogue (`src/lib/mini-apps.ts`), so it has no icon, no splash, and shows the normal Shekk header instead of running as its own app.

## What I'll build

### 1. Official — the mini-app shell

Rebuild `/explore/admin` as **Official** (tagline "Visas, army, uni and paperwork"), registered in `src/lib/mini-apps.ts` with its own icon gradient and launch splash so it behaves like the other mini-apps. Home screen is four tracks plus a "Your documents" tile and a "What's next" strip pulled from the member's own status.

### 2. Four guide-quality content tracks

Authored in code (same model as Guides, so it loads instantly and stays searchable):

- **Visas & status** — A/2 student visa, B/2 tourist entry, extensions at Misrad HaPnim, what to bring, fees, biometrics, overstaying, leaving and re-entering, teudat zehut vs passport stamp, Aliyah basics and when it changes your visa.
- **Army & service** — the honest map: Mahal, Garin Tzabar, Hesder/Mechina interaction, Nefesh B'Nefesh service track, tzav rishon, gius dates, medical profile, what a gap year does and doesn't commit you to, who to actually call.
- **Lone soldier support** — Lone Soldier Center, FIDF, Michael Levin Base, rights and payments, housing, laundry/food, chagim, leave (regila), mental-health lines, family visits.
- **University & study** — Masa, mechina, one-year programs, Hebrew U/TAU/IDC international schools, credit transfer to US schools, transcripts, ulpan levels, student status paperwork, tuition timing and Shekk payments.

Each guide keeps the existing block types: TL;DR, numbered how-tos, tickable checklists, fact tables (fees, hours, phone numbers), Hebrew phrase rows, tip/warning/money callouts, and jump-links into Health, Maps, Transit, Exchange, Social. All indexed in global search (`src/lib/search.ts`).

### 3. Your status — a real tracker

A per-member checklist backed by the database, not hardcoded: pick your track (student visa / tourist / Mahal / Garin Tzabar / university), and get the real ordered steps with dates, due dates, "done" ticks, and notes. It surfaces the next thing due on the Official home tile.

### 4. Document vault — real private uploads

Members upload passport pages, visa stickers, acceptance letters, insurance policies, army paperwork. Same security model as the insurance-card wallet: a private bucket keyed by user id, rows readable/writable only by their owner, short-lived signed links to view, and a category per document so the checklist can say "passport photo page — uploaded ✓".

## Technical notes

- New tables: `official_tasks` (per-member track step state) and `official_documents` (category, label, storage path, mime, size, expiry). Both RLS-scoped to `auth.uid()` with explicit GRANTs to `authenticated` and `service_role`.
- New private storage bucket `member-documents` with `storage.objects` policies restricting each member to their own `{user_id}/…` prefix.
- Server layer: `src/lib/official.server.ts` (shaping, signed URLs, upload paths) with `src/lib/official.functions.ts` exposing authenticated server functions via `requireSupabaseAuth`; hooks in `src/lib/useOfficial.ts`.
- Content: `src/lib/official-content.ts` reusing the `GuideBlock` model so the reader components are shared rather than duplicated.
- Routes: `src/routes/explore/admin.tsx` (home), `official.$track.tsx` (track reader), `official.documents.tsx` (vault). Each gets its own `head()` metadata.
- No seeded or demo rows — the vault and tracker start empty for every member.
