import { createServerFn } from "@tanstack/react-start";
import { parseCoords } from "./live-types";
import { fetchJewish, fetchPlaceName, fetchWeather } from "./live.server";

export const getWeather = createServerFn({ method: "GET" })
  .inputValidator(parseCoords)
  .handler(async ({ data }) => fetchWeather(data.lat, data.lon));

export const getJewishToday = createServerFn({ method: "GET" })
  .inputValidator(parseCoords)
  .handler(async ({ data }) => fetchJewish(data.lat, data.lon));

export const getPlaceName = createServerFn({ method: "GET" })
  .inputValidator(parseCoords)
  .handler(async ({ data }) => fetchPlaceName(data.lat, data.lon));
