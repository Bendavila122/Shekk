import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AppShell, Card, ScreenHeader } from "@/components/AppShell";
import { ServiceLogo } from "@/components/ServiceLogo";
import { SERVICE_CATEGORIES, serviceLinkProps, type Service, type ServiceCategory } from "@/lib/services";
import { recordServiceUse } from "@/lib/recents";

export const Route = createFileRoute("/explore/category/$id")({
  head: ({ params }) => {
    const cat = SERVICE_CATEGORIES.find((c) => c.id === params.id);
    const title = cat ? `${cat.label} · Shekk` : "Category · Shekk";
    const description = cat
      ? `${cat.tagline} Every ${cat.label.toLowerCase()} app integrated inside Shekk.`
      : "Service category inside Shekk.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  loader: ({ params }) => {
    const cat = SERVICE_CATEGORIES.find((c) => c.id === params.id);
    if (!cat) throw notFound();
    return cat;
  },
  component: CategoryPage,
  notFoundComponent: () => (
    <AppShell>
      <ScreenHeader title="Category not found" subtitle="Try Explore again" />
      <div className="p-4">
        <Card className="text-sm text-muted-foreground">That folder doesn't exist.</Card>
      </div>
    </AppShell>
  ),
});

function BigTile({ service }: { service: Service }) {
  return (
    <Link
      {...serviceLinkProps(service)}
      onClick={() => recordServiceUse(service.id)}
      className="tap-icon flex flex-col items-center gap-2.5"
    >
      <span className="relative">
        <ServiceLogo service={service} size={84} className="rounded-[1.6rem] shadow-card" />
        {service.status !== "live" ? (
          <span className="absolute -right-1 -top-1 rounded-full bg-ink px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-ink-foreground">
            {service.status === "integrating" ? "soon" : "info"}
          </span>
        ) : null}
      </span>
      <span className="line-clamp-2 text-center text-xs font-semibold leading-tight">{service.name}</span>
    </Link>
  );
}

function CategoryPage() {
  const cat = Route.useLoaderData() as ServiceCategory;

  return (
    <AppShell>
      <header className="px-5 pb-2 pt-7">
        <Link to="/explore" className="tap-flat text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          ← Explore
        </Link>
        <div className="mt-3 flex items-center gap-3">
          <span className="text-4xl">{cat.emoji}</span>
          <h1 className="font-display text-3xl font-bold tracking-tight">{cat.label}</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{cat.tagline}</p>
      </header>

      <section className="px-5 py-6">
        <div className="grid grid-cols-3 gap-x-4 gap-y-8 sm:grid-cols-4 lg:grid-cols-6">
          {cat.services.map((s) => (
            <BigTile key={s.id} service={s} />
          ))}
        </div>
        <p className="mt-8 text-center text-[11px] text-muted-foreground">
          Apps marked “soon” open a guide for now.
        </p>
      </section>
    </AppShell>
  );
}
