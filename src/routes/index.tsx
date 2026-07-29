import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Users, QrCode, Plus, ArrowLeftRight, ArrowUpRight, CreditCard } from "lucide-react";
import { GlobalSearch } from "@/components/GlobalSearch";
import { AppShell, Card, ReverifyBanner } from "@/components/AppShell";
import { ForYou } from "@/components/ForYou";
import { ActiveNow } from "@/components/ActiveNow";
import { LocationBar } from "@/components/LocationBar";

import { QRCode } from "@/components/QRCode";
import { Avatar } from "@/components/Avatar";
import { useApp } from "@/lib/store";
import { ils } from "@/lib/mock";
import { refIn } from "@/lib/currencies";
import { useOnboardedGate } from "@/lib/useOnboardedGate";

import { serviceLinkProps, type Service } from "@/lib/services";
import { recordServiceUse, useRecentServices } from "@/lib/recents";
import { ServiceLogo } from "@/components/ServiceLogo";
import { useVisibleBenefits, usePromotions } from "@/lib/admin";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Home · Shekk" },
      {
        name: "description",
        content:
          "Your Israeli phone, inside your phone: Wolt, Gett, Rav-Kav, Israel Railways, Go-To and more — all paid with Shekk.",
      },
      { property: "og:title", content: "Home · Shekk" },
      { property: "og:description", content: "One home screen for every Israeli app a gap-year student needs." },
    ],
  }),
  component: HomeScreen,
});

const HERO_ACTIONS = [
  { to: "/topup", label: "Add money", Icon: Plus },
  { to: "/exchange", label: "Exchange", Icon: ArrowLeftRight },
  { to: "/social", label: "Send", Icon: ArrowUpRight },
  { to: "/card", label: "Card", Icon: CreditCard },
] as const;

function AppIcon({ service }: { service: Service }) {
  return (
    <Link
      {...serviceLinkProps(service)}
      onClick={() => recordServiceUse(service.id)}
      className="tap-icon group flex flex-col items-center gap-1.5"
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
  const { state, isPremium } = useApp();
  const benefits = useVisibleBenefits();
  const promos = usePromotions("home");

  const recents = useRecentServices();
  const [showCode, setShowCode] = useState(false);


  if (!ready) {
    return (
      <AppShell>
        <div className="flex h-[70vh] items-center justify-center text-sm text-muted-foreground">Loading…</div>
      </AppShell>
    );
  }

  const firstName = state.name.split(" ")[0];

  return (
    <AppShell>
      <div className="px-5 pb-2 pt-6">
        <div className="flex items-center gap-2">
          <img
            src="/favicon.png"
            alt="Shekk logo"
            width={30}
            height={30}
            className="size-[30px] rounded-lg border border-border bg-white"
          />
          <span className="font-display text-xl font-bold leading-none tracking-tight text-primary">Shekk</span>
        </div>
        <p className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">Shalom, {firstName}</p>
      </div>

      <LocationBar />

      {/* Wallet hero — the daily financial pulse */}
      <section className="px-4 pt-3">
        <div className="grad-balance relative overflow-hidden rounded-[1.5rem] px-5 py-4 text-ink-foreground shadow-lift">
          <span className="card-sheen pointer-events-none absolute inset-0" aria-hidden />
          <div className="relative">
            <Link to="/wallet" className="tap-flat block">
              <p className="text-[10px] uppercase tracking-widest opacity-70">Shekk balance</p>
              <p className="font-display text-4xl font-bold leading-none tracking-tight">{ils(state.balance)}</p>
              <p className="mt-1.5 text-[11px] opacity-70">
                ≈ {refIn(state.settings.payCurrency, state.balance)} · {isPremium ? "Premium member" : "Free plan"}
              </p>
            </Link>
            <div className="mt-4 grid grid-cols-4 gap-1.5">
              {HERO_ACTIONS.map(({ to, label, Icon }) => (
                <Link
                  key={label}
                  to={to}
                  className="tap-icon flex flex-col items-center gap-1 rounded-xl bg-ink-foreground/10 py-2"
                >
                  <Icon className="size-[17px]" strokeWidth={2.4} />
                  <span className="text-[9.5px] font-semibold leading-none">{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Search into the full catalogue */}
      <div className="px-4 pt-3">
        <GlobalSearch />
      </div>




      {/* Recents */}
      <div className="space-y-6 px-4 pt-6">
        <section>
          <div className="grid grid-cols-5 gap-x-2 gap-y-5">
            {recents.map((s) => (
              <AppIcon key={s.id} service={s} />
            ))}
          </div>
        </section>

      </div>

      <ActiveNow />

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
                Send shekels to friends on Shekk or split a bill with your cohort.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 border-t border-border p-3">
            <Link
              to="/social"
              className="tap rounded-xl bg-primary px-2 py-2.5 text-center text-xs font-semibold text-primary-foreground"
            >
              Send money
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
                A friend scans this to send you shekels. It isn't a merchant payment code.
              </p>
            </div>
          ) : null}
        </Card>
      </section>

      {/* Promotions published from the console */}
      {promos.length > 0 ? (
        <section className="pt-6">
          <div className="scrollbar-none flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 scroll-px-5 pb-1">
            {promos.map((p) => (
              <Link
                key={p.id}
                to={p.ctaHref}
                className="tap w-[260px] shrink-0 snap-start rounded-2xl border border-border bg-card p-4 shadow-card"
              >
                <span className="text-2xl">{p.emoji}</span>
                <p className="mt-2 text-sm font-semibold leading-snug">{p.title}</p>
                <p className="mt-1 text-[12px] text-muted-foreground">{p.blurb}</p>
                <p className="mt-2 text-[12px] font-semibold text-primary">{p.ctaLabel} →</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}


      {/* Benefits near you */}
      <section className="pt-6">
        <div className="mb-2 flex items-baseline justify-between px-5">
          <h2 className="font-display text-lg font-bold tracking-tight">Benefits near you</h2>
          <Link to="/benefits" className="tap-flat text-[12px] font-semibold text-primary">
            See all
          </Link>
        </div>
        <div className="scrollbar-none flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 scroll-px-5 pb-1">
          {benefits.slice(0, 6).map((b) => (
            <Link
              key={b.id}
              to="/benefits/$id"
              params={{ id: b.id }}
              className="tap w-[190px] shrink-0 snap-start rounded-2xl border border-border bg-card p-3.5 shadow-card"
            >
              <ServiceLogo service={{ name: b.brand, emoji: b.emoji, domain: b.domain }} size={38} />
              <p className="mt-2.5 line-clamp-2 text-[13px] font-semibold leading-snug">{b.headline}</p>
              <p className="mt-1.5 text-[11px] text-muted-foreground">{b.location}</p>
            </Link>
          ))}
        </div>
      </section>

      <ForYou />

      <div className="mt-5">
        <ReverifyBanner />
      </div>


      <div className="pb-8" />

    </AppShell>
  );
}
