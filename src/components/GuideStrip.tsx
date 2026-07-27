import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { Guide } from "@/lib/guides";

/**
 * Boxless guide teaser — no card, no border. Just a header, a tiny
 * description and a see-more affordance. Designed to breathe between tiles.
 */
export function GuideStrip({ guide, className = "" }: { guide: Guide; className?: string }) {
  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <span className="mt-0.5 text-xl leading-none">{guide.emoji}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {guide.kicker} · {guide.readMins} min read
        </p>
        <h3 className="mt-0.5 text-[15px] font-bold leading-tight">{guide.title}</h3>
        <p className="mt-1 text-[12px] leading-snug text-muted-foreground">{guide.blurb}</p>
        <Link
          to="/guides/$id"
          params={{ id: guide.id }}
          className="tap-flat mt-2 inline-flex items-center gap-1 text-[12px] font-semibold text-primary"
        >
          See more <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}
