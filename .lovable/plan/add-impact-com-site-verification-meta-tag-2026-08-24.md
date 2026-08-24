# Add impact.com site verification meta tag

## Goal
Make every page of Shekk serve the impact.com verification tag so impact.com can confirm domain ownership.

## Change
One edit in `src/routes/__root.tsx`, inside the existing sitewide `head().meta` array (after the viewport entry):

```tsx
{ name: "impact-site-verification", value: "de536f76-ea4e-4828-b5e2-2c4499cedc97" },
```

Impact's snippet uses the non-standard `value` attribute rather than `content`. TanStack Router passes head-tag attributes through as given, so the rendered tag matches their snippet exactly. If verification still fails, the fallback is to add a duplicate entry with `content` set to the same value.

## Verification
- Load the site and confirm the tag is present in the server-rendered HTML (view-source, not just the DOM), since impact.com's crawler reads raw HTML.
- Then run impact.com's verification check.

## Notes
The tag lives at the root so it appears on every route, including the homepage that verification tools usually fetch.
