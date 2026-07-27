## Goal
Icons, tiles and buttons across Shekk should visibly grow slightly when hovered (desktop/trackpad), while keeping the existing press-down feel on touch.

## Approach
Almost every interactive element in the app already shares one utility class: `tap` (defined in `src/styles.css`, used in AppShell, GlobalSearch, Home, Explore, category and service pages). Extending that single utility gives consistent hover-expand everywhere without touching dozens of files.

### 1. `src/styles.css` — upgrade the `tap` utility
- Keep the current `transform/opacity` transition and `:active { scale(0.97) }`.
- Add a hover rule wrapped in `@media (hover: hover) and (pointer: fine)` so touch devices don't get sticky hover states: `&:hover { transform: scale(1.03) }`.
- Add a subtle brightness/shadow lift is optional — keep it to scale only for a clean, fast feel.
- Add a second utility `tap-icon` with a stronger hover (`scale(1.08)`) for square app/logo tiles, and `tap-flat` (hover opacity change only, no scale) for full-width list rows where growing looks odd.

### 2. Apply the icon variant
Swap `tap` → `tap-icon` on the grid/logo elements:
- `src/routes/index.tsx` — recently-used app tiles and the quick-action buttons row.
- `src/routes/explore/index.tsx` — service tiles and the large category tiles.
- `src/routes/explore/category.$id.tsx` — service tiles in the category grid.

### 3. Apply the flat variant
Swap `tap` → `tap-flat` on rows where a scale would look wrong:
- `src/components/GlobalSearch.tsx` search-result rows and the search input label.
- `src/components/AppShell.tsx` quick-menu dropdown rows, desktop sidebar links, and the bottom-nav tabs (these stay put; they get a background/colour hover instead).

### 4. Buttons
- `src/components/AppShell.tsx` primary button component and the balance/top-up button already use `hover:scale-[1.03]`; leave those, they'll match the new baseline.

## Technical notes
- All changes are CSS-utility + className swaps; no logic or data changes.
- Transitions stay at 150ms ease so page interactions still feel instant.
- Hover effects are gated behind `@media (hover: hover)` to avoid stuck states on the mobile preview.
