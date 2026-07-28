ns# Complete the Shekk Siddur

Today the Siddur has the right shell — home screen, categories, reader, favourites, recents, nusach selector, prefs — but only excerpt-level text (Modeh Ani, Mah Tovu, Ashrei opening, Shema, Aleinu, Tefilat HaDerech, brachot, Havdalah, first bracha of bentching), and Sephard / Edot HaMizrach are largely empty. This plan fills the content out so it works as a real davening siddur.

## Where the text comes from

Hand-typing a full siddur is both enormous and error-prone. Instead we pull the Hebrew from **Sefaria's public-domain Siddur texts** (Siddur Ashkenaz, Siddur Sefard, Siddur Edot HaMizrach — all public domain / CC0 on Sefaria), via a one-off generation script that runs at build time on our machine, not in the app.

- A script (`scripts/build-siddur.ts`) fetches each required section per nusach, normalises it into our existing `PrayerSection` / `PrayerLine` shape, and writes `src/lib/siddur-content.generated.ts`.
- The text ships **bundled in the app** — no runtime API calls, works offline, no dependency on Sefaria staying up.
- English: public-domain renderings only (JPS 1917 for verses, and Sefaria's public-domain English where the licence allows). Where no public-domain English exists for a passage, the Hebrew ships alone and bilingual mode simply shows Hebrew — never invented translation.
- Attribution line at the foot of the reader credits Sefaria and the public-domain sources.

If any text turns out not to be cleanly public domain, that section is left out and listed in the existing honest "not yet available" mechanism rather than shipped.

## Content to complete

**Shacharit (weekday)** — Birchot HaShachar, Birchot HaTorah, Korbanot (brief), Pesukei DeZimra (Baruch She'amar, Ashrei in full, Hallelukah psalms 146–150, Yishtabach), Yotzer Or / Birchot Kriat Shema, full Shema (all three parashiyot), Emet V'yatziv, **the weekday Amidah in full (19 brachot)**, Tachanun, Torah reading order (Mon/Thu), Ashrei–Uva LeTzion, Aleinu, Shir shel Yom, Kaddish forms.

**Mincha** — Ashrei, weekday Amidah, Tachanun, Aleinu.

**Maariv** — Barchu, Ma'ariv Aravim, Shema with brachot, Hashkiveinu, weekday Amidah, Aleinu.

**Shema before sleeping** — HaMapil in full, the Shema, the standard psalms and verses, Hareini Mochel.

**Birkat Hamazon** — all four brachot plus the Harachaman section, Al Hanisim / Ya'aleh V'yavo insertions marked as conditional.

**Havdalah** — the opening verses (Hinei Kel Yeshuati) plus the four brachot already present.

**Common brachot** — extend the existing set to the full everyday list (food categories, Shehecheyanu, Asher Yatzar, Birkat HaGomel, Netilat Yadayim, candles, blessings on natural phenomena).

**Tefilat HaDerech** — already complete; add the Sephard/Edot variants.

Each of the three nusachim gets its own text where it differs; where two are identical the generator stores one and points the other at it.

## Reader upgrades needed to carry that much text

- **Contents sheet** becomes a proper jump-to-section index with progress, since Shacharit is now long.
- **Sticky section header** showing where you are as you scroll.
- **Conditional-passage chips** — Ya'aleh V'yavo, Al Hanisim, Tal/Geshem, Aneinu — rendered inline as collapsible blocks labelled by when they're said, rather than silently dropped or silently included.
- **Weekday vs Shabbat/Yom Tov switch** at the top of Shacharit/Mincha/Maariv, defaulting to the correct one for today's date (we already compute Hebrew dates elsewhere in the app).
- **Resume** continues to work — it stores section id, which the longer text makes far more useful.
- **Transliteration toggle** for the short high-use prayers that already have translit (Tefilat HaDerech, brachot, Modeh Ani).

## Scope boundary

This covers weekday davening plus Shabbat variants of the fixed services, bentching, brachot, Havdalah and bedtime Shema. Explicitly **not** in this pass: full Shabbat Musaf and Kabbalat Shabbat, the Yom Tov and Yamim Nora'im machzor, Hallel, Megillot, Selichot, and lifecycle texts. Those stay listed as "not yet available" so nothing looks complete when it isn't.

## Technical details

- New: `scripts/build-siddur.ts` (Node, run manually), `src/lib/siddur-content.generated.ts` (bundled data, ~large but static and tree-shaken per prayer via lazy import).
- `src/lib/siddur.ts` keeps the types, categories and prayer metadata; it imports text from the generated module instead of inlining it.
- `src/lib/siddur-prefs.ts` gains `showTranslit` and `serviceVariant` (weekday/shabbat) preferences.
- `src/routes/siddur/$id.tsx` gains the sticky section header, contents index with progress, conditional-passage blocks and variant switch.
- Because the content module is sizeable, the reader route loads it with a dynamic import so the rest of the app's bundle is unaffected.
