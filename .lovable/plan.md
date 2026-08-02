## Goal

Guides is currently 6 short entries of plain paragraphs on a flat list, with no search, no structure beyond heading + body, no links into the rest of Shekk, and it doesn't appear in global search. Turn it into the app people actually open when they don't know how something works here — deep enough to answer the question, short enough to read on a bus.

## Content model

Extend `src/lib/guides.ts` so a guide can express the shapes real how-to content needs, instead of only `{ heading, body }`:

- **Guide meta**: `id`, `emoji`, `kicker` (category), `title`, `blurb`, `readMins`, `updated` date, `tags` (searchable keywords like "rav kav", "monit sherut", "arnona"), optional `tldr` — 3 bullets answering the question before the article starts.
- **Blocks** inside each section, so content can be prose, an ordered how-to, a checklist, a callout (heads-up / money-saver / safety), a two-column facts table (costs, hours, phone numbers), a Hebrew phrase pair (what to say + transliteration), or a link block that jumps into a Shekk mini app or another guide.
- **Categories** as a first-class list (Getting around, Money, Jewish life, Settling in, Health & safety, Admin & official, Trips, Food) with counts.

## Content: ~14 guides at real depth

Keep and deepen the 6 existing ones, add the gaps that matter most for a gap year. Each gets a TL;DR, 4–6 sections, concrete numbers, the Hebrew you'll need, and links into the relevant mini app:

Getting around — Rav-Kav end to end; buses, trains and monit sherut; getting around on Shabbat.
Money — paying like a local; Bit, cash and tipping; sending money home and FX reality.
Settling in — first week checklist (day by day); SIM and eSIM; renting a room and what a lease actually says.
Jewish life — planning around Shabbat; the chagim calendar and what closes.
Health & safety — seeing a doctor same-day and what insurance covers; emergency numbers and Tzeva Adom basics.
Admin & official — visa extension and Misrad HaPnim; student ID, program letters and discounts.
Trips — doing a tiyul properly.

Content is authored in code (your choice), so it's offline-safe and instant. No seeded database rows.

## Browse screen (`/guides`)

- Editorial header, then a search field that matches title, blurb, tags and section headings, showing matched guides with the matching section named.
- Category chips to filter, with counts.
- "Continue reading" row for guides started but not finished, and a "Saved" row, both from local device state.
- A featured guide card at the top (the most useful right now, e.g. first week / Shabbat), then a clean list grouped by category with emoji, kicker, read time and updated date.

## Reader (`/guides/$id`)

- Floating back button only (it's a mini app — no header banner, per the existing mini-app shell).
- Title block with kicker, read time, last-updated, and Save + Share actions.
- TL;DR card up top.
- Sticky section index that scroll-spies as you read, so a 5-minute guide is navigable.
- Blocks render properly: numbered steps with real step chips, checklists that tick and persist per device, callouts in the semantic token colours, fact tables, Hebrew phrase rows, and inline "Open Maps / Open Transit / Top up" buttons that route into the mini apps.
- Reading-progress bar, "was this useful?" thumbs (local only), then related guides by category and a next-guide link.

## Wiring

- Add guides to `src/lib/search.ts` so global search returns them alongside services and places.
- `GuideStrip` gains the updated date and stays boxless; Explore's Guides & tips block starts using the featured guide.
- Local state (saved, read progress, checked checklist items) lives in a small `src/lib/guide-prefs.ts` following the existing `foryou-prefs` pattern — device-local, no money or account data.

## Technical notes

- Files: `src/lib/guides.ts` (model + content), new `src/lib/guide-blocks.tsx` (block renderers), new `src/lib/guide-prefs.ts`, `src/routes/guides/index.tsx`, `src/routes/guides/$id.tsx`, `src/components/GuideStrip.tsx`, `src/lib/search.ts`.
- Pure frontend/content work: no migrations, no server functions, no new packages.
- Colour, radius and shadow all come from existing tokens in `src/styles.css`; no hardcoded colours.
- Per-guide `head()` keeps unique title/description/og fields.

Once Guides is right, the same model and reader can carry the other information apps (Transit, Housing, Admin & official) with content only.
