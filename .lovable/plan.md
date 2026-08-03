# Shekk product review — post-onboarding redesign

Brutally honest read of the app as it stands. No code changed. Everything below is grounded in the current files and a mobile-width pass over `/`, `/welcome`, `/israel`, `/explore`, `/wallet`.

## Headline verdict

The new onboarding is genuinely the best surface in the product: `/welcome` reads like a journey, not a form. The rest of the app has not caught up. Post-signup, Shekk becomes a directory of ~25 mini-apps with three competing hubs, a six-tab bar plus a hamburger menu that duplicates it, and money screens that still mix real ledger language with leftover "credit" and mock catalogue data. The gap between the promise on the landing screen and the first ten seconds after signup is the single biggest product problem.

---

## 1. Inconsistencies

- **Vocabulary breaks the core rule.** `/me` still shows a card labelled "Credit balance"; `/wallet` says "Shekk balance"; the quick menu says "Balance". Memory says never "credits".
- **Two different "who am I" surfaces.** `/me` and `/settings` overlap (currency, theme, alerts appear in both paths), and `/me` links to `/welcome` as "Redo account setup" — the journey screen re-cast as a settings row.
- **Mock catalogues sit next to real infrastructure.** `PROGRAMS`, `RESTAURANTS`, `SHOPS`, `HOUSING`, `BUS_LINES`, `SHULS` from `src/lib/mock.ts` are still rendered in `/me`, `/verify`, `/explore/food`, `/explore/shops`, `/explore/housing`, `/explore/transit`, `/explore/community`, while ledger, KYC, programme and events are real. Users cannot tell which parts are true — and it contradicts the "no demo data" rule.
- **`/me` shows a programme from mock `PROGRAMS`** while `/programme` reads the real cohort from the backend. Two sources of truth for the same fact.
- **Stale intent in code that shapes UX:** `useOnboardedGate` still says "Signup is disabled for now" and only waits for hydration — so there is no real onboarding gate behind the tabs any more; gating happens ad hoc per route.
- **Transaction list mixes sources.** `state.txns` is client state hydrated from ledger snapshots but also appended locally by several actions; `/wallet` and `/activity` present that as a statement.

## 2. Weak UX

- **Signed-out `/` shows a Shekk splash reading "Opening your wallet…" and stays there** before landing anywhere, while `/israel`, `/explore` and `/wallet` bounce to `/auth?next=…`. Three different behaviours for "not signed in".
- **First screen after setup is dense.** `/` stacks logo → location bar → balance hero → journey strip → picked-for-you → global search → recents grid → ActiveNow → ForYou → promos → reverify banner. Ten sections, no single focal point.
- **Recents grid renders as an unlabelled 5-column icon block** with no heading and no empty state — for a new member it is either blank or arbitrary.
- **Duplicated action rows.** Home hero has Add/Exchange/Send/Card; wallet hero has Add/Exchange/Send/Request/Card at 9px labels in five columns. Five actions is one too many for 390px.
- **Send and Request both link to `/social`**, not to a send or request flow — two buttons, one destination, no completion of intent.
- **Balance visibility toggle in `/wallet` is local state** initialised from settings, so hiding does not persist or match the quick menu, which always shows the number in plain text.
- **`/activity` exists as a separate screen** whose content is a filtered version of the wallet list.

## 3. Still feels like disconnected mini-apps

- **Three overlapping hubs:** `/israel` (grouped mini-apps), `/explore` (folders + featured + guides + Shekk apps) and `/before-you-fly` (arrival checklist). "Guides", "visa", "documents" appear in more than one of them, and the quick menu adds "All apps" and "Before you fly" as separate entries again.
- **Mini-apps are deliberately sealed off** — own splash, no tab bar, floating back button. That was the right call for map/maps, but it also means genuinely core surfaces (documents, health, transit, tickets) leave the product shell and lose balance, search and navigation context.
- **Nothing flows between apps.** Booking a ticket, ordering food or planning a ride never returns to money, and money never links back to what was spent on. There is no shared object (a trip, a day, a spend) that the apps agree on.
- **The four strategy pillars are invisible in the IA.** Navigation is Home/Money/Israel/Programme/Social/Me — Israel Setup and Daily Life are fused into one "Israel" bucket of 20+ tiles.

## 4. Navigation issues

- **Six bottom tabs plus a hamburger with eleven more links** (including the admin console, which memory says should be hidden from normal navigation). The hamburger is the real navigation, which means the tab bar is not.
- **The raised centre Home button was flattened**, so the tab bar is now six equal 11px labels — "Programme" truncates visually against "Social".
- **Admin console link is exposed in the member quick menu**, contradicting the "hidden from normal navigation, code 0161" rule.
- **Back behaviour differs by screen class:** mini-apps get a floating chevron, info pages get a fixed header, tab roots get nothing, and `ScreenHeader` defaults `back` to `/explore` regardless of where the user came from.
- **Desktop sidebar duplicates the tab list but not the quick menu**, so several screens are reachable on mobile only.

## 5. Onboarding gaps

- The journey ends at a celebratory summary, then drops into the dense home. **No first-run guidance on the home screen itself** — no "here's your wallet, here's your programme" moment.
- **Verification is explained then deferred**, and the only nudge afterwards is a single line in the journey strip. There is no persistent, dismissible wallet-readiness state anywhere else.
- **Interests are collected and used only for one horizontal rail.** They do not reorder `/israel`, `/explore` or ForYou.
- **No "add your first money" walkthrough.** The empty wallet has a button; the FX/rate explanation from onboarding is not repeated where it matters.
- **Programme join has no second chance surface** other than the `/programme` tab, which for unjoined members is a form rather than a hub.
- Existing-user migration card works, but it competes with verification and first-top-up for the same slot.

## 6. Copy improvements

- Kill "Credit balance" (`/me`) → "Shekk balance".
- "Redo account setup" → "Your journey details".
- "Opening your wallet…" on a signed-out splash is a promise the app cannot keep at that moment.
- `/me`'s "How your Shekk account works" is a nine-bullet legal wall in a product screen; compress to three plain lines with a link to the full terms.
- "Finish opening your account" (`/me`) reintroduces bank-account framing the onboarding deliberately avoided.
- Mini-app blurb on `/explore` ("Apps marked 'soon' open a guide for now") admits incompleteness in the wrong place.
- Tab label "Programme" is right; "Israel" is vague — "Living here" or "Life" describes the content better.

## 7. Visual hierarchy problems

- **Home has two gradient heroes competing** (balance card, then premium benefits card on explore) with the same visual weight as ordinary cards below.
- **Type scale collapses at the bottom of screens:** 9px, 9.5px, 10px, 11px, 11.5px and 12px all appear as body-adjacent sizes. Below 11px is not readable on device.
- **Every block is a rounded card with the same border, radius and shadow**, so nothing signals importance; the journey strip (the most important element) looks identical to a promo.
- **Uppercase tracking-widest micro-labels are used everywhere**, diluting their function as section markers.
- **Dark mode is force-white in `MiniAppIcon`** via hardcoded values rather than tokens — correct visually, fragile structurally.

## 8. Opportunities for delight

- A real **"Today in Israel"** single card: Shabbat times for the member's city, weather, next programme item, transport disruption — one card that replaces four widgets.
- **Countdown continuity**: the "X days until you fly" from onboarding should live on the home hero until arrival, then become "Day 12 in Israel".
- **First top-up celebration** with the exact rate honoured, shown as a small receipt moment.
- **Been There progress** surfaced on home as one line ("6 of 26 areas") rather than buried in a mini-app.
- Programme **arrival day mode**: on the arrival date, home reorders itself to airport → SIM → transport → first Shabbat.
- Haptic-style micro-feedback on QR pay and split settle.

## 9. Trust and compliance concerns

- **Simulated card presented close to real money.** `/wallet` shows a Mastercard face with `•••• last4`, expiry and "in Apple Pay" copy; the card programme is not live. The "Preview" labelling is not on this surface.
- **"Your shekel account and card are provided by Airwallex"** is stated as fact in `/wallet` and `/me`; if the Airwallex account is not provisioned for a given member, that is a claim the product cannot support yet.
- **Mock merchant/venue catalogues in a financial app** imply partnerships that do not exist (specific restaurants, shops, housing listings, bus lines).
- **Admin console reachable from the member menu** — a single tap plus a shared 4-digit code protects real member and money data.
- **Client-side money display** derives from `state.txns` in client state; any local append path risks showing a balance the ledger does not agree with.
- Eligibility rules (16+, non-resident, KYC before spending) are stated in `/me` prose only, not enforced or surfaced at the point of top-up.

## 10. Top 20 improvements, ranked by value vs effort

| # | Change | Value | Effort |
|---|---|---|---|
| 1 | Remove the admin console link from the member quick menu | High | Trivial |
| 2 | Fix money vocabulary everywhere ("Credit balance" → "Shekk balance", drop "opening your account") | High | Trivial |
| 3 | Give signed-out `/` one deterministic behaviour: redirect to `/welcome` | High | Low |
| 4 | Make Send and Request open real send/request sheets instead of both linking to `/social` | High | Low |
| 5 | Cut the wallet hero to four actions and raise label size to 11px | High | Low |
| 6 | Remove all mock catalogues from user-facing screens; show honest empty states | High | Low |
| 7 | Collapse home to four blocks: balance, next step, today, one discovery rail | High | Medium |
| 8 | Merge `/activity` into `/wallet` as a filtered full list; keep one route | Medium | Low |
| 9 | Merge `/explore` and `/israel` into one "Life" hub; keep `/before-you-fly` as a stage inside it | High | Medium |
| 10 | Reduce the tab bar to five: Home, Money, Life, Programme, Social; move Me into the header avatar | High | Medium |
| 11 | Replace the hamburger with a real overflow on Me only; nothing should be menu-exclusive | High | Medium |
| 12 | Persistent, dismissible "wallet not ready" state until KYC clears | High | Low |
| 13 | Drop the simulated card face from `/wallet`; replace with an honest "Card coming" strip | High | Low |
| 14 | Consolidate the nine-bullet account explainer into three lines + terms link | Medium | Trivial |
| 15 | Make interests actually reorder the Life hub and ForYou, not just one rail | Medium | Medium |
| 16 | One "Today in Israel" card replacing the separate Jewish Life / weather / news widgets on home | High | Medium |
| 17 | Unify back navigation: one `ScreenHeader` contract, history-aware, no `/explore` default | Medium | Low |
| 18 | Establish a 3-level card hierarchy (hero / primary / quiet) and apply it | Medium | Medium |
| 19 | Carry the arrival countdown into the home hero, then switch to "Day N in Israel" | Medium | Low |
| 20 | First top-up receipt moment with the honoured rate | Medium | Medium |

## Screens to remove, merge or redesign

**Remove**
- `/activity` (fold into `/wallet`).
- Mock-data screens as they stand: `/explore/food`, `/explore/shops`, `/explore/housing`, `/explore/community`, `/explore/transit` — either back them with real data or remove them from navigation.
- Quick-menu admin entry.

**Merge**
- `/explore` + `/israel` → one hub with stages (Before you fly / Getting around / Everyday / Going out / Longer term).
- `/me` + `/settings` → one account screen with sections.
- `/before-you-fly` → a stage inside the merged hub, still deep-linkable.

**Redesign**
- `/` home: four blocks, one focal point, first-run state.
- `/wallet`: four actions, honest card strip, one activity list with filters.
- `/programme` unjoined state: a hub that shows what joining unlocks, not a bare form.
- `/me`: profile + status + short explainer, legal text behind a link.

## What is genuinely good

- `/welcome` landing and staged setup: tone, pacing, live day-count summary, chapter progress.
- Programme model, ledger, KYC separation, events capacity locking — the backend is ahead of the UI.
- Mini-app splash and icon system: the most distinctive visual asset in the product.
- Israel map and Guides are both real, deep and useful.
