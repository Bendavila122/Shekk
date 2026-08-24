# Shekk relaunch: "everything you need to get set up and live in Israel"

Banking is frozen, not deleted. Everything else gets simplified, connected and made actionable.

## Audit summary

**Today's shape:** 5 tabs (Today, Money, Explore, Programme, Friends), ~72 routes, 24 mini-apps in one grid on `/israel`, 12-step "Before you fly" checklist, a 7-stage onboarding, and a Money tab that fronts unfinished wallet/FX/card flows.

**Problems found**
- Money is a top-level tab and owns the Home hero (Add money / Exchange / Send / Card) — four dead-ends for a launch without banking.
- "Before you fly" mixes real steps (programme, documents, health) with frozen ones (money, card, KYC) and two "Preview" steps (eSIM, insurance) that only describe prices.
- 24 equal-weight mini-app tiles; several are "planned" placeholders (Food, Shops, Housing, Transit, Reserve, Rides) sitting beside finished tools.
- eSIM and insurance — the two things that can actually earn revenue — are buried as checklist sub-pages with static price tables and no CTA.
- No analytics layer at all, and no reusable offer/provider structure for affiliates.
- Design drift: three header patterns, ad-hoc empty/error/loading blocks in the older routes, mixed CTA styling.

**Categorisation**
- **Launch:** Home, Explore, Guides, Events/Tickets, Maps, Been There, Health, Documents, Visa, Army, Lone Soldier, Universities, Ulpan, Siddur, News, Programme, Friends, Money Planner (as a planning tool, no wallet).
- **Improve now:** eSIM, Insurance, Arrival/Setup checklist, Transport, Events, Offers/discounts, Onboarding, Home dashboard.
- **Hide from primary nav:** Food, Shops, Housing, Reserve, Rides, Fitness (kept as routes, reachable via category pages/search, no longer top-grid tiles).
- **Banking / future:** wallet, topup, exchange, card, KYC, transfers, split bills, Airwallex, ledger — code untouched, routes kept, pulled out of the launch journey behind one Shekk Money preview.

## Plan

### 1. Navigation (4 tabs + profile)
`Home · Explore · Services · Community · You`
- Money tab removed; `/wallet`, `/topup`, `/exchange`, `/card` remain routable and reachable from Shekk Money preview only.
- Programme + Friends merge into **Community**; Programme keeps its own route.
- `You` becomes the 5th tab (replaces the quick-menu balance block).

### 2. Home as an Israel dashboard
Rebuild `src/routes/index.tsx` around `getJourney()` phases already in `journey-phase.ts`:
- Pre-arrival: countdown, next 3 setup tasks, eSIM + insurance prompts, airport transport.
- First week: activate SIM, Rav-Kav, food nearby, first-week checklist, events.
- Settled: today's events, transport shortcuts, weather/Hebrew date/zmanim widgets, saved places, offers.
Balance hero and the four money actions are replaced by a single dismissible Shekk Money teaser card.

### 3. Services tab (new, monetisation-ready)
New `src/routes/services/` hub with recommendation flows:
- **eSIM**: 4-question wizard (length of stay, need an Israeli number, data need, arrival date) → ranked plans from a provider catalogue → CTA that reads an affiliate URL/tracking id from the catalogue entry.
- **Insurance**: same shape (age, length, activities, programme cover) → ranked plans → affiliate CTA.
- **Offers**: partner-offer grid built on the same provider/offer type.
Shared, provider-agnostic types in `src/lib/offers.ts` (`Provider`, `Offer`, `affiliateUrl(offer, ctx)`), no hard-coded partner.

### 4. Setup checklist becomes the arrival spine
Rework `before-you-fly` into `/setup` (interactive, tickable, stored per member): SIM, insurance, airport transport, Rav-Kav, programme registration, health cover, documents, local apps, money (marked "coming with Shekk Money"). Banking steps become optional/informational rather than blocking progress.

### 5. Explore: progressive disclosure
Four categories instead of 24 tiles — Getting set up · Everyday Israel · Living here · Discover — each opening a category page with its apps, guides and actions. Planned/placeholder apps live inside categories with "Soon", never on the top level.

### 6. Guides → actions
Every guide page gets an action rail (download app, get Rav-Kav, nearest station, how to pay, common mistakes) using the existing `ToolRow`/`Kit` primitives and the guide↔track mapping already in place.

### 7. Shekk Money preview
`/money` — a polished coming-soon page (spend in Israel, hold currencies, convert to ILS, Shekk card, transfers, split bills) with **Join early access**, stored in a new `money_waitlist` table (RLS: insert own, read own) so demand is measurable. Links to the preserved wallet screens are labelled as previews.

### 8. Onboarding
Trim to five quick stages: purpose · length of stay + arrival date · city · programme/student/Aliyah · interests. Currency and verification stages move out of first run. Answers drive Home and Services recommendations.

### 9. Design consistency pass
One header (`PageHeader`), one card, one CTA hierarchy, `Kit`'s `EmptyState`/`ErrorState`/`LoadingBlocks` everywhere, consistent spacing scale and tile sizes. No new visual language — the existing cream/cobalt system, applied evenly.

### 10. Analytics
Central `src/lib/analytics.ts` with a single `track(event, props)` writing to an `analytics_events` table (insert-only for authenticated + anon). Instrumented: onboarding completed, sim/insurance recommendation started, provider selected, affiliate CTA clicked, checklist task completed, checklist completed, feature opened, event viewed, offer clicked, money early access joined.

## Technical notes
- No deletions of banking code, server functions, migrations or Airwallex work; only navigation and Home surfaces change.
- New tables: `money_waitlist`, `analytics_events`, `setup_tasks` (per-member checklist state) — each with GRANTs + RLS.
- Reuses `journey-phase.ts`, `Kit.tsx`, `mini-apps.ts`, `useProgramme`, `useOfficial`, existing routes; `/wallet` etc. stay live so no links break.

## Suggested order
1. IA + navigation + Home rebuild + Shekk Money preview
2. Services tab (eSIM, insurance, offers) + offers/provider types + analytics
3. Setup checklist + Explore categories + guide action rails
4. Design consistency sweep and pass over every remaining route
