import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarClock, ChevronRight, FileText, FolderLock, ShieldCheck } from "lucide-react";
import { AppShell, Card, ScreenHeader } from "@/components/AppShell";
import { TRACKS, DOC_CATEGORIES } from "@/lib/official-content";
import { nextDue, trackProgress, useOfficial } from "@/lib/useOfficial";

export const Route = createFileRoute("/explore/admin/")({
  head: () => ({
    meta: [
      { title: "Official · Visas, army & uni paperwork · Shekk" },
      {
        name: "description",
        content:
          "Student visa steps, army and lone-soldier tracks, university admin, and a private vault for your documents.",
      },
      { property: "og:title", content: "Official · Shekk" },
      {
        property: "og:description",
        content: "Visas, army, lone-soldier rights and university paperwork, explained — plus your own document vault.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OfficialHome,
});

function fmtDue(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function OfficialHome() {
  const { tasks, documents, loading } = useOfficial();
  const due = nextDue(tasks);
  const totalDone = tasks.filter((t) => t.done).length;

  return (
    <AppShell>
      <ScreenHeader title="Official" subtitle="Visas, army, uni & paperwork" />

      <div className="space-y-4 px-4 py-4">
        <div className="rounded-3xl bg-ink p-5 text-ink-foreground shadow-card">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] opacity-70">Where you're up to</p>
          <p className="mt-1.5 font-display text-2xl font-bold leading-tight">
            {loading
              ? "Loading your file…"
              : due
                ? `${due.title} — due ${fmtDue(due.dueOn as string)}`
                : totalDone
                  ? `${totalDone} step${totalDone === 1 ? "" : "s"} done`
                  : "Nothing tracked yet"}
          </p>
          <p className="mt-1.5 text-[12.5px] leading-snug opacity-80">
            {due
              ? "Tick it off in the track below once it's handled."
              : "Open a track, tick the steps you've done, and set a date for the ones you haven't."}
          </p>
        </div>

        <div className="space-y-3">
          {TRACKS.map((t) => {
            const { done, total, pct } = trackProgress(tasks, t.id);
            return (
              <Link
                key={t.id}
                to="/explore/admin/$track"
                params={{ track: t.id }}
                className="tap block rounded-3xl border border-border bg-card p-4 shadow-card"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl leading-none">{t.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-bold leading-tight">{t.name}</p>
                    <p className="mt-0.5 text-[12.5px] leading-snug text-muted-foreground">{t.tagline}</p>
                  </div>
                  <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground" />
                </div>
                <p className="mt-2.5 line-clamp-2 text-[12.5px] leading-relaxed text-muted-foreground">{t.blurb}</p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${Math.round(pct * 100)}%` }} />
                  </div>
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    {done}/{total}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        <Link to="/explore/admin/documents" className="tap block">
          <Card className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary">
                <FolderLock className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-bold leading-tight">Your documents</p>
                <p className="mt-0.5 text-[12.5px] leading-snug text-muted-foreground">
                  {documents.length
                    ? `${documents.length} file${documents.length === 1 ? "" : "s"} stored privately`
                    : "Passport, visa, acceptance letter, insurance — stored privately"}
                </p>
              </div>
              <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {DOC_CATEGORIES.slice(0, 6).map((c) => (
                <span key={c.id} className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                  {c.emoji} {c.label}
                </span>
              ))}
            </div>
          </Card>
        </Link>

        {documents.length ? (
          <Card className="p-0">
            <p className="border-b border-border p-4 text-[13px] font-bold">Recently uploaded</p>
            {documents.slice(0, 4).map((d) => (
              <div key={d.id} className="flex items-center gap-3 border-b border-border p-4 last:border-0">
                <FileText className="size-4 shrink-0 text-primary" />
                <span className="flex-1 truncate text-[13px]">{d.label}</span>
                <span className="text-[11px] text-muted-foreground">{fmtDue(d.createdAt)}</span>
              </div>
            ))}
          </Card>
        ) : null}

        <div className="flex items-start gap-2.5 rounded-2xl bg-muted px-4 py-3">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
          <p className="text-[12px] leading-relaxed text-muted-foreground">
            Your documents are private to you and encrypted at rest. Shekk staff can't browse them, and nothing here is
            legal advice — each track says who to call for the real answer.
          </p>
        </div>

        <div className="flex items-start gap-2.5 rounded-2xl bg-muted px-4 py-3">
          <CalendarClock className="mt-0.5 size-4 shrink-0 text-primary" />
          <p className="text-[12px] leading-relaxed text-muted-foreground">
            Dates change and fees rise. Every track shows when its facts were last checked.
          </p>
        </div>
      </div>

      <div className="pb-10" />
    </AppShell>
  );
}
