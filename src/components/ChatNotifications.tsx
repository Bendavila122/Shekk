/**
 * Global chat notifications.
 *
 * Mounted once at the app root: listens for new messages on any conversation
 * the signed-in member belongs to and raises a toast (unless they are already
 * reading that thread), then refreshes the chat lists so unread badges move.
 */

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/lib/store";
import { socialKeys } from "@/lib/useSocial";

type MessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string | null;
  kind: string;
  body: string;
};

export function ChatNotifications() {
  const { signedIn } = useApp();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const pathRef = useRef(pathname);
  pathRef.current = pathname;

  useEffect(() => {
    if (!signedIn) return;
    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    const seen = new Set<string>();

    void supabase.auth.getUser().then(({ data }) => {
      const myId = data.user?.id;
      if (!myId || cancelled) return;

      channel = supabase
        .channel(`shekk-chat-notify:${myId}`)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
          const row = payload.new as MessageRow | null;
          if (!row?.id || seen.has(row.id)) return;
          seen.add(row.id);

          qc.invalidateQueries({ queryKey: socialKeys.chats });
          qc.invalidateQueries({ queryKey: socialKeys.chat(row.conversation_id) });

          if (row.sender_id === myId) return;
          if (pathRef.current === `/social/${row.conversation_id}`) return;
          if (typeof document !== "undefined" && document.hidden === false && pathRef.current.startsWith(`/social/${row.conversation_id}`)) return;

          const preview =
            row.kind === "payment"
              ? "💸 Sent you money"
              : row.kind === "request"
                ? "🧾 Split request"
                : row.body.slice(0, 90);

          toast("New message", {
            description: preview,
            action: {
              label: "Open",
              onClick: () => navigate({ to: "/social/$conversationId", params: { conversationId: row.conversation_id } }),
            },
          });
        })
        .subscribe();
    });

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [signedIn, qc, navigate]);

  return null;
}
