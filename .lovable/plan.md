## Events & tickets in Shekk

Students browse events and club nights, buy a ticket with their Shekk balance, and get a scannable QR ticket in a "My tickets" wallet. Tickets are non-refundable and non-transferable, matching the closed-loop terms.

Events come from a provider-agnostic events layer with one adapter slot. Until a ticketing partner (Eventer, Tickchak, etc.) grants API credentials, the working source is the events catalogue managed in the Shekk Console — no seeded or fake listings; the screens are empty until real events are added.

### What the student sees

- **Events list** (replaces the current mock-data `/explore/events` screen): real listings from the backend, grouped by upcoming date, with host, venue, city, time, price in shekels and remaining spots. Filters for type (Shabbaton, tiyul, club night, shiur, chesed) and city. Empty state explains that events land here as programs and venues come online.
- **Event detail**: full description, host, when/where, what's included, price, ticket limit per person, and the plain-language line that tickets are non-refundable and non-transferable.
- **Checkout**: confirm sheet showing ticket price, quantity and the balance after purchase. Paid from the Shekk balance only. If the balance is short, the sheet says how much is missing and offers "Top up" straight into the existing top-up flow, returning to checkout after.
- **My tickets**: a wallet list of purchased tickets — upcoming first, then past. Each ticket opens a big QR code with the event, holder name, quantity and a one-line "show this at the bus/door".
- **Activity**: each purchase appears as a normal statement line (event name, "Events" category, amount, date), because it goes through the existing ledger.

### Backend

New tables, all with RLS and grants:

- `events` — title, kind, description, host, venue, city, starts_at, price_agorot, capacity, per-person limit, status (draft/published/cancelled), plus `provider` and `provider_ref` so partner-sourced events can coexist with console-created ones.
- `event_tickets` — one row per purchased ticket: event, buyer, quantity, amount paid, QR token, status (valid/used/cancelled), ledger entry reference.

Purchase runs as a single `security definer` database routine so capacity, per-person limits and the ledger debit happen atomically: it re-reads the price server-side, checks remaining capacity, debits via the existing `ledger_post` path, and writes the ticket. An idempotency key prevents double-charging on a retried tap. Insufficient balance and sold-out come back as clean, plain-language errors. The client can never state a price or a balance.

Reads: published events are readable by signed-in members; tickets are readable only by their buyer.

### Admin console

A new **Events** section in `/admin`:
- Create/edit/publish/cancel an event (all fields above).
- Live sold/remaining counts per event and a ticket list per event.
- Cancelling an event marks its tickets cancelled (no automatic refund, per the non-refundable rule — the console shows the affected buyers so staff can handle it out of band).

This is what makes the feature functional on day one: publish an event in the console and the student flow works end to end with real money.

### Partner adapter (later, once you have credentials)

A server-only provider module with a single `listPartnerEvents()` seam and a normaliser into the `events` shape. Nothing is wired to a live partner in this pass. When you obtain partner access from Eventer or Tickchak, the remaining work is: store their key as a secret, write the adapter against their real response shape, and add a sync routine that upserts by `provider_ref`. Partner-sourced rows become read-only in the console.

### Technical notes

- New `src/lib/events.server.ts` (queries + purchase call), `src/lib/events.functions.ts` (authenticated server functions), `src/lib/useEvents.ts` (query hooks).
- Routes: rebuilt `/explore/events`, new `/explore/events/$id`, new `/tickets`, new `/admin/events`.
- Existing `EVENTS` mock data and the mock `spend()` path in the events screen are removed.
- QR rendering reuses the existing `QRCode` component; tokens are random and unguessable.
- A door-scanner screen is out of scope for this pass (you chose QR + wallet); the ticket `status` column leaves room to add check-in later.
