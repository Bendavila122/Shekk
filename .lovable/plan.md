# Passport: stop the page scrolling, calm the page turn

Two fixes only, both inside Passport. No other app area changes, nothing published.

## 1. The screen should not scroll at all

The Passport screen is one fixed object, but the page can currently be dragged up and down. Cause found in the code: the shared phone frame that wraps every screen is sized `min-h-screen` (full viewport tall) and Passport then adds its own full-viewport-height block inside it, so the document ends up taller than the window. Nothing pins the document either, so mobile rubber-band scrolling is also possible.

Fix:
- Passport fills the space it is given instead of asking for another full viewport height.
- While Passport is open, lock document scrolling and disable overscroll/rubber-band, and release the lock on leaving the route.
- Keep the inner city-page text scrollable where a spread genuinely overflows, with scroll chaining disabled so it never moves the screen.

Result: cover screen and book screen both sit still; only the page content and the page-turn gesture move.

## 2. Make the turn read like a real book, not a curl effect

The current turn adds a 3D wobble axis, a bright sheen sweep and a strong shadow on top of the rotation, which is what makes it look wrong. Simplify to how a book actually behaves:

- The leaf rotates on a fixed vertical hinge at the spine (no tilt axis, no finger-height pivot). One clean axis.
- The turn still follows your finger one-to-one, and a release past roughly a third of the width completes it; otherwise it falls back.
- Shading reduced to what real paper shows: a soft gradient darkening toward the hinge on the turning leaf, and a matching soft shadow on the page beneath. No white sheen sweep, much softer drop shadow.
- Slightly shorter, flatter easing on the release so it settles instead of springing.
- Idle hint reduced to a very subtle corner shadow (or removed if it still reads as a graphic rather than paper).
- Reduced-motion behaviour unchanged: instant page change, no animation.
- Sound unchanged (quiet, on commit only).

## Verification

- Mobile check at 393x706 and 390x844: confirm the document cannot scroll, the booklet is fully visible, and a drag turn plus a button turn both look correct.
- Typecheck, full test suite, production build.

## Technical notes

- `src/components/passport/PassportBook.tsx`: drop `pivot` state and `rotate3d` tilt for a plain `rotateY` on `transformOrigin: left center`; simplify the two overlay gradients; soften `boxShadow`; keep pointer capture, `COMMIT`, and the fit `ResizeObserver`.
- `src/routes/passport.tsx`: replace `h-[100svh] max-h-[100svh]` and the cover's `min-h-[100svh]` with flex-fill sizing inside the frame, and add a small scroll-lock effect (`document.documentElement`/`body` overflow + `overscroll-behavior: none`) scoped to this route.
- `src/styles.css`: only if a Passport-scoped scroll-lock or shading class is cleaner than inline styles.
- No schema, auth, navigation, My Israel, or gamification changes.
