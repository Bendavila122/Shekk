import { createFileRoute, redirect } from "@tanstack/react-router";

/** Legacy activity URL — redirects to the canonical What's On detail page. */
export const Route = createFileRoute("/explore/event/$id")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/whats-on/event/$id", params: { id: params.id }, replace: true });
  },
});
