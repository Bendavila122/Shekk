import { describe, expect, it } from "vitest";
import {
  CHECKIN_RADIUS_KM,
  PASSPORT_CITIES,
  distanceKm,
  nearestCity,
  passportProgress,
  seasonLabel,
  stampDate,
  type PassportState,
} from "./passport";

describe("passport cities", () => {
  it("seeds the curated V1 set with unique ids and real coordinates", () => {
    expect(PASSPORT_CITIES.length).toBeGreaterThanOrEqual(15);
    expect(new Set(PASSPORT_CITIES.map((c) => c.id)).size).toBe(PASSPORT_CITIES.length);
    for (const c of PASSPORT_CITIES) {
      expect(c.lat).toBeGreaterThan(29);
      expect(c.lat).toBeLessThan(34);
      expect(c.lng).toBeGreaterThan(33);
      expect(c.lng).toBeLessThan(36.5);
      expect(c.map.x).toBeGreaterThanOrEqual(0);
      expect(c.map.y).toBeLessThanOrEqual(100);
    }
  });

  it("includes the required flagship cities", () => {
    const names = PASSPORT_CITIES.map((c) => c.name);
    for (const n of ["Jerusalem", "Tel Aviv", "Haifa", "Eilat", "Tiberias", "Caesarea"]) {
      expect(names).toContain(n);
    }
  });
});

describe("passportProgress", () => {
  const state: PassportState = {
    entries: {
      jerusalem: { visited: true, visitedOn: "2026-08-14", photo: "data:image/jpeg;base64,x" },
      "tel-aviv": { visited: true, visitedOn: "2026-08-20" },
      haifa: { visited: false },
    },
  };

  it("counts visited cities and memories only where a photo exists", () => {
    const p = passportProgress(state);
    expect(p.total).toBe(PASSPORT_CITIES.length);
    expect(p.visited).toBe(2);
    expect(p.memories).toBe(1);
    expect(p.percent).toBe(Math.round((2 / PASSPORT_CITIES.length) * 100));
  });

  it("is empty for a fresh book", () => {
    expect(passportProgress({ entries: {} })).toMatchObject({ visited: 0, memories: 0, percent: 0 });
  });
});

describe("dates", () => {
  it("labels a programme season that runs August to July", () => {
    expect(seasonLabel("2026-09-02T00:00:00.000Z")).toBe("2026/27");
    expect(seasonLabel("2026-03-02T00:00:00.000Z")).toBe("2025/26");
  });

  it("formats a stamp date and tolerates junk", () => {
    expect(stampDate("2026-08-14")).toBe("14 Aug 2026");
    expect(stampDate()).toBe("");
    expect(stampDate("not-a-date")).toBe("");
  });
});

describe("check-in geometry", () => {
  it("measures a sane Jerusalem to Tel Aviv distance", () => {
    const jlm = PASSPORT_CITIES.find((c) => c.id === "jerusalem")!;
    const tlv = PASSPORT_CITIES.find((c) => c.id === "tel-aviv")!;
    const km = distanceKm(jlm, tlv);
    expect(km).toBeGreaterThan(45);
    expect(km).toBeLessThan(75);
  });

  it("finds the nearest city and keeps it inside the check-in radius when you are there", () => {
    const jlm = PASSPORT_CITIES.find((c) => c.id === "jerusalem")!;
    const near = nearestCity({ lat: jlm.lat + 0.01, lng: jlm.lng - 0.01 });
    expect(near.city.id).toBe("jerusalem");
    expect(near.km).toBeLessThan(CHECKIN_RADIUS_KM);
  });

  it("does not put a far-away position inside any city radius", () => {
    const near = nearestCity({ lat: 51.5, lng: -0.12 }); // London
    expect(near.km).toBeGreaterThan(CHECKIN_RADIUS_KM);
  });
});
