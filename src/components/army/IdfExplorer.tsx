/**
 * Explore the IDF — the hero of the Army category.
 *
 * Browsing branches and units, comparing the ones you saved, and moving
 * sideways between them. Everything here is built from publicly available
 * descriptions; nothing is a recruitment promise.
 */

import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bookmark, Compass, Search } from "lucide-react";
import { Card } from "@/components/AppShell";
import { Chip, MicroLabel, SectionHead } from "@/components/Kit";
import { BRANCHES, UNITS, unitsInBranch, type BranchId } from "@/lib/idf-content";
import { useLocalState } from "@/lib/local-state";

export const IDF_SAVED_KEY = "shekk.idf.saved.v1";

export function useSavedUnits() {
  const { value, update } = useLocalState<{ saved: string[] }>(IDF_SAVED_KEY, { saved: [] });
  const saved = value.saved;
  const toggle = (id: string) =>
    update({ saved: saved.includes(id) ? saved.filter((x) => x !== id) : [...saved, id].slice(-6) });
  return { saved, toggle };
}

function UnitRow({
  unitId,
  name,
  tagline,
  emoji,
  grad,
  saved,
  onToggle,
}: {
  unitId: string;
  name: string;
  tagline: string;
  emoji: string;
  grad: string;
  saved: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Link
        to="/explore/idf/$unitId"
        params={{ unitId }}
        className="tap flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-card"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-xl text-lg" style={{ backgroundImage: grad }} aria-hidden>
          {emoji}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13.5px] font-semibold leading-snug">{name}</span>
          <span className="mt-0.5 block text-[12px] leading-snug text-muted-foreground">{tagline}</span>
        </span>
        <span className="shrink-0 text-sm font-semibold text-primary">→</span>
      </Link>
      <button
        type="button"
        aria-label={saved ? `Remove ${name} from saved` : `Save ${name}`}
        onClick={onToggle}
        className={`tap grid size-11 shrink-0 place-items-center rounded-2xl border ${
          saved ? "border-primary bg-primary-soft text-primary" : "border-border bg-card text-muted-foreground"
        }`}
      >
        <Bookmark className={`size-4 ${saved ? "fill-current" : ""}`} />
      </button>
    </div>
  );
}

export function IdfExplorer() {
  const [branch, setBranch] = useState<BranchId | "all">("all");
  const [q, setQ] = useState("");
  const { saved, toggle } = useSavedUnits();

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

  const savedUnits = UNITS.filter((u) => saved.includes(u.id));
  const browsing = branch === "all" && !q.trim();

  return (
    <>
      <header className="px-4 pt-2">
        <div
          className="relative overflow-hidden rounded-[1.5rem] px-5 py-5 text-ink-foreground shadow-lift"
          style={{ backgroundImage: "var(--grad-alert)" }}
        >
          <span className="card-sheen pointer-events-none absolute inset-0" aria-hidden />
          <div className="relative">
            <MicroLabel className="opacity-70">Explore the IDF</MicroLabel>
            <p className="mt-2 font-display text-[1.9rem] font-bold leading-tight tracking-tight">
              {UNITS.length} units, {BRANCHES.length} branches
            </p>
            <p className="mt-1.5 text-[12.5px] leading-relaxed opacity-85">
              What a unit is for, the kinds of roles people do, and what you'd come out knowing. Save the ones you
              want to look at again and compare them.
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

      <div className="mt-3 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Chip selected={branch === "all"} onClick={() => setBranch("all")} className="shrink-0">
          All
        </Chip>
        {BRANCHES.map((b) => (
          <Chip key={b.id} selected={branch === b.id} onClick={() => setBranch(b.id)} className="shrink-0 whitespace-nowrap">
            {b.emoji} {b.name}
          </Chip>
        ))}
      </div>

      {savedUnits.length ? (
        <section className="pt-5">
          <div className="px-4">
            <SectionHead
              title={`Saved · ${savedUnits.length}`}
              hint={savedUnits.length >= 2 ? "Swipe across to compare them." : "Save a second unit to compare."}
            />
          </div>
          <div className="flex gap-2.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {savedUnits.map((u) => {
              const b = BRANCHES.find((x) => x.id === u.branch)!;
              return (
                <Card key={u.id} className="w-[15.5rem] shrink-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[13.5px] font-semibold leading-snug">
                        {u.emoji} {u.name}
                      </p>
                      <p className="mt-0.5 text-[11.5px] text-muted-foreground">{b.name}</p>
                    </div>
                    <button
                      type="button"
                      aria-label={`Remove ${u.name} from saved`}
                      onClick={() => toggle(u.id)}
                      className="tap-flat shrink-0 text-primary"
                    >
                      <Bookmark className="size-4 fill-current" />
                    </button>
                  </div>
                  <dl className="mt-2.5 space-y-1.5 text-[11.5px]">
                    {u.facts.slice(0, 3).map((f) => (
                      <div key={f.label} className="flex justify-between gap-2">
                        <dt className="text-muted-foreground">{f.label}</dt>
                        <dd className="text-right font-semibold">{f.value}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="mt-2.5 text-[11.5px] leading-snug text-muted-foreground">
                    Skills: {u.skills.slice(0, 3).join(", ")}
                  </p>
                  <Link
                    to="/explore/idf/$unitId"
                    params={{ unitId: u.id }}
                    className="tap-flat mt-2.5 inline-block text-[12px] font-bold text-primary"
                  >
                    Open profile →
                  </Link>
                </Card>
              );
            })}
          </div>
        </section>
      ) : null}

      {browsing ? (
        <div className="space-y-6 px-4 pt-6">
          {BRANCHES.map((b) => (
            <section key={b.id}>
              <SectionHead title={`${b.emoji} ${b.name}`} hint={b.tagline} />
              <p className="mb-3 px-1 text-[12.5px] leading-relaxed text-muted-foreground">{b.overview}</p>
              <div className="space-y-2">
                {unitsInBranch(b.id).map((u) => (
                  <UnitRow
                    key={u.id}
                    unitId={u.id}
                    name={u.name}
                    tagline={u.tagline}
                    emoji={u.emoji}
                    grad={b.grad}
                    saved={saved.includes(u.id)}
                    onToggle={() => toggle(u.id)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="space-y-2 px-4 pt-5">
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
              <UnitRow
                key={u.id}
                unitId={u.id}
                name={u.name}
                tagline={`${b.name} · ${u.tagline}`}
                emoji={u.emoji}
                grad={b.grad}
                saved={saved.includes(u.id)}
                onToggle={() => toggle(u.id)}
              />
            );
          })}
        </div>
      )}
    </>
  );
}
