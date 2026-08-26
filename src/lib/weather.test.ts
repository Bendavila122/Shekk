import { describe, expect, it } from "vitest";
import { describeMetSymbol, parseMetNo, parseOpenMeteo, WeatherShapeError } from "./weather-parse";
import type { MetNoForecast, OpenMeteoForecast } from "./weather-parse";

const NOW = new Date("2026-08-26T17:30:00.000Z");

const openMeteo: OpenMeteoForecast = {
  current: {
    time: "2026-08-26T20:30",
    temperature_2m: 25.5,
    apparent_temperature: 27.9,
    weather_code: 0,
    is_day: 0,
    relative_humidity_2m: 68,
    wind_speed_10m: 7,
  },
  hourly: {
    time: ["2026-08-26T19:00", "2026-08-26T20:00", "2026-08-26T21:00"],
    precipitation_probability: [0, 12, 4],
    uv_index: [1.2, 0, 0],
  },
  daily: {
    temperature_2m_max: [33.6],
    temperature_2m_min: [21.8],
    precipitation_probability_max: [20],
    uv_index_max: [9.1],
  },
};

describe("parseOpenMeteo", () => {
  it("reads real current conditions and lines hourly values up with the current hour", () => {
    const w = parseOpenMeteo(openMeteo, 35, NOW);
    expect(w).toMatchObject({
      temp: 26,
      feels: 28,
      condition: "Clear night",
      isDay: false,
      rain: 12,
      uv: 0,
      aqi: 35,
      high: 34,
      low: 22,
      humidity: 68,
      wind: 7,
      provider: "open-meteo",
    });
    expect(w.updatedAt).toBe(NOW.toISOString());
  });

  it("falls back to daily figures when the hourly hour is missing", () => {
    const w = parseOpenMeteo(
      { ...openMeteo, hourly: { time: [], precipitation_probability: [], uv_index: [] } },
      null,
      NOW,
    );
    expect(w.rain).toBe(20);
    expect(w.uv).toBe(9);
    expect(w.aqi).toBeNull();
  });

  it("rejects a payload with no usable current reading instead of inventing one", () => {
    expect(() => parseOpenMeteo({ current: null }, null, NOW)).toThrow(WeatherShapeError);
    expect(() => parseOpenMeteo({ current: { temperature_2m: 20 } }, null, NOW)).toThrow(WeatherShapeError);
  });
});

const metNo: MetNoForecast = {
  properties: {
    timeseries: [
      {
        time: "2026-08-26T17:00:00Z",
        data: {
          instant: { details: { air_temperature: 25.2, relative_humidity: 76.9, wind_speed: 3.9 } },
          next_1_hours: { summary: { symbol_code: "clearsky_night" } },
        },
      },
      {
        time: "2026-08-26T20:00:00Z",
        data: { instant: { details: { air_temperature: 22.4 } } },
      },
      {
        time: "2026-08-27T12:00:00Z",
        data: { instant: { details: { air_temperature: 31.5 } } },
      },
    ],
  },
};

describe("parseMetNo (fallback provider)", () => {
  it("normalises the current entry, converting wind to km/h", () => {
    const w = parseMetNo(metNo, null, NOW);
    expect(w).toMatchObject({
      temp: 25,
      feels: 25,
      condition: "Clear night",
      isDay: false,
      wind: 14,
      humidity: 77,
      provider: "met.no",
    });
    expect(w.high).toBe(32);
    expect(w.low).toBe(22);
  });

  it("returns null for figures MET Norway does not publish rather than faking them", () => {
    const w = parseMetNo(metNo, 41, NOW);
    expect(w.uv).toBeNull();
    expect(w.rain).toBeNull();
    expect(w.aqi).toBe(41);
  });

  it("rejects an empty or temperature-less payload", () => {
    expect(() => parseMetNo({}, null, NOW)).toThrow(WeatherShapeError);
    expect(() => parseMetNo({ properties: { timeseries: [{ time: NOW.toISOString() }] } }, null, NOW)).toThrow(
      WeatherShapeError,
    );
  });
});

describe("describeMetSymbol", () => {
  it("maps MET symbols onto the app's shared condition labels", () => {
    expect(describeMetSymbol("clearsky_day", true).label).toBe("Clear");
    expect(describeMetSymbol("partlycloudy_night", false).label).toBe("Partly cloudy");
    expect(describeMetSymbol("heavyrainandthunder", true).label).toBe("Thunderstorms");
    expect(describeMetSymbol("lightrainshowers_day", true).label).toBe("Rain showers");
    expect(describeMetSymbol("rain", true).label).toBe("Light rain");
    expect(describeMetSymbol(undefined, true).label).toBe("Overcast");
  });
});
