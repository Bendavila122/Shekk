## Goal

Today the whole Social tab is fake: friends, split requests and cohort messages live in `localStorage` (`src/lib/store.tsx`) and disappear per device. This replaces it with a real, multi-user social layer on the backend — handles, friends, money between members, chat, and programs/cohorts.

## 1. Identity: Shekk handles

- Add a public-safe `member_handles` view/columns: `handle` (unique, lowercase, 3–20 chars), `display_name`, `avatar`, `discoverable` flag, `program_id`, `cohort`.
- Handle is claimed at onboarding (suggested from first name) and editable once in Settings.
- Search server function that matches on handle, and on phone/email only when the other person's `discoverable` setting is on — never exposes contact details back, only handle + name + program.
- The pay QR (`src/components/QRCode.tsx`) starts encoding `shekk:u/<handle>`, so scanning a friend's code offers "Add friend" or "Send money".

## 2. Friends

- `friendships` table with pending / accepted / blocked, plus request direction.
- Flows: send request (by handle, contact lookup, or QR scan), accept/decline, remove, block.
- Same-cohort suggestions: members on the same `program_id` + cohort who are discoverable, excluding existing friends.
- New Friends surface inside Social: requests inbox, friend list, search bar, suggestions row.

## 3. Send & receive real money

- New database routine `transfer_post` (security definer) that debits the sender and credits the receiver in **one transaction**, reusing the existing `ledger_post` rules (idempotency key, balance/hold checks, account status), and links the two entries so both statements read "Sent to @dani" / "Received from @sam".
- Guards: both parties must be verified with an approved shekel account, sender must have available balance, per-transfer and daily caps, must be friends (or have scanned each other) to send.
- Server functions `sendToMember` and `requestFromMember` in a new `src/lib/social.functions.ts`; the client never states an amount that isn't re-validated server-side.
- UI: Send / Request sheet with amount pad, note, friend picker, confirmation, and a success receipt that appears immediately in Activity.

## 4. Splitting a bill

- `split_bills` + `split_shares` tables: creator, total, note, even/custom shares, per-share status.
- Creating a split sends each friend a real request they see on their own device.
- Paying a share runs the same atomic transfer and marks the share settled; the creator watches shares fill in live.
- Chase/remind action, and a "settled" state when every share is paid.
- Replaces the current `SplitFlow` mock in `src/routes/social.tsx` while keeping the same three-step feel.

## 5. Chat

- `conversations` (dm | cohort | group), `conversation_members`, `messages`.
- DMs auto-created between friends; one cohort conversation per program cohort, auto-joined on linking; custom groups any member can create and invite friends to.
- Realtime via Cloud subscriptions, ordered history, unread counts, and read receipts kept simple (last-read timestamp per member).
- Inline money in chat: send/request from a thread renders as a payment bubble with a one-tap Pay button.
- Chat lives as a full-height thread view plus a conversation list inside the Social tab.

## 6. Programs & cohorts

- `programs` and `cohorts` tables, managed in the admin console (`/admin`), each cohort with a short join code.
- Public programs appear in a searchable directory during onboarding and in Me; private cohorts require the madrich's code.
- Joining links the member's profile, auto-joins the cohort chat, and enables cohort suggestions.
- Admin console gains a Programs page: create programs/cohorts, rotate join codes, see members, post an announcement to the cohort thread.

## 7. Privacy and safety

- Everything scoped by RLS to the signed-in member; friends see only handle, name, avatar, program — never balances.
- Amounts are never shown in the opt-in activity feed (keeps the current promise).
- Block hides you from search, stops DMs and blocks transfers both ways.
- Report action on messages and members, surfaced in the admin console.
- Rate limits on friend requests, messages, and transfers.

## Technical notes

- New tables: `member_handles` (or handle columns on `member_profiles`), `friendships`, `conversations`, `conversation_members`, `messages`, `split_bills`, `split_shares`, `programs`, `cohorts`, `member_reports` — each with GRANTs, RLS and owner-scoped policies; money tables stay write-locked with a `security definer` `transfer_post` as the only path.
- New `src/lib/social.functions.ts` (thin wrappers) + `src/lib/social.server.ts` (logic), following the existing ledger pattern; all authenticated via `requireSupabaseAuth`.
- `src/lib/store.tsx` drops `friends`, `splits`, `cohortMessages` from localStorage; those become React Query hooks in a new `src/lib/useSocial.ts`.
- `src/routes/social.tsx` is rebuilt as Chats / Friends / Split / Feed, with a new thread route `src/routes/social/$conversationId.tsx`.
- Realtime subscriptions set up in `useEffect` with teardown, per the Cloud realtime pattern.

## Suggested build order

1. Handles + friends + search/QR add.
2. Real send/receive transfers.
3. Splits on top of transfers.
4. Chat (DMs → cohort → groups) with inline money.
5. Programs/cohorts + admin management.

Large surface — happy to ship it in these five passes so you can test each one as it lands.
