# Shekk IA & Mobile Navigation Audit (HEAD)

Read-only audit. No files were changed.

## 1. Bottom navigation and AppShell behaviour

`src/components/AppShell.tsx` is the single shell.

- `TABS` (line ~21): `/` Home, `/israel` Explore, `/services` Services, `/social` Community, `/me` You. Same array powers `SIDEBAR_TABS` (desktop sidebar).
- `MobileNav()` renders 5 items; Home is pulled out and centred, and its **label is "Today" while the tab array calls it "Home"** — an inconsistency. Community shows an unread badge from `useUnreadChats()`.
- Active state: `useActive()` — exact match for `/`, `startsWith` for everything else. So `/services/esim` keeps Services lit, but `/explore/*` does **not** light Explore (Explore lives at `/israel`).
- Contextual/hidden chrome: `TAB_ROOTS` = tab paths + `/israel`, `/benefits`, `/guides`, `/news`, `/programme`, `/before-you-fly`. Any other path is `standalone`: **no tab bar, no QuickMenu, no dunning banner**, plus a `FloatingBack` button (unless a `ScreenHeader` registers itself via `HeaderRegistry`).
- Mini apps: `miniAppFor(pathname)` (`src/lib/mini-apps.ts`) shows `MiniAppSplash` and makes `ScreenHeader` collapse to a floating back button only. Practical consequence: **`/explore/events`, `/explore/event/$id` and `/tickets` currently have no bottom navigation at all** — they are dead-ends reached only from Explore.
- `QuickMenu()` (mobile hamburger, top-right) is the hidden second nav: Israel setup, Services, Benefits, **Shekk Money**, Settings, Help.
- `FocusScreen()` is a separate wrapper for full-page flows (topup, terms, reverify) with optional nav.
- Desktop sidebar footer is `NavBalance()` — a Shekk Money teaser card, not a balance.

## 2. Home screen sections, in display order

`src/routes/index.tsx` → `HomeScreen()`:

1. Logo + journey chip + greeting + journey line (`getJourney`, `greeting` from `src/lib/journey-phase.ts`)
2. `<LocationBar />`
3. `SetupPanel` — signed-out CTA / unfinished-setup CTA / setup progress with next action (`useSetup`)
4. `ProgrammePanel` — only when `useProgramme().joined`
5. `ServicePrompts` — eSIM + insurance, hidden once done
6. `PickedForYou` — from `travel.interests` via `resolveInterests`
7. `<GlobalSearch />`
8. `<ActiveNow />` — currently only renders for an unpaid split (`state.splits`), otherwise nothing
9. `<ForYou />`
10. "Jump back in" — `useRecentServices()`, empty state points to `/israel`
11. "Worth knowing" — admin promotions (`usePromotions("home")`)
12. `MoneyTeaser` — "Shekk Money / Coming next" card → `/money`

There is **no events/tickets/activities surface on Home at all** today.

## 3. Explore structure

- Main route: **`src/routes/israel.tsx`** at path `/israel`, exported as `EXPLORE_HOME`. Title/copy says "Explore".
- Content order: header, sticky search, "Your Israel setup" link to `/before-you-fly`, "Shekk apps" grouped tiles (`MINI_GROUPS`), "Israeli apps" (live partner services from `useCatalogue()`, minus `HIDDEN_SERVICE_IDS` = topup/split/exchange/card/wallet), "Guides & tips" (first 4 of `GUIDES`), disclaimer.
- `MINI_GROUPS` includes `{ title: "Going out", ids: ["events", "tickets"] }` — activities are one tile group among six.
- Events/tickets routes: `src/routes/explore/events.tsx` (list, filters by kind/city, links to `/tickets`), `src/routes/explore/event.$id.tsx` (detail + buy), `src/routes/tickets.tsx` (QR wallet), `src/routes/activity.tsx` (ledger-style history, links `/topup`).
- Data layer is real and reasonably complete: `src/lib/useEvents.ts`, `src/lib/events.functions.ts`, `src/lib/events.server.ts` (atomic capacity + ledger debit), `src/lib/events-admin.server.ts`, `src/lib/events-provider.server.ts` (partner feed adapter), admin UI at `src/routes/admin/apps.tsx` / events admin functions.
- Other Explore routes: `army`, `community`, `documents`, `fitness.$id`, `food`, `health`, `housing`, `idf.*`, `lone-soldier`, `map.*`, `maps`, `money-planner`, `reserve`, `rides`, `service.$id`, `shops`, `transit`, `uni`, `uni-finder`, `visa`. `explore/index.tsx`, `explore/budget.tsx`, `explore/cost-of-living.tsx` are redirect-only stubs.
- Many mini apps are `status: "planned"` in `src/lib/mini-apps.ts` (food, rides, transit, housing, shops, reserve, …) so a large share of Explore tiles open explanation pages, not tools.

## 4. Programme

- Layout route `src/routes/programme.tsx` with its own internal 4-tab bar: `/programme` Today, `/programme/schedule`, `/programme/inbox` (Updates), `/programme/info`; staff link to `/programme/staff`.
- V2 implementation is substantial: `src/lib/programme/logic.ts` (+ `logic.test.ts`), `programme-ops.server.ts`, `programme-ops.functions.ts`, `useProgrammeHub.ts`, components in `src/components/programme/*` (`Bits`, `Join`, `Post`, participant/staff views), join flow `src/routes/join.$code.tsx`, internal console `src/routes/admin/programmes.tsx`, sandbox `src/lib/programme-testbed.server.ts`.
- Surfacing is weak: **not a bottom tab**. Only entry points are the conditional Home `ProgrammePanel`, `src/routes/before-you-fly/index.tsx:180`, `src/routes/welcome.tsx:820`, and admin. `/programme` is in `TAB_ROOTS`, so it keeps the shell; its own tab row therefore stacks above the app tab bar.

## 5. Money today

- Preview/waitlist: `src/routes/money.tsx` (writes `money_waitlist`), linked from `AppShell` QuickMenu (line 206), `NavBalance` (line 249), Home `MoneyTeaser`, `before-you-fly/index.tsx:195`.
- Preserved-but-unlinked-from-tabs money screens still exist: `wallet.tsx`, `topup.tsx`, `card.tsx`, `exchange.tsx`, `activity.tsx`, `membership.tsx`, plus `src/lib/ledger.*`, `airwallex.*`, `payments.functions.ts`, `stripe.*`, `useFunding.ts`, `BalanceMini`.
- Hiding Money is safe and cheap: remove the 4 link sites above; the routes keep working by URL. **One real coupling**: ticket purchase debits the ledger (`events.server.ts` — "insufficient balance"; `explore/event.$id.tsx` shows "Paid from your Shekk balance"). If Money is hidden, paid tickets need either a free/RSVP-only mode or an external checkout, otherwise tickets become unbuyable.

## 6. Worth preserving

- Whole programme stack (schema, RLS, server ops, hooks, staff console, admin console, sandbox).
- Events/tickets stack: tables, `events.server.ts` atomic capacity, partner feed adapter, `useEvents`, `tickets.tsx` QR wallet, `QRCode`/`QrScanner`.
- Location Platform: `src/lib/places/*`, `src/components/places/*`, `useSetup`, Fitness (`src/lib/fitness.ts`), Maps mini-app, `venue_meta` / `saved_places`, Google attribution components.
- SIM/eSIM stack (`src/lib/sim*`, `sim-providers/*`, `/services/esim*`, `/admin/sim`).
- Design/shell primitives: `Kit.tsx`, `AppShell`, `MiniAppSplash`, `MiniAppIcon`, `ServiceLogo`, `GlobalSearch`, `LocationBar`, journey/setup logic (`journey-phase.ts`, `setup-checklist.ts`, `useSetup`, `useProgramme`).
- Social/chat + admin console (`/admin/*`, code 0161).

## 7. Smallest sensible rebuild

**Move (cheap, high impact)**
- Add an activities tab in place of a current one rather than a 6th: `TABS` becomes Today (`/`), Explore (`/israel`), **What's on** (`/explore/events` or a new `/whats-on`), Community (`/social`), You (`/me`). Services drops to a Home/Explore row + QuickMenu entry (it is only two tools plus links).
- Add `/explore/events`, `/explore/event/$id`, `/tickets` to `TAB_ROOTS` so activities keep the tab bar instead of behaving like a mini app; remove the `events`/`tickets` entries from `MINI_APPS` so they stop getting a splash screen.
- Surface Programme properly: keep it out of the tab bar but promote it to a pinned Home card even when not joined (join-by-code prompt), or swap Community→Programme for joined members.
- Remove the 4 Money link sites; leave routes intact.

**Redesign (contained)**
- Home section order: journey/setup → Programme (if joined) → **Today's activities + your next ticket** → recents → promotions. Drop `MoneyTeaser`; `ActiveNow` should render upcoming tickets/programme events, not only unpaid splits.
- `/explore/events`: full destination with day grouping already present, add "My tickets" as a segmented view instead of a separate top card, and city/kind filters persisted.
- Fix the Home tab label mismatch ("Home" vs "Today").

**Leave alone**
- Programme internals, places/SIM/fitness stacks, mini-app splash mechanics for genuine tools, admin console, `israel.tsx` grouping (only the "Going out" group moves out).

## 8. Risks that make a large rebuild unwise right now

- **Events have zero data**: `select count(*) from events` → 0, and project memory forbids seeded/demo data. An activities-led IA would ship visibly empty until a partner feed or admin-entered events exist.
- **Paid tickets depend on the paused ledger** (see §5) — an activities-first product with Money hidden needs a decided payment story first.
- Many Explore mini apps are `status: "planned"`; promoting activities without addressing these leaves the second tab full of placeholders.
- Two competing nav systems (bottom tabs + QuickMenu) and a third inside `/programme`; a rebuild that adds tabs without resolving QuickMenu will worsen it.
- `TAB_ROOTS` / `MINI_APPS` / `TABS` / `HIDDEN_SERVICE_IDS` all encode IA independently — any restructuring must touch all four together or chrome will disagree per-route.
- Legacy money screens (`wallet`, `topup`, `exchange`, `card`, `activity`, `verify.tsx` links) still cross-link to each other; hiding entry points leaves reachable-but-unsupported paths unless they are gated.

**Recommendation**: do the "move" set above (tab swap, `TAB_ROOTS`/`MINI_APPS` corrections, Money link removal, Home reorder) as one small pass, and defer a real activities-led rebuild until event supply and the ticket-payment decision exist.
