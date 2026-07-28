import { Snowflake } from "lucide-react";
import { ils } from "@/lib/mock";

/**
 * The Shekk Mastercard face. Purely presentational — issuing state and
 * controls live in the store, the partner issuer lives in lib/banking.
 */
export function ShekkCardFace({
  name,
  last4,
  expiry,
  balance,
  frozen = false,
  showNumber = false,
  className = "",
}: {
  name: string;
  last4: string;
  expiry: string;
  balance: number;
  frozen?: boolean;
  showNumber?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`relative aspect-[1.586/1] w-full overflow-hidden rounded-[1.5rem] p-5 text-ink-foreground shadow-lift transition-transform duration-500 ${
        frozen ? "grad-card-frozen" : "grad-card"
      } ${className}`}
    >
      <span className="card-sheen pointer-events-none absolute inset-0" aria-hidden />

      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-display text-xl font-bold tracking-[0.2em]">SHEKK</p>
            <p className="text-[10px] uppercase tracking-widest opacity-70">
              {frozen ? "Frozen" : "Virtual · Israel"}
            </p>
          </div>
          {frozen ? (
            <Snowflake className="size-6 opacity-90" />
          ) : (
            <span className="flex items-center" aria-label="Mastercard">
              <span className="size-7 rounded-full bg-notice/90" />
              <span className="-ml-3 size-7 rounded-full bg-notice-border/80 mix-blend-screen" />
            </span>
          )}
        </div>

        <div>
          <p className="font-mono text-base tracking-[0.18em] opacity-95">
            {showNumber ? "5412  7719  0084  " : "••••  ••••  ••••  "}
            {last4}
          </p>
          <div className="mt-3 flex items-end justify-between">
            <div>
              <p className="text-[9px] uppercase tracking-widest opacity-60">Cardholder</p>
              <p className="text-sm font-semibold uppercase tracking-wide">{name}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] uppercase tracking-widest opacity-60">Balance</p>
              <p className="font-display text-lg font-bold leading-none">{ils(balance)}</p>
              <p className="text-[9px] uppercase tracking-widest opacity-60">exp {expiry}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
