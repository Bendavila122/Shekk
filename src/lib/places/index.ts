/**
 * Shekk Location Platform — the browser-safe entry point.
 *
 * Mini apps import from `@/lib/places`. Nothing here pulls in a `.server`
 * module, so it is safe from any route, component or test.
 */

export * from "./types";
export * from "./taxonomy";
export * from "./format";
export * from "./usePlaces";
