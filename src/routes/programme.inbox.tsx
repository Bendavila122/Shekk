import { createFileRoute } from "@tanstack/react-router";
import { Megaphone } from "lucide-react";
import { EmptyState, SectionHead } from "@/components/Kit";
import { useProgrammeHub } from "@/lib/useProgrammeHub";
import { AnnouncementCard, NotificationList, VoteCard } from "@/components/programme/Participant";

export const Route = createFileRoute("/programme/inbox")({
  head: () => ({
    meta: [
      { title: "Inbox · Your programme · Shekk" },
      {
        name: "description",
        content: "Every programme announcement, alert and vote in one place, with what still needs your OK.",
      },
      { property: "og:title", content: "Inbox · Your programme · Shekk" },
      { property: "og:description", content: "Announcements, alerts and votes from your programme." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: InboxScreen,
});

function InboxScreen() {
  const { hub, votes } = useProgrammeHub();
  const closed = hub.votes.filter((v) => v.status === "closed");

  return (
    <div className="space-y-8 px-4 pb-10 pt-4">
      {hub.notifications.length > 0 ? (
        <section>
          <SectionHead title="Alerts" hint="Changes and urgent notices your programme pushed." />
          <NotificationList hub={hub} />
        </section>
      ) : null}

      <section>
        <SectionHead title="Announcements" />
        {hub.announcements.length === 0 ? (
          <EmptyState
            icon={Megaphone}
            title="No announcements yet"
            body="Anything your programme posts arrives here — the urgent ones also alert you."
          />
        ) : (
          <div className="space-y-2">
            {hub.announcements.map((a) => (
              <AnnouncementCard key={a.id} announcement={a} />
            ))}
          </div>
        )}
      </section>

      {votes.length > 0 ? (
        <section>
          <SectionHead title="Open votes" />
          <div className="space-y-2">
            {votes.map((v) => (
              <VoteCard key={v.id} vote={v} />
            ))}
          </div>
        </section>
      ) : null}

      {closed.length > 0 ? (
        <section>
          <SectionHead title="Decided" />
          <div className="space-y-2">
            {closed.map((v) => (
              <VoteCard key={v.id} vote={v} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
