import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const coords = {
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
};

export const mapsStatus = createServerFn({ method: "GET" }).handler(async () => {
  const { mapsConfigured } = await import("@/lib/maps.server");
  return { configured: mapsConfigured() };
});

export const mapsNearby = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        ...coords,
        radiusM: z.number().int().min(200).max(50_000).default(1500),
        placeTypes: z.array(z.string().min(1).max(40)).min(1).max(8),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { nearby } = await import("@/lib/maps.server");
    return nearby(data);
  });

export const mapsSearch = createServerFn({ method: "POST" })
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
    const { search } = await import("@/lib/maps.server");
    return search(data);
  });

export const mapsPlace = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ id: z.string().trim().min(3).max(200) }).parse(input))
  .handler(async ({ data }) => {
    const { details } = await import("@/lib/maps.server");
    return details(data.id);
  });

export const mapsTravel = createServerFn({ method: "POST" })
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
    const { leg } = await import("@/lib/maps.server");
    const [walk, transit, drive] = await Promise.all([
      leg({ ...data, mode: "WALK" }),
      leg({ ...data, mode: "TRANSIT" }),
      leg({ ...data, mode: "DRIVE" }),
    ]);
    return { walk, transit, drive };
  });
