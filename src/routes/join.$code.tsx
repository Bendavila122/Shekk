import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card } from "@/components/AppShell";
import { PageHeader } from "@/components/Kit";
import { Link } from "@tanstack/react-router";
import { useApp } from "@/lib/store";
import { JoinPanel } from "@/components/programme/Join";

export const Route = createFileRoute("/join/$code")({
  head: () => ({
    meta: [
      { title: "Join your programme · Shekk" },
      {
        name: "description",
        content: "Open your programme in Shekk: live timetable, announcements, staff contacts and your checklist.",
      },
      { property: "og:title", content: "Join your programme · Shekk" },
      { property: "og:description", content: "One tap to connect your programme to Shekk." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: JoinScreen,
});

function JoinScreen() {
  const { code } = Route.useParams();
  const { signedIn, authChecked } = useApp();

  return (
    <AppShell>
      <PageHeader title="Join your programme" subtitle="We've filled in your code — just confirm it's the right one." />
      <div className="pt-4">
        {!authChecked ? null : signedIn ? (
          <JoinPanel initialCode={code} />
        ) : (
          <div className="px-4">
            <Card className="space-y-3">
              <p className="text-sm font-semibold">Sign in first</p>
              <p className="text-xs text-muted-foreground">
                Your programme membership lives on your Shekk account. Sign in and we'll bring you straight back.
              </p>
              <Link
                to="/auth"
                search={{ next: `/join/${code}` }}
                className="tap block w-full rounded-2xl bg-primary px-5 py-3.5 text-center text-sm font-semibold text-primary-foreground"
              >
                Sign in
              </Link>
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  );
}
