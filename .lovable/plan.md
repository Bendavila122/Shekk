# Affiliate marketplace: eSIM and insurance

Goal: turn the two "not purchasable yet" preview pages into a real revenue channel — an admin-managed offer catalogue, tracked outbound clicks, partner-confirmed conversions, and commission visible in the admin console. No partner is signed yet, so the machinery ships first and real offers are added the day a deal exists.

## What the member sees

**New mini-app: "Get set up"** (`/setup-shop`, launched like other mini-apps)
- Categories: eSIM, Travel insurance (structure allows more later — transit cards, banking, luggage).
- Each category lists live offers from the backend: partner name and logo, price, what's included, a short "why this one" line, and a clear "Best for short programmes / gap year / heavy data" tag.
- One primary action per offer: **Get this** → opens the partner in a new tab through a Shekk tracking link.
- Honest labelling: "Shekk earns a commission if you buy through this link. It doesn't change your price."
- Empty state while nothing is signed: keeps today's indicative "what to expect" guidance so the page is never dead.

**Before you fly** keeps its two steps, but they deep-link into the marketplace category instead of a static preview page. A step flips to done once the member has recorded a purchase (or manually marks "already sorted", which insurance especially needs).

**After purchase**: the insurance step nudges the member to save the policy in the Health card wallet they already have; the eSIM step links to the arrival guide.

## How money is tracked

1. **Click** — tapping an offer calls a server function that writes an `affiliate_clicks` row (offer, member, timestamp, a generated `click_ref`) and returns the partner URL with `click_ref` appended as the sub-id every affiliate network supports. The member is then redirected. Clicks are recorded server-side so no client can forge them.
2. **Conversion** — a public webhook (`/api/public/affiliate/$partner`) accepts partner postbacks, verifies a per-partner shared secret, matches on `click_ref`, and writes an `affiliate_conversions` row: gross sale amount, currency, commission amount, status (pending / confirmed / reversed).
3. **Reconciliation** — admin sees clicks, conversions, conversion rate and commission per partner and per offer, so a manual check against the partner dashboard takes seconds.

Affiliate commission is separate from the shekel ledger: it is Shekk's revenue, never a member balance movement. Nothing here touches `ledger_entries`.

## Admin console

New `/admin/partners` screen:
- Create and edit partners (name, category, logo, base URL, tracking parameter name, webhook secret, commission model, active toggle).
- Create and edit offers under a partner (title, price text, bullets, best-for tag, sort order, active toggle).
- Revenue panel: clicks, conversions, confirmed commission this month, top offers, and recent conversions.

This keeps the memory rule intact — programme and partner content is entered in the admin console only.

## Technical notes

- Migration adds `affiliate_partners`, `affiliate_offers`, `affiliate_clicks`, `affiliate_conversions` in `public`, each with GRANTs then RLS. Offers and partners: `SELECT` to `anon` + `authenticated` for active rows only. Clicks: insert/select restricted to the owning member via `auth.uid()`; conversions: `service_role` only (webhook writes, admin reads through a security-definer path). No seeded rows — the catalogue starts empty.
- `src/lib/affiliate.server.ts` (catalogue reads, click minting, conversion recording) + `src/lib/affiliate.functions.ts` thin wrappers; admin writes go through the existing admin server-fn/console-session pattern.
- Webhook lives under `src/routes/api/public/affiliate/$partner.ts`, verifies the signature before touching data, returns 401 otherwise, and never echoes member data.
- Offer content moves out of `src/lib/before-you-fly.ts` (the `ESIM_PREVIEWS` / `INSURANCE_PREVIEWS` constants become the fallback guidance copy only); `/before-you-fly/esim` and `/before-you-fly/insurance` redirect into the marketplace categories.
- Each new route gets its own `head()` metadata; the marketplace pages are indexable guides in their own right.

## Out of scope for this sprint

In-app checkout via partner APIs (policies or eSIM profiles issued inside Shekk), payout invoicing, and multi-currency commission normalisation. Those need signed contracts first.
