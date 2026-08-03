import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, ArrowLeftRight, ArrowUpRight, CreditCard, PlaneTakeoff, CalendarDays } from "lucide-react";
import { useProgramme, useTravel } from "@/lib/useProgramme";

import { GlobalSearch } from "@/components/GlobalSearch";
import { AppShell, ReverifyBanner } from "@/components/AppShell";

import { ActiveNow } from "@/components/ActiveNow";
import { ForYou } from "@/components/ForYou";
import { LocationBar } from "@/components/LocationBar";


import { useApp } from "@/lib/store";
import { useProfile } from "@/lib/useProfile";
import { ils } from "@/lib/mock";
import { refIn } from "@/lib/currencies";
import { useOnboardedGate } from "@/lib/useOnboardedGate";

import { serviceLinkProps, type Service } from "@/lib/services";
import { recordServiceUse, useRecentServices } from "@/lib/recents";
import { ServiceLogo } from "@/components/ServiceLogo";
import { usePromotions } from "@/lib/admin";
import { resolveInterests } from "@/lib/journey-interests";


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
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://shekel-connect.lovable.app/" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://shekel-connect.lovable.app/" }],
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
/** The participant journey: one clear next action, plus what's next from the programme. */
function JourneyStrip() {
  const { signedIn, state } = useApp();
  const kyc = useProfile();
  const { joined, programme, nextItem, checklistDone, checklistTotal } = useProgramme();
  const { daysToArrival, setupComplete, fetched } = useTravel();

  const nextAction = !signedIn
    ? { label: "Create your Shekk account", to: "/auth" as const, why: "Takes a minute" }
    : fetched && !setupComplete
      ? {
          label: "Complete your Shekk setup",
          to: "/welcome" as const,
          why: "A few quick questions — picks up where you left off",
        }
      : !kyc.verified
      ? { label: "Verify your identity", to: "/verify" as const, why: "Required before you can spend" }
      : state.balance <= 0
        ? { label: "Add your first money", to: "/topup" as const, why: "Fund in your home currency" }
        : !joined
          ? { label: "Join your programme", to: "/programme" as const, why: "Enter the code they gave you" }
          : { label: "Before you fly checklist", to: "/before-you-fly" as const, why: "Keep getting ready" };

  return (
    <section className="space-y-2.5 px-4 pt-4">
      <Link
        to={nextAction.to}
        className="tap flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-card"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <PlaneTakeoff className="size-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {daysToArrival !== null && daysToArrival > 0
              ? `${daysToArrival} ${daysToArrival === 1 ? "day" : "days"} until you land`
              : "Your next step"}
          </span>
          <span className="mt-0.5 block text-sm font-semibold">{nextAction.label}</span>
          <span className="block text-xs text-muted-foreground">{nextAction.why}</span>
        </span>
        <span className="shrink-0 text-sm font-semibold text-primary">→</span>
      </Link>

      {joined ? (
        <Link
          to="/programme"
          className="tap flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-card"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
            <CalendarDays className="size-5 text-foreground/70" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {programme.programmeName}
            </span>
            <span className="mt-0.5 block truncate text-sm font-semibold">
              {nextItem ? nextItem.title : "No sessions scheduled yet"}
            </span>
            <span className="block text-xs text-muted-foreground">
              {nextItem
                ? new Date(nextItem.startsAt).toLocaleString("en-GB", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : checklistTotal > 0
                  ? `Checklist ${checklistDone}/${checklistTotal}`
                  : "Announcements and contacts inside"}
            </span>
          </span>
          <span className="shrink-0 text-sm font-semibold text-primary">→</span>
        </Link>
      ) : null}
    </section>
  );
}

/** Picked from what the member said Shekk should help them with, in their order. */
function PickedForYou() {
  const { travel } = useTravel();
  const picks = resolveInterests(travel.interests);
  if (picks.length === 0) return null;

  return (
    <section className="pt-4">
      <h2 className="px-5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        Picked for you
      </h2>
      <div className="scrollbar-none mt-2 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-5 pb-1 scroll-px-5">
        {picks.map((p) => (
          <Link
            key={p.id}
            to={p.to}
            className="tap w-[150px] shrink-0 snap-start rounded-2xl border border-border bg-card p-3.5 shadow-card"
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <p.icon className="size-4" />
            </span>
            <span className="mt-2 block text-sm font-semibold leading-snug">{p.action}</span>
            <span className="block text-[11px] leading-snug text-muted-foreground">{p.hint}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}




function HomeScreen() {
  const ready = useOnboardedGate();
  const { state, isPremium } = useApp();
  const kycProfile = useProfile();
  
  const promos = usePromotions("home");

  const recents = useRecentServices();
  


  if (!ready) {
    return (
      <AppShell>
        <div className="flex h-[70vh] items-center justify-center text-sm text-muted-foreground">Loading…</div>
      </AppShell>
    );
  }

  const firstName =
    (state.name?.trim().split(" ")[0] || kycProfile.profile?.legalFirstName?.trim().split(" ")[0] || "").trim();

  return (
    <AppShell>
      <div className="px-5 pb-2 pt-6">
        <div className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="Shekk logo"
            width={30}
            height={30}
            className="size-[30px] rounded-lg border border-border bg-white"
          />
          <span className="font-display text-xl font-bold leading-none tracking-tight text-primary">Shekk</span>
        </div>
        <p className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">Shalom{firstName ? `, ${firstName}` : ""}</p>
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

      {/* The journey: what to do next, and what's next from your programme */}
      <JourneyStrip />

      {/* Straight from the journey setup */}
      <PickedForYou />

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

      <ForYou />




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




      <div className="mt-5">
        <ReverifyBanner />
      </div>


      <div className="pb-8" />

    </AppShell>
  );
}
