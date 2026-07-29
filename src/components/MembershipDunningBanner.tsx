import { Link } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";
import { useSubscription } from "@/lib/useSubscription";

/**
 * Dunning banner — shown while a Shekk+ renewal is failing. Access stays live
 * during the retry window, so the copy nudges rather than alarms.
 */
export function MembershipDunningBanner() {
  const { subscription } = useSubscription();
  if (!subscription) return null;
  if (!["past_due", "unpaid"].includes(subscription.status)) return null;

  const ends = subscription.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString(undefined, {
        day: "numeric",
        month: "long",
      })
    : null;

  return (
    <Link to="/membership" className="tap-flat block px-4 pt-3">
      <div className="flex items-start gap-2.5 rounded-2xl border border-warning/30 bg-warning-soft px-3.5 py-3">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
        <p className="text-xs leading-snug">
          <span className="block font-semibold">Shekk+ payment didn&rsquo;t go through</span>
          <span className="block text-muted-foreground">
            Update your card to keep your membership
            {ends ? ` — benefits stay live until ${ends}` : ""}.
          </span>
        </p>
      </div>
    </Link>
  );
}
