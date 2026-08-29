/**
 * The book. One page at a time, hinged on a fixed vertical spine at the left.
 * Dragging follows your finger one-to-one and the leaf rotates on that single
 * axis, the way a real page does — no wobble, no gloss.
 *
 * Hand-rolled with pointer events + CSS 3D transforms — no animation
 * dependency, one transform per frame.
 */
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { haptic } from "@/lib/foryou-prefs";
import { playPageFlick } from "@/lib/page-sound";

type Dir = "next" | "prev";

/** Release past this much travel and the turn completes. */
const COMMIT = 0.32;
/** How far the leaf swings; past 90deg its backface hides and the page is gone. */
const SWING = 172;
const DURATION = 420;

function reducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}


export function PassportBook({
  pages,
  index,
  onIndex,
  labels,
}: {
  pages: ReactNode[];
  index: number;
  onIndex: (i: number) => void;
  /** Short label per page, shown in the footer ticker. */
  labels: string[];
}) {
  const stage = useRef<HTMLDivElement | null>(null);
  const box = useRef<HTMLDivElement | null>(null);
  const [fit, setFit] = useState({ w: 0, h: 0 });

  // Fit a 3:4 booklet inside the available space, both dimensions respected.
  useEffect(() => {
    const el = box.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const measure = () => {
      const w = Math.min(el.clientWidth, el.clientHeight * 0.62, 460);
      setFit({ w: Math.round(w), h: Math.round(w / 0.62) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const drag = useRef<{ x: number; w: number; dir: Dir | null; active: boolean }>({
    x: 0,
    w: 1,
    dir: null,
    active: false,
  });
  const [dir, setDir] = useState<Dir | null>(null);
  const [p, setP] = useState(0);
  const [animating, setAnimating] = useState(false);


  const canNext = index < pages.length - 1;
  const canPrev = index > 0;

  const settle = useCallback(
    (d: Dir, commit: boolean) => {
      const finish = () => {
        setAnimating(false);
        setDir(null);
        setP(0);
        if (commit) {
          onIndex(d === "next" ? index + 1 : index - 1);
          haptic(8);
        }
      };
      if (reducedMotion()) {
        finish();
        return;
      }
      if (commit) playPageFlick(0.85);
      setAnimating(true);
      setP(commit ? 1 : 0);
      window.setTimeout(finish, DURATION);
    },
    [index, onIndex],
  );

  const go = useCallback(
    (d: Dir) => {
      if (animating) return;
      if (d === "next" && !canNext) return;
      if (d === "prev" && !canPrev) return;
      setDir(d);

      setP(d === "prev" ? 1 : 0);
      // next frame so the start state paints before we animate
      requestAnimationFrame(() => settle(d, true));
    },
    [animating, canNext, canPrev, settle],
  );

  const onDown = (e: React.PointerEvent) => {
    if (animating) return;
    // Capture the pointer so a fast flick that leaves the book still finishes.
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      /* capture is a nicety, not a requirement */
    }
    const rect = stage.current?.getBoundingClientRect();
    drag.current = { x: e.clientX, w: rect?.width ?? 1, dir: null, active: true };

  };

  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d.active) return;
    const dx = e.clientX - d.x;
    if (!d.dir) {
      if (Math.abs(dx) < 6) return;
      const wanted: Dir = dx < 0 ? "next" : "prev";
      if (wanted === "next" && !canNext) return;
      if (wanted === "prev" && !canPrev) return;
      d.dir = wanted;
      setDir(wanted);
    }
    const raw = d.dir === "next" ? -dx : dx;
    const t = Math.max(0, Math.min(1, raw / (d.w * 0.85)));
    // "prev" drags the incoming page back down, so its progress runs backwards.
    setP(d.dir === "prev" ? 1 - t : t);
  };

  const onUp = (e?: React.PointerEvent) => {
    const d = drag.current;
    if (!d.active) return;
    d.active = false;
    if (e) {
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        /* already released */
      }
    }
    if (!d.dir) return;
    const chosen = d.dir;
    d.dir = null;
    const travelled = chosen === "prev" ? 1 - p : p;
    settle(chosen, travelled > COMMIT);
  };

  /* One page at a time, like a real booklet. Going forward the current page is
     the leaf that lifts away; coming back the previous page falls into place.
     `p` always runs 0 (flat) → 1 (fully turned). */
  const underIndex = dir === "next" ? index + 1 : index;
  const turnIndex = dir === "prev" ? index - 1 : index;
  const angle = -p * SWING;
  // Paper is not rigid: a gentle tilt on the hinge axis lifts the far corner
  // first and eases off as the page comes over.
  const tilt = 0.22 * Math.sin(Math.PI * Math.min(p, 1));
  const lift = Math.sin(Math.PI * Math.min(p, 1));

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* The booklet is fitted to whatever space is left, so it is always fully
          visible: never clipped by a narrow phone or a short viewport. */}
      <div ref={box} className="relative grid min-h-0 flex-1 place-items-center overflow-hidden">
        <div
          ref={stage}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          className="pp-stage relative touch-pan-y select-none"
          style={{ width: fit.w, height: fit.h }}
        >
          {/* the page underneath */}
          <div className="absolute inset-0 overflow-hidden rounded-l-md rounded-r-2xl shadow-lift">
            <Sheet>{pages[underIndex]}</Sheet>
            {/* shadow the lifting leaf casts onto the page below */}
            {dir ? (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background: `linear-gradient(90deg, rgba(38,26,10,${0.3 * lift}) 0%, rgba(38,26,10,0) ${
                    18 + 46 * p
                  }%)`,
                }}
              />
            ) : null}
          </div>

          {/* turning leaf: the page itself, pivoting where your finger is */}
          {dir ? (
            <div
              className="pp-page absolute inset-0 z-10 overflow-hidden rounded-l-md rounded-r-2xl"
              style={{
                transformOrigin: `left ${pivot}%`,
                transform: `rotate3d(${tilt.toFixed(3)}, 1, 0, ${angle}deg)`,
                transition: animating
                  ? `transform ${DURATION}ms cubic-bezier(0.25, 0.75, 0.2, 1)`
                  : "none",
                boxShadow: `${Math.round(lift * 22)}px ${Math.round(lift * 8)}px ${Math.round(
                  16 + lift * 34,
                )}px rgba(46, 32, 12, ${0.1 + lift * 0.2})`,
              }}
            >
              <Sheet>{pages[turnIndex]}</Sheet>
              {/* curl shading: darker at the hinge, a soft sheen across the bend */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background: `linear-gradient(90deg, rgba(60,44,20,${0.2 * lift}) 0%, rgba(60,44,20,0) 26%, rgba(255,255,255,${
                    0.22 * lift
                  }) 82%, rgba(255,255,255,0) 100%)`,
                }}
              />
            </div>
          ) : null}

          {/* spine + page edge, so the book reads as a physical object */}
          <div aria-hidden className="pp-spine pointer-events-none absolute inset-y-0 left-0 z-20 w-4" />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-3 right-0 z-20 w-1.5 rounded-r-md"
            style={{
              backgroundImage:
                "repeating-linear-gradient(180deg, oklch(0.88 0.02 84), oklch(0.88 0.02 84) 2px, oklch(0.78 0.03 84) 2px, oklch(0.78 0.03 84) 3px)",
            }}
          />

          {/* idle invitation: a small curled corner you can flick */}
          {!dir && canNext ? (
            <div
              aria-hidden
              className="pointer-events-none absolute bottom-0 right-0 z-20 size-10 rounded-br-2xl rounded-tl-xl"
              style={{
                background:
                  "linear-gradient(315deg, oklch(0.93 0.02 84) 0%, oklch(0.87 0.03 84) 55%, transparent 56%)",
                boxShadow: "-3px -3px 10px rgba(46,32,12,0.16)",
              }}
            />
          ) : null}
        </div>
      </div>

      {/* flick controls */}
      <div className="flex shrink-0 items-center justify-between gap-3 px-4 pb-2 pt-2">
        <button
          type="button"
          onClick={() => go("prev")}
          disabled={!canPrev}
          aria-label="Previous page"
          className="tap-icon grid size-11 place-items-center rounded-full bg-card/85 text-foreground shadow-card ring-1 ring-border backdrop-blur disabled:opacity-35"
        >
          <ChevronLeft className="size-5" />
        </button>
        <p className="truncate text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          {labels[index]} · {index + 1}/{pages.length}
        </p>
        <button
          type="button"
          onClick={() => go("next")}
          disabled={!canNext}
          aria-label="Next page"
          className="tap-icon grid size-11 place-items-center rounded-full bg-card/85 text-foreground shadow-card ring-1 ring-border backdrop-blur disabled:opacity-35"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>
    </div>
  );
}

/** Paper sheet: warm stock, grain, page shading and a soft inner spine. */
function Sheet({ children }: { children: ReactNode }) {
  return (
    <div className="pp-paper pp-grain relative h-full w-full overflow-hidden">
      <div className="relative z-10 h-full w-full overflow-y-auto overscroll-contain scrollbar-none">{children}</div>
      <div aria-hidden className="pp-page-shade pointer-events-none absolute inset-0 z-20" />
    </div>
  );
}
