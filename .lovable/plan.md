# SIM / eSIM commerce architecture

Turn the current hard-coded SIM recommender into a real, provider-agnostic commerce product that ships this week on affiliate links and later switches to voucher or native API fulfilment without rebuilding the user-facing flow.

## What exists today (verified)

- `src/lib/offers.ts` — hard-coded `ESIM_OFFERS` with indicative prices, a `match` block and `rankSimOffers()`. Also holds insurance and partner offers. `offerUrl()` already falls back to the provider site when no affiliate link exists.
- `src/routes/services/esim.tsx` — three-question finder, ranked cards, "Best for you" badge, `sim_*` analytics. Good UX skeleton, no persistence, no provider config.
- `src/routes/before-you-fly/esim.tsx` — read-only "what to expect" page using `ESIM_PREVIEWS` from `src/lib/before-you-fly.ts`. Overlaps with `/services/esim`.
- `src/lib/analytics.ts` — `track()` into `analytics_events` with a typed event union, already includes `sim_*` events.
- Ticketing already established the pattern we should copy: `events.server.ts` (data), `events-provider.server.ts` (partner seam, returns empty until credentials exist), `events.functions.ts` (server fns incl. admin ones), `/admin/events` console page.
- Stripe already wired for memberships (`payments.functions.ts`, `stripe.server.ts`, webhook at `src/routes/api/public/payments/webhook.ts`) — reusable for native SIM purchase later, independent of the frozen wallet.
- Admin console at `/admin` behind code 0161, server side gated on the `admin` role (`admin.functions.ts` → `admin.server.ts` with service role). Panels come from `src/components/admin/AdminUI.tsx`.
- Design kit: `Kit.tsx` (`PageHeader`, `SectionHead`, `Chip`, `ToolRow`, `StatusPill`, `EmptyState`, `ErrorState`, `LoadingBlocks`, `MicroLabel`), `AppShell`.

### Conflicts to resolve, not duplicate

1. Two SIM surfaces. `/before-you-fly/esim` becomes a short explainer that links to `/services/esim`; the plan list lives in one place only.
2. `ESIM_OFFERS` in `offers.ts` becomes dead once plans come from the database. Keep `offers.ts` for insurance + partner offers; move all SIM types/logic to the new module. No parallel SIM catalogues.
3. Existing `sim_*` analytics events stay — we extend the union rather than inventing a second analytics table.
4. Admin config today is localStorage (`shekk.admin.v1`). Provider/affiliate config must NOT live there — it has to be server-side. New admin SIM pages read/write the database through server fns like the events console does.

## Data model (new tables, nothing touched in wallet/banking)

`sim_providers`
- `id` text PK (`airalo`, `saily`, `local_il`), `name`, `blurb`, `site_url`
- `mode` text: `disabled` | `affiliate` | `voucher` | `api` (default `disabled`)
- `affiliate_url_template` text null (`{sub}` placeholder), `affiliate_network` text null, `affiliate_tracking_id` text null
- `sort_order` int, `active` bool, `metadata` jsonb, timestamps
- No secrets. API keys stay in Lovable Cloud secrets (`AIRALO_CLIENT_ID/SECRET`, `SAILY_API_KEY`) read only inside handlers.

`sim_plans`
- `id` uuid PK, `provider_id` → `sim_providers`, `external_id` text null, unique `(provider_id, external_id)` for sync upsert
- `name`, `headline`, `country_code` (default `IL`), `plan_type` (`data_only` | `data_voice` | `local_number`)
- `data_mb` int null, `unlimited` bool, `fair_use_note` text null
- `validity_days` int null, `calls_included` bool, `texts_included` bool, `phone_number_included` bool default false (only true when provider metadata confirms it)
- `rechargeable` bool, `activation_policy` text null, `operator` text null, `networks` text[] null
- `net_cost_minor` int null, `display_price_minor` int, `currency` text, `source` (`manual` | `api`)
- `active` bool, `in_stock` bool, `featured` bool, `rank_boost` int default 0 (admin override for Best Match)
- `raw` jsonb (provider payload), `synced_at` timestamptz, timestamps

`sim_recommendations` — one row per completed wizard run: `user_id` null-able, `answers` jsonb (`days`, `usage`, `needs_calls`, `device_ok`), `ranked` jsonb (plan ids + scores), `top_plan_id`, `created_at`.

`sim_clicks` — affiliate outbound sessions: `id` uuid (used as the `{sub}` value), `user_id` null-able, `provider_id`, `plan_id`, `recommendation_id` null, `target_url`, `created_at`, plus `converted_at`/`reported_amount_minor` null for later reconciliation.

`sim_orders` — only for real Shekk-paid fulfilment (voucher/api): `user_id`, `provider_id`, `plan_id`, `mode`, `status` (`pending_payment` | `paid` | `fulfilling` | `fulfilled` | `failed` | `refunded`), `amount_minor`, `currency`, `stripe_session_id`, `stripe_payment_intent`, `provider_order_ref`, `idempotency_key` unique, `failure_reason`, timestamps. Affiliate clicks are never written here.

`sim_esims` — provisioned records: `order_id`, `user_id`, `provider_id`, `plan_id`, `iccid`, `activation_code`/`lpa_string`, `qr_url`, `smdp_address`, `matching_id`, `status` (`provisioning` | `ready` | `active` | `expired` | `failed`), `installed_at`, `expires_at`, `raw` jsonb.

Security: RLS + GRANTs in the same migration. `sim_providers`/`sim_plans` get `SELECT TO anon, authenticated` limited to active rows (writes service_role only). `sim_recommendations` and `sim_clicks` allow insert by `authenticated` scoped to `auth.uid()` plus anonymous rows written server-side. `sim_orders` and `sim_esims` are read-own only (`auth.uid() = user_id`), all writes service_role via server fns.

## Server modules

- `src/lib/sim.ts` — shared client-safe types, usage profiles, label helpers (`Data only` / `Calls & texts included` / `Phone number included` only when `phone_number_included`), price formatting.
- `src/lib/sim-ranking.ts` — pure scoring on normalized plan rows (stay length vs validity, usage profile vs data allowance, calls need, `rank_boost`/`featured`). Ported from `rankSimOffers`, no hard-coded catalogue.
- `src/lib/sim.server.ts` — reads/writes: `listPlans`, `getPlan`, `saveRecommendation`, `recordClick`, `buildAffiliateUrl` (returns null when unconfigured), order/eSIM readers.
- `src/lib/sim-providers/types.ts` — the adapter interface: `listPlans`, `getPlan`, `createFulfilment`, `getInstallation`, `getUsage`, `getTopups`, `topUp`, `checkCompatibility`. Every method optional; callers use a `supports()` helper so unsupported operations degrade to a clean "not available with this provider" state rather than throwing.
- `src/lib/sim-providers/airalo.server.ts` and `saily.server.ts` — stubs that report `configured: false` and return empty results while no credentials exist (exactly like `events-provider.server.ts`). No live calls in this sprint.
- `src/lib/sim.functions.ts` — `listSimPlans`, `getSimPlan`, `submitSimAnswers`, `startAffiliateHandoff` (writes a `sim_clicks` row, returns the resolved URL), `mySimOrders`, `mySimEsims`, plus admin fns (`adminListSimProviders`, `adminUpsertSimProvider`, `adminUpsertSimPlan`, `adminSetPlanActive`, `adminSimClicks`, `adminSyncProviderCatalogue`) all role-gated like `admin.functions.ts`.
- Scaffolded for later, not enabled: `src/lib/sim-checkout.functions.ts` (Stripe checkout creating a `pending_payment` order, price read server-side from `sim_plans`), fulfilment handled in the existing payments webhook — a verified `checkout.session.completed` moves the order to `paid` then `fulfilling`, calls the adapter under the order's idempotency key, and leaves `failed` + `failure_reason` on provider error so it can be retried without recharging.
- Catalogue sync: `POST src/routes/api/public/sim/sync.ts` guarded by a shared-secret header, upserting by `(provider_id, external_id)`; can be scheduled hourly once credentials exist. Never client-side.

## UI

- `/services/esim` — rebuilt on live data, same visual language. Steps: stay length → usage profile → calls/number → optional device check → Best Match + up to 3 alternatives. Empty/unconfigured state uses `EmptyState`/`Notice` rather than a fake CTA.
- `/services/esim/$planId` — plan detail/review: allowance, validity, fair use, activation, operator, honest capability labels, and a single CTA whose behaviour depends on provider mode:
  - `affiliate` → "Continue with {provider}" → server fn records the click and opens the configured URL.
  - `voucher`/`api` (later) → "Buy in Shekk" → Stripe checkout.
  - `disabled`/unconfigured → informational card with the provider site link and a clear "not purchasable in Shekk yet" line.
- `/services/esim/mine` — my eSIMs and orders; scaffolded now, shows an empty state until native/voucher goes live.
- Entry points: Services hub row (existing `ToolRow`) and the `esim` setup task keep pointing at `/services/esim`; `/before-you-fly/esim` reduced to a short explainer + link.
- Admin: one new page `/admin/sim` — providers list with mode selector and affiliate URL field, plan table (add/edit manual plans, toggle active/featured, rank boost), recent outbound clicks and orders, and a "Sync catalogue" button that reports "no credentials configured" until keys exist.

## Analytics (extend the existing union)

`sim_recommendation_started`, `sim_recommendation_completed`, `sim_plan_viewed`, `sim_provider_selected`, `sim_affiliate_clicked` (already present, gains `provider_mode`), plus `sim_device_check_used`, `sim_checkout_started`, `sim_order_paid`, `sim_fulfilment_failed`. No new analytics table.

## Rollout

1. **Now, functional**: migration, providers/plans seeded from today's plan shapes as `source = manual` with `mode = disabled` until real affiliate URLs are entered, wizard on live data, plan detail, click tracking, admin SIM page, honest unconfigured state.
2. **On signing an affiliate deal**: set the provider to `affiliate` and paste the URL template in admin. No code change.
3. **Native/voucher**: enable the scaffolded Stripe checkout + webhook fulfilment, implement one adapter, turn on hourly sync. UI already speaks "Buy in Shekk".

Wallet, Airwallex, ledger and card code are untouched; nothing here reads a Shekk balance.
