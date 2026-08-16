# Cohesivity sprint — remaining items

Waves 1 and 3 landed already (`/setup` retired, Explore naming settled, one `SectionHead`, one `BalanceMini`, Friends naming, planner in the Money tab, search index filled, contextual back, tab chrome on `/guides` and `/news`). Three items are still open.

## 1. Shared empty and error states (E9)

- Add an `ErrorState` primitive to `src/components/Kit.tsx` (icon, short message, optional retry button) alongside the existing `EmptyState`.
- Replace the hand-rolled signed-out block in `src/routes/social/index.tsx` (lines 48–66) with `EmptyState` so Friends matches every other screen.
- Adopt `ErrorState` on the data-backed screens that currently improvise a failure message (health, documents, events, news) — same visual language everywhere.

## 2. Cross-link guides and official tracks (E12)

- Map guide categories to official tracks (visa, army, lone soldier, uni).
- On a guide page whose category maps to a track, render one `ToolRow` into that track's mini app.
- On each track app, add one link back to the related guides list.
- Effect: the two content systems stop behaving like separate products.

## 3. One canonical membership entry (E14)

- Make `/membership` the single upsell destination and `/benefits` purely the catalogue reached from it.
- Standardise the six inbound links (`me`, `wallet`, `card`, `exchange`, `benefits/index`, `benefits/$id`) onto the same `ToolRow`/pill pattern so membership reads as one funnel rather than six ad-hoc prompts.

## Notes

No schema changes, no new dependencies, no behaviour changes to money or auth. E15 (deleting the redirect shims) stays deferred — those shims protect published URLs.

## Technical detail

- `Kit.tsx` gains `ErrorState({ title, body, onRetry })`, styled to match `EmptyState`.
- Guide-to-track mapping lives beside the existing content model in `src/lib/official-content.ts`; guide rendering stays in `src/routes/guides/$id.tsx`, track rendering in `src/components/official/TrackApp.tsx`.
- Membership link pattern reuses `ToolRow` from `Kit.tsx`; `src/routes/membership.tsx` and `src/routes/benefits/index.tsx` keep their current data sources.
