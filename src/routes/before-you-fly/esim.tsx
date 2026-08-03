import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card, Notice, ScreenHeader } from "@/components/AppShell";
import { ESIM_PREVIEWS } from "@/lib/before-you-fly";

export const Route = createFileRoute("/before-you-fly/esim")({
  head: () => ({
    meta: [
      { title: "Israeli eSIM options · Shekk" },
      {
        name: "description",
        content:
          "Compare the kinds of Israeli eSIM plans participants usually buy — light, standard and heavy data — so you land with a working number.",
      },
      { property: "og:title", content: "Israeli eSIM options · Shekk" },
      { property: "og:description", content: "What an Israeli eSIM typically costs and includes." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EsimPage,
});

function EsimPage() {
  return (
    <AppShell>
      <ScreenHeader title="Israeli eSIM" subtitle="What to expect" back="/setup" />

      <header className="px-5 pt-5">
        <h1 className="font-display text-3xl font-bold leading-tight tracking-tight">Land with data</h1>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          An eSIM installs before you fly and switches on when you land, so you can order a taxi and message home
          from the terminal. Most participants want an Israeli number for deliveries, Rav-Kav and doctors.
        </p>
      </header>

      <div className="space-y-3 px-4 pb-10 pt-5">
        <Notice title="Not purchasable in Shekk yet">
          We're still choosing a partner, so these are indicative plan shapes and prices — not offers. Buy from any
          eSIM provider for now; when a partner is live you'll be able to do it here in a tap.
        </Notice>

        {ESIM_PREVIEWS.map((o) => (
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
          <p className="text-sm font-semibold">Before you buy anything</p>
          <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-muted-foreground">
            <li>Check your phone supports eSIM — most iPhones from XS and recent Android flagships do.</li>
            <li>Ask your programme first: some include a SIM or have a group deal.</li>
            <li>Keep your home number active on your physical SIM for bank codes.</li>
          </ul>
        </Card>
      </div>
    </AppShell>
  );
}
