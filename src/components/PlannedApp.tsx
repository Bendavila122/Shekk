import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Clock, Plug, ListChecks, Route as RouteIcon, MessageCircle } from "lucide-react";
import { AppShell, Card, ScreenHeader } from "@/components/AppShell";
import { plannedApp } from "@/lib/planned-apps";
import { MiniAppIcon } from "@/components/MiniAppIcon";
import { MINI_APPS } from "@/lib/mini-apps";

/** Small section wrapper so every planned app reads identically. */
function Block({
  Icon,
  title,
  children,
}: {
  Icon: typeof Clock;
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="mb-2 flex items-center gap-2 px-1">
        <Icon className="size-4 text-muted-foreground" />
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{title}</h2>
      </div>
      {children}
    </section>
  );
}

/**
 * The honest stand-in for a mini app we have designed but not yet integrated.
 * No invented data, no dead buttons — just what it will do, what it runs on,
 * what is blocking it and where it sits in the build order.
 */
export function PlannedApp({ id, children }: { id: string; children?: ReactNode }) {
  const app = plannedApp(id);
  const mini = MINI_APPS.find((m) => m.id === id) ?? null;
  if (!app) return null;

  return (
    <AppShell>
      <ScreenHeader title={app.title} subtitle="Not live yet" />

      <div className="space-y-6 px-4 py-4">
        <Card className="flex items-start gap-4">
          {mini ? <MiniAppIcon app={mini} size={56} /> : null}
          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <Clock className="size-3" /> In the build queue
            </span>
            <p className="mt-2 text-sm font-semibold leading-snug">{app.promise}</p>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              We would rather show you the plan than a screen of made-up listings. Here is exactly what this app will
              do and what it depends on.
            </p>
          </div>
        </Card>

        {children}

        <Block Icon={ListChecks} title="What it will do">
          <Card>
            <ul className="space-y-2.5">
              {app.capabilities.map((c) => (
                <li key={c} className="flex gap-2.5 text-sm leading-snug">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </Card>
        </Block>

        <Block Icon={Plug} title="What it runs on">
          <div className="space-y-2">
            {app.dependencies.map((d) => (
              <Card key={d.name}>
                <p className="text-sm font-semibold">{d.name}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{d.role}</p>
              </Card>
            ))}
          </div>
        </Block>

        <Block Icon={Clock} title="What's holding it up">
          <Card>
            <ul className="space-y-2.5">
              {app.blockers.map((b) => (
                <li key={b} className="flex gap-2.5 text-sm leading-snug">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-warning" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </Card>
        </Block>

        <Block Icon={RouteIcon} title="Where it sits">
          <Card className="text-sm leading-relaxed text-muted-foreground">{app.sequencing}</Card>
        </Block>

        <Link to="/help" className="tap block">
          <Card className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <MessageCircle className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">Want this sooner?</span>
              <span className="block text-xs text-muted-foreground">
                Tell us and we'll move it up — and chase the partner.
              </span>
            </span>
            <span className="text-sm font-semibold text-primary">→</span>
          </Card>
        </Link>
      </div>
    </AppShell>
  );
}
