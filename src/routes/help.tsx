import { createFileRoute, Link } from "@tanstack/react-router";
import { FocusScreen, ScreenHeader, Card, Notice } from "@/components/AppShell";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Help & support · Shekk" },
      {
        name: "description",
        content:
          "Answers about Shekk credits, top ups, re-verification and paying friends during your gap year in Israel.",
      },
      { property: "og:title", content: "Help & support · Shekk" },
      { property: "og:description", content: "Common questions about credits, top ups and verification on Shekk." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HelpScreen,
});

const FAQ = [
  {
    q: "What exactly are Shekk credits?",
    a: "Your Shekk balance is held in shekels. You top up with Apple Pay and spend it inside Shekk partner apps or with other Shekk users. Full credit terms are in the Terms & Conditions.",
  },
  {
    q: "How is the rate calculated?",
    a: "Before you confirm a top up we show the amount paid, the mid-market reference rate, our spread, and the exact credits you receive.",
  },
  {
    q: "Why do I need to re-verify?",
    a: "Once every 12 months we ask for a fresh ID check. You get an email plus an in-app countdown, and 30 days to complete it.",
  },
  {
    q: "Can I pay a friend?",
    a: "Yes — open Social to send credits or split a bill with your cohort. Your friend code lives on the home screen.",
  },
];

function HelpScreen() {
  return (
    <FocusScreen>
      <ScreenHeader title="Help & support" subtitle="Quick answers, plain language" back="/me" />
      <div className="space-y-4 p-4">
        <Notice title="Prototype">
          This is a demo build — no real payments are processed and support replies are simulated.
        </Notice>

        {FAQ.map((item) => (
          <Card key={item.q}>
            <p className="text-sm font-semibold">{item.q}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.a}</p>
          </Card>
        ))}

        <Link
          to="/terms"
          className="tap flex items-center justify-between rounded-2xl bg-muted px-4 py-3 text-sm font-semibold"
        >
          Read the full Terms &amp; Conditions
        </Link>
      </div>
    </FocusScreen>
  );
}
