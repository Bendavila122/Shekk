import { describe, expect, it } from "vitest";
import { changeLine } from "./programme/logic";
import { filterUsableRecents } from "./recents";
import { demoteBrokenWeather } from "./widgets";
import type { Service } from "./services";

describe("changeLine", () => {
  it("says how much later, never raw ISO", () => {
    const line = changeLine({
      field: "starts_at",
      before: "2026-08-27T16:30:00.000Z",
      after: "2026-08-27T17:00:00.000Z",
    } as never);
    expect(line).toContain("Delayed 30 minutes");
    expect(line).not.toMatch(/\d{4}-\d{2}-\d{2}/);
    expect(line).not.toContain("starts_at");
  });

  it("handles earlier moves and plain text values", () => {
    const earlier = changeLine({
      field: "starts_at",
      before: "2026-08-27T18:00:00.000Z",
      after: "2026-08-27T17:00:00.000Z",
    } as never);
    expect(earlier).toContain("Moved earlier 1 hour");

    const place = changeLine({ field: "location_label", before: "Old City", after: "Jaffa Port" } as never);
    expect(place).toBe("Location changed: Old City → Jaffa Port");
  });
});

describe("filterUsableRecents", () => {
  it("drops services that are not live", () => {
    const list = [
      { id: "maps", name: "Maps", emoji: "📍", blurb: "", status: "live" },
      { id: "gett", name: "Gett", emoji: "🚕", blurb: "", status: "integrating" },
    ] as unknown as Service[];
    expect(filterUsableRecents(list).map((s) => s.id)).toEqual(["maps"]);
  });
});

describe("demoteBrokenWeather", () => {
  const defs = [{ id: "today" }, { id: "jewish" }, { id: "news" }] as never[];
  it("moves the weather tile out of the hero slot when broken", () => {
    expect(demoteBrokenWeather(defs, true).map((w) => (w as { id: string }).id)).toEqual([
      "jewish",
      "news",
      "today",
    ]);
  });
  it("leaves order untouched when weather works", () => {
    expect(demoteBrokenWeather(defs, false)).toBe(defs);
  });
});
