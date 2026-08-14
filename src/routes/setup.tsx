import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Israel Setup is retired. It was a second copy of the pre-arrival checklist,
 * deriving the same four facts as "Before you fly" but with no entry point in
 * the app. Its one genuinely better idea — the adaptive "Do this next" card —
 * now lives on /before-you-fly, which is the single prep journey.
 */
export const Route = createFileRoute("/setup")({
  beforeLoad: () => {
    throw redirect({ to: "/before-you-fly", replace: true });
  },
});
