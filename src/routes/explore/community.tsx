import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Community is archived. Its only live content (Hebcal zmanim) now lives in the
 * Jewish Life home widget and the Siddur, so old links land on the Jewish life
 * category instead of a dead page.
 */
export const Route = createFileRoute("/explore/community")({
  beforeLoad: () => {
    throw redirect({ to: "/israel", replace: true });
  },
});
