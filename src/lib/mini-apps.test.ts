import { describe, expect, it } from "vitest";
import { MINI_APPS, miniApps, searchMiniApps, visibleMiniApps } from "./mini-apps";
import { filterMoneyRecents } from "./recents";

describe("visibleMiniApps", () => {
  it("hides the Exchange mini app while money is paused", () => {
    const ids = visibleMiniApps(false).map((a) => a.id);
    expect(ids).not.toContain("exchange");
    expect(ids).toContain("money-planner");
  });

  it("returns everything once money is enabled", () => {
    expect(visibleMiniApps(true)).toHaveLength(MINI_APPS.length);
    expect(visibleMiniApps(true).map((a) => a.id)).toContain("exchange");
  });
});

describe("miniApps", () => {
  it("hides archived mini apps but keeps them in MINI_APPS", () => {
    expect(miniApps().map((a) => a.id)).not.toContain("been-there");
    expect(MINI_APPS.map((a) => a.id)).toContain("been-there");
  });
});

describe("searchMiniApps", () => {
  it("matches name and tagline only", () => {
    const apps = visibleMiniApps(false);
    expect(searchMiniApps(apps, "siddur").map((a) => a.id)).toContain("siddur");
    expect(searchMiniApps(apps, "Hebrew").map((a) => a.id)).toContain("ulpan");
    expect(searchMiniApps(apps, "")).toEqual([]);
    expect(searchMiniApps(apps, "zzzznope")).toEqual([]);
  });
});

describe("filterMoneyRecents", () => {
  it("removes paused money services without touching the rest", () => {
    expect(filterMoneyRecents(["topup", "siddur", "split", "maps"], false)).toEqual(["siddur", "maps"]);
    expect(filterMoneyRecents(["topup", "siddur"], true)).toEqual(["topup", "siddur"]);
  });
});
