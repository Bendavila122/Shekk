import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { GraduationCap, Search } from "lucide-react";
import { Card, PrimaryButton } from "@/components/AppShell";
import { useProgramLink } from "@/lib/useSocial";

/** Join your program by code or from the directory — unlocks the cohort thread. */
export function ProgramLinkCard() {
  const [search, setSearch] = useState("");
  const { mine, programs, programsLoading, join, leave } = useProgramLink(search);
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");

  if (mine) {
    return (
      <Card className="space-y-2 bg-primary-soft">
        <div className="flex items-start gap-3">
          <GraduationCap className="mt-0.5 size-5 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{mine.programName}</p>
            <p className="truncate text-xs text-muted-foreground">
              {mine.cohortName} · {mine.memberCount} member{mine.memberCount === 1 ? "" : "s"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {mine.conversationId && (
            <Link
              to="/social/$conversationId"
              params={{ conversationId: mine.conversationId }}
              className="tap flex-1 rounded-2xl bg-primary py-2.5 text-center text-sm font-semibold text-primary-foreground"
            >
              Open cohort chat
            </Link>
          )}
          <button
            onClick={() => leave.mutate(mine.cohortId)}
            className="tap rounded-2xl bg-card px-4 text-sm font-semibold"
          >
            Leave
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="space-y-3">
      <div className="flex items-start gap-3">
        <GraduationCap className="mt-0.5 size-5 shrink-0 text-primary" />
        <div>
          <p className="text-sm font-semibold">Link your program</p>
          <p className="text-xs text-muted-foreground">
            Use the join code from your madrich, or find your yeshiva or seminary in the directory.
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="JOIN CODE"
          className="flex-1 rounded-2xl border border-border px-4 py-3 text-sm font-semibold tracking-widest outline-none focus:border-primary"
        />
        <button
          disabled={code.trim().length < 4 || join.isPending}
          onClick={() => join.mutate({ code: code.trim() }, { onSuccess: () => setCode("") })}
          className="tap rounded-2xl bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          Join
        </button>
      </div>
      {join.error && <p className="text-xs font-semibold text-destructive">{(join.error as Error).message}</p>}

      <button onClick={() => setOpen((v) => !v)} className="tap-flat text-xs font-semibold text-primary">
        {open ? "Hide directory" : "Browse programs instead"}
      </button>

      {open && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 rounded-2xl border border-border px-3">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search programs and cities"
              className="w-full bg-transparent py-3 text-sm outline-none"
            />
          </div>
          {programsLoading && <p className="text-xs text-muted-foreground">Loading…</p>}
          {!programsLoading && programs.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No programs listed yet — ask your madrich for a join code.
            </p>
          )}
          {programs.map((p) => (
            <div key={p.id} className="rounded-2xl border border-border p-3">
              <p className="text-sm font-semibold">{p.name}</p>
              <p className="text-xs text-muted-foreground">
                {p.kind}
                {p.city ? ` · ${p.city}` : ""}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {p.cohorts.length === 0 && (
                  <span className="text-xs text-muted-foreground">Cohorts are invite-only here.</span>
                )}
                {p.cohorts.map((c) => (
                  <button
                    key={c.id}
                    disabled={join.isPending}
                    onClick={() => join.mutate({ cohortId: c.id })}
                    className="tap rounded-full bg-muted px-3 py-1.5 text-xs font-semibold"
                  >
                    Join {c.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {!open && <PrimaryButton onClick={() => setOpen(true)}>Find my program</PrimaryButton>}
    </Card>
  );
}
