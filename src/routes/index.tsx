import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowUpRight, IdCard, Users, QrCode, Receipt } from "lucide-react";
import { GlobalSearch } from "@/components/GlobalSearch";
import { AppShell, Card, ReverifyBanner } from "@/components/AppShell";
import { QRCode } from "@/components/QRCode";
import { Avatar } from "@/components/Avatar";
import { useApp } from "@/lib/store";
import { useOnboardedGate } from "@/lib/useOnboardedGate";

import { STATUS_LABEL, serviceLinkProps, type Service } from "@/lib/services";
import { recordServiceUse, useRecentServices } from "@/lib/recents";
import { ServiceLogo } from "@/components/ServiceLogo";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Home · Shekk" },
      {
        name: "description",
        content:
          "Your Israeli phone, inside your phone: Wolt, Gett, Rav-Kav, Israel Railways, Go-To and more — all paid with shekel tokens.",
      },
      { property: "og:title", content: "Home · Shekk" },
      { property: "og:description", content: "One home screen for every Israeli app a gap-year student needs." },
    ],
  }),
  component: HomeScreen,
});

function AppIcon({ service }: { service: Service }) {
  return (
    <Link
      {...serviceLinkProps(service)}
      onClick={() => recordServiceUse(service.id)}
      className="tap group flex flex-col items-center gap-1.5"
    >

      <span className="relative">
        <ServiceLogo service={service} size={58} className="rounded-[1.15rem] shadow-card" />
        {service.status !== "live" ? (
          <span className="absolute -right-1 -top-1 rounded-full bg-ink px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-ink-foreground">
            {service.status === "integrating" ? "soon" : "info"}
          </span>
        ) : null}
      </span>
      <span className="line-clamp-2 text-center text-[11px] font-medium leading-tight text-foreground">
        {service.name}
      </span>
    </Link>
  );
}

function HomeScreen() {
  const ready = useOnboardedGate();
  const { state } = useApp();
  const recents = useRecentServices();
  const [showCode, setShowCode] = useState(false);


  if (!ready) {
    return (
      <AppShell>
        <div className="flex h-[70vh] items-center justify-center text-sm text-muted-foreground">Loading…</div>
      </AppShell>
    );
  }

  const firstName = (state.name || "there").split(" ")[0];

  return (
    <AppShell>
      <div className="px-5 pb-2 pt-7">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Shalom, {firstName}</p>
      </div>


      {/* Search into the full catalogue */}
      <div className="px-4 pt-3">
        <GlobalSearch />
      </div>



      {/* Recents */}
      <div className="space-y-6 px-4 pt-6">
        <section>
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold">Recently used</h2>
              <p className="text-[11px] text-muted-foreground">The last five apps you opened.</p>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-x-2 gap-y-5">
            {recents.map((s) => (
              <AppIcon key={s.id} service={s} />
            ))}
          </div>
        </section>


        <p className="text-center text-[11px] text-muted-foreground">
          Tap a logo and it opens inside Shekk. You never pay the partner directly — we do, and the shekel-token
          equivalent comes off your balance. {STATUS_LABEL.integrating} apps open their guide for now.
        </p>
      </div>

      {/* Paying people */}
      <section className="px-4 pt-6">
        <Card className="p-0">
          <div className="flex items-center gap-3 p-4">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <Users className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">Paying people</p>
              <p className="text-xs text-muted-foreground">
                Send tokens to friends on Shekk or split a bill with your cohort.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 border-t border-border p-3">
            <Link
              to="/social"
              className="tap rounded-xl bg-primary px-2 py-2.5 text-center text-xs font-semibold text-primary-foreground"
            >
              Send tokens
            </Link>
            <Link to="/social" className="tap rounded-xl bg-muted px-2 py-2.5 text-center text-xs font-semibold">
              Split a bill
            </Link>
            <button
              onClick={() => setShowCode((v) => !v)}
              className="tap flex items-center justify-center gap-1 rounded-xl bg-muted px-2 py-2.5 text-xs font-semibold"
            >
              <QrCode className="size-4" /> My code
            </button>
          </div>
          {showCode ? (
            <div className="flex flex-col items-center border-t border-border p-4">
              <QRCode value={`shekk:${state.name || "student"}:${state.cohort}`} className="h-36 w-36" />
              <div className="mt-2 flex items-center gap-2">
                <Avatar name={state.name || "You"} src={state.avatar} className="size-7" textClassName="text-[10px]" />
                <p className="text-xs font-semibold">{state.name || "Your"} · friend code</p>
              </div>
              <p className="text-center text-[11px] text-muted-foreground">
                A friend scans this to send you tokens. It isn't a merchant payment code.
              </p>
            </div>
          ) : null}
        </Card>
      </section>

      <div className="mt-5">
        <ReverifyBanner />
      </div>

      {/* Activity lives in its own tab */}
      <section className="px-4 pb-8 pt-5">
        <Link
          to="/activity"
          className="tap flex items-center justify-between rounded-2xl bg-muted px-4 py-3 text-sm font-semibold"
        >
          <span className="flex items-center gap-2">
            <Receipt className="size-4 text-primary" /> Activity &amp; history
          </span>
          <ArrowUpRight className="size-4 text-muted-foreground" />
        </Link>

        <Link
          to="/terms"
          className="tap mt-4 flex items-center gap-2 rounded-2xl border border-notice-border bg-notice-soft px-4 py-3 text-xs text-notice-foreground"
        >
          <IdCard className="size-4 shrink-0 text-notice" />
          Tokens are shekel-denominated, non-refundable and non-withdrawable — spendable inside the partner apps in
          Shekk and with other Shekk users. Read the terms.
        </Link>
      </section>

    </AppShell>
  );
}
