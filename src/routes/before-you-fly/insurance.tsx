import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card, Notice, ScreenHeader } from "@/components/AppShell";
import { INSURANCE_PREVIEWS } from "@/lib/before-you-fly";

export const Route = createFileRoute("/before-you-fly/insurance")({
  head: () => ({
    meta: [
      { title: "Travel insurance for Israel · Shekk" },
      {
        name: "description",
        content:
          "What travel and medical insurance for a stay in Israel usually covers and costs, and what programmes typically require before you fly.",
      },
      { property: "og:title", content: "Travel insurance for Israel · Shekk" },
      { property: "og:description", content: "Typical cover levels, costs and what programmes require." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: InsurancePage,
});

function InsurancePage() {
  return (
    <AppShell>
      <ScreenHeader title="Travel insurance" subtitle="What to expect" back="/before-you-fly" />

      <header className="px-5 pt-5">
        <h1 className="font-display text-3xl font-bold leading-tight tracking-tight">Cover for your stay</h1>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          Israeli healthcare is excellent but not free for visitors. Almost every programme asks for proof of
          medical cover before arrival, and a walk-in clinic visit without insurance can run into hundreds of
          shekels.
        </p>
      </header>

      <div className="space-y-3 px-4 pb-10 pt-5">
        <Notice title="Not purchasable in Shekk yet">
          These are indicative cover levels, not quotes or offers. Buy through your programme or your own insurer
          for now. Once you have a policy, save it in Shekk so it's with you at the clinic.
        </Notice>

        {INSURANCE_PREVIEWS.map((o) => (
          <Card key={o.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold">{o.name}</p>
                <p className="text-xs text-muted-foreground">{o.headline}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-display text-lg font-bold leading-none">{o.price}</p>
                <p className="text-[11px] text-muted-foreground">{o.period}</p>
              </div>
            </div>
            <ul className="mt-3 space-y-1.5">
              {o.points.map((p) => (
                <li key={p} className="flex gap-2 text-xs text-muted-foreground">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                  {p}
                </li>
              ))}
            </ul>
          </Card>
        ))}

        <Card>
          <p className="text-sm font-semibold">Questions worth asking</p>
          <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-muted-foreground">
            <li>Does it cover the whole length of your programme, including any travel after?</li>
            <li>Are tiyulim, hiking and water sports included?</li>
            <li>Does it pay the clinic directly or do you claim it back?</li>
            <li>Is there cover if you volunteer or work during your stay?</li>
          </ul>
        </Card>

        <Card>
          <p className="text-sm font-semibold">Once you're covered</p>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            Save your policy and member number in the Health app so the details are on your phone when you need a
            doctor.
          </p>
        </Card>
      </div>
    </AppShell>
  );
}
