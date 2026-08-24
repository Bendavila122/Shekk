import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Signal, Smartphone } from "lucide-react";
import { AppShell, ScreenHeader, Notice } from "@/components/AppShell";
import { EmptyState, LoadingBlocks, SectionHead, StatusPill } from "@/components/Kit";
import { mySimPurchases } from "@/lib/sim.functions";
import { useApp } from "@/lib/store";
import { money } from "@/lib/sim";

export const Route = createFileRoute("/services/esim/mine")({
  head: () => ({
    meta: [
      { title: "My eSIMs · Shekk" },
      {
        name: "description",
        content: "Where your Shekk-bought eSIMs and their activation codes will live once buying in Shekk is switched on.",
      },
      { property: "og:title", content: "My eSIMs · Shekk" },
      { property: "og:description", content: "Your Shekk eSIM purchases and activation details." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MyEsims,
});

function MyEsims() {
  const { signedIn } = useApp();
  const fetchMine = useServerFn(mySimPurchases);

  const query = useQuery({
    queryKey: ["sim", "mine"],
    queryFn: () => fetchMine(),
    enabled: signedIn,
    staleTime: 60_000,
    throwOnError: false,
  });

  const orders = query.data?.orders ?? [];
  const esims = query.data?.esims ?? [];

  return (
    <AppShell>
      <ScreenHeader title="My eSIMs" subtitle="Purchases and activation" back="/services/esim" />

      <div className="space-y-4 px-4 pb-10 pt-5">
        <Notice title="Buying a SIM inside Shekk isn't switched on yet">
          When it is, every eSIM you buy here shows up on this screen with its QR code and activation details, ready to
          install. Plans you buy on a provider's own site won't appear here.
        </Notice>

        {!signedIn ? (
          <EmptyState
            icon={Smartphone}
            title="Sign in to see your purchases"
            body="Your eSIMs are tied to your Shekk account so they follow you across devices."
          />
        ) : query.isLoading ? (
          <LoadingBlocks rows={2} />
        ) : esims.length === 0 && orders.length === 0 ? (
          <EmptyState
            icon={Signal}
            title="Nothing here yet"
            body="You haven't bought a SIM through Shekk. Use the finder to work out which plan fits your stay."
            action={
              <Link
                to="/services/esim"
                className="tap inline-flex items-center justify-center rounded-full bg-primary px-4 py-2.5 text-[13px] font-bold text-primary-foreground"
              >
                Find my SIM
              </Link>
            }
          />
        ) : (
          <>
            {esims.length > 0 ? (
              <section>
                <SectionHead title="Your eSIMs" />
                <div className="space-y-2.5">
                  {esims.map((e) => (
                    <div key={e.id} className="rounded-2xl border border-border bg-card p-4 shadow-card">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold">{e.provider_id}</p>
                        <StatusPill tone={e.status === "ready" || e.status === "active" ? "positive" : "quiet"}>
                          {e.status}
                        </StatusPill>
                      </div>
                      {e.iccid ? <p className="mt-1 text-[12px] text-muted-foreground">ICCID {e.iccid}</p> : null}
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {orders.length > 0 ? (
              <section>
                <SectionHead title="Orders" />
                <div className="space-y-2.5">
                  {orders.map((o) => (
                    <div key={o.id} className="rounded-2xl border border-border bg-card p-4 shadow-card">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold">{o.provider_id}</p>
                        <StatusPill tone={o.status === "fulfilled" ? "positive" : "quiet"}>{o.status}</StatusPill>
                      </div>
                      <p className="mt-1 text-[12px] text-muted-foreground">
                        {money(o.amount_minor ?? 0, o.currency ?? "GBP")} ·{" "}
                        {new Date(o.created_at as string).toLocaleDateString("en-GB")}
                      </p>
                      {o.failure_reason ? (
                        <p className="mt-1 text-[12px] font-semibold text-destructive">{o.failure_reason}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </>
        )}
      </div>
    </AppShell>
  );
}
