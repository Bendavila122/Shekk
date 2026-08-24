/**
 * Plan ranking — pure, testable, no catalogue of its own.
 *
 * Ported from the old hard-coded `rankSimOffers` so the wizard behaves the same
 * way, except it now scores normalised database rows and honours the admin's
 * `featured` / `rank_boost` overrides.
 */

import { monthlyNeedGb, type SimAnswers, type SimPlan } from "./sim";

export type ScoredPlan = { plan: SimPlan; score: number; reasons: string[] };

/** Data allowance expressed per 30 days, so plans of different lengths compare. */
function monthlyGb(plan: SimPlan): number {
  if (plan.unlimited) return 999;
  if (plan.dataMb === null) return 0;
  const gb = plan.dataMb / 1024;
  const days = plan.validityDays ?? 30;
  return (gb / days) * 30;
}

function scorePlan(plan: SimPlan, a: SimAnswers): ScoredPlan {
  let score = plan.rankBoost + (plan.featured ? 1 : 0);
  const reasons: string[] = [];

  if (a.days !== null && plan.validityDays) {
    if (plan.validityDays >= a.days) {
      score += 2;
      reasons.push("Covers your whole stay in one purchase");
    } else if (plan.rechargeable) {
      score += 1;
      reasons.push("Recharge each month for as long as you stay");
    } else {
      score -= 2;
    }
    // A 400-day stay on a 14-day non-rechargeable plan is a poor fit; a short
    // trip on a monthly plan is only mildly wasteful.
    if (a.days <= 25 && plan.validityDays > 60) score -= 1;
  }

  if (a.needsCalls !== null) {
    if (a.needsCalls) {
      if (plan.phoneNumberIncluded) {
        score += 4;
        reasons.push("Gives you an Israeli number");
      } else {
        score -= 3;
      }
    } else if (plan.phoneNumberIncluded) {
      // Not wrong, just usually pricier and bought on arrival.
      score -= 1;
    }
  }

  if (a.usage) {
    const need = monthlyNeedGb(a.usage);
    const have = monthlyGb(plan);
    if (have >= need) {
      score += 3;
      if (have > need * 4 && !plan.unlimited) score -= 1;
      reasons.push(plan.unlimited ? "Unlimited, so usage is never a worry" : "Enough data for how you use your phone");
    } else {
      score -= 3;
    }
  }

  if (a.deviceEsimReady === false && plan.phoneNumberIncluded) {
    score += 2;
    reasons.push("Works without eSIM support — it's a physical SIM bought here");
  }

  return { plan, score, reasons };
}

export function rankPlans(plans: SimPlan[], answers: SimAnswers): ScoredPlan[] {
  return plans
    .map((p) => scorePlan(p, answers))
    .sort((x, y) => y.score - x.score || x.plan.displayPriceMinor - y.plan.displayPriceMinor);
}
