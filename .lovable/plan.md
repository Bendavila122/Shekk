# Shekk Location Platform — audit and sprint plan

Goal: one shared location/place layer used by every location-dependent mini app, with Fitness as the flagship consumer. No wallet, card, KYC, Airwallex or SIM changes.

## 1. Current-state audit

### Google Maps usage today (all via the Lovable connector gateway)
- `src/lib/maps.server.ts` (181 lines) — Places (New) `searchNearby`, `searchText`, place details, Routes `computeRoutes`, 403 reason handling, price-level mapping, `PlaceRow -> MapsPlace` mapper.
- `src/lib/fitness.server.ts` (194 lines) — a near-verbatim copy of the same gateway helper, field masks, place mapper and travel-leg logic, with gym-specific tweaks.
- `src/lib/maps.functions.ts` and `src/lib/fitness.functions.ts` — duplicated server-fn wrappers (`status`, `nearby`, `search`, `place/venue`, `travel`) with the same Zod coord schema copy-pasted.
- `src/components/GoogleMapCanvas.tsx` — Maps JS loader using `VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY` + tracking-id channel, `google.maps.Marker` pins, singleton loader promise. Currently only consumed by the Maps mini app surfaces.
- `src/lib/maps.ts` (79) and `src/lib/fitness.ts` (272) — two separate place models (`MapsPlace` vs `FitnessVenue`), two category taxonomies, two distance/price label helpers.

### Location / geolocation
- `src/lib/location.ts` (219) — the only geolocation hook: permission states (`idle/denied/unavailable`), city list, manual picker, reverse geocode.
- `src/lib/live.server.ts:407` — reverse geocoding via bigdatacloud (third-party, not Google) used by the live/weather layer.
- `src/components/LocationBar.tsx` — home strip that also writes `homeCity` into settings; `src/components/ForYou.tsx`, `src/lib/useFitness.ts`, `src/routes/explore/fitness.index.tsx`, `src/routes/explore/maps.tsx` each read location independently.
- `src/lib/map-tiles.ts` (98), `src/components/map/IsraelMap.tsx`, `src/lib/israel-map-prefs.ts` — the "Been There" map: raster/ESRI tiles, not Google. Stays as-is.

### Hard-coded / mock place data
- `src/lib/fitness.ts:75-180` — chain knowledge, `dayPassIls`, `monthlyIls`, `minContractMonths`, `facilities`, plus `extrasFor(name, types)` which *guesses* extras by name/type. This is the Shekk-owned metadata that must move behind a proper partner model.
- `src/lib/israel-map-places.ts` (410) — curated Israel pins with history/todo copy. Editorial content, not Google data. Keep, but give it the shared place shape.
- `src/lib/health.ts` — provider catalogue (Maccabi/Clalit/Harel) with no geo at all; `health.server.ts` is only insurance-card storage.
- `src/lib/gett.server.ts` / `gett-fallback.server.ts` — ride estimates with their own `Place` type; a third place model.

### Placeholder (PlannedApp) location-dependent apps
`food`, `shops`, `housing`, `reserve`, `transit`, `rides` in `src/lib/planned-apps.ts`; routes are one-liners rendering `PlannedApp` (e.g. `src/routes/explore/food.tsx`).

### Live location-dependent apps
`maps` (`src/routes/explore/maps.tsx`, `map.index.tsx`, `map.$id.tsx`), `fitness` (`fitness.index.tsx`, `fitness.$id.tsx`), `events` (`events.server.ts` — venue strings, no geo), `israel map`, `health` (no geo yet), `siddur` (no shul geo yet).

### Keys / env
- `VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY`, `VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID` (browser, referrer-restricted).
- `GOOGLE_MAPS_API_KEY` + `LOVABLE_API_KEY` (server, gateway only — never in client code).
- No Google key is hardcoded anywhere. No Supabase table currently stores Google place data (good — nothing to unwind).

### Deep links
- `src/lib/maps.ts:74` `directionsUrl()` prefers `googleMapsUri`; `src/routes/explore/map.$id.tsx:132` builds its own search URL. No Waze links exist yet.

### Main problems
1. Two full copies of the Google integration (maps + fitness) already drifting; a third (gett) with its own place type.
2. No caching, no debouncing, no request dedupe — every filter change re-hits Places.
3. No shared place card / map-list sync / permission-state UI; each route re-implements.
4. Shekk partner metadata is faked by string matching on venue names.
5. Attribution and Google storage terms are not addressed anywhere.

## 2. Map-dependent mini apps, ranked

| # | App | Value | Notes |
|---|---|---|---|
| 1 | Fitness / Gyms | Highest | Already half-built, clear money/time saving, flagship |
| 2 | Maps (general nearby) | High | Becomes the reference consumer of the shared layer |
| 3 | Food / Kosher | High | Nearby + open-now + kosher flag; no delivery partner needed to be useful |
| 4 | Jewish Life — Shuls / Chabad / mikveh | High | Uniquely Shekk; pairs with Siddur + Shabbat times |
| 5 | Health — pharmacies, clinics, kupot, ER | High | Real safety value; joins the existing insurance wallet |
| 6 | Explore — things to do / nightlife / sights | Medium | Ties into Events and Been There |
| 7 | Events | Medium | Needs venue geocoding + travel time only |
| 8 | Housing context | Medium | Neighbourhood context around a listing, not listings themselves |
| 9 | Transport / Moovit-style | Later | Interface compatibility only in this sprint |
| 10 | Rides (Gett) | Later | Reuse the shared place picker for pickup/dropoff |

## 3. Proposed shared structure

```text
src/lib/places/
  types.ts          Place, PlaceRef, PlacePhoto, OpeningHours, TravelLeg,
                    LatLon, PlaceSource ("google" | "shekk" | "editorial"),
                    ShekkVenueMeta, MergedVenue<T>
  taxonomy.ts       one category registry: id, label, icon, googleTypes,
                    keyword, appIds (fitness/food/jewish/health/explore)
  format.ts         distance, km, price level, rating, open-now, hours labels
  google.server.ts  the single gateway client: headers, 403 reasons,
                    field masks, PlaceRow -> Place mapper, photo URL builder
  cache.server.ts   short-TTL in-memory + optional KV-ish cache keyed by
                    (endpoint, rounded latlon, type, radius); TTL by kind
  places.server.ts  nearby / textSearch / details / travelMatrix / geocode
  places.functions.ts  ONE set of server fns: placesStatus, placesNearby,
                    placesSearch, placesDetails, placesTravel
  merge.ts          merge Google Place + Shekk partner meta (pure, testable)
src/lib/usePlaces.ts    query hooks (TanStack Query): keys, debounce, dedupe
src/lib/location.ts     kept, extended: single source of truth for position,
                        permission state, manual city, distance-from-me
src/components/places/
  PlaceMap.tsx      wraps GoogleMapCanvas: markers, active pin, map/list sync
  PlaceCard.tsx     one card: photo, name, rating+count, open-now, distance,
                    travel chip, category emoji, save button
  PlaceList.tsx     virtual-ish list + empty/error/loading/permission states
  PlaceSheet.tsx    detail sheet: photos, hours, phone, website, directions
  PlaceFilters.tsx  radius, open-now, min rating, category chips, sort
  LocationGate.tsx  permission prompt / denied fallback / city picker reuse
  GoogleAttribution.tsx  required "powered by Google" + photo attributions
```

Deleted/absorbed after migration: `maps.server.ts`, `maps.functions.ts`, the gateway half of `fitness.server.ts`, `fitness.functions.ts`; `maps.ts` shrinks to app-specific config; `gett` gets the shared `LatLon`/`PlaceRef`.

Supabase additions (Shekk-owned only):
- `venue_meta` — `google_place_id` (unique), `name_snapshot`, `chain`, `city`, `day_pass_ils`, `monthly_ils`, `min_contract_months`, `facilities[]`, `english_friendly`, `partner_offer`, `verified_at`, `notes`. Public read via `anon` SELECT, writes admin-only.
- `saved_places` — `user_id`, `google_place_id`, `app_id`, `label`, `created_at`. RLS `auth.uid() = user_id`.
- Both get explicit GRANTs in the same migration.

## 4. Data ownership model

```text
Google (transient, never persisted beyond short cache)
  place id, name, address, lat/lon, rating, review count, open-now,
  hours, phone, website, photos, types, travel time/distance
        |
        |  fetched server-side through the connector gateway,
        |  cached in memory 5-15 min (list) / 60 min (details/hours),
        |  travel legs 15 min
        v
   merge.ts  <----  Shekk-owned, persisted (venue_meta, saved_places,
        |           israel-map-places editorial content)
        v
   MergedVenue -> PlaceCard / PlaceSheet (Google fields always labelled
   and attributed; Shekk fields marked "Shekk info", partner offers badged)
```

Rules baked in:
- Only `google_place_id` is persisted long-term (permitted); no snapshotting of ratings, hours, photos or reviews into the database.
- `name_snapshot` is stored solely as an admin-facing label, never rendered as Google data.
- Photos are fetched through the Places photo endpoint at render time with attribution; never re-hosted.
- Every screen showing Google data renders `GoogleAttribution`.
- A "Shekk price" and a "Google rating" are visually distinct, and indicative Shekk figures say so (same honesty rule as the SIM catalogue).

## 5. Google Cloud / connector checklist

Enable now:
- Maps JavaScript API (browser key, referrer-restricted) — already in use.
- Places API (New) — searchNearby, searchText, place details, place photos (server, via gateway).
- Routes API — computeRoutes and computeRouteMatrix for batch travel times.

Enable only if needed:
- Geocoding API — only for Events venue strings and Housing addresses (Phase 4). Text Search covers most cases first.

Do NOT enable yet: Directions/Distance Matrix (legacy, removed from the connector), Address Validation, Aerial View, Solar, Roads, Route Optimization, Places Aggregate.

Key hygiene:
- Server key: application restriction "None" or IP; API restriction to Places (New) + Routes (+ Geocoding if enabled).
- Browser key: referrer-restricted; Maps JS + Places (New) browser surfaces only. Custom domains `shekk.app` / `www.shekk.app` need their own key with both `https://shekk.app/*` and `https://*.shekk.app/*` in the allowlist — the managed key only covers `*.lovable.app`.
- No key ever reaches client code except the browser key.

## 6. Phases and acceptance criteria

### Phase 1 — Platform layer (no user-visible change)
Build `src/lib/places/*`, extend `location.ts`, add `usePlaces.ts`, cache + debounce + dedupe, unit tests for taxonomy, formatters, merge and cache keys.
Accept: one gateway client in the repo; `maps.server.ts`/`fitness.server.ts` gateway code deleted; existing Maps and Fitness routes work unchanged on top of the new layer; typecheck, build and tests clean.

### Phase 2 — Fitness flagship
`venue_meta` + `saved_places` migration (with GRANTs and RLS), admin screen for venue meta, `extrasFor()` name-guessing removed. Rebuild `fitness.index.tsx` and `fitness.$id.tsx` on shared components: map/list sync, filters (radius, open-now, rating, facilities, short-stay, partner-only), photos, hours, phone, website, directions, walk/transit/drive time, save/favourite, day-pass/monthly from `venue_meta` only.
Accept: no invented prices anywhere; every Google-sourced field attributed; filter changes issue at most one debounced request; a disabled/removed venue meta row degrades to Google-only display; permission-denied path still shows a usable city-based list.

### Phase 3 — Reuse across apps
Maps mini app on shared components; Food/Kosher, Jewish Life (shuls/Chabad/mikveh), Health (pharmacy/clinic/ER/kupa) built as thin category configs over the same layer; Explore things-to-do.
Accept: each new app is <150 lines of config + route, zero new Google code.

### Phase 4 — Context and compatibility
Events venue geocoding + travel time from the member's location; Housing neighbourhood context (what's within 10 min walk); Gett pickup/dropoff via the shared place picker; a `TransitStop`/`TransitLeg` interface stub so a Moovit-style app can slot in without touching the layer.
Accept: Events detail shows travel time; Transport stays a `PlannedApp` but its interfaces compile against the shared types.

### Phase 5 — Cost, polish, guardrails
Field-mask minimisation review, cache-hit logging, per-session request caps, monitoring of gateway 4xx, attribution audit across every screen.
Accept: measured request count per finder session documented and under an agreed cap.

## 7. Risks and cost controls

- **Cost blowout.** Places (New) and Routes are metered, and the workspace gateway allows 6,000 requests / 24h. Controls: server-side only, rounded-coordinate cache keys, 300-400 ms debounce, in-flight dedupe, `computeRouteMatrix` batching instead of per-card legs, narrow field masks (list mask stays tiny, detail mask only on open), no autocomplete-per-keystroke, and no unauthenticated public proxy — every server fn is called from app flows only.
- **Policy.** No permanent Google place database, no scraping, attribution everywhere, photos fetched live.
- **Custom domain.** Browser key referrer restrictions will break maps on `shekk.app` until a project-specific key is connected — flagged for you to action.
- **Regression risk.** Deleting two integrations at once; mitigated by Phase 1 being behaviour-preserving with tests before any UI rework.
- **Quality of Shekk data.** Partner prices become admin-entered and dated (`verified_at`), so stale figures are visible rather than silent.

## 8. Recommendation

Implement **Phase 1 + Phase 2 together** as the first sprint: the platform layer is only proven by a real consumer, and Fitness is the flagship you asked for. Phase 3 then lands quickly because each app is config, not code.
