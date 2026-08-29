/**
 * The passport as one physical object — a calendar-bound booklet.
 *
 * Closed, you see a large upright portrait booklet. Tapping it pulls the camera
 * back a touch, then visibly rotates the WHOLE closed booklet 90deg in the
 * plane of the screen until it lies sideways, and finally hinges its cover away
 * around the long HORIZONTAL spine — like opening a calendar or a top-bound
 * notebook. Open, it is two leaves stacked TOP and BOTTOM around a horizontal
 * gutter, and page turns flip over that same horizontal spine.
 *
 * One DOM object persists through closed → diagonal → sideways → half-open, so
 * the motion is a real physical turn rather than a fade or a component swap.
 */
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { haptic } from "@/lib/foryou-prefs";

/** The two physical leaves of one spread, stacked vertically when open. */
export type Leaves = { top: ReactNode; bottom: ReactNode };

type Dir = "next" | "prev";
type Phase = "closed" | "pull" | "turn" | "settle" | "hinge";

/** Release past this much travel and the turn completes. */
const COMMIT = 0.3;
const DURATION = 460;

/* Opening choreography: pull back, turn 90deg flat, hold, then hinge open. */
const PULL = 200;
const TURN = 760;
const SETTLE = 160;
const HINGE = 950;

/** A single leaf is landscape 1.414:1, so the open spread (two stacked) is
 *  W x 1.414W and the closed booklet is exactly one leaf stood on its end. */
const LEAF_RATIO = 1.414;

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
  /** The closed cover face; hinges away on the horizontal spine when opening. */
  cover: ReactNode;
  opened: boolean;
  onOpen: () => void;
}) {
  const box = useRef<HTMLDivElement | null>(null);
  const [fit, setFit] = useState({ w: 0, leaf: 0, cw: 0, ch: 0 });
  const [phase, setPhase] = useState<Phase>("closed");
  /* The hinge is tweened in JS so the printed face can be swapped for the
     endpaper at exactly 90deg — an ancestor 2D rotate defeats CSS backface
     culling here, and a keyframe gives no progress to read. */
  const [hingeA, setHingeA] = useState(0);
  const hingeRaf = useRef<number | null>(null);
  const timers = useRef<number[]>([]);

  /* Fit the whole open spread (W wide, 2 leaves tall) inside the available box. */
  useEffect(() => {
    const el = box.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const measure = () => {
      const cw = el.clientWidth;
      const ch = el.clientHeight;
      const w = Math.min(cw * 0.97, (ch * 0.95) / LEAF_RATIO, 620);
      setFit({ w: Math.round(w), leaf: Math.round(w / LEAF_RATIO), cw, ch });
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

  const drag = useRef<{ x: number; y: number; h: number; dir: Dir | null; active: boolean; locked: boolean }>({
    x: 0,
    y: 0,
    h: 1,
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

  /* The turn is tweened in JS: the leaf that paints swaps at the midpoint, so a
     CSS transition on either element would be interrupted. */
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
      setAnimating(true);
      const start = performance.now();
      const fromP = pRef.current;
      const span = Math.abs(target - fromP);
      /* Reduced motion still turns the page — just briskly, with no flourish. */
      const ms = Math.max(120, (reducedMotion() ? 180 : DURATION) * span);

      const step = (now: number) => {
        const t = Math.min(1, (now - start) / ms);
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

  useEffect(
    () => () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    },
    [],
  );

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
    drag.current = { x: e.clientX, y: e.clientY, h: fit.leaf || 1, dir: null, active: true, locked: false };
  };

  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d.active || d.locked) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (!d.dir) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      // Horizontal intent is not a page turn on a calendar binding.
      if (Math.abs(dx) > Math.abs(dy)) {
        d.locked = true;
        return;
      }
      // Flick up to go forward, down to go back.
      const wanted: Dir = dy < 0 ? "next" : "prev";
      if (wanted === "next" && !canNext) return;
      if (wanted === "prev" && !canPrev) return;
      d.dir = wanted;
      setDir(wanted);
    }
    const raw = d.dir === "next" ? -dy : dy;
    const t = Math.max(0, Math.min(1, raw / d.h));
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

  const base = dir === "prev" ? index - 1 : index;
  const from = spreads[base] ?? spreads[index];
  const to = spreads[base + 1] ?? from;
  const lift = Math.sin(Math.PI * Math.min(Math.max(p, 0), 1));
  /* Past halfway the turning leaf has landed on the other side of the spine. */
  const flipped = p > 0.5;

  const leafH = fit.leaf;
  const stageH = leafH * 2;

  /* ---- opening choreography ----
     The closed booklet IS one leaf stood upright: leafH wide x W tall, with the
     cover art upright inside it. The turn rotates that same element 90deg, so
     the art turns with the object and it lands exactly on the top-leaf slot. */
  const closedScale = Math.min((fit.cw * 0.88) / (leafH || 1), (fit.ch * 0.82) / (fit.w || 1), 1.15) || 1;
  const pulled = closedScale * 0.9;
  /* Mid-turn the diagonal is widest; shrink just enough to keep corners on a
     narrow phone. Lives in the same keyframe as the rotation so the two cannot
     cancel out. */
  const diagonal = (leafH + fit.w) / 1.414 || 1;
  const midScale = Math.min(pulled, (fit.cw * 0.96) / diagonal);

  const spinning = phase === "turn" || phase === "settle" || phase === "hinge";
  const spinStyle: React.CSSProperties = spinning
    ? {
        ["--pp-s1" as string]: pulled.toFixed(3),
        ["--pp-sm" as string]: midScale.toFixed(3),
        animation: `pp-spin ${TURN}ms cubic-bezier(0.5,0.02,0.24,1) both`,
      }
    : {
        transform: `rotate(0deg) scale(${(phase === "pull" ? pulled : closedScale).toFixed(3)})`,
        transition: phase === "pull" ? `transform ${PULL}ms cubic-bezier(0.33,0,0.2,1)` : undefined,
      };

  const HINGE_END = 172;
  const runHinge = useCallback(() => {
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / HINGE);
      // ease-in-out: the cover lifts, sweeps, then lands
      const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      setHingeA(HINGE_END * e);
      if (t < 1) hingeRaf.current = requestAnimationFrame(step);
    };
    hingeRaf.current = requestAnimationFrame(step);
  }, []);

  useEffect(
    () => () => {
      if (hingeRaf.current) cancelAnimationFrame(hingeRaf.current);
    },
    [],
  );

  const startOpening = () => {
    if (phase !== "closed") return;
    haptic(14);
    /* Reduced motion keeps the same physical beats, just much quicker. */
    const k = reducedMotion() ? 0.3 : 1;
    setSpeed(k);
    const pull = PULL * k;
    const turn = TURN * k;
    const settleMs = SETTLE * k;
    const hinge = HINGE * k;
    setPhase("pull");
    timers.current.push(
      window.setTimeout(() => setPhase("turn"), pull),
      window.setTimeout(() => {
        setPhase("settle");
        haptic(10);
      }, pull + turn),
      window.setTimeout(() => {
        setPhase("hinge");
        runHinge(hinge);
      }, pull + turn + settleMs),
      window.setTimeout(onOpen, pull + turn + settleMs + hinge - 60 * k),
    );
  };


  /* The interior waits underneath from the moment the booklet lies flat, so the
     hinge reveals it rather than cross-fading to it. */
  const bookVisible = opened || phase === "settle" || phase === "hinge";
  const coverMounted = !opened && fit.w > 0;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div ref={box} className="relative grid min-h-0 flex-1 place-items-center overflow-hidden">
        <div className="pp-stage relative select-none" style={{ width: fit.w, height: stageH }}>
          {/* ---------- the two static leaves, stacked ---------- */}
          <div
            className="pp-book absolute inset-0 grid grid-rows-2 overflow-hidden rounded-[10px]"
            style={{ opacity: bookVisible ? 1 : 0 }}
          >
            <Leaf side="top">{from.top}</Leaf>
            <Leaf side="bottom">{dir ? to.bottom : from.bottom}</Leaf>
          </div>

          {/* shadow the lifting leaf casts across the page it uncovers */}
          {dir ? (
            <div
              aria-hidden
              className={`pointer-events-none absolute inset-x-0 z-[5] ${flipped ? "top-0" : "bottom-0"}`}
              style={{
                height: leafH,
                background: `linear-gradient(${flipped ? 0 : 180}deg, rgba(44,30,10,${(0.22 * lift).toFixed(
                  3,
                )}) 0%, rgba(44,30,10,0) ${Math.round(70 - 40 * Math.abs(p - 0.5) * 2)}%)`,
              }}
            />
          ) : null}

          {/* ---------- the turning leaf ----------
              Two halves of the same motion around the horizontal centre spine,
              swapped at the midpoint so no face is ever backface-culled. */}
          {dir && !flipped ? (
            <div
              className="pp-leaf absolute inset-x-0 bottom-0 z-10 overflow-hidden rounded-b-[10px]"
              style={{
                height: leafH,
                transformOrigin: "center top",
                transform: `rotateX(${p * 180}deg)`,
                boxShadow: `0 ${Math.round(lift * -5)}px ${Math.round(10 + lift * 16)}px rgba(46,32,12,${(
                  0.06 + lift * 0.12
                ).toFixed(3)})`,
              }}
            >
              <Leaf side="bottom">{from.bottom}</Leaf>
            </div>
          ) : null}
          {dir && flipped ? (
            <div
              className="pp-leaf absolute inset-x-0 top-0 z-10 overflow-hidden rounded-t-[10px]"
              style={{
                height: leafH,
                transformOrigin: "center bottom",
                transform: `rotateX(${-(1 - p) * 180}deg)`,
                boxShadow: `0 ${Math.round(lift * 5)}px ${Math.round(10 + lift * 16)}px rgba(46,32,12,${(
                  0.06 + lift * 0.12
                ).toFixed(3)})`,
              }}
            >
              <Leaf side="top">{to.top}</Leaf>
            </div>
          ) : null}

          {/* centre gutter + outer page edges: the book as a physical object */}
          {bookVisible ? (
            <>
              <div aria-hidden className="pp-gutter-h pointer-events-none absolute inset-x-0 top-1/2 z-20 h-6 -translate-y-1/2" />
              <div aria-hidden className="pp-edge-h pointer-events-none absolute inset-x-2 top-0 z-20 h-[5px] rounded-t-[4px]" />
              <div aria-hidden className="pp-edge-h pointer-events-none absolute inset-x-2 bottom-0 z-20 h-[5px] rounded-b-[4px]" />
            </>
          ) : null}

          {/* ---------- the closed booklet ----------
              One element mounted from closed all the way through the hinge, at
              full opacity: portrait art inside, rotated bodily to sideways, then
              swung away around its (now horizontal) spine. */}
          {coverMounted ? (
            <div
              aria-hidden={phase === "hinge"}
              className="absolute left-1/2 z-30"
              style={{
                top: 0,
                width: fit.w,
                height: leafH,
                perspective: "1500px",
                transform: `translateX(-50%) translateY(${phase === "closed" || phase === "pull" ? leafH / 2 : 0}px)`,
                transition: `transform ${TURN}ms cubic-bezier(0.5,0.02,0.24,1)`,
                ...(phase === "hinge"
                  ? { opacity: Math.max(0, Math.min(1, (HINGE_END - hingeA) / 22)) }
                  : null),
              }}
            >
              <div
                className="pp-leaf absolute inset-0 grid place-items-center"
                style={{ transformOrigin: "center center", ...spinStyle }}
              >
                {/* The booklet itself: portrait, art upright, hinged on the edge
                    that becomes the horizontal spine once it has turned. */}
                <div
                  className="pp-leaf absolute"
                  style={{
                    width: leafH,
                    height: fit.w,
                    transformOrigin: "right center",
                    transform: `rotateY(${phase === "hinge" ? hingeA.toFixed(2) : 0}deg)`,
                    boxShadow:
                      phase === "hinge"
                        ? `0 ${Math.round(Math.sin((hingeA * Math.PI) / 180) * 14)}px 30px rgba(20,16,40,0.3)`
                        : undefined,
                  }}
                >
                  {phase === "hinge" && hingeA > 90 ? (
                    /* the reverse of the same leaf: plain endpaper */
                    <span
                      aria-hidden
                      className="pp-paper pp-grain absolute inset-0 block overflow-hidden rounded-[12px]"
                      style={{ boxShadow: "0 -10px 26px rgba(24,20,40,0.28)" }}
                    />
                  ) : (
                    <button
                      type="button"
                      aria-label="Open your Shekk Passport"
                      onClick={startOpening}
                      data-pp-cover
                      className="pp-cover absolute inset-0 block overflow-hidden rounded-[12px] text-left"
                    >
                      {cover}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : null}

          {/* idle invitation: a hint of depth under the bottom outer edge */}
          {opened && !dir && canNext ? (
            <div
              aria-hidden
              className="pointer-events-none absolute bottom-0 right-0 z-20 h-8 w-16 rounded-br-[10px]"
              style={{ boxShadow: "inset -8px -8px 12px rgba(46,32,12,0.1)" }}
            />
          ) : null}

          {/* gesture surface: the outer horizontal edges catch flicks. */}
          {opened ? (
            <>
              <div
                className="absolute inset-x-0 top-0 z-[25] h-[12%]"
                style={{ touchAction: "none" }}
                onPointerDown={onDown}
                onPointerMove={onMove}
                onPointerUp={onUp}
                onPointerCancel={onUp}
              />
              <div
                className="absolute inset-x-0 bottom-0 z-[25] h-[12%]"
                style={{ touchAction: "none" }}
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
            <ChevronUp className="size-4" />
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
            <ChevronDown className="size-4" />
          </button>
        </div>
      ) : null}
    </div>
  );
}

/** One physical leaf: warm stock, grain, gutter shading. Never scrollable —
 *  a real page cannot scroll, so every spread is laid out to fit. */
function Leaf({ side, children }: { side: "top" | "bottom"; children: ReactNode }) {
  return (
    <div className="pp-paper pp-grain relative h-full w-full overflow-hidden">
      <div className="relative z-10 h-full w-full overflow-hidden px-4 py-3.5">
        {children}
      </div>

      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 z-20 ${side === "top" ? "pp-shade-t" : "pp-shade-b"}`}
      />
    </div>
  );
}
