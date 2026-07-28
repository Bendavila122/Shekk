## Goal

Build the first Tier 1 native tool: a Siddur that lives inside Shekk, uses the existing design system, and adds no new infrastructure.

## What gets built

**1. Prayer content library** — `src/lib/siddur.ts`

A plain static data file (no database, no API). Shape:

```
Prayer = {
  id, title, hebrewTitle, category, blurb,
  sections: [{ id, heading, hebrewHeading, lines: [{ he, en? }] }]  // per nusach
  nusach: { ashkenaz?: Section[]; sephard?: Section[]; edot?: Section[] }
  source: string   // attribution line
}
```

Categories on the home screen: Shacharit, Mincha, Maariv, Shema before sleeping, Tefilat HaDerech, Birkat Hamazon, Common brachot, Havdalah.

Content policy:
- Hebrew text from public-domain liturgy (traditional wording, unchanged, no invention, no summarising).
- English from public-domain translations only (e.g. Singer 1917 / early-1900s editions), never modern copyrighted translations.
- Full texts for the short, self-contained prayers (Tefilat HaDerech, Shema before sleeping, Havdalah, Birkat Hamazon, common brachot).
- Shacharit/Mincha/Maariv ship as structured services with their core sections included and a clearly-marked contents menu; sections not yet transcribed show the same "not yet available" treatment rather than placeholder text.
- Per-prayer nusach coverage is explicit. Where a nusach version isn't in the data, the reader shows: "This prayer is not yet available in your selected nusach." — never substituted with another nusach.
- Discreet attribution line at the bottom of each prayer.

**2. Local preferences** — `src/lib/siddur-prefs.ts`

Same pattern as the existing `recents.ts` (localStorage + a small hook + custom event), key `shekk.siddur.v1`. Stores: selected nusach, display mode (Hebrew-only / bilingual), text size step, line-spacing comfort, favourites, recently opened, and last reading position per prayer. No new state library, no changes to `store.tsx`.

**3. Routes**

- `src/routes/siddur/index.tsx` — Siddur home: continue reading (last position), favourites, recently opened, search field, then all prayers grouped by category as clean rows. Nusach selector as a compact segmented control in the header. Sparse, not card-heavy.
- `src/routes/siddur/$id.tsx` — reader screen: RTL Hebrew, optional English beneath each line, Hebrew-only / bilingual toggle, A−/A+ text size, line-spacing toggle, favourite button, contents menu (sheet) for multi-section prayers, auto-saved scroll/section position with a "resume" affordance, discreet attribution footer. Minimal chrome, no decorative cards inside the prayer body.

Both use `AppShell`, existing tokens, dark mode, and the desktop sidebar automatically.

**4. Integration**

- `src/lib/services.ts`: point the existing `siddur` service (Jewish life category) at `/siddur`, refresh its blurb.
- `src/lib/search.ts`: add a Siddur page entry plus keywords (siddur, tefillah, davening, prayer, shema, bentching, birkat hamazon, havdalah, tefilat haderech, brachot).
- `src/routes/explore/community.tsx`: add a Siddur entry in the Jewish-life screen (read first, match its existing layout).

## Technical notes

- RTL: prayer body sets `dir="rtl"` locally so it works regardless of the app's global `dir`; English lines render `dir="ltr"`.
- Text size / spacing applied via CSS variables on the reader container, so it never fights the global type scale.
- Hebrew rendering uses the existing font stack with a serif Hebrew fallback for legibility of nikkud.
- Route files follow the existing `createFileRoute("/siddur/")` / `("/siddur/$id")` convention with their own `head()` metadata.

## Out of scope (per brief)

No audio, no AI-generated religious content, no zmanim calculations, no database/analytics/notifications, no Tier 1 catalogue system, no auth/banking/payment changes.

## Deliberately left for later

Full uncut Shacharit/Mincha/Maariv text for all three nusachim, Edot HaMizrach coverage beyond the short prayers, Tikkun, Kabbalat Shabbat, and holiday liturgy — each surfaced honestly through the "not yet available in your selected nusach" message.
