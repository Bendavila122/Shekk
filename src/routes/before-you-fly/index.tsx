import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * "Before you fly" was a second, competing preparation checklist. It is now
 * the first section of the single Israel Setup journey, so this entry point
 * redirects instead of showing a rival progress bar.
 */
export const Route = createFileRoute("/before-you-fly/")({
  beforeLoad: () => {
    throw redirect({ to: "/setup", replace: true });
  },
});
