import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AppShell, Card, PrimaryButton, ScreenHeader } from "@/components/AppShell";
import { ServiceLogo } from "@/components/ServiceLogo";
import { findService, STATUS_LABEL, type Service, type ServiceCategory } from "@/lib/services";

export const Route = createFileRoute("/explore/service/$id")({
  head: ({ params }) => {
    const found = findService(params.id);
    const title = found ? `${found.service.name} · ShekelPay` : "Service · ShekelPay";
    const description = found
      ? `${found.service.blurb} — ${STATUS_LABEL[found.service.status]} inside ShekelPay.`
      : "Partner service inside ShekelPay.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  loader: ({ params }) => {
    const found = findService(params.id);
    if (!found) throw notFound();
    return found;
  },
  component: ServicePage,
  notFoundComponent: ServiceMissing,
});

function ServiceMissing() {
  return (
    <AppShell>
      <ScreenHeader title="Not integrated yet" subtitle="This service isn't in the catalogue" />
      <div className="p-4">
        <Card className="text-sm text-muted-foreground">
          We integrate platforms, not single venues. Tell us which platform you're missing.
        </Card>
      </div>
    </AppShell>
  );
}

function ServicePage() {
  const { service, category } = Route.useLoaderData() as { service: Service; category: ServiceCategory };

  return (
    <AppShell>
      <ScreenHeader title={service.name} subtitle={category.label} />
      <div className="space-y-4 p-4">
        <Card className="flex items-center gap-4">
          <ServiceLogo service={service} size={56} className="rounded-2xl bg-primary-soft" />
          <div className="min-w-0">
            <p className="text-sm font-semibold">{service.blurb}</p>
            {service.partner ? (
              <p className="text-xs text-muted-foreground">Powered by {service.partner}</p>
            ) : (
              <p className="text-xs text-muted-foreground">Built by ShekelPay</p>
            )}
            <span className="mt-1 inline-block rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold">
              {STATUS_LABEL[service.status]}
            </span>
          </div>
        </Card>

        {service.detail?.length ? (
          <Card>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              What you can do
            </p>
            <ul className="space-y-2 text-sm">
              {service.detail.map((d: string) => (
                <li key={d} className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </Card>
        ) : null}

        <Card>
          <p className="text-sm font-semibold">How the integration works</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {service.status === "live"
              ? `The ${service.partner ?? service.name} app runs inside ShekelPay — you book in their own flow, ShekelPay pays ${service.partner ?? service.name} for the order, and the shekel-token equivalent comes off your preloaded balance.`
              : service.status === "integrating"
                ? `We're connecting ${service.partner ?? "this platform"} directly, so you book inside ShekelPay, we settle the bill with them, and your tokens are deducted.`
                : "A plain-English guide written for gap-year students, kept current with the Israeli calendar."}
          </p>
        </Card>

        {service.status === "live" && service.to ? (
          <Link to={service.to}>
            <PrimaryButton>Open {service.name}</PrimaryButton>
          </Link>
        ) : (
          <PrimaryButton disabled>
            {service.status === "integrating" ? "Integration in progress" : "Guide coming to this screen"}
          </PrimaryButton>
        )}

        <p className="px-1 text-xs text-muted-foreground">
          We integrate whole platforms, not individual bars, restaurants, hotels or shops — those aren't onboarded
          yet. You can also send tokens to, or split a bill with, anyone else on ShekelPay.
        </p>
      </div>
    </AppShell>
  );
}
