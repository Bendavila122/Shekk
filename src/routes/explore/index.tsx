import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/explore/")({
  // Explore now lives on /israel, which is the tab labelled "Explore".
  beforeLoad: () => {
    throw redirect({ to: "/israel", replace: true });
  },
});
