import { Pin, PinOff, Eye, EyeOff, ArrowUp, ArrowDown, X, RotateCcw } from "lucide-react";
import { WIDGETS } from "@/lib/widgets";
import { haptic, type ForYouPrefs } from "@/lib/foryou-prefs";

export function ForYouSettings({
  open,
  onClose,
  prefs,
  togglePin,
  toggleHide,
  move,
  setSize,
  reset,
}: {
  open: boolean;
  onClose: () => void;
  prefs: ForYouPrefs;
  togglePin: (id: string) => void;
  toggleHide: (id: string) => void;
  move: (id: string, dir: -1 | 1) => void;
  setSize: (s: ForYouPrefs["size"]) => void;
  reset: () => void;
}) {
  if (!open) return null;

  const ordered = [
    ...prefs.pinned.map((id) => WIDGETS.find((w) => w.id === id)).filter(Boolean),
    ...WIDGETS.filter((w) => !prefs.pinned.includes(w.id)),
  ] as typeof WIDGETS;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 bg-foreground/40 backdrop-blur-[2px]" />
      <div className="relative max-h-[80vh] w-full max-w-[430px] animate-fade-in overflow-y-auto rounded-t-[1.75rem] border border-border bg-card pb-8 shadow-lift">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-5 py-4">
          <div>
            <p className="text-sm font-bold">Customise For You</p>
            <p className="text-xs text-muted-foreground">Pin, hide and reorder your widgets</p>
          </div>
          <button onClick={onClose} className="tap-flat rounded-full bg-muted p-2" aria-label="Close">
            <X className="size-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 px-5 py-4">
          <span className="text-xs font-semibold text-muted-foreground">Size</span>
          {(["compact", "expanded"] as const).map((s) => (
            <button
              key={s}
              onClick={() => {
                haptic();
                setSize(s);
              }}
              className={`tap rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${
                prefs.size === s ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
          <button onClick={reset} className="tap-flat ml-auto flex items-center gap-1 text-xs font-semibold text-muted-foreground">
            <RotateCcw className="size-3.5" /> Reset
          </button>
        </div>

        <ul className="px-3 pb-2">
          {ordered.map((w) => {
            const pinned = prefs.pinned.includes(w.id);
            const hidden = prefs.hidden.includes(w.id);
            return (
              <li
                key={w.id}
                className={`mb-2 flex items-center gap-3 rounded-2xl border border-border px-3 py-2.5 ${hidden ? "opacity-50" : ""}`}
              >
                <span className="text-xl">{w.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{w.title}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {hidden ? "Hidden" : pinned ? "Pinned to the front" : "Ordered automatically"}
                  </p>
                </div>
                {pinned && !hidden ? (
                  <span className="flex flex-col">
                    <button onClick={() => move(w.id, -1)} className="tap-flat p-0.5" aria-label={`Move ${w.title} up`}>
                      <ArrowUp className="size-3.5" />
                    </button>
                    <button onClick={() => move(w.id, 1)} className="tap-flat p-0.5" aria-label={`Move ${w.title} down`}>
                      <ArrowDown className="size-3.5" />
                    </button>
                  </span>
                ) : null}
                <button
                  onClick={() => {
                    haptic();
                    togglePin(w.id);
                  }}
                  className={`tap rounded-xl p-2 ${pinned ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                  aria-label={pinned ? `Unpin ${w.title}` : `Pin ${w.title}`}
                >
                  {pinned ? <PinOff className="size-4" /> : <Pin className="size-4" />}
                </button>
                <button
                  onClick={() => {
                    haptic();
                    toggleHide(w.id);
                  }}
                  className="tap rounded-xl bg-muted p-2"
                  aria-label={hidden ? `Show ${w.title}` : `Hide ${w.title}`}
                >
                  {hidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
