import { Link } from "@tanstack/react-router";
import { LifeBuoy, ShieldCheck } from "lucide-react";

/**
 * The support entry point that every money screen carries.
 *
 * Members should never have to hunt for a human when their money is involved,
 * so this row appears on the wallet, top up, send, split and card screens.
 */
export function SupportRow({ className = "" }: { className?: string }) {
  return (
    <Link
      to="/help"
      className={`tap-flat flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 ${className}`}
    >
      <LifeBuoy className="size-4 shrink-0 text-muted-foreground" />
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-semibold">Something wrong with your money?</span>
        <span className="block text-[11.5px] text-muted-foreground">
          Help, FAQs and how to reach a person
        </span>
      </span>
    </Link>
  );
}

/**
 * A plain-English statement of what the wallet is and is not, used wherever a
 * member might assume Shekk is a bank.
 */
export function WalletStatusNote({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border border-border bg-muted/50 px-4 py-3 ${className}`}
    >
      <ShieldCheck className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <p className="text-[11.5px] leading-relaxed text-muted-foreground">
        Your balance is real money in shekels, held with our regulated payment partner. Shekk is not a bank and
        does not lend. Adding money and paying other members are live; the Shekk card is still in preview.
      </p>
    </div>
  );
}
