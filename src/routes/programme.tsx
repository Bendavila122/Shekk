import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CalendarDays,
  CheckCircle2,
  Circle,
  FileText,
  Megaphone,
  Phone,
  Mail,
  ShieldAlert,
  Ticket,
  Users,
} from "lucide-react";
import { AppShell, Card, Notice, PrimaryButton } from "@/components/AppShell";
import { PageHeader, SectionHead, EmptyState, LoadingBlocks, StatusPill, Milestone } from "@/components/Kit";
import { useApp } from "@/lib/store";
import { useProgramme } from "@/lib/useProgramme";
import type { CodePreview } from "@/lib/programme.server";

export const Route = createFileRoute("/programme")({
  head: () => ({
    meta: [
      { title: "Programme · Shekk" },
      {
        name: "description",
        content:
          "Your programme inside Shekk: timetable, announcements, staff and emergency contacts, documents and your pre-arrival checklist.",
      },
      { property: "og:title", content: "Programme · Shekk" },
      {
        property: "og:description",
        content: "Enter your programme code to see your timetable, contacts and checklist in one place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProgrammeScreen,
});

function formatDay(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function JoinPanel() {
  const { join, preview } = useProgramme();
  const [code, setCode] = useState("");
  const [checked, setChecked] = useState<CodePreview | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clean = code.trim().toUpperCase();

  async function check() {
    setError(null);
    setChecked(null);
    try {
      const result = await preview.mutateAsync(clean);
      if (!result) {
        setError("We couldn't find that code. Check it with your programme office.");
        return;
      }
      setChecked(result);
    } catch (e) {
      setError(e instanceof Error ? e.message.replace(/^Error:\s*/, "") : "That code could not be checked.");
    }
  }

  async function confirm() {
    setError(null);
    try {
      await join.mutateAsync(clean);
    } catch (e) {
      setError(e instanceof Error ? e.message.replace(/^Error:\s*/, "") : "We couldn't join you to that cohort.");
    }
  }

  return (
    <div className="space-y-4 px-4">
      <Card className="space-y-3">
        <p className="text-sm font-semibold">Do you have a programme code?</p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Programmes give participants a short code. It unlocks your timetable, announcements, staff and
          emergency contacts, documents and a checklist for the weeks before you fly. Nothing about a programme
          is visible until you join.
        </p>
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Programme code
          </span>
          <input
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setChecked(null);
              setError(null);
            }}
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            placeholder="e.g. SHEKKDEMO"
            className="w-full rounded-2xl bg-muted px-4 py-3.5 text-base font-semibold uppercase tracking-wide outline-none focus:ring-2 focus:ring-primary/40"
          />
        </label>

        {error ? <p className="text-xs font-semibold text-destructive">{error}</p> : null}

        {checked ? (
          <div className="rounded-2xl border border-border bg-muted/60 p-3">
            <p className="text-sm font-semibold">{checked.programmeName}</p>
            <p className="text-xs text-muted-foreground">{checked.cohortName}</p>
            {checked.city ? <p className="mt-1 text-xs text-muted-foreground">{checked.city}</p> : null}
            {checked.isDemo ? (
              <p className="mt-2 inline-block rounded-full bg-ink px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink-foreground">
                Demo programme
              </p>
            ) : null}
          </div>
        ) : null}

        {checked ? (
          <PrimaryButton onClick={confirm} disabled={join.isPending}>
            {join.isPending ? "Joining…" : `Join ${checked.cohortName}`}
          </PrimaryButton>
        ) : (
          <PrimaryButton onClick={check} disabled={clean.length < 3 || preview.isPending}>
            {preview.isPending ? "Checking…" : "Check code"}
          </PrimaryButton>
        )}
      </Card>

      <Notice title="Travelling independently?">
        That's fine — Shekk works without a programme. You'll still get the money features, the arrival
        checklist and every Israel guide.{" "}
        <Link to="/before-you-fly" className="font-semibold underline">
          Open Before you fly
        </Link>
        .
      </Notice>

      <Notice title="Trying Shekk out?">
        Use the code <span className="font-bold">SHEKKDEMO</span> to explore a clearly fictional demo cohort
        with sample announcements, timetable and contacts.
      </Notice>
    </div>
  );
}

function ProgrammeScreen() {
  const { signedIn, authChecked } = useApp();
  const { programme, loading, nextItem, checklistDone, checklistTotal, tick, leave } = useProgramme();

  if (!authChecked) {
    return (
      <AppShell>
        <LoadingBlocks rows={3} />
      </AppShell>
    );
  }

  const today = new Date().toDateString();
  const todayItems = programme.schedule.filter((i) => new Date(i.startsAt).toDateString() === today);
  const pinned = programme.announcements.find((a) => a.pinned) ?? null;
  const checklistComplete = checklistTotal > 0 && checklistDone === checklistTotal;

  return (
    <AppShell>
      <PageHeader
        title={programme.joined ? "Your programme" : "Programme"}
        subtitle={
          programme.joined
            ? "Today's plan, announcements, the people to call and your documents."
            : "Join with your programme code and everything lands in one place."
        }
      />

      <div className="pt-4">
        {!signedIn ? (
          <div className="px-4">
            <Card className="space-y-3">
              <p className="text-sm font-semibold">Sign in to join your programme</p>
              <p className="text-xs text-muted-foreground">
                Your programme membership is stored on your Shekk account, so it follows you between devices.
              </p>
              <Link
                to="/auth"
                className="tap block w-full rounded-2xl bg-primary px-5 py-3.5 text-center text-sm font-semibold text-primary-foreground"
              >
                Sign in
              </Link>
            </Card>
          </div>
        ) : loading ? (
          <LoadingBlocks rows={2} />
        ) : !programme.joined ? (
          <JoinPanel />
        ) : (
          <div className="space-y-8 px-4 pb-10">
            {/* Identity */}
            <section>
              <div className="grad-balance relative overflow-hidden rounded-[1.5rem] px-5 py-5 text-ink-foreground shadow-lift">
                <span className="card-sheen pointer-events-none absolute inset-0" aria-hidden />
                <div className="relative">
                  {programme.isDemo ? (
                    <span className="mb-2 inline-block rounded-full bg-ink-foreground/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest">
                      Demo programme
                    </span>
                  ) : null}
                  <p className="font-display text-2xl font-bold leading-tight">{programme.programmeName}</p>
                  <p className="mt-0.5 text-sm opacity-80">{programme.cohortName}</p>
                  {programme.startsOn ? (
                    <p className="mt-2 text-[11px] opacity-70">
                      {formatDay(programme.startsOn)}
                      {programme.endsOn ? ` – ${formatDay(programme.endsOn)}` : ""}
                      {programme.city ? ` · ${programme.city}` : ""}
                    </p>
                  ) : null}
                </div>
              </div>
              {programme.welcomeMessage ? (
                <p className="mt-3 rounded-2xl border border-border bg-card p-4 text-xs leading-relaxed text-muted-foreground shadow-card">
                  {programme.welcomeMessage}
                </p>
              ) : null}
            </section>

            {checklistComplete ? (
              <Milestone
                title="Programme checklist complete"
                body="Everything your programme asked for is done. Nice work — nothing left to chase."
                actionLabel="See what's next"
                actionTo="/before-you-fly"
              />
            ) : null}

            {/* Today */}
            <section>
              <SectionHead
                title="Today"
                hint={new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
                action={todayItems.length > 0 ? <StatusPill tone="pending">{todayItems.length} on</StatusPill> : undefined}
              />
              {todayItems.length === 0 ? (
                <EmptyState
                  icon={CalendarDays}
                  title="Nothing on today"
                  body="A free day. Anything your programme adds will show up here first."
                />
              ) : (
                <div className="space-y-2">
                  {todayItems.map((item) => (
                    <Card key={item.id} className="flex items-start gap-3">
                      <span className="mt-0.5 flex size-10 shrink-0 flex-col items-center justify-center rounded-xl bg-primary-soft text-[11px] font-bold leading-none text-primary">
                        {formatTime(item.startsAt)}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">{item.title}</p>
                        {item.location ? (
                          <p className="mt-0.5 text-xs text-muted-foreground">{item.location}</p>
                        ) : null}
                        {item.details ? (
                          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.details}</p>
                        ) : null}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
              {pinned ? (
                <Card className="mt-2 border-notice-border bg-notice-soft text-notice-foreground shadow-none">
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    <Megaphone className="size-4 shrink-0" /> {pinned.title}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed opacity-90">{pinned.body}</p>
                </Card>
              ) : null}
            </section>

            {/* Next up */}
            <section>
              <SectionHead title="Next up" hint="The next thing on your timetable" />
              {nextItem ? (
                <Card className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <CalendarDays className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{nextItem.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatDay(nextItem.startsAt)} · {formatTime(nextItem.startsAt)}
                      {nextItem.location ? ` · ${nextItem.location}` : ""}
                    </p>
                    {nextItem.details ? (
                      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{nextItem.details}</p>
                    ) : null}
                  </div>
                </Card>
              ) : (
                <EmptyState
                  icon={CalendarDays}
                  title="No timetable yet"
                  body="As soon as your programme publishes sessions, they'll appear here."
                />
              )}
            </section>

            {/* Checklist */}
            {checklistTotal > 0 ? (
              <section>
                <SectionHead
                  title="Your checklist"
                  hint={`${checklistDone} of ${checklistTotal} done — tap to tick one off`}
                />
                <div className="space-y-2">
                  {programme.checklist.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => tick.mutate({ itemId: item.id, done: !item.done })}
                      className="tap flex w-full items-start gap-3 rounded-2xl border border-border bg-card p-4 text-left shadow-card"
                    >
                      {item.done ? (
                        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" />
                      ) : (
                        <Circle className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                      )}
                      <span className="min-w-0">
                        <span
                          className={`block text-sm font-semibold ${item.done ? "text-muted-foreground line-through" : ""}`}
                        >
                          {item.title}
                        </span>
                        {item.details ? (
                          <span className="mt-0.5 block text-xs text-muted-foreground">{item.details}</span>
                        ) : null}
                        {item.dueOn ? (
                          <span className="mt-1 block text-[11px] font-semibold text-primary">
                            Due {formatDay(item.dueOn)}
                          </span>
                        ) : null}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            ) : null}

            {/* Announcements */}
            <section>
              <SectionHead title="Announcements" hint="Published by your programme office" />
              {programme.announcements.length === 0 ? (
                <EmptyState
                  icon={Megaphone}
                  title="No announcements yet"
                  body="Messages from your programme office will land here — and you'll see them on Today."
                />
              ) : (
                <div className="space-y-2">
                  {programme.announcements.map((a) => (
                    <Card key={a.id}>
                      <div className="flex items-center gap-2">
                        <Megaphone className="size-4 shrink-0 text-primary" />
                        <p className="min-w-0 flex-1 truncate text-sm font-semibold">{a.title}</p>
                        {a.pinned ? (
                          <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                            Pinned
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{a.body}</p>
                      <p className="mt-2 text-[11px] text-muted-foreground">{formatDay(a.publishedAt)}</p>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            {/* Timetable */}
            {programme.schedule.length > 0 ? (
              <section>
                <SectionHead title="Timetable" />
                <div className="space-y-2">
                  {programme.schedule.map((item) => (
                    <Card key={item.id} className="flex items-start gap-3">
                      <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted">
                        <Ticket className="size-4 text-foreground/70" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">{item.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {formatDay(item.startsAt)} · {formatTime(item.startsAt)}
                          {item.location ? ` · ${item.location}` : ""}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            ) : null}

            {/* Contacts */}
            <section>
              <SectionHead title="Who to call" hint="Staff and emergency numbers" />
              {programme.contacts.length === 0 ? (
                <EmptyState
                  icon={Phone}
                  title="No contacts yet"
                  body="Your programme's staff and emergency numbers will appear here, ready to call."
                />
              ) : (
                <div className="space-y-2">
                  {programme.contacts.map((c) => (
                    <Card key={c.id} className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl ${
                          c.isEmergency ? "bg-destructive/10 text-destructive" : "bg-muted text-foreground/70"
                        }`}
                      >
                        {c.isEmergency ? <ShieldAlert className="size-4" /> : <Users className="size-4" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">{c.name}</p>
                        {c.role ? <p className="text-xs text-muted-foreground">{c.role}</p> : null}
                        <div className="mt-1.5 flex flex-wrap gap-3">
                          {c.phone ? (
                            <a
                              href={`tel:${c.phone.replace(/\s+/g, "")}`}
                              className="tap-flat inline-flex items-center gap-1 text-xs font-semibold text-primary"
                            >
                              <Phone className="size-3.5" /> {c.phone}
                            </a>
                          ) : null}
                          {c.email ? (
                            <a
                              href={`mailto:${c.email}`}
                              className="tap-flat inline-flex items-center gap-1 text-xs font-semibold text-primary"
                            >
                              <Mail className="size-3.5" /> {c.email}
                            </a>
                          ) : null}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            {/* Documents */}
            <section>
              <SectionHead title="Documents & links" hint="Shared by your programme office" />
              {programme.documents.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="No documents yet"
                  body="Handbooks, forms and links your programme shares will collect here."
                />
              ) : (
                <div className="space-y-2">
                  {programme.documents.map((d) =>
                    d.linkUrl ? (
                      <a
                        key={d.id}
                        href={d.linkUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="tap block rounded-2xl border border-border bg-card p-4 shadow-card"
                      >
                        <p className="flex items-center gap-2 text-sm font-semibold">
                          <FileText className="size-4 text-primary" /> {d.label}
                        </p>
                        {d.description ? (
                          <p className="mt-1 text-xs text-muted-foreground">{d.description}</p>
                        ) : null}
                      </a>
                    ) : (
                      <Card key={d.id}>
                        <p className="flex items-center gap-2 text-sm font-semibold">
                          <FileText className="size-4 text-muted-foreground" /> {d.label}
                        </p>
                        {d.description ? (
                          <p className="mt-1 text-xs text-muted-foreground">{d.description}</p>
                        ) : null}
                        <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Not uploaded yet
                        </p>
                      </Card>
                    ),
                  )}
                </div>
              )}
            </section>

            <section className="space-y-3">
              <Link
                to="/before-you-fly"
                className="tap block rounded-2xl border border-border bg-card p-4 text-sm font-semibold shadow-card"
              >
                Open your Before you fly checklist →
              </Link>
              <button
                type="button"
                onClick={() => leave.mutate()}
                disabled={leave.isPending}
                className="tap-flat w-full rounded-2xl px-4 py-3 text-xs font-semibold text-muted-foreground underline disabled:opacity-50"
              >
                {leave.isPending ? "Leaving…" : "Leave this programme"}
              </button>
            </section>
          </div>
        )}
      </div>
    </AppShell>
  );
}
