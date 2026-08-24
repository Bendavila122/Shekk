import { describe, expect, it } from "vitest";
import { INDICATIVE_PRICE_NOTE, isIndicative, withActiveProvider, type SimPlan, type SimProvider } from "./sim";

const provider: SimProvider = {
  id: "airalo",
  name: "Airalo",
  blurb: null,
  siteUrl: "https://airalo.com",
  mode: "disabled",
  affiliateReady: false,
  sortOrder: 0,
};

function plan(over: Partial<SimPlan>): SimPlan {
  return {
    id: "p",
    providerId: "airalo",
    provider,
    externalId: null,
    name: "Plan",
    headline: null,
    countryCode: "IL",
    planType: "data_only",
    dataMb: 10240,
    unlimited: false,
    fairUseNote: null,
    validityDays: 30,
    callsIncluded: false,
    textsIncluded: false,
    phoneNumberIncluded: false,
    rechargeable: true,
    activationPolicy: null,
    operator: null,
    networks: [],
    displayPriceMinor: 1500,
    displayPriceLabel: null,
    displayPeriodLabel: null,
    currency: "GBP",
    source: "manual",
    featured: false,
    rankBoost: 0,
    points: [],
    ...over,
  };
}

describe("withActiveProvider", () => {
  it("keeps plans whose provider resolved", () => {
    expect(withActiveProvider([plan({ id: "a" })]).map((p) => p.id)).toEqual(["a"]);
  });

  it("drops plans whose provider is inactive or unreadable", () => {
    const kept = withActiveProvider([plan({ id: "a" }), plan({ id: "b", provider: null })]);
    expect(kept.map((p) => p.id)).toEqual(["a"]);
  });

  it("empties the catalogue when every provider is deactivated", () => {
    expect(withActiveProvider([plan({ id: "a", provider: null }), plan({ id: "b", provider: null })])).toEqual([]);
  });
});

describe("indicative pricing copy", () => {
  it("flags manually curated plans", () => {
    expect(isIndicative(plan({ source: "manual" }))).toBe(true);
    expect(isIndicative(plan({ source: "api" }))).toBe(false);
  });

  it("says placeholder and unverified without implying a Shekk-verified price", () => {
    expect(INDICATIVE_PRICE_NOTE).toMatch(/placeholder/i);
    expect(INDICATIVE_PRICE_NOTE).toMatch(/not verified/i);
  });
});
