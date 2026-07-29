import { createServerFn } from "@tanstack/react-start";
import { fetchJewish, fetchPlaceName, fetchWeather } from "./live.server";

type Coords = { lat: number; lon: number };

function coords(input: unknown): Coords {
  const d = input as Partial<Coords> | undefined;
  const lat = Number(d?.lat);
  const lon = Number(d?.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
    throw new Error("Valid coordinates required");
  }
  return { lat: Math.round(lat * 10000) / 10000, lon: Math.round(lon * 10000) / 10000 };
}

export const getWeather = createServerFn({ method: "GET" })
  .inputValidator(coords)
  .handler(async ({ data }) => fetchWeather(data.lat, data.lon));

export const getJewishToday = createServerFn({ method: "GET" })
  .inputValidator(coords)
  .handler(async ({ data }) => fetchJewish(data.lat, data.lon));

export const getPlaceName = createServerFn({ method: "GET" })
  .inputValidator(coords)
  .handler(async ({ data }) => fetchPlaceName(data.lat, data.lon));
