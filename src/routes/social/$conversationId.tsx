import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Banknote, LogOut, Send, UserPlus } from "lucide-react";
import { AppShell, Card } from "@/components/AppShell";
import { Avatar } from "@/components/Avatar";
import { ils } from "@/lib/mock";
import { useApp } from "@/lib/store";
import { useConversation, useFriends } from "@/lib/useSocial";
import { SendMoneySheet } from "@/components/social/SendMoneySheet";
import type { MemberCard } from "@/lib/social.server";

export const Route = createFileRoute("/social/$conversationId")({
  head: () => ({
    meta: [
      { title: "Chat · Shekk" },
      { name: "description", content: "Message your group and send shekels without leaving the thread." },
      { property: "og:title", content: "Chat · Shekk" },
      { property: "og:description", content: "Message your group and send shekels inside the chat." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Thread,
});

function dayLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const isSame = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  const yesterday = new Date(today.getTime() - 86_400_000);
  if (isSame(d, today)) return "Today";
  if (isSame(d, yesterday)) return "Yesterday";
  return d.toLocaleDateString([], { weekday: "short", day: "numeric", month: "short" });
}

function Thread() {
  const { conversationId } = useParams({ from: "/social/$conversationId" });
  const navigate = useNavigate();
  const { signedIn } = useApp();
  const { conversation, loading, error, send, leave, invite } = useConversation(conversationId);
  const { data: friendData } = useFriends();
  const [draft, setDraft] = useState("");
  const [payTo, setPayTo] = useState<MemberCard | null>(null);
  const [adding, setAdding] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const messages = useMemo(() => conversation?.messages ?? [], [conversation]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [conversationId]);

  if (!signedIn) {
    return (
      <AppShell>
        <p className="px-5 py-20 text-center text-sm text-muted-foreground">Sign in to open this chat.</p>
      </AppShell>
    );
  }

  const other = conversation?.members.find((m) => m.userId === conversation.otherUserId) ?? null;
  const invitable = (friendData?.friends ?? []).filter(
    (f) => !conversation?.members.some((m) => m.userId === f.userId),
  );

  const submit = () => {
    const body = draft.trim();
    if (!body || send.isPending) return;
    setDraft("");
    send.mutate(body);
    inputRef.current?.focus();
  };

  return (
    <AppShell>
      {payTo && <SendMoneySheet member={payTo} conversationId={conversationId} onClose={() => setPayTo(null)} />}

      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-card/95 px-4 py-3 pr-16 backdrop-blur lg:pr-4">
        <button aria-label="Back" onClick={() => navigate({ to: "/social" })} className="tap rounded-full bg-muted p-2">
          <ArrowLeft className="size-4" />
        </button>
        <Avatar name={conversation?.title ?? "Chat"} className="size-9" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{conversation?.title ?? "Chat"}</p>
          <p className="truncate text-xs text-muted-foreground">
            {conversation?.subtitle ?? (loading ? "Loading…" : "")}
          </p>
        </div>
        {conversation?.kind === "dm" && other && (
          <button
            aria-label="Send money"
            onClick={() => setPayTo(other)}
            className="tap rounded-full bg-primary p-2 text-primary-foreground"
          >
            <Banknote className="size-4" />
          </button>
        )}
        {conversation?.kind !== "dm" && conversation && (
          <button aria-label="Add people" onClick={() => setAdding((v) => !v)} className="tap rounded-full bg-muted p-2">
            <UserPlus className="size-4" />
          </button>
        )}
      </header>

      {adding && (
        <Card className="mx-4 mt-3 space-y-2">
          <p className="text-sm font-semibold">Add friends to this group</p>
          {invitable.length === 0 && <p className="text-xs text-muted-foreground">Everyone you know is already here.</p>}
          {invitable.map((f) => (
            <button
              key={f.userId}
              onClick={() => invite.mutate([f.userId], { onSuccess: () => setAdding(false) })}
              className="tap flex w-full items-center gap-3 rounded-2xl bg-muted p-2 text-left"
            >
              <Avatar name={f.displayName} src={f.avatarUrl} className="size-8" textClassName="text-[10px]" />
              <span className="min-w-0 flex-1 truncate text-sm font-semibold">{f.displayName}</span>
              <span className="text-xs font-semibold text-primary">Add</span>
            </button>
          ))}
        </Card>
      )}

      {/* messages — bottom padding clears the fixed composer + tab bar */}
      <div className="space-y-2 px-4 py-4 pb-52 lg:pb-6">
        {loading && (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className={`flex ${i === 1 ? "justify-end" : "justify-start"}`}>
                <div className="h-12 w-40 animate-pulse rounded-2xl bg-muted" />
              </div>
            ))}
          </div>
        )}
        {error && <p className="py-10 text-center text-sm text-destructive">{error.message}</p>}
        {!loading && !error && messages.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">No messages yet — say something first.</p>
        )}

        {messages.map((m, i) => {
          const prev = messages[i - 1];
          const showDay = !prev || dayLabel(prev.createdAt) !== dayLabel(m.createdAt);

          if (m.kind === "system") {
            return (
              <div key={m.id} className="space-y-2">
                {showDay && <DaySeparator label={dayLabel(m.createdAt)} />}
                <p className="text-center text-[11px] font-semibold text-muted-foreground">{m.body}</p>
              </div>
            );
          }

          const money = m.kind === "payment" && typeof m.meta.amount === "number";
          const grouped = !showDay && prev && prev.kind !== "system" && prev.senderId === m.senderId;

          return (
            <div key={m.id} className="space-y-2">
              {showDay && <DaySeparator label={dayLabel(m.createdAt)} />}
              <div className={`flex ${m.mine ? "justify-end" : "justify-start"} ${grouped ? "" : "pt-1"}`}>
                <div
                  className={`max-w-[80%] px-4 py-2.5 text-sm ${
                    money
                      ? "rounded-2xl bg-success-soft text-foreground"
                      : m.mine
                        ? "rounded-2xl rounded-br-md bg-primary text-primary-foreground"
                        : "rounded-2xl rounded-bl-md bg-card shadow-card"
                  } ${m.pending ? "opacity-60" : ""}`}
                >
                  {!m.mine && conversation?.kind !== "dm" && !grouped && (
                    <p className="mb-1 text-xs font-semibold text-primary">{m.senderName}</p>
                  )}
                  {money ? (
                    <>
                      <p className="font-display text-xl font-bold">{ils(m.meta.amount as number)}</p>
                      <p className="text-xs text-muted-foreground">{m.body}</p>
                    </>
                  ) : (
                    <p className="whitespace-pre-wrap break-words">{m.body}</p>
                  )}
                  <p className={`mt-1 text-[10px] ${m.mine && !money ? "opacity-70" : "text-muted-foreground"}`}>
                    {m.pending
                      ? "Sending…"
                      : new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />

        {conversation && conversation.kind !== "dm" && (
          <div className="pt-6">
            <button
              onClick={() => leave.mutate(undefined, { onSuccess: () => navigate({ to: "/social" }) })}
              className="tap-flat flex items-center gap-1 text-xs font-semibold text-destructive"
            >
              <LogOut className="size-3" /> Leave this chat
            </button>
          </div>
        )}
      </div>

      {/* composer sits above the tab bar on mobile, inline on desktop */}
      <div
        style={{ bottom: "calc(60px + env(safe-area-inset-bottom))" }}
        className="fixed left-1/2 z-30 w-full max-w-[430px] -translate-x-1/2 border-t border-border bg-card/95 px-4 py-3 backdrop-blur lg:sticky lg:!bottom-0 lg:left-auto lg:max-w-none lg:translate-x-0"
      >

        {send.isError && (
          <p className="pb-2 text-xs text-destructive">{(send.error as Error)?.message ?? "Message didn't send"}</p>
        )}
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            rows={1}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Message…"
            className="max-h-32 flex-1 resize-none rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
          />
          <button
            aria-label="Send message"
            onClick={submit}
            disabled={!draft.trim() || send.isPending}
            className="tap flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-40"
          >
            <Send className="size-4" />
          </button>
        </div>
      </div>
    </AppShell>
  );
}

function DaySeparator({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="h-px flex-1 bg-border" />
      <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
