## What Airwallex actually gives us

Airwallex is a licensed EMI (UK FCA, plus AU/SG/HK/EU/US licences). It covers four of the things Shekk needs:

| Shekk need | Airwallex product |
|---|---|
| Take GBP/USD/EUR/CAD/AUD/ZAR from students (Apple Pay, card) | Payments / Payment Intents |
| Hold that money in named currency accounts | Global Accounts |
| Convert to ILS at a real rate | FX & Conversions API |
| The Shekk card | Issuing (**Visa**, not Mastercard) |
| Paying Gett's monthly invoice | Payouts / Transfers |

Two things Airwallex does **not** do for us:
- It does not know that "Rivka has ₪240." Airwallex holds one pooled balance for Shekk. The per-student balance is **our** ledger, which we build. This is the standard closed-loop wallet architecture.
- Named per-user accounts and per-user cards require **Airwallex Scale (Connected Accounts)** — an approved-partner tier. Until that's approved, we run pooled: one Airwallex account, our ledger splits it.

## Architecture

```text
Student's Apple Pay
      |
      v
Airwallex Payment Intent (GBP)  --> Airwallex GBP Global Account
      |                                     |
      | webhook: payment succeeded          | FX conversion GBP->ILS
      v                                     v
Shekk ledger (our database)         Airwallex ILS balance (the float)
  credits student's balance          backs every shekel we owe
      |
      v
Spend (Gett ride, merchant) -> hold -> settle -> ledger entry
```

The invariant: **sum of all student ledger balances must always equal the ILS float held at Airwallex.** A daily reconciliation job asserts this and alarms in the admin console when it drifts.

## Build phases

### Phase 1 — Server-side ledger (build now, no Airwallex account needed)

Move money out of `localStorage` into the backend database.

- `accounts` — one row per user, ILS balance in **integer agorot** (never floats).
- `ledger_entries` — append-only, double-entry. Never updated, never deleted. Every row: account, direction, amount, currency, category, counterparty, external reference, timestamp.
- `holds` — pending authorisations (a Gett ride booked at estimate price). Holds reduce *available* balance but not *settled* balance, then settle to a final amount or release.
- `funding_events` — one row per Airwallex payment intent, with its FX quote captured at the moment of purchase.
- RLS so a user can only read their own rows, and **no client can ever write a balance** — all mutations go through server functions that recompute the balance from entries.
- Idempotency keys on every money-moving operation so a double-tap or webhook retry can't double-charge.

This makes the demo genuinely credible and is the foundation everything else bolts onto.

### Phase 2 — Airwallex adapter

Replace the simulators in `src/lib/banking.ts` with real calls, keeping the same function signatures so no UI changes.

- Server-only Airwallex client: `client_id` + `api_key` exchanged for a bearer token, cached and refreshed.
- `quoteFx` → real Airwallex FX quote, our margin applied on top and shown explicitly to the student.
- `requestFunding` → create a Payment Intent, confirm with Apple Pay, return the intent for client-side confirmation.
- Webhook at `/api/public/webhooks/airwallex` with signature verification — this is the **only** thing that credits a ledger balance. Never credit from the client saying "payment worked."
- Everything stays behind a feature flag: no keys → current simulator; keys present → live. Same pattern as the Gett fallback.

### Phase 3 — Card and per-user accounts

Needs Airwallex Scale approval. Card becomes a Shekk **Visa**; `ShekkCard.tsx` art and copy updated accordingly.

### Phase 4 — Gett reconciliation

Ride booking creates a hold at the estimate; Gett's final fare settles it. Monthly, match Gett's invoice line items to ledger entries by Gett ride ID and flag mismatches in the admin console.

## What you need to do commercially

1. Apply for an **Airwallex business account** (airwallex.com) — company registration, directors' IDs, business model description. Say clearly you're building a closed-loop wallet for students in Israel; this is a platform use case and they'll route it to the right team.
2. Ask specifically about **Scale / Connected Accounts** and **Issuing** eligibility for your entity and target market. Approval is manual and can take weeks.
3. Get **API credentials** — sandbox first (`api-demo.airwallex.com`), production later (`api.airwallex.com`). I'll open a secure form for `AIRWALLEX_CLIENT_ID`, `AIRWALLEX_API_KEY`, `AIRWALLEX_WEBHOOK_SECRET` and `AIRWALLEX_API_BASE` when you have them.
4. Get legal advice on your own regulatory position. Even riding on Airwallex's licence, running a student wallet in Israel with an agent/distributor arrangement has requirements — that's a lawyer question, not one I can answer.

## Technical notes

- All amounts stored as integers (agorot/cents). No floating-point money anywhere.
- The ledger is append-only; a correction is a new reversing entry, never an edit.
- Airwallex secrets are read inside server function handlers only, never at module scope, never client-side.
- Webhook signature verified with timing-safe HMAC comparison before any write.
- Existing `src/lib/banking.ts` signatures preserved so `wallet`, `card`, `exchange`, `topup` and the Gett flow keep working throughout.

## Recommendation

Start Phase 1 now. It's pure build work, needs no approvals, and it's the thing that turns Shekk from a prototype into something you can put in front of Airwallex and Gett. Phases 2–4 unlock as credentials land.
