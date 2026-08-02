## Goal

Make the Explore tab feel like a real app home screen, and give Shekk's own mini apps icons that hold up next to partner brand marks (Wolt, Gett, Moovit) instead of emoji tiles.

## 1. Mini app icons (Shekk-owned)

Right now `MiniAppIcon` is a flat gradient squircle with one Lucide glyph at 46% scale — same silhouette for all 17 apps, so they read as a set of placeholders. Upgrade to a small icon system:

- **Depth**: layered squircle — base gradient, a soft radial highlight top-left, existing top sheen kept but softened, plus an inner hairline and a subtle bottom inner shadow so the tile reads as glass, not flat CSS.
- **Per-app motif**: add an optional background motif per mini app drawn behind the glyph (concentric rings for Maps, contour lines for Been There, grid for Transit, arc/burst for Events, etc.) as inline SVG in the icon component, keyed off `app.id`. Glyph stays the focal point.
- **Optical sizing**: per-app glyph scale + stroke tuning (wide glyphs like `ArrowLeftRight` and `UtensilsCrossed` need a smaller box than `MapPin`) via optional `iconScale` on the `MiniApp` type.
- **Gradient pass**: several apps currently share `--grad-social` / `--grad-events` / `--grad-wallet`. Re-assign so no two adjacent icons in Explore share a gradient, and keep every value a token from `styles.css` (no hardcoded colors).
- Icon renders identically at 40px (tiles), 60px (grid), 92px (splash) — verify all three sizes.

## 2. Explore page UI

Current page is a stack of loosely related blocks: heading, search, a premium benefits card, a news card, a 2-col category folder grid, then guides. Tighten into a deliberate hierarchy:

- **Header**: keep the big display title, move search into a sticky pill that condenses on scroll.
- **Featured row**: replace the two one-off promo cards (Benefits, News) with a single horizontally scrollable "Featured" rail using consistent card geometry, so adding a third feature later doesn't break the layout.
- **"Your apps" section**: surface the Shekk mini apps directly as an icon grid (4-up on mobile) above the folders — currently they're only reachable by opening a category. Uses the new `MiniAppIcon`.
- **Folders**: restyle category folders as true iOS-style folders — a rounded translucent tile containing a 2x2 mini-preview of the first four service icons inside it, with the label below, instead of a single large emoji.
- **Guides**: keep, but as a compact 2-col strip under a proper section header with consistent spacing rhythm.
- Consistent vertical rhythm and section headers throughout; all colors via semantic tokens.

## Technical notes

- Files: `src/components/MiniAppIcon.tsx` (icon system + motifs), `src/lib/mini-apps.ts` (gradient re-assignment, optional `iconScale`/`motif` fields, exported `MINI_APPS` list for the Explore grid), `src/routes/explore/index.tsx` (layout), possibly small token additions in `src/styles.css`.
- `MINI_APPS` is currently module-private; export a `miniApps()` accessor for the new grid rather than duplicating the list.
- No backend, no data-model, no route changes — presentation only.
- Verify visually at 393x706 (the user's viewport) plus a desktop width.
