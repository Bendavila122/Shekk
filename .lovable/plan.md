# Shekk full-app cohesivity audit

Scope: 72 route files, five-tab shell, ~30 mini apps, shared kit. No major features added, no redesign. Everything below is verified against the code.

## A. Overall assessment

**Where it already feels like one product**
- The shell is genuinely good: `src/components/AppShell.tsx` owns one tab bar (Today / Money / Explore / Programme / Friends), one quick menu, one balance card, one reverify banner. It knows the difference between a tab root and a mini app and adapts chrome accordingly.
- The mini-app tier is coherent as a *tier*: `src/lib/mini-apps.ts` + `MiniAppSplash` + `MiniAppIcon` give every tool the same launch feel and icon language.
- Consolidation work from previous sprints landed properly. `explore/budget`, `explore/cost-of-living`, `explore/uni-finder`, `explore/idf.index`, `explore/community` and `explore/index` are all clean redirect shims — old links still work, no duplicate UI.
- The paperwork tier (visa, army, lone soldier, uni) shares one content model (`src/lib/official-content.ts`) and one component set (`src/components/official/*`).

**Where it feels fragmented**
1. **Two names, one place.** The third tab is labelled "Explore", lives at `/israel`, and its page title is "Explore". `/setup` calls itself "Israel Setup". A user cannot form a stable mental model of that section.
2. **Two pre-arrival checklists.** `/setup` and `/before-you-fly` derive the same four facts (programme joined, profile, KYC, balance) and link to the same tools. `/setup` has **zero inbound links anywhere in the app** — it is a fully built orphan.
3. **The kit is only half adopted.** 20 of 71 route files import `@/components/Kit`. `src/routes/israel.tsx:39` declares its *own* local `SectionHead` that duplicates `Kit.tsx:39` with different typography. The mini-app tier hand-rolls headers and empty states.
4. **Money is split across two tabs.** The Money Planner — the app's budgeting tool — lives under Explore → "Plan and paperwork" and is not linked from `/wallet` at all.
5. **Search is stale.** `src/lib/search.ts` indexes 20 pages but omits Money, Card, Programme, Before you fly, Membership, Tickets, Events, Money Planner, Ulpan, News, Benefits, Settings, Exchange. It also calls Home "your app springboard" and the tab "Me" (the UI says "You").
6. **Terminology drift.** money / shekels / balance; Friends / Social / Programme; mini app / Shekk app / Israeli app / Soon.

Verdict on the key question: a new user would feel the *shell* was designed as one system, and the *contents* were assembled over time.

## B. Redundancy / overlap report

| # | Overlap | Evidence |
|---|---|---|
| 1 | `/setup` vs `/before-you-fly` — same derived state, same outbound tools, one has no entry point | `setup.tsx:49-56` vs `before-you-fly/index.tsx:44-60` |
| 2 | Local `SectionHead` vs kit `SectionHead` | `israel.tsx:39` vs `Kit.tsx:39` |
| 3 | Quick menu balance card vs desktop sidebar balance card — near-identical markup, not shared | `AppShell.tsx:197-205` vs `236-253` |
| 4 | Membership funnel spread over `/membership`, `/benefits`, `/benefits/$id` with 6+ inbound links and no canonical entry | `me.tsx:144`, `wallet.tsx:146`, `card.tsx`, `exchange.tsx`, `benefits/index.tsx:42` |
| 5 | Two content systems for "explain Israel to me": `lib/guides.ts` and `lib/official-content.ts` (the latter imports the former's block types) | `official-content.ts:12,36` |
| 6 | "Friends" tab renders a programme link card and describes itself as programme-scoped | `social/index.tsx:21,31` |
| 7 | Five redirect-only route files left as cleanup debris | `explore/{budget,cost-of-living,community,index,uni-finder}`, `explore/idf.index` |

## C. Cohesivity issues

- **Chrome cliff.** `TAB_ROOTS` (`AppShell.tsx:256`) grants tab chrome to `/israel` and `/benefits` but not `/guides`, `/news`, `/before-you-fly`. One tap from Explore the tab bar vanishes with no explanation.
- **Back target hardcoded.** `ScreenHeader`'s default `back` is `/israel` (`AppShell.tsx:363`), so screens reached from Today or the quick menu send you sideways into Explore. `before-you-fly/index.tsx:68` and `setup.tsx:96` both re-state that assumption.
- **One component, two header styles.** `ScreenHeader` renders differently depending on `miniAppFor(pathname)` (`AppShell.tsx:393-428`) — same import, two visual dialects.
- **Empty states diverge.** `social/index.tsx:48-61` hand-rolls a signed-out state instead of `EmptyState`.
- **No shared error state.** `Kit.tsx` has `EmptyState` and `LoadingBlocks` but no error primitive; each screen improvises.
- **Terminology.** "Your shekels" (`AppShell.tsx:197`) vs "Money" (`wallet.tsx:61`) vs "Add money"; tab "Friends" vs page "Social"; "Me" in search vs "You" in the sidebar.

## D. Missing connections

- Money tab → Money Planner (the planner is invisible from the place money lives).
- Money tab → Exchange rate context and Activity are there, but nothing links to Membership benefits in the same visual pattern as other money rows.
- Programme → Before you fly exists; Today → Before you fly exists; but Before you fly does not link back to Programme.
- Health cover, Documents and Insurance never surface from Before you fly's checklist even though they are the artefacts it asks for.
- Search never surfaces the five tabs themselves or any money route.
- Guides never links into the matching Official track (visa guide → `/explore/visa`), and vice versa.

## E. Recommended changes

**E1. Retire `/setup`, keep one pre-arrival journey**
Problem: a complete, unreachable duplicate of `/before-you-fly`. Change: turn `setup.tsx` into a redirect shim to `/before-you-fly` (same pattern as `explore/budget.tsx`); port any step copy that only exists in setup into `before-you-fly`. Why: removes the app's largest single redundancy and settles "where does prep live". Impact High. Effort Small. Files: `src/routes/setup.tsx`, `src/routes/before-you-fly/index.tsx`.

**E2. Settle the Explore name**
Problem: `/israel`, tab "Explore", title "Israel Setup" elsewhere. Change: keep the `/israel` path (published URL, no breakage) and make every user-facing string say "Explore" — page title, meta, back-button labels, search entry. Rename the `back` default in `ScreenHeader` to a named constant `EXPLORE_HOME` so the intent reads correctly. Why: one noun per concept. Impact High. Effort Small. Files: `israel.tsx:20,189`, `AppShell.tsx:363`, `search.ts`.

**E3. Delete the local `SectionHead`, adopt the kit**
Problem: two section headers with different typography, one file apart. Change: `israel.tsx` imports `SectionHead` from `Kit`; delete the local copy and reconcile the small style delta into the kit version. Why: the most visible instance of pattern drift. Impact Medium. Effort Small.

**E4. Surface Money Planner inside the Money tab**
Problem: budgeting lives two tabs away from money. Change: add a `ToolRow` on `/wallet` linking to `/explore/money-planner` (keep the Explore tile too — one canonical home, one contextual entry). Why: the strongest missing connection in the app. Impact High. Effort Small. Files: `wallet.tsx`, `Kit.tsx` (`ToolRow`).

**E5. Complete the search index**
Problem: half the app is unsearchable and two entries use stale names. Change: add Money/`wallet`, Card, Programme, Friends, Before you fly, Money Planner, Exchange, Membership, Benefits, Tickets, Events, Ulpan, News, Settings; fix "Home — your app springboard" and rename "Me" to "You". Why: search is the app's cross-cutting connective tissue; today it silently contradicts the nav. Impact High. Effort Small. File: `src/lib/search.ts`.

**E6. One balance widget**
Problem: quick menu and sidebar duplicate the balance card. Change: extract a single `BalanceMini` component inside `AppShell.tsx` used by both. Why: guarantees the two breakpoints can never drift. Impact Medium. Effort Small.

**E7. Standardise the money noun**
Problem: money / shekels / balance used interchangeably. Change: adopt one rule — the figure is "Your shekels", the section is "Money", the action is "Add money" — and apply it everywhere those three strings appear. Why: consistent voice without touching logic. Impact Medium. Effort Small.

**E8. Fix the Friends/Social split**
Problem: tab says Friends, page says Social, copy says programme. Change: page `<h1>` and meta title become "Friends"; the programme link card gets a "From your programme" section head so it reads as a deliberate cross-link rather than a stray. Impact Medium. Effort Small. File: `social/index.tsx:21,27,31`.

**E9. Add `EmptyState` to Friends and an `ErrorState` to the kit**
Problem: divergent signed-out state, no shared error pattern. Change: `social/index.tsx` uses `EmptyState`; add a small `ErrorState` to `Kit.tsx` (icon, message, retry) and adopt it on the data-backed screens that currently improvise. Impact Medium. Effort Medium.

**E10. Soften the chrome cliff for content screens**
Problem: `/guides` and `/news` lose the tab bar although they are browsing destinations, not focused tools. Change: add `/guides` and `/news` to `TAB_ROOTS` so browsing keeps the tab bar and only true mini apps go full-bleed. Why: makes the standalone rule legible — full-bleed means "a tool you're inside". Impact Medium. Effort Small. File: `AppShell.tsx:256`.

**E11. Contextual back, not a hardcoded parent**
Problem: back from a mini app always goes to Explore. Change: `ScreenHeader` prefers router history when it exists and falls back to Explore (mirrors `FloatingBack`, `AppShell.tsx:262-276`). Impact Medium. Effort Small.

**E12. Cross-link guides and official tracks**
Problem: two content systems that never reference each other. Change: on a guide whose category maps to a track, render one `ToolRow` to the track app, and on each track page one link back to related guides. Impact Medium. Effort Medium. Files: `guides/$id.tsx`, `components/official/TrackApp.tsx`.

**E13. Link Before you fly to the artefacts it asks for**
Problem: the checklist asks for insurance, documents and health cover but doesn't link to them. Change: point the relevant steps at `/explore/health`, `/explore/documents`, `/before-you-fly/insurance`; add a "Your programme" row back to `/programme`. Impact Medium. Effort Small.

**E14. One canonical membership entry**
Problem: six inbound links, two routes, no clear canonical page. Change: make `/membership` the single upsell destination and `/benefits` purely the catalogue reached from it; standardise all six inbound links to the same `ToolRow`/pill pattern. Impact Low–Medium. Effort Medium.

**E15. Remove redirect debris (later, optional)**
Once analytics show no traffic on `explore/budget`, `cost-of-living`, `community`, `uni-finder`, `idf.index`, delete the shims. Impact Low. Effort Small. Keep them for now — they protect published URLs.

## F. Prioritised implementation sequence

**Wave 1 — remove redundancy and settle names (all Small)**
1. E1 retire `/setup`
2. E2 settle the Explore name
3. E5 complete the search index
4. E7 standardise the money noun
5. E8 fix Friends/Social

**Wave 2 — standardise shared patterns**
6. E3 kill the duplicate `SectionHead`
7. E6 one balance widget
8. E9 EmptyState on Friends + `ErrorState` in the kit

**Wave 3 — connect the sections**
9. E4 Money Planner in the Money tab
10. E13 Before you fly → health / documents / insurance / programme
11. E10 chrome cliff for `/guides` and `/news`
12. E11 contextual back

**Wave 4 — deeper cross-linking**
13. E12 guides ↔ official tracks
14. E14 canonical membership entry
15. E15 redirect cleanup, once traffic confirms it is safe

Waves 1 and 2 are almost entirely string, import and route-shim work — no behaviour change, no schema change, no new dependencies.
