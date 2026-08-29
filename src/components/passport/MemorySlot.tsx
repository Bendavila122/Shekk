/**
 * The memory slot: one photo per city, presented as a printed photo taped into
 * a scrapbook rather than an upload control. Editable, replaceable, removable.
 */
import { useRef, useState } from "react";
import { Camera, Pencil, Trash2 } from "lucide-react";
import { haptic } from "@/lib/foryou-prefs";
import { readPhotoAsDataUrl, type PassportCity } from "@/lib/passport";

export function MemorySlot({
  city,
  photo,
  caption,
  onChange,
}: {
  city: PassportCity;
  photo?: string;
  caption?: string;
  onChange: (photo?: string, caption?: string) => void;
}) {
  const input = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(caption ?? "");

  async function pick(file?: File | null) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const data = await readPhotoAsDataUrl(file);
      onChange(data, caption);
      haptic(12);
    } catch {
      setError("That photo couldn't be read. Try another one.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative mx-auto w-full max-w-[15rem]">
      {/* tape corners */}
      <span aria-hidden className="pp-tape absolute -left-3 -top-2 z-20 h-5 w-12 -rotate-12 rounded-[2px]" />
      <span aria-hidden className="pp-tape absolute -right-3 -top-2 z-20 h-5 w-12 rotate-12 rounded-[2px]" />

      <div
        className="rounded-[6px] bg-white p-2 pb-3 shadow-lift"
        style={{ transform: "rotate(-1.4deg)" }}
      >
        <button
          type="button"
          onClick={() => input.current?.click()}
          className="tap-flat relative block aspect-[4/3] w-full overflow-hidden rounded-[3px]"
          style={{ backgroundColor: city.wash }}
          aria-label={photo ? `Replace your ${city.name} photo` : `Add a photo from ${city.name}`}
        >
          {photo ? (
            <img src={photo} alt={caption || `Your memory from ${city.name}`} className="h-full w-full object-cover" />
          ) : (
            <span className="absolute inset-0 grid place-items-center gap-1 text-center">
              <span className="grid place-items-center gap-1 px-3">
                <Camera className="mx-auto size-6" style={{ color: city.ink }} />
                <span className="text-[11px] font-semibold" style={{ color: city.ink }}>
                  {busy ? "Developing…" : "Slide a photo in here"}
                </span>
              </span>
            </span>
          )}
        </button>

        {editing ? (
          <input
            autoFocus
            value={draft}
            maxLength={80}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => {
              setEditing(false);
              onChange(photo, draft.trim() || undefined);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            }}
            placeholder="A line about this day…"
            className="mt-2 w-full bg-transparent px-1 text-center font-display text-sm outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setDraft(caption ?? "");
              setEditing(true);
            }}
            className="tap-flat mt-2 flex w-full items-center justify-center gap-1.5 px-1"
          >
            <span className="truncate font-display text-sm text-ink/85">
              {caption || "Write a caption"}
            </span>
            <Pencil className="size-3 shrink-0 opacity-40" />
          </button>
        )}
      </div>

      {photo ? (
        <div className="mt-3 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => input.current?.click()}
            className="tap-flat text-[11px] font-semibold uppercase tracking-widest"
            style={{ color: city.ink }}
          >
            Replace
          </button>
          <button
            type="button"
            onClick={() => {
              onChange(undefined, caption);
              haptic(8);
            }}
            className="tap-flat inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground"
          >
            <Trash2 className="size-3" /> Remove
          </button>
        </div>
      ) : null}

      {error ? <p className="mt-2 text-center text-[11px] text-destructive">{error}</p> : null}

      <input
        ref={input}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          void pick(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}
