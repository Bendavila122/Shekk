/**
 * Shekk UI kit.
 *
 * One place for the patterns that used to be re-invented on every screen:
 * page headers, section headers, empty states, loading states, status pills
 * and honest "preview" labelling. Screens should compose these rather than
 * hand-rolling their own type scale and spacing.
 */

import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/** Big screen title used at the top of a tab root. */
export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <header className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 px-5 pb-1 pt-7">
      <div className="min-w-0">
        <h1 className="font-display text-[2rem] font-bold leading-tight tracking-tight">{title}</h1>
        {subtitle ? (
          <p className="mt-1 text-[13px] leading-snug text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}

/** Section label with an optional hint and a right-hand action. */
export function SectionHead({
  title,
  hint,
  action,
  className = "",
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mb-3 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 px-1 ${className}`}>
      <div className="min-w-0">
        <h2 className="font-display text-[17px] font-bold leading-tight tracking-tight">{title}</h2>
        {hint ? <p className="mt-0.5 text-[12px] leading-snug text-muted-foreground">{hint}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/** The one small-caps label used across the app. */
export function MicroLabel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`block text-[11px] font-bold uppercase tracking-[0.14em] ${className}`}>{children}</span>
  );
}

/** Every "nothing here yet" state on every screen looks like this. */
export function EmptyState({
  icon: Icon,
  title,
  body,
  actionLabel,
  actionTo,
}: {
  icon?: LucideIcon;
  title: string;
  body: string;
  actionLabel?: string;
  actionTo?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card px-5 py-8 text-center shadow-card">
      {Icon ? (
        <span className="mx-auto mb-3 flex size-11 items-center justify-center rounded-2xl bg-muted text-foreground/60">
          <Icon className="size-5" />
        </span>
      ) : null}
      <p className="text-sm font-semibold">{title}</p>
      <p className="mx-auto mt-1 max-w-[17rem] text-[12.5px] leading-relaxed text-muted-foreground">{body}</p>
      {actionLabel && actionTo ? (
        <Link
          to={actionTo}
          className="tap mt-4 inline-flex rounded-full bg-primary px-4 py-2 text-[12.5px] font-semibold text-primary-foreground"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

/** Skeleton rows — used instead of the old bare "Loading…" text. */
export function LoadingBlocks({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3 px-4 pt-6" aria-busy="true" aria-live="polite">
      <div className="h-28 animate-pulse rounded-[1.5rem] bg-muted" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-16 animate-pulse rounded-2xl bg-muted" style={{ opacity: 1 - i * 0.18 }} />
      ))}
      <span className="sr-only">Loading your Shekk</span>
    </div>
  );
}

type Tone = "live" | "pending" | "preview" | "attention" | "quiet";

const TONES: Record<Tone, string> = {
  live: "bg-success-soft text-success",
  pending: "bg-primary-soft text-primary",
  preview: "bg-muted text-muted-foreground",
  attention: "bg-warning-soft text-warning-foreground",
  quiet: "bg-muted text-muted-foreground",
};

/** Status of a thing — verification, card, integration. Never decorative. */
export function StatusPill({
  tone = "quiet",
  children,
  icon: Icon,
  className = "",
}: {
  tone?: Tone;
  children: ReactNode;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] ${TONES[tone]} ${className}`}
    >
      {Icon ? <Icon className="size-3.5" /> : null}
      {children}
    </span>
  );
}

/** Honest labelling for anything not yet wired to a live partner. */
export function PreviewBadge({ label = "Preview", className = "" }: { label?: string; className?: string }) {
  return (
    <StatusPill tone="preview" className={className}>
      {label}
    </StatusPill>
  );
}

/**
 * A milestone worth celebrating — kept deliberately rare so it still means
 * something. Soft scale-in, no confetti.
 */
export function Milestone({
  title,
  body,
  actionLabel,
  actionTo,
}: {
  title: string;
  body: string;
  actionLabel?: string;
  actionTo?: string;
}) {
  return (
    <div className="grad-premium relative animate-in overflow-hidden rounded-[1.5rem] p-4 text-ink-foreground shadow-lift duration-500 zoom-in-95">
      <span className="card-sheen pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-ink-foreground/15 ring-4 ring-ink-foreground/10">
          <Sparkles className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold leading-snug">{title}</p>
          <p className="mt-0.5 text-[12.5px] leading-relaxed opacity-85">{body}</p>
          {actionLabel && actionTo ? (
            <Link to={actionTo} className="tap-flat mt-2 inline-block text-[12px] font-bold uppercase tracking-wide">
              {actionLabel} →
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
