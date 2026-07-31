import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const coords = {
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
};

export const fitnessMapsStatus = createServerFn({ method: "GET" }).handler(async () => {
  const { mapsConfigured } = await import("@/lib/fitness.server");
  return { configured: mapsConfigured() };
});

export const fitnessNearby = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        ...coords,
        radiusM: z.number().int().min(500).max(50_000).default(5000),
        placeTypes: z.array(z.string().min(1).max(40)).min(1).max(8),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { searchNearby } = await import("@/lib/fitness.server");
    return searchNearby(data);
  });

export const fitnessSearch = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        query: z.string().trim().min(2).max(120),
        lat: coords.lat.optional(),
        lon: coords.lon.optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { searchText } = await import("@/lib/fitness.server");
    return searchText(data);
  });

export const fitnessVenue = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().trim().min(3).max(200) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { placeDetails } = await import("@/lib/fitness.server");
    return placeDetails(data.id);
  });

export const fitnessTravel = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        fromLat: coords.lat,
        fromLon: coords.lon,
        toLat: coords.lat,
        toLon: coords.lon,
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { travelLeg } = await import("@/lib/fitness.server");
    const [walk, transit] = await Promise.all([
      travelLeg({ ...data, mode: "WALK" }),
      travelLeg({ ...data, mode: "TRANSIT" }),
    ]);
    return { walk, transit };
  });
