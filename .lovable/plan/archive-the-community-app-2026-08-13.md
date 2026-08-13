# Archive the Community app

Community's only working part is Hebcal zmanim, which already appear in the Jewish Life home widget and next to the Siddur. Its other promises (shul directory, cohort and programme schedules) either duplicate the Programme tab or have no data source. So it gets archived rather than reworked: taken out of the product surface, with nothing lost that users can reach today.

## What changes for users

- The Community tile disappears from the Explore page (it sat under "Going out").
- Anyone landing on the old Community link is sent to the Jewish life and news area instead of a dead page.
- Zmanim (candle lighting, Shabbat ends, parasha, Hebrew date) stay exactly where they are: the Jewish Life home widget and the Siddur app. Nothing live is removed.
- One fewer "Soon" placeholder in Explore, so the grid reads as working apps.

## Technical notes

- `src/lib/mini-apps.ts`: remove the `community` entry so it no longer appears in the Explore grid or app search.
- `src/routes/israel.tsx`: drop `"community"` from the "Going out" group ids.
- `src/lib/planned-apps.ts`: remove the `community` roadmap record (its capabilities are either duplicated by Programme or have no feed).
- `src/routes/explore/community.tsx`: replace the page with a redirect to the Jewish life destination, keeping old links and any bookmarks alive rather than 404ing.
- Verify no other reference to `community` remains (grid, search, prefs, widget links) and that the Jewish Life widget and Siddur still render live zmanim.

## Not in scope

- No changes to the Jewish Life widget, Siddur, Events or Tickets behaviour.
- The shul directory idea is dropped for now; if it returns, it belongs inside a Jewish life app, not a separate Community app.
