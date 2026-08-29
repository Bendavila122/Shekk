/**
 * The book. A stack of pages you flick through with a real page-turn: the top
 * page swings around the spine on the left, revealing the page beneath.
 *
 * Deliberately hand-rolled with pointer events + CSS 3D transforms — no new
 * animation dependency, and nothing heavier than one transform per frame.
 */
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { haptic } from "@/lib/foryou-prefs";

type Dir = "next" | "prev";

/** Page turn feels right at ~30% of the width. */
const COMMIT = 0.3;

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
          haptic(10);
        }
      };
      if (reducedMotion()) {
        finish();
        return;
      }
      setAnimating(true);
      setP(commit ? 1 : 0);
      window.setTimeout(finish, 420);
    },
    [index, onIndex],
  );

  const go = useCallback(
    (d: Dir) => {
      if (animating) return;
      if (d === "next" && !canNext) return;
      if (d === "prev" && !canPrev) return;
      setDir(d);
      setP(0);
      // next frame so the 0 state paints before we animate to 1
      requestAnimationFrame(() => settle(d, true));
    },
    [animating, canNext, canPrev, settle],
  );

  const onDown = (e: React.PointerEvent) => {
    if (animating) return;
    drag.current = { x: e.clientX, w: stage.current?.clientWidth ?? 1, dir: null, active: true };
  };

  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d.active) return;
    const dx = e.clientX - d.x;
    if (!d.dir) {
      if (Math.abs(dx) < 8) return;
      const wanted: Dir = dx < 0 ? "next" : "prev";
      if (wanted === "next" && !canNext) return;
      if (wanted === "prev" && !canPrev) return;
      d.dir = wanted;
      setDir(wanted);
    }
    const raw = d.dir === "next" ? -dx : dx;
    setP(Math.max(0, Math.min(1, raw / (d.w * 0.75))));
  };

  const onUp = () => {
    const d = drag.current;
    d.active = false;
    if (!d.dir) return;
    const chosen = d.dir;
    d.dir = null;
    settle(chosen, p > COMMIT);
  };

  // Keyboard for desktop / accessibility
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go("next");
      if (e.key === "ArrowLeft") go("prev");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  /* Which page sits underneath, and which one is turning on top. */
  const underIndex = dir === "next" ? index + 1 : index;
  const turnIndex = dir === "prev" ? index - 1 : index;
  const angle = dir === "prev" ? -(1 - p) * 180 : -p * 180;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* The book keeps a passport-ish proportion and sits centred, so a tall
          phone never stretches a spread into a column of empty paper. */}
      <div className="grid min-h-0 flex-1 place-items-center">
      <div
        ref={stage}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        className="pp-stage relative aspect-[10/13] max-h-full w-full touch-pan-y select-none"
      >
        {/* page underneath */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl shadow-lift">
          <Sheet>{pages[underIndex]}</Sheet>
        </div>

        {/* turning page */}
        {dir ? (
          <div
            className="pp-page absolute inset-0 overflow-hidden rounded-2xl shadow-lift"
            style={{
              transformOrigin: "left center",
              transform: `rotateY(${angle}deg)`,
              transition: animating ? "transform 420ms cubic-bezier(0.3,0.8,0.25,1)" : "none",
            }}
          >
            <Sheet>{pages[turnIndex]}</Sheet>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{ background: `linear-gradient(90deg, rgba(0,0,0,${0.28 * (1 - p)}), transparent 45%)` }}
            />
          </div>
        ) : null}

        {/* spine + page edge, so the book reads as a physical object */}
        <div aria-hidden className="pp-spine pointer-events-none absolute inset-y-0 left-1/2 z-20 w-6 -translate-x-1/2" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-3 right-0 z-20 w-1.5 rounded-r-md"
          style={{
            backgroundImage:
              "repeating-linear-gradient(180deg, oklch(0.88 0.02 84), oklch(0.88 0.02 84) 2px, oklch(0.78 0.03 84) 2px, oklch(0.78 0.03 84) 3px)",
          }}
        />
      </div>
      </div>

      {/* flick controls */}
      <div className="flex items-center justify-between gap-3 px-4 pb-3 pt-3">
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
