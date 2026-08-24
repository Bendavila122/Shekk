import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  CalendarPlus,
  CheckSquare,
  Copy,
  FileText,
  MapPin,
  Megaphone,
  Phone,
  Plus,
  Users,
  Vote,
} from "lucide-react";
import { Card } from "@/components/AppShell";
import { EmptyState, SectionHead, StatusPill } from "@/components/Kit";
import {
  useCohortInvite,
  useParticipants,
  useProgrammeHub,
  useStaffActions,
} from "@/lib/useProgrammeHub";
import {
  ActionButton,
  Field,
  Freshness,
  Sheet,
  StatusChip,
  fmtDay,
  fmtTime,
  inputClass,
} from "@/components/programme/Bits";
import {
  AnnouncementComposer,
  ContentEditor,
  EventEditor,
  EventOpsSheet,
  GroupSheet,
  StaffVoteCard,
  VoteComposer,
} from "@/components/programme/Staff";
import { staffCan, type ProgrammeEvent, type ProgrammeGroup } from "@/lib/programme/logic";

export const Route = createFileRoute("/programme/staff")({
  head: () => ({
    meta: [
      { title: "Run the day · Programme staff · Shekk" },
      {
        name: "description",
        content:
          "Programme staff operations: delay or move an event, post an urgent notice, open a vote and see who has confirmed.",
      },
      { property: "og:title", content: "Run the day · Programme staff · Shekk" },
      { property: "og:description", content: "Live programme operations from your phone." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StaffScreen,
});

const TABS = ["Today", "Schedule", "Post", "Votes", "People", "Content"] as const;
type Tab = (typeof TABS)[number];

function StaffScreen() {
  const { hub, isStaff, today } = useProgrammeHub();
  const { seedChecklist, createGroup, deleteAnnouncement, deleteContent } = useStaffActions();
  const [tab, setTab] = useState<Tab>("Today");
  const [editing, setEditing] = useState<ProgrammeEvent | null>(null);
  const [creating, setCreating] = useState(false);
  const [ops, setOps] = useState<ProgrammeEvent | null>(null);
  const [composer, setComposer] = useState<"announcement" | "vote" | null>(null);
  const [content, setContent] = useState<"checklist_item" | "document" | "contact" | "place" | null>(null);
  const [group, setGroup] = useState<ProgrammeGroup | null>(null);
  const [newGroup, setNewGroup] = useState(false);
  const [groupName, setGroupName] = useState("");

  const participants = useParticipants(hub.cohortId, isStaff);
  const invite = useCohortInvite(hub.cohortId, isStaff && tab === "People");

  const people = useMemo(
    () => (participants.data ?? []).map((p) => ({ userId: p.userId, name: p.name || p.email || "Participant" })),
    [participants.data],
  );

  if (!isStaff) {
    return (
      <div className="px-4 pt-6">
        <EmptyState
          icon={Users}
          title="Staff only"
          body="This is the operations side of your programme. If you should have access, ask your programme owner to invite you."
        />
      </div>
    );
  }

  const canEvents = staffCan(hub.staff, "manage_events");
  const canAnnounce = staffCan(hub.staff, "manage_announcements");
  const canVotes = staffCan(hub.staff, "manage_votes");
  const canContent = staffCan(hub.staff, "manage_content");
  const canPeople = staffCan(hub.staff, "manage_people");

  const upcoming = [...hub.events]
    .filter((e) => new Date(e.startsAt).getTime() > Date.now() - 6 * 60 * 60 * 1000)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));

  return (
    <div className="space-y-6 px-4 pb-24 pt-4">
      <div className="flex gap-1.5 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`tap-flat shrink-0 rounded-full px-3.5 py-2 text-[12.5px] font-bold ${
              tab === t ? "bg-primary text-primary-foreground" : "border border-border bg-card text-muted-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Today: the live ops screen. One tap to delay, move or cancel. ── */}
      {tab === "Today" ? (
        <section className="space-y-2">
          <SectionHead
            title="Running today"
            hint="Tap an event to delay, move or cancel it — everyone affected is told."
          />
          {today.length === 0 ? (
            <EmptyState icon={CalendarPlus} title="Nothing today" body="Add something from the Schedule tab." />
          ) : (
            today.map((e) => (
              <button key={e.id} type="button" onClick={() => setOps(e)} className="tap block w-full text-left">
                <Card>
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-bold text-primary">{fmtTime(e.startsAt)}</span>
                    <StatusChip status={e.status} />
                    <Freshness event={e} />
                  </div>
                  <p className="mt-1 text-sm font-semibold">{e.title}</p>
                  <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                    {e.locationLabel ?? "No location set"}
                    {e.rsvpEnabled ? ` · ${e.goingCount ?? 0} going${e.capacity ? `/${e.capacity}` : ""}` : ""}
                    {e.requiresAck ? ` · ${e.ackCount ?? 0} confirmed` : ""}
                  </p>
                </Card>
              </button>
            ))
          )}
        </section>
      ) : null}

      {/* ── Schedule: create and edit ── */}
      {tab === "Schedule" ? (
        <section className="space-y-2">
          <SectionHead
            title="Timetable"
            action={
              canEvents ? (
                <button type="button" onClick={() => setCreating(true)} className="tap-flat text-[12px] font-bold text-primary">
                  + New event
                </button>
              ) : undefined
            }
          />
          {upcoming.length === 0 ? (
            <EmptyState icon={CalendarPlus} title="Nothing scheduled" body="Publish your first event — participants see it instantly." />
          ) : (
            upcoming.map((e) => (
              <button key={e.id} type="button" onClick={() => setEditing(e)} className="tap block w-full text-left">
                <Card>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-bold text-muted-foreground">
                      {fmtDay(e.startsAt)} {fmtTime(e.startsAt)}
                    </span>
                    <StatusChip status={e.status} />
                    {e.mandatory ? <StatusPill tone="attention">Mandatory</StatusPill> : null}
                  </div>
                  <p className="mt-1 text-sm font-semibold">{e.title}</p>
                </Card>
              </button>
            ))
          )}
        </section>
      ) : null}

      {/* ── Post: announcements ── */}
      {tab === "Post" ? (
        <section className="space-y-2">
          <SectionHead
            title="Announcements"
            action={
              canAnnounce ? (
                <button type="button" onClick={() => setComposer("announcement")} className="tap-flat text-[12px] font-bold text-primary">
                  + New post
                </button>
              ) : undefined
            }
          />
          {hub.announcements.length === 0 ? (
            <EmptyState icon={Megaphone} title="Nothing posted yet" body="Urgent posts alert every participant in the audience." />
          ) : (
            hub.announcements.map((a) => (
              <Card key={a.id}>
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{a.title}</p>
                    <p className="mt-0.5 text-[12px] text-muted-foreground">{a.body}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {fmtDay(a.publishedAt)} · {a.priority}
                      {a.requiresAck ? ` · ${a.ackCount ?? 0} confirmed` : ""}
                    </p>
                  </div>
                  {canAnnounce ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm("Delete this announcement?")) deleteAnnouncement.mutate({ id: a.id });
                      }}
                      className="tap-flat text-[11px] font-bold text-destructive"
                    >
                      Delete
                    </button>
                  ) : null}
                </div>
              </Card>
            ))
          )}
        </section>
      ) : null}

      {/* ── Votes ── */}
      {tab === "Votes" ? (
        <section className="space-y-2">
          <SectionHead
            title="Votes"
            action={
              canVotes ? (
                <button type="button" onClick={() => setComposer("vote")} className="tap-flat text-[12px] font-bold text-primary">
                  + New vote
                </button>
              ) : undefined
            }
          />
          {hub.votes.length === 0 ? (
            <EmptyState icon={Vote} title="No votes yet" body="Ask the cohort to choose — then turn the winner into an event." />
          ) : (
            hub.votes.map((v) => <StaffVoteCard key={v.id} vote={v} />)
          )}
        </section>
      ) : null}

      {/* ── People: participants, groups, join code ── */}
      {tab === "People" ? (
        <div className="space-y-6">
          <section>
            <SectionHead title="Join code" hint="Share this with participants. Only they can use it." />
            <Card>
              {invite.isLoading ? (
                <p className="text-[12px] text-muted-foreground">Loading…</p>
              ) : invite.data ? (
                <div className="flex items-center gap-3">
                  <p className="font-display text-2xl font-bold tracking-widest">{invite.data.joinCode}</p>
                  <button
                    type="button"
                    onClick={() => void navigator.clipboard?.writeText(invite.data!.joinCode)}
                    className="tap-flat flex items-center gap-1.5 rounded-xl bg-muted px-3 py-2 text-[12px] font-bold"
                  >
                    <Copy className="size-3.5" /> Copy
                  </button>
                </div>
              ) : (
                <p className="text-[12px] text-muted-foreground">No code available.</p>
              )}
            </Card>
          </section>

          <section>
            <SectionHead
              title={`Groups (${hub.myGroups.length})`}
              action={
                canPeople ? (
                  <button type="button" onClick={() => setNewGroup(true)} className="tap-flat text-[12px] font-bold text-primary">
                    + Group
                  </button>
                ) : undefined
              }
            />
            {hub.myGroups.length === 0 ? (
              <EmptyState icon={Users} title="No groups yet" body="Groups let you send things to one bus, dorm or track." />
            ) : (
              <div className="space-y-2">
                {hub.myGroups.map((g) => (
                  <button key={g.id} type="button" onClick={() => setGroup(g)} className="tap block w-full text-left">
                    <Card>
                      <p className="text-sm font-semibold">{g.name}</p>
                      <p className="text-[11.5px] text-muted-foreground">{g.memberCount} members</p>
                    </Card>
                  </button>
                ))}
              </div>
            )}
          </section>

          <section>
            <SectionHead title={`Participants (${people.length})`} />
            {participants.isLoading ? (
              <p className="px-1 text-[12px] text-muted-foreground">Loading…</p>
            ) : people.length === 0 ? (
              <EmptyState icon={Users} title="Nobody yet" body="Share the join code above to get your cohort in." />
            ) : (
              <div className="space-y-1.5">
                {(participants.data ?? []).map((p) => (
                  <Card key={p.userId} className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="truncate text-[13.5px] font-semibold">{p.name || "Participant"}</p>
                      {p.email ? <p className="truncate text-[11px] text-muted-foreground">{p.email}</p> : null}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : null}

      {/* ── Content: checklist, documents, contacts, places ── */}
      {tab === "Content" ? (
        <div className="space-y-6">
          <section>
            <SectionHead
              title="Checklist"
              action={
                canContent ? (
                  <button type="button" onClick={() => setContent("checklist_item")} className="tap-flat text-[12px] font-bold text-primary">
                    + Item
                  </button>
                ) : undefined
              }
            />
            {hub.checklist.length === 0 ? (
              <div className="space-y-2">
                <EmptyState icon={CheckSquare} title="No checklist" body="Start from Shekk's standard pre-arrival list, then edit it." />
                {canContent ? (
                  <ActionButton
                    className="w-full"
                    disabled={seedChecklist.isPending || !hub.cohortId}
                    onClick={() => hub.cohortId && seedChecklist.mutate({ cohortId: hub.cohortId })}
                  >
                    {seedChecklist.isPending ? "Adding…" : "Use the standard checklist"}
                  </ActionButton>
                ) : null}
              </div>
            ) : (
              <div className="space-y-1.5">
                {hub.checklist.map((i) => (
                  <Card key={i.id} className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[13.5px] font-semibold">{i.title}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {i.required ? "Required" : "Optional"}
                        {i.dueOn ? ` · due ${fmtDay(i.dueOn)}` : ""} · {i.doneCount ?? 0} done
                      </p>
                    </div>
                    {canContent && hub.cohortId ? (
                      <button
                        type="button"
                        onClick={() =>
                          deleteContent.mutate({ kind: "checklist_item", cohortId: hub.cohortId!, id: i.id })
                        }
                        className="tap-flat text-[11px] font-bold text-destructive"
                      >
                        Remove
                      </button>
                    ) : null}
                  </Card>
                ))}
              </div>
            )}
          </section>

          <StaffContentList
            title="Contacts"
            icon={Phone}
            empty="Add the madrichim and the emergency number."
            rows={hub.contacts.map((c) => ({ id: c.id, primary: c.name, secondary: c.role ?? c.category }))}
            onAdd={canContent ? () => setContent("contact") : undefined}
            onRemove={canContent && hub.cohortId ? (id) => deleteContent.mutate({ kind: "contact", cohortId: hub.cohortId!, id }) : undefined}
          />

          <StaffContentList
            title="Documents"
            icon={FileText}
            empty="Forms, letters and packing lists."
            rows={hub.documents.map((d) => ({ id: d.id, primary: d.label, secondary: d.category }))}
            onAdd={canContent ? () => setContent("document") : undefined}
            onRemove={canContent && hub.cohortId ? (id) => deleteContent.mutate({ kind: "document", cohortId: hub.cohortId!, id }) : undefined}
          />

          <StaffContentList
            title="Places"
            icon={MapPin}
            empty="Campus, dorm, meeting points."
            rows={hub.places.map((p) => ({ id: p.id, primary: p.label, secondary: p.address ?? p.category }))}
            onAdd={canContent ? () => setContent("place") : undefined}
            onRemove={canContent && hub.cohortId ? (id) => deleteContent.mutate({ kind: "place", cohortId: hub.cohortId!, id }) : undefined}
          />
        </div>
      ) : null}

      {creating ? <EventEditor hub={hub} event={null} people={people} onClose={() => setCreating(false)} /> : null}
      {editing ? <EventEditor hub={hub} event={editing} people={people} onClose={() => setEditing(null)} /> : null}
      {ops ? <EventOpsSheet event={ops} onClose={() => setOps(null)} /> : null}
      {composer === "announcement" ? (
        <AnnouncementComposer hub={hub} people={people} onClose={() => setComposer(null)} />
      ) : null}
      {composer === "vote" ? <VoteComposer hub={hub} people={people} onClose={() => setComposer(null)} /> : null}
      {content ? <ContentEditor hub={hub} kind={content} people={people} onClose={() => setContent(null)} /> : null}
      {group ? <GroupSheet group={group} people={people} onClose={() => setGroup(null)} /> : null}

      {newGroup ? (
        <Sheet open onClose={() => setNewGroup(false)} title="New group">
          <div className="space-y-3">
            <Field label="Group name" hint="Bus 2, Girls' dorm, Ulpan A…">
              <input value={groupName} onChange={(e) => setGroupName(e.target.value)} className={inputClass} />
            </Field>
            <ActionButton
              className="w-full"
              disabled={createGroup.isPending || !groupName.trim() || !hub.cohortId}
              onClick={() =>
                hub.cohortId &&
                createGroup.mutate(
                  { cohortId: hub.cohortId, name: groupName.trim() },
                  {
                    onSuccess: () => {
                      setGroupName("");
                      setNewGroup(false);
                    },
                  },
                )
              }
            >
              {createGroup.isPending ? "Creating…" : "Create group"}
            </ActionButton>
          </div>
        </Sheet>
      ) : null}

      {/* One-tap create, always reachable with a thumb. */}
      {canEvents && (tab === "Today" || tab === "Schedule") ? (
        <button
          type="button"
          onClick={() => setCreating(true)}
          aria-label="New event"
          className="tap fixed bottom-24 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full bg-primary px-5 py-3.5 text-[13.5px] font-bold text-primary-foreground shadow-lift"
        >
          <Plus className="size-4" /> New event
        </button>
      ) : null}
    </div>
  );
}

function StaffContentList({
  title,
  icon: Icon,
  empty,
  rows,
  onAdd,
  onRemove,
}: {
  title: string;
  icon: typeof Phone;
  empty: string;
  rows: { id: string; primary: string; secondary: string | null }[];
  onAdd?: () => void;
  onRemove?: (id: string) => void;
}) {
  return (
    <section>
      <SectionHead
        title={title}
        action={
          onAdd ? (
            <button type="button" onClick={onAdd} className="tap-flat text-[12px] font-bold text-primary">
              + Add
            </button>
          ) : undefined
        }
      />
      {rows.length === 0 ? (
        <EmptyState icon={Icon} title={`No ${title.toLowerCase()} yet`} body={empty} />
      ) : (
        <div className="space-y-1.5">
          {rows.map((r) => (
            <Card key={r.id} className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-[13.5px] font-semibold">{r.primary}</p>
                {r.secondary ? <p className="truncate text-[11px] text-muted-foreground">{r.secondary}</p> : null}
              </div>
              {onRemove ? (
                <button
                  type="button"
                  onClick={() => onRemove(r.id)}
                  className="tap-flat text-[11px] font-bold text-destructive"
                >
                  Remove
                </button>
              ) : null}
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
