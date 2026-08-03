## Goal

Store Shekk Strategy v1.0 as persistent project memory so every future decision follows it. No app code changes.

## What gets saved

A new memory file, `mem://strategy/shekk-strategy`, holding the full document: mission, vision, target users (gap-year, MASA, yeshiva/seminary, study abroad, interns, volunteers, researchers, summer programmes, long-term visitors, plus parents and programme organisers), the core problem, the four pillars, business model, distribution, product principles, the five-stage user journey, current priorities and success metrics.

The four pillars, recorded as the home for every future feature:

```text
1 Finance          wallet, Airwallex card, FX, top-ups, history, KYC, membership
2 Israel Setup     programme onboarding, arrival checklist, eSIM, insurance,
                   airport guidance, emergency info, packing
3 Daily Life       guides, maps, events, siddur, news, discounts
4 Programme        welcome, timetable, staff + emergency contacts,
                   announcements, documents, links, arrival info
```

## What gets added to the always-on core rules

Short rules applied to every action from now on:

- Mission: the app every international programme in Israel recommends before participants fly.
- Every feature belongs to one of the four pillars.
- Every feature must save time or save money, remove the need for another app, and tell the user the next action rather than just showing information.
- Finance first; reliable core beats many unfinished features.
- Programme-first test: would this make a programme more likely to recommend Shekk?
- Priority order: finish the financial platform, then programme onboarding, then the eSIM/insurance affiliate marketplace, then daily engagement.
- Revenue focus: FX margin is the primary line, then affiliate, Shekk+, card programme.
- Programme content is entered in the Shekk admin console only — no programme-staff portal or staff login.

Existing memories (tone and vocabulary, money ledger, eligibility) stay as they are; the index gains a reference to the new strategy file.

## Not in this change

No routes, components, navigation, database or content changes. The strategy becomes the standing brief for the next build.
