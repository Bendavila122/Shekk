import { createFileRoute, redirect } from "@tanstack/react-router";

/** Merged into the Money Planner — kept so existing links still work. */
export const Route = createFileRoute("/explore/cost-of-living")({
  beforeLoad: () => {
    throw redirect({ to: "/explore/money-planner", replace: true });
  },
});
