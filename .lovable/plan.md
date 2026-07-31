## Goal

Make walking into an Israeli clinic painless: one screen that holds the student's travel-health / insurance card — provider, policy number, emergency hotline — plus photos of the real card, ready to show at reception.

## What the member gets

**`/health` — Health & insurance**
- **Card wallet.** A premium wallet-style card in the Shekk visual language: provider mark, member name, policy/member number, group/plan, valid-through, and a "Show at clinic" full-screen mode (large text, max brightness feel, tap to dismiss). Long numbers are tap-to-copy.
- **Front/back photos.** Upload or take a photo of the physical card; stored privately, shown as tappable full-screen images (works offline-ish via cached signed URL for the session).
- **One-tap help row.** Call the insurer's 24/7 assistance line, call the local emergency numbers (101 MDA / 100 police), and copy the policy number — the three things reception and an ambulance actually ask for.
- **Multiple cards.** Students often carry travel insurance *and* a kupah/Maccabi-style card, so the screen holds a list: add, edit, set one as primary, delete.
- **Empty state** that explains in a sentence why it's worth 60 seconds to add.

**Providers offered in the picker** (with hotline prefilled where public):
PassportCard, Cigna Global, Allianz Care (Allianz Partners), Harel Yedidim, Bituach Le'umi-adjacent kupot for students — Maccabi, Clalit, Meuhedet, Leumit — plus Terem/urgent-care membership, GeoBlue, IMG, Aetna International, Bupa Global, AXA, WorldTrips, SafetyWing, and **Other** with a free-text provider name. Each entry carries an optional plan tier and "covers" note.

**Where it lives**
- Explore → Health & safety keeps its "Health" entry but now points at the real screen.
- A Home springboard tile ("Health card") so it's one tap from the springboard.
- Searchable via global search (insurance, maccabi, passportcard, doctor, clinic, policy).

## Technical notes

- New table `public.insurance_cards` (user_id, provider, provider_other, plan, member_number, group_number, valid_from/until, hotline, notes, is_primary, front_path, back_path, timestamps). RLS: owner-only SELECT/INSERT/UPDATE/DELETE on `auth.uid() = user_id`, with GRANTs to `authenticated` and `service_role` in the same migration. No anon grant.
- New **private** storage bucket `insurance-cards` with owner-scoped policies on `storage.objects` keyed on the `<user_id>/...` path prefix. Photos are read through short-lived signed URLs, never public.
- Reads/writes via `src/lib/health.functions.ts` server functions behind `requireSupabaseAuth`; client hook `src/lib/useHealth.ts` using TanStack Query. Card photos upload from the browser client directly to the private bucket under the user's own prefix.
- Provider catalogue and hotlines live in a static `src/lib/health.ts` (no backend seeding — the app stays a blank canvas, and it fits the existing no-demo-data rule).
- Screens: rewrite `src/routes/explore/health.tsx` (drop the current mock Harel policy + fake clinic booking) and add a small `src/components/health/InsuranceCard.tsx` for the card face reused in list, detail and full-screen modes. Route `head()` gets its own title/description.
- Register the entry in `src/lib/services.ts` (status `live`, `to: "/explore/health"`) and add health keywords to `src/lib/search.ts`.

## Out of scope for this pass

Clinic/pharmacy finder, appointment booking, visit helper and claims tracking — the current fake "Book 17:40" buttons are removed rather than left pretending to work. Easy to layer on later once the card wallet is in.
