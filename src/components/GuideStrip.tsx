import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { Guide } from "@/lib/guides";

/**
 * Guide teaser shaped exactly like a For You widget tile (square or wide)
 * but boxless — no background, no border, no shadow. Editorial breathing
 * room inside the mosaic.
 */
export function GuideStrip({
  guide,
  wide = false,
  index = 0,
  className = "",
}: {
  guide: Guide;
  wide?: boolean;
  index?: number;
  className?: string;
}) {
  return (
    <Link
      to="/guides/$id"
      params={{ id: guide.id }}
      style={{ animationDelay: `${Math.min(index, 6) * 45}ms` }}
      className={`tap-flat animate-fade-in flex flex-col overflow-hidden p-1 text-left ${
        wide ? "col-span-2 min-h-[8.5rem]" : "aspect-square"
      } ${className}`}
    >
      <div className="flex items-center gap-1.5">
        <span className="text-[13px] leading-none">{guide.emoji}</span>
        <span className="truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {categoryLabel(guide.category)}
        </span>
      </div>

      <div className="mt-2 flex min-h-0 flex-1 flex-col justify-between">
        <div className="min-h-0">
          <h3 className="line-clamp-2 text-[15px] font-bold leading-[1.2]">{guide.title}</h3>
          <p className={`mt-1 text-[11px] leading-snug text-muted-foreground ${wide ? "line-clamp-2" : "line-clamp-2"}`}>
            {guide.blurb}
          </p>
        </div>
        <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
          See more <ArrowRight className="size-3.5" />
        </span>
      </div>
    </Link>
  );
}
