# Rework Lone Soldier into a real tool

Today Lone Soldier renders the shared paperwork template: a written track plus a generic eight-step checklist, the same shape as Visa. Universities and Explore the IDF were both lifted out of that template by putting an interactive tool at the top and demoting the written guidance to the bottom. Lone Soldier gets the same treatment — but its hero is not a directory or a matcher, because the real problem for a chayal boded is knowing what you are owed, who signs it off, and what to say to get it.

## The new app, top to bottom

**1. Rights check (the hero).** Four quick questions: how you got here (oleh, Mahal, Garin Tzabar, Israeli without family support), where you're up to (pre-gius, basic training, serving, last six months), where you live (kibbutz, adoptive family, lone-soldier apartment, own rental), and whether status has been recognised yet. The answers produce a personal entitlements dossier rather than a generic list:

- Each entitlement says what it is, roughly what it's worth, who approves it (almost always the mashakit tash), what to bring, and whether it looks unclaimed for you.
- Anything that doesn't apply to your track is filtered out instead of shown with a caveat — Mahal and olim genuinely differ.
- Each card carries an "ask script": one plain-English line and the Hebrew phrase to say, so the conversation is winnable at week one Hebrew.
- Answers save to the member's account, so the dossier is there next visit and on another device.

**2. Claim tracker.** The entitlements themselves become the tracked list, replacing the abstract eight-step checklist: recognised / requested / approved / paid, each with the person who owns it and a nudge for the ones that expire (flight home, chagim hosting, annual leave block). Documents that a claim needs stay wired into the existing document vault.

**3. Yom siddurim planner.** The monthly errand day is the single most wasted entitlement. Pick what you need to do — bank, Misrad HaPnim, doctor, phone, post office — and get an ordered plan for the day with opening hours, what to bring to each, and what to do first because it closes at 13:00. Saveable, reusable each month.

**4. Support network directory.** The organisations, as a browsable list rather than a table: Lone Soldier Center branches, the Michael Levin Base, FIDF, Nefesh B'Nefesh, Garin Tzabar, Yad L'Chayal — what each is actually for, which city, and what to ask them for. Each opens in Maps where a physical branch exists.

**5. Hard-week card, always visible.** Mashakit tash, unit mental-health officer, ERAN 1201, Natal — pinned near the top rather than buried in a section five screens down, with the Shabbat-plan prompt beside it.

**6. Written guidance underneath.** The existing track content stays, moved below the tools exactly as on Universities and Army, so nothing already written is lost.

## New icon

The tile currently uses a generic shield-check on the social gradient, which reads as "security", not "lone soldier". Replace it with a custom glyph — an IDF-style dog tag on its chain with a small house behind it, drawn in the same line style as the other custom mini-app glyphs — on a warmer gradient so it sits apart from the Army tile next to it rather than duplicating it.

## Technical notes

- New content module `src/lib/lone-soldier.ts`: entitlement records (id, applies-to predicate over the four answers, worth, approver, bring-list, ask script in English + Hebrew, expiry flag), the organisation directory, and the yom siddurim errand catalogue with hours and bring-lists. Written by hand from the existing track content plus the detail it currently lacks.
- New components under `src/components/lone-soldier/`: `RightsCheck` (questionnaire, same staged pattern as `UniQuestionnaire`), `Dossier` (results + claim states), `YomSiddurim`, `SupportDirectory`, `HelpCard`.
- `src/routes/explore/lone-soldier.tsx` stops rendering `TrackApp` and composes the hero + tools + `TrackGuidance` (the Universities/Army shape). Update its `head()` copy to describe the tool, not the checklist.
- Persistence: questionnaire answers and yom siddurim selections via `useLocalState`; claim states via the existing `useOfficial` task store so they sync to the account and keep the document links. The old `lone-soldier` track steps stay in `official-content.ts` for the written guidance but no longer drive the checklist.
- Icon: new `case "lone-soldier"` glyph in `src/components/MiniAppIcon.tsx`, plus the gradient/icon change in the `lone-soldier` entry in `src/lib/mini-apps.ts`.
- No new backend tables, no new APIs.

## Out of scope

- No claim submission to the army or to any organisation — Shekk prepares and tracks the ask, it cannot file it.
- No exact shekel figures for pay and grants presented as authoritative; amounts are described as ranges with a "confirm with your mashakit tash" line, since rates change yearly.
