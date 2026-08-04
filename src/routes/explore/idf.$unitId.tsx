import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Compass, Target, Wrench } from "lucide-react";
import { AppShell, Card, Notice, ScreenHeader } from "@/components/AppShell";
import { MicroLabel, SectionHead } from "@/components/Kit";
import { BRANCHES, UNITS, unitOf, type Unit } from "@/lib/idf-content";

export const Route = createFileRoute("/explore/idf/$unitId")({
  loader: ({ params }) => {
    const unit = unitOf(params.unitId);
    if (!unit) throw notFound();
    return { unit };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Unit not found · Shekk" }, { name: "robots", content: "noindex" }] };
    }
    const u = loaderData.unit;
    return {
      meta: [
        { title: `${u.name} · IDF Explorer · Shekk` },
        { name: "description", content: `${u.tagline}. ${u.overview}` },
        { property: "og:title", content: `${u.name} · IDF Explorer` },
        { property: "og:description", content: u.tagline },
        { property: "og:type", content: "profile" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  notFoundComponent: UnitNotFound,
  component: UnitProfile,
});

function UnitNotFound() {
  return (
    <AppShell>
      <ScreenHeader title="IDF Explorer" back="/explore/army" />
      <div className="px-4 pt-6">
        <Card className="text-center">
          <Compass className="mx-auto size-6 text-muted-foreground" />
          <p className="mt-2 text-sm font-semibold">That unit isn't in the explorer</p>
          <Link to="/explore/army" className="mt-3 inline-block text-[12.5px] font-bold text-primary">
            Browse every branch →
          </Link>
        </Card>
      </div>
    </AppShell>
  );
}

function Pills({ title, items, icon: Icon }: { title: string; items: string[]; icon: typeof Target }) {
  return (
    <section>
      <SectionHead title={title} />
      <Card className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-[12px] font-semibold"
          >
            <Icon className="size-3.5 text-primary" />
            {item}
          </span>
        ))}
      </Card>
    </section>
  );
}

function UnitProfile() {
  const { unit } = Route.useLoaderData() as { unit: Unit };
  const branch = BRANCHES.find((b) => b.id === unit.branch)!;
  const related = unit.related.map(unitOf).filter(Boolean) as Unit[];
  const siblings = UNITS.filter((u) => u.branch === unit.branch && u.id !== unit.id);

  return (
    <AppShell>
      <ScreenHeader title={unit.name} back="/explore/army" />

      <header className="px-4 pt-2">
        <div
          className="relative overflow-hidden rounded-[1.5rem] px-5 py-5 text-ink-foreground shadow-lift"
          style={{ backgroundImage: branch.grad }}
        >
          <span className="card-sheen pointer-events-none absolute inset-0" aria-hidden />
          <div className="relative">
            <MicroLabel className="opacity-70">
              {branch.emoji} {branch.name}
            </MicroLabel>
            <p className="mt-2 font-display text-[1.9rem] font-bold leading-tight tracking-tight">
              <span className="mr-2" aria-hidden>
                {unit.emoji}
              </span>
              {unit.name}
            </p>
            {unit.hebrew ? (
              <p dir="rtl" className="mt-1 text-[15px] font-semibold opacity-85">
                {unit.hebrew}
              </p>
            ) : null}
            <p className="mt-2 text-[12.5px] leading-relaxed opacity-85">{unit.tagline}</p>
          </div>
        </div>
      </header>

      <div className="space-y-6 px-4 pb-12 pt-6">
        <Card>
          <MicroLabel className="text-muted-foreground">Overview</MicroLabel>
          <p className="mt-2 text-[13.5px] leading-relaxed">{unit.overview}</p>
          <div className="mt-3 rounded-xl bg-primary-soft px-3.5 py-3">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-primary">
              <Target className="size-3.5" /> Mission
            </span>
            <p className="mt-1 text-[13px] font-semibold leading-snug">{unit.mission}</p>
          </div>
        </Card>

        <section>
          <SectionHead title="At a glance" />
          <Card className="divide-y divide-border p-0">
            {unit.facts.map((f) => (
              <div key={f.label} className="grid grid-cols-[8rem_minmax(0,1fr)] gap-3 px-4 py-3">
                <span className="text-[11.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                  {f.label}
                </span>
                <span className="text-[13px] font-semibold leading-snug">{f.value}</span>
              </div>
            ))}
          </Card>
        </section>

        <Pills title="Kinds of roles" items={unit.roles} icon={Compass} />
        <Pills title="What you'd come out knowing" items={unit.skills} icon={Wrench} />

        {related.length ? (
          <section>
            <SectionHead title="Look at these next" hint="People who explore this one usually look here." />
            <div className="space-y-2">
              {related.map((r) => {
                const rb = BRANCHES.find((b) => b.id === r.branch)!;
                return (
                  <Link
                    key={r.id}
                    to="/explore/idf/$unitId"
                    params={{ unitId: r.id }}
                    className="tap flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-card"
                  >
                    <span
                      className="grid size-10 shrink-0 place-items-center rounded-xl text-lg"
                      style={{ backgroundImage: rb.grad }}
                      aria-hidden
                    >
                      {r.emoji}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13.5px] font-semibold leading-snug">{r.name}</span>
                      <span className="mt-0.5 block text-[12px] leading-snug text-muted-foreground">
                        {rb.name} · {r.tagline}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm font-semibold text-primary">→</span>
                  </Link>
                );
              })}
            </div>
          </section>
        ) : null}

        {siblings.length ? (
          <section>
            <SectionHead title={`More in ${branch.name}`} />
            <div className="flex flex-wrap gap-2">
              {siblings.map((s) => (
                <Link
                  key={s.id}
                  to="/explore/idf/$unitId"
                  params={{ unitId: s.id }}
                  className="tap-flat rounded-full border border-border bg-card px-3.5 py-2 text-[12.5px] font-semibold"
                >
                  {s.emoji} {s.name}
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <Notice title="What this is and isn't">
          Profiles are built from publicly available information to help you explore. Nothing here is operational
          detail, and only the IDF and your programme can tell you what you're actually eligible for.{" "}
          <Link to="/explore/lone-soldier" className="font-semibold underline">
            Lone soldier support
          </Link>{" "}
          covers rights and paperwork.
        </Notice>
      </div>
    </AppShell>
  );
}
