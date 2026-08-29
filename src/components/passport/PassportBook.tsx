/**
 * The open passport: a true landscape two-leaf book.
 *
 * At rest you see the left leaf, the centre gutter and the right leaf of one
 * spread. Turning forward rotates ONLY the right leaf around the centre spine;
 * its backside is the next spread's left page, and the next spread's right page
 * is revealed underneath. Going back mirrors that. One rigid paper leaf, one
 * transform per frame — no curl simulation, no whole-spread rotation.
 */
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { haptic } from "@/lib/foryou-prefs";

export type Leaves = { left: ReactNode; right: ReactNode };

type Dir = "next" | "prev";

/** Release past this much travel and the turn completes. */
const COMMIT = 0.3;
const DURATION = 460;
const OPENING = 620;
/** Overall open-book ratio: a small passport opened flat. */
const BOOK_RATIO = 1.46;

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
  /** The closed cover face; hinges away on the centre spine when opening. */
  cover: ReactNode;
  opened: boolean;
  onOpen: () => void;
}) {
  const box = useRef<HTMLDivElement | null>(null);
  const [fit, setFit] = useState({ w: 0, h: 0 });
  const [opening, setOpening] = useState(false);

  // Fit the whole landscape book inside whatever space is left, both
  // dimensions respected, so it is never clipped on a phone.
  useEffect(() => {
    const el = box.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const measure = () => {
      const w = Math.min(el.clientWidth, el.clientHeight * BOOK_RATIO, 720);
      setFit({ w: Math.round(w), h: Math.round(w / BOOK_RATIO) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

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
  const [animating, setAnimating] = useState(false);

  const canNext = index < spreads.length - 1;
  const canPrev = index > 0;

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
      if (reducedMotion()) {
        finish();
        return;
      }
      setAnimating(true);
      setP(d === "next" ? (commit ? 1 : 0) : commit ? 0 : 1);
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
  const angle = -(dir ? p : 0) * 180;
  const lift = Math.sin(Math.PI * Math.min(Math.max(p, 0), 1));

  const leafW = fit.w / 2;
  /* Past the halfway point the leaf shows its reverse side. */
  const flipped = p > 0.5;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div ref={box} className="relative grid min-h-0 flex-1 place-items-center overflow-hidden">
        <div
          className="pp-stage relative select-none"
          style={{
            width: fit.w,
            height: fit.h,
            // Closed, the single cover leaf sits centred; opening slides the
            // book back to centre as the cover hinges away.
            transform: opened ? "translateX(0)" : "translateX(25%)",
            transition: opening ? `transform ${OPENING}ms cubic-bezier(0.32,0.78,0.22,1)` : "none",
          }}
        >
          {/* ---------- the two static leaves ---------- */}
          <div
            className="pp-book absolute inset-0 grid grid-cols-2 overflow-hidden rounded-[10px]"
            style={{ opacity: opened || opening ? 1 : 0 }}
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

          {/* ---------- the turning leaf ---------- */}
          {dir ? (
            <div
              className="pp-leaf absolute inset-y-0 right-0 z-10"
              style={{
                width: leafW,
                transformOrigin: "left center",
                transform: `rotateY(${angle}deg)`,
                transition: animating ? `transform ${DURATION}ms cubic-bezier(0.3,0.7,0.25,1)` : "none",
              }}
            >
              {/* One face, content swapped at the halfway point and un-mirrored:
                  before halfway you see the right page you are lifting, after
                  it you see the next spread's left page printed on the reverse.
                  Deterministic — no reliance on backface culling. */}
              <div
                className="pp-face absolute inset-0 overflow-hidden"
                style={{
                  transform: flipped ? "scaleX(-1)" : "none",
                  borderRadius: flipped ? "10px 0 0 10px" : "0 10px 10px 0",
                  boxShadow: `0 ${Math.round(lift * 5)}px ${Math.round(10 + lift * 16)}px rgba(46,32,12,${(
                    0.06 + lift * 0.12
                  ).toFixed(3)})`,
                }}
              >
                <Leaf side={flipped ? "left" : "right"}>{flipped ? to.left : from.right}</Leaf>
              </div>
            </div>
          ) : null}

          {/* centre gutter + outer page edges: the book as an object */}
          {opened || opening ? (
            <>
              <div aria-hidden className="pp-gutter pointer-events-none absolute inset-y-0 left-1/2 z-20 w-6 -translate-x-1/2" />
              <div aria-hidden className="pp-edge pp-edge-r pointer-events-none absolute inset-y-2 right-0 z-20 w-[5px]" />
              <div aria-hidden className="pp-edge pp-edge-l pointer-events-none absolute inset-y-2 left-0 z-20 w-[5px]" />
            </>
          ) : null}

          {/* ---------- the cover, hinged on the centre spine ---------- */}
          {!opened ? (
            <button
              type="button"
              aria-label="Open your Shekk Passport"
              onClick={() => {
                if (opening) return;
                haptic(14);
                if (reducedMotion()) {
                  onOpen();
                  return;
                }
                setOpening(true);
                window.setTimeout(onOpen, OPENING);
              }}
              className="pp-leaf pp-cover absolute inset-y-0 right-0 z-30 overflow-hidden rounded-r-[12px] text-left"
              style={{
                width: leafW,
                transformOrigin: "left center",
                transform: opening ? "rotateY(-180deg)" : "rotateY(0deg)",
                transition: opening ? `transform ${OPENING}ms cubic-bezier(0.32,0.78,0.22,1)` : "none",
                backfaceVisibility: "hidden",
              }}
            >
              {cover}
            </button>
          ) : null}

          {/* idle invitation: a hint of depth under the outer corner */}
          {opened && !dir && canNext ? (
            <div
              aria-hidden
              className="pointer-events-none absolute bottom-0 right-0 z-20 size-8 rounded-br-[10px]"
              style={{ boxShadow: "inset -8px -8px 12px rgba(46,32,12,0.1)" }}
            />
          ) : null}

          {/* gesture surface, above the paper but under nothing interactive on
              the leaves: only the outer third of each leaf catches flicks. */}
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

      {/* de-emphasised fallback controls: flicking is the primary gesture */}
      {opened ? (
        <div className="flex shrink-0 items-center justify-between gap-3 px-5 pb-1 pt-3">
          <button
            type="button"
            onClick={() => go("prev")}
            disabled={!canPrev}
            aria-label="Previous page"
            className="tap-flat grid size-8 place-items-center rounded-full text-muted-foreground/70 disabled:opacity-25"
          >
            <ChevronLeft className="size-4" />
          </button>
          <p className="truncate text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground/80">
            {labels[index]} · {index + 1}/{spreads.length}
          </p>
          <button
            type="button"
            onClick={() => go("next")}
            disabled={!canNext}
            aria-label="Next page"
            className="tap-flat grid size-8 place-items-center rounded-full text-muted-foreground/70 disabled:opacity-25"
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
