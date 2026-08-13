# Replace mock mini apps with honest integration roadmaps

Six mini apps currently show invented content — fake restaurant menus, fake bus times, fake listings, hardcoded candle-lighting times — and let people tap through checkout and booking flows that do nothing. That reads as low quality and, worse, as dishonest. Each of those apps becomes a clear, well-designed page explaining what the app will do, which partner or API it depends on, what is still blocking it, and roughly when it lands.

## Apps affected

| App | Depends on | Status line |
| --- | --- | --- |
| Food | Wolt / 10bis / Tenbis merchant APIs | Partner talks not started; needs a merchant agreement per platform |
| Shops | Retail affiliate networks + direct chains (Super-Pharm, Shufersal, Castro) | Needs an affiliate/discount agreement per brand |
| Housing | Student housing feeds + programme accommodation lists; own verified listings | Needs listing supply before it is useful |
| Reserve | Ontopo / Tabit reservation APIs | Needs partner API credentials |
| Transit | Israel Ministry of Transport GTFS + GTFS-Realtime, Rav-Kav Online, Moovit | GTFS ingestion is buildable now; Rav-Kav top-up needs an operator agreement |
| Rides | Gett Business API (booking code already written), Yango | Booking flow exists; awaiting live partner credentials |
| Community | Hebcal (zmanim/parasha — already live elsewhere in Shekk) + a real shul directory | Zmanim can go live quickly; shul directory needs data entry |

## What each page looks like

One consistent layout, shared across all of them, so it reads as a deliberate product decision rather than an empty screen:

- App name, its one-line promise, and a "Not live yet" chip.
- **What it will do** — three or four concrete capabilities in plain English.
- **What it runs on** — the named partners and APIs, each with a short note on what that partner provides.
- **What's blocking it** — honest one-liners (needs a merchant agreement, needs listing supply, awaiting credentials).
- **Where it sits** — rough sequencing relative to the financial platform and programme onboarding, phrased as order of work, not dates.
- A closing line inviting the user to tell us if they want it sooner, linking to Help.

No fake data, no dead buttons, no simulated spending. All mock lists and simulated checkout/booking code for these apps is deleted.

## Explore page

Each of these keeps its tile in its existing group, with a small **Soon** badge on the icon so the grids stay complete and expectations are set before the tap.

## Special cases

- **Community**: zmanim and parasha come from the same live Hebcal source the Jewish Life widget already uses, so the top of the page shows real times for the user's city. Below it, the shul directory is presented as planned with its dependency named. The Siddur link stays live.
- **Rides**: the existing Gett server functions and booking UI are kept in the codebase; the route renders the roadmap page until credentials are live, so nothing needs rebuilding later.

## Technical notes

- New shared component (e.g. `src/components/PlannedApp.tsx`) plus a data file holding one entry per planned app: promise, capabilities, dependencies, blockers, sequencing.
- `src/lib/mini-apps.ts` gains an optional `status: "planned"` field; `MiniAppIcon` renders the Soon badge from it, and Explore reads it rather than hardcoding a list.
- Routes `explore/food`, `explore/shops`, `explore/housing`, `explore/reserve`, `explore/transit`, `explore/rides`, `explore/community` render `PlannedApp`; their mock imports and simulated `spend()` calls are removed. Head metadata on each route is rewritten to describe the planned app honestly.
- Unused entries in `src/lib/mock.ts` (`RESTAURANTS`, `SHOPS`, `HOUSING`, `BUS_LINES`, `SHULS`) are deleted; `ils` and anything still used elsewhere stay.
- Matching service entries in `src/lib/services.ts` move from `status: "live"` so they no longer claim a working integration.
