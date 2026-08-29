/**
 * The passport as one physical object.
 *
 * Closed, you see a large portrait booklet. Tapping it pulls the camera back a
 * touch, turns the whole booklet 90deg into landscape (its footprint then
 * matches the open spread exactly, because a leaf is 1:sqrt(2)) and finally
 * hinges the cover away on the spine to reveal the interior.
 *
 * Open, it is a true landscape two-leaf book: turning forward rotates ONLY the
 * right leaf around the centre spine, in two halves swapped at the midpoint so
 * no face is ever mirrored or backface-culled.
 */
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { haptic } from "@/lib/foryou-prefs";

export type Leaves = { left: ReactNode; right: ReactNode };

type Dir = "next" | "prev";
type Phase = "closed" | "pull" | "turn" | "settle" | "hinge";

/** Release past this much travel and the turn completes. */
const COMMIT = 0.3;
const DURATION = 460;

/* Opening choreography: pull back, turn flat 90deg, hold, then hinge open. */
const PULL = 180;
const TURN = 500;
const SETTLE = 120;
const HINGE = 600;

/** Open-book ratio. A leaf is 1:sqrt(2) portrait, so the closed booklet rotated
 *  90deg lands exactly on the open spread's footprint — no distortion. */
const BOOK_RATIO = 1.414;


function reducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function PassportBook({
  spreads,
  index,
  onIndex,
  labels,
  cover,
  opened,
  onOpen,
}: {
  spreads: Leaves[];
  index: number;
  onIndex: (i: number) => void;
  /** Short label per spread, shown in the footer ticker. */
  labels: string[];
  /** The closed cover face; hinges away on the spine when opening. */
  cover: ReactNode;
  opened: boolean;
  onOpen: () => void;
}) {
  const box = useRef<HTMLDivElement | null>(null);
  const [fit, setFit] = useState({ w: 0, h: 0, cw: 0, ch: 0 });
  const [phase, setPhase] = useState<Phase>("closed");
  const timers = useRef<number[]>([]);

  // Fit the whole landscape book inside the available space, both dimensions
  // respected, using nearly all of the width on a phone.
  useEffect(() => {
    const el = box.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const measure = () => {
      const cw = el.clientWidth;
      const ch = el.clientHeight;
      const w = Math.min(cw, ch * BOOK_RATIO, 760);
      setFit({ w: Math.round(w), h: Math.round(w / BOOK_RATIO), cw, ch });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t));
    },
    [],
  );

  const drag = useRef<{ x: number; y: number; w: number; dir: Dir | null; active: boolean; locked: boolean }>({
    x: 0,
    y: 0,
    w: 1,
    dir: null,
    active: false,
    locked: false,
  });
  const [dir, setDir] = useState<Dir | null>(null);
  const [p, setP] = useState(0);
  const pRef = useRef(0);
  pRef.current = p;
  const [animating, setAnimating] = useState(false);

  const canNext = index < spreads.length - 1;
  const canPrev = index > 0;

  const raf = useRef<number | null>(null);

  /* The turn is tweened in JS rather than with a CSS transition: the leaf that
     paints swaps at the midpoint, so a transition on either element would be
     interrupted. One transform per frame, still cheap. */
  const settle = useCallback(
    (d: Dir, commit: boolean) => {
      const base = d === "next" ? index : index - 1;
      const finish = () => {
        setAnimating(false);
        setDir(null);
        setP(0);
        if (commit) {
          onIndex(d === "next" ? base + 1 : base);
          haptic(8);
        }
      };
      const target = d === "next" ? (commit ? 1 : 0) : commit ? 0 : 1;
      if (reducedMotion()) {
        finish();
        return;
      }
      setAnimating(true);
      const start = performance.now();
      const fromP = pRef.current;
      const span = Math.abs(target - fromP);
      const ms = Math.max(160, DURATION * span);
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / ms);
        // ease-out: paper slows as it lands
        const e = 1 - Math.pow(1 - t, 2.4);
        setP(fromP + (target - fromP) * e);
        if (t < 1) {
          raf.current = requestAnimationFrame(step);
          return;
        }
        finish();
      };
      raf.current = requestAnimationFrame(step);
    },
    [index, onIndex],
  );

  useEffect(() => () => {
    if (raf.current) cancelAnimationFrame(raf.current);
  }, []);

  const go = useCallback(
    (d: Dir) => {
      if (animating) return;
      if (d === "next" && !canNext) return;
      if (d === "prev" && !canPrev) return;
      setDir(d);
      setP(d === "prev" ? 1 : 0);
      requestAnimationFrame(() => settle(d, true));
    },
    [animating, canNext, canPrev, settle],
  );

  const onDown = (e: React.PointerEvent) => {
    if (animating || !opened) return;
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      /* capture is a nicety, not a requirement */
    }
    drag.current = { x: e.clientX, y: e.clientY, w: fit.w || 1, dir: null, active: true, locked: false };
  };

  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d.active || d.locked) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (!d.dir) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      // Vertical intent wins: content inside a leaf may scroll.
      if (Math.abs(dy) > Math.abs(dx)) {
        d.locked = true;
        return;
      }
      const wanted: Dir = dx < 0 ? "next" : "prev";
      if (wanted === "next" && !canNext) return;
      if (wanted === "prev" && !canPrev) return;
      d.dir = wanted;
      setDir(wanted);
    }
    const raw = d.dir === "next" ? -dx : dx;
    // Half the book width is the full travel of one leaf.
    const t = Math.max(0, Math.min(1, raw / (d.w * 0.5)));
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

  /* Which spread pair the turn happens between. Forward: index → index + 1.
     Backward: index - 1 → index, animated in reverse. */
  const base = dir === "prev" ? index - 1 : index;
  const from = spreads[base] ?? spreads[index];
  const to = spreads[base + 1] ?? from;
  const lift = Math.sin(Math.PI * Math.min(Math.max(p, 0), 1));

  const leafW = fit.w / 2;
  /* Past the halfway point the leaf shows its reverse side. */
  const flipped = p > 0.5;

  /* ---- opening choreography ----
     One object, one visible beat at a time:
       closed  → large upright portrait booklet
       pull    → same object, scaled down a touch (no orientation change)
       turn    → keyframed 2D rotation to exactly -90deg, art rotating with it
       settle  → held flat, sideways, still closed
       hinge   → cover swings off the spine in 3D over the waiting spread
     The closed booklet is fit.h x fit.w portrait; rotated -90deg it is exactly
     the landscape stage, so nothing morphs or resizes. */
  const closedScale = Math.min((fit.ch * 0.84) / (fit.w || 1), (fit.cw * 0.94) / (fit.h || 1)) || 1;
  const pulled = closedScale * 0.88;

  const coverStyle: React.CSSProperties =
    phase === "closed"
      ? { transform: `translate(-50%, -50%) rotate(0deg) scale(${closedScale.toFixed(3)})` }
      : phase === "pull"
        ? {
            transform: `translate(-50%, -50%) rotate(0deg) scale(${pulled.toFixed(3)})`,
            transition: `transform ${PULL}ms cubic-bezier(0.33,0,0.2,1)`,
          }
        : {
            // Keyframed so the mid-rotation scale dip (which keeps the corners
            // on screen) cannot cancel out the rotation itself.
            ["--pp-s0" as string]: pulled.toFixed(3),
            animation: `pp-flat ${TURN}ms cubic-bezier(0.45,0.05,0.2,1) both`,
          };

  const startOpening = () => {
    if (phase !== "closed") return;
    haptic(14);
    if (reducedMotion()) {
      onOpen();
      return;
    }
    setPhase("pull");
    timers.current.push(
      window.setTimeout(() => setPhase("turn"), PULL),
      window.setTimeout(() => {
        setPhase("settle");
        haptic(10);
      }, PULL + TURN),
      window.setTimeout(() => setPhase("hinge"), PULL + TURN + SETTLE),
      window.setTimeout(onOpen, PULL + TURN + SETTLE + HINGE - 40),
    );
  };

  /* The spread waits underneath from the moment the booklet lies flat, so the
     hinge reveals it rather than cross-fading to it. */
  const bookVisible = opened || phase === "settle" || phase === "hinge";


  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div ref={box} className="relative grid min-h-0 flex-1 place-items-center overflow-hidden">
        <div className="pp-stage relative select-none" style={{ width: fit.w, height: fit.h }}>
          {/* ---------- the two static leaves ---------- */}
          <div
            className="pp-book absolute inset-0 grid grid-cols-2 overflow-hidden rounded-[10px]"
            style={{ opacity: bookVisible ? 1 : 0 }}
          >
            <Leaf side="left">{from.left}</Leaf>
            <Leaf side="right">{dir ? to.right : from.right}</Leaf>
          </div>

          {/* shadow the lifting leaf casts across the page it uncovers */}
          {dir ? (
            <div
              aria-hidden
              className={`pointer-events-none absolute inset-y-0 z-[5] ${flipped ? "left-0" : "right-0"}`}
              style={{
                width: leafW,
                background: `linear-gradient(${flipped ? 270 : 90}deg, rgba(44,30,10,${(0.22 * lift).toFixed(
                  3,
                )}) 0%, rgba(44,30,10,0) ${Math.round(70 - 40 * Math.abs(p - 0.5) * 2)}%)`,
              }}
            />
          ) : null}

          {/* ---------- the turning leaf ----------
              Two halves of the same motion, swapped at the midpoint, each
              rotating at most 90deg so no face ever turns away from the viewer. */}
          {dir && !flipped ? (
            <div
              className="pp-leaf absolute inset-y-0 right-0 z-10 overflow-hidden rounded-r-[10px]"
              style={{
                width: leafW,
                transformOrigin: "left center",
                transform: `rotateY(${-p * 180}deg)`,
                boxShadow: `0 ${Math.round(lift * 5)}px ${Math.round(10 + lift * 16)}px rgba(46,32,12,${(
                  0.06 + lift * 0.12
                ).toFixed(3)})`,
              }}
            >
              <Leaf side="right">{from.right}</Leaf>
            </div>
          ) : null}
          {dir && flipped ? (
            <div
              className="pp-leaf absolute inset-y-0 left-0 z-10 overflow-hidden rounded-l-[10px]"
              style={{
                width: leafW,
                transformOrigin: "right center",
                transform: `rotateY(${(1 - p) * 180}deg)`,
                boxShadow: `0 ${Math.round(lift * 5)}px ${Math.round(10 + lift * 16)}px rgba(46,32,12,${(
                  0.06 + lift * 0.12
                ).toFixed(3)})`,
              }}
            >
              <Leaf side="left">{to.left}</Leaf>
            </div>
          ) : null}

          {/* centre gutter + outer page edges: the book as an object */}
          {bookVisible ? (
            <>
              <div aria-hidden className="pp-gutter pointer-events-none absolute inset-y-0 left-1/2 z-20 w-6 -translate-x-1/2" />
              <div aria-hidden className="pp-edge pp-edge-r pointer-events-none absolute inset-y-2 right-0 z-20 w-[5px]" />
              <div aria-hidden className="pp-edge pp-edge-l pointer-events-none absolute inset-y-2 left-0 z-20 w-[5px]" />
            </>
          ) : null}

          {/* ---------- beats A–D: the closed booklet itself ----------
              One button, mounted from closed through settle. Full opacity the
              whole way, so the 90deg turn is plainly visible. */}
          {!opened && phase !== "hinge" ? (
            <button
              type="button"
              aria-label="Open your Shekk Passport"
              onClick={startOpening}
              data-pp-cover
              className="pp-leaf pp-cover absolute left-1/2 top-1/2 z-30 overflow-hidden rounded-[12px] text-left"
              style={{
                // Portrait booklet: rotating it -90deg lands exactly on the
                // open spread's landscape footprint.
                width: fit.h,
                height: fit.w,
                transformOrigin: "center center",
                ...coverStyle,
              }}
            >
              {cover}
            </button>
          ) : null}

          {/* ---------- beat E: the hinge ----------
              Same artwork, same on-screen orientation as the end of the turn
              (portrait art inside a landscape leaf, rotated -90deg), now
              swinging off the spine over the spread already sitting beneath. */}
          {!opened && phase === "hinge" ? (
            <div
              aria-hidden
              className="pp-hinge pp-leaf pp-cover absolute inset-0 z-30 overflow-hidden rounded-[12px]"
              style={{
                transformOrigin: "left center",
                animation: `pp-hinge-open ${HINGE}ms cubic-bezier(0.32,0.72,0.2,1) both`,
              }}
            >
              <span
                className="absolute left-1/2 top-1/2 block"
                style={{
                  width: fit.h,
                  height: fit.w,
                  transform: "translate(-50%, -50%) rotate(-90deg)",
                }}
              >
                {cover}
              </span>
            </div>
          ) : null}


          {/* idle invitation: a hint of depth under the outer corner */}
          {opened && !dir && canNext ? (
            <div
              aria-hidden
              className="pointer-events-none absolute bottom-0 right-0 z-20 size-8 rounded-br-[10px]"
              style={{ boxShadow: "inset -8px -8px 12px rgba(46,32,12,0.1)" }}
            />
          ) : null}

          {/* gesture surface: only the outer edge of each leaf catches flicks. */}
          {opened ? (
            <>
              <div
                className="absolute inset-y-0 left-0 z-[25] w-[14%] touch-pan-y"
                onPointerDown={onDown}
                onPointerMove={onMove}
                onPointerUp={onUp}
                onPointerCancel={onUp}
              />
              <div
                className="absolute inset-y-0 right-0 z-[25] w-[14%] touch-pan-y"
                onPointerDown={onDown}
                onPointerMove={onMove}
                onPointerUp={onUp}
                onPointerCancel={onUp}
              />
            </>
          ) : null}
        </div>
      </div>

      {/* de-emphasised fallback controls, overlaid so they never shrink the book */}
      {opened ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 px-4 pb-1">
          <button
            type="button"
            onClick={() => go("prev")}
            disabled={!canPrev}
            aria-label="Previous page"
            className="tap-flat pointer-events-auto grid size-8 place-items-center rounded-full text-muted-foreground/60 disabled:opacity-25"
          >
            <ChevronLeft className="size-4" />
          </button>
          <p className="truncate text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground/70">
            {labels[index]} · {index + 1}/{spreads.length}
          </p>
          <button
            type="button"
            onClick={() => go("next")}
            disabled={!canNext}
            aria-label="Next page"
            className="tap-flat pointer-events-auto grid size-8 place-items-center rounded-full text-muted-foreground/60 disabled:opacity-25"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      ) : null}
    </div>
  );
}

/** One physical leaf: warm stock, grain, gutter shading, scrollable content. */
function Leaf({ side, children }: { side: "left" | "right"; children: ReactNode }) {
  return (
    <div className="pp-paper pp-grain relative h-full w-full overflow-hidden">
      <div className="relative z-10 h-full w-full overflow-y-auto overscroll-contain scrollbar-none px-3.5 py-4">
        {children}
      </div>
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 z-20 ${side === "left" ? "pp-shade-l" : "pp-shade-r"}`}
      />
    </div>
  );
}
