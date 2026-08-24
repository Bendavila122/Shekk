import { createFileRoute } from "@tanstack/react-router";
import { Smartphone } from "lucide-react";
import { AppShell, Card, ScreenHeader } from "@/components/AppShell";
import { ToolRow } from "@/components/Kit";

export const Route = createFileRoute("/before-you-fly/esim")({
  head: () => ({
    meta: [
      { title: "Israeli eSIM options · Shekk" },
      {
        name: "description",
        content:
          "Why you want an Israeli eSIM before you fly, what to check on your phone first, and where to find the plan that fits your stay.",
      },
      { property: "og:title", content: "Israeli eSIM options · Shekk" },
      { property: "og:description", content: "Land with working data, and know what to sort before you fly." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EsimPage,
});

function EsimPage() {
  return (
    <AppShell>
      <ScreenHeader title="Israeli eSIM" subtitle="Before you fly" back="/before-you-fly" />

      <header className="px-5 pt-5">
        <h1 className="font-display text-3xl font-bold leading-tight tracking-tight">Land with data</h1>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          An eSIM installs before you fly and switches on when you land, so you can order a taxi and message home from
          the terminal. Some people also want an Israeli number for deliveries, Rav-Kav and clinics — that's a different
          kind of plan, and usually bought once you're here.
        </p>
      </header>

      <div className="space-y-3 px-4 pb-10 pt-5">
        <ToolRow
          to="/services/esim"
          icon={Smartphone}
          title="Find my SIM"
          body="Three questions, then the plan that fits your stay and your data use"
        />

        <Card>
          <p className="text-sm font-semibold">Before you buy anything</p>
          <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-muted-foreground">
            <li>Check your phone supports eSIM — most iPhones from XS and recent Android flagships do.</li>
            <li>Ask your programme first: some include a SIM or have a group deal.</li>
            <li>Keep your home number active on your physical SIM for bank codes.</li>
            <li>Don't buy an Israeli number before you land — most need your passport in person.</li>
          </ul>
        </Card>

        <Card>
          <p className="text-sm font-semibold">Landing day</p>
          <ol className="mt-2 space-y-1.5 text-xs leading-relaxed text-muted-foreground">
            <li>1. Install the eSIM at home on Wi-Fi, before you fly.</li>
            <li>2. Turn your home SIM's data off, but leave the SIM in for bank codes.</li>
            <li>3. On landing, set the Israeli eSIM as your data line.</li>
            <li>4. Check data works before you leave arrivals.</li>
          </ol>
        </Card>
      </div>
    </AppShell>
  );
}
