/**
 * The pages of the Shekk Passport.
 *
 * Each builder returns the two physical leaves of one spread — top and bottom,
 * stacked around the horizontal calendar spine — which PassportBook renders into
 * the open book and turns independently. They
 * are plain functions, not components, because the book needs both faces of a
 * spread at once while a leaf is mid-turn.
 */
import { Compass, Lock, MapPin, Sparkles } from "lucide-react";
import { CityArt } from "@/components/passport/CityArt";
import { MemorySlot } from "@/components/passport/MemorySlot";
import { PassportStamp } from "@/components/passport/PassportStamp";
import type { Leaves } from "@/components/passport/PassportBook";
import {
  PASSPORT_CITIES,
  seasonLabel,
  stampDate,
  type PassportCity,
  type PassportEntry,
  type PassportState,
} from "@/lib/passport";

function Doodle({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 60 24" className={className} style={style} fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
      <path d="M2 18 q10 -14 20 -2 q10 12 20 -2 q8 -10 16 -2" strokeLinecap="round" />
    </svg>
  );
}

/* ------------------------------------------------------------ front matter */

export function frontMatterSpread({
  state,
  name,
  progress,
}: {
  state: PassportState;
  name: string;
  progress: { visited: number; total: number; memories: number; percent: number };
}): Leaves {
  return {
    top: (
      <div className="flex h-full flex-col">
        <p className="text-[9.5px] font-bold uppercase tracking-[0.32em] text-ink/50">Shekk Passport</p>
        <h2 className="mt-2 font-display text-[30px] font-bold leading-[0.98] tracking-tight text-ink">
          Your Israel
          <br />
          Passport
        </h2>
        <Doodle className="mt-2 h-4 w-20 text-ink/30" />
        <p className="mt-3 text-[12px] leading-relaxed text-ink/70">
          Every city you reach gets a stamp and one photo.
        </p>

        <dl className="mt-auto space-y-2 text-ink">
          <div>
            <dt className="text-[9px] font-bold uppercase tracking-[0.2em] text-ink/50">Holder</dt>
            <dd className="font-display text-[17px] font-bold leading-tight">{name}</dd>
          </div>
          <div>
            <dt className="text-[9px] font-bold uppercase tracking-[0.2em] text-ink/50">Season</dt>
            <dd className="font-display text-[17px] font-bold leading-tight">{seasonLabel(state.openedOn)}</dd>
          </div>
        </dl>
      </div>
    ),
    bottom: (
      <div className="flex h-full flex-col">
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Cities", value: `${progress.visited}/${progress.total}`, Icon: MapPin },
            { label: "Memories", value: String(progress.memories), Icon: Sparkles },
          ].map(({ label, value, Icon }) => (
            <div key={label} className="rounded-lg bg-ink/[0.045] px-2.5 py-2 ring-1 ring-ink/10">
              <Icon className="size-3.5 text-ink/50" />
              <p className="mt-1 font-display text-xl font-bold leading-none text-ink">{value}</p>
              <p className="text-[9px] font-semibold uppercase tracking-widest text-ink/50">{label}</p>
            </div>
          ))}
        </div>

        <p className="mt-4 text-[9px] font-bold uppercase tracking-[0.2em] text-ink/50">Discovered</p>
        <div className="mt-2 grid grid-cols-5 gap-1.5">
          {PASSPORT_CITIES.map((c) => {
            const on = Boolean(state.entries[c.id]?.visited);
            return (
              <span
                key={c.id}
                title={c.name}
                className="grid aspect-square place-items-center rounded-full text-[7.5px] font-bold uppercase"
                style={{
                  border: `1.4px ${on ? "solid" : "dashed"} ${on ? c.ink : "oklch(0.5 0.02 80 / 0.35)"}`,
                  color: on ? c.ink : "oklch(0.5 0.02 80 / 0.5)",
                  backgroundColor: on ? `color-mix(in oklab, ${c.ink} 12%, transparent)` : "transparent",
                }}
              >
                {c.name.slice(0, 2)}
              </span>
            );
          })}
        </div>

        <p className="mt-auto flex items-center gap-1.5 text-[11px] font-semibold text-ink/60">
          <Compass className="size-3.5" /> Flick the page edge to turn
        </p>
      </div>
    ),
  };
}

/* --------------------------------------------------------------- map spread */

export function mapSpread({ state }: { state: PassportState }): Leaves {
  const visited = PASSPORT_CITIES.filter((c) => state.entries[c.id]?.visited);
  return {
    top: (
      <div className="flex h-full flex-col">
        <p className="text-[9.5px] font-bold uppercase tracking-[0.32em] text-ink/50">The map</p>
        <h2 className="mt-1.5 font-display text-[22px] font-bold leading-tight tracking-tight text-ink">
          Where you've been
        </h2>
        <div className="relative mt-2 flex-1">
          {/* schematic, illustrated — not a precision map */}
          <svg viewBox="0 0 100 150" className="h-full w-full" aria-label="Stylised map of Israel">
            <path
              d="M42 4 L64 10 L60 34 L70 46 L64 62 L58 78 L52 96 L48 112 L50 132 L44 146 L34 120 L26 92 L20 62 L26 34 L32 16 Z"
              fill="oklch(0.93 0.03 96)"
              stroke="oklch(0.5 0.04 80 / 0.5)"
              strokeWidth="1.2"
              strokeDasharray="3 2"
            />
            <path d="M60 30 q6 8 4 18" stroke="oklch(0.6 0.09 210 / 0.5)" strokeWidth="1.6" fill="none" />
            {PASSPORT_CITIES.map((c) => {
              const on = Boolean(state.entries[c.id]?.visited);
              const x = 12 + (c.map.x / 100) * 62;
              const y = 6 + (c.map.y / 100) * 138;
              return (
                <g key={c.id}>
                  <circle
                    cx={x}
                    cy={y}
                    r={on ? 3.2 : 2}
                    fill={on ? c.ink : "transparent"}
                    stroke={on ? c.ink : "oklch(0.45 0.02 80 / 0.5)"}
                    strokeWidth="1"
                    strokeDasharray={on ? undefined : "1.6 1.4"}
                  />
                  {on ? <circle cx={x} cy={y} r="6" fill={c.ink} opacity="0.14" /> : null}
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    ),
    bottom: (
      <div className="flex h-full flex-col">
        <p className="text-[9.5px] font-bold uppercase tracking-[0.32em] text-ink/50">Log</p>
        {visited.length === 0 ? (
          <p className="mt-3 text-[12px] leading-relaxed text-ink/70">
            Nothing stamped yet. Turn to any city and check in when you get there.
          </p>
        ) : (
          <ul className="mt-2 space-y-2">
            {visited.map((c) => (
              <li key={c.id} className="flex items-baseline gap-2">
                <span className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: c.ink }} />
                <span className="truncate font-display text-[14px] font-bold text-ink">{c.name}</span>
                <span className="ml-auto shrink-0 text-[9px] font-semibold uppercase tracking-wider text-ink/50">
                  {stampDate(state.entries[c.id]?.visitedOn)}
                </span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-auto text-[10.5px] leading-relaxed text-ink/55">
          Hand-drawn, not a survey map — dots sit roughly where they belong.
        </p>
      </div>
    ),
  };
}

/* -------------------------------------------------------------- city spread */

export function citySpread({
  city,
  entry,
  justStamped,
  onCheckIn,
  onUndo,
  onMemory,
  checkInState,
}: {
  city: PassportCity;
  entry?: PassportEntry;
  justStamped: boolean;
  onCheckIn: (mode: "here" | "manual") => void;
  onUndo: () => void;
  onMemory: (photo?: string, caption?: string) => void;
  checkInState: { busy: boolean; message: string | null };
}): Leaves {
  const visited = Boolean(entry?.visited);
  return {
    top: (
      <div className="flex h-full flex-col">
        <div className="relative -mx-3.5 -mt-4 h-[42%] overflow-hidden">
          <CityArt theme={city.id} locked={!visited} className="h-full w-full" />
          {!visited ? (
            <span className="absolute bottom-2 left-3 inline-flex items-center gap-1 rounded-full bg-ink/80 px-2 py-1 text-[8.5px] font-bold uppercase tracking-widest text-ink-foreground">
              <Lock className="size-2.5" /> Undiscovered
            </span>
          ) : null}
        </div>

        <div className="mt-3">
          <p className="text-[9.5px] font-bold uppercase tracking-[0.3em]" style={{ color: city.ink }}>
            {city.hebrew}
          </p>
          <h2 className="font-display text-[26px] font-bold leading-none tracking-tight text-ink">{city.name}</h2>
          <Doodle className="mt-1.5 h-3.5 w-16" style={{ color: city.ink }} />
          <p className="mt-2 text-[12px] leading-relaxed text-ink/70">{city.blurb}</p>
        </div>

        {visited ? (
          <button
            type="button"
            onClick={onUndo}
            className="tap-flat mt-auto self-start text-[9px] font-semibold uppercase tracking-widest text-ink/40"
          >
            Remove stamp
          </button>
        ) : null}
      </div>
    ),
    bottom: visited ? (
      <div className="flex h-full flex-col">
        <div className="mx-auto">
          <PassportStamp city={city} date={entry?.visitedOn} animate={justStamped} size={128} />
        </div>
        <div className="mt-2">
          <MemorySlot city={city} photo={entry?.photo} caption={entry?.caption} onChange={onMemory} />
        </div>
      </div>
    ) : (
      <div className="flex h-full flex-col">
        <p className="text-[9.5px] font-bold uppercase tracking-[0.3em] text-ink/50">Not stamped yet</p>
        <div
          className="mt-3 grid aspect-square w-full max-w-[8.5rem] place-items-center self-center rounded-full text-center"
          style={{ border: `1.6px dashed ${city.ink}`, color: city.ink, opacity: 0.55 }}
        >
          <span className="px-4 text-[10px] font-semibold uppercase leading-snug tracking-widest">
            Stamp
            <br />
            awaits
          </span>
        </div>

        <div className="mt-4 space-y-2">
          <button
            type="button"
            disabled={checkInState.busy}
            onClick={() => onCheckIn("here")}
            className="tap w-full rounded-full px-3 py-2.5 text-[11px] font-bold uppercase tracking-widest text-ink-foreground disabled:opacity-60"
            style={{ backgroundColor: city.ink }}
          >
            {checkInState.busy ? "Checking…" : "I'm here"}
          </button>
          <button
            type="button"
            onClick={() => onCheckIn("manual")}
            className="tap-flat w-full rounded-full px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-ink/60 ring-1 ring-ink/15"
          >
            Mark visited
          </button>
        </div>
        {checkInState.message ? (
          <p className="mt-2 text-center text-[10.5px] leading-relaxed text-ink/60">{checkInState.message}</p>
        ) : null}
        <p className="mt-auto text-[10px] leading-relaxed text-ink/45">
          “I'm here” checks roughly where you are.
        </p>
      </div>
    ),
  };
}
