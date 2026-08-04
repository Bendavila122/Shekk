import { createFileRoute, redirect } from "@tanstack/react-router";

/** Folded into the Army hub, where Explore the IDF is now the hero. */
export const Route = createFileRoute("/explore/idf/")({
  beforeLoad: () => {
    throw redirect({ to: "/explore/army", replace: true });
  },
});
