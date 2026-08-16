/**
 * The one Shekk+ upsell.
 *
 * /membership is the single upsell destination and /benefits is the catalogue
 * you reach from it. Every place in the app that nudges towards Shekk+ renders
 * this component, so the funnel reads as one offer rather than six ad-hoc
 * prompts with six different styles.
 */

import { Link } from "@tanstack/react-router";
import { ArrowRight, Crown } from "lucide-react";

export function MembershipUpsell({
  title = "Unlock everything with Shekk+",
  body,
  cta = "See what's included",
}: {
  title?: string;
  body: string;
  cta?: string;
}) {
  return (
    <Link to="/membership" className="tap block">
      <div className="grad-premium relative overflow-hidden rounded-2xl p-4 text-ink-foreground shadow-card">
        <span className="card-sheen pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative flex items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-ink-foreground/15">
            <Crown className="size-4.5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold leading-snug">{title}</p>
            <p className="mt-0.5 text-xs leading-relaxed opacity-85">{body}</p>
            <span className="mt-1.5 inline-flex items-center gap-1 text-[11.5px] font-bold">
              {cta} <ArrowRight className="size-3.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
