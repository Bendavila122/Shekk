# Explore: everything on one page, no folders

Goal: Explore stops being a set of doors. Every Shekk app and every partner app is visible on the page itself, grouped under clear headers, so nothing needs a click-through to be discovered.

## What changes on Explore

**Shekk apps** — the single flat row becomes grouped sections with the same headers Israel uses, each with a one-line hint:
- Arrival and paperwork
- Getting around
- Everyday life
- Going out
- Jewish life and news
- Staying longer
- Money and planning (anything not in the above groups lands here, so no app can silently disappear)

**Partner apps** — the "Folders" grid is removed. Each catalogue category (Transport, Food, Shopping, etc.) becomes its own section header with its app icons laid out directly underneath, same icon scale and "soon"/"info" badges as today.

Search, the Featured rail, Guides & tips and the closing note stay exactly as they are. Search results already render a flat icon grid, so they're unaffected.

## Category pages removed

`/explore/category/$id` is deleted, along with the global-search entry that pointed at it — category names will instead surface their apps through the existing service results. Nothing else in the app links to it.

## Technical notes

- `src/routes/explore/index.tsx`: drop `CategoryFolder`, render `catalogue.map` as sections using the existing `SectionHead` + `AppTile`; add a mini-app grouping table (ids per group, mirroring `src/routes/israel.tsx`) with a computed remainder group so every entry in `MINI_APPS` appears once.
- Delete `src/routes/explore/category.$id.tsx`; remove the category branch from `src/lib/search.ts` so no link points at a dead route. `src/routeTree.gen.ts` regenerates itself.
- Section headers use `h2` under the page's single `h1`; head() metadata on the route is unchanged.
- Page gets longer, so grids keep tighter vertical gaps to stay scannable on mobile.
