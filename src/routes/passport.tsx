/**
 * Shekk Passport — a standalone mini app. A physical-feeling passport cover you
 * open, then a book of illustrated city spreads you flick through, stamp and
 * paste one photo into. Local-first: nothing here touches auth or the ledger.
 */
import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { LoadingBlocks } from "@/components/Kit";
import { AppShell } from "@/components/AppShell";
import { PassportBook } from "@/components/passport/PassportBook";
import { citySpread, frontMatterSpread, mapSpread } from "@/components/passport/spreads";
import { haptic } from "@/lib/foryou-prefs";
import { useProfile } from "@/lib/useProfile";
import {
  CHECKIN_RADIUS_KM,
  PASSPORT_CITIES,
  nearestCity,
  seasonLabel,
  usePassport,
} from "@/lib/passport";

export const Route = createFileRoute("/passport")({
  head: () => ({
    meta: [
      { title: "Passport · Your year in Israel, stamped" },
      {
        name: "description",
        content:
          "Shekk Passport is a living travel journal for your year in Israel: collect a stamp for every city you reach and keep one photo from each.",
      },
      { property: "og:title", content: "Shekk Passport" },
      {
        property: "og:description",
        content: "Collect a stamp for every Israeli city you reach, and keep one memory from each.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PassportApp,
});

function PassportApp() {
  const { state, ready, stamp, unstamp, setMemory, progress } = usePassport();
  const profile = useProfile();
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [justStamped, setJustStamped] = useState<string | null>(null);
  const [checkIn, setCheckIn] = useState<{ busy: boolean; message: string | null }>({
    busy: false,
    message: null,
  });

  /* Passport is one fixed object: the document itself must never scroll or
     rubber-band while it is open. Released on leaving the mini app. */
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prev = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      overscroll: body.style.overscrollBehavior,
    };
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";
    return () => {
      html.style.overflow = prev.htmlOverflow;
      body.style.overflow = prev.bodyOverflow;
      body.style.overscrollBehavior = prev.overscroll;
    };
  }, []);


  const holder =
    [profile.profile?.legalFirstName, profile.profile?.legalLastName]
      .filter(Boolean)
      .join(" ")
      .trim() || "Shekk member";

  function doCheckIn(cityId: string, mode: "here" | "manual") {
    if (mode === "manual") {
      stamp(cityId);
      setJustStamped(cityId);
      haptic(18);
      setCheckIn({ busy: false, message: null });
      return;
    }
    if (!("geolocation" in navigator)) {
      setCheckIn({ busy: false, message: "No location on this device — mark it visited instead." });
      return;
    }
    setCheckIn({ busy: true, message: null });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const near = nearestCity({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        if (near.city.id === cityId && near.km <= CHECKIN_RADIUS_KM) {
          stamp(cityId);
          setJustStamped(cityId);
          haptic(18);
          setCheckIn({ busy: false, message: null });
        } else {
          setCheckIn({
            busy: false,
            message:
              near.km <= CHECKIN_RADIUS_KM
                ? `Looks like you're in ${near.city.name} right now.`
                : "You don't seem to be here yet — mark it visited if you have been.",
          });
        }
      },
      () => setCheckIn({ busy: false, message: "Location was declined — mark it visited instead." }),
      { timeout: 8000, maximumAge: 60_000 },
    );
  }

  const spreads = useMemo(
    () => [
      frontMatterSpread({ state, name: holder, progress }),
      mapSpread({ state }),
      ...PASSPORT_CITIES.map((city) =>
        citySpread({
          city,
          entry: state.entries[city.id],
          justStamped: justStamped === city.id,
          checkInState: checkIn,
          onCheckIn: (mode: "here" | "manual") => doCheckIn(city.id, mode),
          onUndo: () => unstamp(city.id),
          onMemory: (photo?: string, caption?: string) => setMemory(city.id, photo, caption),
        }),
      ),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state, holder, progress, justStamped, checkIn],
  );

  const labels = useMemo(
    () => ["Front matter", "The map", ...PASSPORT_CITIES.map((c) => c.name)],
    [],
  );

  if (!ready)
    return (
      <AppShell>
        <LoadingBlocks rows={3} />
      </AppShell>
    );

  const cover = (
    <span aria-hidden={false} className="absolute inset-0 flex flex-col justify-between p-5">
      <span aria-hidden className="pp-cover-spine absolute inset-y-0 left-0 w-3.5" />
      <span className="text-[9px] font-bold uppercase tracking-[0.38em] text-ink-foreground/70">Shekk</span>
      <span className="grid place-items-center">
        <svg viewBox="0 0 100 100" className="w-20 text-ink-foreground/85" fill="none" aria-hidden>
          <circle cx="50" cy="50" r="34" stroke="currentColor" strokeWidth="1.6" strokeDasharray="4 3" />
          <path
            d="M50 20 v60 M20 50 h60 M28 30 q22 20 0 40 M72 30 q-22 20 0 40"
            stroke="currentColor"
            strokeWidth="1.2"
            opacity="0.7"
          />
        </svg>
      </span>
      <span className="block">
        <span className="block font-display text-[22px] font-bold leading-none tracking-tight text-ink-foreground">
          Passport
        </span>
        <span className="mt-1 block text-[9.5px] font-semibold uppercase tracking-[0.24em] text-ink-foreground/65">
          Israel · {seasonLabel(state.openedOn)}
        </span>
        <span className="mt-2.5 block text-[10.5px] leading-snug text-ink-foreground/60">
          {progress.visited} of {progress.total} cities stamped
          <br />
          tap to open
        </span>
      </span>
    </span>
  );

  return (
    <AppShell>
      <div className="flex h-[100svh] max-h-[100svh] flex-col overflow-hidden px-2 pb-2 pt-12">
        <PassportBook
          spreads={spreads}
          labels={labels}
          index={page}
          onIndex={setPage}
          cover={cover}
          opened={open}
          onOpen={() => setOpen(true)}
        />
      </div>
    </AppShell>
  );
}
