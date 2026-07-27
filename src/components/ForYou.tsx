import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { SlidersHorizontal, RefreshCw, Sparkles } from "lucide-react";
import { useUserContext } from "@/lib/personalise";
import { orderWidgets, sampleTip, type WidgetDef } from "@/lib/widgets";
import { useForYouPrefs, haptic } from "@/lib/foryou-prefs";
import { ForYouSettings } from "@/components/ForYouSettings";
import { ils } from "@/lib/mock";
import { useApp } from "@/lib/store";

function Skeleton() {
  return (
    <div className="flex gap-3 overflow-hidden px-4">
      {[0, 1].map((i) => (
        <div key={i} className="shimmer h-56 w-[84%] shrink-0 rounded-[1.75rem] bg-muted" />
      ))}
    </div>
  );
}

function WidgetCard({
  def,
  ctx,
  compact,
  balance,
  index,
}: {
  def: WidgetDef;
  ctx: ReturnType<typeof useUserContext>;
  compact: boolean;
  balance: number;
  index: number;
}) {
  const content = def.build(ctx);
  const rows = compact ? content.rows.slice(0, 2) : content.rows.slice(0, 5);

  return (
    <article
      className={`${def.gradient} snap-center shrink-0 animate-fade-in rounded-[1.75rem] border border-border p-5 shadow-card`}
      style={{ width: "84%", animationDelay: `${Math.min(index, 4) * 60}ms` }}
    >
      <header className="flex items-start gap-3">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-card text-2xl shadow-card">{def.emoji}</span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{def.title}</p>
          <p className="truncate text-lg font-bold leading-tight">
            {def.id === "wallet" ? ils(balance) : content.headline}
          </p>
          {content.sub ? <p className="mt-0.5 truncate text-xs text-muted-foreground">{content.sub}</p> : null}
        </div>
      </header>

      <ul className="mt-4 space-y-2">
        {rows.map((r, i) => (
          <li key={`${r.label}-${i}`} className="flex items-center gap-2.5 text-sm">
            <span className="w-5 shrink-0 text-center">{r.icon}</span>
            <span className="min-w-0 flex-1 truncate">{r.label}</span>
            {r.value ? <span className="shrink-0 text-xs font-semibold text-muted-foreground">{r.value}</span> : null}
          </li>
        ))}
      </ul>

      {content.ctas.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {content.ctas.map((cta, i) => (
            <Link
              key={cta.label}
              to={cta.to}
              onClick={() => haptic()}
              className={`tap rounded-full px-3.5 py-2 text-xs font-semibold ${
                i === 0 ? "bg-primary text-primary-foreground" : "bg-card text-foreground"
              }`}
            >
              {cta.label}
            </Link>
          ))}
        </div>
      ) : null}
    </article>
  );
}

export function ForYou() {
  const { state } = useApp();
  const [refreshKey, setRefreshKey] = useState(0);
  const ctx = useUserContext(refreshKey);
  const { prefs, togglePin, toggleHide, move, setSize, reset } = useForYouPrefs();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const railRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number | null>(null);

  const widgets = useMemo(() => orderWidgets(ctx, prefs.pinned, prefs.hidden), [ctx, prefs.pinned, prefs.hidden]);

  useEffect(() => {
    const el = railRef.current;
    if (!el) return;
    const onScroll = () => {
      const i = Math.round(el.scrollLeft / (el.clientWidth * 0.84 + 12));
      setActive(Math.max(0, Math.min(widgets.length - 1, i)));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [widgets.length]);

  const doRefresh = () => {
    haptic(12);
    setRefreshing(true);
    window.setTimeout(() => {
      setRefreshKey((k) => k + 1);
      setRefreshing(false);
      setPull(0);
    }, 700);
  };

  return (
    <section className="pt-7">
      <div className="flex items-end justify-between px-5">
        <div>
          <h2 className="flex items-center gap-1.5 text-base font-bold">
            <Sparkles className="size-4 text-primary" /> For You
          </h2>
          <p className="text-[11px] text-muted-foreground">{ctx.ready ? sampleTip(ctx) : "Personalising…"}</p>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={doRefresh} className="tap rounded-full bg-muted p-2" aria-label="Refresh widgets">
            <RefreshCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
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
      </div>

      {/* pull-to-refresh affordance */}
      <div
        className="overflow-hidden transition-[height] duration-200"
        style={{ height: refreshing ? 28 : pull }}
      >
        <p className="pt-1.5 text-center text-[11px] font-semibold text-muted-foreground">
          {refreshing ? "Refreshing…" : pull > 40 ? "Release to refresh" : "Pull to refresh"}
        </p>
      </div>

      {!ctx.ready ? (
        <div className="pt-3">
          <Skeleton />
        </div>
      ) : (
        <div
          ref={railRef}
          onTouchStart={(e) => {
            startY.current = e.touches[0].clientY;
          }}
          onTouchMove={(e) => {
            if (startY.current === null) return;
            const dy = e.touches[0].clientY - startY.current;
            if (dy > 0) setPull(Math.min(70, dy / 2));
          }}
          onTouchEnd={() => {
            if (pull > 40) doRefresh();
            else setPull(0);
            startY.current = null;
          }}
          className="no-scrollbar mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 pb-1"
        >
          {widgets.map((w, i) => (
            <WidgetCard key={w.id} def={w} ctx={ctx} compact={prefs.size === "compact"} balance={state.balance} index={i} />
          ))}
          <div className="w-1 shrink-0" />
        </div>
      )}

      {ctx.ready && widgets.length > 1 ? (
        <div className="mt-3 flex justify-center gap-1.5">
          {widgets.map((w, i) => (
            <span
              key={w.id}
              className={`h-1.5 rounded-full transition-all duration-200 ${
                i === active ? "w-4 bg-primary" : "w-1.5 bg-border"
              }`}
            />
          ))}
        </div>
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
