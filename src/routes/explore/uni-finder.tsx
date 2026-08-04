import { createFileRoute, redirect } from "@tanstack/react-router";

/** Folded into the Universities hub, where the finder is now the hero. */
export const Route = createFileRoute("/explore/uni-finder")({
  beforeLoad: () => {
    throw redirect({ to: "/explore/uni", replace: true });
  },
});
