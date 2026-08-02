/**
 * The member's private document vault, reusable either whole (Documents app)
 * or narrowed to the categories one paperwork app cares about.
 */

import { useRef, useState } from "react";
import { FileText, Loader2, ShieldCheck, Trash2, Upload } from "lucide-react";
import { Card } from "@/components/AppShell";
import { DOC_CATEGORIES, docCategory, type DocCategoryId } from "@/lib/official-content";
import { UPLOAD_ACCEPT, useOfficial } from "@/lib/useOfficial";

function size(bytes: number | null) {
  if (bytes == null) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function DocumentVault({
  categories,
  initial,
  compact = false,
}: {
  /** Which categories to offer. Defaults to all of them. */
  categories?: DocCategoryId[];
  initial?: DocCategoryId;
  compact?: boolean;
}) {
  const list = categories?.length
    ? DOC_CATEGORIES.filter((c) => categories.includes(c.id))
    : DOC_CATEGORIES;
  const { documents, loading, upload, saveDocument, removeDocument } = useOfficial();
  const [category, setCategory] = useState<DocCategoryId>(initial ?? list[0]?.id ?? "passport");
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const busy = upload.isPending || saveDocument.isPending;

  const shown = documents.filter((d) => d.category === category);
  const meta = docCategory(category);

  async function pick(file: File | null) {
    if (!file) return;
    setError(null);
    try {
      const result = await upload.mutateAsync({ category, file });
      await saveDocument.mutateAsync({
        category,
        label: file.name.replace(/\.[^.]+$/, "").slice(0, 160) || meta.label,
        storagePath: result.path,
        mimeType: result.contentType,
        byteSize: result.size,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong — try again.");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="space-y-4">
      {list.length > 1 ? (
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          {list.map((c) => {
            const count = documents.filter((d) => d.category === c.id).length;
            const on = c.id === category;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className={`tap-flat shrink-0 rounded-full px-3.5 py-2 text-[12.5px] font-semibold ${
                  on ? "bg-ink text-ink-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {c.emoji} {c.label}
                {count ? <span className={`ml-1.5 ${on ? "opacity-70" : ""}`}>{count}</span> : null}
              </button>
            );
          })}
        </div>
      ) : null}

      <Card className="space-y-3">
        <div>
          <p className="text-[15px] font-bold leading-tight">
            {meta.emoji} {meta.label}
          </p>
          <p className="mt-0.5 text-[12.5px] leading-snug text-muted-foreground">{meta.hint}</p>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept={UPLOAD_ACCEPT}
          className="hidden"
          onChange={(e) => void pick(e.target.files?.[0] ?? null)}
        />
        <button
          type="button"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
          className="tap flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-[13.5px] font-bold text-primary-foreground disabled:opacity-60"
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
          {busy ? "Uploading…" : `Add a ${meta.label.toLowerCase()} file`}
        </button>
        <p className="text-[11.5px] text-muted-foreground">PDF or photo, up to 20 MB.</p>
        {error ? <p className="text-[12px] font-semibold text-destructive">{error}</p> : null}
      </Card>

      {loading ? (
        <p className="px-1 text-[13px] text-muted-foreground">Opening your vault…</p>
      ) : shown.length ? (
        <Card className="p-0">
          {shown.map((d) => (
            <div key={d.id} className="flex items-start gap-3 border-b border-border p-4 last:border-0">
              <FileText className="mt-0.5 size-4 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                {d.url ? (
                  <a
                    href={d.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block truncate text-[13.5px] font-semibold text-foreground underline decoration-border"
                  >
                    {d.label}
                  </a>
                ) : (
                  <p className="truncate text-[13.5px] font-semibold">{d.label}</p>
                )}
                <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                  Added {fmt(d.createdAt)}
                  {d.byteSize ? ` · ${size(d.byteSize)}` : ""}
                  {d.expiresOn ? ` · expires ${fmt(d.expiresOn)}` : ""}
                </p>
              </div>
              <button
                type="button"
                aria-label={`Delete ${d.label}`}
                onClick={() => removeDocument.mutate(d.id)}
                className="tap-flat rounded-full p-2 text-muted-foreground"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </Card>
      ) : (
        <p className="px-1 text-[13px] leading-relaxed text-muted-foreground">
          Nothing here yet. Add your {meta.label.toLowerCase()} file and it'll be one tap away at the office.
        </p>
      )}

      {compact ? null : (
        <div className="flex items-start gap-2.5 rounded-2xl bg-muted px-4 py-3">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
          <p className="text-[12px] leading-relaxed text-muted-foreground">
            Files live in a private area only your account can open. Links expire after an hour, so reopen this screen if
            a file won't load.
          </p>
        </div>
      )}
    </div>
  );
}
