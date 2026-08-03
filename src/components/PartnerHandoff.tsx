import type { ReactNode } from "react";
import { ArrowUpRight, Clock, LifeBuoy } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { AppShell, Card, ScreenHeader } from "@/components/AppShell";
import { MicroLabel } from "@/components/Kit";

export type Partner = {
  name: string;
  blurb: string;
  /** Where the member actually completes this today, outside Shekk. */
  url: string;
  emoji: string;
  cost?: string;
};

/**
 * The honest stand-in for anything Shekk does not yet do itself.
 *
 * Nothing here touches money. It explains what the service is, what it
 * usually costs, and hands the member straight to the app that can do it
 * today — instead of simulating a checkout against their balance.
 */
export function PartnerHandoff({
  title,
  subtitle,
  back = "/israel",
  headline,
  blurb,
  partners,
  tips,
  children,
}: {
  title: string;
  subtitle?: string;
  back?: string;
  headline: string;
  blurb: string;
  partners: Partner[];
  tips?: string[];
  children?: ReactNode;
}) {
  return (
    <AppShell>
      <ScreenHeader title={title} subtitle={subtitle ?? "Not in Shekk yet"} back={back} />

      <header className="px-4 pt-3">
        <div className="rounded-[1.5rem] border border-notice-border bg-notice-soft px-5 py-5 text-notice-foreground">
          <MicroLabel className="inline-flex items-center gap-1.5 opacity-80">
            <Clock className="size-3.5" /> Not live in Shekk
          </MicroLabel>
          <p className="mt-2 font-display text-[1.6rem] font-bold leading-tight tracking-tight">{headline}</p>
          <p className="mt-1.5 text-[12.5px] leading-relaxed opacity-90">{blurb}</p>
        </div>
      </header>

      <section className="px-4 pt-5">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          What students actually use
        </p>
        <div className="space-y-2.5">
          {partners.map((p) => (
            <a
              key={p.name}
              href={p.url}
              target="_blank"
              rel="noreferrer noopener"
              className="tap block"
            >
              <Card className="flex items-start gap-3">
                <span className="text-xl leading-none">{p.emoji}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{p.name}</span>
                    {p.cost ? (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                        {p.cost}
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{p.blurb}</span>
                  <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                    Open {p.name} <ArrowUpRight className="size-3.5" />
                  </span>
                </span>
              </Card>
            </a>
          ))}
        </div>
      </section>

      {tips?.length ? (
        <section className="px-4 pt-5">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Worth knowing
          </p>
          <Card className="space-y-2">
            {tips.map((t) => (
              <p key={t} className="text-[12.5px] leading-relaxed text-muted-foreground">
                {t}
              </p>
            ))}
          </Card>
        </section>
      ) : null}

      {children ? <div className="px-4 pt-5">{children}</div> : null}

      <div className="px-4 pb-10 pt-5">
        <Link
          to="/help"
          className="tap-flat flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-semibold"
        >
          <LifeBuoy className="size-4 text-muted-foreground" /> Questions about this? Get help
        </Link>
      </div>
    </AppShell>
  );
}
