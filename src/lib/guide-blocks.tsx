import { Link, type LinkProps } from "@tanstack/react-router";
import { ChevronRight, Info, Lightbulb, PiggyBank, TriangleAlert } from "lucide-react";
import type { GuideBlock } from "@/lib/guides";

const TONE = {
  tip: { Icon: Lightbulb, wrap: "bg-primary-soft text-foreground", chip: "text-primary" },
  warn: { Icon: TriangleAlert, wrap: "bg-destructive/10 text-foreground", chip: "text-destructive" },
  money: { Icon: PiggyBank, wrap: "bg-success/10 text-foreground", chip: "text-success" },
} as const;

/** One content block inside a guide section. */
export function GuideBlockView({
  block,
  checked,
  onCheck,
}: {
  block: GuideBlock;
  checked?: number[];
  onCheck?: (index: number) => void;
}) {
  switch (block.kind) {
    case "p":
      return <p className="text-[13.5px] leading-relaxed text-muted-foreground">{block.text}</p>;

    case "steps":
      return (
        <ol className="space-y-2.5">
          {block.items.map((item, i) => (
            <li key={item} className="flex gap-3">
              <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary-soft text-[11px] font-bold text-primary">
                {i + 1}
              </span>
              <span className="text-[13.5px] leading-relaxed text-muted-foreground">{item}</span>
            </li>
          ))}
        </ol>
      );

    case "checklist":
      return (
        <ul className="space-y-1.5">
          {block.items.map((item, i) => {
            const on = checked?.includes(i) ?? false;
            return (
              <li key={item}>
                <button
                  type="button"
                  onClick={() => onCheck?.(i)}
                  className="tap-flat flex w-full items-start gap-3 rounded-xl px-2 py-1.5 text-left"
                >
                  <span
                    className={`mt-0.5 grid size-[18px] shrink-0 place-items-center rounded-[6px] border text-[11px] font-bold ${
                      on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"
                    }`}
                  >
                    {on ? "✓" : ""}
                  </span>
                  <span
                    className={`text-[13.5px] leading-relaxed ${
                      on ? "text-muted-foreground line-through" : "text-foreground"
                    }`}
                  >
                    {item}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      );

    case "note": {
      const { Icon, wrap, chip } = TONE[block.tone];
      return (
        <div className={`rounded-2xl p-3.5 ${wrap}`}>
          <p className={`flex items-center gap-1.5 text-[12px] font-bold ${chip}`}>
            <Icon className="size-4 shrink-0" />
            {block.title}
          </p>
          <p className="mt-1 text-[13px] leading-relaxed">{block.text}</p>
        </div>
      );
    }

    case "facts":
      return (
        <dl className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {block.rows.map((r) => (
            <div key={r.label} className="flex items-start gap-3 px-3.5 py-2.5">
              <dt className="w-[38%] shrink-0 text-[12px] font-semibold leading-snug">{r.label}</dt>
              <dd className="flex-1 text-[12.5px] leading-snug text-muted-foreground">{r.value}</dd>
            </div>
          ))}
        </dl>
      );

    case "hebrew":
      return (
        <div className="space-y-2">
          {block.rows.map((r) => (
            <div key={r.en} className="rounded-2xl bg-muted px-3.5 py-2.5">
              <p className="text-[12px] font-semibold">{r.en}</p>
              <p dir="rtl" className="mt-0.5 text-[15px] leading-snug">
                {r.he}
              </p>
              <p className="text-[11.5px] italic text-muted-foreground">{r.say}</p>
            </div>
          ))}
        </div>
      );

    case "link":
      return (
        <Link
          to={block.to as LinkProps["to"]}
          params={block.params as never}
          className="tap flex items-center gap-3 rounded-2xl border border-border bg-card px-3.5 py-3 shadow-card"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
            <Info className="size-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-semibold leading-tight">{block.label}</span>
            <span className="block truncate text-[11.5px] text-muted-foreground">{block.sub}</span>
          </span>
          <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
        </Link>
      );
  }
}
