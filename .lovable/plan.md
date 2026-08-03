# Shekk: pre-beta review and one-sprint launch plan

Verified against the current code: 5-tab shell (Today / Money / Israel / Programme / Friends), 28 mini apps, 25 partner services (13 live, 12 "guide"), two parallel pre-arrival checklists (`/setup` and `/before-you-fly`), and simulated card + several fake commerce flows (`src/routes/explore/food.tsx` completes an order from `RESTAURANTS` in `src/lib/mock.ts` and shows "Rider: Ofir · paid from your Shekk balance").

## 1. The 20 biggest weaknesses, by impact

1. **Fake money flows can execute.** Food/rides/reserve/transit/shops screens debit the balance against mock catalogues. In a beta with real participants this is the single most damaging thing in the app — it looks like fraud, not a prototype.
2. **Card is simulated but presented as a product.** `/card` renders a Mastercard face with a small "Preview" badge. A student who tops up expecting to tap will be stranded.
3. **The core loop is unproven end-to-end.** Top-up runs against an Airwallex sandbox by default; nobody can yet complete fund → hold → spend → refund with real money. Everything else is decoration until that works.
4. **No spend surface at all.** Money can go in and sit there. Closed-loop with no accepted merchant and no card means the balance has no exit — the value proposition is unfinished, not merely early.
5. **Surface area vastly exceeds depth.** 28 mini apps, ~17k lines of routes, one team. Most apps have one screen and no reason to return.
6. **Two competing onboarding checklists.** `/setup` (8 sections) and `/before-you-fly` (10 steps) overlap heavily. Users will complete one and still be told they are unprepared.
7. **Five hubs compete for the same content.** Today, Israel, Explore, Guides and Setup all route to overlapping tiles. There is no single obvious "where do I find things".
8. **No trust or compliance story on-screen.** A closed-loop stored-value product needs, visibly: who holds the money, what happens on programme exit, refund policy, complaints route. Terms exist; the money screens don't reference them.
9. **Programme value is asserted, not delivered.** Programme content is admin-entered only, so at beta every cohort starts empty — the exact screen a director judges.
10. **No support channel.** `/help` is static. No chat, no "something went wrong with my money" path. Unacceptable for money in beta.
11. **Empty-state economy.** Friends, activity, benefits, events all ship blank by design. First session reads as broken rather than new.
12. **Membership/Shekk+ before product-market fit.** Paywalling a prototype erodes the trust the money product needs.
13. **Auth/verify are the heaviest screens in the app** (591 + 744 lines). Fragility here kills every funnel behind it.
14. **KYC gate placement is unclear to the user.** Verification, top-up and spending gates are enforced in code but not explained as one journey.
15. **Local-only assistant state.** Ulpan streaks, budgets, setup ticks live in `localStorage`; a reinstall or second device wipes visible "progress".
16. **Mock module still imported by production screens** (`src/lib/mock.ts` powers food, transit, housing, shops, events copy). Static rates (`SHEKK_RATE`) are hardcoded.
17. **Admin console behind a shared PIN** (`0161`) with money views. That is a real risk once real balances exist.
18. **Notification strategy is missing.** Realtime chat notifications exist; nothing for money received, programme announcement, or arrival milestones — the actual retention drivers.
19. **News, Siddur, Been There, Fitness, IDF Explorer are wide but unrelated to the wedge.** They cost maintenance and dilute positioning.
20. **No analytics or funnel instrumentation** to learn anything from the beta.

## 2. UX issues

- Home stacks greeting, search, location, next-step, widgets, rails, recents — the "one clear next action" is buried under peers.
- "Preview" badges are the app's only honesty mechanism and are far too quiet next to a full card UI and working buttons.
- Simulated success screens ("On the way", named rider) are indistinguishable from real ones.
- Icon-grid density (4-col, 11px 2-line labels) pushes truncation and guesswork; folders add a second tap for little gain.
- Balance, available and reserved are three numbers with no explanation of holds.
- Money tab is titled "Money" but the route is `/wallet`; Explore is reachable but not in the tab bar — mental model drift.
- Assistants each invent their own progress vocabulary (streaks, ticks, percent, verdicts).
- No global error/empty/offline treatment tied to money operations.

## 3. Product strategy issues

- **Wedge is diluted.** The defensible product is "money for programme participants, distributed by programmes". Everything else is a feature a student already has an app for.
- **Revenue before rails.** FX margin needs volume; volume needs a spend surface. Shipping Shekk+ first inverts this.
- **B2B2C promise isn't instrumented.** No programme-side proof: no cohort dashboard, no participant readiness report, no distribution artefact a director can hand out.
- **Closed-loop, non-refundable credit is a hard sell to a duty-of-care buyer** unless refund and exit policy are explicit and generous-looking.
- **Breadth is being used as evidence of ambition**; for a beta it reads as unfinished.

## 4. Information architecture issues

- Two checklists, five hubs, one flat 28-app namespace with no ranking.
- `/explore/*` mixes real integrations, mock commerce, assistants and articles under one prefix.
- Programme content and Israel content are separate trees despite answering the same questions.
- Mini apps are registered by hand-ordered array — no notion of relevance to journey phase, despite `journey-phase.ts` existing.
- Search is present on multiple screens with different scopes.

## 5. Remove or merge before beta

- **Merge** `/setup` + `/before-you-fly` into one journey checklist (keep Setup's structure, BYF's copy).
- **Merge** Explore into Israel; one hub, phase-ranked.
- **Remove/park** Food, Rides, Transit, Reserve, Housing, Shops mock commerce — replace each with a single honest "opens the partner app" handoff or hide entirely.
- **Remove** the simulated card UI from the tab-level surface; keep a waitlist card.
- **Park** Shekk+ / membership, Been There, Fitness, News, IDF Explorer, Uni Finder, Siddur behind a "More" shelf; do not feature them.
- **Merge** Cost of Living + Budget into one money-planning tool.
- **Remove** `src/lib/mock.ts` from all production imports.

## 6. Still articles wearing tool clothes

- Visa, Army, Lone Soldier, Uni, Guides: long structured content with a tick box.
- IDF Explorer: a browsable encyclopaedia; it helps nobody decide anything.
- Health: a provider catalogue plus card storage — storage is the tool, the catalogue is the article.
- Community/Shuls, Documents guidance, Terms/Help.
- Cost of Living is a table with sliders; it produces a number but no decision or action.

## 7. World-class

- **Been There** map: genuinely delightful, differentiated craft.
- **Ulpan**: the one assistant with a real loop (daily word, flashcards, quiz, streak).
- **Siddur** with nusach handling: unusually respectful and well-built.
- **Design system**: `Kit.tsx` + tokens + mini-app icon family read as one premium product.
- **Ledger design**: integer agorot, service-role-only writes, holds and settlement — the right foundation.
- **Insurance card wallet**: private storage, big member number — solves a real moment.
- **Ticketing with atomic capacity locking**: better than most early-stage attempts.

## 8. What would stop a programme director recommending it

1. Simulated money and card flows that debit a real balance.
2. Non-refundable credit with no visible refund/exit/complaints policy.
3. No support channel when a participant's money goes wrong.
4. Empty programme surface on day one — they'd have to fill it themselves with no portal.
5. Nothing they can show parents: no safeguarding, no spend visibility, no incident path.
6. Breadth that raises "who maintains all this?" — perceived operational risk.
7. Nowhere for the participant to actually spend the balance.

## 9. If I had one sprint before launch

Ruthlessly narrow to a beta that can be judged. Theme: **one real money loop, one honest app.**

**A. Make the money loop real and truthful (highest priority)**
- Remove every balance-debiting mock flow; gate them behind a build flag or delete the routes and their `mock.ts` imports.
- One production-path top-up in a single currency, with a live/test banner that is impossible to miss.
- Ship one real spend surface. If card issuing can't land, ship programme/partner **pay-by-QR redemption** using the existing hold/settle ledger — a handful of real merchants beats a simulated Mastercard.
- Refund and exit policy screen linked from Money, top-up and terms; make "you can get your money back on programme exit" visible.

**B. Trust and support**
- In-app support thread routed to a real inbox, reachable from Money and every failure state.
- Money-event notifications: received, top-up settled, hold placed/released.
- Replace the shared admin PIN with role-based access on the money views.

**C. Collapse the IA**
- One journey checklist (merge Setup + BYF), one Israel hub (absorb Explore), phase-ranked tiles from `journey-phase.ts`.
- Four tabs: Today, Money, Israel, Programme. Friends moves into Today/Money as "Send & split"; a "More" shelf holds the parked apps.
- Home shows exactly one next action plus balance plus programme next item. Nothing else above the fold.

**D. Make the programme surface demo-able**
- A cohort readiness view for admins (who is verified, funded, checklist %, no PII beyond need).
- A one-page programme-facing summary a director can be shown in a call, generated from real cohort data.
- Seed nothing, but give every programme an authoring-complete first-run: announcement, schedule item, document — created in the admin console during onboarding.

**E. Instrument it**
- Funnel events: signup → setup complete → verified → funded → first spend. Without this the beta teaches nothing.

**Explicitly not this sprint:** Shekk+, new mini apps, Google Maps depth, affiliate marketplace, more content.
