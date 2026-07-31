/**
 * The insurance card object: a premium wallet card that a member can hold up at
 * a clinic desk. "Show at clinic" goes full-screen, brightens the sheet and
 * puts the member number in the largest type on the screen, because that is the
 * one thing reception needs to read off your phone.
 */

import { useState } from "react";
import type { InsuranceCard } from "@/lib/health.server";
import { provider } from "@/lib/health";
import { ServiceLogo } from "@/components/ServiceLogo";

function fmtDate(value: string | null) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
}

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard?.writeText(value).then(() => {
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1400);
        });
      }}
      className="tap flex w-full items-center justify-between gap-3 rounded-xl bg-muted/60 px-3 py-2 text-left"
    >
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="font-mono text-sm font-semibold">{copied ? "Copied" : value}</span>
    </button>
  );
}

export function InsuranceCardTile({
  card,
  onEdit,
  onDelete,
}: {
  card: InsuranceCard;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const [show, setShow] = useState(false);
  const [side, setSide] = useState<"front" | "back">("front");
  const meta = provider(card.providerId);
  const expiry = fmtDate(card.validUntil);
  const expired = card.validUntil ? new Date(card.validUntil) < new Date() : false;

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-3xl bg-ink p-5 text-ink-foreground shadow-card">
        <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-primary/25 blur-2xl" />
        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-widest opacity-60">
              {card.isPrimary ? "Primary cover" : "Health cover"}
            </p>
            <p className="mt-1 truncate font-display text-xl font-bold">{card.providerName}</p>
            {card.plan && <p className="truncate text-sm opacity-80">{card.plan}</p>}
          </div>
          <ServiceLogo
            service={{ name: card.providerName, emoji: meta?.emoji ?? "🩺", domain: meta?.domain }}
            size={40}
            className="rounded-xl bg-white/95"
          />
        </div>

        <div className="relative mt-5 grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-[11px] uppercase tracking-widest opacity-60">Member no.</p>
            <p className="font-mono font-semibold">{card.memberNumber ?? "—"}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-widest opacity-60">Group</p>
            <p className="font-mono font-semibold">{card.groupNumber ?? "—"}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-widest opacity-60">Holder</p>
            <p className="truncate font-semibold">{card.policyHolder ?? "—"}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-widest opacity-60">Valid until</p>
            <p className={`font-semibold ${expired ? "text-destructive" : ""}`}>
              {expiry ?? "—"}
              {expired ? " · expired" : ""}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setShow(true)}
          className="tap flex-1 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
        >
          Show at clinic
        </button>
        {card.hotline && (
          <a
            href={`tel:${card.hotline.replace(/\s/g, "")}`}
            className="tap rounded-2xl border border-border bg-card px-4 py-3 text-sm font-semibold"
          >
            Call insurer
          </a>
        )}
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="tap rounded-2xl border border-border bg-card px-4 py-3 text-sm font-semibold"
          >
            Edit
          </button>
        )}
      </div>

      {card.covers && <p className="text-xs text-muted-foreground">{card.covers}</p>}

      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="tap text-xs font-medium text-destructive underline"
        >
          Remove this card
        </button>
      )}

      {show && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background p-5">
          <div className="flex items-center justify-between">
            <p className="font-display text-lg font-bold">{card.providerName}</p>
            <button
              type="button"
              onClick={() => setShow(false)}
              className="tap rounded-full border border-border px-4 py-2 text-sm font-semibold"
            >
              Done
            </button>
          </div>

          <div className="mt-6 space-y-4">
            <div className="rounded-3xl border border-border bg-card p-5 text-center">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Member number</p>
              <p className="mt-2 break-all font-mono text-3xl font-bold">{card.memberNumber ?? "—"}</p>
              {card.plan && <p className="mt-2 text-sm text-muted-foreground">{card.plan}</p>}
            </div>

            {card.groupNumber && <CopyRow label="Group" value={card.groupNumber} />}
            {card.policyHolder && <CopyRow label="Policy holder" value={card.policyHolder} />}
            {card.hotline && <CopyRow label="Assistance" value={card.hotline} />}
            {expiry && <CopyRow label="Valid until" value={expiry} />}

            {(card.frontUrl || card.backUrl) && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  {(["front", "back"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSide(s)}
                      disabled={s === "front" ? !card.frontUrl : !card.backUrl}
                      className={`tap flex-1 rounded-xl px-3 py-2 text-sm font-semibold disabled:opacity-30 ${
                        side === s ? "bg-ink text-ink-foreground" : "border border-border bg-card"
                      }`}
                    >
                      {s === "front" ? "Front" : "Back"}
                    </button>
                  ))}
                </div>
                <img
                  src={(side === "front" ? card.frontUrl : card.backUrl) ?? ""}
                  alt={`${card.providerName} card ${side}`}
                  className="w-full rounded-2xl border border-border object-contain"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
