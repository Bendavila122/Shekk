import { Snowflake } from "lucide-react";

/**
 * The Shekk Mastercard face. Purely presentational — issuing state and
 * controls live in the store, the partner issuer lives in lib/banking.
 *
 * `compact` renders the same design at thumbnail scale (wallet row) with the
 * type dialled down so nothing clips inside the smaller frame.
 */
export function ShekkCardFace({
  name,
  last4,
  expiry,
  frozen = false,
  showNumber = false,
  compact = false,
  className = "",
}: {
  name: string;
  last4: string;
  expiry: string;
  /** @deprecated balance lives in the wallet header, not on the card face. */
  balance?: number;
  frozen?: boolean;
  showNumber?: boolean;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`relative aspect-[1.586/1] w-full overflow-hidden text-ink-foreground transition-transform duration-500 ${
        compact ? "rounded-xl p-2.5 shadow-card" : "rounded-[1.5rem] p-5 shadow-lift"
      } ${frozen ? "grad-card-frozen" : "grad-card"} ${className}`}
    >
      <span className="card-sheen pointer-events-none absolute inset-0" aria-hidden />

      <div className="relative flex h-full flex-col justify-between">
        {/* Top row: brand + scheme */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p
              className={`font-display font-bold leading-none tracking-[0.22em] ${
                compact ? "text-[9px]" : "text-lg"
              }`}
            >
              SHEKK
            </p>
            {!compact ? (
              <p className="mt-1.5 text-[9px] uppercase tracking-[0.18em] opacity-65">
                {frozen ? "Frozen" : "Mastercard · Israel"}
              </p>
            ) : null}
          </div>

          {frozen ? (
            <Snowflake className={compact ? "size-3 opacity-90" : "size-5 opacity-90"} />
          ) : (
            <span className="flex shrink-0 items-center" aria-label="Mastercard">
              <span className={`${compact ? "size-3" : "size-6"} rounded-full bg-notice/90`} />
              <span
                className={`${compact ? "-ml-1 size-3" : "-ml-2.5 size-6"} rounded-full bg-notice-border/80 mix-blend-screen`}
              />
            </span>
          )}
        </div>

        {/* Chip */}
        {!compact ? (
          <div className="flex items-center gap-2">
            <span className="h-6 w-8 rounded-[5px] bg-ink-foreground/25 ring-1 ring-inset ring-ink-foreground/30" />
            <span className="h-4 w-3 rounded-sm border border-ink-foreground/25 opacity-60" />
          </div>
        ) : null}

        {/* Bottom block: number + holder */}
        <div className="min-w-0">
          <p
            className={`truncate font-mono opacity-95 ${
              compact ? "text-[8px] tracking-[0.08em]" : "text-[15px] tracking-[0.16em]"
            }`}
          >
            {showNumber ? "5412 7719 0084 " : "•••• •••• •••• "}
            {last4}
          </p>

          <div className={`flex items-end justify-between gap-3 ${compact ? "mt-1" : "mt-3"}`}>
            <div className="min-w-0">
              {compact ? null : (
                <>
                  <p className="text-[8px] uppercase tracking-[0.18em] opacity-55">Cardholder</p>
                  <p className="mt-0.5 truncate text-[13px] font-semibold uppercase tracking-wide">{name}</p>
                </>
              )}
            </div>
            <div className="shrink-0 text-right">
              {!compact ? (
                <p className="text-[8px] uppercase tracking-[0.18em] opacity-55">Expires</p>
              ) : null}
              <p className={`font-mono ${compact ? "text-[8px]" : "mt-0.5 text-[13px]"}`}>{expiry}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
