/**
 * Programme UI primitives shared by the participant hub and the staff console.
 *
 * Mobile-first and one-handed: sheets slide from the bottom, actions are big,
 * and nothing here decides permissions — it only reflects what the server said.
 */

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { StatusPill } from "@/components/Kit";
import {
  POST_LABEL,
  STATUS_LABEL,
  statusTone,
  updatedAgo,
  type Audience,
  type EventStatus,
  type ProgrammeEvent,
  type PostKind,
  type ProgrammeGroup,
} from "@/lib/programme/logic";

export function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export function fmtDay(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

export function fmtDayLong(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
}

export function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fromLocalInput(value: string): string {
  return new Date(value).toISOString();
}

/* ───────────────────────────────── Bottom sheet ───────────────────────────── */

export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-ink/50" />
      <div className="relative max-h-[88vh] w-full max-w-[430px] overflow-y-auto rounded-t-[1.75rem] bg-background pb-[max(1rem,env(safe-area-inset-bottom))] shadow-lift">
        <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background px-4 py-3">
          <p className="min-w-0 flex-1 truncate font-display text-base font-bold">{title}</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="tap-flat flex size-9 items-center justify-center rounded-full bg-muted"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="px-4 py-4">{children}</div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────── Chips ────────────────────────────────── */

export function StatusChip({ status }: { status: EventStatus }) {
  return <StatusPill tone={statusTone(status)}>{STATUS_LABEL[status]}</StatusPill>;
}

export function Freshness({ event }: { event: ProgrammeEvent }) {
  const label = updatedAgo(event.lastChangedAt);
  if (!label) return null;
  return <span className="text-[11px] font-semibold text-warning-foreground">{label}</span>;
}

export function AudienceChip({ audience, groups }: { audience: Audience; groups: ProgrammeGroup[] }) {
  if (audience.kind === "everyone") {
    return <span className="text-[11px] font-semibold text-muted-foreground">Everyone</span>;
  }
  const names =
    audience.kind === "groups"
      ? audience.groupIds.map((id) => groups.find((g) => g.id === id)?.name ?? "Group").join(", ")
      : `${audience.userIds.length} ${audience.userIds.length === 1 ? "person" : "people"}`;
  return <span className="text-[11px] font-semibold text-primary">{names || "Selected"}</span>;
}

/* ──────────────────────────────── Form controls ───────────────────────────── */

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {children}
      {hint ? <span className="mt-1 block text-[11px] text-muted-foreground">{hint}</span> : null}
    </label>
  );
}

export const inputClass =
  "w-full rounded-2xl bg-muted px-4 py-3 text-[15px] font-medium outline-none focus:ring-2 focus:ring-primary/40";

export function Toggle({
  label,
  checked,
  onChange,
  hint,
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  hint?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="tap-flat flex w-full items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-left"
    >
      <span className="min-w-0 flex-1">
        <span className="block text-[13.5px] font-semibold">{label}</span>
        {hint ? <span className="mt-0.5 block text-[11px] text-muted-foreground">{hint}</span> : null}
      </span>
      <span
        className={`flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors ${
          checked ? "bg-primary" : "bg-muted-foreground/30"
        }`}
      >
        <span
          className={`size-5 rounded-full bg-card shadow-card transition-transform ${checked ? "translate-x-5" : ""}`}
        />
      </span>
    </button>
  );
}

export function ActionButton({
  children,
  onClick,
  tone = "primary",
  disabled = false,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  tone?: "primary" | "ghost" | "danger";
  disabled?: boolean;
  className?: string;
}) {
  const tones = {
    primary: "bg-primary text-primary-foreground",
    ghost: "border border-border bg-card text-foreground",
    danger: "border border-destructive/30 bg-destructive/10 text-destructive",
  } as const;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`tap rounded-2xl px-4 py-3 text-[13.5px] font-bold disabled:opacity-50 ${tones[tone]} ${className}`}
    >
      {children}
    </button>
  );
}

/** Everyone / groups / individuals, used by every audience-targeted creator. */
export function AudiencePicker({
  value,
  onChange,
  groups,
  people,
}: {
  value: Audience;
  onChange: (next: Audience) => void;
  groups: ProgrammeGroup[];
  people: { userId: string; name: string }[];
}) {
  const set = (patch: Partial<Audience>) => onChange({ ...value, ...patch });
  const kinds: Audience["kind"][] = ["everyone", "groups", "individuals"];
  const labels: Record<Audience["kind"], string> = {
    everyone: "Everyone",
    groups: "Groups",
    individuals: "People",
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        {kinds.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => set({ kind: k })}
            className={`tap-flat flex-1 rounded-xl border px-3 py-2 text-[12.5px] font-bold ${
              value.kind === k ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"
            }`}
          >
            {labels[k]}
          </button>
        ))}
      </div>

      {value.kind === "groups" ? (
        groups.length === 0 ? (
          <p className="text-[11px] text-muted-foreground">No groups yet — create one in Groups first.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {groups.map((g) => {
              const on = value.groupIds.includes(g.id);
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() =>
                    set({ groupIds: on ? value.groupIds.filter((x) => x !== g.id) : [...value.groupIds, g.id] })
                  }
                  className={`tap-flat rounded-full border px-3 py-1.5 text-[12px] font-semibold ${
                    on ? "border-primary bg-primary-soft text-primary" : "border-border bg-card"
                  }`}
                >
                  {g.name}
                </button>
              );
            })}
          </div>
        )
      ) : null}

      {value.kind === "individuals" ? (
        people.length === 0 ? (
          <p className="text-[11px] text-muted-foreground">Nobody has joined this cohort yet.</p>
        ) : (
          <div className="max-h-48 space-y-1 overflow-y-auto rounded-2xl border border-border p-2">
            {people.map((p) => {
              const on = value.userIds.includes(p.userId);
              return (
                <button
                  key={p.userId}
                  type="button"
                  onClick={() =>
                    set({ userIds: on ? value.userIds.filter((x) => x !== p.userId) : [...value.userIds, p.userId] })
                  }
                  className={`tap-flat flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[13px] font-semibold ${
                    on ? "bg-primary-soft text-primary" : ""
                  }`}
                >
                  {p.name}
                  {on ? <span aria-hidden>✓</span> : null}
                </button>
              );
            })}
          </div>
        )
      ) : null}
    </div>
  );
}

/** Inline, honest error text for a failed mutation. */
export function ErrorText({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return <p className="text-[12px] font-semibold text-destructive">{children}</p>;
}

/* ─────────────────────────────── V2 primitives ────────────────────────────── */

/** Chunky segmented control — the only tab pattern Programme V2 uses. */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: readonly { value: T; label: string; badge?: number }[];
  onChange: (next: T) => void;
}) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={`tap-flat flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-[12.5px] font-bold ${
            value === o.value
              ? "bg-ink text-ink-foreground"
              : "border border-border bg-card text-muted-foreground"
          }`}
        >
          {o.label}
          {o.badge ? (
            <span className="rounded-full bg-destructive px-1.5 text-[10px] font-bold text-destructive-foreground">
              {o.badge}
            </span>
          ) : null}
        </button>
      ))}
    </div>
  );
}

/** What kind of post this is, in one word. */
export function KindChip({ kind }: { kind: PostKind }) {
  const tone =
    kind === "urgent"
      ? "attention"
      : kind === "confirmation"
        ? "pending"
        : kind === "announcement"
          ? "quiet"
          : "live";
  return <StatusPill tone={tone}>{POST_LABEL[kind]}</StatusPill>;
}

/** A soft, tappable row used for to-dos and quick actions. */
export function TapRow({
  title,
  detail,
  onClick,
  tone = "plain",
}: {
  title: string;
  detail?: string;
  onClick: () => void;
  tone?: "plain" | "urgent";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`tap flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left shadow-card ${
        tone === "urgent" ? "border-destructive/40 bg-destructive/5" : "border-border bg-card"
      }`}
    >
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13.5px] font-semibold">{title}</span>
        {detail ? <span className="block text-[11.5px] text-muted-foreground">{detail}</span> : null}
      </span>
      <span aria-hidden className="text-[13px] font-bold text-primary">
        →
      </span>
    </button>
  );
}
