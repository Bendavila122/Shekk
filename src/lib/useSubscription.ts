import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getStripeEnvironment } from "@/lib/stripe";

export type MembershipSubscription = {
  status: string;
  priceId: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
};

function isActive(row: { status: string; current_period_end: string | null }) {
  const future = !row.current_period_end || new Date(row.current_period_end) > new Date();
  if (["active", "trialing", "past_due"].includes(row.status)) return future;
  if (row.status === "canceled") return future;
  return false;
}

/** Reads the signed-in member's Shekk+ subscription, live-updating on change. */
export function useSubscription() {
  const [subscription, setSubscription] = useState<MembershipSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    let environment: string;
    try {
      environment = getStripeEnvironment();
    } catch {
      setSubscription(null);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("subscriptions")
      .select("status, price_id, current_period_end, cancel_at_period_end")
      .eq("user_id", user.id)
      .eq("environment", environment)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    setSubscription(
      data
        ? {
            status: data.status,
            priceId: data.price_id,
            currentPeriodEnd: data.current_period_end,
            cancelAtPeriodEnd: data.cancel_at_period_end,
          }
        : null,
    );
    setLoading(false);
    return data;
  }, []);

  useEffect(() => {
    void load();
    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    const instance = Math.random().toString(36).slice(2);
    void supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user || cancelled) return;
      channel = supabase
        .channel(`subscriptions:${user.id}:${instance}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "subscriptions", filter: `user_id=eq.${user.id}` },
          () => void load(),
        )
        .subscribe();
    });
    return () => {
      cancelled = true;
      if (channel) void supabase.removeChannel(channel);
    };
  }, [load]);


  const isPlus = subscription
    ? isActive({
        status: subscription.status,
        current_period_end: subscription.currentPeriodEnd,
      })
    : false;

  return { subscription, isPlus, loading, refresh: load };
}

