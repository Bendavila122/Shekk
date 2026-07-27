import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card, ScreenHeader } from "@/components/AppShell";
import { HOUSING } from "@/lib/mock";

export const Route = createFileRoute("/explore/housing")({
  head: () => ({
    meta: [
      { title: "Housing · Shekk" },
      { name: "description", content: "Dorm swaps, apartment shares and roommate listings from other program students." },
      { property: "og:title", content: "Housing · Shekk" },
      { property: "og:description", content: "Find a room or a roommate for the rest of the year." },
    ],
  }),
  component: Housing,
});

function Housing() {
  return (
    <AppShell>
      <ScreenHeader title="Housing" subtitle="Verified students only" />
      <div className="space-y-3 px-4 py-4">
        {HOUSING.map((h) => (
          <Card key={h.id} className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-xl bg-muted text-2xl">{h.emoji}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{h.title}</p>
              <p className="truncate text-xs text-muted-foreground">{h.tag}</p>
            </div>
            <span className="text-xs font-semibold">{h.price}</span>
          </Card>
        ))}
        <Card className="text-xs text-muted-foreground">
          Rent isn't paid through credits — listings connect you with the student or landlord directly. Deposits and
          leases stay off-platform.
        </Card>
      </div>
    </AppShell>
  );
}
