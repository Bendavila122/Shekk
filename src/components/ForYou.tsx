import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { SlidersHorizontal, Sparkles, X } from "lucide-react";
import { useUserContext, WEATHER_CITIES } from "@/lib/personalise";
import { orderWidgets, type WidgetDef } from "@/lib/widgets";

import { useForYouPrefs, haptic } from "@/lib/foryou-prefs";
import { ForYouSettings } from "@/components/ForYouSettings";
import { ils } from "@/lib/mock";
import { useApp } from "@/lib/store";

function Skeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 px-5">
      <div className="shimmer col-span-2 h-28 rounded-[1.5rem] bg-muted" />
      <div className="shimmer aspect-square rounded-[1.5rem] bg-muted" />
      <div className="shimmer aspect-square rounded-[1.5rem] bg-muted" />
    </div>
  );
}

type Ctx = ReturnType<typeof useUserContext>;

/* iPhone-style tile: fixed frames, one type scale, one glance value. */
function Tile({
  def,
  ctx,
  balance,
  wide,
  index,
  onOpen,
}: {
  def: WidgetDef;
  ctx: Ctx;
  balance: number;
  wide: boolean;
  index: number;
  onOpen: () => void;
}) {
  const content = def.build(ctx);
  const headline = def.id === "wallet" ? ils(balance) : content.headline;
  const snap = content.rows[0];
  const footer = wide
    ? content.sub ?? (snap ? `${snap.label}${snap.value ? ` · ${snap.value}` : ""}` : "")
    : snap
      ? `${snap.label}${snap.value ? ` · ${snap.value}` : ""}`
      : (content.sub ?? "");

  return (
    <button
      type="button"
      onClick={() => {
        haptic();
        onOpen();
      }}
      style={{ animationDelay: `${Math.min(index, 6) * 45}ms` }}
      className={`${def.gradient} widget-tile tap-icon animate-fade-in flex flex-col gap-2 p-3 text-left ${
        wide ? "col-span-2 min-h-[8.5rem]" : "aspect-square"
      }`}
    >
      {/* Header frame */}
      <div className="widget-frame relative z-[1] flex items-center gap-1.5 px-2 py-1.5">
        <span className="text-[13px] leading-none">{def.emoji}</span>
        <span className="truncate text-[10px] font-semibold uppercase tracking-[0.14em]">{def.title}</span>
      </div>

      {/* Body frame — one type scale across every widget */}
      <div className="widget-frame relative z-[1] flex min-h-0 flex-1 flex-col justify-between px-2.5 py-2">
        <p className="line-clamp-2 text-[15px] font-bold leading-[1.2]">{headline}</p>
        {footer ? (
          <p className="mt-1 line-clamp-2 text-[11px] leading-snug opacity-80">{footer}</p>
        ) : null}
      </div>
    </button>
  );
}


function DetailSheet({
  def,
  ctx,
  balance,
  weatherCity,
  setWeatherCity,
  onClose,
}: {
  def: WidgetDef;
  ctx: Ctx;
  balance: number;
  weatherCity: string;
  setWeatherCity: (c: string) => void;
  onClose: () => void;
}) {
  const content = def.build(ctx);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
      <button className="absolute inset-0 bg-foreground/40" aria-label="Close" onClick={onClose} />
      <div className="animate-fade-in relative w-full max-w-md rounded-t-[2rem] border border-border bg-card p-6 pb-8 shadow-card sm:rounded-[2rem]">
        <header className="flex items-start gap-3">
          <span className={`${def.gradient} widget-tile flex size-12 shrink-0 items-center justify-center rounded-2xl text-2xl`}>
            {def.emoji}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{def.title}</p>
            <p className="text-[17px] font-bold leading-tight">
              {def.id === "wallet" ? ils(balance) : content.headline}
            </p>
            {content.sub ? <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{content.sub}</p> : null}
          </div>
          <button onClick={onClose} className="tap rounded-full bg-muted p-2" aria-label="Close">
            <X className="size-4" />
          </button>
        </header>


        <ul className="mt-5 space-y-2">
          {content.rows.map((r, i) => (
            <li
              key={`${r.label}-${i}`}
              className="flex items-center gap-3 rounded-xl bg-muted/60 px-3 py-2.5 text-[13px] leading-snug"
            >
              <span className="w-5 shrink-0 text-center">{r.icon}</span>
              <span className="min-w-0 flex-1">{r.label}</span>
              {r.value ? <span className="shrink-0 text-[13px] font-semibold text-muted-foreground">{r.value}</span> : null}
            </li>
          ))}
        </ul>


        {def.id === "today" ? (
          <div className="mt-5">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Change city</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {WEATHER_CITIES.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    haptic();
                    setWeatherCity(c);
                  }}
                  className={`tap rounded-full px-3.5 py-2 text-xs font-semibold ${
                    c === weatherCity ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {content.ctas.length ? (
          <div className="mt-6 flex flex-wrap gap-2">
            {content.ctas.map((cta, i) => (
              <Link
                key={cta.label}
                to={cta.to}
                onClick={() => {
                  haptic();
                  onClose();
                }}
                className={`tap rounded-full px-4 py-2.5 text-xs font-semibold ${
                  i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                }`}
              >
                {cta.label}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function ForYou() {
  const { state } = useApp();
  // Live: re-derive context on a timer and whenever the tab regains focus.
  const [tick, setTick] = useState(0);
  const { prefs, togglePin, toggleHide, move, setSize, setWeatherCity, reset } = useForYouPrefs();
  const ctx = useUserContext(tick, prefs.weatherCity);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const bump = () => setTick((t) => t + 1);
    const id = window.setInterval(bump, 60_000);
    const onVisible = () => {
      if (document.visibilityState === "visible") bump();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", bump);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", bump);
    };
  }, []);

  const widgets = useMemo(() => orderWidgets(ctx, prefs.pinned, prefs.hidden), [ctx, prefs.pinned, prefs.hidden]);
  const openDef = widgets.find((w) => w.id === openId) ?? null;

  // Expanded = the top widget gets a full-width tile; compact = all squares.
  const isWide = (i: number) => prefs.size !== "compact" && (i === 0 || i === 3);

  return (
    <section className="pt-7">
      <div className="flex items-center justify-between px-5">
        <h2 className="flex items-center gap-1.5 text-base font-bold">
          <Sparkles className="size-4 text-primary" /> For You
        </h2>
        <button
          onClick={() => {
            haptic();
            setSettingsOpen(true);
          }}
          className="tap rounded-full bg-muted p-2"
          aria-label="Customise For You"
        >
          <SlidersHorizontal className="size-4" />
        </button>
      </div>


      {!ctx.ready ? (
        <div className="pt-3">
          <Skeleton />
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-3 px-5 sm:grid-cols-3">
          {widgets.map((w, i) => (
            <Tile
              key={w.id}
              def={w}
              ctx={ctx}
              balance={state.balance}
              wide={isWide(i)}
              index={i}
              onOpen={() => setOpenId(w.id)}
            />
          ))}
        </div>
      )}

      {openDef ? (
        <DetailSheet
          def={openDef}
          ctx={ctx}
          balance={state.balance}
          weatherCity={ctx.weatherCity}
          setWeatherCity={setWeatherCity}
          onClose={() => setOpenId(null)}
        />
      ) : null}

      <ForYouSettings
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        prefs={prefs}
        togglePin={togglePin}
        toggleHide={toggleHide}
        move={move}
        setSize={setSize}
        reset={reset}
      />
    </section>
  );
}
