import { useMemo, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  MessageCircle,
  Plus,
  Search,
  Send,
  ShieldOff,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { AppShell, Card, PrimaryButton } from "@/components/AppShell";
import { Avatar } from "@/components/Avatar";
import { ils } from "@/lib/mock";
import { useApp } from "@/lib/store";
import { useConversations, useFriends, useProgramLink, useSendMoney, useSplits } from "@/lib/useSocial";
import type { MemberCard } from "@/lib/social.server";
import { SendMoneySheet } from "@/components/social/SendMoneySheet";
import { SplitFlow } from "@/components/social/SplitFlow";
import { ProgramLinkCard } from "@/components/social/ProgramLinkCard";

export const Route = createFileRoute("/social/")({
  head: () => ({
    meta: [
      { title: "Social · Shekk" },
      {
        name: "description",
        content:
          "Chat with your cohort, split a bill in seconds and send shekels to friends on your program — all inside Shekk.",
      },
      { property: "og:title", content: "Social · Shekk" },
      { property: "og:description", content: "Chat, split the bill and send shekels to your cohort." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Social,
});

type Tab = "chats" | "friends" | "split";

function Social() {
  const { signedIn } = useApp();
  const [tab, setTab] = useState<Tab>("chats");

  if (!signedIn) {
    return (
      <AppShell>
        <div className="px-5 py-20 text-center">
          <h1 className="text-2xl font-bold">Social</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to chat with your cohort, split bills and send shekels to friends.
          </p>
          <Link
            to="/auth"
            search={{ next: "/social" }}
            className="tap mt-5 inline-block rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
          >
            Sign in
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <header className="px-5 pt-7">
        <h1 className="text-3xl font-bold">Social</h1>
        <p className="text-sm text-muted-foreground">Your cohort, your crew, your split of the bill.</p>
      </header>

      <div className="mx-5 mt-4 grid grid-cols-3 gap-1 rounded-2xl bg-muted p-1">
        {(
          [
            ["chats", "Chats"],
            ["friends", "Friends"],
            ["split", "Split"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`tap rounded-xl py-2 text-sm font-semibold ${
              tab === k ? "bg-card shadow-card" : "text-muted-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="px-5 py-5">
        {tab === "chats" && <ChatsTab />}
        {tab === "friends" && <FriendsTab />}
        {tab === "split" && <SplitTab />}
      </div>
    </AppShell>
  );
}

/* ------------------------------------------------------------------ chats --- */

function ChatsTab() {
  const { chats, loading, createGroup } = useConversations();
  const { data } = useFriends();
  const [making, setMaking] = useState(false);
  const [title, setTitle] = useState("");
  const [picked, setPicked] = useState<string[]>([]);

  const friends = data?.friends ?? [];

  return (
    <div className="space-y-3">
      <ProgramLinkCard />

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Chats</h2>
        <button
          onClick={() => setMaking((v) => !v)}
          className="tap flex items-center gap-1 rounded-full bg-muted px-3 py-1.5 text-xs font-semibold"
        >
          <Plus className="size-3.5" /> New group
        </button>
      </div>

      {making && (
        <Card className="space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Group name — e.g. Tiyul crew"
            className="w-full rounded-2xl border border-border px-4 py-3 text-sm outline-none focus:border-primary"
          />
          {friends.length === 0 ? (
            <p className="text-xs text-muted-foreground">Add a friend first and they'll show up here.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {friends.map((f) => (
                <button
                  key={f.userId}
                  onClick={() =>
                    setPicked((p) => (p.includes(f.userId) ? p.filter((x) => x !== f.userId) : [...p, f.userId]))
                  }
                  className={`tap rounded-2xl border p-3 text-center ${
                    picked.includes(f.userId) ? "border-primary bg-primary-soft" : "border-border"
                  }`}
                >
                  <Avatar name={f.displayName} src={f.avatarUrl} className="mx-auto mb-1 size-9" textClassName="text-xs" />
                  <span className="block truncate text-[11px] font-semibold">{f.displayName.split(" ")[0]}</span>
                </button>
              ))}
            </div>
          )}
          <PrimaryButton
            disabled={!title.trim() || picked.length === 0 || createGroup.isPending}
            onClick={() =>
              createGroup.mutate(
                { title, memberIds: picked },
                {
                  onSuccess: () => {
                    setMaking(false);
                    setTitle("");
                    setPicked([]);
                  },
                },
              )
            }
          >
            Create group
          </PrimaryButton>
        </Card>
      )}

      {loading && <p className="py-8 text-center text-sm text-muted-foreground">Loading your chats…</p>}

      {!loading && chats.length === 0 && (
        <Card className="space-y-2 text-center">
          <MessageCircle className="mx-auto size-8 text-muted-foreground" />
          <p className="text-sm font-semibold">No chats yet</p>
          <p className="text-xs text-muted-foreground">
            Add a friend or join your program cohort and your threads land here.
          </p>
        </Card>
      )}

      {chats.map((c) => (
        <Link
          key={c.id}
          to="/social/$conversationId"
          params={{ conversationId: c.id }}
          className="tap-flat flex items-center gap-3 rounded-2xl bg-card p-3 shadow-card"
        >
          <Avatar name={c.avatarName} className="size-11" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-semibold">{c.title}</p>
              {c.kind === "cohort" && (
                <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-semibold text-primary">
                  Cohort
                </span>
              )}
            </div>
            <p className="truncate text-xs text-muted-foreground">{c.lastMessage ?? c.subtitle ?? "Say something first"}</p>
          </div>
          {c.unread > 0 && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-primary-foreground">
              {c.unread}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- friends --- */

function FriendsTab() {
  const { data, loading, search, add, respond, remove, block } = useFriends();
  const { openDm } = useConversations();
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<MemberCard[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [payTo, setPayTo] = useState<MemberCard | null>(null);

  const runSearch = async () => {
    if (term.trim().length < 2) {
      setResults(null);
      return;
    }
    setSearching(true);
    try {
      setResults(await search(term));
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-5">
      {payTo && <SendMoneySheet member={payTo} onClose={() => setPayTo(null)} />}

      <Card className="space-y-3">
        <p className="text-sm font-semibold">Find someone</p>
        <div className="flex gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-2xl border border-border px-3">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runSearch()}
              placeholder="@handle, email or phone"
              className="w-full bg-transparent py-3 text-sm outline-none"
            />
          </div>
          <button
            onClick={runSearch}
            className="tap rounded-2xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
          >
            Search
          </button>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Handles search as you type. Email and phone only match exactly, and only for members who allow it.
        </p>

        {searching && <p className="text-xs text-muted-foreground">Looking…</p>}
        {results?.length === 0 && <p className="text-xs text-muted-foreground">Nobody found — check the spelling.</p>}
        {results?.map((m) => (
          <MemberRow
            key={m.userId}
            member={m}
            action={
              <button
                onClick={() => add.mutate(m.userId)}
                className="tap flex items-center gap-1 rounded-full bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
              >
                <UserPlus className="size-3.5" /> Add
              </button>
            }
          />
        ))}
      </Card>

      {loading && <p className="py-6 text-center text-sm text-muted-foreground">Loading…</p>}

      {data && data.incoming.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Requests</h2>
          <Card className="divide-y divide-border p-0">
            {data.incoming.map((r) => (
              <div key={r.id} className="flex items-center gap-3 p-3">
                <Avatar name={r.from.displayName} src={r.from.avatarUrl} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{r.from.displayName}</p>
                  <p className="truncate text-xs text-muted-foreground">@{r.from.handle}</p>
                </div>
                <button
                  aria-label="Accept"
                  onClick={() => respond.mutate({ friendshipId: r.id, action: "accept" })}
                  className="tap rounded-full bg-success p-2 text-white"
                >
                  <Check className="size-4" />
                </button>
                <button
                  aria-label="Decline"
                  onClick={() => respond.mutate({ friendshipId: r.id, action: "decline" })}
                  className="tap rounded-full bg-muted p-2"
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}
          </Card>
        </section>
      )}

      {data && data.suggestions.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            On your program
          </h2>
          <Card className="divide-y divide-border p-0">
            {data.suggestions.map((m) => (
              <MemberRow
                key={m.userId}
                member={m}
                action={
                  <button
                    onClick={() => add.mutate(m.userId)}
                    className="tap rounded-full bg-muted px-3 py-2 text-xs font-semibold"
                  >
                    Add
                  </button>
                }
              />
            ))}
          </Card>
        </section>
      )}

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Friends {data ? `· ${data.friends.length}` : ""}
        </h2>
        <Card className="divide-y divide-border p-0">
          {(!data || data.friends.length === 0) && (
            <p className="p-4 text-sm text-muted-foreground">
              No friends yet. Search a handle above, or scan a friend's pay code on the Card screen.
            </p>
          )}
          {data?.friends.map((m) => (
            <MemberRow
              key={m.userId}
              member={m}
              action={
                <div className="flex items-center gap-1">
                  <button
                    aria-label={`Message ${m.displayName}`}
                    onClick={() => openDm.mutate(m.userId)}
                    className="tap rounded-full bg-muted p-2"
                  >
                    <MessageCircle className="size-4" />
                  </button>
                  <button
                    onClick={() => setPayTo(m)}
                    className="tap rounded-full bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
                  >
                    Send
                  </button>
                </div>
              }
              extra={
                <div className="flex gap-3 pl-13 pt-1 text-[11px] font-semibold text-muted-foreground">
                  <button onClick={() => remove.mutate(m.userId)} className="tap-flat">
                    Remove
                  </button>
                  <button
                    onClick={() => block.mutate({ otherId: m.userId, blocked: true })}
                    className="tap-flat flex items-center gap-1 text-destructive"
                  >
                    <ShieldOff className="size-3" /> Block
                  </button>
                </div>
              }
            />
          ))}
        </Card>
      </section>

      {data && data.blocked.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Blocked</h2>
          <Card className="divide-y divide-border p-0">
            {data.blocked.map((m) => (
              <MemberRow
                key={m.userId}
                member={m}
                action={
                  <button
                    onClick={() => block.mutate({ otherId: m.userId, blocked: false })}
                    className="tap rounded-full bg-muted px-3 py-2 text-xs font-semibold"
                  >
                    Unblock
                  </button>
                }
              />
            ))}
          </Card>
        </section>
      )}
    </div>
  );
}

export function MemberRow({
  member,
  action,
  extra,
}: {
  member: MemberCard;
  action?: React.ReactNode;
  extra?: React.ReactNode;
}) {
  return (
    <div className="p-3">
      <div className="flex items-center gap-3">
        <Avatar name={member.displayName} src={member.avatarUrl} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{member.displayName}</p>
          <p className="truncate text-xs text-muted-foreground">
            @{member.handle}
            {member.program ? ` · ${member.program}` : ""}
          </p>
        </div>
        {action}
      </div>
      {extra}
    </div>
  );
}

/* ----------------------------------------------------------------- splits --- */

function SplitTab() {
  const { bills, loading, pay, decline, cancel } = useSplits();
  const owed = useMemo(() => bills.filter((b) => !b.mine && b.myShare && b.myShare.status === "pending"), [bills]);
  const mine = useMemo(() => bills.filter((b) => b.mine), [bills]);

  return (
    <div className="space-y-5">
      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Requests for you</h2>
        <Card className="divide-y divide-border p-0">
          {loading && <p className="p-4 text-sm text-muted-foreground">Loading…</p>}
          {!loading && owed.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground">No one is waiting on you.</p>
          )}
          {owed.map((b) => (
            <div key={b.id} className="flex items-center gap-3 p-4">
              <Avatar name={b.creator?.displayName ?? "Shekk"} src={b.creator?.avatarUrl} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{b.creator?.displayName ?? "A member"}</p>
                <p className="truncate text-xs text-muted-foreground">{b.note || "Split the bill"}</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => decline.mutate(b.myShare!.id)}
                  className="tap rounded-full bg-muted px-2.5 py-2 text-xs font-semibold"
                >
                  No
                </button>
                <button
                  disabled={pay.isPending}
                  onClick={() => pay.mutate(b.myShare!.id)}
                  className="tap rounded-full bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground"
                >
                  Pay {ils(b.myShare!.amount)}
                </button>
              </div>
            </div>
          ))}
        </Card>
        {pay.error && <p className="mt-2 text-xs font-semibold text-destructive">{(pay.error as Error).message}</p>}
      </section>

      <SplitFlow />

      {mine.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Your splits</h2>
          <div className="space-y-3">
            {mine.map((b) => {
              const paid = b.shares.filter((s) => s.status === "paid").length;
              return (
                <Card key={b.id} className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{b.note || "Split the bill"}</p>
                      <p className="text-xs text-muted-foreground">
                        {ils(b.total)} · {paid}/{b.shares.length} paid
                      </p>
                    </div>
                    {b.status === "open" ? (
                      <button
                        onClick={() => cancel.mutate(b.id)}
                        className="tap shrink-0 rounded-full bg-muted px-3 py-1.5 text-[11px] font-semibold"
                      >
                        Cancel
                      </button>
                    ) : (
                      <span className="shrink-0 rounded-full bg-success-soft px-3 py-1.5 text-[11px] font-semibold text-success">
                        Settled
                      </span>
                    )}
                  </div>
                  <div className="divide-y divide-border">
                    {b.shares.map((s) => (
                      <div key={s.id} className="flex items-center gap-2 py-2">
                        <Avatar name={s.member?.displayName ?? "Member"} className="size-7" textClassName="text-[10px]" />
                        <p className="min-w-0 flex-1 truncate text-xs font-semibold">
                          {s.member?.displayName ?? "Member"}
                        </p>
                        <span className="text-xs text-muted-foreground">{ils(s.amount)}</span>
                        <span
                          className={`text-[11px] font-semibold ${
                            s.status === "paid"
                              ? "text-success"
                              : s.status === "declined"
                                ? "text-destructive"
                                : "text-muted-foreground"
                          }`}
                        >
                          {s.status === "paid" ? "Paid" : s.status === "declined" ? "Declined" : "Waiting"}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

/* Kept here so the tab bar has a home for a future feed. */
export function QuickSend({ member }: { member: MemberCard }) {
  const send = useSendMoney();
  return (
    <button
      onClick={() => send.mutate({ toUserId: member.userId, amount: 10 })}
      className="tap flex items-center gap-1 text-xs font-semibold text-primary"
    >
      Send <ArrowRight className="size-3" />
    </button>
  );
}

export { Users };
