import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Compass, Search } from "lucide-react";
import { AppShell, Card, ScreenHeader } from "@/components/AppShell";
import { Chip, MicroLabel, SectionHead } from "@/components/Kit";
import { BRANCHES, UNITS, unitsInBranch, type BranchId } from "@/lib/idf-content";

export const Route = createFileRoute("/explore/idf/")({
  head: () => ({
    meta: [
      { title: "IDF Explorer · Shekk" },
      {
        name: "description",
        content:
          "Browse IDF branches and units — air force, navy, intelligence, combat, engineering, cyber and medical — with short profiles of what each one does and what you'd learn there.",
      },
      { property: "og:title", content: "IDF Explorer · Shekk" },
      {
        property: "og:description",
        content: "Explore branches and units instead of reading one long article.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: IdfExplorer,
});

function IdfExplorer() {
  const [branch, setBranch] = useState<BranchId | "all">("all");
  const [q, setQ] = useState("");

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    return UNITS.filter((u) => {
      if (branch !== "all" && u.branch !== branch) return false;
      if (!term) return true;
      return (
        u.name.toLowerCase().includes(term) ||
        u.tagline.toLowerCase().includes(term) ||
        u.skills.some((s) => s.toLowerCase().includes(term)) ||
        u.roles.some((r) => r.toLowerCase().includes(term))
      );
    });
  }, [branch, q]);

  return (
    <AppShell>
      <ScreenHeader title="IDF Explorer" back="/israel" />

      <header className="px-4 pt-2">
        <div
          className="relative overflow-hidden rounded-[1.5rem] px-5 py-5 text-ink-foreground shadow-lift"
          style={{ backgroundImage: "var(--grad-alert)" }}
        >
          <span className="card-sheen pointer-events-none absolute inset-0" aria-hidden />
          <div className="relative">
            <MicroLabel className="opacity-70">Explore, don't read</MicroLabel>
            <p className="mt-2 font-display text-[1.9rem] font-bold leading-tight tracking-tight">
              {UNITS.length} units, {BRANCHES.length} branches
            </p>
            <p className="mt-1.5 text-[12.5px] leading-relaxed opacity-85">
              Short profiles built from publicly available information — what a unit is for, the kinds of roles
              people do, and what you'd come out knowing.
            </p>
          </div>
        </div>
      </header>

      <div className="px-4 pt-4">
        <label className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 shadow-card">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search a unit, a role or a skill"
            className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-muted-foreground"
          />
        </label>
      </div>

      <div className="-mx-0 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Chip selected={branch === "all"} onClick={() => setBranch("all")} className="shrink-0">
          All
        </Chip>
        {BRANCHES.map((b) => (
          <Chip
            key={b.id}
            selected={branch === b.id}
            onClick={() => setBranch(b.id)}
            className="shrink-0 whitespace-nowrap"
          >
            {b.emoji} {b.name}
          </Chip>
        ))}
      </div>

      {branch === "all" && !q.trim() ? (
        <div className="space-y-6 px-4 pb-12 pt-6">
          {BRANCHES.map((b) => (
            <section key={b.id}>
              <SectionHead title={`${b.emoji} ${b.name}`} hint={b.tagline} />
              <p className="mb-3 px-1 text-[12.5px] leading-relaxed text-muted-foreground">{b.overview}</p>
              <div className="space-y-2">
                {unitsInBranch(b.id).map((u) => (
                  <Link
                    key={u.id}
                    to="/explore/idf/$unitId"
                    params={{ unitId: u.id }}
                    className="tap flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-card"
                  >
                    <span
                      className="grid size-10 shrink-0 place-items-center rounded-xl text-lg"
                      style={{ backgroundImage: b.grad }}
                      aria-hidden
                    >
                      {u.emoji}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13.5px] font-semibold leading-snug">{u.name}</span>
                      <span className="mt-0.5 block text-[12px] leading-snug text-muted-foreground">
                        {u.tagline}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm font-semibold text-primary">→</span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="space-y-2 px-4 pb-12 pt-5">
          <MicroLabel className="px-1 text-muted-foreground">
            {results.length} unit{results.length === 1 ? "" : "s"}
          </MicroLabel>
          {results.length === 0 ? (
            <Card className="text-center">
              <Compass className="mx-auto size-6 text-muted-foreground" />
              <p className="mt-2 text-sm font-semibold">Nothing matches that</p>
              <p className="mt-1 text-[12.5px] text-muted-foreground">
                Try a skill instead — "navigation", "software", "trauma".
              </p>
            </Card>
          ) : null}
          {results.map((u) => {
            const b = BRANCHES.find((x) => x.id === u.branch)!;
            return (
              <Link
                key={u.id}
                to="/explore/idf/$unitId"
                params={{ unitId: u.id }}
                className="tap flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-card"
              >
                <span
                  className="grid size-10 shrink-0 place-items-center rounded-xl text-lg"
                  style={{ backgroundImage: b.grad }}
                  aria-hidden
                >
                  {u.emoji}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13.5px] font-semibold leading-snug">{u.name}</span>
                  <span className="mt-0.5 block text-[12px] leading-snug text-muted-foreground">
                    {b.name} · {u.tagline}
                  </span>
                </span>
                <span className="shrink-0 text-sm font-semibold text-primary">→</span>
              </Link>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
