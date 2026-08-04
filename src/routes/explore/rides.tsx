import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, Card, PrimaryButton, ScreenHeader } from "@/components/AppShell";
import { ils } from "@/lib/mock";
import { useApp } from "@/lib/store";
import { useLocation, ISRAEL_PLACES } from "@/lib/location";
import { bookRide, cancelRide, estimateRide, rideStatus, searchPlaces } from "@/lib/gett.functions";

export const Route = createFileRoute("/explore/rides")({
  head: () => ({
    meta: [
      { title: "Gett taxis · Shekk" },
      { name: "description", content: "Order a Gett taxi anywhere in Israel and pay straight from your Shekk shekel balance." },
      { property: "og:title", content: "Gett taxis · Shekk" },
      { property: "og:description", content: "Live prices, in-app booking and driver tracking — no cash at the curb." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Rides,
});

type Spot = { label: string; lat: number; lng: number };
type Option = {
  id: string;
  productId: string;
  name: string;
  seats: number;
  etaMinutes: number;
  price: number;
  currency: string;
  emoji: string;
};

const QUICK: Spot[] = ISRAEL_PLACES.slice(0, 8).map((p) => ({
  label: p.area ? `${p.area}, ${p.city}` : p.city,
  lat: p.lat,
  lng: p.lon,
}));

function PlaceField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Spot | null;
  onChange: (p: Spot) => void;
}) {
  const search = useServerFn(searchPlaces);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<Spot[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open || q.trim().length < 3) {
      setResults([]);
      return;
    }
    let live = true;
    setBusy(true);
    const t = setTimeout(async () => {
      try {
        const r = await search({ data: { q } });
        if (live) setResults(r.places);
      } finally {
        if (live) setBusy(false);
      }
    }, 350);
    return () => {
      live = false;
      clearTimeout(t);
    };
  }, [q, open, search]);

  const suggestions = q.trim().length < 3 ? QUICK : results;

  return (
    <div className="relative">
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <input
        value={open ? q : (value?.label ?? "")}
        placeholder="Search an address or landmark"
        onFocus={() => {
          setQ("");
          setOpen(true);
        }}
        onChange={(e) => setQ(e.target.value)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="w-full rounded-2xl border border-border bg-card px-4 py-3.5 text-sm outline-none focus:border-primary"
      />
      {open && (
        <div className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-2xl border border-border bg-card shadow-lg">
          {busy && <p className="px-4 py-3 text-xs text-muted-foreground">Searching…</p>}
          {!busy && suggestions.length === 0 && (
            <p className="px-4 py-3 text-xs text-muted-foreground">No matches — keep typing.</p>
          )}
          {suggestions.map((p) => (
            <button
              key={`${p.label}-${p.lat}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(p);
                setOpen(false);
              }}
              className="tap block w-full px-4 py-3 text-left text-sm hover:bg-primary-soft"
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Rides() {
  const { state, spend, signedIn, available, holdFor, settleHold, releaseHold, moneyError } = useApp();
  const { place: here } = useLocation();
  const estimate = useServerFn(estimateRide);
  const book = useServerFn(bookRide);
  const track = useServerFn(rideStatus);
  const cancel = useServerFn(cancelRide);

  const defaultPickup = useMemo<Spot | null>(
    () => (here ? { label: here.area ? `${here.area}, ${here.city}` : here.city, lat: here.lat, lng: here.lon } : QUICK[0] ?? null),
    [here],
  );

  const [pickup, setPickup] = useState<Spot | null>(defaultPickup);
  const [dropoff, setDropoff] = useState<Spot | null>(null);
  const [options, setOptions] = useState<Option[]>([]);
  const [pick, setPick] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [live, setLive] = useState(false);
  const [rideId, setRideId] = useState<string | null>(null);
  const [status, setStatus] = useState<Awaited<ReturnType<typeof rideStatus>> | null>(null);
  const charged = useRef(false);
  const holdId = useRef<string | null>(null);

  useEffect(() => {
    if (!pickup && defaultPickup) setPickup(defaultPickup);
  }, [defaultPickup, pickup]);

  // Price the journey whenever both ends are set.
  useEffect(() => {
    if (!pickup || !dropoff || rideId) return;
    let alive = true;
    setLoading(true);
    setNotice(null);
    estimate({ data: { pickup, dropoff } })
      .then((r) => {
        if (!alive) return;
        setOptions(r.options as Option[]);
        setPick(r.options[0]?.id ?? null);
        setLive(r.live);
        if ("error" in r && r.error) setNotice(r.error as string);
      })
      .catch(() => alive && setNotice("Couldn't reach Gett just now."))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [pickup, dropoff, rideId, estimate]);

  // Poll ride progress.
  useEffect(() => {
    if (!rideId) return;
    let alive = true;
    const poll = async () => {
      try {
        const s = await track({ data: { rideId } });
        if (alive) setStatus(s);
      } catch {
        /* keep last known status */
      }
    };
    poll();
    const t = setInterval(poll, 4000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [rideId, track]);

  const selected = options.find((o) => o.id === pick) ?? null;
  // Signed-in members book against spendable money: balance minus existing holds.
  const spendable = signedIn ? available : state.balance;
  const affordable = selected ? spendable >= selected.price : false;

  async function order() {
    if (!pickup || !dropoff || !selected) return;
    setLoading(true);
    try {
      const r = await book({
        data: {
          pickup,
          dropoff,
          productId: selected.productId,
          price: selected.price,
          passengerName: state.name || "Shekk member",
        },
      });
      setRideId(r.rideId);
      setLive(r.live);
      if ("error" in r && r.error) setNotice(r.error as string);
      if (!charged.current) {
        charged.current = true;
        if (signedIn) {
          // The estimate is only reserved. The true fare is charged when the
          // ride ends, so waiting time or a route change settles correctly.
          holdId.current = await holdFor({
            amount: selected.price,
            merchant: `Gett · ${dropoff.label}`,
            category: "Rides",
            icon: "🚕",
            externalRef: r.rideId,
          });
        } else {
          spend(`Gett · ${dropoff.label}`, "Rides", selected.price, "🚕");
        }
      }
    } catch {
      setNotice("Booking failed. Nothing was charged.");
    } finally {
      setLoading(false);
    }
  }

  async function endRide() {
    const completed = status?.status === "completed";
    if (rideId && !completed) await cancel({ data: { rideId } });

    if (holdId.current) {
      // A finished ride settles at Gett's final fare; a cancelled one gives
      // the reservation straight back.
      if (completed) await settleHold(holdId.current, status?.price ?? undefined);
      else await releaseHold(holdId.current);
      holdId.current = null;
    }

    setRideId(null);
    setStatus(null);
    charged.current = false;
  }

  return (
    <AppShell>
      <ScreenHeader title="Gett taxis" subtitle={live ? "Live Gett prices" : "Indicative prices"} />
      <div className="space-y-4 px-4 py-4">
        {moneyError && (
          <p className="rounded-2xl bg-destructive/10 px-4 py-3 text-xs font-medium text-destructive">
            {moneyError}
          </p>
        )}

        {notice && (
          <p className="rounded-2xl bg-muted px-4 py-3 text-xs text-muted-foreground">{notice}</p>
        )}

        {!rideId ? (
          <>
            <Card className="space-y-4">
              <PlaceField label="Pickup" value={pickup} onChange={setPickup} />
              <PlaceField label="Destination" value={dropoff} onChange={setDropoff} />
            </Card>

            {loading && <p className="text-center text-sm text-muted-foreground">Getting prices…</p>}

            {!loading && options.length > 0 && (
              <Card className="divide-y divide-border p-0">
                {options.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => setPick(o.id)}
                    className={`tap flex w-full items-center gap-3 p-4 text-left ${pick === o.id ? "bg-primary-soft" : ""}`}
                  >
                    <span className="text-xl">{o.emoji}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{o.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {o.etaMinutes} min away · {o.seats} seats
                      </p>
                    </div>
                    <span className="text-sm font-semibold">{ils(o.price)}</span>
                  </button>
                ))}
              </Card>
            )}

            {selected && !affordable && (
              <p className="text-center text-xs text-muted-foreground">
                You need {ils(selected.price - spendable)} more in your balance to book this ride.
              </p>
            )}

            <PrimaryButton disabled={!selected || !affordable || loading} onClick={order}>
              {selected ? `Order ${selected.name} · ${ils(selected.price)}` : "Choose a destination"}
            </PrimaryButton>
            <p className="text-center text-xs text-muted-foreground">
              Paid from your shekel balance — nothing owed in the car.
            </p>
          </>
        ) : (
          <Card className="space-y-3 text-center">
            <p className="text-3xl">🚕</p>
            <p className="text-lg font-bold">
              {status?.driverName
                ? `${status.driverName} · ${status.label}`
                : (status?.label ?? "Finding you a driver")}
            </p>
            {status?.car && (
              <p className="text-sm text-muted-foreground">
                {status.car}
                {status.plate ? ` · ${status.plate}` : ""}
              </p>
            )}
            <p className="text-sm text-muted-foreground">Heading to {dropoff?.label}</p>
            {status?.etaMinutes != null && (
              <p className="text-sm font-semibold">{status.etaMinutes} min away</p>
            )}
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-700"
                style={{
                  width:
                    status?.status === "completed"
                      ? "100%"
                      : status?.status === "in_progress"
                        ? "75%"
                        : status?.status === "arriving"
                          ? "45%"
                          : "20%",
                }}
              />
            </div>
            {status?.price != null && (
              <p className="text-xs text-muted-foreground">
                {signedIn && status.status !== "completed"
                  ? `${ils(status.price)} reserved — you are charged the final fare when the ride ends.`
                  : `Paid ${ils(status.price)} from your balance.`}
              </p>
            )}
            <button onClick={endRide} className="tap text-sm font-semibold text-muted-foreground underline">
              {status?.status === "completed" ? "Done" : "Cancel ride"}
            </button>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
