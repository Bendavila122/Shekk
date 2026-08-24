import { describe, expect, it } from "vitest";
import { rankPlans } from "./sim-ranking";
import type { SimPlan } from "./sim";

function plan(over: Partial<SimPlan>): SimPlan {
  return {
    id: over.id ?? "p",
    providerId: "airalo",
    name: "Plan",
    headline: null,
    planType: "data_only",
    dataMb: 10 * 1024,
    unlimited: false,
    validityDays: 30,
    callsIncluded: false,
    textsIncluded: false,
    phoneNumberIncluded: false,
    rechargeable: true,
    operator: null,
    networks: [],
    displayPriceMinor: 1500,
    currency: "GBP",
    displayPriceLabel: null,
    displayPeriodLabel: null,
    source: "manual",
    featured: false,
    rankBoost: 0,
    active: true,
    externalId: null,
    ...over,
  } as SimPlan;
}

describe("rankPlans", () => {
  it("puts an Israeli-number plan first when a number is needed", () => {
    const ranked = rankPlans(
      [plan({ id: "data" }), plan({ id: "number", phoneNumberIncluded: true, planType: "local_number" })],
      { days: 90, needsCalls: true, usage: "normal", deviceEsimReady: true },
    );
    expect(ranked[0]!.plan.id).toBe("number");
  });

  it("prefers a data-only plan when no number is needed", () => {
    const ranked = rankPlans(
      [plan({ id: "number", phoneNumberIncluded: true }), plan({ id: "data" })],
      { days: 30, needsCalls: false, usage: "light", deviceEsimReady: true },
    );
    expect(ranked[0]!.plan.id).toBe("data");
  });

  it("penalises a short non-rechargeable plan for a long stay", () => {
    const ranked = rankPlans(
      [
        plan({ id: "short", validityDays: 14, dataMb: 5 * 1024, rechargeable: false }),
        plan({ id: "long", validityDays: 365, dataMb: 100 * 1024 }),
      ],
      { days: 300, needsCalls: false, usage: "normal", deviceEsimReady: true },
    );
    expect(ranked[0]!.plan.id).toBe("long");
  });

  it("honours admin featured and rank boost as a tie-breaker", () => {
    const ranked = rankPlans([plan({ id: "a" }), plan({ id: "b", featured: true, rankBoost: 3 })], {
      days: null,
      needsCalls: null,
      usage: null,
      deviceEsimReady: null,
    });
    expect(ranked[0]!.plan.id).toBe("b");
  });

  it("breaks equal scores by cheaper indicative price", () => {
    const ranked = rankPlans([plan({ id: "pricey", displayPriceMinor: 4000 }), plan({ id: "cheap", displayPriceMinor: 900 })], {
      days: null,
      needsCalls: null,
      usage: null,
      deviceEsimReady: null,
    });
    expect(ranked[0]!.plan.id).toBe("cheap");
  });
});
