## Problem

In the chat thread screen, the composer is pinned at a fixed offset (`bottom-[86px]`) that assumes a flat tab bar. The mobile nav's Home button is raised ~28px above the bar (`-mt-7` on a 56px circle), so the top of the circle pokes into the composer strip and gets partially covered.

## Fix

In `src/routes/social/$conversationId.tsx`:
- Raise the mobile composer so it clears the raised Home bubble: change the fixed offset to roughly `bottom-[112px]` plus `env(safe-area-inset-bottom)` so it also respects home-indicator devices.
- Keep the desktop behaviour unchanged (`lg:sticky lg:bottom-0`).
- Bump the message list's bottom padding by the same amount so the last bubble isn't hidden behind the moved composer.

No changes to navigation, business logic, or the nav component itself.

## Verification

Load a conversation at mobile width in the preview and confirm the raised Home button is fully visible above the composer and the newest message is not clipped.
