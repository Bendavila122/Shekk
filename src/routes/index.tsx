import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, Compass, PlaneTakeoff, ShieldCheck, Smartphone, Check, PartyPopper } from "lucide-react";
import { useProgramme, useTravel } from "@/lib/useProgramme";

import { GlobalSearch } from "@/components/GlobalSearch";
import { AppShell } from "@/components/AppShell";
import { SectionHead, EmptyState, LoadingBlocks, StatusPill, MicroLabel, ProgressBar } from "@/components/Kit";

import { ActiveNow } from "@/components/ActiveNow";
import { ForYou } from "@/components/ForYou";
import { LocationBar } from "@/components/LocationBar";

import { useApp } from "@/lib/store";
import { useProfile } from "@/lib/useProfile";
import { useOnboardedGate } from "@/lib/useOnboardedGate";
import { useSetup } from "@/lib/useSetup";

import { serviceLinkProps, type Service } from "@/lib/services";
import { recordServiceUse, useRecentServices } from "@/lib/recents";
import { ServiceLogo } from "@/components/ServiceLogo";
import { usePromotions } from "@/lib/admin";
import { resolveInterests } from "@/lib/journey-interests";
import { getJourney, greeting } from "@/lib/journey-phase";
import { dayLabel, eventWhen, useEvents, useMyTickets } from "@/lib/useEvents";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Shekk — everything you need to live in Israel" },
      {
        name: "description",
        content:
          "Your Israel dashboard: what to sort before you fly, what to do in your first week, and everything worth knowing once you're here.",
      },
      { property: "og:title", content: "Shekk — everything you need to live in Israel" },
      {
        property: "og:description",
        content: "Setup, services, transport, events and guides for your time in Israel — in one app.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://shekel-connect.lovable.app/" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://shekel-connect.lovable.app/" }],
  }),
  component: HomeScreen,
});

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

/**
 * The heart of the home screen: how far through your Israel setup you are and
 * the one thing worth doing next.
 */
function SetupPanel() {
  const { signedIn } = useApp();
  const { travel, setupComplete, fetched } = useTravel();
  const journey = getJourney(travel);
  const setup = useSetup();

  if (!signedIn) {
    return (
      <section className="px-4 pt-4">
        <div className="rounded-[1.5rem] border border-primary/25 bg-primary-soft p-4">
          <MicroLabel className="text-primary">Start here</MicroLabel>
          <p className="mt-1.5 text-[15px] font-semibold leading-snug">Create your Shekk account</p>
          <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">
            A minute to set up, then Shekk keeps track of everything you need to sort for Israel.
          </p>
          <Link
            to="/auth"
            search={{ next: "/" }}
            className="tap mt-3 inline-flex rounded-full bg-primary px-4 py-2 text-[12.5px] font-bold text-primary-foreground"
          >
            Create account
          </Link>
        </div>
      </section>
    );
  }

  if (fetched && !setupComplete) {
    return (
      <section className="px-4 pt-4">
        <div className="rounded-[1.5rem] border border-primary/25 bg-primary-soft p-4">
          <MicroLabel className="text-primary">Nearly there</MicroLabel>
          <p className="mt-1.5 text-[15px] font-semibold leading-snug">Finish setting up your journey</p>
          <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">
            A few quick questions so Shekk can recommend the right things for your stay.
          </p>
          <Link
            to="/welcome"
            className="tap mt-3 inline-flex rounded-full bg-primary px-4 py-2 text-[12.5px] font-bold text-primary-foreground"
          >
            Pick up where I left off
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 pt-4">
      <div className="rounded-[1.5rem] border border-border bg-card p-4 shadow-card">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <MicroLabel className="text-muted-foreground">Your Israel setup</MicroLabel>
            <p className="mt-1 font-display text-xl font-bold leading-tight tracking-tight">
              {journey.chip ?? "Getting set up"}
            </p>
          </div>
          <Link to="/before-you-fly" className="tap-flat shrink-0 text-[12px] font-semibold text-primary">
            Full checklist →
          </Link>
        </div>
        <p className="mt-2 text-[12px] text-muted-foreground">
          {setup.done} of {setup.total} things sorted
        </p>
        <ProgressBar value={setup.percent / 100} className="mt-2" />

        {setup.complete ? (
          <p className="mt-3 flex items-center gap-2 text-[13px] font-semibold text-success">
            <Check className="size-4" /> Everything on your list is done
          </p>
        ) : setup.next ? (
          <Link
            to={setup.next.href}
            className="tap mt-3.5 flex items-center gap-3 rounded-2xl bg-primary-soft p-3"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <setup.next.Icon className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-semibold leading-snug">{setup.next.title}</span>
              <span className="block text-[11.5px] leading-snug text-muted-foreground">{setup.next.blurb}</span>
            </span>
            <span className="shrink-0 text-sm font-semibold text-primary">→</span>
          </Link>
        ) : null}
      </div>
    </section>
  );
}

/** Programme card — only when the member has actually joined one. */
function ProgrammePanel() {
  const { joined, programme, nextItem, checklistDone, checklistTotal } = useProgramme();
  if (!joined) return null;
  return (
    <section className="px-4 pt-3">
      <Link
        to="/programme"
        className="tap flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-card"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
          <CalendarDays className="size-5 text-foreground/70" />
        </span>
        <span className="min-w-0 flex-1">
          <MicroLabel className="text-muted-foreground">{programme.programmeName}</MicroLabel>
          <span className="mt-0.5 block truncate text-sm font-semibold">
            {nextItem ? nextItem.title : "Nothing scheduled just yet"}
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
                ? `Checklist ${checklistDone} of ${checklistTotal} done`
                : "Announcements, contacts and documents inside"}
          </span>
        </span>
        <span className="shrink-0 text-sm font-semibold text-primary">→</span>
      </Link>
    </section>
  );
}

/** The two services people actually have to buy before flying. */
function ServicePrompts() {
  const setup = useSetup();
  const prompts = [
    {
      to: "/services/esim",
      title: "Get an Israeli SIM",
      body: "Four questions, then the right eSIM for your stay",
      Icon: Smartphone,
      done: setup.isDone("sim"),
    },
    {
      to: "/services/insurance",
      title: "Sort travel and medical cover",
      body: "Compare cover that fits your dates and programme",
      Icon: ShieldCheck,
      done: setup.isDone("insurance"),
    },
  ].filter((p) => !p.done);

  if (prompts.length === 0) return null;

  return (
    <section className="px-4 pt-6">
      <SectionHead
        title="Sort before you fly"
        hint="The things you have to buy for Israel"
        action={
          <Link to="/services" className="tap-flat text-[12.5px] font-semibold text-primary">
            All services
          </Link>
        }
      />
      <div className="space-y-2.5">
        {prompts.map((p) => (
          <Link key={p.to} to={p.to} className="tap flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-card">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <p.Icon className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13.5px] font-semibold leading-snug">{p.title}</span>
              <span className="mt-0.5 block text-[12px] leading-snug text-muted-foreground">{p.body}</span>
            </span>
            <span className="shrink-0 text-sm font-semibold text-primary">→</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/** Picked from what the member said Shekk should help them with, in their order. */
function PickedForYou() {
  const { travel } = useTravel();
  const picks = resolveInterests(travel.interests);
  if (picks.length === 0) return null;

  return (
    <section className="pt-6">
      <div className="px-4">
        <SectionHead title="Picked for you" hint="Based on what you asked Shekk to help with" />
      </div>
      <div className="scrollbar-none flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-5 pb-1 scroll-px-5">
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

/** What's on: your next ticket first, then the soonest things you could book. */
function WhatsOn() {
  const { data: events, isLoading } = useEvents();
  const { data: tickets } = useMyTickets();

  const now = Date.now();
  const booked = new Set(
    (tickets ?? [])
      .filter((t) => t.status === "valid" && !t.event.cancelled)
      .map((t) => t.event.id),
  );
  const upcoming = (events ?? [])
    .filter((e) => !e.cancelled && new Date(e.startsAt).getTime() > now - 3600_000)
    .sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt))
    .slice(0, 4);

  if (isLoading || upcoming.length === 0) return null;

  return (
    <section className="pt-6">
      <div className="px-4">
        <SectionHead
          title="What's on"
          hint="Shabbatonim, tiyulim and nights out you can book"
          action={
            <Link to="/tickets" className="tap-flat text-[12.5px] font-semibold text-primary">
              My tickets
            </Link>
          }
        />
      </div>
      <div className="scrollbar-none flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-5 pb-1 scroll-px-5">
        {upcoming.map((e) => (
          <Link
            key={e.id}
            to="/explore/event/$id"
            params={{ id: e.id }}
            className="tap w-[190px] shrink-0 snap-start rounded-2xl border border-border bg-card p-3.5 shadow-card"
          >
            <span className="flex items-center gap-2">
              <span className="text-lg">{e.emoji || "🎟️"}</span>
              <MicroLabel className="text-muted-foreground">{dayLabel(e.startsAt)}</MicroLabel>
            </span>
            <span className="mt-1.5 block line-clamp-2 text-[13.5px] font-semibold leading-snug">{e.title}</span>
            <span className="mt-0.5 block text-[11.5px] leading-snug text-muted-foreground">
              {eventWhen(e.startsAt)}
            </span>
            {booked.has(e.id) ? (
              <span className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-success">
                <Check className="size-3" /> You&apos;re going
              </span>
            ) : null}
          </Link>
        ))}
      </div>
      <div className="px-4 pt-3">
        <Link
          to="/explore/events"
          className="tap flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-card"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <PartyPopper className="size-4" />
          </span>
          <span className="min-w-0 flex-1 text-[13px] font-semibold">See everything that&apos;s on</span>
          <span className="shrink-0 text-sm font-semibold text-primary">→</span>
        </Link>
      </div>
    </section>
  );
}

function HomeScreen() {
  const ready = useOnboardedGate();
  const { state } = useApp();
  const kycProfile = useProfile();
  const { travel } = useTravel();
  const promos = usePromotions("home");
  const recents = useRecentServices();

  if (!ready) {
    return (
      <AppShell>
        <LoadingBlocks rows={2} />
      </AppShell>
    );
  }

  const firstName =
    (state.name?.trim().split(" ")[0] || kycProfile.profile?.legalFirstName?.trim().split(" ")[0] || "").trim();
  const journey = getJourney(travel);

  return (
    <AppShell>
      <div className="px-5 pb-1 pt-6">
        <div className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="Shekk logo"
            width={30}
            height={30}
            className="size-[30px] rounded-lg border border-border bg-white"
          />
          <span className="font-display text-xl font-bold leading-none tracking-tight text-primary">Shekk</span>
          {journey.chip ? (
            <StatusPill tone="pending" className="ml-auto">
              {journey.chip}
            </StatusPill>
          ) : null}
        </div>
        <h1 className="mt-3 font-display text-[1.7rem] font-bold leading-tight tracking-tight">
          {greeting()}
          {firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="mt-1 text-[13px] leading-snug text-muted-foreground">{journey.line}</p>
      </div>

      <LocationBar />

      <SetupPanel />
      <ProgrammePanel />
      <ActiveNow />
      <WhatsOn />
      <ServicePrompts />
      <PickedForYou />

      <div className="px-4 pt-6">
        <GlobalSearch />
      </div>

      <ForYou />

      <div className="px-4 pt-6">
        <SectionHead
          title="Jump back in"
          hint="The apps and tools you used most recently"
          action={
            <Link to="/israel" className="tap-flat text-[12.5px] font-semibold text-primary">
              Explore
            </Link>
          }
        />
        {recents.length === 0 ? (
          <EmptyState
            icon={Compass}
            title="Nothing here yet"
            body="Open something from Explore — transport, food, guides — and it'll wait for you here."
            actionLabel="Browse Explore"
            actionTo="/israel"
          />
        ) : (
          <div className="grid grid-cols-5 gap-x-2 gap-y-5">
            {recents.map((s) => (
              <AppIcon key={s.id} service={s} />
            ))}
          </div>
        )}
      </div>

      {promos.length > 0 ? (
        <section className="pt-6">
          <div className="px-4">
            <SectionHead title="Worth knowing" hint="From the Shekk team" />
          </div>
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

      <div className="pb-8" />
    </AppShell>
  );
}

/** Kept so the pre-arrival phase still reads warmly on an empty account. */
export const HOME_PHASE_ICON = PlaneTakeoff;
