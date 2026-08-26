import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Legacy URL. What's On is now a top-level destination, so old links and
 * bookmarks land on the canonical route instead of breaking.
 */
export const Route = createFileRoute("/explore/events")({
  beforeLoad: () => {
    throw redirect({ to: "/whats-on", replace: true });
  },
});
