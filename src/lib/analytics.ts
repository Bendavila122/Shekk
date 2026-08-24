/**
 * Shekk analytics — one function, one table.
 *
 * Every commercial or journey-critical interaction calls `track()`. Failures are
 * swallowed on purpose: analytics must never break a user journey, and events
 * are fire-and-forget so no screen waits on them.
 */

import { supabase } from "@/integrations/supabase/client";

export type AnalyticsEvent =
  | "onboarding_started"
  | "onboarding_completed"
  | "setup_task_completed"
  | "setup_checklist_completed"
  | "feature_opened"
  | "category_opened"
  | "guide_opened"
  | "event_viewed"
  | "offer_clicked"
  | "sim_recommendation_started"
  | "sim_recommendation_completed"
  | "sim_provider_selected"
  | "sim_affiliate_clicked"
  | "sim_plan_viewed"
  | "sim_device_check_used"
  | "sim_checkout_started"
  | "sim_order_paid"
  | "sim_fulfilment_failed"
  | "insurance_recommendation_started"
  | "insurance_recommendation_completed"
  | "insurance_provider_selected"
  | "insurance_affiliate_clicked"
  | "money_preview_viewed"
  | "money_early_access_joined";

type Props = Record<string, string | number | boolean | null | undefined>;

function clean(props?: Props) {
  if (!props) return {};
  const out: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(props)) {
    if (v === null || v === undefined) continue;
    out[k] = v;
  }
  return out;
}

export function track(name: AnalyticsEvent, props?: Props) {
  if (typeof window === "undefined") return;
  void (async () => {
    try {
      const { data } = await supabase.auth.getSession();
      await supabase.from("analytics_events").insert({
        name,
        props: clean(props),
        path: window.location.pathname,
        user_id: data.session?.user.id ?? null,
      });
    } catch {
      /* analytics is best-effort */
    }
  })();
}
