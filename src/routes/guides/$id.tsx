import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { GUIDES, getGuide } from "@/lib/guides";

export const Route = createFileRoute("/guides/$id")({
  loader: ({ params }) => {
    const guide = getGuide(params.id);
    if (!guide) throw notFound();
    return { guide };
  },
  head: ({ loaderData }) => {
    const g = loaderData?.guide;
    return {
      meta: [
        { title: g ? `${g.title} · Shekk guides` : "Guide · Shekk" },
        { name: "description", content: g?.blurb ?? "A practical gap-year guide from Shekk." },
        { property: "og:title", content: g ? `${g.title} · Shekk guides` : "Guide · Shekk" },
        { property: "og:description", content: g?.blurb ?? "A practical gap-year guide from Shekk." },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: GuideDetail,
});

function GuideDetail() {
  const { guide } = Route.useLoaderData();
  const router = useRouter();
  const others = GUIDES.filter((g) => g.id !== guide.id).slice(0, 3);

  return (
    <AppShell>
      <div className="px-5 pt-6">
        <button
          onClick={() => router.history.back()}
          className="tap-flat inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground"
        >
          <ArrowLeft className="size-4" /> Back
        </button>
      </div>

      <article className="px-5 pt-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {guide.kicker} · {guide.readMins} min read
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold leading-tight tracking-tight">
          <span className="mr-2">{guide.emoji}</span>
          {guide.title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{guide.intro}</p>

        <div className="mt-7 space-y-6">
          {guide.sections.map((s) => (
            <section key={s.heading}>
              <h2 className="text-[15px] font-bold leading-tight">{s.heading}</h2>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{s.body}</p>
            </section>
          ))}
        </div>
      </article>

      <section className="mt-10 px-5">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">More guides</h2>
        <div className="mt-3 divide-y divide-border">
          {others.map((g) => (
            <Link key={g.id} to="/guides/$id" params={{ id: g.id }} className="tap-flat flex items-start gap-3 py-4">
              <span className="text-lg leading-none">{g.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold leading-tight">{g.title}</p>
                <p className="mt-0.5 line-clamp-1 text-[12px] text-muted-foreground">{g.blurb}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="pb-10" />
    </AppShell>
  );
}
