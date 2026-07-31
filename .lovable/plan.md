## Goal

Staying signed in across a page refresh, instead of being bounced back to the sign-in screen.

## What I checked

- The session store (`src/lib/store.tsx`) calls `supabase.auth.getSession()` once on mount and then only reacts to `SIGNED_IN`, `SIGNED_OUT`, `USER_UPDATED` events.
- The front door (`src/components/RequireAccount.tsx`) redirects to `/auth` as soon as `authChecked && !signedIn`.
- Nothing in the app calls `signOut()`, and the auth client is configured with `persistSession: true` + `localStorage`.
- The sign-in screen (`src/routes/auth.tsx`) has **no** "already signed in" redirect, so once anything bounces you to `/auth`, the only way out is signing in again — which matches the symptom you're seeing (you're on `/auth?next=/` right now).

I could not read the live preview's stored session (the preview was reloading), so the exact trigger is **not yet confirmed**. Two candidates: the stored session is being dropped/invalidated on reload (e.g. a token refresh failing or two auth clients racing the same refresh token), or the gate flips to "signed out" during the brief window before the session resolves.

## Step 1 — Confirm the cause (first thing I do)

- Run a headless browser session against the app: sign in, hard-refresh, and log every `onAuthStateChange` event, the result of `getSession()` on reload, the `sb-*` localStorage entry before/after refresh, and any `/auth/v1/token` network response (looking for `invalid_grant` / "Refresh Token Already Used").
- That distinguishes "session is gone from storage" from "session exists but the gate redirected too early". I'll only apply the matching fix.

## Step 2 — Fixes

Applied based on what Step 1 shows:

- **If the gate is too eager:** treat auth as unresolved until the Supabase client reports a definitive result — handle `INITIAL_SESSION` and `TOKEN_REFRESHED` in the store's listener, and only mark `authChecked` once a session-or-no-session verdict is in. Keep showing the splash rather than redirecting during that window.
- **If the stored session is being invalidated:** eliminate the duplicate/competing auth client or refresh race so a single client owns token refresh, and stop the hard `window.location.href` navigations right after sign-in (use router navigation) so the freshly written session isn't disturbed by an immediate full page load.
- **Regardless:** make `/auth` redirect an already-signed-in visitor straight to their `next` destination. This is the safety net — even if a transient blip sends someone to the sign-in screen, they bounce right back into the app instead of having to re-enter credentials.

## Step 3 — Verify

Re-run the browser script: sign in, refresh three times, and confirm the wallet renders each time with no visit to `/auth`.

## Technical notes

Files touched: `src/lib/store.tsx` (auth state resolution), `src/routes/auth.tsx` (signed-in redirect, navigation after sign-in), possibly `src/components/RequireAccount.tsx`. No database, schema, or auth-provider configuration changes.
