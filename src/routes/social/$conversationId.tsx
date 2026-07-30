import { useEffect, useRef, useState } from "react";
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

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [conversation?.messages.length]);

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
    if (!body) return;
    setDraft("");
    send.mutate(body);
  };

  return (
    <AppShell>
      {payTo && <SendMoneySheet member={payTo} conversationId={conversationId} onClose={() => setPayTo(null)} />}

      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-card/95 px-4 py-3 backdrop-blur">
        <button aria-label="Back" onClick={() => navigate({ to: "/social" })} className="tap rounded-full bg-muted p-2">
          <ArrowLeft className="size-4" />
        </button>
        <Avatar name={conversation?.title ?? "Chat"} className="size-9" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{conversation?.title ?? "Chat"}</p>
          <p className="truncate text-xs text-muted-foreground">
            {conversation?.subtitle ?? `${conversation?.members.length ?? 0} members`}
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
        {conversation?.kind === "group" && (
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

      <div className="space-y-3 px-4 py-4">
        {loading && <p className="py-10 text-center text-sm text-muted-foreground">Loading messages…</p>}
        {error && <p className="py-10 text-center text-sm text-destructive">{error.message}</p>}
        {conversation?.messages.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">No messages yet — say something first.</p>
        )}

        {conversation?.messages.map((m) => {
          if (m.kind === "system") {
            return (
              <p key={m.id} className="text-center text-[11px] font-semibold text-muted-foreground">
                {m.body}
              </p>
            );
          }
          const money = m.kind === "payment" && typeof m.meta.amount === "number";
          return (
            <div key={m.id} className={`flex ${m.mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                  money
                    ? "bg-success-soft text-foreground"
                    : m.mine
                      ? "bg-primary text-primary-foreground"
                      : "bg-card shadow-card"
                }`}
              >
                {!m.mine && conversation.kind !== "dm" && (
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
                  {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <div className="sticky bottom-20 z-20 flex gap-2 border-t border-border bg-card/95 px-4 py-3 backdrop-blur">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Message…"
          className="flex-1 rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
        />
        <button
          aria-label="Send message"
          onClick={submit}
          disabled={!draft.trim() || send.isPending}
          className="tap rounded-2xl bg-primary px-4 text-primary-foreground disabled:opacity-50"
        >
          <Send className="size-4" />
        </button>
      </div>

      {conversation && conversation.kind !== "dm" && (
        <div className="px-4 pb-6">
          <button
            onClick={() => leave.mutate(undefined, { onSuccess: () => navigate({ to: "/social" }) })}
            className="tap-flat flex items-center gap-1 text-xs font-semibold text-destructive"
          >
            <LogOut className="size-3" /> Leave this chat
          </button>
        </div>
      )}
    </AppShell>
  );
}
